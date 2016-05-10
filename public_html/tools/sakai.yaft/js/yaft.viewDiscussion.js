(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    var discussion_id;
    var viewing_mini = false;
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(window.document).ready(function() {
        initialise();
    });
    
    /**
     * Initialised the page
     */
    function initialise(){
        discussion_id = unipooleUtils.getURLParameter('id');
        yaftHelper.getDiscussion(discussion_id, function(discussion){
            if (discussion === undefined){
                console.log("Could not find discussion id:" + discussion_id);
                return;
            }else{
                updateBreadCrumb(discussion.forum, discussion);
                createMessages();
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
        jQuery("span#discussionTitle").html(discussion.topic);
        jQuery("ul#yaft_toolbar li#yaft_authors_view_link a").attr("href", "viewAuthors.html?id=" + discussion.key);
    }

    /**
     * Builds the template
     * @param {type} discussions Discussions to display in the table.
     * @returns {undefined}
     */
    function createMessages(){
        var fullMsgTemplate = unipooleUtils.getTemplate('templates/yaft.messageFull.handlebars');
        var miniMsgTemplate = unipooleUtils.getTemplate('templates/yaft.messageMini.handlebars');
        var messageContainer, appendTarget;
        
        // Now add the messages of the discussion
        yaftHelper.getAllMessagesArrayForDiscussion(discussion_id, function(messages){
            for(var idx=0; idx<messages.length ; idx++){
                appendTarget = (idx == 0 ? 'div#discussion' : 'div#yaft_messages');
                
                // Create full message
                messageContainer = createIndentedMessage(messages[idx], fullMsgTemplate);
                messageContainer.appendTo(appendTarget);
                
                // Create mini message
                messageContainer = createIndentedMessage(messages[idx], miniMsgTemplate);
                messageContainer.appendTo(appendTarget);
            }
            jQuery("div[data-yaft-role=message][data-yaft-mini=true]").hide();
        }, true); // Enable sort
        unipooleUtils.resizeFrame();
    }
    
    /**
     * Creates a message indented to the appropriate depth
     */
    function createIndentedMessage(message, messageTemplate){
        var depth = (message.depth === undefined ? 0 : message.depth);
        if (depth > 0){
            var root = $("<div>", {"class" : "yaft_messages"});
            var base = root;
            for(var d=1; d < depth; d++){
                base = $("<div>", {"class" : "yaft_messages"});
                base.appendTo(root);
            }
            jQuery(messageTemplate(message)).appendTo(base);
            return root;
        }else{
            return jQuery(messageTemplate(message));
        }
    }
    
    /**
     * Collapse a message with its children
     * @param {string} ID of the message to collapse
     */
    window.toggleMessage = function(id){
        var num_collapsed = 0; // Number of messages collapsed
        
        // The action we need to take on the selected item
        var shouldCollapse = jQuery("div[data-yaft-role=message]#"+id).attr("data-yaft-collapsed");
        shouldCollapse = (shouldCollapse == "true" ? "false" : "true"); // invert
        
        /**
         * Show or hide an item
         */
        var toogleItem = function(jqItem, hide){
            if (hide == "true"){
                jqItem.hide();
            }
            else{
                jqItem.show();
            }
        };
        
        
        // If the message ID is the discussion ID we need to hide all messages
        if (id == discussion_id){
            toogleItem(jQuery("div[data-yaft-role=message]"),shouldCollapse);

            // Put back the parent message
            toogleItem(jQuery("div[data-yaft-role=message]#"+id), "false");
            num_collapsed = jQuery("div[data-yaft-role=message]").length - 1;
        }
        // Else we need to hide all sub messages
        else{
            var collapseArray = jQuery.makeArray(jQuery("div[data-yaft-role=message][data-yaft-parent="+id+"]"));
            while(collapseArray.length > 0){
                var message = jQuery(collapseArray.shift());
                
                // Find children of this message
                var messages = jQuery("div[data-yaft-role=message][data-yaft-parent="+message.id+"]");
                for(var i = 0 ; i < messages.length ; i++){
                    collapseArray.push(messages[i]);
                }
                // Toggle this message
                toogleItem(message, shouldCollapse);
                num_collapsed++;
            }
        }
        // Make sure the item now shows the correct state
        jQuery("div[data-yaft-role=message]#"+id).attr("data-yaft-collapsed", shouldCollapse);
        
        // Finally we need to change the collapse link to an expand link
        if (shouldCollapse == "true"){
            jQuery("div[data-yaft-role=message]#"+id +" a.yaft_collapse_expand_link").html("Expand (" + num_collapsed + ")");
        }
        else{
            jQuery("div[data-yaft-role=message]#"+id +" a.yaft_collapse_expand_link").html("Collapse");
        }
    };
    
    
    /**
     * Resets a full message to the uncollapsed state
     */
    function resetFullMessageCollapseStatus(){
        jQuery("div[data-yaft-role=message] a.yaft_collapse_expand_link").html("Collapse");
    }
    
    /**
     * Function to toggle to mini version
     */
    window.yaftToggleMini = function(){
        resetFullMessageCollapseStatus();
        
        if (viewing_mini){
            // Show all the full messages
            jQuery("div[data-yaft-role=message][data-yaft-mini=false]").show();
            // Hide all the mini messages
            jQuery("div[data-yaft-role=message][data-yaft-mini=true]").hide();
            jQuery("li#yaft_minimal_link a").html("Minimal");
        }else{
            window.yaftShowMessage(discussion_id);
            jQuery("li#yaft_minimal_link a").html("Full");
        }
        
        // Toggle current mini viewing
        viewing_mini = !viewing_mini;
    };
    
    /**
     * Shows an specific (mini) message
     */
    window.yaftShowMessage = function(id){
        // Show all minis
        jQuery("div[data-yaft-role=message][data-yaft-mini=true]").show();
        // Hide all full
        jQuery("div[data-yaft-role=message][data-yaft-mini=false]").hide();
        // Show item full
        jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id).show();
        // Hide item mini
        jQuery("div[data-yaft-role=message][data-yaft-mini=true]#"+id+"_link").hide();
    };
    
    /**
     * Marks a message as read
     */
    window.yaftMarkAsRead = function (id){
    	yaftHelper.markMessageAsRead(id, function(){
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " > div").removeClass("yaft_unread_wrapper");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " > div").addClass("yaft_read_wrapper");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " a#readLink").attr("href", "javascript:yaftMarkAsUnread('"+ id +"');");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " a#readLink").html("Mark As Unread");
    	});
    };
    
    /**
     * Marks a message as read
     */
    window.yaftMarkAsUnread = function (id){
    	yaftHelper.markMessageAsRead(id, function(){
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " > div").removeClass("yaft_read_wrapper");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " > div").addClass("yaft_unread_wrapper");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " a#readLink").attr("href", "javascript:yaftMarkAsRead('"+ id +"');");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false]#"+id + " a#readLink").html("Mark As Read");
    	}, false);
    };
    
    /**
     * Marks all messages as read
     */
    window.yaftMarkAllAsRead = function(){
    	yaftHelper.markAllMessagesAsRead(discussion_id, function(){
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false] > div").removeClass("yaft_unread_wrapper");
    		jQuery("div[data-yaft-role=message][data-yaft-mini=false] > div").addClass("yaft_read_wrapper");
    		
    		// Get all the mark as read items and find the correct parent to get the id of the message
    		jQuery("a#readLink").each(function(index, element){
    			var id = $(element).parents("div[data-yaft-role=message][data-yaft-mini=false]").attr("id");
    			$(element).attr("href", "javascript:yaftMarkAsUnread('"+ id +"');");
    			$(element).html("Mark As Unread");
    		});
    		
    	});
    };
    
    /**
     * Function to edit a message
     */
    window.yaftEditMessage = function(id){
    	// TODO if the message is a discussion, rather go to the edit discussion page
    	yaftHelper.getMessage(id, function(message){
    		if(message.discussion_id == message.id){
    			window.location="createTopic.html?edit=yes&id="+id;
    		}
    		else{
    			window.location="replyMessage.html?edit=yes&mid="+id;
    		}
    	});
    };
    
})(window, jQuery, window.unipooleUtils);

