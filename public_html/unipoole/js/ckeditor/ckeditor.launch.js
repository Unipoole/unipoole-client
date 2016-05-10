/**
 * This contents is adapted from ckeditor.launch.js from sakai
 * /library/editor/ckeditor.launch.js
 */
CKEDITOR.editorConfig = function( config ) {
    // Create defaults if not exist
    var sakai = sakai || {};
    sakai.editor = sakai.editor || {};
    
    
    var language = sakai.locale && sakai.locale.userLanguage || '';
    var country = sakai.locale && sakai.locale.userCountry || null;
    
    config.skin=  'v2';
    config.defaultLanguage = 'en';
    config.language = language + (country ? '-' + country.toLowerCase() : '');
    config.height = 310;
    //config.filebrowserBrowseUrl :'/library/editor/FCKeditor/editor/filemanager/browser/default/browser.html?Connector=/sakai-fck-connector/web/editor/filemanager/browser/default/connectors/jsp/connector' + collectionId + folder,
    //config.filebrowserImageBrowseUrl : '/library/editor/FCKeditor/editor/filemanager/browser/default/browser.html?Type=Image&Connector=/sakai-fck-connector/web/editor/filemanager/browser/default/connectors/jsp/connector' + collectionId + folder,
    //config.filebrowserFlashBrowseUrl :'/library/editor/FCKeditor/editor/filemanager/browser/default/browser.html?Type=Flash&Connector=/sakai-fck-connector/web/editor/filemanager/browser/default/connectors/jsp/connector' + collectionId + folder,
	//extraPlugins: (sakai.editor.enableResourceSearch ? 'resourcesearch,' : '')+'',


    // These two settings enable the browser's native spell checking and context menus.
    // Control-Right-Click (Windows/Linux) or Command-Right-Click (Mac) on highlighted words
    // will cause the CKEditor menu to be suppressed and display the browser's standard context
    // menu. In some cases (Firefox and Safari, at least), this supplies corrections, suggestions, etc.
	config.disableNativeSpellChecker = false;
	config.browserContextMenuOnCtrl = true;

    config.toolbar_Basic = 
    [
        ['Source', '-', 'Bold', 'Italic', 'Link', 'Unlink']
    ];
    config.toolbar_Full = 
    [
        ['Source','-','Templates'],
        // Uncomment the next line and comment the following to enable the default spell checker.
        // Note that it uses spellchecker.net, displays ads and sends content to remote servers without additional setup.
        //['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
        ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print'],
        ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
        ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote','CreateDiv'],
        '/',
        ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
					['atd-ckeditor'],
        ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
        ['BidiLtr', 'BidiRtl' ],
        ['Link','Unlink','Anchor'],
        (sakai.editor.enableResourceSearch
                ? ['ResourceSearch', 'Image','Movie','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak']
                : ['Table','HorizontalRule','Smiley','SpecialChar','PageBreak']),
        '/',
        ['Styles','Format','Font','FontSize'],
        ['TextColor','BGColor'],
        ['Maximize', 'ShowBlocks']
    ],
    config.toolbar= 'Full';
    config.resize_dir= 'vertical';
    config.extraPlugins+="movieplayer,wordcount";
    config.smiley_path="/unipoole/js/ckeditor/plugins/smiley/images/";
    
};

//To add extra plugins outside the plugins directory, add them here! (And in the variable)
(function() { 
	// TODO should the base path be fixed for the CKEDITOR object too?
	var basePath = "/unipoole/js/ckextraplugins/";
	
   CKEDITOR.plugins.addExternal('movieplayer',basePath+'movieplayer/', 'plugin.js'); 
   CKEDITOR.plugins.addExternal('wordcount',basePath+'wordcount/', 'plugin.js');
   
   CKEDITOR.on('instanceReady', function(ev) {
	   ev.editor.dataProcessor.writer.indentationChars = '';
	   ev.editor.dataProcessor.writer.lineBreakChars = '';
   });
	 /*
	  To enable after the deadline uncomment these two lines and add atd-ckeditor to toolbar
	  and to extraPlugins. This also needs extra stylesheets.
	  See readme for more info http://www.polishmywriting.com/atd-ckeditor/readme.html
	  You have to actually setup a server or get an API key
	  Hopefully this will get easier to configure soon.
	 */
	 //CKEDITOR.plugins.addExternal('atd-ckeditor',basePath+'atd-ckeditor/', 'plugin.js'); 
	 //ckconfig.atd_rpc='/proxy/atd';
	 //ckconfig.extraPlugins+="movieplayer,wordcount,atd-ckeditor,stylesheetparser";
	 //ckconfig.contentsCss = basePath+'/atd-ckeditor/atd.css';
   
   //SAK-22505
   CKEDITOR.on('dialogDefinition', function(e) {
       var dialogName = e.data.name;
       var dialogDefinition = e.data.definition;
       dialogDefinition.dialog.parts.dialog.setStyles({ position : 'absolute' });
   });
})();