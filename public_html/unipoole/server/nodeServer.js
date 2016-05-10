/**
 * Starts and initializes the node server
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var express = require("express");
var dat = require('./lib/dat');
var fs = require('fs');
var filename = "nodeServer.js";
var app = express();
var server = require('http').createServer(app);
var wrench = require('wrench');
var logger = require('./lib/logger');
var config = require('../data/settings.json');

require("./lib/config")(app);
require("./lib/route")(app);

/**
 * Get port number from batch file and use it to start the Http server
 * 
 * @param {type} param
 */
process.argv.forEach(function(openPort, index) {
    if (index === 3) {
        startHttpServer(openPort);
    }
});

/**
 * Starts the http server, writes the used port to file and start the file exit
 * 
 * @param {int} port
 */
function startHttpServer(port) {
    server.listen(port);
    checkLogFilesLimit();
    checkFileExist(filename, 1000);
    console.log('Server running at http://localhost:' + port);
    console.log('UNIPOOLE Warning : Do not close this window!');
}

/**
 * Closes the node server process when the file is not found. This is used to
 * shutdown node when the memory stick is removed. Function calls itself 
 * recursively until shutdown with set timeout periods. 
 * 
 * @param {String} file name of file to watch
 * @param {int} timeout milliseconds between polling
 */
function checkFileExist(file, timeout) {
    fs.exists(file, function(exists) {
        if (exists) {
            setTimeout(function() {
                checkFileExist(file, timeout);
            }, timeout);
        }
        else {
            logger.log("Device has been removed. Shutting down server", logger.info);
            process.exit(0);
        }
    });
}

/**
 * Check if the maximum number of log files allowed log files is not yet exceeded 
 * 
 */
function checkLogFilesLimit() {
    // read logging settings
    var maximumFiles = config.maxFiles;    
    // array to hold the log files currently created
    var logFiles = [];
    // read the files in the logs directory
    logFiles = wrench.readdirSyncRecursive('logs');

    //delete the first log file created
    if (logFiles.length >= maximumFiles) {
        // number of files to delete equals total files minus number of files to keep
        var filesToDeleteCount = logFiles.length - 2;
        
        for (var count = 1; count <= filesToDeleteCount; count++) {
            var oldestLogFile = logFiles[count];
            // delete oldest log file
            fs.unlink('logs' + '/' + oldestLogFile, function(error) {
                if (error) {
                    logger.log(error, logger.error);
                }
            });
        }
    }
}