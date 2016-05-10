/**
 * Populate the announcements html document details from the json data
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        initialize();

    });

    /**
     * Populate the detail page with handlebars
     * 
     */
    function initialize() {
        var detailsTemplate = unipooleUtils.getTemplate('templates/anouncementsDetail.handlebars');
        var id = unipooleUtils.getURLParameter('id');

        jQuery.getJSON('data/announcements.json', function(data) {
            var detail = data[id];
            // append the details block
            jQuery(detailsTemplate(detail)).appendTo('#detailTable');

            // append the message html
            jQuery('<p>' + detail.body + '</p>').appendTo(".portletBody");

            // check if any attchments exist and add to attachment display list
            if (detail.attachments && detail.attachments.length > 0) {
                var notLink = false;
                for (var i = 0; i < detail.attachments.length; i++) {
                    notLink = notLink || !detail.attachments[i].link;
                }
                if (notLink) {
                    var attachmentsTemplate = unipooleUtils.getTemplate('templates/anouncementsAttachments.handlebars');
                    jQuery(attachmentsTemplate(detail)).appendTo('.portletBody');
                }
            }

            // set the next and previous button id
            var nextId = unipooleUtils.getNextKeyValue(data, id);
            var previousId = unipooleUtils.getPreviousKeyValue(data, id);

            jQuery("#previousButton").click(function() {
                window.open('details.html?id=' + previousId + '&fromRecent=' + unipooleUtils.getURLParameter('fromRecent'), '_self');
            });

            jQuery("#nextButton").click(function() {
                window.open('details.html?id=' + nextId + '&fromRecent=' + unipooleUtils.getURLParameter('fromRecent'), '_self');
            });

            hideButtons();
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
            unipooleUtils.resizeFrame();
        });

        jQuery('#listButton').click(function() {
            navigate();
        });
    }

    /**
     * Navigate to the correct html document when the return to list button is clicked
     */
    function navigate() {
        var fromRecent = unipooleUtils.getURLParameter('fromRecent');
        if (fromRecent === 'true') {
            window.open('announcements.recent.html', '_self');
        }
        else {
            window.open('announcements.html', '_self');
        }
    }

    /**
     * Hide the next and previous button when detail.html is opened by announcement.recent.html
     */
    function hideButtons() {
        var fromRecent = unipooleUtils.getURLParameter('fromRecent');
        if (fromRecent === 'true') {
            jQuery("#nextButton").hide();
            jQuery("#previousButton").hide();
        }
    }

})(window.unipooleUtils);