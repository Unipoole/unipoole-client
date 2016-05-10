/**
 * Populate the print page and cals the printer
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, meleteUtilities) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populate the print page and cals the printer
     * 
     */
    function initialize() {
        var parenId = unipooleUtils.getURLParameter('parentId');
        jQuery.getJSON('data/melete.json', function(meleteData) {
            jQuery('#printBody').html(getAllSectionsFromParent(parenId, meleteData));
        });
    }

    /**
     * Gets all the sub sections for an id and concatenate the content
     * 
     * @param {String} parentId
     * @param {Object} meleteData
     * @returns {String} HTML string of all the sub sections
     */
    function getAllSectionsFromParent(parentId, meleteData) {
        var returnHTML = "";
        var moduleSections = meleteUtilities.getAllChildren({}, meleteData, parentId);
        for (var key in moduleSections) {
            var content = moduleSections[key].content;
            if (content) {
                content = content.replace(new RegExp('/access/meleteDocs/content/private/meleteDocs/', 'g'), '../sakai.resources/data/');
                content = content.replace(new RegExp('/uploads/', 'g'), '/images/');
            }
            returnHTML = returnHTML + '<h3>' + moduleSections[key].id + ' ' + moduleSections[key].title + '</h3>';
            returnHTML = returnHTML + content;
        }
        return returnHTML;
    }

})(window.unipooleUtils, window.meleteUtilities);