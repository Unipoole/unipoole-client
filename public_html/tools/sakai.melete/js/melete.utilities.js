/**
 * Shared functions for the melete tool
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    var meleteUtilities = new MeleteUtilities();

    /**
     * Constructor
     */
    function MeleteUtilities() {
    }

    /**
     * Opens the print window for a specific module id
     * 
     * @param {String} id
     */
    MeleteUtilities.prototype.printSection = function(id) {
        var printWindowSetting = "toolbar=yes,location=no,directories=yes,menubar=yes,";
        printWindowSetting += "scrollbars=yes,width=780, height=780, left=100, top=25";
        window.open("print.html?parentId=" + id, "_blank", printWindowSetting);
    };

    /**
     * 
     * @param {type} children
     * @param {type} meleteData
     * @param {type} id
     * @returns {unresolved}
     */
    MeleteUtilities.prototype.getAllChildren = function(children, meleteData, id) {
        for (var key in meleteData) {
            if (meleteData[key].parent_id === id) {
                children[key] = meleteData[key];
                meleteUtilities.getAllChildren(children, meleteData, key);
            }
        }
        return children;
    };

    /**
     * 
     * @param {type} meleteData
     * @param {type} id
     * @returns {unresolved}
     */
    MeleteUtilities.prototype.getRootParent = function(meleteData, id) {
        if (!meleteData[id].parent_id || meleteData[id].parent_id === id) {
            return id;
        }
        return meleteUtilities.getRootParent(meleteData, meleteData[id].parent_id);
    };

    MeleteUtilities.prototype.addIds = function(meleteData) {
        var id = 1;
        for (var key in meleteData) {
            if (!meleteData[key].parent_id) {
                meleteData[key].tt_id = id;
                addChildIds(meleteData, key, id);
                id++;
            }
        }
    };

    function addChildIds(meleteData, parentId, baseId) {
        var childId = 1;
        for (var key in meleteData) {
            if (meleteData[key].parent_id === parentId) {
                meleteData[key].tt_parent_id = baseId;
                meleteData[key].tt_id = baseId + '.' + childId;
                addChildIds(meleteData, key, baseId + '.' + childId);
                childId++;
            }
        }
    }

    /**
     * Opens the add bookmark window and sends the section id as url parameter
     */
    MeleteUtilities.prototype.addBookmark = function() {
        var id = unipooleUtils.getURLParameter('id');
        var bookmarkWindowSetting = "toolbar=no,location=no,directories=no,menubar=no,";
        bookmarkWindowSetting += "scrollbars=no,width=580, height=580, left=100, top=25";
        window.open('newBookmark.html?id=' + id, '_blank', bookmarkWindowSetting);

    };

    window.meleteUtilities = meleteUtilities;

})(window.unipooleUtils);