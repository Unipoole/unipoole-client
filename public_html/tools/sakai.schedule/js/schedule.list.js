/**
 * Populate the schedule list
 *
 * @author OpenCollab
 * @since 1.0.0
 */
var tableInitialised = false;
jQuery(document).ready(function() {

    // Set the from date picker
    jQuery("#from").datepicker({
        defaultDate: "-1w",
        changeMonth: true,
        numberOfMonths: 2,
        onClose: function(selectedDate) {
            $("#to").datepicker("option", "minDate", selectedDate);
        },
        showOn: "button",
        buttonImage: "images/cal.gif"
    });

    // Set the to date picker
    jQuery("#to").datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 2,
        onClose: function(selectedDate) {
            $("#from").datepicker("option", "maxDate", selectedDate);
        },
        showOn: "button",
        buttonImage: "images/cal.gif"
    });

    //  Filter on range button event
    jQuery('#filterList').click(function() {
        filterList();
    });

    // filter on drop down change and hide/show the range fields
    jQuery('#timeFilterOption').change(function() {
        filterList();
        if (jQuery('#timeFilterOption').val() !== 'SHOW_CUSTOM_RANGE') {
            jQuery('#dateRangeDiv').hide();
        } else {
            jQuery('#dateRangeDiv').show();
        }
    });

});

/**
 * Gets the from and to date
 */
function filterList() {
    var filterType = jQuery('#timeFilterOption').val();

    if (filterType === 'SHOW_ALL') {
        return populateListHTML(false);
    }

    var fromDate = new Date();
    var toDate = new Date();

    if (filterType === 'SHOW_CUSTOM_RANGE') {
        fromDate = moment(jQuery("#from").datepicker('getDate')).startOf('day');
        toDate = moment(jQuery("#to").datepicker('getDate')).endOf('day');
    } else if (filterType === 'SHOW_DAY') {
        fromDate = moment().startOf('day');
        toDate = moment().endOf('day');
    } else if (filterType === 'SHOW_WEEK') {
        fromDate = moment().startOf('week');
        toDate = moment().endOf('week');
    } else if (filterType === 'SHOW_MONTH') {
        fromDate = moment().startOf('month');
        toDate = moment().endOf('month');
    } else if (filterType === 'SHOW_YEAR') {
        fromDate = moment().startOf('year');
        toDate = moment().endOf('year');
    }
    populateListHTML(true, fromDate, toDate);
}

/**
 * Creates the filtered event data object
 * 
 * @param {boolean} filter indicates if a filter must be used
 * @param {Date} fromDate from date filter
 * @param {Date} toDate to date filter
 */
function populateListHTML(filter, fromDate, toDate) {
    jQuery.getJSON('data/schedule.json', function(data) {
        var eventData = unipooleUtils.convertToHandlebarsFormat(data, 'events');
        addRecurringEvents(eventData);
        if (!filter) {
            return applyScheduleListTemplate(eventData);
        }
        if (fromDate === null || toDate === null) {
            jQuery('#dataTable_wrapper').replaceWith('<div id="dataTable_wrapper"></div>');
            return;
        }
        applyScheduleListTemplate(filterEvents(eventData, fromDate, toDate));
    });
}

/**
 * Filters events between 2 dates
 * 
 * @param {Object} eventData
 * @param {Date} fromDate
 * @param {Date} toDate
 * @returns {Object} a list of filtered events
 */
function filterEvents(eventData, fromDate, toDate) {
    var filteredEvents = {};
    filteredEvents.events = [];
    for (var i = 0; i < eventData.events.length; i++) {
        var currentEvent = eventData.events[i];
        if (fromDate.isBefore(currentEvent.start) && toDate.isAfter(currentEvent.start)) {
            filteredEvents.events.push(currentEvent);
        }
    }
    return filteredEvents;
}

/**
 * Run the filtered event data through the template
 * 
 * @param {Object} eventData
 */
function applyScheduleListTemplate(eventData) {
    var eventList = unipooleUtils.getTemplate('templates/scheduleList.handlebars');
    var renderedTemplate = eventList(eventData);

    /*
     * We need to destroy the old data table if we have
     * initialised one previously
     */
    if (tableInitialised == true) {
        jQuery('#dataTable').dataTable().fnDestroy();
        jQuery('#dataTable').replaceWith(renderedTemplate);
    }
    else {
        jQuery('#dataTable_wrapper').html(renderedTemplate);
    }
    jQuery('#dataTable').dataTable(
            {
                'aoColumns': [
                    {'iDataSort': 1},
                    {"bVisible": false},
                    null,
                    null,
                    null
                ],
                "fnDrawCallback": function() {
                    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
                },
                "bPaginate": false,
                "bInfo": false
            }
    );
    tableInitialised = true;
    setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
}