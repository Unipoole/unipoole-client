(function(window, jQuery, unipooleUtils){
    
    var yaftHelper = new YaftHelper();
    
    var cacheAllMessagesArray = null;      // Cache of ALL messages in yaft in an Array
    var cacheAllMessagesMap = null;        // Cache of ALL messages in yaft in a Map
    var cacheAllForumsArray = null;        // Cache of ALL Forums in yaft in an Array
    var cacheAllDiscussionsArray = null;   // Cache of ALL Discussion in yaft in an Array
    
    /**
     * Constructor
     * @returns {undefined}
     */
    function YaftHelper(){
        this.initialised = false;
        this.hasUploadData = false;
    }
    
    
    /**
     * Initialised this YaftHelper
     * @param {type} callback Callback when initialisation is complete
     * @returns {unresolved}
     */
    YaftHelper.prototype.initialise = function(callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.initialise()");
             return;
        }
        
        // Do we need to worry about async here?
        if(this.initialised === true){
            callback(this.data);
            return;
        }
        var yaft = this;
        var theData;
        jQuery.getJSON('data/yaft.json', function(data) {
        	theData = data;
        	 jQuery.getJSON('data/yaft.upload.json', function(uploadData){
        		 yaft.initialised = true;
        		 yaft.data = jQuery.extend(true,{}, theData, uploadData);
        		 yaft.hasUploadData = true;
        	 }).fail(function( jqxhr, textStatus, error ) {
        		if(jqxhr.status != 404){
        			console.log("Failed to load yaft.upload.json");
        		}else{
        			// There was a 404 but it is fine, we are initialised
        			yaft.initialised = true;
        		}
        		yaft.data = theData;
        	 }).always(function(){
        		 callback(yaft.data);
        	 });
        });
    };
    
    
    /**
     * Gets all the available forums in an array
     */
    YaftHelper.prototype.getAllForumsArray = function(callback){
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllForumsArray()");
             return;
        }
        
        var yaftHelper = this;
        
        // If we have a cache, use that
        if(yaftHelper.cacheAllForumsArray != null){
            callback(yaftHelper.cacheAllForumsArray);
            return;
        }
        
        this.getAllForumsMap(function(forums){
            var array = objectToArray(forums);
            yaftHelper.cacheAllForumsArray = array;
            callback(yaftHelper.cacheAllForumsArray);
        });
    };
    
    
    /**
     * Gets ALL the discussions in an array
     */
    YaftHelper.prototype.getAllDiscussionsArray = function(callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllDiscussionsArray()");
             return;
        }
        
        var yaftHelper = this;
        
        // If we have a cache, use that
        if (yaftHelper.cacheAllDiscussionsArray != null){
            callback(yaftHelper.cacheAllDiscussionsArray);
            return;
        }
        
        this.getAllForumsArray(function(forums){
            var discussionsArray = [];
            
            for(var idx = 0 ; idx < forums.length ; idx++){
                if (forums[idx].discussions){
                    var forumDiscussion = objectToArray(forums[idx].discussions, false);
                    discussionsArray = discussionsArray.concat(forumDiscussion);
                }
            }
            yaftHelper.cacheAllDiscussionsArray = discussionsArray;
            callback(yaftHelper.cacheAllDiscussionsArray);
        });
    };
    
    
    /**
     * Gets ALL the available messages and returns them in a map
     */
    YaftHelper.prototype.getAllMessagesMap = function(callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllMessagesMap()");
             return;
        }
        
        var yaftHelper = this;
        
        // If we have a cache, use that
        if (yaftHelper.cacheAllMessagesMap != null){
            callback(yaftHelper.cacheAllMessagesMap);
            return;
        }
        
        this.getAllMessagesArray(function(messages){
            var map = arrayToMap(messages, "id");
            yaftHelper.cacheAllMessagesMap = map;
            callback(map);
        });
    };
    
    
    /**
     * Function to get ALL messages in an array
     */
    YaftHelper.prototype.getAllMessagesArray = function(callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllMessagesArray()");
             return;
        }
        
        var yaftHelper = this;
        
        // If we have a cache, use that
        if(yaftHelper.cacheAllMessagesArray != null){
            callback(yaftHelper.cacheAllMessagesArray);
            return;
        }
        
        
        this.getAllDiscussionsArray(function(discussions){
            var messagesArray = [];
            var idx = 0;
            
            // Callback function for when messages are retrieved
            var funcGotMessages = function (messages){
                // add to array
                messagesArray = messagesArray.concat(messages);
                idx++;
                //call continue function
                funcContinue();
            };
            
            // Function to continue looping through the discussions
            var funcContinue = function(){
                // If there are more discussions to go through
                if(idx < discussions.length){
                    yaftHelper.getAllMessagesArrayForDiscussion(discussions[idx].id, funcGotMessages);
                }
                // We have gone through all the discussions
                else{
                    yaftHelper.cacheAllMessagesArray = messagesArray;
                    callback(yaftHelper.cacheAllMessagesArray);
                }
            };
            funcContinue(); // Start the looping
        });
    };
    
    
    /**
     * Gets all the forums
     * {param} updateStats - True if you require the stats to be up to date
     */
    YaftHelper.prototype.getAllForumsMap = function(callback){
    	
    	// Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllForumsMap()");
             return;
        }
        var yaft = this;
        this.initialise(function(forums){
            callback(forums);
        });
    };
    
    function updateForumStats(forum, callback){
    	var discussions = forum.discussions ? forum.discussions.length : 0;
    	
    	
    }
    
    /**
     * Function to get a forum by id
     * @param {type} id ID of the forum to find
     * @param {type} callback Callback which will be called with the forum object
     * @returns {undefined}
     */
    YaftHelper.prototype.getForum = function(id, callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getForum()");
             return;
        }
        
        this.initialise(function(forums){
            var forum = forums[id];
            forum.key = id; // TODO do we still need the key?
            callback(forum);
        });
    };
    
    
    /**
     * Function to get a discussion by id.
     * For this function we loop through all the available forums and all the discussions
     * inside each forum until we find the required discussion.
     * @param {type} id ID of the discussion to find
     * @param {type} callback Callback which will be called with the forum object
     * @returns {undefined}
     */
    YaftHelper.prototype.getDiscussion = function(id, callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getDiscussion()");
             return;
        }
        
        this.getAllForumsArray(function(forumsArray){
            /*
             * Now that we have an array of forums, we can check each if 
             * it has the discussion ID we require
             */
            var discussion = undefined;
            if (forumsArray !== undefined){
                for(var idx = 0 ; idx < forumsArray.length ; idx++){
                    var forum = forumsArray[idx];
                    
                    // If this forum has no discussion, continue to next
                    if (forum.discussions === undefined){
                        continue;
                    }
                    
                    // Test if there is a discussion with the specified ID
                    discussion = forum.discussions[id];
                    if (discussion !== undefined){
                        
                        // set the forum parent object on the discussion
                        discussion.forum = forum;
                        discussion.forum_id = forum.id;
                        discussion.key = id;// TODO do we still need the key?
                        break;
                    }
                }
            }
            
            callback(discussion);
        });
    };
    
    
    /**
     * Gets the messages for the provided discussion id.
     */
    // TODO THIS METHOD IS NOT USED OUTSIDE - SCOPE SHOULD BE CHANGED
    YaftHelper.prototype.getMessagesForDiscussion = function(id, callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getMessagesForDiscussion()");
             return;
        }
        
        this.getDiscussion(id, function(discussion){
            // If we could not find the discussion return undefined
            if (discussion === undefined || discussion.messages === undefined){
                callback([]);
                return;
            }
            
            var msgs = objectToArray(discussion.messages);
            // Set the forum_id on all messages
            for(var idx = 0 ; idx < msgs.length ; idx++){
                msgs[idx].forum_id = discussion.forum_id;
            }
            callback(msgs);
        });
    };

    
    /**
     * Gets all of the messages for a discussion, including the discussion itself
     */
    YaftHelper.prototype.getAllMessagesArrayForDiscussion = function(id, callback, sort){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getAllMessagesArrayForDiscussion()");
             return;
        }
        
        yaftHelper.getDiscussion(id, function(discussion){
            var allMessages = [];
            allMessages[0] = getDiscussionMessage(discussion);
            yaftHelper.getMessagesForDiscussion(id, function(messages){
                allMessages = allMessages.concat(messages);
                if (sort){
                    allMessages = sortMessagesWithChildren(allMessages);
                }
                callback(allMessages);
            });
        });
    };
    
    
    /**
     * Gets the authors
     */
    YaftHelper.prototype.getDiscussionAuthors = function(id, callback){
        
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getDiscussionAuthors()");
             return;
        }
        
        this.getAllMessagesArrayForDiscussion(id, function(messages){
            var authors = {};
            
            for(var idx = 0 ; idx < messages.length ; idx++){
                var authorId = messages[idx].creator_id;
                
                // Create author if it does not exist
                if (authors[authorId] === undefined){
                    authors[authorId] = {
                        "creator_name" : messages[idx].creator_name,
                        "creator_id" : messages[idx].creator_id,
                        "discussion_id": id,
                        "messages" : 0
                    };
                }
                // Increment no messages
                authors[authorId].messages++;
            }
            callback(authors);
        });
    };
    
    
    /**
     * Gets the authors of a discussion, returning them in an array
     */
    YaftHelper.prototype.getDiscussionAuthorsArray = function(id, callback){
        this.getDiscussionAuthors(id, function(authors){
            var authorArray = objectToArray(authors, false);
            authorArray = authorArray.sort();
            callback(authorArray);
        });
    };
    
    
    /**
     * Gets the messages an author wrote on a discussion
     */
    YaftHelper.prototype.getDiscussionAuthorMessages = function(author_id, discussion_id, callback){
        this.getAllMessagesArrayForDiscussion(discussion_id, function(messages){
            var author_messages = [];
            for(var idx = 0 ; idx < messages.length ; idx++){
                if(messages[idx].creator_id == author_id){
                    author_messages.push(messages[idx]);
                }
            }
            author_messages = sortMessagesByDate(author_messages);
            callback(author_messages);
        });
    };
    
    /**
     * Function to create a new discussion
     */
    YaftHelper.prototype.createDiscussion = function(discussion, callback){
    	
    	// Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.createDiscussion()");
             return;
        }
        
        var data = {};
        data[discussion.forum_id] = {};
        data[discussion.forum_id].discussions = {};
        data[discussion.forum_id].discussions[discussion.id] = discussion;
        
    	// TODO update parent objects
        
        updateUploadFile(data, function(){
        	callback();
        });
        
    };
    
    /**
     * Create a message in a discussion
     */
    YaftHelper.prototype.createMessage = function(message, callback){
    	
    	// Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.createDiscussion()");
             return;
        }
        var data = {};
        getMessageParents(message, function(parents){
        	data[parents.forum_id] = {};
        	var forum = data[parents.forum_id];
        	forum.discussions = {};
        	forum.discussions[parents.discussion_id] = {};
        	var discussion = forum.discussions[parents.discussion_id];
        	discussion.messages = {};
        	discussion.messages[message.id] = message;
        	
        	// TODO update parent objects
        	
        	 updateUploadFile(data, function(){
             	callback();
             });
        });
    };
    
    
    /**
     * Gets a message with the specified ID
     */
    YaftHelper.prototype.getMessage = function(message_id, callback){
        // Make sure a callback is passed
        if (typeof (callback) !== 'function'){
             console.log("You did not specify a callback for function : YaftHelper.getMessage()");
             return;
        }
        
        this.getAllMessagesMap(function(messagesMap){
            var message = messagesMap[message_id];
            callback(message);
        });
    };

    /**
     * Marks a message as read
     */
    YaftHelper.prototype.markMessageAsRead = function(message_id, callback, read){
    	var yaft = this;
    	var markAsRead = "yes";
    	if(read !== undefined){
    		markAsRead = (read ? "yes" : "no");
    	}
    	
    	getMessageParents(message_id, function(parents){
    		try{
    			var data = {};
    			var isDiscussion = message_id == parents.discussion_id; // Flag if this message is a discussion
    			
    			data[parents.forum_id] = {};
    			data[parents.forum_id].discussions = {};
    			if (isDiscussion){
    				data[parents.forum_id].discussions[parents.discussion_id] = {"read" : markAsRead};
    			}else{
    				data[parents.forum_id].discussions[parents.discussion_id] = {};
    				data[parents.forum_id].discussions[parents.discussion_id].messages = {};
        			data[parents.forum_id].discussions[parents.discussion_id].messages[message_id] = {"read" : markAsRead};
    			}
    			
    			updateDataFile(data, callback);
    		}catch(e){
    			console.log("Error while trying to mark message as read : " + e);
    		}
    	});
    };
    
    /**
     * Marks all messages in a discussion as read
     */
    YaftHelper.prototype.markAllMessagesAsRead = function(discussion_id, callback){
    	var yaft = this;
    	var messagesArray;
    	
    	var markMessagesAsRead = function(){
    		if (messagesArray.length > 0){
    			var message = messagesArray.pop();
    			yaft.markMessageAsRead(message.id, markMessagesAsRead);
    		}
    		else{
    			callback();
    		}
    	};
    	
    	this.getAllMessagesArrayForDiscussion(discussion_id, function(messages){
    		messagesArray = messages;
    		markMessagesAsRead();
    	}, false);
    };
    
    /**
     * Sorts messages by date
     */
    function sortMessagesByDate(messages){
        // Fist sort by date
        messages = messages.sort(function(message1, message2){
            var moment1 = moment(message1.create_date);
            var moment2 = moment(message2.create_date);

            // Message 1 is created before message 2
            if (moment1.isBefore(moment2)){
                return -1;
            }
            // Message 1 is created after message 2
            else if (moment1.isAfter(moment2)){
                return 1;
            }
            // Message 1 is created at the exact same moment as message 2
            else{
                return 0; 
            }
            
        });
        return messages;
    }
    
    
    /**
     * Function to sort all the messages by date and children.
     * At the end of this function an array will by returned which
     * contains the elements in the order of parent and children.
     */
    function sortMessagesWithChildren(messages){
        var returnArray = [];
        
        // First get all in the correct date order
        messages = sortMessagesByDate(messages);
        
        // Now sort the children properly
        var funcFindChildren = function(parent_id){
            var idx = 0;
            while(idx < messages.length){
                
                if(messages[idx].parent == parent_id){
                    var message = messages[idx];
                    
                    // Add to return array
                    returnArray.push(message);
                    
                    // Remove from original array
                    messages.splice(idx,1);
                    
                    // Now find children of this message
                    funcFindChildren(message.id);
                    
                    idx = 0; // From start
                }
                else{
                    idx++;
                }
            }
        };
        funcFindChildren(0);
        return returnArray;
    }
    
    
    /**
     * Creates a message entry from a discussion
     */
    function getDiscussionMessage(discussion){
        return {
            "key": discussion.id,
            "id": discussion.id,
            "topic": discussion.topic,
            "read": discussion.read,
            "content": discussion.content,
            "depth": 0, // Always 0 for discussion message
            "url": discussion.url,
            "parent": "0", // Always 0 for discussion message
            "status": null,
            "attachments": null, // Discussions can not have attachements
            "create_date": discussion.create_date,
            "creator_name": discussion.creator_name,
            "creator_id": discussion.creator_id,
            "discussion_id": discussion.id,
            "forum_id": discussion.forum_id,
            "group_size": 0,// Always 0 for discussion message
            "site_id": discussion.site_id,
            "attachment_count": 0,
            "reply_count": 0
        };
    }
    
    /**
     * Converts a key - value object to an array of objects
     * also setting the "key" attribute of the object
     */
    function objectToArray(object, addKey){
    	if (object === undefined){
    		return [];
    	}
    	
        var shouldAddKey = true;
        if (addKey !== undefined){
            shouldAddKey = addKey;
        }
        
        var array = [];
        var idx = 0;
        jQuery.each(object, function(key, value) {
            array[idx] = value;
            if (shouldAddKey){
                array[idx].key = key;
            }
            idx++;
        });
        return array;
    };
    YaftHelper.prototype.objectToArray = objectToArray;
    
    /**
     * Convert and array to a map using the specified
     * keyField as the key of the map
     */
    function arrayToMap(array, keyField){
        var map = {};
        var item;
        var key;
        for(var idx = 0 ; idx < array.length ; idx++){
            item = array[idx];
            key = item[keyField];
            map[key] = item;
        }
        return map;
    }
    
    /**
     * Gets the data structure parents of a message
     */
    function getMessageParents(messageOrId, callback){
    	
    	var buildParents = function(message){
    		var parents = {
    	    		"message_id" : message.id,
    	    		"discussion_id" : message.discussion_id
    	    	};
    	    	yaftHelper.getDiscussion(message.discussion_id, function(discussion){
    	    		parents.forum_id = discussion.forum_id;
    	    		callback(parents);
    	    	});
    	};
    	
    	// User passed the message Object
    	if(typeof(messageOrId) == "object"){
    		buildParents(messageOrId);
    	}
    	// User passed the ID of the message
    	else{
    		yaftHelper.getMessage(messageOrId, function(message){
    			buildParents(message);
    		});
    	}
    }
    
    /**
     * Updates the Yaft upload file
     */
    function updateUploadFile(data, callback){
    	 // Method form utilities
    	unipooleUtils.updateFile("tools/sakai.yaft/data/yaft.upload.json", data, callback, false, "/");
    }
    
    /**
     * Update the standard Yaft data file
     */
    function updateDataFile(data, callback){
    	 // Method form utilities
    	unipooleUtils.updateFile("tools/sakai.yaft/data/yaft.json", data, callback, false, "/");
    }
    // Attach the yaft helper to the window
    window.yaftHelper = yaftHelper;
})(window, jQuery, window.unipooleUtils);
