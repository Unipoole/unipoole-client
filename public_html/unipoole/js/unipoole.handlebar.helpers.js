/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Returns attachment image if any attacments exist
 * 
 * @param {type} param1
 * @param {type} param2
 */
Handlebars.registerHelper('hasAttachment', function(attachments) {
    if (attachments && attachments.length > 0) {
        var notLink = false;
        for (var i = 0; i < attachments.length; i++) {
            notLink = notLink || !attachments[i].link;
        }
        if (notLink) {
            return "<img src='../../unipoole/image/attachments.gif' border='0' alt='attachment'/>";
        }
    }
    return "";
});

/**
 * Displays json date string formatted
 * 
 */
Handlebars.registerHelper('displayDate', function(date, format) {
    // Check that the format param is not the options object added as last param
    // by Handlebars
    if (!format || (format && format.data)) {
        format = UNIPOOLE_GLOBAL.DATE_FORMAT;
    }
    if (date === null || date === '') {
        return '';
    }
    return moment(date).format(format);
});

/**
 * Displays json date string formatted if the flag is true
 * 
 */
Handlebars.registerHelper('displayDateIf', function(ifTrue, date, format) {
    if (!ifTrue) {
        return '';
    }
    if (!date) {
        return '-';
    }
    // Check that the fomrat param is not the options object added as last param
    // by Handlebars
    if (!format || (format && format.data)) {
        format = UNIPOOLE_GLOBAL.DATE_FORMAT;
    }
    return moment(date).format(format);
});

/**
 * Displays event time range
 * 
 */
Handlebars.registerHelper('displayEventListTime', function(start, end, format) {
    // Check that the fomrat param is not the options object added as last param
    // by Handlebars
    if (!format || (format && format.data)) {
        format = UNIPOOLE_GLOBAL.DATE_FORMAT;
    }
    if (start === end) {
        return moment(start).format(format) + ' SAST';
    } else {
        return moment(start).format(format) + '-' + moment(end).format(format) + ' SAST';
    }
});

/**
 * Display frequency string for schedule detail
 */
Handlebars.registerHelper('displayFrequency', function(interval, freq, count, until) {
    if (!freq) {
        return "Activity occurs once";
    } else {
        var frequencyString = 'Every ' + interval + ' ' + freq + ", ";
        if (until) {
            frequencyString += 'Ends on ' + moment(until).format('DD-MMM-YYYY');
        } else {
            frequencyString += 'Number of occurrences: ' + count + ' Time(s)';
        }
        return frequencyString;
    }
});

/**
 * Why did I do this! should just use {{#if}}?
 */
Handlebars.registerHelper('ifElseString', function(ifTrue, trueString, falseString) {
    if (ifTrue) {
        return trueString;
    } else {
        return falseString;
    }
});

/**
 * Displays the resource size as formatted disk size or items
 */
Handlebars.registerHelper('resourceSize', function(folder, size) {
    if (!size) {
        return '';
    }
    if (folder) {
        return size + ' items';
    } else {
        return unipooleUtils.bytesToSize(size);
    }
});

/**
 * Defaults resource access field
 */
Handlebars.registerHelper('resourceAccess', function(access) {
    if (access === 'site') {
        return 'Entire site';
    } else {
        return access;
    }
});

/**
 * Returns the correct image for the mime type. Loads the content_type_images 
 * prop file to get the mime to image mapping
 * 
 * @param {String} mime_type
 */
Handlebars.registerHelper('resourceIcon', function(mime_type) {
    unipooleUtils.loadResource('content_type_images');
    image = UNIPOOLE_GLOBAL['content_type_images'][mime_type];
    if (!image) {
        return '';
    }
    image = image.replace('sakai/', '../../unipoole/image/');
    return "<img src='" + image + "' border='0' alt='attachment'/>";
});

/**
 * Returns the correct image for the event type
 * TODO : read this from the json file
 * 
 * @param {String} mime_type
 */
Handlebars.registerHelper('eventIcon', function(mime_type) {
    switch (mime_type) {
        case 'Exam' :
            return "<img src='../../unipoole/image/accept.png'/>";
        case 'Deadline' :
            return "<img src='../../unipoole/image/deadline.gif'/>";
        case 'Activity' :
            return "<img src='../../unipoole/image/activity.gif'/>";
        case 'Academic Calendar' :
            return "<img src='../../unipoole/image/academic_calendar.gif'/>";
        case 'Cancellation' :
            return "<img src='../../unipoole/image/cancelled.gif'/>";
        case 'Class section - Discussion' :
            return "<img src='../../unipoole/image/class_dis.gif'/>";
        case 'Class section - Lab' :
            return "<img src='../../unipoole/image/class_lab.gif'/>";
        case 'Class section - Lecture' :
            return "<img src='../../unipoole/image/class_lec.gif'/>";
        case 'Class section - Small Group' :
            return "<img src='../../unipoole/image/class_sma.gif'/>";
        case 'Class session' :
            return "<img src='../../unipoole/image/class_session.gif'/>";
        case 'Computer Session' :
            return "<img src='../../unipoole/image/computersession.gif'/>";
        case 'Meeting' :
            return "<img src='../../unipoole/image/meeting.gif'/>";
        case 'Multidisciplinary Conference' :
            return "<img src='../../unipoole/image/multi-conference.gif'/>";
        case 'Quiz' :
            return "<img src='../../unipoole/image/star.png'/>";
        case 'Special event' :
            return "<img src='../../unipoole/image/special_event.gif'/>";
        case 'Web Assignment' :
            return "<img src='../../unipoole/image/webassignment.gif'/>";
        default :
            return '';

    }
});


/**
 * Returns melete status image
 * 
 * 
 * @param {String} status
 */
Handlebars.registerHelper('meleteStatus', function(status) {
    if (status === 'complete') {
        return "<img src='../../unipoole/image/finish.gif' border='0' alt='attachment'/>";
    } else if (status === 'in_progress') {
        return "<img src='../../unipoole/image/status_away.png' border='0' alt='attachment'/>";
    } else {
        return "";
    }
});

/**
 * Generates alternate row highlighting on parent id
 * 
 * @param {type} param1
 * @param {type} param2
 */
Handlebars.registerHelper('getAltRowId', function(parent_id, id) {
    if (!parent_id) {
        parent_id = id;
    }
    parent_id = Math.floor(parent_id) + 1;
    return parent_id % 2 + 1;
});

/**
 * Generates alternate row highlighting on parent id
 * 
 * @param {type} param1
 * @param {type} param2
 */
Handlebars.registerHelper('getAltRowId2', function(index) {
    return (index + 1) % 2 + 1;
});

/**
 * Helper to do comparisons.
 * To use this helper use the following in your template
 * 
 * {{#compare messages "<" 2}}
 *     You have less than two messages
 * {{/compare}}
 * 
 * Or for string you can use 
 * {{#compare isOnline "<" "true"}}
 *     You are online
 * {{/compare}}
 */
Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 3 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function(l, r) {
            return l == r;
        },
        '===': function(l, r) {
            return l === r;
        },
        '!=': function(l, r) {
            return l != r;
        },
        '!==': function(l, r) {
            return l !== r;
        },
        '<': function(l, r) {
            return l < r;
        },
        '>': function(l, r) {
            return l > r;
        },
        '<=': function(l, r) {
            return l <= r;
        },
        '>=': function(l, r) {
            return l >= r;
        },
        'typeof': function(l, r) {
            return typeof l == r;
        }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});