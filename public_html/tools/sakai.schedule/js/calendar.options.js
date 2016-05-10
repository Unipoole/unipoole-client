/**
 * Encapsulates the event options page logic
 *
 * @author OpenCollab
 * @since 1.0.0
 */

jQuery(document).ready(function() {
    unipooleUtils.readPreferences(function(preferenceData) {
        restoreOptionPageProperties(preferenceData);
        unipooleUtils.resizeFrame();
    });
});


/**
 * Saves the user's chosen preferences to the preferences file
 */
function saveUserPreferences() {
    var userPreferences = {
        highPriorityEventsColor: getHighPriorityColor(),
        mediumPriorityEventsColor: getMediumPriorityColor(),
        lowPriorityEventsColor: getLowPriorityColor(),
        calendarView: (jQuery("#selectViewMode").find('option:selected').val()),
        highPriorityEvents: getHighPriorityEvents(),
        mediumPriorityEvents: getMediumPriorityEvents(),
        lowPriorityEvents: getLowPriorityEvents()
    };
    unipooleUtils.updatePreference('sakai.schedule', userPreferences, function() {
        window.open('calendar.html?iframe=' + unipooleUtils.getURLParameter('iframe'), '_self');
    });

}

/**
 * Restores the options page previous values when cancel is clicked or the option page is loaded
 * 
 * @param {JSON Object} preferenceData
 */
function restoreOptionPageProperties(preferenceData) {
    jQuery("input#highPriority").val(preferenceData.highPriorityEventsColor);
    jQuery("input#lowPriority").val(preferenceData.lowPriorityEventsColor);
    jQuery("input#mediumPriority").val(preferenceData.mediumPriorityEventsColor);


    jQuery("#mediumPriorityList").empty();
    if (preferenceData.mediumPriorityEvents) {
        for (var i = 0; i < preferenceData.mediumPriorityEvents.length; i++) {
            jQuery("#mediumPriorityList").append(jQuery("<option>" + preferenceData.mediumPriorityEvents[i] + "</option>"));
        }
    }

    jQuery("#highPriorityList").empty();
    if (preferenceData.highPriorityEvents) {
        for (var j = 0; j < preferenceData.highPriorityEvents.length; j++) {
            jQuery("#highPriorityList").append(jQuery("<option>" + preferenceData.highPriorityEvents[j] + "</option>"));
        }
    }

    jQuery("#lowPriorityList").empty();
    if (preferenceData.lowPriorityEvents) {
        for (var k = 0; k < preferenceData.lowPriorityEvents.length; k++) {
            jQuery("#lowPriorityList").append(jQuery("<option>" + preferenceData.lowPriorityEvents[k] + "</option>"));
        }
    }

    restoreUserSelectedView(preferenceData.calendarView);
}

/**
 * Select the correct view on the ui
 * 
 * @param {type} calendarView
 */
function restoreUserSelectedView(calendarView) {
    if (calendarView === 'basicWeek') {
        jQuery('#selectViewMode').val('basicWeek').prop('selected', true);
    }
    else {
        jQuery('#selectViewMode').val('month').prop('selected', true);
    }
}

/**
 * Closes the options page and keep the previous options when the cancel button is clicked
 */
function cancel() {
    window.open('calendar.html?iframe=' + unipooleUtils.getURLParameter('iframe'), '_self');
}

/**
 * Updates and saves the calendar view with the user's chosen preferences
 */
function update() {
    jQuery("#eventOptions").hide();
    jQuery('#calendar').empty();
    saveUserPreferences();
}

/**
 * Moves selected item to the medium priority combo box below
 */
function moveItemDownToMediumPriorityList() {
    jQuery('#highPriorityList option:selected').appendTo('#mediumPriorityList');
    jQuery('#highPriorityList option:selected').remove();
    jQuery('#mediumPriorityList option:selected').prop("selected", false);
}

/**
 * Moves selected item to the high priority combo box above
 */
function moveItemUpToHighPriorityList() {
    jQuery('#mediumPriorityList option:selected').appendTo('#highPriorityList');
    jQuery('#mediumPriorityList option:selected').remove();
    jQuery('#highPriorityList option:selected').prop("selected", false);
}

/**
 * Moves selected item to the low priority list combo box below
 */
function moveItemDownToLowPriorityList() {
    jQuery('#mediumPriorityList option:selected').appendTo('#lowPriorityList');
    jQuery('#mediumPriorityList option:selected').remove();
    jQuery('#lowPriorityList option:selected').prop("selected", false);
}

/**
 * Moves selected item to the medium priority combo box above
 */
function moveItemUpToMediumPriorityList() {
    jQuery('#lowPriorityList option:selected').appendTo('#mediumPriorityList');
    jQuery('#lowPriorityList option:selected').remove();
    jQuery('#mediumPriorityList option:selected').prop("selected", false);
}

/**
 * Gets a list of all high priority events
 * 
 * @returns {Array} highPriorityEvents
 */
function getHighPriorityEvents() {
    var highPriorityEvents = [];
    jQuery('select#highPriorityList').find('option').each(function() {
        highPriorityEvents.push(jQuery(this).val());
    });
    return highPriorityEvents;
}

/**
 * Gets a list of all medium priority events
 * 
 * @returns {Array} mediumPriorityEvents
 */
function getMediumPriorityEvents() {
    var mediumPriorityEvents = [];
    jQuery('select#mediumPriorityList').find('option').each(function() {
        mediumPriorityEvents.push(jQuery(this).val());
    });
    return mediumPriorityEvents;
}

/**
 * Gets a list of all low priority events
 * 
 * @returns {Array} lowPriorityEvents
 */
function getLowPriorityEvents() {
    var lowPriorityEvents = [];
    jQuery('select#lowPriorityList').find('option').each(function() {
        lowPriorityEvents.push(jQuery(this).val());
    });
    return lowPriorityEvents;
}

/**
 * Gets the color to display high priority events with
 * 
 * @return {String} highPriorityColor
 */
function getHighPriorityColor() {
    var highPriorityColor = jQuery("input#highPriority").val();
    return highPriorityColor;
}

/**
 * Gets the color to display meduim priority events with
 * 
 * @return {String} mediumPriorityColor
 */
function getMediumPriorityColor() {
    var mediumPriorityColor = jQuery("input#mediumPriority").val();
    return mediumPriorityColor;
}

/**
 * Gets the color to display low priority events with
 * 
 * @return {String} lowPriorityColor
 */
function getLowPriorityColor() {
    var lowPriorityColor = jQuery("input#lowPriority").val();
    return lowPriorityColor;
}
