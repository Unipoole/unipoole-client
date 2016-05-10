/**
 * Handles calls to the Unipoole engine and synchorniztion code
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var http = require('http');
var https = require('https');
var dat = require('./dat');
var fs = require('fs');
var config = require("../../data/settings.json");
var extend = require('extend');
var yaftUtil = require('./YaftUtil');

var protocol = (config.sync_port == '443' ? https : http);

/**
 * This options should be set from a properties file - maven profile
 */


/**
 * Calls the Unipoole Engine services
 * 
 * @param {String} path
 * @param {String} methodType 'POST', 'GET', 'PUT'
 * @param {Object} data to be passed in POST and the callback
 * @param {HTTPResponse} response
 * @param {function} callBack - takes 2 args, data and the response object
 */
var callSyncServer = function(path, methodType, data, response, callBack) {
    var reqData;
    if (methodType === 'POST' || methodType === 'PUT') {
        reqData = JSON.stringify(data);
    }
    var options = {
        hostname: config.sync_server,
        port: config.sync_port,
        method: methodType,
        path: path
    };
    var req = protocol.request(options, function(res) {
        var returnData = "";
        res.setEncoding('utf8');

        // Receive data chunks from request
        res.on('data', function(chunk) {
            returnData += chunk;
        });
        // All chunks received now you can use the data
        res.on('end', function() {
            // close file if data written to file.
            if (!checkError(returnData, response)) {
                if (callBack) {
                    try {
                        callBack(returnData, data, response);
                    } catch (e) {
                        console.log(e + " : " + e.stack);
                        var errorResponse = {status: 'ERROR', errorCode: "1000", message: "Could not sync tool"};
                        response.send(JSON.stringify(errorResponse));
                        response.end();
                    }
                } else if (response) {
                    response.send(returnData);
                    response.end();
                }
            } else {
                return;
            }
        });
    });

    requestObjectWork(req, response, methodType, reqData, options);
};

/**
 * Download files
 * 
 * @param {type} path
 * @param {type} methodType
 * @param {type} data
 * @param {type} response
 * @param {type} callBack
 * @param {type} fileName
 */
function downloadFile(path, methodType, data, response, callBack, fileName) {
    var reqData;
    if (methodType === 'POST') {
        reqData = JSON.stringify(data);
    }
    var options = {
        hostname: config.sync_server,
        port: config.sync_port,
        method: methodType,
        path: path
    };
    // Create folders and file
    if (fileName.lastIndexOf('/') > -1) {
        var folders = fileName.substring(0, fileName.lastIndexOf('/'));
        dat.mkPathSync(folders);
    }
    var downloadfile = fs.createWriteStream(fileName);
    downloadfile.on('error', function(err) {
        console.log('ERROR IN FILE WRITE : ' + err);
        if (callBack) {
            try {
                callBack(fileName, data, response);
            } catch (e) {
                var errorResponse = {status: 'ERROR', errorCode: "1000", message: "Could not sync tool"};
                response.send(JSON.stringify(errorResponse));
                response.end();
            }
        }
    });
    downloadfile.on('open', function() {
        var req = protocol.request(options, function(res) {
            // Receive data chunks from request
            res.on('data', function(chunk) {
                downloadfile.write(chunk);
            });
            // All chunks received now you can use the data
            res.on('end', function() {
                // close file if data written to file.
                downloadfile.end();

                if (callBack) {
                    try {
                        callBack(fileName, data, response);
                    } catch (e) {
                        var errorResponse = {status: 'ERROR', errorCode: "1000", message: "Could not sync tool"};
                        response.send(JSON.stringify(errorResponse));
                        response.end();
                    }
                }
            });

        });
        requestObjectWork(req, response, methodType, reqData, options);
    });

}

/**
 * Adds timeout, error handling and sets POST data on the request object
 * 
 * @param {type} req
 * @param {type} response
 * @param {type} methodType
 * @param {type} reqData
 * @param {type} options 
 */
