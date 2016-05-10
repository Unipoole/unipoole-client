/**
 * Handles logging
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var winston = require('winston');
var config = require("../../data/settings.json");

var log = function(errorMessage, level) {
    if (isLoggingOn(level)) {

        var logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    filename: config.filePath,
                    maxsize: config.maxSize,
                    timestamp: true,
                    json: false
                })]
        });

        if (config.logToConsole) {
            logger.add(winston.transports.Console, {timestamp: true});
        }
        logger.log(level, errorMessage);
    }
};

/**
 * Read the setting files to determine if this level must be logged
 * 
 * @param {String} level
 */
function isLoggingOn(level) {
    if (config.devMode) {
        return (config.developmentLevels.indexOf(level) > -1);
    } else {
        return (config.productionLevels.indexOf(level) > -1);

    }
}

exports.log = log;
exports.error = "error";
exports.info = "info";
exports.warn = "warn";
exports.debug = "debug";
