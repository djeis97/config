// class describes downloads for specified window

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://fvd.single.modules/ad.js");
Components.utils.import("resource://fvd.single.modules/downloads.js");
Components.utils.import("resource://fvd.single.modules/misc.js");
Components.utils.import("resource://fvd.single.modules/settings.js");


function dumpp( x ) {
 	dump( '\n***********************************************************\n' );
	for ( var key in x ) {
		try {
			if (typeof x[key] == 'undefined') 	dump(key + '  = undefined \n');
			else if (typeof x[key] == 'function') 	dump(key + '  = function \n');
			else								dump(key + '  =  ' + x[key]+'\n');
		} catch(e) {
			dump(key + '  - exception \n');
		}	
	}	
	dump( '\n***********************************************************\n' ); 
}

(function(){
	
	const FILE_STATUS_NORMAL = 0;
	const FILE_STATUS_DOWNLOADING = 1;
	const FILE_STATUS_DOWNLOADED = 2;
	const FILE_STATUS_ERROR = 3;
	const FILE_STATUS_PAUSED = 4;
	
	const DEFAULT_WINDOW_WIDTH = 900;
	const DEFAULT_WINDOW_HEIGHT = 400;
	
	const MIN_WINDOW_HEIGHT = 500;
	const MIN_PLAYER_WIDTH = 250;
	const DEFAULT_PLAYER_WIDTH = 400;
	
	const DOWNLOADING_PAGE_URL_COLOR = "#3366FF";     
	
	var osString = Components.classes["@mozilla.org/xre/app-info;1"]
				.getService(Components.interfaces.nsIXULRuntime).OS;
	
	var DIRECTORY_SEPARATOR = osString == "WINNT" ? "\\" : "/";

	var windowDownloadInfo = function(  ){
		this.url = null; // window url
		this.media = {}; // list of downloadable files
		this.haveDownloadLinksWithFormat = false; // this is for youtube special option. If window contents links with format, addition links without format is declined.
		this.adDisplay = false; //state of ad on page
		this.faviconUrl = null; // url to favicon image
		this.sniffer = null; // sniffer object
		this.viewed = false; // flag that shows user view this url or not
		this.adLink = ""; // link to ad
		
		
			
		this.updateComboboxTimeout = null; // this for deffered run of update combobox
		
		this._prepareMediaList = function( list ){
			for(var i in list){
				list[i] = this._prepareMediaFile( list[i] );
			}
			return list;
		}
	

		this.getAdLink = function(){
			return this.adLink;
		}
		
		this.getMedia = function(){
			if(!this.haveDownloadLinksWithFormat){
				return this.media;
			}
			
			var result = {};
			// filter links without format
			for( var i in this.media ){
				if( !("yt_format" in this.media[i]) ){		// if( !("type" in this.media[i]) ){ везде убрали issue462
					continue;
				}
				result[i] = this.media[i];
			}
			
			return result;
		}
		
		this.getMediaCount = function(){
			return this._objLength( this.media );
		}
		
		this.haveDownloadingMedia = function(){			
			for( var k in this.media ){
				if( this.media[k].status == FILE_STATUS_DOWNLOADING || this.media[k].status == FILE_STATUS_PAUSED ){
					return true;
				}
			}
			return false;
		}
			
		this._objLength = function (obj){
			var count = 0;
			for( var i in obj ){
				count++;
			}
			return count;
		}
		
		this._prepareMediaFile = function( file ){
			if( !("status" in file)){
				file.status = FILE_STATUS_NORMAL;			
			}
			if( !("downloadId" in file))	file.downloadId = 0;	
			if( !("download_info" in file))	file.download_info = [];	
			
			return file;
		}
		
		this.setMedia = function( listMedia ){
			this.media = {};
			this.addMediaList( listMedia );
		}
		
		
		this.addMediaFile = function( fileInfo ){
			if( (fileInfo.url in this.media) ){
				return false;
			}
			// not add ad
			if( fileInfo.ad ){
				return false;
			}

			if( "yt_format" in fileInfo ){
				this.haveDownloadLinksWithFormat = true;
			}
			else{
				if( this.haveDownloadLinksWithFormat ){
					return false;
				}			
			}
			// if this file from youtube(have field yt_format), check for this format already exists in media, if exists not add media
			this.media[fileInfo.url] = this._prepareMediaFile( fileInfo );
		}
		
		// ---------------------------------------------------
		this.addMediaList = function( listFiles ){
			// pre check for any video that have format and checks if list have ad and not have another links
			var haveAdLinks = false;
			var haveNotAdLinks = false;
			for( var i in listFiles ){
				if( "yt_format" in listFiles[i] ){
					this.haveDownloadLinksWithFormat = true;
				}
				if( listFiles[i].ad ){
					this.adLink = listFiles[i].url;
					haveAdLinks = true;
				}
				else{
					haveNotAdLinks = true;
				}
			}		
			
			// check for only ad
			if( haveAdLinks && !haveNotAdLinks ){
				this.adDisplay = true;
			}
			else{
				this.adDisplay = false;
			}
			
			// save old media in local var
			var oldMedia = this.media;
			this.media = {};
			
			for( var i in listFiles ){			
				// check if old media have this file
				var foundInOldMedia = false;
				if( i in oldMedia ){
					listFiles[i].status = oldMedia[i].status;
					listFiles[i].downloadId = oldMedia[i].downloadId;
					listFiles[i].download_info = oldMedia[i].download_info;
					if( "size" in oldMedia[i]){
						listFiles[i].size = oldMedia[i].size;
					}
					
					
					foundInOldMedia = true;
				}
	
				if( !foundInOldMedia ){
					if( "yt_format" in listFiles[i] ){
						for( var i in oldMedia ){
							var m = oldMedia[i];
							if( "yt_format" in m ){
								if( m.yt_format == listFiles[i].yt_format ){																							
									listFiles[i].status = m.status;
									listFiles[i].downloadId = m.downloadId;
									listFiles[i].download_info = m.download_info;
									foundInOldMedia = true;
									break;
								}
							}
						}
					}
				}		
				
				this.addMediaFile( listFiles[i] );
			}	
			
			// check if old media have downloading files, then add it to current media if not added
			
			for( var url in oldMedia ){
				if( oldMedia[url].status == FILE_STATUS_DOWNLOADING ){
					if( !( url in this.media ) ){
						this.addMediaFile( oldMedia[url] );
					}
				}
			}	
		}
		
		this.setFilePlaying = function( url, playing ){
			if( !(url in this.media) ){
				return false;
			}
			
			this.media[url].playing = playing;
			
			return true;
		}
		
		this._removeNotFormatDownloadLinks = function(){
			// remove from snippets and from internal this.media
			for( var i in this.media ){
				var info = this.media[i];
				if( !("yt_format" in info) ){
					if( info.snipet ){
						var snipet = document.getElementById( info.snipet );
						if( snipet ){
							snipet.parentNode.removeChild( snipet );						
						}
					}
					
					delete this.media[i];
				}			
			}
		}
		
		this._assignSnipetForMediaUrl = function( mediaUrl, snipetId ){		
			for( var i in this.media ){
				var info = this.media[i];
				if( info.url == mediaUrl ){
					this.media[i].snipet = snipetId;
					break;
				}
			}		
		}
		
		this.setFileStatus = function( url, status ){
			if( !(url in this.media) ){
				return false;
			}
			
			this.media[url].status = status;
			
			return true;
		}
		
		this.setDownloadId = function( url, downloadId ) {
		
			if( !( url in this.media ) )	return false;
			
			this.media[url].downloadId = downloadId;
		}	

		this.setDownload_FullHD = function( url, videoId, audioId )	{
			if( !( url in this.media ) )	return false;
			
			this.media[url].downloadId = videoId;
			this.media[url].download_info = { video_id: videoId, audio_id: audioId, video_state: false, audio_state: false };
			
		}	

/*		this.setDownload_state_fullHD = function( dl ) {
		
			dumpp(dl);
		
		}*/
		
		
		this.setFileSize = function( url, size ){
			
			if( !size ){
				return false;
			}
			
			if( !( url in this.media ) ){
				return false;
			}
							
			this.media[url].size = size;
			
			return true;
		}
		
		this.getFileByDownloadId = function( downloadId ){

			for( var i in this.media ){

				if( this.media[i].downloadId == downloadId ){
					return this.media[i];
				}
			}
			return null;
		}
		
		this.emptyDownloadId = function( downloadId ){
			for( var i in this.media ){
				if( this.media[i].downloadId == downloadId ){
					this.media[i].downloadId = 0;
					return  true;
				}
			}
			return false;	
		}
		
		
		this.getFileByUrl = function( url ){
			if( url in this.media ){
				return this.media[url];
			}
			return null;
		},
		
		
		this._setAdDisplay = function(){
			this.adDisplay = true;		
		}
		
		this._setAdEnd = function(){
			this.adDisplay = false;
		}
	}
	
	const EXT_IMAGES = {
		"flv": "file_flv.png",
		"mp4": "file_mp4.png",
		"mp3": "fvd_mp3.png",
		"pdf": "file_pdf.gif",
		"webm": "file_webm.png",
		"swf": "file_swf.png",
		"3gp": "file_3gp.png",		
		"hd1080": "file_hd1080.png",		
		"4k": "file_4k.png"		
	};
		
		
	FVD_SINGLE_DOWNLOAD = function(passiveMode)
	{
		const DLBS_NORMAL = 0;
		const DLBS_DOWNLOADING = 1;
		const DLBS_ERROR = 3;
		const DLBS_DONE = 2;
		const DLBS_PAUSED = 4;
	
		this.PLAY_BUTTON_STATUS_DISABLED = 1;
		this.PLAY_BUTTON_STATUS_NOT_PLAYING = 2;
		this.PLAY_BUTTON_STATUS_PLAYING = 3;
	
		const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';
		const COUNTERS_KEY_BRANCH = SETTINGS_KEY_BRANCH + 'counters.';
	
		const BANNED_DOMAINS = ['ad-emea.doubleclick.net'];
	
		var self = this;
		
		var clearYTCookieMessageDisplayed = false;
		
		this.page_url  = "";
		
		this.button_dwnl_key = 1;
		
		this.passiveMode = passiveMode; // sign means this instance created not by download streams window(maybe main plugin JS create it)
		
		this.detector = null;
		this.registry = null;
		this.folder = null;
		this.ffmpeg_file = null;
		this.close_after_download = false;
		
		this.count_active_downloads = 0;
		
		this.showFullLinks = null;
		
		this._lastSnipetNum = 0;
		
		this.downloadWindows = {}; // list of windows and its contents
	
		this.onPageSnippets = []; // currently displayed files
	
		//this.downloadFullHD = []; 

		this.download_media_HD = null;   // для передачи в rkmMessage
		
		this.playerDisplayed = false;
		this._currentPlayingUrl = null;
	
		this.downloadInfoInst = function(){
			return new windowDownloadInfo();
		}
	
	
		this.copyToClipBoard = function( text ){
			
			gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);  
			gClipboardHelper.copyString( text );  			
			
		}
	
	
		this.getExtImage = function( data )
		{
			var extImage = "";
			if( "ext" in data && data.ext in EXT_IMAGES  ){
				extImage = data.ext;
			}
			if( "raw_file_ext" in data && data.raw_file_ext in EXT_IMAGES  ){
				extImage = data.raw_file_ext;
			}
			
			return extImage ? EXT_IMAGES[extImage] : null;
		}
	
		this.changeDefaultMode = function(){
			var newValue = document.getElementById("defaultMode").checked ? "full" : "compact";
		
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				branch.setCharPref('default_mode', newValue);
	
			} catch (e)
			{
	
			}
		}
		
		this.getDefaultMode = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				return branch.getCharPref('default_mode');
	
			} catch (e)	{	}
			return "full";
		}
		
		this.getDefaultFormats = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				return branch.getCharPref('default_format_type');
			} catch (e)		{	}
			return "mp4";
		}
	
		this.increase_youtube_download = function()
		{
			try{
				var branch = this.registry.getBranch(COUNTERS_KEY_BRANCH);
				try
				{
					branch.setIntPref('youtube', branch.getIntPref('youtube') + 1);
			
				} catch (e)
				{
					branch.setIntPref('youtube', 1);
				}			
			}
			catch( ex ){
				 
			}		
		};
		
		this.updateShowFullLinksState = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				this.showFullLinks = branch.getBoolPref('download.show_full_links');
	
			} catch (e)
			{
				this.showFullLinks = false;
			}
		}
		
		this.getSwfDisplayState = function()
		{
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				return branch.getBoolPref('download.swf_display' );
	
			} catch (e){
	
			}
			
			return false;
		};
		
		this.update_swf_display_state = function( value ){
			this.setSwfDisplayState( value );
			// display message
	
			if( value ){
				var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');			
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
	                        			.getService(Components.interfaces.nsIPromptService);
	
				prompts.alert(null, bundle.GetStringFromName("fvd.single.swf_display.alert.title"), bundle.GetStringFromName("fvd.single.swf_display.alert.text"));
			}
		}
		
		this.setSwfDisplayState = function( state ){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try{
				return branch.setBoolPref('download.swf_display', state );
	
			} catch (e){}
		}
		
		this.getAlwaysOnTopState = function()
		{
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				return branch.getBoolPref('download.always_on_top' );
	
			} catch (e){
	
			}
			
			return false;
		};
		
		this.update_always_on_top_state = function( value ){
			this.setAlwaysOnTopState( value );
			this.setRaised( value );
		}
		
		this.setAlwaysOnTopState = function( state ){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try{
				return branch.setBoolPref('download.always_on_top', state );
	
			} catch (e){}
		}
		
		
		// go to next url in menulist
		this.goToNextTab = function(){
			var list = document.getElementById( "fvd_single_download_pages_list" );
			
			if( list.itemCount == 0 ){
				// no any items to select
				return false; 
			}
			
			var indexToSelect;
			
			if( list.selectedIndex == list.itemCount - 1 ){
				indexToSelect = 0;		
			}
			else{
				indexToSelect = list.selectedIndex + 1;
			}
			
			this.setCurrentPage( list.getItemAtIndex(indexToSelect).value );		
		}
		
		// remove mediaWindow and close tab
		this.closeTab = function(){
			var url = document.getElementById("fvd_single_download_pages_list").value;
			
			var gBrowser = window.opener.gBrowser;
			
			var numTabs = gBrowser.browsers.length;;
			
			var found = false;
			
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = gBrowser.getBrowserAtIndex(index);
				if (url == currentBrowser.currentURI.spec) {
					//dump(currentBrowser + "\r\n");
					//currentBrowser.close();
					gBrowser.removeTab( gBrowser.tabContainer.childNodes[index] );
				}
			}
			
			this.removeMediaByUrl( url, true );
		}
		
		// open selected url in tab
		this.switchToTab = function(){
			var url = document.getElementById("fvd_single_download_pages_list").value;
			
			var gBrowser = window.opener.gBrowser;
			
			var numTabs = gBrowser.browsers.length;;
			
			var found = false;
			
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = gBrowser.getBrowserAtIndex(index);
				if (url == currentBrowser.currentURI.spec) {
					// The URL is already opened. Select this tab.
					gBrowser.selectedTab = gBrowser.tabContainer.childNodes[index];
					
					// Focus *this* browser-window
					browserWin.focus();
					
					found = true;
					break;
				}
			}
			
			if( !found ){
				this.navigate_url( url );
			}
					
		}
		
		// set current page url and refill window
		this.setCurrentPage = function( url ){
			this._setCurrentPageUrl( url );
			this.fillWindow();
		}	
		
		this._setCurrentPageUrl = function( url ){
			var el = document.getElementById( "fvd_single_download_content_of" );
			el.setAttribute( "value", url );		
			el.setAttribute( "tooltiptext", url );	
	
			this.page_url = url;
		}
	
		this.hide_review_message = function()
		{
			var b = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			b.setBoolPref('review_done', true);
	
			var rb = document.getElementById('fvd_single_review_block');
			if (rb != null) rb.hidden = true;
		};
	
		this.alert = function(text)
		{
			var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
			aConsoleService.logStringMessage(text);
		};
	
		this.removeMediaByUrl = function( page_url, forceRemove ){
			if( !(page_url in this.downloadWindows) ){
				return false;
			}
			
			var haveDownloadingFiles = false;
			
			if( !forceRemove ){
				if( this.downloadWindows[page_url].haveDownloadingMedia() ){
					return false;
				}			
			}		
				
			delete this.downloadWindows[page_url];		
		
			// if this is current url, set another url
			if( this.page_url == page_url ){
				var newPageUrl = "";
				for( newPageUrl in this.downloadWindows ){
					break;
				}
				
				if( !newPageUrl ){
					// not found any media - NOT close window
					//window.close();
				}
				else{
					this.page_url = newPageUrl;	
				}			
			}
			
			
			this.fillWindow();
		}
		
		this.new_data_obserber = {
	
			observe : function(aSubject, aTopic, aData)
			{
			
				switch(aTopic)
				{
					case 'FVD.Single-Download-New':
					{		
	
						var args = aSubject.wrappedJSObject;
						
						if( args.page_url ){
							self._setCurrentPageUrl( args.page_url );
						}
						
						var add = {};
						var media = args['media'];
						self._setWindowContent( self.page_url, media, args.favicons );
						self.fillWindow();						
						
						break;
					}
					
					case "FVD.Single-Download-Close-Tab":
						var args = aSubject.wrappedJSObject;
						self.removeMediaByUrl( args.url );					
					break;
			
					
				}
			}
		};
		
		this._getFileByDownloadId = function( downloadId ){

			for( var page_url in this.downloadWindows ){
				var file = this.downloadWindows[page_url].getFileByDownloadId( downloadId );
				if( file ){
					file.page_url = page_url;
					return file;
				}
			}
			
			return null;
		}
		
		this._setFileStatus = function( url, status ){
			for( var page_url in this.downloadWindows ){			
				if( this.downloadWindows[page_url].setFileStatus( url, status )){
					break;
				}
			}
		}
		
		this._emptyDownloadId = function( downloadId ){
			for( var page_url in this.downloadWindows ){
				if(this.downloadWindows[page_url].emptyDownloadId( downloadId )){
					break;
				}
			}
		}
	
		this.listener = {
		
			onDownloadChanged : function( dl )
			{

				var id = dl.id;
				var file = self._getFileByDownloadId( id );
				if( !file )	return;
				
				if( file.page_url == self.page_url ){
					//  if state changed
					
					// need for filter download another downloads with our urls
					//var id = dl.id;
					var url = '';
					var i = '';
	
					//var file = self._getFileByDownloadId( id );
					//if( !file )	return;
					
					url = file.url;
					
					if (url)
					{
						
						var state = fvd_single_Downloads.getDownloadStatusText( dl );
						
						switch (state)
						{
							case "downloading":
							
								self.set_dl_button_state.call(self, url, DLBS_DOWNLOADING);
								self._setFileStatus( url, FILE_STATUS_DOWNLOADING );							
			
					
								var progress = fvd_single_Downloads.getDownloadProgressInfo( dl );
							
								self.set_dl_button_progress( file.url, progress.current, progress.total );
							
							break;
							
							case "succeeded":
							{
								self.count_active_downloads--;
								
								self._emptyDownloadId( id );
								
								if( self.close_after_download && self.count_active_downloads == 0 ){
									window.close();
								}
								
								self._setFileStatus( url, FILE_STATUS_DOWNLOADED );	
								self.set_dl_button_state.call(self, url, DLBS_NORMAL);
								
								break;
							}
	
							case "canceled":
							{
								self.count_active_downloads--;		
								
								self._emptyDownloadId( id );
								
								self._setFileStatus( url, FILE_STATUS_NORMAL );
								self.set_dl_button_state.call(self, url, DLBS_NORMAL);
								break;
							}
	
							case "paused":
							
								self._setFileStatus( url, FILE_STATUS_PAUSED );		
								self.set_dl_button_state.call(self, url, DLBS_PAUSED);
								
								break;
							
	
		                    case "failed":
							{
								self.count_active_downloads--;		
								
								self._emptyDownloadId( id );
								
								self._setFileStatus( url, FILE_STATUS_ERROR );
								self.set_dl_button_state.call(self, url, DLBS_ERROR);
								break;
							}
						}
					}	
				
				}
					
				
			}
	
		};
	
	
		this._getSnipetNum = function(){
			this._lastSnipetNum++;
			return this._lastSnipetNum;
		}	
		
			
		this._objSize = function( o ){
			var size = 0;
			for( i in o ){
				size++;
			}
			return size;
		}
		
		this._currentDownloadWindow = function(){
			if( !this.page_url )
			{
				return null;
			}
			
			if( !(this.page_url in this.downloadWindows) )
			{
				return null;
			}
			
			return this.downloadWindows[ this.page_url ];
		}
		
		// update label who displays count of files for url
		this.setFilesCountLabel = function( count ){
			var label = document.getElementById( "fvd_single_download_count_content" );		
			label.value = ": " + count;
		}	
		
		this.rebuildPagesCombobox = function( value ){
			if(this.updateComboboxTimeout){
				return false; //rebuild are deffered
			}
			
			self._rebuildPagesCombobox( value );
		}
		
		//rebuild pages combobox
		this._rebuildPagesCombobox = function( value ){		
			var list = document.getElementById( "fvd_single_download_pages_list" );
			if( !list ){
				self.updateComboboxTimeout = null;
				return false;
			}
			
			value = value || list.value;	
			
			
			var itemsInList = [];
			
			for( var i = 0; i != list.itemCount; i++ ){
				itemsInList.push( list.getItemAtIndex(i).value );
			}
			
			for( var i = 0; i != itemsInList.length; i++ ){
				if( !(itemsInList[i] in this.downloadWindows) ){
					list.removeItemAt( i );
				}
			}
			
			for( page_url in this.downloadWindows ){
				if( itemsInList.indexOf( page_url ) == -1 ){
					list.appendItem( page_url, page_url, "" );	
				}						
			}
			
			
			// setup options styles
			for(var i = 0; i != list.itemCount; i++){
				var item = list.getItemAtIndex( i );	
				
				var page_url = item.value;
				if( !(page_url in this.downloadWindows) ){
					continue;
				}
				if( this.downloadWindows[page_url].viewed ){
					item.style.fontWeight = "normal";			
				}
				else{
					item.style.fontWeight = "bold";
				}
				
				if( this.downloadWindows[page_url].haveDownloadingMedia() ){
					item.style.color = DOWNLOADING_PAGE_URL_COLOR;				
				}
				else{
					item.style.color = "";
				}
				
			}
			
			
	
	
			if( value ){
				list.value = value;
			}
			
			self.updateComboboxTimeout = null; // clear deffer timeout for another updates
		}
		
		this.clearWindow = function(){
			for( var i = 0; i != this.onPageSnippets.length; i++ ){
				var el = document.getElementById( this.onPageSnippets[i] );
				if( !el ){
					continue;
				}
				
				el.parentNode.removeChild( el );	
			}
		}
		
		// remove all old sniptes and set clearly window state and fill window with content of specified url
		this.fillWindow = function( url ){		
			url = url || this.page_url;
							
			// set url as viewed if exists in windows
			if( url in this.downloadWindows ){
				this.downloadWindows[url].viewed = true;
			}
			
			self.rebuildPagesCombobox( url );	
						
			document.getElementById("fvd_single_download_favicon").src = "";
			
			// hide "nothing to download" label
			var nothingToDownloadHbox = document.getElementById( "fvd_single_download_nothing_to_download" );
			nothingToDownloadHbox.style.display = "none";
			
			// clear old snippets
			var list = document.getElementById( "fvd_single_download_snipets_list" );
			
			var placeMedia = {};
			if( url in this.downloadWindows ){
				placeMedia = this.downloadWindows[url].getMedia();
			}	
					
			for( var i = 0; i != this.onPageSnippets.length; i++ ){
				var el = document.getElementById( this.onPageSnippets[i] );
				if( !el ){
					continue;
				}
				
				if( !(el.getAttribute("url") in placeMedia) ){
					el.parentNode.removeChild( el );				
				}
			}
			
			
			// get downloadWindowElement
			if( !(url in this.downloadWindows) ){
				this.setFilesCountLabel( 0 );
				this._setCurrentPageUrl("");
				nothingToDownloadHbox.style.display = "block";
				return false;
			}
			var w = this.downloadWindows[ url ];
		
			this.setFilesCountLabel( w.getMediaCount() );
		
			// set favicon
			if( w.faviconUrl ){
				var faviconImage = document.getElementById("fvd_single_download_favicon");
				if( faviconImage ){
					if( faviconImage.src != w.faviconUrl ){
						faviconImage.src = w.faviconUrl;									
					}
				}
			}
			
			var tmp = document.getElementById('fvd_single_download_ad_snipet');
			
			if( w.adDisplay ){
				// display ad message and returns			
				tmp.style.display = "block";
				document.getElementById("fvd_single_download_view_ad_link").setAttribute("tooltiptext", w.getAdLink());	
	
				return;
			}
			else{
				// hide ad message
				tmp.style.display = "none";
			}
			
			this.onPageSnippets = [];
			
		
			var anySnipetPlaced = false;

			// заполняем	
			for( var i in placeMedia ){	
			
				var snipetId = this._placeSnipet( placeMedia[i] );
				
				if( snipetId ){
					w._assignSnipetForMediaUrl( i, snipetId );		
					this.onPageSnippets.push( snipetId );		
					anySnipetPlaced = true;
				}
			}
			
			if( !anySnipetPlaced ){		
				nothingToDownloadHbox.style.display = "block";
			}
		}
		
		// returns new snipet id on success, on fail return false
		
		this._prepareVideoSize = function( bytes ){
			var mbytes = bytes / (1024 * 1024);
			mbytes = Math.round( mbytes * 100 )/100;
			
			return mbytes;
		};

		// --------------------------------------------------------------------------------------------------------------
		this._placeSnipet = function( info ){
			
			var list = document.getElementById('fvd_single_download_snipets_list');
			var tmp = document.getElementById('fvd_single_download_snipet');
			
			if( !list || !tmp )			return false;
			if ( !opener.fvd_single.check_shows_format( info.ext, info.root_url ) )   return false;
			
			if ( !opener.fvd_single.check_shows_type( info.yt_type, info.root_url ) )   return false;
			
	 		var snipet = (document.evaluate('./xul:hbox[@url="' + info.url +'"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
			
			if( snipet ){
				return snipet.getAttribute( "id" );
			}
			else{
				// create new snipet
				
				var snipet = tmp.cloneNode(true);
				
				if( !snipet ){
					return false;
				}
				
				var label = (document.evaluate('./xul:label[@class="fvd_dllb"]', snipet, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				if (label) label.setAttribute('value',  this.showFullLinks ? info.url : info.display_name);
				
				var extImage = "";
				if( "ext" in info && info.ext in EXT_IMAGES  ){
					extImage = info.ext;
				}
				if( "raw_file_ext" in info && info.raw_file_ext in EXT_IMAGES  ){
					extImage = info.raw_file_ext;
				}
				if( "yt_type" in info && info.yt_type == 'full_hd'  ){
					extImage = 'hd1080';
					var type_os = opener.fvd_single.detectOS();
				}
				if( "yt_type" in info && info.yt_type == 'ultra_hd'  ){
					extImage = '4k';
					var type_os = opener.fvd_single.detectOS();
				}
				
				if( extImage ){								
					var img = (document.evaluate('./xul:image[@class="fvd_dltp_img"]', snipet, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
					if( img ){
						img.setAttribute("src", "chrome://fvd.single/skin/"+EXT_IMAGES[extImage]);
						img.style.display = "";
					}
				}
																			
				var qlabel = (document.evaluate('./xul:label[@class="fvd_dltp"]', snipet, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				if (qlabel)
				{
					if ('type' in info)
					{
						this.haveDownloadLinksWithFormat = true;
						qlabel.setAttribute('value', info['type']);
						qlabel.style.display = "";
					}
					else if( "ext" in info && info.ext && !(info.ext in EXT_IMAGES) ){
						qlabel.setAttribute('value', info['ext']);
						qlabel.style.display = "";
					}
					
					if( info.height ){
						qlabel.setAttribute('tooltiptext', info.height);
					}
				}
				
				
				var sizeLoadingImage = (document.evaluate('./xul:image[@class="fvd_dl_update_size_loading"]', snipet, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				
				if( info.size ){
					var sizeLabel = (document.evaluate('./xul:label[@class="fvd_dlsize"]', snipet, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
							
					
					if( sizeLabel ){
						sizeLabel.hidden = false;
						sizeLabel.setAttribute('value', this._prepareVideoSize( info.size ) + " MB");		
						sizeLoadingImage.hidden = true;
					}
					else{
					
					}
				}
				else{
					
					// send request to sniffer to update size
					this.sniffer.getSizeByUrl( info.url, function( url, size ){

						self.set_video_size( url, size );
					
						if( info.yt_id && !size && !clearYTCookieMessageDisplayed ){
							
							clearYTCookieMessageDisplayed = true;
							
							try{
								opener.fvd_single.displayYTClearCookieMessage( window );
								self.clearWindow();
								self.fillWindow();
							}
							catch( ex ){
								
							}
							
						}
						
					} );
				}
				
				snipet.removeAttribute('id');
				snipet.setAttribute('url', info.url);
				
				var snipetId = "snipet_"+this._getSnipetNum();
				snipet.setAttribute( "id", snipetId );
			
				list.appendChild(snipet);
				
				var playButtonStatus = info.playable ? this.PLAY_BUTTON_STATUS_NOT_PLAYING : this.PLAY_BUTTON_STATUS_DISABLED;
				
				if( info.playing ){
					playButtonStatus = this.PLAY_BUTTON_STATUS_PLAYING;
				}
										
				this._setPlayButtonStatus( info.url, playButtonStatus );	
				
				if( ("status" in info) ){
					switch( info.status ){								
						case FILE_STATUS_DOWNLOADED:
							this.set_dl_button_state( info.url, DLBS_NORMAL );
						break;
						case FILE_STATUS_DOWNLOADING:
							this.set_dl_button_state( info.url, DLBS_DOWNLOADING );
						break;
						case FILE_STATUS_ERROR:
							this.set_dl_button_state( info.url, DLBS_ERROR );
						break;
						case FILE_STATUS_PAUSED:
							this.set_dl_button_state( info.url, DLBS_PAUSED );
						break;
					}	
				}
	
			}
			
			return snipetId;
		};
		
		// ---------------------------------------------------------------------------------------	
		this._setPlayButtonStatus = function( url, status )
		{
			var list = document.getElementById('fvd_single_download_snipets_list');
			if (list)
			{
				var button = (document.evaluate('./xul:hbox[@url="' + url +'"]/xul:button[@class="fvd_dlplaybtn"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				if (button)
				{
					var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');
					
					var title = "";
					
					switch( status ){
						case this.PLAY_BUTTON_STATUS_PLAYING:
							title = bundle.GetStringFromName('fvd.toolbar.playing.txt');
							button.setAttribute( "disabled", true );
						break;
						case this.PLAY_BUTTON_STATUS_NOT_PLAYING:
							title = bundle.GetStringFromName('fvd.toolbar.play.txt');
							button.setAttribute( "disabled", false );	
						break;
						case this.PLAY_BUTTON_STATUS_DISABLED:
							title = bundle.GetStringFromName('fvd.toolbar.not_playable.txt');
							button.setAttribute( "disabled", true );	
						break;
					}
				
					button.setAttribute( "label", title );
				}
			}
		};
		
		this._setMediaAsPlaying = function( url, playing ){
			for( var i in this.currentWindows() ){
				if( this.currentWindows()[i].setFilePlaying( url, playing ) ){
					break;
				}
			}
			this._setPlayButtonStatus(url, playing ? this.PLAY_BUTTON_STATUS_PLAYING : this.PLAY_BUTTON_STATUS_NOT_PLAYING );
		};
		
		this.setup_downloads_buttons = function(info)
		{				
	
			
		};
		
		
		this.load_save_folder = function(){
			try
			{
				var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
				var str = branch.getComplexValue('download.folder', Components.interfaces.nsISupportsString);
				var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(str.data);
				if (file.exists() && file.isDirectory()){
					this.folder = file;
				}
				else{
					this.get_configured_folder();
				}
	
			} catch (e)
			{
				this.get_configured_folder();
			}
	
		};

		this.load_ffmpeg_file = function(){
			try		{
				var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
				var str = branch.getComplexValue('download.ffmpeg_file', Components.interfaces.nsISupportsString);
				var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(str.data);
				if ( file.exists() ){
					this.ffmpeg_file = file;
				}
				else{
					this.get_configured_ffmpeg_file();
				}
	
			} catch (e)		{
				this.get_configured_ffmpeg_file();
			}
	
		};
		
		this.get_configured_ffmpeg_file = function()	{

			var ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher);
			if (ww)	{
				var args = {};
				args.path = 'ffmpeg_file';
				args.wrappedJSObject = args;
			
				this.settings_window = ww.openWindow(window, 'chrome://fvd.single/content/fvd_settings.xul', '', 'chrome,titlebar=yes,toolbar,centerscreen,dialog=yes,minimizable=no,close=yes,dependent=yes', args);
				//ww.registerNotification(this.settings_observer_struct);
			}
			
			event.stopPropagation();
		
		};
		
		
		this.update_save_folder = function( newPath ){	
			try
			{			
				var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				str.data = newPath;
				branch.setComplexValue('download.folder', Components.interfaces.nsISupportsString, str);
			} catch (e){
				
			}	
		};
		
		// --------------------------------------------------------------------------
		this._setWindowContent = function( _url, media, favicons ){
			// check if window already registered
			var w = null;
			
			// set content for all pages
			
			for (var url in media) {

				if (!(url in this.downloadWindows)) {
					w = new windowDownloadInfo();
					w.url = url;
					if (favicons[url]) {
						w.faviconUrl = favicons[url];
					}
					this.downloadWindows[url] = w;
					w.setMedia(media[url]);
				}
				else {
					w = this.downloadWindows[url];
					if (favicons[url]) {
						w.faviconUrl = favicons[url];
					}
					w.addMediaList( media[url] );
				}
			}
	
		}
		
		// ---------------------------------------------------------------------------
		this.setRaised = function(raised){
			var Ci = Components.interfaces;
			var xulWin = window.QueryInterface(Ci.nsIInterfaceRequestor)
							.getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem)
								.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
									.getInterface(Ci.nsIXULWindow);
			xulWin.zLevel = raised ? xulWin.raisedZ : xulWin.normalZ;		
		}
		
		this.switchLikeStatus = function( show ){
			// hide all
			var elements = [  "like_yes_no",	"like_review"	];
			for( var i = 0; i != elements.length; i++ )
			{
				document.getElementById( elements[i] ).setAttribute("hidden", "true");			
				document.getElementById( elements[i] ).style.opacity = 0;
			}
			
			document.getElementById( show ).setAttribute("hidden", "false");			
			document.getElementById( show ).style.opacity = 1;
		}
		
		this.dislikeAddon = function(){
			var b1 = this.registry.getBranch(COUNTERS_KEY_BRANCH);
			b1.setIntPref( "like_message_after", 20 );//after 30 downloads show yes/no again
			b1.setIntPref( "youtube", 0 );
			
			document.getElementById('fvd_single_review_block').setAttribute("hidden", true);
		}
		
		this.likeAddon = function(){
			var b1 = this.registry.getBranch(COUNTERS_KEY_BRANCH);
			b1.setCharPref( "like_status", "like" );
			this.switchLikeStatus("like_review");
		}
		
		this.likePostReview = function(){
			this.navigate_url( "https://addons.mozilla.org/en-US/firefox/addon/flash-video-downloader-youtube/reviews/" );
			window.close();
		}
		
		this.likeAlreadyDone = function(){
			var b1 = this.registry.getBranch(COUNTERS_KEY_BRANCH);
			b1.setCharPref( "like_status", "already_done" );
			
			document.getElementById('fvd_single_review_block').setAttribute("hidden", true);
		}
		
		this.getActiveDownloads = function( callback ){
			
			fvd_single_Downloads.getActiveDownloads( callback );
			
		}
		
		this.setupADButton = function(){
			
			fvd_single_AD.getRotateItem( null, function( item ){
											
				if( item ){
					var button = document.getElementById("fvd_single_suite_button");
					button.setAttribute( "label", item.title );
					button.setAttribute( "adurl", item.url );							
				}
				else{
					
				}
				
			} );
			
		}
		
		this.init = function()
		{	
		
			if( !fvd_single_Downloads.canPause ){
				document.querySelector("#fvd_single_download_snipet .ddButton .pause")
					.setAttribute("hidden", true);
				document.querySelector("#fvd_single_download_snipet .ddButton .resume")
					.setAttribute("hidden", true);	
			}
		
			this.setupADButton();
			
			this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);	
			this.updateShowFullLinksState();
			
			var raised = this.getAlwaysOnTopState();
			this.setRaised( raised );	
			document.getElementById( "fvd_single_download_always_on_top" ).checked = raised;
			document.getElementById("fvd_single_download_display_swf").checked = this.getSwfDisplayState();
		
			window.removeEventListener('load', this.load_caller, false);
			window.addEventListener('unload', this.unload_caller, false);

	
			this.setWindowSize( true );

	
			if ('arguments' in window)
			{
				var args = window.arguments[0].wrappedJSObject;
				
				if( args.page_url ){
					this._setCurrentPageUrl( args.page_url );
				}
				
				// need extend media if these active download
							
				this.getActiveDownloads( function( activeDownloads ){				
					
					try{
						
						for( var i = 0; i != activeDownloads.length; i++ ){
							
							var activeDownload = activeDownloads[i];
							var activeDownloadUrl = fvd_single_Downloads.getDownloadUrl(activeDownload);
							
							for( var sourcePageUrl in args.media ){
								
								if( typeof args.media[sourcePageUrl][activeDownloadUrl] != "undefined" ){		
											
									args.media[sourcePageUrl][activeDownloadUrl].downloadId = activeDownload.id;		
																															
									switch( fvd_single_Downloads.getDownloadStatusText( activeDownload ) ){
										case "downloading":
											args.media[sourcePageUrl][activeDownloadUrl].status = FILE_STATUS_DOWNLOADING;	
										break;
										
										case Components.interfaces.nsIDownloadManager.DOWNLOAD_PAUSED:
											args.media[sourcePageUrl][activeDownloadUrl].status = FILE_STATUS_PAUSED;
								
										break;
									}
									
								}
								
							}
							
						}
						
						self._setWindowContent( self.page_url, args.media, args.favicons );		
						
						if( args.sniffer ){
							self.sniffer = args.sniffer;
						}
									
						self.fillWindow();
						
						args.media = null; // prevent zombie page saving
						
					}
					catch( ex ){
						
						dump( ex + "\n" );
							
					}
					
				} );				

			}
			
			try
			{
				this.detector = Components.classes['@flashvideodownloader.org/single_site_detector;1'].getService(Components.interfaces.IFVDSingleDetector);

	
 	       } catch (e) {};

	
	
			
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);

	
	
			this.load_cad_state();		
			this.folder_setup();
			this.load_save_folder();

	
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			if (observer) {
				observer.addObserver(this.new_data_obserber, 'FVD.Single-Download-New', false);
				observer.addObserver(this.new_data_obserber, 'FVD.Single-Download-Close-Tab', false);
			}

	
			var dm = Components.classes['@mozilla.org/download-manager;1'].getService(Components.interfaces.nsIDownloadManager);
			
			fvd_single_Downloads.addView( this.listener );	
			
			// -------------------------------------------------------------- ������ Like
			var rb = document.getElementById('fvd_single_review_block');
			var b1 = this.registry.getBranch(COUNTERS_KEY_BRANCH);
			try
			{
				var likeStatus = b1.getCharPref( "like_status" );
				
				if( likeStatus != "already_done" )
				{
					var y = b1.getIntPref('youtube');			
					if( likeStatus == "like" )
					{
						this.switchLikeStatus( "like_review" );
					}				
					else
					{
						if( y >= b1.getIntPref( "like_message_after" ) )
						{
							this.switchLikeStatus( "like_yes_no" );
						}
						else
						{
							rb.hidden = true;
						}
					}
				}
				else
				{
					rb.hidden = true;
				}			

			} catch (e)
			{
				rb.hidden = true;
			}
			
			if( this.getDefaultMode() == "full" ){
				document.getElementById( "defaultMode" ).checked = true;
			}	
				
		};

	
	
		this.uninit = function()
		{
			window.removeEventListener('unload', this.unload_caller, false);
			var dm = Components.classes['@mozilla.org/download-manager;1'].getService(Components.interfaces.nsIDownloadManager);
			
			fvd_single_Downloads.removeView( this.listener );
			
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			if (observer) {
				observer.removeObserver(this.new_data_obserber, 'FVD.Single-Download-New');
				observer.removeObserver(this.new_data_obserber, 'FVD.Single-Download-Close-Tab');			
			}

	
			this.observer = null;
			this.detector = null;
			this.registry = null;
		};

	
	
		this._stripSlashes = function( str ){
		    return (str + '').replace(/\\(.?)/g, function (s, n1) {
		        switch (n1) {
		        case '\\':
		            return '\\';
		        case '0':
		            return '\u0000';
		        case '':
		            return '';
		        default:
		            return n1;
		        }
		    });
		}

	
		

	
		this.extractFileNameFromUrl = function( url ){
			try{
				url = decodeURIComponent(url);
				url = url.split( "?" )[0];
				var tmp = url.split( /[\/\s]+/ );
				var filename = tmp[tmp.length - 1];
				if( !filename ){
					return null;
				}
				tmp = filename.split(".");
				
				var ext = null;
				
				if( tmp.length > 1 ){
					ext = tmp[tmp.length - 1];	
				}	
				
				if( !ext ){
					return null;
				}	
				
				return {
					"filename": filename,
					"extension": "."+ext
				};	
			}
			catch( ex ){
				return null;
			}
			
		}

		// ----- 
		this.downloadWindowsByUrl = function( page_url, url, callback ){
	
			var ext = '';
			var name = '';
			
			var fileData;				
			
			var media = this.downloadWindows[page_url].getMedia();
			
			// obtain filename for download
			
			var referer = null;
			
			if( url in media ){	
						
				// first check download_name
				if( "download_name" in media[url] && media[url].download_name )
				{
					name = media[url].download_name;
				}
				
				if( "ext" in media[url] )	ext = "." + media[url].ext;
				
				
				// check file title	
				if( !name )
				{				
					name = (('file_title' in media[url]) && (media[url].file_title != null)) ? media[url].file_title : '';
				}	
				
				referer = media[url].referer;
			}
			
			if( !ext || !name )
			{
				if( fileData = this.extractFileNameFromUrl( url ) )
				{
					if( !ext )	ext = fileData.extension;					
					if( !name )	name = fileData.filename;					
				}
			}
			
			this.downloadByWindow( url, name, ext, referer, function( id ){
			
				if( id )	
					self.downloadWindows[page_url].setDownloadId( url, id );
				
				if( callback ){
					callback( id );
				}
			} );
			
		};

		// ------------------------------------------
		this.downloadByUrl = function( url, callback ){
		
			var ext = '';
			var name = '';
			
			var fileData;				
			
			var media = this._currentDownloadWindow().getMedia();
			
			// obtain filename for download
			
			var referer = null;
			
			if( url in media ){	
						
				// first check download_name
				if( "download_name" in media[url] && media[url].download_name ){
					name = media[url].download_name;
				}
				
				if( "ext" in media[url] ){
					ext = "." + media[url].ext;
				}
				
				// check file title	
				if( !name ){				
					name = (('file_title' in media[url]) && (media[url].file_title != null)) ? media[url].file_title : '';
				}	
				
				referer = media[url].referer;
			}
			
			if( !ext || !name ){
				if( fileData = this.extractFileNameFromUrl( url ) ){
					if( !ext ){
						ext = fileData.extension;					
					}
					if( !name ){
						name = fileData.filename;					
					}
				}
			}
			
			if ( "ext_url" in media[url] && media[url].ext_url ) {
			
				this.downloadByWindowFullHD( media[url].yt_id, url, media[url].ext_url, name, ext, referer, function( id_video, id_audio, dir_path, file_name, file_ext ) {
				
					if( id_video ) {
					
						var ff = opener.fvd_single.downloadFullHD;
						ff.push({ 	url: url, 
									video_id: id_video, 
									audio_id: id_audio, 
									video_state: false, 
									audio_state: false,
									name: name,
									path: dir_path,
									file: file_name,
									ext:  file_ext
								});
						
						self._currentDownloadWindow().setDownloadId( url, id_video );
					}	
					
					if( callback )		callback( id_video );
				} );
			
			}
			else {
				this.downloadByWindow( url, name, ext, referer, function( id ){
					
					if( id ){				
						self._currentDownloadWindow().setDownloadId( url, id );
					}
				
					if( callback )	callback( id );
				} );
			}
		};
		
		// -------------------------------------------------------------------------------------------------------
		this.downloadByWindowFullHD = function( yt_id, url_video, url_audio, name, ext, referer, callback ){
		
			// проверим на наличие ffmpeg
			if (osString.toLowerCase() == "linux") {
			
				this.load_ffmpeg_file();				
		
				if (!this.ffmpeg_file) return;
			}
		
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');
			var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
			
		    var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var window = windowMediator.getMostRecentWindow("navigator:browser");
			try
			{
				fp.init(window, bundle.GetStringFromName('fvd.single.sfd.title.txt'), fp.modeSave);				
			}
			catch( ex )
			{
				// fails in fennec			
			}
			
			if (!ext) ext = '.mp4';
			if (!name) name = this.md5(url_video);	

			if ( ext == '.mp4' ) {
				fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.mp4.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.mp4.value.txt'));
			}
			else if ( ext == '.webm' ) {
				fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.webm.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.webm.value.txt'));
			}	
			fp.defaultExtension = ext;									
			
			this.load_save_folder();				
			
			name = this.escapeFileName( name );
			
			var dm = Components.classes['@mozilla.org/download-manager;1'].getService(Components.interfaces.nsIDownloadManager);
			var _dwnld = dm.userDownloadsDirectory;
			
			try
			{
				
				//var file_name = name + ext;
				var dir_path = this.folder.clone();
				var file_name = this.get_unique_name( this.folder.path, name, ext );
				var file_ext = ext;

				fp.defaultString = file_name;
				fp.displayDirectory = dir_path;
				
				var show_res = fp.show();
						
				if ((show_res == fp.returnOK ) || (show_res == fp.returnReplace))		{			
				
					var file_path = fp.file.path;									
					var dir_path = file_path.lastIndexOf(DIRECTORY_SEPARATOR);
					//if (dir_path == -1) dir_path = file_path.lastIndexOf("/");
					dir_path = file_path.substr(0, dir_path);
					this.update_save_folder( fp.displayDirectory.path );
					
/* 					if ( /^[A-Za-z0-9\:\\\_\-\+\.\,\/]+$/.test(dir_path) )  {
						this.update_save_folder( fp.displayDirectory.path );				
					}
					else {
						var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, 'ffmpeg', dir_path+' - error path dir');
						return; 					
					} */
					//_dwnld = dir_path;		
					var file_name = fp.file.leafName;

					if (file_name == null)	file_name = name;
					else					file_name = file_name.replace(".mp4","").replace(".webm","");									
									
					var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
					file.initWithPath(dir_path);
					file.append(file_name + ext);
					var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			
					this.start_download_url(url_video, ios.newFileURI(file), referer, function( id_video ){
					
										var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
//										file.initWithPath(folder_dwnld.path);
										file.initWithPath(dir_path);
										file.append('_tmp_audio_'+file_name );
										var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			
										self.start_download_url(url_audio, ios.newFileURI(file), referer, function( id_audio ){ 
										
																	callback( id_video, id_audio, dir_path, file_name, file_ext );
																	
																} );
									});
											
				}
				
			}
			catch( ex )
			{
				// fails on fennec
				
				dump( "!!!EXCEPTION (downloadByWindowFullHD)" + ex + "," + ex.stack + "\n" );
				
/*				var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
				var file = dm.defaultDownloadsDirectory;
				
				file = file.QueryInterface(Components.interfaces.nsIFile);
				
				file.append(name + ext);
				
				var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				
				var uri = iOService.newFileURI(file);
				
				var id = this.start_download_url(url_video, uri, referer, function( id ){
										//callback( id );
									});*/
		
			}

			return null;
		};
		// ----------------------------------------------
		this.get_unique_name = function( path_dir, path_file, ext ){
		
			for (var i=0; i<1000; i++) {
		
				if (i > 0) 	path = path_file + "("+i+")";
				else		path = path_file;
		
				var f = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
				f.initWithPath( path_dir );
				f.append( path+ext );
				try	{
					if( !f.exists() )   return path + ext;	
				}catch(e){}
		
			}
			
		};
		
		// -------------------------------------------------------------------------------------------------------
		this.download_state_FullHD = function(  dl ){
			var dwnlId = dl.id;

			var ff = fvd_single.downloadFullHD;
			for (var i=0; i<ff.length; i++) {
			
				if (ff[i].video_id == dwnlId)  ff[i].video_state = true;
				if (ff[i].audio_id == dwnlId)  ff[i].audio_state = true;
							
				if (ff[i].video_state && ff[i].audio_state) {
					if ( typeof ff[i].ext == 'undefined' || ff[i].ext == null ) ff[i].ext = '.mp4';
				
//					var f_video = ff[i].path+'\\_tmp_video_'+ff[i].file+'.mp4';
					var f_video = ff[i].path+DIRECTORY_SEPARATOR+ff[i].file+ff[i].ext;
					var f_audio = ff[i].path+DIRECTORY_SEPARATOR+'_tmp_audio_'+ff[i].file;
					var f_name =  ff[i].path+DIRECTORY_SEPARATOR+ff[i].file+ff[i].ext;
					self.download_run_ffmpeg( f_video, f_audio, f_name, ff[i].path, ff[i].file, ff[i].ext );
				
					ff.splice(i,1);
				}
			
			}
		};

		// ---------------------------------   переименуем   -----------------------------------------------------
		function rename_file( old_name, new_name)  {
		
			var f = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
			f.initWithPath( old_name );
			try	{
				if( f.exists() ) {
					f.moveTo(null, new_name);
					return new_name;
				}
				else {
					return null;
				}	
			}catch(e){
				dump("EXCEPTION:  moveTo() "+e+"\n");			
				return null;
			}
		
		}
		
		// ---------------------------------   удалим   -----------------------------------------------------
		function remove_file( file_name)  {
		
			var f = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
			f.initWithPath(file_name);
			try {
				if(f.exists())   	f.remove(true);
			} catch(e){		}
		
		}
		
		// -------------------------------------------------------------------------------------------------------
		this.download_run_ffmpeg = function(  file_video, file_audio, file_name, path_dir, path_file, path_ext  ){
		
			var uuu = new Date().getTime();
			
			this.alert("================\n"+file_video+"\n"+file_audio+'\n'+file_name+"\n==========================\n");
			dump("================\n"+file_video+"\n"+file_audio+'\n'+file_name+"\n"+path_dir+"  "+path_file+"  "+path_ext+"\n============"+uuu+"==============\n");

			AddonManager.getAddonByID("artur.dubovoy@gmail.com", function(addon){					
								// переименуем  video-файл
								var f_video_new = rename_file( file_video, '_tmp_video_' + uuu + path_ext);
								if (f_video_new == null) {
									return;
								}
			
								// переименуем  audio-файл
								var f_audio_new = rename_file( file_audio, '_tmp_audio_' + uuu + '.mp3');
								if (f_audio_new == null) {
									return;
								}
								
								file_video = path_dir+DIRECTORY_SEPARATOR+f_video_new;
								file_audio = path_dir+DIRECTORY_SEPARATOR+f_audio_new;
								var tmp_file = path_dir+DIRECTORY_SEPARATOR+uuu + path_ext;
			
								var addonLocation = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file.path;

								var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
								switch(osString) {
									case "Darwin":
										file.initWithPath(addonLocation+"/modules/ffmpeg/macos/ffmpeg");
									break;
									case "Linux":
										file.initWithPath(self.ffmpeg_file.path);
									break;
									default:
										file.initWithPath(addonLocation+"\\modules\\ffmpeg\\ffmpeg.exe");
									break;
								}

								if(!file.isExecutable()) {
									// file is not executable, try to chmod
									// it's can be occured on *nix systems
									file.permissions = 0755;
								}

								var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
								process.init(file);

								var args = [
										"-i",
										file_video,
										"-i",
										file_audio,
										"-c:v",
										"copy",
										"-c:a",
										"copy",
										tmp_file,
										"-y"
									];
								process.runAsync(args, args.length, {
													observe: function( support, topic, data ){
															if (topic != "process-finished") {
																self.alert("Failed FFMpeg\n");
																dump("Failed FFMpeg\n");
															}
															else if (process.exitValue != 0) {
																self.alert("FFMpeg returned exit code " + process.exitValue + "\n");
																dump("FFMpeg returned exit code " + process.exitValue + "\n");
															}
															else {
																// удалим временные файлы
																remove_file( file_video );
																remove_file( file_audio );
																
																// восстановим имя
																rename_file( tmp_file, path_file + path_ext );
 
																self.alert("Done!\n");
																dump("Done!\n");
															}
														}	
												});	
							});
		};	
		
		// -------------------------------------------------------------------------------------------------------
		this.downloadByWindow = function( url, name, ext, referer, callback ){
		  callback = callback || function(){};
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');
			var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
			
		    var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var window = windowMediator.getMostRecentWindow("navigator:browser");
			
			try
			{
				fp.init(window, bundle.GetStringFromName('fvd.single.sfd.title.txt'), fp.modeSave);				
			}
			catch( ex )
			{
				// fails in fennec			
			}
			
			if (!ext) ext = '.flv';
			if (!name) name = this.md5(url);		
			
			
			switch (ext)
			{
				case '.mp4':
				{
					fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.mp4.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.mp4.value.txt'));
					
					break;
				}
				
				case '.mp3':
				{
					fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.mp3.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.mp3.value.txt'));

					break;
				}

	
	
				case '.3gp':
				{
					fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.3gp.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.3gp.value.txt'));
					break;
				}

	
				case '.flv':
				{
					fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.flv.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.flv.value.txt'));

					break;
				}
				
				case '.webm':
				{
					fp.appendFilter(bundle.GetStringFromName('fvd.single.sfd.formats.webm.title.txt'), bundle.GetStringFromName('fvd.single.sfd.formats.webm.value.txt'));

					break;
				}
	
	
				default:
				{
					fp.appendFilters(fp.filterAll);
					break;
				}
			}
			
			if( ext ){
				try{
					fp.defaultExtension = ext;									
				}
				catch( ex ){
					
				}
			}
			
			this.load_save_folder();				
			
			name = this.escapeFileName( name );
			
			try{
				
				if( osString == "Android" ){
					throw "Android";
				}
				
				fp.defaultString = name + ext;
				fp.displayDirectory = this.folder.clone();
				
				var show_res = fp.show();
						
				if ((show_res == fp.returnOK ) || (show_res == fp.returnReplace))
				{						
					this.start_download_url(url, fp.fileURL, referer, function( id ){
						callback( id );
					});
											
					this.update_save_folder( fp.displayDirectory.path );				
				}
				
			}
			catch( ex ){
				// fails on fennec
								
				var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
				var file = null;
				try {
				  // trying to set user-defined folder
				  var folderPath = fvd_single_Settings.getStringVal("download.folder");
				  if(!folderPath) {
				    throw "nopath"; 
				  }
  				file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
          file.initWithPath(folderPath);
          if (file.exists() && file.isDirectory()){
            
          }
          else {
            throw "not found";
          }
				}
				catch(ex) {
				  file = dm.defaultDownloadsDirectory;
				}
				file = file.QueryInterface(Components.interfaces.nsIFile);
				
				var incr = 0;
				var newName = name;
				do{
				  if(incr){
				    newName = name + "-" + incr;
				  }				  
				  var checkFile = file.clone();
				  checkFile.append(newName + ext);
				  incr++;				  
				}
				while(checkFile.exists());
				
				file.append(newName + ext);
				
				//dump("Download to " + file.path + "\n");
				
				var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				
				var uri = iOService.newFileURI(file);
				
				var id = this.start_download_url(url, uri, referer, function( id ){
					callback( id );
				});
		
			}

			
			return null;
		};

		// -------------------------------------------------------------------------------------------------------
		this.quickDownload = function( url, name, ext, referer, callback ){
			
			this.load_save_folder();	
			
//			name = this.escapeFileName( name ) + ext;
			name = this.escapeFileName( name );
			name = this.get_unique_name( this.folder.path, name, ext );
			
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(this.folder.path);


			if (!(file.isDirectory() && file.isWritable()))
			{
				var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

				var txt = bundle.GetStringFromName('fvd.single.folder_premissions.txt');
				var title = bundle.GetStringFromName('fvd.single.error.title');

				var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, title, txt);
				
				return null;
			} else
			{
				file.append(name);
			}
			
			var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			
			return this.start_download_url(url, ios.newFileURI(file), referer, callback);
		};
		


		// -------------------------------------------------------------------------------------------------------
		this.escapeFileName = function( name ){
			
			var removeChars = /[\\\/:*?"<>|"']/g;
			
			return name.replace(removeChars, "");
		}
	
		this.currentWindows = function(){
			return this.downloadWindows;
		}

	
		this.download = function(event)
		{
			var i = (event.originalTarget.nodeName == 'hbox') ? event.originalTarget : event.originalTarget.parentNode;
		
			if (i)
			{
				
				if( event.target.getAttribute("state") == FILE_STATUS_DOWNLOADED ){
					
					this.navigate_url( "http://flashvideodownloader.org/fvd-suite/to/s/ff_mozilla_conve/" );
					
				}
				else{
					var url = i.getAttribute('url');
					if (url)
					{
						this.downloadByUrl( url );
					}					
				}

			}
		};


		this.pauseDownload = function( url ){
			
			try{
				var file = this._currentDownloadWindow().getFileByUrl( url );
				var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
				dm.pauseDownload( file.downloadId );							
			}
			catch( ex ){
				
			}
			
		}
		
		this.resumeDownload = function( url ){
			
			try{
				var file = this._currentDownloadWindow().getFileByUrl( url );
				var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
				dm.resumeDownload( file.downloadId );							
			}
			catch( ex ){
				
			}
			
		}
		
		this.cancelDownload = function( url ){
			
			try{
				var file = this._currentDownloadWindow().getFileByUrl( url );

				fvd_single_Downloads.cancelDownload( file.downloadId );
				
				self._setFileStatus( url, FILE_STATUS_NORMAL );
				self.set_dl_button_state(url, DLBS_NORMAL);
											
			}
			catch( ex ){
				
			}
			
		}
	
		
		this.set_default_formats = function(event)
		{	
			var ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher);
			if (ww)
			{
				var args = {};
				args.path = 'default_formats';
				args.wrappedJSObject = args;
			
				this.settings_window = ww.openWindow(window, 'chrome://fvd.single/content/fvd_settings.xul', '', 'chrome,titlebar=yes,toolbar,centerscreen,dialog=yes,minimizable=no,close=yes,dependent=yes', args);
				//ww.registerNotification(this.settings_observer_struct);
			}
			event.stopPropagation();
		}
		
		this.set_default_folder = function(event)
		{	
			var ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].getService(Components.interfaces.nsIWindowWatcher);
			if (ww)
			{
				var args = {};
				args.path = 'default_folder';
				args.wrappedJSObject = args;
			
				this.settings_window = ww.openWindow(window, 'chrome://fvd.single/content/fvd_settings.xul', '', 'chrome,titlebar=yes,toolbar,centerscreen,dialog=yes,minimizable=no,close=yes,dependent=yes', args);
				//ww.registerNotification(this.settings_observer_struct);
			}
			event.stopPropagation();
		}

		// ------------------  
		this.start_download_url_all = function(page_url, url, file_url, referer, callback)
		{
			var media = {};
			
			if( !this.passiveMode )
			{
				media = this.downloadWindows[page_url].getMedia();
			}
					
			if ( false /*!this.passiveMode && (!media['direct']) && this.detector.is_supported(url)*/ )
			{
				// nothing download by site from download window
				this.navigate_url('http://www.flashvideodownloader.org/download2.php?u=' + url);
			} else
			{
				var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
				var from_url = ios.newURI(url, null, null);
				var to_url = null;

	
				if (file_url == null)
				{
					try
					{
						var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
						file.initWithPath(this.folder.path);

	
						if (!(file.isDirectory() && file.isWritable()))
						{
							var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

	
							var txt = bundle.GetStringFromName('fvd.single.folder_premissions.txt')
							var title = bundle.GetStringFromName('fvd.single.error.title');

	
							var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
							prompts.alert(window, title, txt);
						} else
						{
							file.append(this.get_filename_bu_url(url));
							to_url = ios.newFileURI(file);
						}
		
					} catch (e)
					{
						var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

	
						var txt = bundle.GetStringFromName('fvd.single.folder_not_found.txt')
						var title = bundle.GetStringFromName('fvd.single.error.title');

	
						var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, title, txt);
					}
				} else
				{
					to_url = file_url;
				}
				
				
				
				if (from_url && to_url)
				{
				
					var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
					
					var refererUrl = null;
					
					if( referer ){
						try{
							refererUrl = ios.newURI(referer, null, null);								
						}
						catch( ex ){
							
						}
					}
					
					fvd_single_Downloads.createDownload({
						url: from_url,
						targetPath: to_url,
						targetFile: fvd_single_Misc.fileURIToPath( to_url.spec ),
						refererUrl: refererUrl
					}, function( dl ){
					
						callback( dl.id );
						
					});					
		
					if( !this.passiveMode ){
						this.downloadWindows[page_url].setFileStatus( url, FILE_STATUS_DOWNLOADING );
						this.set_dl_button_state(url, DLBS_DOWNLOADING);									
					}
					this.increase_youtube_download();
	
					self.count_active_downloads++;
	
					
				}
			}
			return null;
		};
		// --------------	
		this.quickDownloadAll = function( page_url, url, name, ext, referer, callback ){
					
			this.load_save_folder();	
						
			name = this.escapeFileName( name ) + ext;

			
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(this.folder.path);


			if (!(file.isDirectory() && file.isWritable()))
			{
				var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

				var txt = bundle.GetStringFromName('fvd.single.folder_premissions.txt')
				var title = bundle.GetStringFromName('fvd.single.error.title');

				var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
				prompts.alert(window, title, txt);
				
				return null;
			} else
			{
				file.append(name);
			}
			
			var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			
			return this.start_download_url_all(page_url, url, ios.newFileURI(file), referer, callback);
		}
		
		this.button_download_all = function(event, tip)
		{
			if (tip == 'format')
			{
				this.button_dwnl_key = 0;
				this.set_default_formats(event);
			}
			if (tip == 'folder')
			{
				this.button_dwnl_key = 0;
				this.set_default_folder(event);
			}
			if (tip == 'all')
			{
				if ( this.button_dwnl_key == 1 ) this.download_all(event);
				                 else this.button_dwnl_key = 1;
			}
		}
	
	
		// ---------------------------------------------------------------------
		this.is_tab_page = function(page_url){
			var gBrowser = window.opener.gBrowser;
			var numTabs = gBrowser.browsers.length;;
			var found = false;
			
			for (var index = 0; index < numTabs; index++) 
			{
				var currentBrowser = gBrowser.getBrowserAtIndex(index);
				if (page_url == currentBrowser.currentURI.spec) 
				{
					found = true;
				}
			}
			return found;
		}
	
		// ---------------------------------------------------------------------
		this.download_all = function(event)
		{
			
			var gBrowser = window.opener.gBrowser;
			//var current_url = gBrowser.mCurrentBrowser.currentURI.spec;
			var current_url = document.getElementById("fvd_single_download_pages_list").value;
			
			for( page_url in this.downloadWindows )
			{
				if ( page_url != current_url ) continue;
			
				var windowMedia = this.downloadWindows[page_url].getMedia();

				for (var i in windowMedia)
				{
					var info = windowMedia[i];
					
					if (info['direct'])
					{
						if ( !info.downloadId ) // skip all processed tasks
						{
							if( opener.fvd_single.check_shows_format( info['ext'], info['root_url'] ) ) {
							
								if (typeof info.yt_type != "undefined" && info.yt_type && (info.yt_type == "full_hd" || info.yt_type == "ultra_hd") ) continue;				
							
								var label;
								if( info.file_title )       label = info.file_title;
								else if(info.display_name)	label = info.display_name;
								else label = 'filename';
								
								(function( _page_url, _label, _info ){

									self.quickDownloadAll(_page_url, _info.url, _label, "." + _info.ext, _info.referer, function( downloadId ){

										if( downloadId )	{
											self.downloadWindows[_page_url].setDownloadId( _info.url, downloadId );
										}
										
									});		     			
								
								})( page_url, label, info );

								
//								var downloadId = this.downloadWindowsByUrl( page_url, info.url );                             // � �������� �����

						
							}					
						}
						else{

						}
				
					}
				}
			}
		};
		
		this.download_all_current = function(event)
		{
			var windowMedia = this._currentDownloadWindow().getMedia();
			
			for (var i in windowMedia)
			{
				var info = windowMedia[i];
				
				if (info['direct'])
				{
					if ( !info.downloadId ) // skip all processed tasks
					{
						if( opener.fvd_single.check_shows_format( info['ext'], info.url ) )  
						{
							var downloadId = this.downloadByUrl( info.url );//this.start_download_url(info.url, null);
							if( downloadId )
							{
								this._currentDownloadWindow().setDownloadId( info.url, downloadId );
							}
						}					
					}
				}
			}
		};
		
		/**
		 *  
		 * @param {String} url
		 * @param {String} file_url
		 * 
		 * 
		 */
		
		this.start_download_url = function(url, file_url, referer, callback)
		{
			var media = {};
			
			if( !this.passiveMode ){
				media = this._currentDownloadWindow().getMedia();
			}
					
			if ( false /*!this.passiveMode && (!media['direct']) && this.detector.is_supported(url)*/ )
			{
				// nothing download by site from download window
				this.navigate_url('http://www.flashvideodownloader.org/download2.php?u=' + url);
			} else
			{
				var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
				var from_url = ios.newURI(url, null, null);
				var to_url = null;

	
				if (file_url == null)
				{
					try
					{
						var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
						file.initWithPath(this.folder.path);

	
						if (!(file.isDirectory() && file.isWritable()))
						{
							var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

	
							var txt = bundle.GetStringFromName('fvd.single.folder_premissions.txt')
							var title = bundle.GetStringFromName('fvd.single.error.title');

	
							var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
							prompts.alert(window, title, txt);
						} else
						{
							file.append(this.get_filename_bu_url(url));
							to_url = ios.newFileURI(file);
						}
		
					} catch (e)
					{
						var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');

	
						var txt = bundle.GetStringFromName('fvd.single.folder_not_found.txt')
						var title = bundle.GetStringFromName('fvd.single.error.title');

	
						var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, title, txt);
					}
				} else
				{
					to_url = file_url;
				}
				
				
				
				if (from_url && to_url)
				{
					
					var dm = Components.classes['@mozilla.org/download-manager;1'].createInstance(Components.interfaces.nsIDownloadManager);
										
					var refererUrl = null;
					
					if( referer ){
						try{
							refererUrl = ios.newURI(referer, null, null);								
						}
						catch( ex ){
							
						}
					}	
								
					fvd_single_Downloads.createDownload( {
						url: from_url,
						targetPath: to_url,
						targetFile: fvd_single_Misc.fileURIToPath( to_url.spec ),
						refererUrl: refererUrl
					}, function( dl ){
						callback( dl.id );
					} );
					
					if( !this.passiveMode ){
						this._currentDownloadWindow(  ).setFileStatus( url, FILE_STATUS_DOWNLOADING );
						this.set_dl_button_state(url, DLBS_DOWNLOADING);									
					}
					
					this.increase_youtube_download();
	
					self.count_active_downloads++;
	
				}
			}
			return null;
		};

	
		this.saveWindowSize = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				if( this.playerDisplayed ){
					var playerVbox = document.getElementById( "fvd_toolbar_player_vbox" ).boxObject;	
					branch.setIntPref('download.playing_window_width', playerVbox.width);
					branch.setIntPref('download.playing_window_height', playerVbox.height);			
				}
				else{
					branch.setIntPref('download.window_width', window.innerWidth);
					branch.setIntPref('download.window_height', window.innerHeight);							
				}

	
	
			} catch (e)
			{

	
			}
		}
		
		this.setWindowSize = function( init ){
			var size = this.getExpectedWindowSize( init );	
			
			if( size.width > window.screen.width ){
				size.width = window.screen.width;
			}
			
			window.innerHeight = size.height;
			window.innerWidth = size.width;
			
			if( init ){
				if( window.screen.width == size.width && window.screen.height == size.height ){
					setTimeout( function(){
						window.maximize();
					} , 1 );
				}
				
				if(window.innerHeight <	MIN_WINDOW_HEIGHT){
					window.innerHeight = MIN_WINDOW_HEIGHT;
				}
				

	
			}
		}
		
		this.setupElementsSize = function(){		
			var winW = window.innerWidth;
			var winH = window.innerHeight;
			
			var downloadVbox = document.getElementById( "fvd_toolbar_download_vbox" );
			var playerVbox = document.getElementById( "fvd_toolbar_player_vbox" );		
				
			var mainBox = document.getElementById( "fvd_toolbar_main_hbox" );
			
		
			if(this.playerDisplayed){
				var downloadSize = this.getWindowSize(); 
												
				if( (window.screen.width - downloadSize.width) < (MIN_PLAYER_WIDTH) ){
					downloadSize.width = window.screen.width - MIN_PLAYER_WIDTH - 100;
					winW = window.screen.width;
					//window.innerWidth = winW;
				}
				
				downloadVbox.style.width = (downloadSize.width-12)+"px";
				playerVbox.style.width = (winW - downloadSize.width - 16)+"px";
							
				var player = document.getElementById( "player" );
				if( player ){
					player.width = Math.round(winW - downloadVbox.getBoundingClientRect().width - 20);
					player.height = (winH - 40);
				}
			}			
			else{
				downloadVbox.style.width = (winW - 12) + "px";
				playerVbox.style.width = "0px";		
			}
			

	
			
			mainBox.style.height = (winH-11)+"px"
			
		}
		
		
		this.getWindowSize = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			
			var width = DEFAULT_WINDOW_WIDTH;
			var height = DEFAULT_WINDOW_HEIGHT;
			try
			{
				if( branch.getIntPref('download.window_width') > 100 && branch.getIntPref('download.window_height') > 100 ){
					width = branch.getIntPref('download.window_width');
					height = branch.getIntPref('download.window_height');	
				}		

	
			} catch (e)
			{

	
			}	
			
			return {
				"width": width,
				"height": height
			};	
		}
		
		this.getPlayerWindowSize = function(){
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			
			var width = DEFAULT_PLAYER_WIDTH;
			var height = window.innerHeight;
				
			try
			{				
				width = branch.getIntPref('download.playing_window_width');
				height = branch.getIntPref('download.playing_window_height');		

	
			} catch (e)
			{
						
			}
			
			return {
				"width": width,
				"height": height
			};	
		}

	
		this.getExpectedWindowSize = function( init ){
			if( this.playerDisplayed ){
				var width = window.innerWidth;
				var height = window.innerHeight;
				
				var playerSize = this.getPlayerWindowSize();
				width += playerSize.width;
				
				return {
					"width": width,
					"height": height
				};
			}
			else{
				var size = this.getWindowSize();
				if( !init ){
					size.height = window.innerHeight;				
				}
				return size;
			}
		};
		
		this.click_display_player = function( event ){
			var i = (event.originalTarget.nodeName == 'hbox') ? event.originalTarget : (document.evaluate('./parent::xul:hbox', event.originalTarget, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
			if (i){
				var url = i.getAttribute('url');
				if (url){
					this.displayPlayer( url );				
				}
			}	
			
			this.setupElementsSize();		
		};
		
		this.hide_player_click = function(){	
			this.hidePlayer();
		};
		
		this.hidePlayer = function(){		
			this.playerDisplayed = false;
			
			if( this._currentPlayingUrl ){
				this._setMediaAsPlaying( this._currentPlayingUrl, false );			
			}

	
			this._currentPlayingUrl = null;
			
			if( window.innerWidth == window.screen.width ){
				this.saveWindowSize(); // update window size			
			}
			
			var elem = 	document.getElementById( "fvd_toolbar_download_player_div" );
			if(elem != null)
			{
				while( elem.firstChild )
				{
					elem.removeChild( elem.firstChild );
				}
			}
			
			this.setWindowSize();
			
			this.setupElementsSize();
		};
		
		
		this.displayPlayer = function( url ){	
			var noresize =	this.playerDisplayed; // if player already displayed, no resize window again
			
			this.playerDisplayed = true;
			
			if( this._currentPlayingUrl ){
				this._setMediaAsPlaying( this._currentPlayingUrl, false );			
			}
			
			this._setMediaAsPlaying( url, true );
			this._currentPlayingUrl = url;
			
 			var embedObj = document.createElement( "html:embed" );
			
			embedObj.setAttribute( "id", "player" );
			embedObj.setAttribute( "flex", "1" );		
			embedObj.setAttribute( "width", "100%" );		
			embedObj.setAttribute( "height", "100%" );				
			embedObj.setAttribute( "src", "chrome://fvd.single/content/player/MediaPlayer.swf" );	
			embedObj.setAttribute( "allowfullscreen", "true" );	
			embedObj.setAttribute( "allowscriptaccess", "always" );	
			embedObj.setAttribute( "flashvars", "autostart=true&amp;showstop=true&amp;usefullscreen=true&amp;file="+encodeURIComponent(url) );		
					
			//var html = "<html:embed id='player' flex='1' width='100%' height='100%' src='chrome://fvd.single/content/player/MediaPlayer.swf' allowfullscreen='true' allowscriptaccess='always' flashvars='autostart=true&amp;showstop=true&amp;usefullscreen=true&amp;file="+escape(url)+"'/>";
		
			var container = document.getElementById("fvd_toolbar_download_player_div");
			while( container.firstChild ){
				container.removeChild(container.firstChild);
			}
			
			container.appendChild( embedObj );
			
			if( !noresize ){
				this.setWindowSize();			
				this.setupElementsSize();			
			}

	
		};

	
		this.set_dl_button_progress = function( url, progress, maxProgress ){
			var list = document.getElementById('fvd_single_download_snipets_list');
			if (list) {
				var button = (document.evaluate('./xul:hbox[@url="' + url +'"]/xul:button[@class="fvd_dlbtn"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				if( button )
				{
					var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');
					var percents = Math.round( progress/maxProgress * 100 );
				
					var newLabel = bundle.GetStringFromName('fvd.single.downloading.txt') + percents+"%)";
							
					button.setAttribute( "label", newLabel );	
					
								
				}
				else{
					dump( "Error! Buttons not found for url " + url + "\n" );
				}
			}
		};
		
		this.setFileSize = function( url, size ){
			for( var i in this.downloadWindows ){
				if( this.downloadWindows[i].setFileSize( url, size ) ){
					break;
				}
			}
		};
		
		this.set_video_size = function( url, size ){
			try{
				self.setFileSize( url, size );
				
				var list = document.getElementById('fvd_single_download_snipets_list');
				if( list ){
					var label = (document.evaluate('./xul:hbox[@url="' + url +'"]/xul:label[@class="fvd_dlsize"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
					if( size ){
						label.value = this._prepareVideoSize( size ) + " MB";				
					}
					else{
						label.value = "N/A";
					}				
		
					label.hidden = false;
					
					var img_loading = (document.evaluate('./xul:hbox[@url="' + url +'"]/xul:image[@class="fvd_dl_update_size_loading"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;		
					img_loading.hidden = true;
				}			
			}
			catch( ex ){
				
			}
			
		};
		
		this.set_dl_button_state = function(url, state)
		{
			var list = document.getElementById('fvd_single_download_snipets_list');
			if (list)
			{
				var button = (document.evaluate('./xul:hbox[@url="' + url +'"]/xul:button[@class="fvd_dlbtn"]', list, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
				if (button)
				{
					button.setAttribute('state', state);

					button.setAttribute( "type", "button" );
					
					var menuButton = button.nextSibling;					
										
					var pauseMenuItem = menuButton.getElementsByClassName("pause")[0];
					var resumeMenuItem = menuButton.getElementsByClassName("resume")[0];
					
					menuButton.setAttribute( "hidden", true );
					
					pauseMenuItem.removeAttribute( "disabled" );
					resumeMenuItem.removeAttribute( "disabled" );					
							
					var title = '';
					var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');
					switch (state)
					{
						case DLBS_NORMAL:
						{
							title = bundle.GetStringFromName('fvd.single.download.txt');
							button.removeAttribute('disabled');
							break;
						}

	
						case DLBS_DOWNLOADING:
						{
							title = bundle.GetStringFromName('fvd.single.downloading.txt') + "0%)";
							button.setAttribute('disabled', 'true');
							//button.setAttribute( "type", "menu-button" );							
							resumeMenuItem.setAttribute( "disabled", "true" );
							
							menuButton.removeAttribute( "hidden" );
							
							break;
						}
						
						case DLBS_PAUSED:
						{
							title = bundle.GetStringFromName('fvd.single.paused.txt');
							button.setAttribute('disabled', 'true');
							
							pauseMenuItem.setAttribute( "disabled", "true" );							
							menuButton.removeAttribute( "hidden" );
							
							break;
						}

	
						case DLBS_DONE:
						{
							title = bundle.GetStringFromName('fvd.single.done.txt');
							button.removeAttribute('disabled');
							break;
						}

	
						case DLBS_ERROR:
						{
							title = bundle.GetStringFromName('fvd.single.error.txt');
							button.removeAttribute('disabled');							
							break;
						}
					}

	
					if (title) button.setAttribute('label', title);
				}
			}
		};

	
		this.get_document_item_by_listitem = function(i)
		{
			var oi = null;
			var url = (i.hasAttribute('url') ? i.getAttribute('url') : '');
			if (url)
			{			
				var media = self._currentDownloadWindow().getMedia();
								
				var obj = media[url]['node'];
				if (obj)
				{
					if( this.page_url != window.opener.gBrowser.contentDocument.location ){
						return false;
					}
					else{

	
					}
					
					oi = obj;
					/*
					if (obj.nodeName == 'embed' || obj.nodeName == 'object')
					{
						var d = (obj.ownerDocument.evaluate('./ancestor::html:object', obj, this.xul_ns_resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)).singleNodeValue;
						if (d) oi = d;
 	       		}
 	       		*/
				}
			
				
			}

	
			return oi;
		};

	
		this.getHTMLElementPos = function(obj) {
			var curleft = curtop = 0;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				}
				while(obj = obj.offsetParent);
			}
			
			
			return {
				"left": curleft,
				"top": curtop
			};
		};

	
		this.item_mouse_over = function(event)
		{
			var i = (event.originalTarget.nodeName == 'hbox') ? event.originalTarget : event.originalTarget.parentNode;
			
			if (i)
			{			
				var obj = this.get_document_item_by_listitem(i);
				if (obj)
				{
					var doc = obj.ownerDocument;
					var borderWidth = 5;
					var border = doc.getElementById( "__fvd_embed_border" );
					if( !border ){
						border = doc.createElement( "div" );
						border.id = "__fvd_embed_border";
						border.style.position = "absolute";
						border.style.borderRadius = "10px";
						border.style.border = borderWidth+"px solid rgba(255,0,0, 0.5)";
						border.style.zIndex = 1000000;
						doc.body.appendChild( border );
					}
					
					var w = obj.offsetWidth;
					var h = obj.offsetHeight;
					var pos = this.getHTMLElementPos( obj );
					
					border.style.width = w+"px";
					border.style.height = h+"px";
					border.style.top = pos.top - borderWidth + "px";
					border.style.left = pos.left - borderWidth + "px";
					
					border.style.display = "block";
					
					obj.focus();
					
					//obj.setAttribute('fvd_old_border', obj.style.border);
					//obj.style.border = '3px dotted red';
				}
				else{
					
				}
			}
		};

	
		this.item_mouse_out = function(event)
		{
			var i = (event.originalTarget.nodeName == 'hbox') ? event.originalTarget : event.originalTarget.parentNode;
			if (i)
			{			
				var obj = this.get_document_item_by_listitem(i);
				if (obj)
				{
					var doc = obj.ownerDocument;
					var border = doc.getElementById( "__fvd_embed_border" );
					if( border ){
						border.style.display = "none";
					}
					/*
					obj.style.border = obj.getAttribute('fvd_old_border');
					obj.removeAttribute('fvd_old_border');
					*/
				}
			}
		};

	
		this.get_configured_folder = function()
		{
			try
			{
				var dm = Components.classes['@mozilla.org/download-manager;1'].getService(Components.interfaces.nsIDownloadManager);
				this.folder = dm.userDownloadsDirectory;
			} catch (e) {}
		};

	
		this.folder_setup = function()
		{

	
		};

	
		this.folder_browse = function(event)
		{
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.settings.properties');
			var title = bundle.GetStringFromName('fvd.single.select_folder.title');

	
			var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
			fp.init(window, title, Components.interfaces.nsIFilePicker.modeGetFolder);
			if (this.folder != null) fp.displayDirectory = this.folder;

	
			if (fp.show() == Components.interfaces.nsIFilePicker.returnOK)
			{
				this.folder = fp.file;
				this.folder_setup();
				this.update_folder_state();
			}
		};

	
		this.xul_ns_resolver = function(prefix)
		{
			var ns = {
					'xul' : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
					'html' : 'http://www.w3.org/1999/xhtml'
			};
			return ns[prefix] || null;
		};
		
		this.getBrowser = function(){
			var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
			var mwnd = wm.getMostRecentWindow('navigator:browser');
			if (mwnd)
			{
				var gBrowser = mwnd.getBrowser();
				if (gBrowser)
				{
					return gBrowser;
				}
			}
			
			return  null;
			
		};
		
		
		this.navigate_url = function(url)
		{
			var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
			var mwnd = wm.getMostRecentWindow('navigator:browser');
			if (mwnd)
			{
				var gBrowser = mwnd.getBrowser();
				if (gBrowser)
				{
					var tab = gBrowser.addTab(url);
					if (tab) gBrowser.selectedTab = tab;
				}
			}
		};

	
		this.md5 = function(str)
		{
			var converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = 'UTF-8';
			
			var result = {};
			var data = converter.convertToByteArray(str, result);

	
			var ch = Components.classes['@mozilla.org/security/hash;1'].createInstance(Components.interfaces.nsICryptoHash);
			ch.init(ch.MD5);
			ch.update(data, data.length);
			var hash = ch.finish(false);
			
			var s = '';
			for (var i = 0; i < 16; i++)
			{
				s += ('0' + hash.charCodeAt(i).toString(16)).slice(-2);
			}
			return s;
		};

	
		
		this.update_cad_state = function()
		{
			var cb = document.getElementById('fvd_single_close_after_download');
			if (cb != null)
			{
				this.close_after_download = cb.checked;
				var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
				try
				{
					branch.setBoolPref('download.close_after_download', this.close_after_download);

	
				} catch (e) {}
			}
		};

	
	
		this.load_cad_state = function()
		{
			var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
			try
			{
				this.close_after_download = branch.getBoolPref('download.close_after_download');

	
			} catch (e)
			{
				this.close_after_download = false;
			}

	
			var cad_checkbox = document.getElementById('fvd_single_close_after_download');
			if (cad_checkbox != null) cad_checkbox.checked = this.close_after_download;
		};
	
	
	
		this.get_filename_bu_url = function(url)
		{
			var name = '';

	
			var windowMedia = this._currentDownloadWindow().getMedia();

	
			if (url.indexOf('?') != -1)
			{			
				if (url in windowMedia)
				{
					name = (('file_title' in windowMedia[url]) && (windowMedia[url].file_title != null)) ? windowMedia[url].file_title : '';
					name += ('ext' in windowMedia[url]) ? '.' + windowMedia[url]['ext'] : '.flv';
				}

	
				if (!name) name = this.md5(url) + ((url in windowMedia) ? (('ext' in windowMedia[url]) ? '.' + windowMedia[url]['ext'] : '.flv') : '.flv');
			} else
			{
				if (url.lastIndexOf('/') != -1) name = url.substr(url.lastIndexOf('/') + 1);
			}

	
			if (!name) name = this.md5(url) + '.flv';
			return name;
		};

	
		this.openDonateWindow = function(){
			openDialog( 'chrome://fvd.single/content/donate.xul', null, 'chrome,titlebar=yes,centerscreen,modal,dialog=yes,minimizable=no,resizable=no,close=yes' );
		};
	
		this.url_filtered = function(url)
		{
			if (url.match(/\b(?:https?|ftp):\/\/[-A-Z0-9.]+\/[-A-Z0-9+&@#\/%=~_|!:,.;]*\.swf/i) != null) return true;
			var drx = url.match(/\b(?:https?|ftp):\/\/([-A-Z0-9.]+)\//i);
			if (drx != null)
			{
				if (BANNED_DOMAINS.indexOf(drx[1]) != -1) return true;
			}
			return false;
		};
		
		if( !passiveMode ){	
			this.load_caller = function () {self.init.call(self)};
			this.unload_caller = function () {self.uninit.call(self)};
			window.addEventListener('load', this.load_caller, false);		
		}
		else{
			this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);	
		}

	
};	

})();