function requestObjectWork(req, response, methodType, reqData, options) {
    // Set timeout and send error message to client on timeout
    req.on('socket', function(socket) {
        socket.setTimeout(config.http_request_timeout);
        socket.on('timeout', function() {
            // TODO send error message+
            if (response) {
                var errorResponse = {status: 'ERROR', errorCode: "4998", message: "Timeout",
                    instruction: "Please check that you have full Internet connectivity from this network"};
                response.send(JSON.stringify(errorResponse));
                response.end();
            }
        });
    });

    // Send any error back to client in readable format
    req.on('error', function(e) {
        if (response) {
            console.log(e);
            var errorResponse = {status: 'ERROR', errorCode: "4999", message: "Could not connect to " + options.hostname + ':' + options.port + " \n" + e,
                instruction: "Please check that you have full Internet connectivity from this network"};
            response.send(JSON.stringify(errorResponse));
            response.end();
        }
    });

    // Send the data if this is a Post call
    if (methodType === 'POST' || methodType === 'PUT') {
        req.write(reqData);
    }

    req.end();
}

/**
 * Checks is the return object is valid JSON and if the status is not ERROR
 * or EXCEPTION. Returns the return object if its not valid and returns true
 * 
 * @param {String} chunk
 * @param {type} response
 * @returns {Boolean}
 */
function checkError(chunk, response) {
    try {
        var returnObject = JSON.parse(chunk);
    } catch (e) {
        if (response) {
            response.send(chunk);
        }
        return true;
    }
    if (returnObject.status === 'EXCEPTION' || returnObject.status === 'ERROR') {
        if (response) {
            response.send(chunk);
        }
        return true;
    }
    return false;
}

/**
 * Updates the tool code by saving zip, extracting to tool folder, deleting
 * zip and then updating the verion number on the client and server
 * 
 * @param {Object} responseString - the return from the server
 * @param {Object} data - extra data 
 * @param {HTTPResponse} response - http response from original client call
 */
var updateToolContent = function(responseString, data, response) {
    updateCode(responseString, data, true, response, '', 'clientContentVersion', '/unipoole-service/service-synch/contentVersion/');
};

/**
 * Updates the tool code by saving zip, extracting to tool folder, deleting
 * zip and then updating the verion number on the client and server
 * 
 * @param {Object} responseString - the return from the server
 * @param {Object} data - extra data 
 * @param {HTTPResponse} response - http response from original client call
 */
var updateToolCode = function(responseString, data, response) {
    updateCode(responseString, data, false, response, '', 'clientCodeVersion', '/unipoole-service/service-synch/codeVersion/');
};

/**
 * Updates the tool code/content by saving zip, extracting to tool folder, deleting
 * zip and then updating the verion number on the client and server
 * 
 * @param {Object} responseString - the return from the server
 * @param {Object} data - extra data 
 * @param {boolean} merge indicate if the onctent must be merged into existing file
 * @param {HTTPResponse} response - http response from original client call
 * @param {String} targetFolder the folder where the final extraction takes place to
 * @param {String} versionProperty the name of the property to update on the tool data client side
 * @param {String} versionService service to call to update version on server
 */
