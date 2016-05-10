/**
 * Populate the melete module section
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, meleteUtilities) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populates the melete module section
     * 
     */
    function initialize() {
        var id = unipooleUtils.getURLParameter('id');
        UNIPOOLE_GLOBAL.moduleSectionId = id;
        unipooleUtils.logEvent("unipoole.melete.section.read", id, "");
        jQuery.getJSON('data/melete.json', function(meleteData) {
            meleteUtilities.addIds(meleteData);
            var sectionData = meleteData[id];
            var parentData = meleteData[sectionData.parent_id];

            // Check if root node
            if (!parentData.parent_id) {
                jQuery('#moduleItem').attr('href', 'module.html?id=' + sectionData.parent_id);
            } else {
                jQuery('#moduleItem').attr('href', 'moduleSection.html?id=' + sectionData.parent_id);
            }
            // Set breadcrumbs
            jQuery('#moduleTitle').text(parentData.title);
            jQuery('#sectionTitle').text(sectionData.title);

            // Set parent title
            jQuery('#mod_seq').text(parentData.tt_id + '. ');
            jQuery('#modtitle').text(parentData.title);

            // Set module title
            jQuery('#section_seq').text(sectionData.tt_id + '. ');
            jQuery('#section_title').text(sectionData.title);
            var content = sectionData.content;
            if (content) {
                content = content.replace(new RegExp('/access/meleteDocs/content/private/meleteDocs/', 'g'), '../sakai.resources/data/');
                content = content.replace(new RegExp('/uploads/', 'g'), '/images/');
            }else if (sectionData.upload){
                content = "<iframe id='iframe2' src='data/" + sectionData.upload.treeId + "' scrolling='auto' width='100%' height='700' border='0' frameborder='0'></iframe>"
            }      
            jQuery('#sectionContent').html(content);

            // Set the next and previous links
            var moduleSections = meleteUtilities.getAllChildren({}, meleteData, meleteUtilities.getRootParent(meleteData, id));
            var nextId = unipooleUtils.getNextKeyValue(moduleSections, id);
            var previousId = unipooleUtils.getPreviousKeyValue(moduleSections, id);

            jQuery('[id*="prevMod"]').attr('href', 'moduleSection.html?id=' + previousId);
            jQuery('[id*="nextItem"]').attr('href', 'moduleSection.html?id=' + nextId);

            jQuery('#myBookmarksLink').attr('href', 'bookmarks.html?id=' + id);

            updateReadStatus(id, meleteData);

            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);

        });
    }

    /**
     * Updates the last visited and read status flags on the section and module level
     * 
     * @param {String} id
     * @param {Object} meleteData
     */
    function updateReadStatus(id, meleteData) {
        var parent = meleteData[meleteUtilities.getRootParent(meleteData, id)];
        var section = meleteData[id];
        section.read = true;
        section.last_visit = new Date();
        parent.last_visit = new Date();
        var complete = true;

        var siblings = meleteUtilities.getAllChildren({}, meleteData, meleteUtilities.getRootParent(meleteData, id));

        for (var key in siblings) {
            complete = complete && meleteData[key].read;
        }

        if (complete) {
            parent.status = 'complete';
        } else {
            parent.status = 'in_progress';
        }
        unipooleUtils.updateFile('tools/sakai.melete/data/melete.json', meleteData, undefined, true, "../../");
    }

})(window.unipooleUtils, window.meleteUtilities);