/**
 * Displays the current preference and sets the preference.json on user action
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Displays the current preference and sets the preference.json on user action
     * 
     */
    function initialize() {
        jQuery('#successMessage').hide();
        // Read the preference json
        unipooleUtils.readPreferences(function(preferenceData) {
            // Set preferences on html
            if (preferenceData.expanded) {
                jQuery('#expandedRadio').prop('checked', true);
            } else {
                jQuery('#collapsedRadio').prop('checked', true);
            }

            // Add listener to update preference file
            jQuery('#expandedRadio').change(function() {
                unipooleUtils.updatePreference('sakai.melete', {'expanded': true});
                jQuery('#successMessage').show().css('color', 'blue');
            });
            jQuery('#collapsedRadio').change(function() {
                unipooleUtils.updatePreference('sakai.melete', {'expanded': false});
                jQuery('#successMessage').show().css('color', 'blue');
            });
        });
    }

})(window.unipooleUtils);
