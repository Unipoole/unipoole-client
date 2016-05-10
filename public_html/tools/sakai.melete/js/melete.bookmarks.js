/**
 * Populate the melete bookmarks table
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    function MeleteBookmarks() {
        
    }

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populate the melete bookmarks table
     * 
     */
    function initialize() {
        var bookmarksTemplate = unipooleUtils.getTemplate('templates/melete.bookmarks.handlebars');
        jQuery("#bookmarkDeletionConfirmationTable").hide();
        jQuery("#warningMessage").hide();
        jQuery.getJSON('data/bookmarks.json', function(bookmarksData) {
            jQuery(bookmarksTemplate(bookmarksData)).appendTo('#bookmarksTableBody');
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);

        });
    }

    /**
     * Edits the selected bookmark
     * @param {type} id
     */
    MeleteBookmarks.prototype.editBookmark = function(id) {
        var bookmarkWindowSetting = "toolbar=no,location=no,directories=no,menubar=no,";
        bookmarkWindowSetting += "scrollbars=no,width=580, height=580, left=100, top=25";
        var w = window.open('newBookmark.html?id=' + id, '_blank', bookmarkWindowSetting);

        var pollTimer = window.setInterval(function() {

            if (w.closed !== false) {
                window.clearInterval(pollTimer);
                window.location.reload();
            }
        }, 200);
    };

    /**
     * Shows warning message when a user is about to delete a bookmark
     * 
     * @param {type} id
     */
    MeleteBookmarks.prototype.showDeletionConfirmation = function(id) {
        var objectId = id.toString();
        jQuery('#bookmarkList').hide();
        jQuery("#bookmarkDeletionConfirmationTable").show();
        jQuery("#warningMessage").show();
        jQuery.getJSON('data/bookmarks.json', function(bookmarksData) {
            for (var i = 0; i < bookmarksData.bookmarks.length; i++) {
                if (bookmarksData.bookmarks[i].id === objectId) {
                    UNIPOOLE_GLOBAL.bookmarkIndex = i;
                    jQuery('#bookmarkTitle').html(bookmarksData.bookmarks[i].title);
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                }
            }
        });
    };

    /**
     * Deletes the selected bookmark mark when the user confirms deletion
     */
    MeleteBookmarks.prototype.confirmDeletion = function() {
        jQuery.getJSON('data/bookmarks.json', function(bookmarksData) {
            bookmarksData.bookmarks.splice(UNIPOOLE_GLOBAL.bookmarkIndex, 1);
            unipooleUtils.updateFile('tools/sakai.melete/data/bookmarks.json', bookmarksData, function() {
                window.location.reload();
            }, true, "../../");
        });
    };

    /**
     * Cancels deletion and returns to the boorkmark list when the user does not confirm
     */
    MeleteBookmarks.prototype.cancelDeletion = function() {
        jQuery('#bookmarkList').show();
        jQuery("#bookmarkDeletionConfirmationTable").hide();
        jQuery("#warningMessage").hide();
    };
    
    window.meleteBookmarks = new MeleteBookmarks();

})(window.unipooleUtils);