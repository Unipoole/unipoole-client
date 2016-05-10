/**
 * Functions used to set the dashboard indicators
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function() {

    function UnipooleDashboard() {

    }

    var unipooleDashboard = new UnipooleDashboard();

    /**
     * Add event listeners to set online/offline status
     */
    if (window.addEventListener) {
        window.addEventListener("online", function() {
            unipooleDashboard.setInternetStatus(true, false);
        });
        window.addEventListener("offline", function() {
            unipooleDashboard.setInternetStatus(false, false);
        });
    } else {
        window.onload = function() {
            document.body.ononline = function() {
                unipooleDashboard.setInternetStatus(true, false);
            };
            document.body.onoffline = function() {
                unipooleDashboard.setInternetStatus(false, false);
            };
        };
    }


    /**
     * Checks if the user is connected to the internet
     * 
     * I am keeping this method for now even though the UNIPOOLE_GLOBAL.internet_status
     * can be used in stead. Will change later. Just wanted to keep abstracted
     */
    UnipooleDashboard.prototype.checkOnline = function() {
        if (window.navigator.onLine) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Sets the status indicator and displays toast message if status changes
     *
     * @param {boolean} status
     * @param {boolean} firstCall
     */
    UnipooleDashboard.prototype.setInternetStatus = function(status, firstCall) {
        if (!UNIPOOLE_GLOBAL.internet_status && status) {
            setOnlineStatus(true);
        } else if (firstCall || (UNIPOOLE_GLOBAL.internet_status && !status)) {
            setOffineStatus(true);
        }
        UNIPOOLE_GLOBAL.internet_status = status;
    };

    /**
     * Displays message and changes dashboard
     * 
     * @param {boolean} showNotification
     */
    function setOnlineStatus(showNotification) {
        jQuery('#dashboardNetStatus').addClass('connectionOnline');
        jQuery('#dashboardNetStatus').removeClass('connectionOffline');
        jQuery('#dashboardNetStatus').html('Online Status');
        jQuery('#dashboardNetStatus').attr('title', 'Internet connectivity available');
        if (showNotification) {
            toastr.success('Online : Unipoole can sync your work');
        }
    }

    /**
     * Displays message and changes dashboard
     * 
     * @param {boolean} showNotification
     */
    function setOffineStatus(showNotification) {
        jQuery('#dashboardNetStatus').addClass('connectionOffline');
        jQuery('#dashboardNetStatus').removeClass('connectionOnline');
        jQuery('#dashboardNetStatus').html('Online Status');
        jQuery('#dashboardNetStatus').attr('title', 'No Internet connectivity');
        if (showNotification) {
            toastr.warning('Offline : Unipoole can not sync your work!');
        }
    }

    // Attach UnipooleDashboard to window.unipooleUtils
    window.unipooleDashboard = unipooleDashboard;

})();