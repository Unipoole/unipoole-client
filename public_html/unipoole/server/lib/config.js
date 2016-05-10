/**
 * Sets up the Express module for the node server
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var express = require("express");

module.exports = function(app) {

    app.use(express.static("../../"));
    // change the temp upload directory
    app.use(express.bodyParser({uploadDir: './uploads/'}));

    app.configure('development', function() {
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });
    app.configure('production', function() {
        app.use(express.errorHandler());        
    });

};