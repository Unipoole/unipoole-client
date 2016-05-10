/**
 * Populate the melete module tree table
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, meleteUtilities) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populates the melete module tree and decorate with treetable
     * 
     */
    function initialize() {
        var meleteTemplate = unipooleUtils.getTemplate('templates/melete.handlebars');

        jQuery.getJSON('data/melete.json', function(data) {
            if (!hasTTIds(data)) {
                meleteUtilities.addIds(data);
            }
            var displayData = prepareMeleteData(data);
            jQuery(meleteTemplate(displayData)).appendTo('#moduleTableDiv');
            var treeTableOptions = {
                expandable: true,
                clickableNodeNames: false,
                column: 0,
                onNodeExpand: function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                },
                onNodeCollapse: function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                }
            };
            jQuery('#moduleTable').treetable(treeTableOptions);
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
            loadPreferences();
        });
        jQuery('#expandAll').click(function() {
            expandCollapse();
        });
        jQuery('#collapseAll').click(function() {
            expandCollapse();
        });
    }

    /**
     * Check for legacy melete.data where the tt_id's must be added
     * 
     * @param {type} data
     * @returns {Boolean}
     */
    function hasTTIds(data) {
        for (var key in data) {
            if (data[key].tt_id || data[key].tt_parent_id) {
                return true;
            }
            return false;
        }
    }

    /**
     * Adds the boolean parent indicator to identify the parent nodes
     * 
     * @param {Object} meleteData
     */
    function prepareMeleteData(meleteData) {
        var displayData = [];
        for (var key in meleteData) {
            meleteData[key].isParent = !meleteData[key].parent_id;
            meleteData[key].id = key;
            displayData.push(meleteData[key]);
        }
        displayData.sort(compareArrayData);
        return displayData;
    }

    /**
     * Sort melete data so that it displays corretly in Tree Table plugin
     * 
     * @param {type} versionA
     * @param {type} versionB
     * @returns {Number}
     */
    function compareArrayData(versionA, versionB) {
        var idA = new String(versionA.tt_id);
        var idB = new String(versionB.tt_id);
        var a = idA.split(".");
        var b = idB.split(".");
        //step through the equal versions
        var i = 0;
        while ((i < a.length) && (i < b.length) && a[i] === b[i]) {
            i++;
        }
        if (i < a.length && i < b.length) {
            if (parseInt(a[i]) < parseInt(b[i])) {
                return -1;
            }
            if (parseInt(a[i]) > parseInt(b[i])) {
                return 1;
            }
            return 0;
        }

        return a.length < b.length ? -1 : (a.length === b.length ? 0 : 1);
    }
    /**
     * Loads the preference file and sets the html accordingly
     */
    function loadPreferences() {
        unipooleUtils.readPreferences(function(preferenceData) {
            if (preferenceData.expanded) {
                jQuery('#moduleTable').treetable("expandAll");
            }
        });
    }

    /**
     * Expands or colapses all nodes 
     */
    function expandCollapse() {
        if (jQuery('#expandAll').is(":visible")) {
            jQuery('#moduleTable').treetable("expandAll");
            jQuery('#expandAll').hide();
            jQuery('#collapseAll').show();
        } else {
            jQuery('#moduleTable').treetable("collapseAll");
            jQuery('#expandAll').show();
            jQuery('#collapseAll').hide();
        }
    }

})(window.unipooleUtils, window.meleteUtilities);