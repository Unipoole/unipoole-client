/**
 * Populate home html with tool iframes
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function() {

    jQuery(document).ready(function() {
        jQuery.getJSON('data/home.json', function(homeData) {
            for (var frame in homeData.home) {
                var iframe = jQuery('#' + frame);
                if (iframe.length) {
                    if (homeData.home[frame].tool) {
                        iframe.attr('src', "../" + homeData.home[frame].tool + "/" + homeData.home[frame].defaultPage + "?view=home&iframe=" + frame);
                        jQuery('#' + frame + '-header').find('h2').html(homeData.home[frame].heading);
                        jQuery('#' + frame + 'Reset').attr("href", "../" + homeData.home[frame].tool + "/" + homeData.home[frame].defaultPage + "?view=home&iframe=" + frame);
                    } else {
                        jQuery('#' + frame + '-header').hide();
                    }
                }
            }
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        });

    });

})();

/**
 * Sets the home iframe hieght when any child iframe is resized
 * 
 * The postIframeResize function is a callback method called by the setMainFrameHeight
 * function in the headscript.js file and can not be in a closure
 * 
 * DO NOT MOVE into closure
 */
function postIframeResize() {
    var newheight;
    if (document.getElementById) {
        newheight = parent.document.getElementById(UNIPOOLE_GLOBAL.IFRAME_ID).contentWindow.document.body.scrollHeight;
    }
    jQuery('#' + UNIPOOLE_GLOBAL.IFRAME_ID, parent.document).attr('style', "height: " + (newheight) + "px;");
}