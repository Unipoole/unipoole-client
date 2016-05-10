/**
 * Handles the file IO
 *
 * @author OpenCollab
 * @since 1.0.0
 */


var fs = require('fs');
var path = require('path');
var extend = require('extend');
/**
 * Reads a JSON file and return the value for the key
 * 
 * @param {type} fileName
 * @param {type} callback Function to call when the json is read
 * @param {type} key
 * @returns {undefined}
 */
var getFileJSON = function(fileName, callback, key) {
    readFile(fileName, function(rawData) {
        var data = JSON.parse(rawData);
        if (key) {
            data = data['key'];
        }
        callback(data);
    });
};

/**
 * Reads a file and returns the raw data to the callback function
 * 
 * Creates empty json file if it does not exists
 */
var readFile = function(filePath, callback) {
    fs.readFile(filePath, 'utf8', function(error, rawData) {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(filePath + " does not exist");
                fs.writeFileSync(filePath, "{}");
                rawData = "{}";
            }
        }
        callback(rawData);
    });
};


/**
 * Read the unipooleData.json file and return an object representing the file
 */
var getUnipooleData = function(callback) {
    getFileJSON("../../unipoole/data/unipooleData.json", function(jsonObject) {
        callback(jsonObject);
    });
};


/**
 * Gets current data for a tool.
 * For example: yaft.json
 */
var readToolData = function(toolName, callback) {
    getFileJSON(getToolDataFilePath(toolName), function(jsonObject) {
        callback(jsonObject);
    });
};

/**
 * Returns the short name for a tool.
 * @param toolName
 * @returns
 */
function getToolShortName(toolName) {
    return toolName.substring(toolName.indexOf(".") + 1);
}

/**
 * Returns the path to a tool's data file
 * @param toolName
 * @returns {String}
 */
function getToolDataFilePath(toolName) {
    if (toolName === 'client.base') {
        return '../../unipoole/data/unipooleData.json';
    }
    var toolShortName = getToolShortName(toolName);
    return '../../tools/' + toolName + '/data/' + toolShortName + '.json';
}

/**
 * Write an object that represents the new data for a tool, to the tool's data file
 */
var writeToolData = function(toolName, dataObject, callback) {
    writeFile(getToolDataFilePath(toolName),
            JSON.stringify(dataObject, null, 4),
            function(error) {
                callback(error);
            });
};

/**
 * Get the path to the upload file for a tool
 */
var getToolUploadFilePath = function(toolName) {
    var toolShortName = toolName.substring(toolName.indexOf(".") + 1);
    return '../../tools/' + toolName + '/data/' + toolShortName + '.upload.json';
};



/**
 * Gets a handle on a tool's upload data file
 */
var getToolUploadFileStats = function(toolName, callback) {
    fs.stat(getToolUploadFilePath(toolName), function(err, stats) {
        callback(stats);
    });
};

/**
 * Writes a value into a JSON file for specified key
 * 
 * @param {type} fileName
 * @param {type} callBack
 * @param {type} key
 * @param {type} value
 * @returns {undefined}
 */
var writeValueToFileJSON = function(fileName, callBack, key, value) {
    fs.readFile(fileName, 'utf8', function(error, rawData) {
        if (error) {
            callBack(false, error);
            throw error;
        }
        var data = JSON.parse(rawData);
        if (key) {
            data['key'] = value;
        }
        /*
         * TODO Charl: Here is too many callbacks that will fire after one
         * another, code below this comment will fire callback(true) twice
         */
        fs.writeFile(fileName, JSON.stringify(data), function(err) {
            if (err) {
                callBack(false, error);
                throw err;
            }
            callBack(true);
        });
        callBack(true);
    });
};


/**
 * Writes the used port to a file to be read by the batch command
 * 
 * @param {type} port
 * @returns {undefined}
 */
var writePortFile = function(port) {
    fs.writeFile('port.txt', port, function(err) {
        if (err) {
            throw err;
        }
        console.log('Port script saved!');
    });
};

/**
 * Writes a file
 */
var writeFile = function(filepath, content, callback) {
    fs.writeFile(filepath, content, function(err) {
        callback(err);
    });
};

/**
 * Extracts a file and write the contents onto disk
 * 
 * @param {type} zipFile
 * @param {type} extractFolder
 * @returns {undefined}
 * @throws exception
 */
var extractFile = function(zipFile, extractFolder) {
    var fileData = fs.readFileSync(zipFile, 'binary');
    var zip = new require('node-zip')(fileData, {base64: false, checkCRC32: true});
    for (var file in zip.files) {
        if (zip.files[file].options.dir) {
            if (!fs.existsSync(extractFolder + file)) {
                fs.mkdirSync(extractFolder + file);
            }
        } else {
            fs.writeFileSync(extractFolder + file, zip.files[file].data, 'binary');
        }
    }
};

/**
 * Saves a file to disk synchronisely
 * 
 * @param {type} fileName
 * @param {type} content
 */
var storeFile = function(fileName, content) {
    fs.writeFileSync(fileName, content, 'base64', function(err) {
        // TODO : Must handle errors better
        if (err) {
            throw err;
        }
    });
};