var updateCode = function(responseString, data, merge, response, targetFolder, versionProperty, versionService) {
    try {
        var dataObject = JSON.parse(responseString);
    } catch (exception) {
        response.send(responseString);
        response.end();
        return;
    }
    if (!dataObject.content) {
        dataObject.status = 'ERROR';
        response.send(dataObject.toString());
        response.end();
        return;
    }
    
    /*
     * Function to check and handle errors.
     * Returns true if it is okay to continue
     */
    var funcHandleError = function(error){
        if (error){
            var errorResponse = {status: 'ERROR', errorCode: "1000", message: "Could not sync tool"};
             response.send(JSON.stringify(errorResponse));
             response.end();
            return false;
        }
        return true;
    };
    
    /*
     * Function to finish off the update of code.
     * This function will update the version, and send
     * a response if the tool was not the client base tool.
     */
    var funcFinishUpdate = function(closeResponse){
        if (closeResponse || toolName == 'client.base') {
            response.send(JSON.stringify(dataObject));
            response.end();
        }
        updateVersion(data.toolName, dataObject.version, versionProperty, versionService);
    };

    var toolName = data.toolName;
    var path = '', fileName = '';
    if (toolName === 'client.base') {
        path = "../../unipoole/";
        fileName = "unipooleData";
    } else {
        path = "../../tools/" + toolName + "/";
        fileName = toolName.substring(toolName.indexOf('.') + 1);
    }
    path += targetFolder;
    dat.mkPathSync("../temp/");
    dat.storeFile("../temp/" + dataObject.contentName, dataObject.content);
    delete dataObject.content; // Content zip has been saved to a file
    if (!merge) {
        if (toolName === 'client.base') {
            path = "../../";
        }
        dat.extractFile("../temp/" + dataObject.contentName, path);
        dat.deleteFile("../temp/" + dataObject.contentName); // We are done with this temp file now
        funcFinishUpdate(true);
    } else {
        dat.readDownloadedToolData("../temp/" + dataObject.contentName, function(newData, error){
            dat.deleteFile("../temp/" + dataObject.contentName); // We are done with this temp file now
            if (funcHandleError(error)){
                // First delete the removed content to avoid downloading attachments for it
                deleteRemovedContent(toolName, newData, function(){
                    // Merge the newly downloaded content to the tool's data
                    dat.mergeObjectToToolData(newData, toolName, function(error){
                        if (funcHandleError(error)){
                            if (toolName !== 'client.base') {
                                // Now download attachments
                                downloadFiles(toolName, path, response, dataObject, newData); // This method is sync?                                
                            }
                            funcFinishUpdate();
                        }
                    });
                });
            }
        });
    }
};

/**
 * Deleted the content entries which has been removed from sakai
 * @param toolname
 */
function deleteRemovedContent(toolName, newData, callback){
    switch (toolName) {
    case "sakai.yaft" :
        yaftUtil.deleteRemovedContent(newData, callback);
        break;
    default :
        callback();
        break;
    }
}

/**
 * Checks if the specific tool needs to download files and then get the list of 
 * files by calling the tool appropriate function
 * 
 * @param {type} toolName
 * @param {type} filePath
 * @param {type} response
 * @param {type} dataObject
 * @param {Json} contentData - the new content that has been added
 */
function downloadFiles(toolName, filePath, response, dataObject, contentData) {
    var files = [];
    switch (toolName) {
        case "sakai.announcements" :
            files = getAttachments(contentData);
            break;
        case "sakai.yaft" :
            files = yaftUtil.getAttachmentFiles(contentData);
            break;
        case "sakai.schedule" :
            files = getAttachments(contentData);
            break;
        case "unisa.welcome" :
            files = getAttachmentsWelcome(contentData);
            break;
        case "sakai.resources" :
            files = getResourcesFiles(contentData);
            break;
        case "sakai.melete" :
            files = getMeleteFiles(contentData);
            break;
        default :
            break;
    }
    getFilesFromServer(files, filePath, response, dataObject);
}

/**
 * Gets a list of all announcement files for Welcome to download
 * 
 * @param {type} contentData
 * @returns {Array}
 */
function getAttachmentsWelcome(contentData) {
    var filesToDownload = [];
    var attachArray = contentData.attachments;
    if (attachArray) {
        for (var i = 0; i < attachArray.length; i++) {
            var downloadDetail = {};
            downloadDetail.downloadKey = attachArray[i].downloadKey;
            downloadDetail.file = attachArray[i].downloadPath;
            filesToDownload.push(downloadDetail);
        }
    }
    return filesToDownload;
}

/**
 * Gets a list of all announcement files to download
 * 
 * @param {type} contentData
 * @returns {Array}
 */
function getAttachments(contentData) {
    var filesToDownload = [];
    for (var key in contentData) {
        var attachArray = contentData[key].attachments;
        if (attachArray) {
            for (var i = 0; i < attachArray.length; i++) {
                var downloadDetail = {};
                downloadDetail.downloadKey = attachArray[i].downloadKey;
                downloadDetail.file = attachArray[i].downloadPath;
                filesToDownload.push(downloadDetail);
            }
        }
    }
    return filesToDownload;
}

