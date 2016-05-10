/**
 * Populate the announcments html document table from the json data
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    /**
     * Populates the anouncements table and decorate with datatables 
     * 
     */
    jQuery(document).ready(function() {
        var menuTemplate = unipooleUtils.getTemplate('templates/anouncementsTable.handlebars');

        jQuery.getJSON('data/announcements.json', function(menuData) {
            jQuery(menuTemplate(menuData)).appendTo('.portletBody');
            jQuery('#dataTable').dataTable(
                    {'aoColumns': [{'width': '1%'},
                            null,
                            null,
                            {"bVisible": false},
                            {'iDataSort': 3},
                            {"bVisible": false},
                            {'iDataSort': 5},
                            {"bVisible": false},
                            {'iDataSort': 7}
                        ],
                        "fnDrawCallback": function() {
                            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                        }
                        , "sDom": '<"top"filp>rt<"bottom"><"clear">'
                    }
            );
            unipooleUtils.resizeFrame();
        });
    });

})(window.unipooleUtils);