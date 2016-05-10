/**
 * Initialize the faq details html 
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Init details by populating html with handlebars
     */
    function initialize() {
        var detailsTemplate = unipooleUtils.getTemplate('templates/faqDetails.handlebars');
        var content_id = unipooleUtils.getURLParameter('content_id');
        var category_id = unipooleUtils.getURLParameter('category_id');

        jQuery.getJSON('data/faqs.json', function(data) {
            var detail = data[content_id];
            var categoryDetail = data[category_id];
            detail.category = categoryDetail.description;

            // append the details block
            jQuery(detailsTemplate(detail)).appendTo('#detailTable');

            // append the message html
            jQuery(detail.message).appendTo(".portletBody");

            // Set the next and previous links
            var catContents = getCatContents(data, category_id);
            var nextId = unipooleUtils.getNextKeyValue(catContents, content_id);
            var previousId = unipooleUtils.getPreviousKeyValue(catContents, content_id);

            jQuery("#previousButton").click(function() {
                window.open('details.html?content_id=' + previousId + '&category_id=' + category_id, '_self');
            });

            jQuery("#nextButton").click(function() {
                window.open('details.html?content_id=' + nextId + '&category_id=' + category_id, '_self');
            });

            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        });

    }

    /**
     * 
     * @param {type} data
     * @param {type} id
     * @returns {unresolved}
     */
    function getCatContents(data, id) {
        var catContents = {};
        for (var key in data) {
            if (String(data[key].parentId) === id && String(data[key].id) !== id) {
                catContents[key] = data[key];
            }
        }
        return catContents;
    }

})(window.unipooleUtils);