/**
 * Sets up the routes for the Express module directing all http requests
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var fs = require('fs');
var sync = require('./sync');
var extend = require('extend');
var properties = require('properties-parser');
var logger = require('./logger');
var dns = require('dns');
var dat = require('./dat');
var config = require("../../data/settings.json");
var ClientRegistrationUtil = require('./ClientRegistrationUtil');

/* 
 * Flag if we need to sync online now
 * Always start with true
 */
var syncOnlineNow = true;
var onlineSyncTimerId;

/**
 * Returns true if we should go online to check
 * the sync status. This method will also restart
 * the timeout
 */
function shouldSyncCheckOnline() {
    // If the timeout is set to zero, always go online
    if (config.syncCheckTimeout <= 0) {
        return true;
    }

    if (syncOnlineNow) {
        if (onlineSyncTimerId) {
            clearTimeout(onlineSyncTimerId);
            onlineSyncTimerId = null;
        }
        onlineSyncTimerId = setTimeout(function() {
            syncOnlineNow = true;
        }, config.syncCheckTimeout * 1000 * 60);
        syncOnlineNow = false;
        return true;
    }
    else {
        return false;
    }
}
;

module.exports = function(app) {

    /**
     *  Merge new data into file
     */
    app.post('/updateFile', function(req, res) {
        fs.readFile("../../" + req.body.file, function(error, rawData) {

            if (error) {
                if (error.code === 'ENOENT') {
                    console.log("../../" + req.body.file);
                    fs.writeFile("../../" + req.body.file, JSON.stringify(req.body.data, null, 4), function(err) {
                        if (err) {
                            handleError(res, error);
                        }
                        console.log("../../" + req.body.file + " created");
                        res.end();
                    });
                } else {
                    handleError(res, error);
                }
                return;
            }

            var fileData = JSON.parse(rawData);
            var data = req.body.data;
            if (!req.body.overwrite) {
                extend(true, fileData, data);
            } else {
                fileData = data;
            }

            fs.writeFile("../../" + req.body.file, JSON.stringify(fileData, null, 4), function(err) {
                if (err) {
                    handleError(res, error);
                }
                res.end();
            });
        });
    });
    
    /**
     *  Creates empty json file if not exists
     */
    app.post('/checkCreateFile', function(req, res) {
        fs.readFile("../../" + req.body.file, function(error) {
            if (error) {
                if (error.code === 'ENOENT') {
                    fs.writeFile("../../" + req.body.file, req.body.data, function(err) {
                        if (err) {
                            handleError(res, error);
                        }
                        console.log("../../" + req.body.file + " created");
                        res.end();
                    });
                } else {
                    handleError(res, error);
                }
                return;
            }
            res.end();
        });
    });

    function handleError(response, errorMessage) {
        logger.log(errorMessage, logger.error);
        var errorReturn = {
            message: errorMessage,
            status: 'EXCEPTION'
        };
        response.send(JSON.stringify(errorReturn));
        response.end();
    }

    /**
     *  Parse properties file and return json
     */
    app.post('/getResourceJson', function(req, res) {
        var resourceName = req.body.resourceName;
        var propertyData = properties.read("../../unipoole/data/" + resourceName + ".properties");
        res.send(JSON.stringify(propertyData));
        res.end();
    });
    /**
     * Write errors to a log file
     */
    app.post('/writeLogFile', function(req, res) {
        logger.log(req.body.errorCode + ' ' + req.body.errorMessage, req.body.severityLevel);
        res.end();
    });
    /**
     * Upload a file
     */
    app.post('/upload', function(req, res) {
        fs.readFile(req.files.uploadfile.path, function(error, data) {

            if (error) {
                handleError(res, error);
            }
            var newPath = "./uploads/" + req.files.uploadfile.name;
            fs.writeFile(newPath, data, function(err) {
                if (err) {
                    handleError(res, error);
                }
                res.redirect("back");
            });
        });
    });
    /**
     * Call the register service
     */
    app.post('/register', function(req, res) {
        fs.readFile("../../unipoole/data/unipooleData.json", function(error, rawData) {
            if (error) {
                handleError(res, error);
            }
            var fileData = JSON.parse(rawData);
            var reqData = {
                deviceId: fileData.deviceId,
                moduleId: fileData.moduleId,
                tools: fileData.toolsLocal,
                password: req.body.password
            };
            sync.callSyncServer('/unipoole-service/service-auth/register/' + req.body.username, 'POST', reqData, res, postRegister);
        });
    });
    
    /**
     * Call the register service
     */
    app.get('/contentMappings/:fromSite/:toSite/:toolName', function(req, res) {
    	var fromSite =  req.params.fromSite;
    	var toSite = req.params.toSite;
    	var toolName = req.params.fromSite;
        sync.callSyncServer('/unipoole-service/service-synch/contentMappings/' + fromSite+ '/'+toSite+'/'+toolName, 'GET', null, res);
    });
    
    /**
     * Called after registration is succesfull, tools can check if they must
     * make master to group site changes1
     */
    function postRegister(registerData, data, response) {
    	ClientRegistrationUtil.intialiseTools(registerData, data, response, function(){
    		 response.send(registerData);
             response.end();
    	});
    }
    
    /**
     * Sync upload
     * This route will do the following:
     *  1. Upload the tool content
     *  2. Replace the generated keys with the proper keys from the upload response
     *  3. Merge the upload file to the tool's data file
     *  4. Delete the upload file
     */
    app.post('/sync/upload/:tool', function(req, res) {
        var toolName = req.params.tool;
        var toolShortName = toolName.substring(toolName.indexOf(".") + 1);
        var toolUploadFilePath = "../../tools/" + toolName + "/data/" + toolShortName + ".upload.json";
        var toolDataFilePath = "../../tools/" + toolName + "/data/" + toolShortName + ".json";
        fs.readFile(toolUploadFilePath, function(error, rawData) {
            if (error) {
                handleError(res, error);
            }
            var fileData = JSON.parse(rawData);
            var reqData = {
                "password": req.body.password,
                "content": fileData
            };
            // Cleanup the upload file if all upload was a success
            var cleanupTool = function(returnData, data, response) {
                var responseObject = JSON.parse(returnData);
                var responseStatus = responseObject.status;
                // Only if success do we merge and delete to upload file
                if (responseStatus == 'SUCCESS') {
                    var keysMap = responseObject.responseContent;
                    dat.replaceToolUploadFileIds(toolName, keysMap, function() {
                        var options = {
                            deleteSrc: true
                        };
                        dat.mergeFiles(toolUploadFilePath, toolDataFilePath, function() {
                            response.send(returnData);
                            response.end();
                        }, options);
                    });
                }
                else {
                    response.send(returnData);
                    response.end();
                }
            };

            dat.getUnipooleData(function(unipooleData) {
                sync.callSyncServer('/unipoole-service/service-synch/content/' + unipooleData.username + '/' + unipooleData.deviceId + '/' + unipooleData.moduleId + '/' + toolName, 'PUT', reqData, res, cleanupTool);
            });

        });
    });
    /**
     * Sync Tool Content from server
     * 
     * Request the update zip file from the service, save to temp space, extract
     * then update version numbers on client and server side
     */
    app.post('/sync/content/:tool', function(req, res) {
        fs.readFile("../../unipoole/data/unipooleData.json", function(error, rawData) {
            if (error) {
                handleError(res, error);
            }
            var reqData = {
                password: req.body.password,
                toolName: req.params.tool
            };
            var fileData = JSON.parse(rawData);
            var contentVersion = fileData.toolsLocal[req.params.tool].clientContentVersion;
            sync.callSyncServer('/unipoole-service/service-synch/contentUpdate/' + fileData.username + '/' + fileData.deviceId + '/' + fileData.moduleId + '/' + req.params.tool + '/' + contentVersion,
                    'POST', reqData, res, sync.updateToolContent);
        });
    });
    /**
     * Sync Tool code from server. This updates the source of the tool. Only client
     * update should need node restart.
     * 
     * Request the update zip file from the service, save to temp space, extract
     * then update version numbers on client and server side
     */
    app.post('/sync/tool/:tool', function(req, res) {
        fs.readFile("../../unipoole/data/unipooleData.json", function(error, rawData) {
            if (error) {
                handleError(res, error);
            }
            var fileData = JSON.parse(rawData);
            var toolData = {toolName: req.params.tool};
            var toolVersion = fileData.toolsLocal[req.params.tool].clientCodeVersion;
            if (config.allowCodeSync) {
                sync.callSyncServer('/unipoole-service/service-synch/toolUpdate/' + fileData.username + '/' + fileData.deviceId + '/' + req.params.tool + '/' + toolVersion, 'GET', toolData, res, sync.updateToolCode);
            } else {
                res.send(JSON.stringify({status: 'SUCCESS', errorCode: "", message: "Disabled to avoid a repeat of the schedule tool incedent"}));
                res.end();
            }            
        });
    });
    /**
     * Authenticate
     */
    app.post('/authenticate', function(req, res) {
        var reqData = {
            password: req.body.password
        };
        sync.callSyncServer('/unipoole-service/service-auth/login/' + req.body.username, 'POST', reqData, res);
    });
    /**
     * Check the versions of content and code. Also upload events when this is called
     */
    app.post('/syncstatus', function(req, res) {
        var toolArray = Object.keys(req.body.tools);
        var statusData = {status: 'SUCCESS', errorCode: "", message: ""};

        // Function to send back the response to the client
        function sendResponse() {
            res.send(JSON.stringify(statusData));
            res.end();
        }

        // Function to go online and check the status
        function onlineStatusResponse(returnData, data, response) {
            var onlineStatusData = JSON.parse(returnData);
            statusData.tools = statusData.tools || {};
            extend(true, statusData, onlineStatusData);
            sendResponse();
        }

        // Check local status
        sync.checkToolUploadStatus(toolArray, function(toolData) {
            statusData.toolsLocal = toolData;
            if (shouldSyncCheckOnline()) {
                var reqData = {
                    deviceId: req.body.deviceId,
                    tools: req.body.tools
                };
                sync.callSyncServer('/unipoole-service/service-synch/synchStatus/' + req.body.username + '/' + req.body.moduleId, 'POST', reqData, res, onlineStatusResponse);
            }
            else {
                sendResponse();
            }
        });
    });

    /**
     * 
     */
    app.post('/uploadEvents', function(req, res) {
        // Call service
        fs.readFile("../../unipoole/data/events.json", function(error, data) {
            try {
                var parsedData = JSON.parse(data);
                sync.callSyncServer('/unipoole-service/service-event/event/' + req.body.username + '/' + req.body.deviceId + '/' + req.body.moduleId,
                        'POST', parsedData, res, function() {
                            // Clear file
                            fs.writeFile("../../unipoole/data/events.json", JSON.stringify({events: []}), function() {
                            });
                        });
            } catch (e) {
                fs.writeFile("../../unipoole/data/events.json", JSON.stringify({events: []}), function() {
                });
            }
        });
    });
    /**
     * Checks is internet is available
     */
    app.get('/checkOnline', function(req, res) {
        dnsResolve(config.dns_check_online, 1500, function(error) {
            var on = !error;
            res.send(JSON.stringify({internet_status: on}));
            res.end();
        });
    });
    /**
     * Does a dns lookup and returns an error if the timeout is reached
     * 
     * @param {String} domain domain to test
     * @param {int} timeout timeout override
     * @param {function} callback
     */
    function dnsResolve(domain, timeout, callback) {
        var callbackCalled = false;
        var doCallback = function(err, domain) {
            if (callbackCalled) {
                return;
            }
            callbackCalled = true;
            callback(err, domain);
        };
        setTimeout(function() {
            doCallback(new Error("Timeout exceeded"), null);
        }, timeout);
        dns.resolve(domain, doCallback);
    }
    ;
    app.post('/', function(req, res) {
        var temp_path = req.files.uploadfile.path;
        var save_path = './public/images/' + req.files.uploadfile.name;
        fs.rename(temp_path, save_path, function(error) {
            if (error) {
                handleError(res, error);
            }

            fs.unlink(temp_path, function() {
                if (error) {
                    handleError(res, error);
                }
                res.send("File uploaded to: " + save_path);
            });
        });
    });
};



