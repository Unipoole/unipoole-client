/**
 * Functions used to build the menu and respond to events
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleSync) {

    /**
     * Constructor
     */
    function UnipooleMenu() {
    }

    /**
     * Loads the selected tool in the iFrame when menu item clicked
     * 
     * @param {Object} source the menu item clicked
     * @param {String} url the relative path to load in the iframe
     * @param {String} heading the heading to add above the iframe
     */
    UnipooleMenu.prototype.loadMenuItem = function(source, url, heading) {
        var selected = jQuery(source).parent().hasClass(UNIPOOLE_GLOBAL.SELECTED_TOOL_CLASS);

        if (!selected) {
            var iframe = jQuery('#' + UNIPOOLE_GLOBAL.IFRAME_ID);
            var toolHeading = jQuery('#toolHeading');

            if (iframe.length) {
                iframe.attr('src', url);
                if (heading) {
                    toolHeading.html(heading);
                    jQuery('.portletTitleWrap').show();
                } else {
                    jQuery('.portletTitleWrap').hide();
                }
                clearSelectedTool(source);
                jQuery(source).parent().addClass(UNIPOOLE_GLOBAL.SELECTED_TOOL_CLASS);
                jQuery('#uniResetTool').attr("href", url);
            }
        }
    };

    /**
     * Clears the current selected menu item style
     * 
     * @param {Object} source
     */
    function clearSelectedTool(source) {
        jQuery(source).parents('ul').first().find('li').removeClass('selectedTool');
    }

    /**
     * Loads the tool menu items from the meta data
     */
    UnipooleMenu.prototype.initializeMenu = function() {
        var menuTemplate = unipooleUtils.getTemplate('unipoole/templates/menu.handlebars');
        var menus = UNIPOOLE_GLOBAL.unipooleData.toolDescriptions;
        var menuData = [];
        for (var key in menus) {            
            if (menus[key].menu) {
                // For the synced indicator
                menus[key].synced = UNIPOOLE_GLOBAL.unipooleData.toolsLocal[key] && !UNIPOOLE_GLOBAL.unipooleData.toolsLocal[key].localChange && unipooleSync.checkToolSync(key, UNIPOOLE_GLOBAL.unipooleData, 'ContentVersion')
                        && unipooleSync.checkToolSync(key, UNIPOOLE_GLOBAL.unipooleData, 'CodeVersion');
                menus[key].tool = key;
                menuData.push(menus[key]);
            }
        }
        menuData.sort(compareArrayData);
        jQuery('#toolMenu').empty();
        jQuery(menuTemplate({"menus": menuData})).appendTo('#toolMenu');
    };

    /**
     * Data compare function used in menu item array sorting
     * 
     * @param {type} a
     * @param {type} b
     * @returns {Number}
     */
    function compareArrayData(a, b) {
        if (a.seq < b.seq) {
            return -1;
        }
        if (a.seq > b.seq) {
            return 1;
        }
        return 0;
    }

    window.unipooleMenu = new UnipooleMenu();

})(window.unipooleSync);