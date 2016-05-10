/**
 * Functions used for synchronization
 *
 * @author OpenCollab
 * @since 1.0.0
 */

(function(unipooleUtils, unipooleMessage) {

    /**
     * Constructor
     */
    function UnipooleSynchronise() {
        this.dialogSyncInitialised = false;
        this.dialogSyncStatusInitliased = false;
        this.dialogSyncSummaryInitialised = false;
    }

    /**
     * Opens the sync summary dialog
     */
    UnipooleSynchronise.prototype._openSyncDialog = function() {
        this._setupSyncDialog();
        jQuery("#syncDialog").dialog("open");
    };


    /**
     * Sets up the synchronize selection dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    UnipooleSynchronise.prototype._setupSyncDialog = function() {
        if (this.dialogSyncInitialised == true) {
            return;
        }
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/sync.html');
        var sync = this;
        jQuery("#syncDialog").dialog({
            autoOpen: false,
            width: 'auto',
            modal: true,
            closeOnEscape: false,
            show: {
                effect: "fade",
                duration: 500
            },
            hide: {
                effect: "fade",
                duration: 500
            },
            open: function() {
                jQuery("#syncDialog").parent().find(".ui-widget-overlay").css({background: "#000", opacity: 0.7});
            },
            position: ['middle', 45],
            buttons: {
                "Sync": function() {
                    sync._synchronize();
                },
                "Cancel": function() {
                    jQuery(this).dialog("close");
                }
            },
            close: function() {
                jQuery(this).dialog("close");
            }
        });
        this.dialogSyncInitialised = true;
    };

    /**
     * Opens the sync summary dialog
     */
    UnipooleSynchronise.prototype._openSyncSummaryDialog = function() {
        this._setupSyncSummaryDialog();
        jQuery("#syncSummaryDialog").dialog("open");
    };

    /**
     * Sets up the synchronize summary dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    UnipooleSynchronise.prototype._setupSyncSummaryDialog = function() {
        if (this.dialogSyncSummaryInitialised == true) {
            return;
        }
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/syncsummary.html');
        var sync = this;
        jQuery("#syncSummaryDialog").dialog({
            autoOpen: false,
            width: 'auto',
            modal: true,
            closeOnEscape: false,
            show: {
                effect: "fade",
                duration: 500
            },
            hide: {
                effect: "fade",
                duration: 500
            },
            open: function() {
                jQuery("#syncSummaryDialog").parent().find(".ui-widget-overlay").css({background: "#000", opacity: 0.7});
            },
            position: ['middle', 45],
            buttons: {
                "OK": function() {
                    sync._synchronize(true);
                },
                "Configure": function() {
                    sync._openSyncDialog();
                },
                "Cancel": function() {
                    jQuery(this).dialog("close");
                }
            },
            close: function() {
                jQuery(this).dialog("close");
            }
        });
        this.dialogSyncSummaryInitialised = true;
    };

    /**
     * Opens the sync status dialog
     */
    UnipooleSynchronise.prototype._openSyncStatusDialog = function() {
        this._setupSyncStatusDialog();
        jQuery("#syncStatusDialog").dialog("open");
    };

    /**
     * Sets up the synchronize status dialog. Uses jQuery UI dialog that uses inline HTML
     * in the start.html file
     */
    UnipooleSynchronise.prototype._setupSyncStatusDialog = function() {
        if (this.dialogSyncStatusInitliased === true) {
            return;
        }
        unipooleUtils.injectDialog(unipooleUtils.getRelativePath() + 'unipoole/dialogs/syncstatus.html');
        jQuery("#syncStatusDialog").dialog({
            autoOpen: false,
            resize: "auto",
            width: 400,
            modal: true,
            closeOnEscape: false,
            show: {
                effect: "fade",
                duration: 500
            },
            hide: {
                effect: "fade",
                duration: 500
            },
            open: function() {
                jQuery("#syncStatusDialog").parent().find(".ui-widget-overlay").css({background: "#000", opacity: 0.9});
            },
            position: ['middle', 45],
            buttons: {
                "OK": function() {
                    jQuery(this).dialog("close");
                }
            },
            close: function() {

            }
        });
        this.dialogSyncStatusInitliased = true;
    };

    /**
     * Opens the sync dialog
     */
    UnipooleSynchronise.prototype.syncApp = function() {
        if (!jQuery('#dashboardAppSync').hasClass('dashboardLoading')) {
            if (!UNIPOOLE_GLOBAL.unipooleData.username || UNIPOOLE_GLOBAL.unipooleData.username === '') {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.WARNING, "Can not synchoronize", "The digiband must be registered and online to synchronize", "Please go online and register this digi-band in order to synchronize");
            } else if (!unipooleDashboard.checkOnline()) {
                unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.WARNING, "Can not synchoronize", "The digiband must be online to synchronize", "Please go online in order to synchronize");
            } else {
                var sync = this;
                this.checkSyncStatus(true, function() {
                    sync._displaySyncDialog();
                });
            }
        }
    };

    UnipooleSynchronise.prototype._displaySyncDialog = function() {
        if (UNIPOOLE_GLOBAL.syncStatus) {
            unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.INFO, "In Sync", "Unipoole is currently in sync with the myUnisa server");
        } else {
            unipooleUtils.setCheckboxes(true, 'uniSync', true);
            this._openSyncSummaryDialog();
        }
    };

    /**
     * Checks if there are any unsynced tools and writes that to the tool data
     * 
     * @param {boolean} hideGrowl
     * @param {type} callback
     * 
     */
    UnipooleSynchronise.prototype.checkSyncStatus = function(hideGrowl, callback) {
        setSyncIconClass('dashboardLoading');
        unipooleMessage.displayWait('Updating sync status from the myUnisa server...');
        unipooleUtils.updateEventsOnSakai();
        var userData = {
            "username": UNIPOOLE_GLOBAL.unipooleData.username,
            "moduleId": UNIPOOLE_GLOBAL.unipooleData.moduleId,
            "deviceId": UNIPOOLE_GLOBAL.unipooleData.deviceId,
            "tools": UNIPOOLE_GLOBAL.unipooleData.toolsLocal
        };
        var sync = this;
        if (UNIPOOLE_GLOBAL.unipooleData.username) {
            jQuery.ajax({
                url: "syncstatus",
                data: JSON.stringify(userData, null, 4),
                contentType: 'application/json',
                type: "POST"
            }).success(function(dataObject) {
                // Update the global data object  
                unipooleMessage.closeWait();
                try {
                    var data = JSON.parse(dataObject);
                    if (!unipooleMessage.checkServerError('Error while checking sync status', data)) {
                        delete data.status;
                        delete data.message;
                        delete data.errorCode;
                        delete data.instruction;
                        jQuery.extend(true, UNIPOOLE_GLOBAL.unipooleData, data);
                        unipooleUtils.updateFile('unipoole/data/unipooleData.json', data);
                    }
                } catch (e) {
                    unipooleMessage.displayMessage(UNIPOOLE_GLOBAL.ERROR, 'Error while checking sync status', dataObject);
                    unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, "Error while checking sync status", e, 4900);
                }
                unipooleMenu.initializeMenu();
                sync._initializeSyncTable(hideGrowl);
                if (callback) {
                    callback();
                }
            });
        } else {
            unipooleMenu.initializeMenu();
        }
    };

    /**
     * Initializes the sync table by preparing the sync data and running the handlebar template
     * 
     * TODO : function is too large and not very readable - fix this
     * @param {boolean} hideGrowl
     */
    UnipooleSynchronise.prototype._initializeSyncTable = function(hideGrowl) {
        this._setupSyncStatusDialog();
        this._setupSyncDialog();
        var syncToolsData = [];
        var syncTableTemplate = unipooleUtils.getTemplate('unipoole/templates/syncTable.handlebars');
        var unipooleData = UNIPOOLE_GLOBAL.unipooleData;
        var totalUploadSize = 0;
        var totalDownloadSize = 0;
        var syncStatus = true;
        var toolSyncStatus = {};
        for (var tool in unipooleData.toolsLocal) {
            if (unipooleData.tools[tool]) {
                var toolSynced = this.checkToolSync(tool, unipooleData, 'CodeVersion');
                var contentSynced = this.checkToolSync(tool, unipooleData, 'ContentVersion');
                syncStatus = syncStatus && toolSynced && contentSynced && !unipooleData.toolsLocal[tool].localChange;
                var toolSyncData = {
                    toolName: tool,
                    toolLabel: unipooleData.toolDescriptions[tool].label,
                    toolSync: toolSynced,
                    contentSync: contentSynced,
                    toolSyncBoth: toolSynced && contentSynced,
                    syncStatus: toolSynced && contentSynced && !unipooleData.toolsLocal[tool].localChange,
                    contentUpload: !unipooleData.toolsLocal[tool].localChange,
                    toolSyncSize: unipooleData.tools[tool].codeSynchSize,
                    contentSyncSize: unipooleData.tools[tool].contentSynchSize,
                    toolTotalSyncSize: (toolSynced && contentSynced) ? undefined : unipooleData.tools[tool].contentSynchSize + unipooleData.tools[tool].codeSynchSize,
                    contentUploadSize: unipooleData.toolsLocal[tool].localChangeSize
                };
                toolSyncStatus[tool] = {};
                toolSyncStatus[tool].toolSync = toolSynced;
                toolSyncStatus[tool].contentSync = contentSynced;
                totalDownloadSize += toolSyncData.contentSyncSize ? toolSyncData.contentSyncSize : 0;
                totalDownloadSize += toolSyncData.toolTotalSyncSize ? toolSyncData.toolTotalSyncSize : 0;

                syncToolsData.push(toolSyncData);
            }
        }
        var syncData = {
            tools: syncToolsData
        };
        syncData.totalUploadSize = totalUploadSize;
        syncData.totalDownloadSize = totalDownloadSize;
        UNIPOOLE_GLOBAL.syncData = syncData;
        UNIPOOLE_GLOBAL.toolSyncStatus = toolSyncStatus;
        jQuery('div#syncDialog #syncDialogTableBody').html(syncTableTemplate(syncData));
        this._setTotalSize();
        this._addSyncCheckboxEvents();
        UNIPOOLE_GLOBAL.syncStatus = syncStatus;
        if (!hideGrowl) {
            showSyncGrowl(syncStatus);
        }
        setSyncIcon(syncStatus);
    };

    /**
     * 
     * @param {type} syncStatus
     */
    function showSyncGrowl(syncStatus) {
        if (syncStatus) {
            toastr.success('In sync : All tool content and code are in sync!');
        } else {
            toastr.warning('Out of sync : One or more tools are out of sync!');
        }
    }
    /**
     * 
     * @param {type} syncStatus
     */
    function setSyncIcon(syncStatus) {
        if (syncStatus) {
            setSyncIconClass('dashboardOn');
            jQuery('#dashboardAppSync').html('In Sync');
        } else {
            setSyncIconClass('dashboardOff');
            jQuery('#dashboardAppSync').html('Sync Now');
        }
    }


    function setSyncIconClass(cssClass) {
        jQuery('#dashboardAppSync').removeClass();
        jQuery('#dashboardAppSync').addClass('uniDashboardText');
        jQuery('#dashboardAppSync').addClass(cssClass);
    }

    /**
     * Adds the events to the check boxes that sets the total size and eables the 
     * sync button
     */
    UnipooleSynchronise.prototype._addSyncCheckboxEvents = function() {
        // TODO test that these events don't get called multiple times!
        var sync = this;
        jQuery('[id*="uniSync"]:enabled').change(function() {
            if (jQuery('[id*="uniSync"]:checked').length) {
                jQuery(".ui-dialog-buttonpane button:contains('Sync')").button('enable');
            } else {
                jQuery(".ui-dialog-buttonpane button:contains('Sync')").button('disable');
            }
            sync._setTotalSize();
        });
    };

    /**
     * Sets the size totals and sub totals on the sync selection screen
     */
    UnipooleSynchronise.prototype._setTotalSize = function() {
        this._setupSyncSummaryDialog();
        var grandTotal = 0;
        var uploadTotal = 0;
        var downloadTotal = 0;
        var syncData = UNIPOOLE_GLOBAL.syncData.tools;

        jQuery('div#syncDialog input[id*="uniSyncUp"]:checked').each(function() {
            var toolUpData = unipooleUtils.getArrayItemFromKeyValue(syncData, 'toolName', jQuery(this).data('tool'));
            uploadTotal += toolUpData.contentUploadSize;
        });

        jQuery('div#syncDialog input[id*="uniSyncDown"]:checked').each(function() {
            var toolDownData = unipooleUtils.getArrayItemFromKeyValue(syncData, 'toolName', jQuery(this).data('tool'));
            downloadTotal += toolDownData.toolTotalSyncSize;
        });
        grandTotal = uploadTotal + downloadTotal;
        jQuery('div#syncDialog #syncUploadSize').html(uploadTotal === 0 ? 0 : unipooleUtils.bytesToSize(uploadTotal));
        jQuery('div#syncDialog #syncDownloadSize').html(downloadTotal === 0 ? 0 : unipooleUtils.bytesToSize(downloadTotal));
        jQuery('div#syncDialog #syncTotalSize').html(grandTotal === 0 ? 0 : unipooleUtils.bytesToSize(grandTotal));
        jQuery('div#syncSummaryDialog #uniUploadSize').html(uploadTotal === 0 ? 0 : unipooleUtils.bytesToSize(uploadTotal));
        jQuery('div#syncSummaryDialog #uniDownloadSize').html(downloadTotal === 0 ? 0 : unipooleUtils.bytesToSize(downloadTotal));
        jQuery('div#syncSummaryDialog #uniTotalSize').html(grandTotal === 0 ? 0 : unipooleUtils.bytesToSize(grandTotal));
    };

    /**
     * Select/deselect all active checkboxes in sync table column
     * 
     * @param {String} id
     */
    UnipooleSynchronise.prototype.syncHeaderClicked = function(id) {
        if (jQuery('div#syncDialog #' + id).hasClass('uniSelected')) {
            unipooleUtils.setCheckboxes(false, id, true);
        } else {
            unipooleUtils.setCheckboxes(true, id, true);
        }
        jQuery('div#syncDialog #' + id).toggleClass('uniSelected');
    };

    /**
     * Opens the authentication dialog and calls the synchronize function if valid
     */
    UnipooleSynchronise.prototype._synchronize = function() {
        var sync = this;
        unipooleAuth.authenticateWithDialog(function(ok) {
            if (ok) {
                sync._synchronizeSelected();
            }
        });
    };

    /**
     * Opens the sync status dialog and starts the sync process
     * 
     * @returns {Boolean} 
     */
    UnipooleSynchronise.prototype._synchronizeSelected = function() {
        var syncSelection = createSyncSelection();

        // Setup dialog
        var syncStatusTemplate = unipooleUtils.getTemplate('unipoole/templates/syncStatus.handlebars');
        jQuery('div#syncStatusDialog #syncStatusTableBody').html(syncStatusTemplate(syncSelection));
        jQuery('#uniSyncCompleted').hide();
        this._openSyncStatusDialog();
        jQuery("#syncDialog").dialog('close');
        jQuery("#syncSummaryDialog").dialog('close');
        // Run sync
        this._runSync(syncSelection);
        return true;
    };

    /**
     * Creates the syncSelection object from selected items on the sync dialog
     * 
     * @returns {createSyncSelection.syncSelection}
     */
    function createSyncSelection() {
        var syncSelection = {
            upload: [],
            tool: [],
            content: []
        };

        jQuery('div#syncDialog [id*="uniSyncUp"]:enabled:checked').each(function() {
            if (jQuery(this).data('tool')) {
                syncSelection.upload.push(
                        {
                            toolName: jQuery(this).data('tool'),
                            toolLabel: jQuery(this).data('label'),
                            size: jQuery(this).data('size'),
                            status: 'waiting'
                        }
                );
            }
        });
               
        jQuery('div#syncDialog [id*="uniSyncDown"]:enabled:checked').each(function() {
            if (jQuery(this).data('tool') && !UNIPOOLE_GLOBAL.toolSyncStatus[jQuery(this).data('tool')].toolSync) {
                syncSelection.tool.push(
                        {
                            toolName: jQuery(this).data('tool'),
                            toolLabel: jQuery(this).data('label'),
                            size: jQuery(this).data('size'),
                            status: 'waiting'
                        }
                );
            }
            if (jQuery(this).data('tool') && !UNIPOOLE_GLOBAL.toolSyncStatus[jQuery(this).data('tool')].contentSync) {
                syncSelection.content.push(
                        {
                            toolName: jQuery(this).data('tool'),
                            toolLabel: jQuery(this).data('label'),
                            size: jQuery(this).data('size'),
                            status: 'waiting'
                        }
                );
            }
        });

        return syncSelection;
    }

    /**
     * Finds the nect item to sync by looking for the waiting status
     * 
     * @param {type} syncSelection
     * @returns {Object}
     */
    function getNextSync(syncSelection) {
        for (var i = 0; i < syncSelection.upload.length; i++) {
            if (syncSelection.upload[i].status === 'waiting') {
                return {toolName: syncSelection.upload[i].toolName, action: 'upload'};
            }
        }
        for (i = 0; i < syncSelection.tool.length; i++) {
            if (syncSelection.tool[i].status === 'waiting') {
                return {toolName: syncSelection.tool[i].toolName, action: 'tool'};
            }
        }
        for (i = 0; i < syncSelection.content.length; i++) {
            if (syncSelection.content[i].status === 'waiting') {
                return {toolName: syncSelection.content[i].toolName, action: 'content'};
            }
        }
        return {action: 'done'};
    }

    /**
     * Gets the next sync event and calls sync service
     * 
     * @param {type} syncSelection
     * @returns {unresolved}
     */
    UnipooleSynchronise.prototype._runSync = function(syncSelection) {
        var syncAction = getNextSync(syncSelection);

        if (syncAction.action === 'done') {
            jQuery('#uniSyncCompleted').show();
            var sync = this;
            unipooleInit.updateGlobalUnipooleData(function() {
                sync.checkSyncStatus();
            });
            return;
        } else {
            this._callSyncService(syncSelection, syncAction);
        }
    };

    /**
     * Changes the status display in the sync status dialog
     * 
     * @param {type} syncSelection
     * @param {type} syncAction
     * @param {type} status
     * @param {type} style
     */
    function setStatusDisplay(syncSelection, syncAction, status, style) {
        var toolStatus = unipooleUtils.getArrayItemFromKeyValue(syncSelection[syncAction.action], 'toolName', syncAction.toolName);
        toolStatus.status = status;
        jQuery('[data-tool="' + syncAction.toolName + '-' + syncAction.action + '-status"]').removeClass().addClass(style).attr('title', status);
    }

    /**
     * Calls the sync service on the node server. Ons success proceeds to next sync
     * 
     * @param {type} syncSelection
     * @param {type} syncAction
     * @returns {undefined}
     */
    UnipooleSynchronise.prototype._callSyncService = function(syncSelection, syncAction) {
        setStatusDisplay(syncSelection, syncAction, 'loading', 'uniLoading');
        var sync = this;
        jQuery.ajax({
            url: 'sync/' + syncAction.action + '/' + syncAction.toolName,
            type: "POST",
            data: JSON.stringify({password: UNIPOOLE_GLOBAL.password}),
            contentType: 'application/json'
        }).success(function(data) {
            try {
                var dataObject = JSON.parse(data);
                if (dataObject.status === 'SUCCESS') {
                    setStatusDisplay(syncSelection, syncAction, 'synced', 'uniSynced');
                    unipooleUtils.logEvent("unipoole.sync", syncAction.action, syncAction.toolName);
                    sync._runSync(syncSelection);
                    unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.INFO, "Sync success", data, 0);
                } else {
                    setStatusDisplay(syncSelection, syncAction, 'synced', 'uniError');
                    unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, "Sync failed", data, 4900);
                    sync._runSync(syncSelection);
                }
            } catch (exception) {
                setStatusDisplay(syncSelection, syncAction, 'synced', 'uniError');
                unipooleMessage.writeLogFile(UNIPOOLE_GLOBAL.ERROR, "Sync failed", exception, 4900);
                sync._runSync(syncSelection);
            }
        });
    };


    /**
     * Compares the version numbers of the data from the server with the local version
     * 
     * @param {String} toolName
     * @param {Object} data
     * @param {String} property - the property to compare
     * 
     * return boolean true if tool is in sync
     */
    UnipooleSynchronise.prototype.checkToolSync = function(toolName, data, property) {
        if (!data.tools) {
            return false;
        }
        var serverTool = data.tools[toolName];
        var localTool = data.toolsLocal[toolName];
        // Just for safety in dev
        if (!serverTool || serverTool['current' + property] === 'Unknown' || !serverTool['current' + property]
                || (serverTool.codeSynchSize === 0 && serverTool.contentSynchSize === 0)) {
            return true;
        }
        return localTool['client' + property] === serverTool['current' + property];
    };

    window.unipooleSync = new UnipooleSynchronise();

})(window.unipooleUtils, window.unipooleMessage);
