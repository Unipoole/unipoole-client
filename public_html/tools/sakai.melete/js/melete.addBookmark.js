/**
 * Populate the melete bookmarks data file
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils) {

    jQuery(document).ready(function() {
        initialize();
    });

    /**
     * Populate the melete bookmarks data file
     * 
     */
    function initialize() {
        var id = unipooleUtils.getURLParameter('id');

        jQuery.getJSON('data/bookmarks.json', function(bookmarksData) {
            var bookmark = unipooleUtils.getArrayItemFromKeyValue(bookmarksData.bookmarks, 'id', id);

            if (bookmark) {
                jQuery('#title').val(bookmark.title);
                jQuery('#notes').val(bookmark.notes);
                jQuery('#flaglastvisited').prop('checked', bookmark.last_visited);
            } else {

                jQuery.getJSON('data/melete.json', function(meleteData) {
                    jQuery('#title').val(meleteData[id].title);
                });
            }
        }).fail(function() {
            jQuery.ajax({
                url: unipooleUtils.getRelativePath() + "checkCreateFile",
                data: JSON.stringify({file: 'tools/sakai.melete/data/bookmarks.json', data: '{"bookmarks": []}'}),
                contentType: 'application/json',
                type: "POST",
                async: false
            }).success(function() {
                location.reload();
            });
        });
        
        jQuery('#meleteAddBookmark').click(function() {
            writeBookmark();
        });
    }

    /**
     * Write the bookmark data to the bookmarks json file
     */
    function writeBookmark() {
        jQuery.getJSON('data/bookmarks.json', function(bookmarksData) {
            var id = unipooleUtils.getURLParameter('id');
            var lastVisited = jQuery('#flaglastvisited').is(':checked');
            var title = jQuery('#title').val();
            var notes = jQuery('#notes').val();
            var bookmark = unipooleUtils.getArrayItemFromKeyValue(bookmarksData.bookmarks, 'id', id);

            if (!bookmark) {
                bookmark = {'id': id};
                bookmarksData.bookmarks.push(bookmark);
            }
            bookmark.title = title;
            bookmark.notes = notes;

            if (lastVisited) {
                for (var i = 0; i < bookmarksData.bookmarks.length; i++) {

                    if (bookmarksData.bookmarks[i].id.match(id)) {
                        bookmarksData.bookmarks[i].last_visited = true;
                    } else {
                        bookmarksData.bookmarks[i].last_visited = false;
                    }
                }
            }
            unipooleUtils.updateFile('tools/sakai.melete/data/bookmarks.json', bookmarksData, undefined, false, "../../");
            alert('Bookmark saved');
            window.close();
        });
    }

})(window.unipooleUtils);