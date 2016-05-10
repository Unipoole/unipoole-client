(function(window){

    var lms_id = "";
    if (window.parent.UNIPOOLE_GLOBAL 
     && window.parent.UNIPOOLE_GLOBAL.unipooleData
     && window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id){
    	lms_id = window.parent.UNIPOOLE_GLOBAL.unipooleData.lms_id;
    }
    
    /**
     * Register helper to check if the specified user ID is the
     * current student's ID
     */
    Handlebars.registerHelper('isActiveStudent', function(studentId, options) {
        if (lms_id == studentId) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

})(window);