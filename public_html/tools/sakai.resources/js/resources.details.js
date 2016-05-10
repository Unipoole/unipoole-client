/**
 * Populate the resource details
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
    initialize();
});

/**
 * Populates the faq tree and decorate with treetable
 * 
 */
function initialize() {
    var detailsTemplate = unipooleUtils.getTemplate('templates/resourceDetails.handlebars');
    var id = unipooleUtils.getURLParameter('id');
    
    jQuery.getJSON('data/resources.json', function(data) {
        var detail = data[id];
        detail.treeId = detail.treeId.replace(/[|&:;$%@"<>()+,]/g, "_");
        if (detail.mime_type == 'text/url') {
             detail.thisIsLink = true;
             jQuery.ajax({
                url: 'data/' + detail.treeId,
                success: function(fileData) {
                    detail.treeId = fileData;
                },
                async: false
            });
        }
        // append the details block
        jQuery(detailsTemplate(detail)).appendTo('.portletBody');

        setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
    });
}
