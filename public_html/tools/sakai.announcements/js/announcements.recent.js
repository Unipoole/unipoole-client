/**
 * Populate the recent announcements html document from the json data
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    /**
     * Populate the recent announcement view on the home page
     * 
     */
    jQuery(document).ready(function() {
        var recentAnnouncementTemplate = unipooleUtils.getTemplate('templates/announcements.recent.handlebars');
        jQuery.getJSON('data/announcements.json', function(data) {
            var recentAnnouncement = {};
            recentAnnouncement = filterRecentAnnouncements(data);
            var hasData = false;
            for (var key in recentAnnouncement) {
                recentAnnouncement[key].iframeId = unipooleUtils.getURLParameter('iframe');
                hasData = true;
            }
            if (hasData) {
                jQuery(recentAnnouncementTemplate(recentAnnouncement)).appendTo("#recentAnnouncements");
            }
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
            unipooleUtils.resizeFrame();
        });
    });

    /**
     * Get the recent announcements from the past 10 days
     * 
     * @param {Object} data
     * 
     */
    function filterRecentAnnouncements(data) {
        var recentAnnouncement = {};
        var pastTenDays = moment().subtract('days', 10).calendar();
        jQuery.each(data, function(key) {
            var itemDate = data[key].create_date;
            if (moment(itemDate).isAfter(pastTenDays)) {
                recentAnnouncement[key] = data[key];
            }
        });
        return recentAnnouncement;
    }

})(window.unipooleUtils);
