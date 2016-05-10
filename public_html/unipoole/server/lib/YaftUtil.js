var dat = require('./dat');
var YAFT_TOOL = "sakai.yaft";
/**
 * Constructor
 * @returns
 */
function YaftUtil(){}

/**
 * Gets the attachment files for yaft
 */
YaftUtil.prototype.getAttachmentFiles = function(contentData){
    var funcGetAttachments = function(attachArray){
        if (attachArray === undefined || attachArray == null){
            return [];
        }
        var filesArray = [];
        for (var i = 0; i < attachArray.length; i++) {
            var downloadDetail = {};
            downloadDetail.downloadKey = attachArray[i].downloadKey;
            downloadDetail.file = attachArray[i].downloadPath;
            filesArray.push(downloadDetail);
        }
        return filesArray;
    };
    
    var filesToDownload = [];
    for (var forumKey in contentData) {
        var forum = contentData[forumKey];
        
        // Now loop through all the discussions
        var discussions = forum.discussions;
        for(var discussionKey in discussions){
            var discussion = discussions[discussionKey];
            filesToDownload = filesToDownload.concat(funcGetAttachments(discussion.attachments));
            
            // Now loop through all the messages
            var messages = discussion.messages;
            for(var messageKey in messages){
                var message = messages[messageKey];
                filesToDownload = filesToDownload.concat(funcGetAttachments(message.attachments));
            }
        }
    }
    return filesToDownload;
};

/**
 * Remove the deleted content from the yaft tool's data file.
 * When yaft does a sync, forums, discussions and messages will have a 
 * status of "DELETED" when it has been removed. These entries will be
 * deleted from the data file for the tool.
 */
YaftUtil.prototype.deleteRemovedContent = function(downloadedData, callback){
    dat.readToolData(YAFT_TOOL, function(currentContent){
        for (var forumKey in downloadedData) {
            var forum = downloadedData[forumKey];
            
            if(forum.status == "DELETED"){
                delete currentContent[forumKey];
                delete downloadedData[forumKey];
                
                /*
                 * If we deleted a forum we don't need to check for discussion and messages
                 * because the entire forum will be removed.
                 */
                continue;
            }
            
            
            // Now loop through all the discussions
            var discussions = forum.discussions;
            for(var discussionKey in discussions){
                var discussion = discussions[discussionKey];
                
                // Delete the discussion
                if (discussion.status == "DELETED" && currentContent[forumKey]){
                    delete currentContent[forumKey].discussions[discussionKey];
                    delete downloadedData[forumKey].discussions[discussionKey];
                    
                    /*
                     * If we deleted a discussion we don't need to check for messages
                     * because the entire discussion with its messages will be removed
                     */
                    continue;
                }
                
                // Now loop through all the messages
                var messages = discussion.messages;
                for(var messageKey in messages){
                    var message = messages[messageKey];
                    
                    // Delete the message
                    if (message.status == "DELETED" && currentContent[forumKey] 
                            && currentContent[forumKey].discussions[discussionKey]){
                        delete currentContent[forumKey].discussions[discussionKey].messages[messageKey];
                        delete downloadedData[forumKey].discussions[discussionKey].messages[messageKey];
                        continue;
                    }
                }
            }
        }
        // Write the new content (with content deleted) to the data file
        dat.writeToolData(YAFT_TOOL, currentContent, function(){
            callback();
        })
    });
};

module.exports = new YaftUtil();