/**
 * Deletes a file
 * 
 * Used to delete temp zip files when updating from the server
 * 
 * @param {type} fileName
 * @returns {Boolean}
 */
var deleteFile = function(fileName) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
        return true;
    }
    return false;
};

var mkPathSync = function(p, mode, made) {
    if (mode === undefined) {
        mode = 0777;
    }
    if (!made) {
        made = null;
    }

    if (typeof mode === 'string') {
        mode = parseInt(mode, 8);
    }
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = mkPathSync(path.dirname(p), mode, made);
                mkPathSync(p, mode, made);
                break;

                // In the case of any other error, just see if there's a dir
                // there already.  If so, then hooray!  If not, then something
                // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) {
                    throw err0;
                }
                break;
        }
    }

    return made;
};

/**
 * Merges two files
 * srcFile, this file will be merged to destFile
 * destFile, the file which will now contain the content of srcFile
 * callback, optional callback when the merge is complete
 * options, options for the merge
 *  Available options are:
 *   - deleteSrc : Deletes the source file when merge is done
 *   - returnContent : returns the new contents of the file destFile after the merge
 */
var mergeFiles = function(srcFile, destFile, callback, options) {
    var mergeOptions = options || {};
    // Check if we should call a callback function and/or return the data
    var funcReturn = function() {
        if (callback !== undefined) {
            if (mergeOptions.returnContent) {
                getFileJSON(destFile, function(fileJson) {
                    callback(fileJson);
                });
            } else {
                callback();
            }
        }
    };

    // Merge the 2 json objects
    var funcDoMerge = function(srcJson, destJson, fCallback) {
        mergeObjectsToFile(srcJson, destJson, destFile, function() {
            if (mergeOptions.deleteSrc) {
                deleteFile(srcFile);
            }
            fCallback();
        });
    };

    getFileJSON(srcFile, function(srcJson) {
        getFileJSON(destFile, function(destJson) {
            funcDoMerge(srcJson, destJson, funcReturn);
        });
    });
};

/**
 * Replaces an upload file's pseudo ID with real id returned from
 * unipoole-service
 */
var replaceToolUploadFileIds = function(toolName, idMap, callback) {
    var filename = getToolUploadFilePath(toolName);
    readFile(filename, function(fileData) {
        var keys = Object.keys(idMap);
        for (idx = 0; idx < keys.length; idx++) {
            var oldKey = keys[idx];
            var newKey = idMap[oldKey];
            var regEx = new RegExp(oldKey, 'g');
            // Replace all instances of the old key with the new key
            fileData = fileData.replace(regEx, newKey);
        }
        // Write the new content to the file
        writeFile(filename, fileData, function(error) {
            if (error) {
                // Something happened while trying to write the file
                throw error;
            }
            callback();
        });
    });
};


/**
 * Merges two objects and writes them to an output file
 * {param} srcObject - The source object to be merge to the destObject
 * {param} destObject - The object to which the merge will happen
 * {param} destFile - The file to which the merged objects will be written to
 * {param} callback - callback function when completed
 */
var mergeObjectsToFile = function(srcObject, destObject, destFile, callback) {
    extend(true, destObject, srcObject);
    writeFile(destFile, JSON.stringify(destObject, null, 4), function(err) {
        callback(err);
    });
};

/**
 * Merge a given object to the tool's data file.
 * @param {Object} srcObject The source object to merge to the tool's data
 * @param {string} toolName Name of the tool to merge too.
 * @param {function} callback Function to call when the merge is complete
 */
var mergeObjectToToolData = function(srcObject, toolName, callback) {
    readToolData(toolName, function(toolData) {
        extend(true, toolData, srcObject);
        writeToolData(toolName, toolData, function(error) {
            callback(error);
        });
    });
};

/**
 * Reads a tool's downloaded data file, and returns the data object to the callback
 * 
 */
var readDownloadedToolData = function(sourceFile, callback) {
    try {
        var fileData = fs.readFileSync(sourceFile, 'binary');
        var zip = new require('node-zip')(fileData, {base64: false, checkCRC32: true});
        for (var file in zip.files) {
            if (!zip.files[file].options.dir) {
                var data = JSON.parse(zip.files[file].asText());
                callback(data);
            }
        }
    } catch (error) {
        console.log("Error while reading tool downloade data :" + error);
        callback(null, error);
    }
};

exports.mkPathSync = mkPathSync;
exports.extractFile = extractFile;
exports.writePortFile = writePortFile;
exports.getFileJSON = getFileJSON;
exports.writeValueToFileJSON = writeValueToFileJSON;
exports.storeFile = storeFile;
exports.deleteFile = deleteFile;
exports.getToolUploadFileStats = getToolUploadFileStats;
exports.mergeFiles = mergeFiles;
exports.getUnipooleData = getUnipooleData;
exports.replaceToolUploadFileIds = replaceToolUploadFileIds;
exports.readToolData = readToolData;
exports.writeToolData = writeToolData;
exports.mergeObjectToToolData = mergeObjectToToolData;
exports.readDownloadedToolData = readDownloadedToolData;