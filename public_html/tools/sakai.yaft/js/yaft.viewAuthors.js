
(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(document).ready(function() {
        initialise();
    });
    
    function initialise(){
        var discussion_id = unipooleUtils.getURLParameter('id');
        yaftHelper.getDiscussion(discussion_id, function(discussion){
            if (discussion === undefined){
                // TODO warn forum not found
                console.log("Could not find forum id:" + forum_id);
                return;
            }else{
                updateBreadCrumb(discussion.forum, discussion);
                // Get the authors for the discussion
                yaftHelper.getDiscussionAuthors(discussion_id, function(authors){
                    loadTable(authors);
                });
                
            }
        });
    }
    
    /**
     * Update the forum title on the page
     * @param {type} forum The forum object
     * @returns {undefined}
     */
    function updateBreadCrumb(forum, discussion){
         jQuery("a#forumTitle").html(forum.title);
         jQuery("a#forumTitle").attr("href", "viewForum.html?id=" + forum.key);
         jQuery("a#discussionTitle").html(discussion.topic);
         jQuery("a#discussionTitle").attr("href", "viewDiscussion.html?id=" + discussion.key);
    }

    /**
     * Builds the template
     * @param {type} discussions Discussions to display in the table.
     * @returns {undefined}
     */
    function loadTable(discussions){
        var tableTemplate = unipooleUtils.getTemplate('templates/yaft.authorsTable.handlebars');
        jQuery(tableTemplate(discussions)).appendTo('div#yaft_content[data-yaft-role=dataTable]');
        
        jQuery.fn.dataTableExt.oJUIClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
        jQuery.fn.dataTableExt.oJUIClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
        jQuery.fn.dataTableExt.oStdClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
        jQuery.fn.dataTableExt.oStdClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
        
        jQuery('table#yaft_author_table').dataTable({
                "fnDrawCallback": function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                }, aaSorting: [[0, 'asc']],
                "aoColumnDefs": [
                     { "aTargets": [ 0 ], "bSortable": true },
                     { "aTargets": [ 1 ], "bSortable": true }
                 ],
                "sDom": ''
        });
        unipooleUtils.resizeFrame();
    }
    
})(window, jQuery, window.unipooleUtils);