/**
 * Gets a list of all the resource files to download
 * 
 * @param {type} contentData
 * @returns {Array}
 */
function getResourcesFiles(contentData) {
    var filesToDownload = [];
    for (var key in contentData) {
        var downloadDetail = {};
        downloadDetail.downloadKey = contentData[key].downloadKey;
        contentData[key].treeId = contentData[key].treeId.replace(/[|&:;$%@"<>()+,]/g, "_");
        downloadDetail.file = contentData[key].treeId;
        filesToDownload.push(downloadDetail);
    }
    return filesToDownload;
}

/**
 * Gets a list of all the melete files to download
 * 
 * @param {type} contentData
 * @returns {Array}
 */
function getMeleteFiles(contentData) {
    var filesToDownload = [];
    for (var key in contentData) {
        var downloadDetail = {};
        if (contentData[key].upload) {
            downloadDetail.downloadKey = contentData[key].upload.downloadKey;
            downloadDetail.file = contentData[key].upload.treeId;
            filesToDownload.push(downloadDetail);
        }
    }
    return filesToDownload;
}

/**
 * Downloads the list of files  
 * 
 * @param {type} filesToDownload
 * @param {type} basePath
 * @param {type} response
 * @param {type} dataObject
 */
function getFilesFromServer(filesToDownload, basePath, response, dataObject) {
    if (filesToDownload.length) {
        var downloadDetail = filesToDownload[0];
        filesToDownload.splice(0, 1);
        if (downloadDetail.downloadKey) {
            downloadFile('/unipoole-service/service-creator/download/file/' + downloadDetail.downloadKey,
                    'GET', undefined, null,
                    function() {
                        getFilesFromServer(filesToDownload, basePath, response, dataObject);
                    }
            , basePath + 'data/' + downloadDetail.file);
        } else {
            getFilesFromServer(filesToDownload, basePath, response, dataObject);
        }
    } else {
        response.send(JSON.stringify(dataObject));
        response.end();
    }
}

/**
 * Updates the tool version on the client and the server
 * 
 * @param {String} toolName
 * @param {String} version
 * @param {String} versionProperty name of the property to update on the client
 * @param {String} service service to call to update version on server
 */
var updateVersion = function(toolName, version, versionProperty, service, response) {
    // Update unipooleData file
    var username, deviceId;
    var rawData = fs.readFileSync("../data/unipooleData.json");
    var fileData = JSON.parse(rawData);
    fileData.toolsLocal[toolName][versionProperty] = version;
    username = fileData.username;
    deviceId = fileData.deviceId;
    var moduleId = fileData.moduleId;
    fs.writeFileSync("../data/unipooleData.json", JSON.stringify(fileData, null, 4));

    // call service to confirm update
    // We do not care if this fails - only for stats and should be fixed with the next update on the tool
//    callSyncServer(service + username + '/' + deviceId + '/' + moduleId + '/' + toolName + '/' + version, 'PUT', {}, response);
};

/**
 * Checks the upload status of a tool
 */
var checkToolUploadStatus = function(tools, callback){
    var toolsStatus = {};
    var idx = 0;
    
    function next(){
        if(idx < tools.length){
            dat.getToolUploadFileStats(tools[idx], function(fileStats){
                if (fileStats !== undefined && fileStats.size > 0){
                    toolsStatus[tools[idx]] = {};
                    toolsStatus[tools[idx]].localChange = true;
                    toolsStatus[tools[idx]].localChangeSize = fileStats.size;
                }
                else{
                    toolsStatus[tools[idx]] = {};
                    toolsStatus[tools[idx]].localChange = false;
                    toolsStatus[tools[idx]].localChangeSize = 0;
                }
                idx++;
                next();
            });
            
        }
        else{
            callback(toolsStatus);
        }
    }
    
    next();// Start the looping
};

exports.callSyncServer = callSyncServer;
exports.updateToolCode = updateToolCode;
exports.updateToolContent = updateToolContent;
exports.checkToolUploadStatus = checkToolUploadStatus;