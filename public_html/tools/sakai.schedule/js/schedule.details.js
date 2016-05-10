/**
 * Populate the schedule details
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
    initialize();
});
/**
 * Populate the schedule details
 */
function initialize() {
    var id = unipooleUtils.getURLParameter('id');
    var detailsTemplate = unipooleUtils.getTemplate('templates/scheduleDetail.handlebars');
    jQuery.getJSON('data/schedule.json', function(fileData) {
        var data = unipooleUtils.convertToHandlebarsFormat(fileData, 'events');
        addRecurringEvents(data);
        var detail = getDetails(data, id);
        // append the details block
        jQuery(detailsTemplate(detail)).appendTo('.portletBody');
        // set the next and previous button ids
        var nextId = getNextScheduleId(data.events, id);
        var previousId = getPreviousScheduleId(data.events, id);
        jQuery("[id*='Previous']").click(function() {
            window.open('details.html?id=' + previousId, '_self');
        });
        jQuery("[id*='Next']").click(function() {
            window.open('details.html?id=' + nextId, '_self');
        });
        setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
        unipooleUtils.resizeFrame();
    });
}

/**
 * Returns the correct event object from the array for the id
 * 
 * @param {type} data
 * @param {type} id
 */
function getDetails(data, id) {
    for (var i = 0; i < data.events.length; i++) {
        if (data.events[i].id === id) {
            return data.events[i];
        }
    }
    return {};
}

/**
 * Returns the next item in the data list
 * 
 * @param {type} data
 * @param {type} id
 */
function getNextScheduleId(data, id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            if (i == (data.length - 1)) {                
                return data[0].id;
            } else {
                return data[i + 1].id;
            }
        }
    }
    return id;
}

/**
 * Returns the previous item in the data list
 * 
 * @param {type} data
 * @param {type} id
 */
function getPreviousScheduleId(data, id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            if (i == 0) {
                return data[data.length - 1].id;
            } else {
                return data[i-1].id;
            }
        }
    }
    return id;
}
