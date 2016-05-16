/**
 * New node file
 */
var fs = require('fs');
var sync = require('./sync');
var dat = require('./dat');
var q = require('q');
var logger = require('./logger');


/** 
 * Create a regex safe string from a string
 * Referring to the table here:
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
 * these characters should be escaped
 * \ ^ $ * + ? . ( ) | { } [ ]
 * These characters only have special meaning inside of brackets
 * they do not need to be escaped, but they MAY be escaped
 * without any adverse effects (to the best of my knowledge and casual testing)
 * : ! , = 
 * my test "~!@#$%^&*(){}[]`/=?+\|-_;:'\",<.>".match(/[\#]/g)
 */
function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * 
 * @param content
 * @param map
 * @param masterSiteId
 * @param groupSiteId
 * @returns
 */
function idReplaceHandler(content, map, masterSiteId, groupSiteId){
	var newContent = {};
	for(var idx in content){
		var contentItemId = content[idx];
		// Use the new ID from the map if there is one
		var newItemId = map[contentItemId] || contentItemId;
		
		// If the new id is the same as the old, then there is no mapping
		if(newItemId == contentItemId){
			continue;
		}
		
		// Add the item as a new item with the new id
		newContent[newItemId] = content[contentItemId];
		
		// Update the id field within the object
		if(newContent[newItemId].id != null){
			newContent[newItemId].id = newItemId;
		}
		
		// Delete the old item
		delete content[contentItemId];
	}
	// Return the new object with the replace Ids
	return newContent;
}

/**
 * 
 * @param content
 * @param map
 * @param masterSiteId
 * @param groupSiteId
 * @returns
 */
function textIdReplaceHandler(content, map, masterSiteId, groupSiteId){
	// Get the tool data as a string
	var dataString = typeof(content) === "string" ? content : JSON.stringify(content, null, 4);
	var keys = Object.keys(map);
	for(var idx in keys){
		// Get the new id
		var oldId = keys[idx];
		var newId = map[oldId];
		
		// Only match master ids that does not follow with the group id suffix
		var regEx = new RegExp(escapeRegExp(oldId), "g");
		
		// Replace tool data using the regex
		dataString = dataString.replace(regEx, newId);
	}
	// Return the new object with the replace Ids
	return dataString;
}

/**
 * Handler that will do a plain test find and replace.
 * It will replace each occurrence of the master site Id with
 * the group site id
 * @param content Content that will be find/replace'd
 * @param map Mapping for content (NOT USED)
 * @param masterId Master id
 * @param groupId Group Id
 * @returns The content where each master id is replaced with the group id
 */
function findReplaceHandler(content, map, masterId, groupId){
	// suffix = AFL105-S1-43T = -43T
	var suffix = groupId.replace(masterId, "");
	
	// Only match master ids that does not follow with the group id suffix
	var regEx = new RegExp(escapeRegExp(masterId) + "(?!" + escapeRegExp(suffix) + ")", "g");
	
	// Get the tool data as a string
	var dataString = typeof(content) === "string" ? content : JSON.stringify(content, null, 4);
	
	// Replace tool data using the regex
	dataString = dataString.replace(regEx, groupId);
	
	// Return this newly fixed data
	return dataString;
}

/**
 * Handler that will rename the data directory for resources
 */
function resourceRenameHandler(content, map, masterId, groupId){
	try {
        // rename data folder
        fs.renameSync("../../tools/sakai.resources/data/" + masterId, "../../tools/sakai.resources/data/" + groupId);
    } catch (renameError) {
        logger.log(renameError, logger.error);
    }
    
    // Return the untouched content
    return content;
}

//Map of tool handlers that take care of id mappings between master and group ids
var mappingHandlers = {};
// Register some handlers
mappingHandlers["sakai.resources"] = [findReplaceHandler, resourceRenameHandler];
mappingHandlers["sakai.melete"] = [idReplaceHandler];
mappingHandlers["sakai.yaft"] = [textIdReplaceHandler];


