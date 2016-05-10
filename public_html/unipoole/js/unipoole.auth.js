/**
 * Sets up the auth dialog
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, unipooleMessage) {

    /**
     * Constructor
     */
    function UnipooleAuthenticate() {
        this.authDialogInitialised = false;
        this.authDialogOkayFunction = null;
        this.authDialogCancelFunction = null;
    }

    /**
     * Sets up the authenticate dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    UnipooleAuthenticate.prototype._setupAuthDialog = function() {
        if(this.authDialogInitialised == true){
            return; // All is done all ready
        }
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/authenticate.html');
        var auth = this;
        var dialog_buttons = {
            'OK' : function() {
                if(auth.authDialogOkayFunction){
                    auth.authDialogOkayFunction();
                }
            },
            'Cancel' : function() {
                jQuery(this).dialog("close");
                if(auth.authDialogCancelFunction){
                    auth.authDialogCancelFunction();
                }
            }
        };
        jQuery("#authenticateDialog").dialog({
            autoOpen: false,
            height: 310,
            width: 350,
            modal: true,
            closeOnEscape: false,
            buttons : dialog_buttons,
            open: function() {
                jQuery("#authenticateDialog").parent().find(".ui-dialog-titlebar-close").hide();
                jQuery("#authenticateDialog").parent().find(".ui-widget-overlay").css({background: "#000", opacity: 0.9});
            },
            position: ['middle', 45],
            // Auth buttons will be added 
            close: function() {
                jQuery(this).dialog("close");
            }
        });
        jQuery("#authenticateDialog").on("dialogopen", function() {
            jQuery('#authName').val(getUserName());
        });
        jQuery('#authPassword').keyup(function(e) {
            if (e.keyCode === 13 && auth.authDialogOkayFunction) {
                    auth.authDialogOkayFunction();
            }
        });
        this.authDialogInitialised = true;
    };
    
    /**
     * Authenticates a user with a dialog
     */
    UnipooleAuthenticate.prototype.authenticateWithDialog = function(callback) {
        this._setupAuthDialog();
         var auth = this;
         
         // Replace the cancel function
         this.authDialogCancelFunction = function(){
            callback(false);
         };
         
         // Replace the Ok function
         this.authDialogOkayFunction = function(){
             auth.authenticate(jQuery('#authPassword').val(), function (authData){
                 callback(true, authData);
             });
         };
         jQuery("#authenticateDialog").dialog('open');
    };

    /**
     * Returns the username that is set in the main frame. Checks if it is in a tool
     * and then gets it from the parent frame
     * 
     * @returns {String}
     */
    function getUserName() {
        var userName = '';
        if (!UNIPOOLE_GLOBAL.unipooleData) {
            userName = parent.UNIPOOLE_GLOBAL.unipooleData.username;
        } else {
            userName = UNIPOOLE_GLOBAL.unipooleData.username;
        }
        return userName;
    }

    /**
     * Authenticate the user
     * 
     * @param {type} password
     * @param {type} callback to call on success
     */
    UnipooleAuthenticate.prototype.authenticate = function(password, callback) {
        var userName = getUserName();
        var authData = {
            "username": userName,
            "password": password
        };
        document.body.style.cursor = 'wait';
        jQuery.ajax({
            url: "/authenticate",
            data: JSON.stringify(authData, null, 4),
            contentType: 'application/json',
            type: "POST"
        }).success(function(dataString) {
            document.body.style.cursor = 'default';
            jQuery('#authenticatePassword').val('');
            try {
                var dataObject = jQuery.parseJSON(dataString);
                if (!unipooleMessage.checkServerError('Error in Authentication', dataObject)) {
                    jQuery("#authenticateDialog").dialog("close");
                    UNIPOOLE_GLOBAL.password = password;
                    callback(dataObject);
                }
            } catch (e) {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, 'Error while authenticating', dataString, e);
                unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, 'Error while authenticating', e, 4901);
            }
        });
    };
    
    // Attach UnipooleUtilities to window.unipooleUtils
    window.unipooleAuth = new UnipooleAuthenticate();
    
})(window.unipooleUtils, window.unipooleMessage);