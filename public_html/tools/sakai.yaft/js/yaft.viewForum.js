(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    
	Handlebars.registerHelper('messageCount', function(forum) {
       return getMessageCountForDiscussion(forum);
    });
	
	Handlebars.registerHelper('unreadCount', function(forum) {
       return getUnreadMessageCountForDiscussion(forum);
    });
	
	Handlebars.registerHelper('lastMessage', function(forum) {
       return getLastMessageDateForDiscussion(forum);
    });
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(document).ready(function() {
        initialise();
    });
    
    function initialise(){
        var forum_id = unipooleUtils.getURLParameter('id');
        yaftHelper.getForum(forum_id, function(forum){
            if (forum === undefined){
                // TODO warn forum not found
                console.log("Could not find forum id:" + forum_id);
                return;
            }else{
                updateBreadCrumb(forum);
                loadTable(forum.discussions);
                jQuery("a#createTopicLink").attr("href", "createTopic.html?id=" + forum.key);
            }
        });
    }
    
    /**
     * Update the forum title on the page
     * @param {type} forum The forum object
     * @returns {undefined}
     */
    function updateBreadCrumb(forum){
        jQuery("span#forumTitle").html(forum.title);
    }

    /**
     * Builds the template
     * @param {type} discussions Discussions to display in the table.
     * @returns {undefined}
     */
    function loadTable(discussions){
        var tableTemplate = unipooleUtils.getTemplate('templates/yaft.discussionsTable.handlebars');
        jQuery(tableTemplate(discussions)).appendTo('div#tableContainer');
        
        jQuery.fn.dataTableExt.oJUIClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
        jQuery.fn.dataTableExt.oJUIClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
        jQuery.fn.dataTableExt.oStdClasses.sSortAsc = "yaftSortableTableHeaderSortUp";
        jQuery.fn.dataTableExt.oStdClasses.sSortDesc = "yaftSortableTableHeaderSortDown";
        
        jQuery('table#yaft_forum_table').dataTable({
                "fnDrawCallback": function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                },
                "iDisplayLength": -1, // Show all
                "aaSorting" : [[0, 'asc']],
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
    }
    
    
    function getMessageCountForDiscussion(discussion){
    	if(!discussion.messages){
    		return 1;
    	}
    	var discussionArray = yaftHelper.objectToArray(discussion.messages);
    	return discussionArray.length + 1;
    }
    
    function getUnreadMessageCountForDiscussion(discussion){
    	var unreadMessageCount = 0;
		if(discussion.messages){
			var messageArray = yaftHelper.objectToArray(discussion.messages);
			for(var idx2 = 0 ; idx2 < messageArray.length ; idx2++){
				/**
				 * If the current user is the creator of a message, it does not count
				 * as unread.
				 */
				if (messageArray[idx2].creator_id == window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id){
					continue;
				}
				/**
				 * If the message doesnt have a read flag, it is unread
				 */
				else if(! messageArray[idx2].read){
					unreadMessageCount++;
				}
				/**
				 * The message does have a read flag, but is it set to yes?
				 */
				else if (messageArray[idx2].read != "yes"){
					unreadMessageCount++;
				}
			}
    	}
    	return unreadMessageCount;
    }
    
    function getLastMessageDateForDiscussion(discussion){
    	var latestMessage = moment(discussion.create_date);
		if(discussion.messages){
			var messageArray = yaftHelper.objectToArray(discussion.messages);
			for(var idx2 = 0 ; idx2 < messageArray.length ; idx2++){
				var messageMoment = moment(messageArray[idx2].create_date);
				if (latestMessage == null || messageMoment.isAfter(latestMessage)){
					latestMessage = messageMoment;
				}
			}
		}
    	return latestMessage.format("YYYY MMM DD @ HH:mm");
    }
    
})(window, jQuery, window.unipooleUtils);

