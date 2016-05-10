/**
 * Utility functions for the Unipoole app
 *
 * Dependencies :
 * Handlebars
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleMessage) {

    /**
     * Prefix to add to UUIDs
     */
    var UUID_PREFIX = "UNIPOOLE_";

    /**
     * Constructor
     */
    function UnipooleUtilities() {
    }


    /**
     * Returns the compiled handlebars template 
     * 
     * @param {String} name - the name of the handlebars file in the 
     * unipoole/js/templates/ folder
     * @returns compiled handlebars template
     */
    UnipooleUtilities.prototype.getTemplate = function(name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            jQuery.ajax({
                url: name,
                success: function(data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async: false
            });
        }
        return Handlebars.templates[name];
    };

    /**
     * Gets the value of a parameter on the url of current page
     * 
     * @param {String} name of paramater
     * @returns value of parameter
     */
    UnipooleUtilities.prototype.getURLParameter = function(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    };

    /**
     * Retrieves a object from an array that has a property with a specific value
     * 
     * @param {array} data
     * @param {String} key
     * @param {Object} value
     * @returns {Object}
     */
    UnipooleUtilities.prototype.getArrayItemFromKeyValue = function(data, key, value) {
        for (var i = 0; i < data.length; i++) {
            if (data[i][key] === value) {
                return data[i];
            }
        }
        return null;
    };


    /**
     * For Object.keys compatibility in all browsers we need to add this code before using Object.keys.
     */
    if (!Object.keys)
        Object.keys = function(o) {
            if (o !== Object(o))
                throw new TypeError('Object.keys called on a non-object');
            var k = [], p;
            for (p in o)
                if (Object.prototype.hasOwnProperty.call(o, p))
                    k.push(p);
            return k;
        };

    /**
     * For indexOf compatibility in all browsers we need to add this code before using indexOf.
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var i,
                    pivot = (fromIndex) ? fromIndex : 0,
                    length;

            if (!this) {
                throw new TypeError();
            }

            length = this.length;

            if (length === 0 || pivot >= length) {
                return -1;
            }

            if (pivot < 0) {
                pivot = length - Math.abs(pivot);
            }

            for (i = pivot; i < length; i++) {
                if (this[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        };
    }

    /**
     * Return the value of a property on the next item in an array
     * 
     * The origin item is selected by the key value parameters
     * 
     * @param {type} data
     * @param {type} key
     * @returns {unresolved}
     */
    UnipooleUtilities.prototype.getNextKeyValue = function(data, key) {
        var keys = Object.keys(data), i = keys.indexOf(key);
        return (i !== -1 && i + 1 < keys.length) ? keys[i + 1] : keys[0];
    };

    /**
     * Return the value of a property on the previous item in an array
     * 
     * The origin item is selected by the key value parameters
     * 
     * @param {type} data
     * @param {type} key
     * @returns {unresolved}
     */
    UnipooleUtilities.prototype.getPreviousKeyValue = function(data, key) {
        var keys = Object.keys(data), i = keys.indexOf(key);
        return (i !== -1 && i > 0) ? keys[i - 1] : keys[keys.length - 1];
    };

    /**
     * Updates a file by merging data into current data
     * 
     * @param {String} file - name of file to update
     * @param {Object} data - data to merge into file
     * @param {function} callback
     * @param {boolean} overwrite - if true it overwrites all the data otherwise merges data
     * @param {String} urlPrefix - when the path must be adjusted for insance from tools
     */
    UnipooleUtilities.prototype.updateFile = function(file, data, callback, overwrite) {
        var updateData = {
            file: file,
            data: data,
            overwrite: overwrite
        };

        jQuery.ajax({
            url: "/updateFile",
            data: JSON.stringify(updateData),
            contentType: 'application/json',
            type: "POST",
            success: callback
        }).fail(function(e) {
            console.log(e);
        });
    };

    /**
     * Sets the checked property of enabled checkboxes
     * 
     * @param {boolean} value
     * @param {String} id
     * @param {boolean} wildId - to use contains selector
     */
    UnipooleUtilities.prototype.setCheckboxes = function(value, id, wildId) {
        if (wildId) {
            jQuery('[id*="' + id + '"]:enabled').prop("checked", value);
        } else {
            jQuery('#' + id + ':enabled').prop("checked", value);
        }
        jQuery('[id*="' + id + '"]:enabled').trigger('change');
    };

    /**
     * Convert number of bytes into human readable format
     *
     * @param  bytes     Number of bytes to convert
     * @return string
     */
    UnipooleUtilities.prototype.bytesToSize = function(bytes) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) {
            return 'n/a';
        }
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return bytes + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    /**
     * Reads the tool's preference file and send the data to the callback function
     * 
     * @param {function} callBack
     */
    UnipooleUtilities.prototype.readPreferences = function(callBack) {
        jQuery.getJSON('data/preferences.json', function(preferenceData) {
            callBack(preferenceData);
        }).fail(function() {
            jQuery.getJSON('data/preferences_default.json', function(preferenceData) {
                callBack(preferenceData);
            }).fail(function() {
                callBack({});
            });
        });
    };

    /**
     * Sets the preference on the tool's preference json file
     * 
     * @param {String} toolName
     * @param {Object} data
     * @param {function} callback
     */
    UnipooleUtilities.prototype.updatePreference = function(toolName, data, callback) {
        this.updateFile('tools/' + toolName + '/data/preferences.json', data, callback, false, this.getRelativePath());
    };

    /**
     * Checks if the iframe is in the home window and then resizes the correst iframe
     */
    UnipooleUtilities.prototype.resizeFrame = function() {
        var iframe = this.getURLParameter('iframe');
        if (iframe) {
            setMainFrameHeight(iframe);
        } else {
            setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        }
    };

    /**
     * Converts the new format content data to the old version
     * 
     * @param {Object} data
     * @param {String} mainPropName
     * @returns {Object}
     */
    UnipooleUtilities.prototype.getArrayItemFromKeyValue = function(data, key, value) {
        for (var i = 0; i < data.length; i++) {
            if (data[i][key] === value) {
                return data[i];
            }
        }
        return null;
    };

    /**
     * Gets the html template file and then appends that to the current document body.
     * 
     * This is used by the dialogs.
     * 
     * @param {String} dialogTemplate
     */
    UnipooleUtilities.prototype.injectDialog = function(dialogTemplate) {
        jQuery.ajax({
            url: dialogTemplate,
            success: function(data) {
                jQuery('body').append(data);
            },
            async: false
        });
    };

    /**
     * Returns the relative path to the root of the site
     * 
     * If calling from a tool the path will return '../../'
     * 
     * @returns {String}
     */
    UnipooleUtilities.prototype.getRelativePath = function() {
        var path = "";
        var nodes = window.location.pathname.split('/');
        for (var index = 0; index < nodes.length - 2; index++) {
            path += "../";
        }
        return path;
    };

    /**
     * Logs an event to the events.json file
     * 
     * @param {type} eventType
     * @param {type} context
     * @param {type} ref
     * @returns {undefined}
     */
    UnipooleUtilities.prototype.logEvent = function(eventType, context, ref) {
        var utils = this;
        var dateNow = utils.getISODateString(new Date());
        jQuery.getJSON(this.getRelativePath() + 'unipoole/data/events.json', function(data) {
            data.events.push({
                eventCode: eventType,
                reference: ref,
                context: context,
                timeStamp: dateNow
            });
            utils.updateFile('unipoole/data/events.json', data, undefined, true, utils.getRelativePath());
        });
    };


    /**
     * Loads a .propeties file into memory
     * 
     * @param {type} resourceName 
     */
    UnipooleUtilities.prototype.loadResource = function(resourceName) {
        if (!UNIPOOLE_GLOBAL[resourceName]) {
            jQuery.ajax({
                url: this.getRelativePath() + "getResourceJson",
                data: JSON.stringify({resourceName: resourceName}),
                contentType: 'application/json',
                type: "POST",
                async: false
            }).success(function(data) {
                var resourceJson = JSON.parse(data);
                UNIPOOLE_GLOBAL[resourceName] = resourceJson;
            });
        }
    };


    /**
     * Function to generate a UUID by using a timestamp.
     * This UUID is only ment to be used temporarily for
     * newly generated content that does not currently have a 
     * ID
     */
    UnipooleUtilities.prototype.generateUUID = function() {
        return UUID_PREFIX + new Date().getTime();
    };

    /**
     * Updates events on sakai
     */
    UnipooleUtilities.prototype.updateEventsOnSakai = function() {
        var userData = {
            "username": UNIPOOLE_GLOBAL.unipooleData.username,
            "moduleId": UNIPOOLE_GLOBAL.unipooleData.moduleId,
            "deviceId": UNIPOOLE_GLOBAL.unipooleData.deviceId
        };
        if (UNIPOOLE_GLOBAL.unipooleData.username) {
            jQuery.ajax({
                url: "uploadEvents",
                data: JSON.stringify(userData),
                contentType: 'application/json',
                type: "POST"
            }).success(function() {
                // Ignore any errors - will try again later and only delete events 
                // once succesfull 
            });
        }
    };

    /**
     * Converts the new format content data to the old version
     * 
     * @param {Object} data
     * @param {String} mainPropName
     * @returns {Object}
     */
    UnipooleUtilities.prototype.convertToHandlebarsFormat = function(data, mainPropName) {
        var returnData = {};
        returnData[mainPropName] = [];
        for (var id in data) {
            if (data.hasOwnProperty(id)) {
                data[id]['id'] = id;
                returnData[mainPropName].push(data[id]);
            }
        }
        return returnData;
    };

    /**
     * Returns a ISO formatted string for the date object
     * 
     * @param {type} date
     * @returns {String}
     */
    UnipooleUtilities.prototype.getISODateString = function(date) {

        function z(n) {
            return (n < 10 ? '0' : '') + n;
        }
        function p(n) {
            n = n < 10 ? z(n) : n;
            return n < 100 ? z(n) : n;
        }

        return date.getUTCFullYear() + '-' +
                z(date.getUTCMonth() + 1) + '-' +
                z(date.getUTCDate()) + 'T' +
                z(date.getUTCHours()) + ':' +
                z(date.getUTCMinutes()) + ':' +
                z(date.getUTCSeconds()) + '.' +
                p(date.getUTCMilliseconds()) + 'Z';
    };

    // Attach UnipooleUtilities to window.unipooleUtils
    window.unipooleUtils = new UnipooleUtilities();

})(window.unipooleMessage);