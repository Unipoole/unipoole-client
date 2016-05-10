/**
 * Initializes the launch html page for the Unipoole app
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, unipooleDashboard, unipooleMenu, unipooleMessage, unipooleSync) {

    /**
     * Constructor
     */
    function UnipooleInit() {
    	this.registrationDialogInitialised = false;
    }

    /**
     * Calls the setup functions on document ready
     */
    jQuery(document).ready(function() {
        // Make call first before interval to get the status set before 
        // continuing with setup
        unipooleDashboard.setInternetStatus(window.navigator.onLine, true);
        jQuery('#uniRegisterLink').click(function() {
            window.unipooleInit.openRegistrationDialog();
        });
        window.unipooleInit._readAppProperties();
        unipooleUtils.logEvent('unipoole.login.app', 'unipoole', 'ref');
    });

    /**
     * Reads the apllication settings and sets properties on session storage. Opens
     * the register dialog if no user is set else initialize.
     */
    UnipooleInit.prototype._readAppProperties = function() {
    	var init = this;
        jQuery.getJSON('unipoole/data/unipooleData.json', function(unipooleData) {
            jQuery.getJSON('unipoole/data/messages.json', function(messages) {
                UNIPOOLE_GLOBAL.unipooleData = unipooleData;
                UNIPOOLE_GLOBAL.messages = messages;
                unipooleMenu.initializeMenu();
                jQuery('#moduleCode').html(unipooleData.moduleId);
                var online = unipooleDashboard.checkOnline(true);

                if (!unipooleData || !unipooleData.username || unipooleData.username === "") {
                    if (online) {
                        unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.INFO, messages.unRegisteredUserMessage, undefined, undefined, function() {
                        	init.openRegistrationDialog();
                        });
                    } else {
                        unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.INFO, messages.offLineUserMessage, undefined, undefined, function() {
                            initialize();
                        });
                    }
                } else {
                    jQuery('#uniUsername').text('Student Number : ' + unipooleData.username);
                    initialize();
                }
            });
        });
    };

    /**
     * Updates the UNIPOOLE_GLOBAL variables
     * 
     * @param {function} callback
     */
    UnipooleInit.prototype.updateGlobalUnipooleData = function(callback) {
        jQuery.getJSON('unipoole/data/unipooleData.json', function(unipooleData) {
            UNIPOOLE_GLOBAL.unipooleData = unipooleData;
            callback();
        });
    };


    /**
     * If online checks sync status from server, else just open menu
     */
    function initialize() {
        if (unipooleDashboard.checkOnline() && !(!UNIPOOLE_GLOBAL.unipooleData.username || UNIPOOLE_GLOBAL.unipooleData.username === '')) {
            unipooleSync.checkSyncStatus();
        } else {
            unipooleMenu.initializeMenu();
        }
    }
    
    /**
     * Sets up the registration dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    UnipooleInit.prototype._setupRegistrationDialog = function() {
    	if (this.registrationDialogInitialised === true){
    		return;
    	}
    	unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/registration.html');
        jQuery("#uniRegisterDialog").dialog({
            autoOpen: false,
            height: 310,
            width: 350,
            modal: true,
            closeOnEscape: false,
            open: function() {
                jQuery("#uniRegisterDialog").parent().find(".ui-dialog-titlebar-close").hide();
                jQuery("#uniRegisterDialog").parent().find(".ui-widget-overlay").css({background: "#000", opacity: 0.9
                });
            },
            position: ['middle', 45],
            buttons: {
                "Register": function() {
                    register(jQuery('#uniRegName').val(), jQuery('#uniRegPassword').val());
                },
                "Cancel": function() {
                    jQuery(this).dialog("close");
                    initialize();
                }
            },
            close: function() {

            }
        });
        // Add event for enter on password field - simulate binding enter to register button
        jQuery('#uniRegPassword').keyup(function(e) {
            if (e.keyCode === 13) {
                register(jQuery('#uniRegName').val(), jQuery('#uniRegPassword').val());
            }
        });
        this.registrationDialogInitialised = true;
    };

    /**
     * To be used as a callback. Opens registration dialog
     */
    UnipooleInit.prototype.openRegistrationDialog = function() {
    	this._setupRegistrationDialog();
        jQuery("#uniRegisterDialog").dialog("open");
    };

    /**
     * Updates the unipooleData file with the username. Sets the name in the html.
     * 
     * @param {String} username
     * @param {String} moduleId 
     * @param {String} lms_id
     * @param {function} callback to be called after user name is set
     */
    function setRegistrationData(username, moduleId, lms_id, callback) {
        var updateData = {
            file: "unipoole/data/unipooleData.json",
            data: {"username": username, "moduleId": moduleId, "oldModuleId": UNIPOOLE_GLOBAL.unipooleData.moduleId, "lms_id": lms_id}
        };
        jQuery.ajax({
            url: "updateFile",
            data: JSON.stringify(updateData),
            contentType: 'application/json',
            type: "POST"
        }).success(function() {
            UNIPOOLE_GLOBAL.unipooleData.username = username;
            jQuery('#uniUsername').text('Registered : ' + username);
            UNIPOOLE_GLOBAL.unipooleData.moduleId = moduleId;
            jQuery('#moduleCode').text(moduleId);
            UNIPOOLE_GLOBAL.unipooleData.lms_id = lms_id;
            if (callback) {
                callback();
            }
        });
    }

    /**
     * Calls the registration service
     * 
     * @param {String} username
     * @param {String} password
     */
    function register(username, password) {
        var registerData = {
            "username": username,
            "password": password
        };
        document.body.style.cursor = 'wait';
        jQuery.ajax({
            url: "register",
            data: JSON.stringify(registerData, null, 4),
            contentType: 'application/json',
            type: "POST"
        }).success(function(dataString) {
            document.body.style.cursor = 'default';
            try {
                var dataObject = jQuery.parseJSON(dataString);
                if (!unipooleMessage.checkServerError('Error in Registration', dataObject)) {
                    setRegistrationData(username, dataObject.moduleId, dataObject.userDetails["lms-id"], initialize);
                    jQuery("#uniRegisterDialog").dialog("close");
                } else {
                    jQuery('#uniRegName').val('');
                    jQuery('#uniRegPassword').val('');
                    unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, "Error while registering", dataString, 4901);
                }
            } catch (e) {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, 'Unexpected error in registration', dataString);
                unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, "Error while registering", e, 4901);
            }
        });
    }
    
    window.unipooleInit = new UnipooleInit();
    
})(window.unipooleUtils, window.unipooleDashboard, window.unipooleMenu, window.unipooleMessage, window.unipooleSync);