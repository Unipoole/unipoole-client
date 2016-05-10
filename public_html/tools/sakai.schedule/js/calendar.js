/**
 * Populate the schedule
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
	
	getIconData(function(){
		unipooleUtils.readPreferences(function(preferenceData) {
    		renderCalendar(preferenceData);
    	});
    });
    
});

/**
 * Renders the calendar view on document ready
 * 
 * @param {Object} preferenceData
 */
function renderCalendar(preferenceData) {
    jQuery.getJSON('data/schedule.json', function(data) {
        var eventData = unipooleUtils.convertToHandlebarsFormat(data, 'events');
        addRecurringEvents(eventData);
        var eventDayData = createEventDayData(eventData, preferenceData);
        jQuery('#calendar').fullCalendar({
            header: {
                left: 'title',
                center: '',
                right: 'prev today next'
            },
            theme: true,
            eventRender: function(event, element) {
                styleCalendarView(element);
            },
            dayClick: function(date) {
                retrieveDaysEvents(date);
            },
            dayRender: function(date, cell) {
                determineEventColor(date, cell, eventDayData, preferenceData);
            },
            weekMode: 'variable',
            defaultView: preferenceData.calendarView,
            height: 250,
            events: eventData.events,
            buttonText: {
                today: 'Today',
                month: 'Month View',
                prev: '&lsaquo;',
                next: '&rsaquo;'
            },
            eventAfterAllRender: function() {
                unipooleUtils.resizeFrame();
            }
        });
        jQuery('#calendar').fullCalendar('rerenderEvents');
        hideLinksOnDays();
        displayCurrentDayEvents();
        removeEventOnButtonClick();
    });
}

function createEventDayData(eventData, preferenceData) {
    var eventDayData = {};
    for (var i = 0; i < eventData.events.length; i++) {
        var day = moment(eventData.events[i].start);
        var startOfDayDate = new Date(day.year(), day.month(), day.date(), 0, 0, 0);
        if (eventDayData[startOfDayDate]) {
            eventDayData[startOfDayDate].count++;
            eventDayData[startOfDayDate].level =
                    getPriorityLevel(eventData.events[i].type, preferenceData, eventDayData[startOfDayDate].level);
        } else {
            eventDayData[startOfDayDate] = {
                count: 1,
                level: getPriorityLevel(eventData.events[i].type, preferenceData)
            };
        }
    }
    return eventDayData;
}

function getPriorityLevel(type, preferenceData, current) {
    if (jQuery.inArray(type, preferenceData.highPriorityEvents) !== -1 || current === 'high') {
        return 'high';
    } else if (jQuery.inArray(type, preferenceData.mediumPriorityEvents) !== -1 || current === 'medium') {
        return 'medium';
    } else if (jQuery.inArray(type, preferenceData.lowPriorityEvents) !== -1) {
        return 'low';
    }
    return 'low';
}

/**
 * Removes event on the calendar view on event render
 * 
 * @param {String} element
 * 
 */
function styleCalendarView(element) {
    element.find(".fc-event-inner").remove();
    element.find(".fc-event-title").remove();
    element.find(".fc-event-time").remove();
}

/**
 * Retrieves events on a particular day
 * 
 * @param {Date} date
 * 
 */
function retrieveDaysEvents(date) {
    removeEventFromView();
    var nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    var todaysEvents = jQuery('#calendar').fullCalendar('clientEvents', function(event) {
        return event.start >= date && event.start < nextDate;
    });
    for (var i = 0; i < todaysEvents.length; i++) {
        determineEventIcon(todaysEvents[i]);
    }
    UNIPOOLE_GLOBAL.selectedDaysEvents = todaysEvents;
    displayDaysEvents(todaysEvents);
}

/**
 * Determines the icon an event should be displayed with
 * 
 * @param {Object} event
 * 
 */
function determineEventIcon(event) {
    var eventType = event.type;
    event.icon = UNIPOOLE_GLOBAL.eventsIcons[eventType];
}

/**
 * Gets the data used to determine event's icons 
 */
function getIconData(callback) {
    jQuery.getJSON('data/events.icons.json', function(data) {
        UNIPOOLE_GLOBAL.eventsIcons = data;
        callback();
    });
}

/**
 * Determines the color an event should be displayed with
 * 
 * @param {Date} date
 * @param {Object} cell
 * @param {type} eventDayData
 * @param {type} preferences  
 */
function determineEventColor(date, cell, eventDayData, preferences) {
    var eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (eventDayData[eventDate]) {
        cell.find(".fc-day-content").text('(' + eventDayData[eventDate].count + ')');
        cell.css('cursor', 'pointer');

        var level = eventDayData[eventDate].level;
        if (level === 'high') {
            cell.css('background', preferences['highPriorityEventsColor']);
        } else if (level === 'medium') {
            cell.css('background', preferences['mediumPriorityEventsColor']);
        } else {
            cell.css('background', preferences['lowPriorityEventsColor']);
        }
    }
}

