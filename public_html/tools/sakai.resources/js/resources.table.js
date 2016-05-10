/**
 * Populate the resources tree table
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
    initialize();
});

/**
 * Populates the resources tree and decorate with treetable
 * 
 */
function initialize() {
    jQuery.getJSON('data/resources.json', function(resourcesData) {
        jQuery.getJSON('../../unipoole/data/unipooleData.json', function(unipooleData) {
            // Fix root node
            var resourcesTemplate = unipooleUtils.getTemplate('templates/resourcesTable.handlebars');

            delete resourcesData['/group/' + unipooleData.moduleId + "/"].treeParentId;
            deleteOtherMapKeys(resourcesData, unipooleData.moduleId);
            // Convert to Array and sort for treetable to work
            var displayData = prepareResourceData(resourcesData);
            jQuery(resourcesTemplate(displayData)).appendTo('.portletBody');
            var treeTableOptions = {
                expandable: true,
                clickableNodeNames: true,
                column: 1,
                onInitialized: function() {
                    jQuery('#resourcesTable').treetable("expandNode", unipooleData.moduleId + "/");
                }
            };
            jQuery('#resourcesTable').treetable(treeTableOptions);
            jQuery('.resourceTitle').wrapInner('<h4/>');
            jQuery('.resourceActionMenu').menu(
                    {
                        position:
                                {my: "left top", at: "left+1 bottom-2"},
                        icons:
                                {submenu: "ui-icon-circle-triangle-s"}
                    });
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        });
    });
}


/**
 * Delete any entry on the map whose key does not contain the value
 * 
 * We use this to delete any master site entries from the resource json
 * 
 * @param {type} map
 * @param {type} value
 * @returns {undefined}
 */
function deleteOtherMapKeys( map, value ) {
    for( var key in map ) {
        if( key.indexOf(value) === -1) {
             delete map[key];
        }
    }
}
/**
 * Converts to sorted array
 * 
 * @param {Object} data
 */
function prepareResourceData(data) {
    var displayData = [];
    for (var key in data) {
        data[key].treeId = data[key].treeId.replace(/[|&:;$%@"<>()+,]/g, "_");
        if (data[key].mime_type == 'text/url') {
            data[key].thisIsLink = true;
            jQuery.ajax({
                url: 'data/' + data[key].treeId,
                success: function(fileData) {
                    data[key].treeId = fileData;
                },
                async: false
            });
        }
        displayData.push(data[key]);
    }
    displayData.sort(compareArrayData);
    return displayData;
}

/**
 * Sort data so that it displays corretly in Tree Table plugin
 * 
 * @param {type} a
 * @param {type} b
 * @returns {Number}
 */
function compareArrayData(a, b) {
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    return 0;
}

/**
 * Expands/collapses all nodes
 */
function expandCollapse() {
    if (jQuery('#expandAll').is(":visible")) {
        jQuery('#resourcesTable').treetable("expandAll");
        jQuery('#expandAll').hide();
        jQuery('#collapseAll').show();
    } else {
        jQuery('#resourcesTable').treetable("collapseAll");
        jQuery('#expandAll').show();
        jQuery('#collapseAll').hide();
        jQuery('#resourcesTable').treetable("expandNode", '1');
    }
}