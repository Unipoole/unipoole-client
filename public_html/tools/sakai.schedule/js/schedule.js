/**
 * Populate the shedule
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
    jQuery.getJSON('data/schedule.json', function(data) {
        var eventData = unipooleUtils.convertToHandlebarsFormat(data, 'events');        
        addRecurringEvents(eventData);
        addEventUrls(eventData);
        jQuery('#calendar').fullCalendar('rerenderEvents');
        jQuery('#calendar').fullCalendar({
            header: {
                left: 'list,month,agendaWeek,agendaDay',
                center: 'title',
                right: 'prev today next'
            },
            height: 450,
            events: eventData.events,
            buttonText: {
                list: 'List View',
                month: 'Month View',
                agendaWeek: 'Week View',
                agendaDay: 'Day View',
                prev: '&lsaquo; previous',
                next: 'next &rsaquo;'
            },
            dayClick: function(date, allDay, jsEvent) {
                if (jQuery(jsEvent.srcElement).hasClass('dayLink')) {
                    jQuery('#calendar').fullCalendar('changeView', 'agendaDay');
                    jQuery('#calendar').fullCalendar('gotoDate', date);
                }
            },
            eventRender: function(event, eventElement) {
                addEventIconImage(event, eventElement);
                adjustEventSize(eventElement);
            },
            viewDisplay: function() {
                var text = jQuery(".fc-header-title h2").text();
                jQuery(".fc-header-title h2").text(text + ' SAST');
            }
        });
        setCalendarFromParam();

        unipooleUtils.resizeFrame();
    });
});

/**
 * Checks for url params and sets the view and date accordingly
 */
function setCalendarFromParam() {
    var view = unipooleUtils.getURLParameter('view');
    var date = unipooleUtils.getURLParameter('date');
    var dateObject = new Date(Date.parse(date));

    if (view) {
        jQuery('#calendar').fullCalendar('changeView', view);
    }
    if (date) {
        jQuery('#calendar').fullCalendar('gotoDate', dateObject);
    }
}

/**
 * Enhances the event json by adding the url's for click through to event 
 * detail
 * 
 * @param {type} eventData
 */
function addEventUrls(eventData) {
    for (var i = 0; i < eventData.events.length; i++) {
        eventData.events[i].url = 'details.html?id=' + eventData.events[i].id;        
    }
    eventData.ignoreTimezone = false;
}