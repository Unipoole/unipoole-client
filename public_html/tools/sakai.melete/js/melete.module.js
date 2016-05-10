/**
 * Populate the melete module view
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, meleteUtilities) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populates the melete module view
     * 
     */
    function initialize() {
        var id = unipooleUtils.getURLParameter('id');
        jQuery.getJSON('data/melete.json', function(meleteData) {
            meleteUtilities.addIds(meleteData);
            var moduleData = meleteData[id];

            // Set breadcrumbs
            jQuery('#moduleTitle').text(moduleData.title);
            jQuery('#sectionTitle').text(moduleData.title);

            // Set title
            jQuery('#mod_seq').text(moduleData.tt_id + '. ');
            jQuery('#moduleTitle').text(moduleData.title);

            if (moduleData.status === 'complete') {
                jQuery('#moduleStatus').attr('src', '../../unipoole/image/finish.gif');
                jQuery('#moduleStatus').attr('alt', 'Complete');
                jQuery('#moduleStatus').attr('title', 'Complete');
            } else if (moduleData.status === 'in_progress') {
                jQuery('#moduleStatus').attr('src', '../../unipoole/image/status_away.png');
                jQuery('#moduleStatus').attr('alt', 'In progress');
                jQuery('#moduleStatus').attr('title', 'In progress');
            } else {
                jQuery('#moduleStatus').hide();
            }

            jQuery('#moduleDescription').text(moduleData.description);

            var sectionData = meleteUtilities.getAllChildren({}, meleteData, meleteUtilities.getRootParent(meleteData, id));

            jQuery('#myBookmarksLink').attr('href', 'bookmarks.html?id=' + id);
            jQuery('#print').attr('onclick', 'meleteUtilities.printSection("' + id + '");');
            jQuery('#nextItem').attr('href', 'moduleSection.html?id=' + Object.keys(sectionData)[0]);

            var moduleTemplate = unipooleUtils.getTemplate('templates/module.handlebars');

            jQuery(moduleTemplate(sectionData)).appendTo('#moduleSectionsBody');
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);

        });
    }

})(window.unipooleUtils, window.meleteUtilities);