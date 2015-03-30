function FVD_SINGLE(){
	
	const STREAM_LIST_URL = "chrome://fvd.single/content/fennec_streams_list.html";
	
	var detector = null;
	var sniffer = null;
	var downloadInstance = null;
	var observer = null;
	
	var propertiesBundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.properties');
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                          .getService(Components.interfaces.nsIPromptService);
                          
  var urlsWithMediaData = {};
  var pageactionUuid = null;
	
	var observerStruct = {
		
		observe: function(aSubject, aTopic, aData){
			switch (aTopic) {	
					
				case 'FVD.Single-Media-Detect':									
					dump( "FVD: media found on " + aData + "\n" );
					urlsWithMediaData[aData] = true;
					if (isUrlsEqual(BrowserApp.selectedBrowser.currentURI.spec, aData)) {
						showPageAction();						
					}
				
				break;
					
			}
		}				
				
	};
	
	function showPageAction() {
	  if(pageactionUuid) {
	    // already displayed
	    return;
	  }
    pageactionUuid = NativeWindow.pageactions.add({
      icon: "chrome://fvd.single/skin/fvd.single.icon_24.png",
      title: "Download media",
      clickCallback: function() {
        BrowserApp.addTab(STREAM_LIST_URL + "?url="+btoa(BrowserApp.selectedBrowser.currentURI.spec));        
      }
    });
    dump("FVD: page action showed\n");
	}	
	
	function hidePageAction() {
	  if(!pageactionUuid) {
	    // already hidden
	    return;
	  }
	  NativeWindow.pageactions.remove(pageactionUuid);
	  pageactionUuid = null;
	  dump("FVD: page action hide\n");
	}	
	

	
	function isUrlsEqual( u1, u2 ){
		
		u1 = u1.toLowerCase();
		u2 = u2.toLowerCase();		
		
		if( u1.indexOf("youtube.com") != -1 && u2.indexOf("youtube.com") != -1 ){
			var m1 = u1.match( /v=([^&]+)/i );
			var m2 = u2.match( /v=([^&]+)/i );
			if( m1 && m2 && m1[1] == m2[1] ){
				return true;
			}
		}
		
		return u1 == u2;
		
	}
	
	function mediaForUrl( activeUrl ){
		
		var _media = sniffer.get_files_all(),
		    media = {};
		// remove media that not for current url					
    for(var url in _media) {
      if(!isUrlsEqual( url, activeUrl )) {
        // check if activeUrl in media list
        for(var i in _media[url]) {
          var m = _media[url][i];
          if(isUrlsEqual( m.url, activeUrl )) {
            // user view video file directly in browser
            media[activeUrl] = {0: m};
          }
        }
      }
      else {
        media[url] = _media[url];
      }
    }
		var haveTypedMedia = false;
		for( var k in media ) {
			for( var j in media[k] ){
				if( "type" in media[k][j] ){
					haveTypedMedia = true;
					break;
				}							
			}						
		}
		if( haveTypedMedia ) {
			// remove not typed media
			for( var k in media ){
				for( var j in media[k] ){
					if( !("type" in media[k][j]) ){
						delete media[k][j];
					}								
				}							
			}
		}
		
		var mediaList = [];

		for( var url in media ){			
			for( var k in media[url] ){					
				mediaList.push( media[ url ][ k ] );				 
			}	
		}
		dump("FVD: Found media items: " + mediaList.length + "\n");
		return mediaList;
				
	}	
	
	function prepareFileSize( size ){	
		return Math.round(size / 1024 / 1024 * 100) / 100 + "MB"; 	
	}
	
	function refreshTab(tab) {  
	  var currentUrl = BrowserApp.selectedBrowser.currentURI.spec;    
    dump("FVD: Refresh: " + currentUrl + "\n");
    if(urlsWithMediaData[currentUrl]) {      
      showPageAction();
    }
    else {
      dump("FVD: Media NF for current url, but Media found for " + Object.keys(urlsWithMediaData).join("\n"));
      hidePageAction();
    }
	}
	
  function watchTab(event) {
    var tab = event.target;
    dump("FVD: add pageshow for " + tab.tagName + "\n");
    tab.addEventListener("pageshow", refreshTab, false);
  }
  
  function unwatchTab(event) {    
    var 
        browser = event.target,        
        closedUrl = browser.currentURI.spec;   
    dump("FVD: Close " + closedUrl + ", "+browser.tagName+"\n");
    delete urlsWithMediaData[closedUrl];
    // remove attached media
    var mediaRemovedCount = sniffer.remove_files_by_page_url(closedUrl);
    dump("FVD: Removed " + mediaRemovedCount + " media items for closed page\n");
    browser.removeEventListener("pageshow", refreshTab, false);
  }

	
	function init(){		
    window.BrowserApp.deck.addEventListener("TabOpen", watchTab, false);
    window.BrowserApp.deck.addEventListener("TabClose", unwatchTab, false);				
    window.BrowserApp.deck.addEventListener("TabSelect", function(event) {
      refreshTab(event.target);
    }, false);
		try{
			
			detector = Components.classes['@flashvideodownloader.org/single_site_detector;1'].getService(Components.interfaces.IFVDSingleDetector);
			sniffer = Components.classes['@flashvideodownloader.org/single_media_sniffer;1'].getService().wrappedJSObject;

			sniffer.allowYoutube = true;
			
			downloadInstance = new FVD_SINGLE_DOWNLOAD(true);	
				
		}
		catch( ex ){
			
			dump( "Fail init detector/sniffer " + ex + "\n"  );
			
		}
		
		try{
			observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			observer.addObserver(observerStruct, 'FVD.Single-Media-Detect', false);			
		}
		catch( ex ){
			
			dump( "Fail observer " + ex + "\n"  );
						
		}
		
		window.messageManager.loadFrameScript( "chrome://fvd.single/content/fennec_content.js", true );
				
		window.messageManager.addMessageListener("FVDSingle:Content:clickIcon", function( message ){
			
			var activeUrl = BrowserApp.selectedBrowser.currentURI.spec;

			
			buttons = [
				{
					label: propertiesBundle.GetStringFromName( "fennec.button.start_download" ),
					callback: function() {
						
						var media = mediaForUrl( activeUrl );
			
						var mediaNames = [];
						media.forEach( function( m ){							
							var name = prepareFileSize( m.size ) + ", " + m.ext + " - " + m.display_name
							mediaNames.push( name );
						} );
						
						var selected = {};
						
						promptService.select( window, propertiesBundle.GetStringFromName( "fennec.download_window.title" ), 
							propertiesBundle.GetStringFromName( "fennec.download_window.text" ), mediaNames.length, mediaNames, selected );
						
						var media = media[ selected.value ];
						var downloadId = downloadInstance.downloadByWindow(media.url, media.download_name ? media.download_name : media.file_title, "." + media.ext);
					  	
					}
				},
				{
					label: propertiesBundle.GetStringFromName( "fennec.button.hide_icon" ),
					callback: function() {
						
						message.target.messageManager.sendAsyncMessage( "FVDSingle:hideIcon", {
	
						} );
										
					}
				}
			];
			
			NativeWindow.doorhanger.show(propertiesBundle.GetStringFromName( "fennec.click_icon_message.title" ),
				propertiesBundle.GetStringFromName( "fennec.click_icon_message.text" ), buttons);

			
		});
		
		window.messageManager.addMessageListener("FVDSingle:Content:Download", function( message ){
			
			var media = message.json.media;
			
			var fileName = media.download_name || media.file_title || media.pn || "media";		
			
			fileName = fileName.replace(/[^\(\)a-z0-9\.]/ig, "-");
			
			var downloadId = downloadInstance.downloadByWindow(media.url, fileName, "." + media.ext);
			
		});
		
		window.messageManager.addMessageListener("FVDSingle:Content:cleanUp", function( message ){
			
			dump( "Clean UP!" );
			
		});
		
		window.messageManager.addMessageListener("FVDSingle:Content:getMediaSize", function( message ){
			
			sniffer.getSizeByUrl( message.json.url, function( _, size ){
				
				message.target.messageManager.sendAsyncMessage( "FVDSingle:urlSize", {
					url: message.json.url,
					size: size
				} );
							
			} );
			
		});
		
		window.messageManager.addMessageListener("FVDSingle:Content:requestMedia", function( data ){
			
			var activeUrl = data.json.url || BrowserApp.selectedBrowser.currentURI.spec;

			dump( "Found media request for " + activeUrl + "("+JSON.stringify(data.json)+")\n" );
			
			try{
				
				var mediaList = mediaForUrl( activeUrl );
				
				BrowserApp.selectedBrowser.messageManager.sendAsyncMessage( "FVDSingle:mediaResponse", {
					media: mediaList,
					// temp
					rawList: sniffer.get_files_all()
				} );
				
			}
			catch( ex ){
				dump( ex + "\n" );
			}
			
		});
		
		window.messageManager.addMessageListener("FVDSingle:Content:openUrl", function( data ){
			
			dump("OPEN URL " + data.json.url + "\n");
			
			var tab = BrowserApp.addTab( data.json.url );
						
		});
		
		
		
		dump( "FENNECT DOWNLOADER INITIATED\n" );
		
	}
	
	window.addEventListener( "load", function(){		

		init();

		
	}, false );
	
}

var fvd_single = new FVD_SINGLE();