/**
 * Displays current day's events
 */
function displayCurrentDayEvents() {
    var currentDate = (jQuery('#calendar').fullCalendar('getDate'));
    var currentDayEvents = jQuery('#calendar').fullCalendar('clientEvents', function(event) {
        return jQuery.fullCalendar.formatDate(event.start, 'dd-MM-yyyy') === jQuery.fullCalendar.formatDate(currentDate, 'dd-MM-yyyy');
    });

    for (var i = 0; i < currentDayEvents.length; i++) {
        determineEventIcon(currentDayEvents[i]);
    }
    UNIPOOLE_GLOBAL.selectedDaysEvents = currentDayEvents;
    displayDaysEvents(currentDayEvents);
}

/**
 * Displays events descriptions for a particular day
 * 
 * @param {Array} daysEvents
 * 
 */
function displayDaysEvents(daysEvents) {
    var eventsBriefDescTemplate = unipooleUtils.getTemplate('templates/eventsBriefDescription.handlebars');
    addAttributesToEvent(daysEvents);
    jQuery(eventsBriefDescTemplate(daysEvents)).appendTo("#eventsBriefDesc");
    unipooleUtils.resizeFrame();
}

/**
 * Adds additional attributes to the event object
 * 
 * @param {Array} dayEvents
 * 
 */
function addAttributesToEvent(dayEvents) {
    for (var i = 0; i < dayEvents.length; i++) {
        var start = jQuery.fullCalendar.formatDate(dayEvents[i].start, 'dd-MM-yyyy');
        dayEvents[i].iframe = unipooleUtils.getURLParameter('iframe');
        dayEvents.start = start;
        dayEvents.header = 'Event(s) for';
    }
}

/**
 * Get the data of the clicked event
 * 
 * @param {String} id
 * 
 */
function getSelectedEventsData(id) {
    var eventDetailTemplate = unipooleUtils.getTemplate('templates/eventDetails.handlebars');
    for (var i = 0; i < UNIPOOLE_GLOBAL.selectedDaysEvents.length; i++) {
        if (UNIPOOLE_GLOBAL.selectedDaysEvents[i].id === id) {
            if (jQuery("#eventsBriefDetails").is(':hidden')) {
                jQuery("#eventsBriefDetails").empty();
                jQuery("#eventsBriefDetails").show();
            }
            jQuery(eventDetailTemplate(UNIPOOLE_GLOBAL.selectedDaysEvents[i])).appendTo("#eventsBriefDetails");
            jQuery("#eventsBriefDesc").hide();
        }
    }
    unipooleUtils.resizeFrame();
}

/**
 * Navigates to the events brief description
 */
function navigateBack() {
    jQuery("#eventsBriefDesc").show();
    jQuery("#eventsBriefDetails").hide();
    unipooleUtils.resizeFrame();
}

/**
 * Removes currently shown event for another one to be shown 
 */
function removeEventFromView() {
    jQuery("#eventsBriefDesc").empty();
    jQuery("#eventsBriefDetails").empty();
    if (jQuery("#eventsBriefDesc").is(':hidden')) {
        jQuery("#eventsBriefDesc").show();
    }
    unipooleUtils.resizeFrame();
}

/**
 * Removes event from view when the prev, today or next button is clicked.
 */
function removeEventOnButtonClick() {
    jQuery('.fc-button-prev').click(function() {
        jQuery("#eventsBriefDesc").empty();
        jQuery("#eventsBriefDetails").empty();
        hideLinksOnDays();
        unipooleUtils.resizeFrame();
    });

    jQuery('.fc-button-next').click(function() {
        jQuery("#eventsBriefDesc").empty();
        jQuery("#eventsBriefDetails").empty();
        hideLinksOnDays();
        unipooleUtils.resizeFrame();
    });

    jQuery('.fc-button-today').click(function() {
    	if (!jQuery('.fc-button-today').hasClass("ui-state-disabled")){
	        hideLinksOnDays();
    	}
    	jQuery("#eventsBriefDesc").empty();
        jQuery("#eventsBriefDetails").empty();
    	displayCurrentDayEvents();
        unipooleUtils.resizeFrame();
    });
}

/**
 * Removes links on days that do not have events
 */
function hideLinksOnDays() {
    jQuery('.fc-day-number').each(function(index, dayNumber) {
        var text = jQuery(dayNumber).find('.dayLink').text();
        jQuery(dayNumber).remove('.dayLink').text(text);
    });
}


