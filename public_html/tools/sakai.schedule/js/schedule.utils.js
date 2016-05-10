/**
 * Utils for all schedule screens
 *
 * @author OpenCollab
 * @since 1.0.0
 */

/**
 * Check for events with frequency and then add the events that must be generated
 * 
 * @param {type} eventData
 */
function addRecurringEvents(eventData) {
    var newEvents = [];
    for (var i = 0; i < eventData.events.length; i++) {
        assignFrequencyHandler(newEvents, eventData.events[i]);
    }
    for (var j = 0; j < newEvents.length; j++) {
        eventData.events.push(newEvents[j]);
    }
}

/**
 * Checks which logic to use for the repeating 
 * 
 * @param {type} newEvents
 * @param {type} event
 */
function assignFrequencyHandler(newEvents, event) {
    switch (event.frequency) {
        case 'day':
            handleDaily(newEvents, event);
            break;
        case 'MWF':
            handleMWF(newEvents, event);
            break;
        case 'TT':
            handleTT(newEvents, event);
            break;
        case 'week':
            handleWeekly(newEvents, event);
            break;
        case 'month':
            handleMonthly(newEvents, event);
            break;
        case 'year':
            handleYearly(newEvents, event);
            break;
        default:
            break;
    }
}

function handleDaily(newEvents, event) {
    addEvents(newEvents, event, 'days', 1);
}

function handleMWF(newEvents, event) {
    addEvents(newEvents, event, 'days', 1, [1, 3, 5]);
}

function handleTT(newEvents, event) {
    addEvents(newEvents, event, 'days', 1, [2, 4]);
}

function handleWeekly(newEvents, event) {
    addEvents(newEvents, event, 'weeks', 1);
}

function handleMonthly(newEvents, event) {
    addEvents(newEvents, event, 'months', 1);
}

function handleYearly(newEvents, event) {
    addEvents(newEvents, event, 'years', 1);
}

/**
 * Adds the repeating events to the event list 
 * 
 * @param {type} newEvents
 * @param {type} event
 * @param {type} addType - 'days', 'months', 'weeks' or 'years'
 * @param {type} multiply - use 2 to make it every second day
 * @param {Array} allowedDays array of day numbers allowed starting Sunday at 0 
 * to Saturday at 6
 */
function addEvents(newEvents, event, addType, multiply, allowedDays) {
    if (event.recurs_until) {
        var endDate = moment(event.recurs_until);
        var count = 1;
        while (endDate.isAfter(moment(event.start).add(addType, count * multiply))) {
            var start = moment(event.start).add(addType, count * multiply);

            if (!allowedDays || (jQuery.inArray(start.day(), allowedDays)) > -1) {
                var copiedEvent = {};
                jQuery.extend(copiedEvent, event);
                copiedEvent.start = start.toDate();
                copiedEvent.end = moment(event.end).add(addType, count * multiply).toDate();
                copiedEvent.id = event.id + '_' + count++;
                newEvents.push(copiedEvent);
            }
        }
    } else {
        var count2 = 1;
        for (var i = 0; count2 < event.recurrence_count; i++) {
            var start2 = moment(event.start).add(addType, (i + 1) * multiply);
            if (!allowedDays || (jQuery.inArray(start2.day(), allowedDays)) > -1) {
                var copiedEvent = {};
                jQuery.extend(copiedEvent, event);
                copiedEvent.start = start2.toDate();
                copiedEvent.end = moment(event.end).add(addType, (i + 1) * multiply).toDate();
                copiedEvent.id = event.id + '_' + i;
                newEvents.push(copiedEvent);
                count2++;
            }
        }
    }
}


/**
 * Determines the icon to display the event with
 * 
 * @param {JSON} event
 * @param {type} eventElement 
 */
function addEventIconImage(event, eventElement) {
    var eventType = event.type;
    var element = eventElement.find(".fc-event-inner");
    eventType = eventType.slice(0, 1).toUpperCase() + eventType.slice(1);
    if (!UNIPOOLE_GLOBAL.eventsIcons) {
        jQuery.getJSON('data/events.icons.json', function(data) {
            UNIPOOLE_GLOBAL.eventsIcons = data;
            var icon = data[eventType];
            element.prepend("<img src='" + icon + "' width='12' height='12'>").css('padding', '0px');
        });
    } else {
        var icon = UNIPOOLE_GLOBAL.eventsIcons[eventType];
        element.prepend("<img src='" + icon + "' width='12' height='12'>").css('padding', '0px');
    }
}

/**
 * Adjusts the size of an event within the calendar
 * 
 * @param {String} eventElement
 * 
 */
function adjustEventSize(eventElement) {
    eventElement.find('.fc-event-time').css({
        top: '10px',
        left: '5px'
    });
    eventElement.find(".fc-event-title").css('padding', '5px 5px 5px 5px');
    eventElement.find(".fc-event-inner").css('padding', '5px 5px 5px 5px');
}