(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    
    var forum_id;
    var discussion_id;
    var replyingToMessage;
    var message_id; // ID of the message being created/edited
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(document).ready(function() {
        initialise();
        
        jQuery("form#yaft_discussion_form").submit(function(){
            return yaftSubmitMessage();
        });
        
        jQuery("textarea#yaft_discussion_editor").ckeditor(
        function(event){
            unipooleUtils.resizeFrame();
        },
        {
            "customConfig" : "/unipoole/js/ckeditor/ckeditor.launch.js" 
        });
    });
    
    /**
     * Initialise this page
     */
    function initialise(){
    	// TODO if param edit == "yes" we are editing an existing message
    	var edit = (unipooleUtils.getURLParameter('edit') ? unipooleUtils.getURLParameter('edit') == "yes" : false);
    	var mid = unipooleUtils.getURLParameter('mid');
    	if (edit){
    		message_id = mid;
    		// get the message you are editing
            yaftHelper.getMessage(mid, function(message){
            	jQuery("textarea#yaft_discussion_editor").val(message.content);
            	jQuery("input#yaft_subject_field").val(message.topic);
            	
            	// Get the replying to message
            	getReplyingToMessage(message.parent);
            });
    	}
    	else{
    		getReplyingToMessage(mid);
    	}
    }
    
    function getReplyingToMessage(message_id){
    	 yaftHelper.getMessage(message_id, function(message){
         	replyingToMessage = message;
             forum_id = replyingToMessage.forum_id;
             discussion_id = replyingToMessage.discussion_id;
             
             updateMessageBox(replyingToMessage);
             updateReplySubject();
             jQuery("span#replyingTo").html(replyingToMessage.topic);
             
             // Get the Forum
             yaftHelper.getForum(forum_id, function(forum){
                 jQuery("a#forumTitle").html(forum.title);
             });
             
             // Get the discussion
             yaftHelper.getDiscussion(discussion_id, function(discussion){
                 jQuery("a#discussionTitle").html(discussion.topic);
             });
             
         });
    }
    
    /**
     * Update the reply message subject
     */
    function updateReplySubject(){
    	var topic = replyingToMessage.topic;
        if (topic.indexOf("Re:") < 0){
        	topic = "Re: " + topic;
        }
        jQuery("input#yaft_subject_field").attr("value", topic);
    }
    
    /**
     * Update the box that displays the message you are replying on
     */
    function updateMessageBox(message){
        var messageTemplate = unipooleUtils.getTemplate('templates/yaft.replyMessage.handlebars');
        jQuery(messageTemplate(message)).appendTo('div#messagePlaceholder');
    }
    
    /**
     * Function to view the discussion
     */
    window.yaftViewDiscussion = function(){
        window.location="viewDiscussion.html?id="+discussion_id;
    };
    
    /**
     * Function to view the forum
     */
    window.yaftViewForum = function(){
        window.location="viewForum.html?id="+forum_id;
    };
    
    /**
     * Function to validate the form.
     * Returns true if the form is valid
     */
    function validateForm(){
    	var valid = true;
    	var subject = jQuery("input#yaft_subject_field").val();
    	var content = jQuery("textarea#yaft_discussion_editor").val();
    	
    	if (subject.length == 0){
    		var yes = confirm("You didn't add a subject for your message. If you click 'OK' the subject of the message being replied to will be used");
    		if (yes){
    			updateReplySubject();
    		}else{
    			valid = false;
    		}
    	}
    	if (content.length == 0){
    		alert("You must specify a message");
    		valid = false;
    	}
    	
    	return valid;
    }
    
    /**
     * Submit the form
     */
    function yaftSubmitMessage(){
    	if(validateForm()){
	        var now = moment().toISOString();
	        var newMessage = {
	            "id"			: (message_id ? message_id : unipooleUtils.generateUUID()),
	            "topic"			: jQuery("input#yaft_subject_field").val(),
	            "content"		: jQuery("textarea#yaft_discussion_editor").val(),
	            "depth"			: (replyingToMessage.depth+1), // Calculate depth
	            "url"			: null,
	            "parent"		: replyingToMessage.id, // Calculate parent
	            "status"		: "READY",
	            "attachments"	: null,
	            "create_date"	: now,
	            "creator_name"	: window.parent.UNIPOOLE_GLOBAL.unipooleData.username,
	            "creator_id"	: window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id,
	            "discussion_id"	: discussion_id,
	            "group_size"	: 0, // ?
	            "site_id"		: window.parent.UNIPOOLE_GLOBAL.unipooleData.moduleId,
	            "attachment_count": 0,
	            "reply_count"	: 0
	        };
	        yaftHelper.createMessage(newMessage, function(){
	        	window.location="viewDiscussion.html?id="+discussion_id;
	        });
    	}
    };
    
    window.yaftSubmitMessage = yaftSubmitMessage;
    
})(window, jQuery, window.unipooleUtils);

