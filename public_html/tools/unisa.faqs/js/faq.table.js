/**
 * Populate the faq tree table
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populates the faq tree and decorate with treetable
     * 
     */
    function initialize() {
        var menuTemplate = unipooleUtils.getTemplate('templates/faqTree.handlebars');

        jQuery.getJSON('data/faqs.json', function(data) {
            jQuery(menuTemplate(prepareFaqData(data))).appendTo('.portletBody');

            var treeTableOptions = {
                expandable: true,
                clickableNodeNames: true,
                onNodeExpand: function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                },
                onNodeCollapse: function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                }
            };
            jQuery('#faqTable').treetable(treeTableOptions);
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        });
    }

    /**
     * Adds the boolean parent indicator to identify the parent nodes
     * 
     * @param {Object} faqData
     */
    function prepareFaqData(faqData) {
        var displayData = [];
        for (var key in faqData) {
            faqData[key].isParent = faqData[key].id === faqData[key].parentId;
            if (faqData[key].isParent) {
                displayData.push(faqData[key]);
                addChildren(faqData[key].id, faqData, displayData);
            }
        }
        return displayData;
    }

    /**
     * Add the children for a parent node
     * 
     * This is done to get the corret diaply order for the tree table
     * 
     * @param {type} parentId
     * @param {type} faqData
     * @param {type} displayData
     */
    function addChildren(parentId, faqData, displayData) {
        for (var key in faqData) {
            if (faqData[key].parentId === parentId && faqData[key].id !== parentId) {
                displayData.push(faqData[key]);
            }
        }
    }

})(window.unipooleUtils);