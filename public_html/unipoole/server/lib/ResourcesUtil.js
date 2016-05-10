var fs = require('fs');
var dat = require('./dat');

function ResourcesUtil(){}

ResourcesUtil.prototype.postRegister = function(registerData, data, res){
    var newData = JSON.parse(registerData);
    if (newData.moduleId != data.moduleId) {
        // Move from master to group
        // Replace in json
        fs.readFile("../../tools/sakai.resources/data/resources.json", function(error, rawData) {
            try {
                if (error) {
                    handleError(res, error);
                    return;
                }
                try {
                    // rename data folder
                    fs.renameSync("../../tools/sakai.resources/data/" + data.moduleId, "../../tools/sakai.resources/data/" + newData.moduleId);
                } catch (renameError) {
                    logger.log(renameError, logger.error);
                }
                // replace old moduleId in json
                var fileData = JSON.stringify(JSON.parse(rawData), null, 4).replace(new RegExp(data.moduleId, 'g'), newData.moduleId);
                fs.writeFile("../../tools/sakai.resources/data/resources.json", fileData, function(err) {
                    if (err) {
                        handleError(res, error);
                    }
                });

            } catch (e) {
                console.log(e);
            }
        });
    }
};

module.exports = new ResourcesUtil();