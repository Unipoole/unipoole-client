
(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    var author_id;
    var discussion_id;
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(document).ready(function() {
        initialise();
    });
    
    
    /**
     * Initialise this page
     */
    function initialise(){
        author_id = unipooleUtils.getURLParameter('aid');
        discussion_id = unipooleUtils.getURLParameter('did');
        
        // Get the discussion to update breadcrumb
        yaftHelper.getDiscussion(discussion_id, function(discussion){
            updateBreadCrumb(discussion.forum, discussion);
        });
        
        // Get the messages to display
        yaftHelper.getDiscussionAuthorMessages(author_id, discussion_id, function(messages){
            buildMessages(messages);
        });
        
        // Get all the authors related to the discussion
        yaftHelper.getDiscussionAuthorsArray(discussion_id, function(authors){
            updateAuthorNavigation(authors);
        });
    }
    
    /**
     * Updates the breadcrumb for the view authors page
     */
    function updateBreadCrumb(forum, discussion){
         jQuery("a#forumTitle").html(forum.title);
         jQuery("a#forumTitle").attr("href", "viewForum.html?id=" + forum.key);
         jQuery("a#discussionTitle").html(discussion.topic);
         jQuery("a#discussionTitle").attr("href", "viewDiscussion.html?id=" + discussion.key);
         jQuery("a#authorsLink").attr("href", "viewAuthors.html?id=" + discussion.key);
    }
    
    /**
     * Update the author name by using one of the messages a user sent
     * to get the username from
     */
    function updateAuthorName(author){
        var displayName;
        if(author.creator_name){
            displayName = author.creator_name;
        }
        else{
            displayName = author.creator_id;
        }
        
        jQuery("span#authorName").html(displayName);
        jQuery("b#authorName").html(displayName);
    }
    
    /**
     * Updates the author navigation
     */
    function updateAuthorNavigation(authors){
        var prevAuthor;
        var nextAuthor;
        var currentAuthor;
        for(var idx = 0 ; idx < authors.length ; idx++){
            author = authors[idx].creator_id;
            
            // We found the current author 
            if (authors[idx].creator_id == author_id ){
                currentAuthor = authors[idx];
                // try and find the next
                if (idx+1 < authors.length){
                    nextAuthor = authors[idx+1];
                }
                break;
            }
            // It wasn't this author, so it it now the previous author
            else{
                prevAuthor = authors[idx];
            }
        }
        updateAuthorName(currentAuthor);
        
        // Add listener if there is a previous author
        if (prevAuthor){
            jQuery("input[type=button]#yaft_previous_author_button").click(function(){
                window.location="viewAuthorMessages.html?aid="+prevAuthor.creator_id+"&did="+discussion_id;
            });
        }
        
        // Add listerner if there is a newxt author
        if (nextAuthor){
            jQuery("input[type=button]#yaft_next_author_button").click(function(){
                window.location="viewAuthorMessages.html?aid="+nextAuthor.creator_id+"&did="+discussion_id;
            });
        }
    }

    /**
     * Builds the template
     * @param {type} discussions Discussions to display in the table.
     * @returns {undefined}
     */
    function buildMessages(messages){
        var tableTemplate = unipooleUtils.getTemplate('templates/yaft.authorMessage.handlebars');
        
        for(var idx = 0 ; idx < messages.length ; idx++){
            jQuery(tableTemplate(messages[idx])).appendTo('div#messages');
        }
        unipooleUtils.resizeFrame();
    }
    
})(window, jQuery, window.unipooleUtils);

