/**
 * Functions used for error handling
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, unipooleInit) {

    /**
     * Constructor
     */
    function UnipooleMessage() {
    }

    var unipooleMessage = new UnipooleMessage();
    /**
     * Calls the setup functions on document ready
     */
    jQuery(document).ready(function() {
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/wait.html');
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/message.html');
        setupMessageDialog();
        setupWaitDialog();
    });


    /**
     * Sets up the message display dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    function setupMessageDialog() {
        jQuery('#uniMessageDialog').dialog({
            autoOpen: false,
            resize: "auto",
            width: 450,
            modal: true,
            closeOnEscape: false,
            open: function() {
                // Hide the title bar
                jQuery('#uniMessageDialog').parent().find(".ui-dialog-titlebar").hide();
            },
            position: ['middle', 45],
            buttons: {
                "OK": function() {
                    jQuery('#uniMessageDialog').dialog("close");
                }

            },
            close: function() {
                jQuery('#uniMessageDialog').dialog("close");
            }
        });
    }

    /**
     * Sets up the wait dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    function setupWaitDialog() {
        jQuery('#uniWaitDialog').dialog({
            autoOpen: false,
            resize: "auto",
            width: 400,
            modal: true,
            closeOnEscape: false,
            open: function() {
                // Hide titlebar and close button
                jQuery('#uniWaitDialog').parent().find(".ui-dialog-titlebar").hide();
                jQuery('#uniWaitDialog').parent().find(".ui-dialog-titlebar-close").hide();
            },
            position: ['middle', 45]
        });
    }

    /**
     * Opens a wait dialog 
     * 
     * @param {String} message
     */
    UnipooleMessage.prototype.displayWait = function(message) {
        jQuery('#uniWaitMessage').html(message);
        jQuery('#uniWaitDialog').dialog("open");
    };

    /**
     * Closes wait dialog 
     */
    UnipooleMessage.prototype.closeWait = function() {
        jQuery('#uniWaitDialog').dialog("close");
    };

    /**
     * Reads error details from error code list using the error code and displays 
     * the relevant error details
     * 
     * <p>
     * This is used for local errors that we store the error codes for. Errors that
     * is returned from the Unipoole Sakai Engine must return the message, 
     * description and instructions
     * <p>
     * 
     * @param {String} code
     */
    UnipooleMessage.prototype.handleLocalException = function(code) {
        jQuery.getJSON('unipoole/data/errorMessages.json', function(data) {
            var error = data[code];
            unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, error.errorDescription, error.errorMessage, code);
            unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, error.errorMessage, error.errorDescription, error.errorInstruction);
        });
    };

    /**
     * Displays an error dialog if the server return has a status of ERROR or
     * EXCEPTION. The local message will describe were in the process the error
     * occured and the server message will be displayed as the detail
     * 
     * The server must still be updated to include an instruction in the return
     * 
     * @param {type} localMessage
     * @param {type} serverMessage
     */
    UnipooleMessage.prototype.checkServerError = function(localMessage, serverMessage) {
        if (serverMessage.status === 'EXCEPTION' || serverMessage.status === 'ERROR') {
            if (serverMessage.errorCode === 1013 || serverMessage.errorCode === 1011) {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, 'Your registration is invalid, please register device again.', undefined, undefined, unipooleInit.openRegistrationDialog);
                return true;
            } else {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, localMessage, serverMessage.errorCode + ' : ' + serverMessage.message, serverMessage.instruction);
                return true;
            }
        }
        return false;
    };

    /**
     * Opens a message dialog 
     * 
     * @param {String} type
     * @param {String} message
     * @param {String} description
     * @param {String} instruction
     * @param {function} okCallback
     */
    UnipooleMessage.prototype.displayMessage = function(type, message, description, instruction, okCallback) {
        jQuery('#uniMessageMessage').html(message);
        jQuery('#uniMessageMessage').attr('class', type);
        if (description) {
            jQuery('#uniMessageDescription').html(description);
            jQuery('#messageBreak1').show();
        } else {
            jQuery('#messageBreak1').hide();
        }
        if (instruction) {
            jQuery('#uniMessageInstruction').show();
            jQuery('#messageBreak1').show();
            jQuery('#uniMessageInstruction').addClass('instruction');
            jQuery('#uniMessageInstruction').html(instruction);
        } else {
            jQuery('#uniMessageInstruction').hide();
            jQuery('#messageBreak1').hide();
        }
        jQuery('#uniMessageDialog').dialog("open");
        if (okCallback) {
            jQuery('#uniMessageDialog').next().find(":button").click(okCallback);
        } else {
            jQuery('#uniMessageDialog').next().find(":button").unbind('click');
            jQuery('#uniMessageDialog').next().find(":button").click(function() {
                jQuery('#uniMessageDialog').dialog("close");
            });
        }
    };

    /**
     * Send POST request to the server to log error
     * 
     * @param {String} errorDescription
     * @param {String} errorMessage
     * @param {int} errorCode
     * @param {String} severity
     * @returns {undefined}
     */

    UnipooleMessage.prototype.writeLogFile = function(severity, errorDescription, errorMessage, errorCode) {
        var errorDetails = {
            "errorCode": errorCode,
            "errorMessage": errorMessage,
            "errorDescription": errorDescription,
            "severityLevel": severity
        };
        jQuery.ajax({
            url: "writeLogFile",
            data: JSON.stringify(errorDetails, null, 4),
            contentType: 'application/json',
            type: "POST"
        }).success(function() {
            console.log('Success');
        });
    };


    /**
     * Displays the tool versions
     */
    UnipooleMessage.prototype.showUnipooleAbout = function() {
        unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.INFO, "About Unipoole", formatAbout(UNIPOOLE_GLOBAL.unipooleData.toolsLocal));
    };

    /**
     * Builds a string to display in the about dialog
     * 
     * @param {type} data
     * @returns {String}
     */
    function formatAbout(data) {
        var aboutString = "";
        for (var key in data) {
            aboutString += "<p><b>" + key + " </b>(content: " + data[key].clientContentVersion + " ; code: " + data[key].clientCodeVersion + ")</p>";
        }
        return aboutString;
    }

    window.unipooleMessage = unipooleMessage;

})(window.unipooleUtils, window.unipooleInit);