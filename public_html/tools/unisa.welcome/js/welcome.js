/**
 * Populate the welcome screen
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        jQuery.getJSON('data/welcome.json', function(welcomeData) {
            jQuery('.portletBody').append(welcomeData.content);
            unipooleUtils.resizeFrame();
        });
        unipooleUtils.logEvent("unipoole.welcome.view", "", "");
    });

})(window.unipooleUtils);

