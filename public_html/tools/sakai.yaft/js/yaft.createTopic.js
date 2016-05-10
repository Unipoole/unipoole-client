(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = window.yaftHelper;
    var forum_id;
    var discussion_id;
    
    /**
     * Invoked when the page is ready just before it is shown
     */
    jQuery(document).ready(function() {
       
        
		jQuery("textarea#yaft_discussion_editor").ckeditor(
				function(event){
                    unipooleUtils.resizeFrame();
                },
                {
                    "customConfig" : "/unipoole/js/ckeditor/ckeditor.launch.js" 
                });
		 initialise();
    });
    
    /**
     * Initialise this page.
     */
    function initialise(){
    	var id = unipooleUtils.getURLParameter('id');
    	var edit = (unipooleUtils.getURLParameter('edit') ? unipooleUtils.getURLParameter('edit') == "yes" : false);
    	
    	// We are editing an existing discussion
    	if(edit){
    		discussion_id = id;
    		yaftHelper.getDiscussion(discussion_id, function(discussion){
    			forum_id = discussion.forum_id;
    			updateBreadCrumb(forum_id);
    			// Set the content in the editors
    			jQuery("textarea#yaft_discussion_editor").val(discussion.content);
    			jQuery("input#yaft_subject_field").val(discussion.topic);
    		});
    		
    	}
    	// We are creating a new discussion
    	else{
    		forum_id = id;
    		updateBreadCrumb(forum_id);
    	}
    }
    
    /**
     * Update the forum title on the page
     * @param {type} forum The forum object
     * @returns {undefined}
     */
    function updateBreadCrumb(forum_id){
    	 yaftHelper.getForum(forum_id, function(forum){
             if (forum === undefined){
                 console.log("Could not find forum id:" + forum_id);
                 return;
             }else{
            	 jQuery("a#forumTitle").html(forum.title);
                 jQuery("a#forumTitle").attr("href", "viewForum.html?id=" + forum.key);
             }
         });
    }
    
    /**
     * Validates that the form is valid.
     * Returns true if the form is valid
     */
    function validateForm(){
    	var valid = true;
    	var topic = jQuery("input#yaft_subject_field").val();
    	var content = jQuery("textarea#yaft_discussion_editor").val();
    	
    	if (topic.length < 4){
    		alert("You must supply a subject of at least 4 characters");
    		valid = false;
    	}
    	else if (content.length < 1){
    		alert("You must specify a message.");
    		valid = false;
    	}
    	return valid;
    }
    
    
    /**
     * Function to create the topic
     */
    window.yaftCreateTopic = function(){
    	if(validateForm()){
	        var content = jQuery("textarea#yaft_discussion_editor").val();
	        var now = moment().toISOString();
	        var id = (discussion_id ? discussion_id : unipooleUtils.generateUUID());
	        var newMessage = {
	                    "id": id,
	                    "topic": jQuery("input#yaft_subject_field").val(),
	                    "content": jQuery("textarea#yaft_discussion_editor").val(),
	                    "forum_id": forum_id,
	                    "creator_name": window.parent.UNIPOOLE_GLOBAL.unipooleData.username,
	                    "creator_id": window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id,
	                    "create_date": now,
	                    "page_id": "",
	                    "site_id": window.parent.UNIPOOLE_GLOBAL.unipooleData.moduleId,
	                    "last_message_date": now
	        };
	        
	        yaftHelper.createDiscussion(newMessage, function(){
	            window.location="viewDiscussion.html?id="+id;
	        });
    	}
    };
    
    /**
     * Function to cancel creating the topic
     */
    window.yaftCancel = function(){
        window.location="viewForum.html?id="+forum_id;
    };
})(window, jQuery, window.unipooleUtils);