function fixToolMappings(registerData, data, response){
	var groupSiteId = JSON.parse(registerData).moduleId;
	var masterSiteId = data.moduleId;
	
	var toolIds = Object.keys(data.tools);
	var currentToolId 	= null; // name of the tool we are currently handling
	var toolMappings	= null; // Id mapping for all tools
	var toolVersions	 = null;// New versions to assign to tools
	var currentToolData = null; // Data a tool currently has
	var newToolData 	= null; // The new content a tool will have
	
	
	// Gets a promise to get the data of a tool
	function getToolDataPromise(){
		
		// If there is no mapping we dont need to get data
		// Also if we don't have a handler we can skip this process
		if(toolMappings == null || toolMappings[currentToolId] == null || mappingHandlers[currentToolId] == null){
			currentToolData = null;
			return q.when([]);
		}
		
		var defer = q.defer();
		dat.readToolData(currentToolId, function(toolData){
			currentToolData=toolData;
			defer.resolve(toolData);
		});
		return defer.promise;
	}
	
	// Get a promise to handle the mapping for the tool
	function getHandleMappingPromise(){
		// If there is no tool data, we don't need to do anything
		// Also if there is no content mapping
		if(currentToolData == null || toolMappings == null || toolMappings[currentToolId] == null){
			newToolData = null;
			return q.when([]);
		}
		
		
		var defer = q.defer();
		var handlers = mappingHandlers[currentToolId];
		
		// If there is no handler we use the same data
		if (handlers == null){
			newToolData = currentToolData;
			defer.resolve(newToolData);
		}
		// If there is a handler we will let it handle the mappings
		else{
			// Use each handler
			for(var hIdx = 0 ; hIdx < handlers.length ; hIdx++){
				newToolData = handlers[hIdx](currentToolData, toolMappings[currentToolId], masterSiteId, groupSiteId);
				currentToolData = newToolData;
			}
			defer.resolve(newToolData);
		}
		
		return defer.promise;
	}
	
	/*
	 * Gets a promise to update the tools data
	 * The new data for the tool should now be written back to file
	 */ 
	function getWriteToolDataPromise(){
		var defer = q.defer();
		
		// If there is no new data we don't need to save anything
		if(newToolData == null){
			return q.when([]);
		};
		dat.writeToolData(currentToolId, newToolData, function(){
			defer.resolve(newToolData);
		});
		return defer.promise;
	}

	
	// Return a promise to get the mappings for tools
	function getToolMappingPromise(){
		var defer = q.defer();
		sync.callSyncServer('/unipoole-service/service-synch/contentMappings/'+groupSiteId,
				'POST',
				toolIds,
				response,
				function(responseData, data, mappingsResponse){
					var response = JSON.parse(responseData);
					toolMappings=response.mappings;
					toolVersions=response.versions;
					defer.resolve(toolMappings);
				}
		);
		return defer.promise;
	}
	
	/*
	 * We also need to update the tool versions to the new versions
	 * for the group site id, by getting the first version for each tool
	 * in the group site.
	 */
	function getUpdateToolVersionsPromise(){
		var defer = q.defer();
		
		// If the tool mapping contants versions we need to update too
		if(toolVersions){
			var mergeData = {"toolsLocal" : {}, "tools" : {}};
			var keys = Object.keys(toolVersions);
			
			/*
			 * We now create records that look like this
			 * {
			 *   "toolsLocal" {
			 *      "toolname" : {
			 *         "clientContentVersion" : xxxxxxxxxxxxxxxxx
			 *      },
			 *      "toolname" : {
			 *         "clientContentVersion" : xxxxxxxxxxxxxxxxx
			 *      }
			 *   }
			 * }
			 */
			for(var idx = 0 ; idx < keys.length ; idx++){
				mergeData.toolsLocal[keys[idx]] = {
					"clientContentVersion" : toolVersions[keys[idx]]
				};
				mergeData.tools[keys[idx]] = {
					"clientContentVersion" : toolVersions[keys[idx]]
				};
			}
			// Update the file
			dat.mergeObjectToToolData(mergeData, "client.base",  function(){
				defer.resolve([]);
			});
		}
		// if there is not versions we are done
		else{
			defer.resolve([]);
		}
		return defer.promise;
	}
	
	var index = 0;
	var fixDefer = q.defer();
	function getNextToolFixPromise(){
		if (index < toolIds.length){
			currentToolId = toolIds[index++];
			return getToolDataPromise()
				.then(getHandleMappingPromise)
				.then(getWriteToolDataPromise);
		}
		else{
			return null;
		}
	}
	
	// First get all the mappings for all tools
	getToolMappingPromise()
	// Then start looping through each tool to fix it
	.then(function(){
		return SynthQLoop(getNextToolFixPromise);
	})
	.then(getUpdateToolVersionsPromise)
	// Now resolve
	.then(function(){
		fixDefer.resolve();
	}, function(error){
		fixDefer.reject(error);
	});
	
	return fixDefer.promise;
}


/**
 * Function to loop through promises.
 * @param promiseFunction
 * @returns
 */
function SynthQLoop(promiseFunction){
	var deferred = q.defer();
	function startNewPromise(){
		var newPromise = promiseFunction();
		// If we did not get a new promise, then we are done
		if (newPromise == null){
			deferred.resolve();
		}
		// We got a promise
		else{
			newPromise.then(
				// If the promise resolve, we get the next one
				startNewPromise,
				// If the promise failed, we fail too
				function(reason){
					deferred.reject(reason);
			});
		}
	}
	
	return {
		'then' : function(resolveFunction, errorFunction, statusFunction){
			startNewPromise();
			return deferred.promise.then(resolveFunction, errorFunction, statusFunction);
		}
		
	}
}


/**
 * Function that will intialise this client for a module
 */
exports.intialiseTools = function(registerData, data, response, callback){
	
	// Fix the mappings of the tool
	fixToolMappings(registerData, data, response).then(function(){
		callback();
	}, function(errorMessage){
        logger.log(errorMessage, logger.error);
        var errorReturn = {
            message: errorMessage,
            status: 'EXCEPTION'
        };
        response.send(JSON.stringify(errorReturn));
        response.end();
	});
	
	// Fix the initial version of the content
}