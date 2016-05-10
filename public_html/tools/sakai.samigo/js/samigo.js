/**
 * Populate the announcments html document table from the json data
 *
 * @author OpenCollab
 * @since 1.0.0
 */

var samigoData;
jQuery(document).ready(function() {
    initialize();
    jQuery("a#btnGoOnline").button().click(function(){
        doTestOnline();
    });
});

/**
 * Populates the samigo tables and decorate with datatables 
 * 
 */
function initialize() {
    jQuery.getJSON('data/samigo.json', function(data) {
        samigoData = data;
        buildAvailableTable(samigoData.available);
//        buildScoredTable(samigoData.scored);
        setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
    });

}

/**
 * Builds the table with available assignments
 * @param {type} availableData Data to use as available assignments
 */
function buildAvailableTable(availableData) {
    var tableTemplate = unipooleUtils.getTemplate('templates/samigo.assignments.availableTable.handlebars');
    jQuery(tableTemplate(availableData)).appendTo('div#availableTableContainer');
    jQuery('table#availableTable').dataTable(
        {
            "fnDrawCallback": function() {
                setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
            },
            "sDom": ''
        }
    );
    unipooleUtils.resizeFrame();
}

/**
 * Build the table with assignments that has been scored
 * @param {type} scoredData Data to use as scored assignments
 */
function buildScoredTable(scoredData) {
    var tableTemplate = unipooleUtils.getTemplate('templates/samigo.assignments.scoredTable.handlebars');
    jQuery(tableTemplate(scoredData)).appendTo('div#scoredTableContainer');
    jQuery('table#scoredTable').dataTable(
        {
            "aaSorting": [],
            "fnDrawCallback": function() {
                setMainFrameHeight(UNIPOOLE_GLOBAL.IFRAME_ID);
            },
        "sDom": ''
        }
    );
    unipooleUtils.resizeFrame();
}

/**
 * Hides the details of the assignments
 */
function hideDetails(){
    jQuery("table#scoredTable tr[data-samigo=details], table#scoredTable td[data-samigo=details], table#scoredTable th[data-samigo=details]").hide();
    jQuery("a#hideDetailLink").addClass("noLink");
    jQuery("a#viewDetailLink").removeClass("noLink");
}

/**
 * Shows the details of the assignments
 */
function showDetails(){
    jQuery("table#scoredTable tr[data-samigo=details], table#scoredTable td[data-samigo=details], table#scoredTable th[data-samigo=details]").show();
    jQuery("a#viewDetailLink").addClass("noLink");
    jQuery("a#hideDetailLink").removeClass("noLink");
}

/**
 * Function to start doing a test
 */
function doTestOnline(){
    // First check if the user is online
    if(parent.UNIPOOLE_GLOBAL.internet_status === false){
        console.log("User is not online");
        unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, "You have to be online to do the test", undefined, undefined, undefined);
        return;
    }
    window.unipooleAuth.authenticateWithDialog(function(ok, authData){
    	if(ok){
    		auth(authData);
    	}
    });
    
}

function auth(data) {
        window.open(samigoData.testsURL + "&sakai.session="+data.sessionId, "_self");
}