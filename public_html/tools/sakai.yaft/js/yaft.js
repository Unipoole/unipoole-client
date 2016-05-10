/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function(jQuery, unipooleUtils){
    
	var yaftHelper = window.yaftHelper;
	
	
	Handlebars.registerHelper('messageCount', function(forum) {
       return getMessageCountForForum(forum);
    });
	
	Handlebars.registerHelper('unreadCount', function(forum) {
       return getUnreadMessageCountForForum(forum);
    });
	
	Handlebars.registerHelper('discussionCount', function(forum) {
       return getDiscussionCountForForum(forum);
    });
	
	Handlebars.registerHelper('lastMessage', function(forum) {
       return getLastMessageDateForForum(forum);
    });
	
	
    jQuery(document).ready(function() {
        loadTable();
    });
    
    /**
     * Function to load the Discussion table
     * @returns {undefined}
     */
    function loadTable(){
    	yaftHelper.getAllForumsMap(function(data) {
            
            var tableTemplate = unipooleUtils.getTemplate('templates/yaft.forumsTable.handlebars');
            jQuery(tableTemplate(data)).appendTo('div#yaft_content');
            
            jQuery.fn.dataTableExt.oJUIClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
            jQuery.fn.dataTableExt.oJUIClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
            jQuery.fn.dataTableExt.oStdClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
            jQuery.fn.dataTableExt.oStdClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
            
            jQuery('table#yaft_forum_table').dataTable({
                    "fnDrawCallback": function() {
                        setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                    },
                    aaSorting: [[0, 'asc']],
                    "aoColumnDefs": [
                                   { "aTargets": [ 0 ], "bSortable": true },
                                   { "aTargets": [ 1 ], "bSortable": true },
                                   { "aTargets": [ 2 ], "bSortable": true },
                                   { "aTargets": [ 3 ], "bSortable": true },
                                   { "aTargets": [ 4 ], "bSortable": true },
                                   { "aTargets": [ 5 ], "bSortable": false }
                               ],
                    "sDom": ''
            });
            unipooleUtils.resizeFrame();
        });
    }
    
    
    function getMessageCountForForum(forum){
    	var discussionArray = yaftHelper.objectToArray(forum.discussions);
    	var messageCount = 0;
    	for(var idx = 0 ; idx < discussionArray.length ; idx++){
    		var discussion = discussionArray[idx];
    		messageCount++; // A discussion also counts as a message
    		if(discussion.messages){
    			var messageArray = yaftHelper.objectToArray(discussion.messages);
    			messageCount += messageArray.length;
    		}
    	}
    	return messageCount;
    }
    
    /**
     * Retuns the number of discussions in a forum
     */
    function getDiscussionCountForForum(forum){
    	if(!forum.discussions){
    		return 0;
    	}
    	return yaftHelper.objectToArray(forum.discussions).length;
    }
    
    function getUnreadMessageCountForForum(forum){
    	var discussionArray = yaftHelper.objectToArray(forum.discussions);
    	var unreadMessageCount = 0;
    	
    	function isRead(message){
    		/**
			 * If the current user is the creator of a message, it does not count
			 * as unread.
			 */
			if (message.creator_id == window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id){
				return true;
			}
			/**
			 * If the message doesnt have a read flag, it is unread
			 */
			else if(! message.read){
				return false;
			}
			/**
			 * The message does have a read flag, but is it set to yes?
			 */
			else if (message.read != "yes"){
				return false;
			}
    	}
    	
    	for(var idx = 0 ; idx < discussionArray.length ; idx++){
    		var discussion = discussionArray[idx];
    		
    		// Check the discussion too
    		if(isRead(discussion)){
				unreadMessageCount++;
			}
    		if(discussion.messages){
    			var messageArray = yaftHelper.objectToArray(discussion.messages);
    			for(var idx2 = 0 ; idx2 < messageArray.length ; idx2++){
    				if(isRead(messageArray[idx2])){
    					unreadMessageCount++;
    				}
    			}
    		}
    	}
    	return unreadMessageCount;
    }
    
    function getLastMessageDateForForum(forum){
    	var discussionArray = yaftHelper.objectToArray(forum.discussions);
    	var latestMessage;
    	for(var idx = 0 ; idx < discussionArray.length ; idx++){
    		var messageMoment;
    		var discussion = discussionArray[idx];
    		messageMoment = moment(discussion.create_date);
    		if (latestMessage == null || messageMoment.isAfter(latestMessage)){
				latestMessage = messageMoment;
			}
    		
    		if(discussion.messages){
    			var messageArray = yaftHelper.objectToArray(discussion.messages);
    			for(var idx2 = 0 ; idx2 < messageArray.length ; idx2++){
    				var messageMoment = moment(messageArray[idx2].create_date);
    				if (latestMessage == null || messageMoment.isAfter(latestMessage)){
    					latestMessage = messageMoment;
    				}
    			}
    		}
    	}
    	return latestMessage.format("YYYY MMM DD @ HH:mm");
    }
    
    
})(jQuery, window.unipooleUtils);
