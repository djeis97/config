var EXPORTED_SYMBOLS = ["fvd_single_Downloads"]; 



try{
	Components.utils.import("resource://gre/modules/Downloads.jsm");
}
catch( ex ){
}

try{
	var dm = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
}
catch( ex ){
	
}

var useNewStyle = false;

var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                        .getService(Components.interfaces.nsIXULAppInfo);

var osString = Components.classes["@mozilla.org/xre/app-info;1"]
				.getService(Components.interfaces.nsIXULRuntime).OS;

var majorV = appInfo.version.split(".")[0];


// Android doesn't supports Downloads.jsm
if(majorV >= 26 && osString != "Android") {
	useNewStyle = true;
}

//dump( appInfo.version + " on "+osString+"("+useNewStyle+")\n" );

if (typeof fvd_single_Downloads == "undefined") {

	fvd_single_Downloads = new function(){
		
		var self = this;
		
		var oldStyleListeners = [];
		
		var _lastDownloadId = 0;
		
		var _oldStyleListener = function(){
			
		};
		
		function _nextDownloadId(){
			_lastDownloadId++;
			
			return _lastDownloadId;
		}
		
		_oldStyleListener.prototype = {
			
			view: {},
			
			onProgressChange : function(prog, req, prog, progMax, tProg, tProgMax, dl)
			{
				if( this.view.onDownloadChanged ){
					this.view.onDownloadChanged( dl );
				}
			},

			onStateChange : function(prog, req, flags, status, dl)
			{						
				if( this.view.onDownloadChanged ){
					this.view.onDownloadChanged( dl );
				}			
			},

			onDownloadStateChange : function(state, dl)
			{
				if( this.view.onDownloadChanged ){
					this.view.onDownloadChanged( dl );
				}
			}
			
		};
		
		this.__defineGetter__( "canPause", function(){
			return !useNewStyle;
		} );
		
		this.cancelDownload = function( downloadId ){
			
			if( useNewStyle ){
				
				self.getActiveDownloads(function( dls ){
					
					for( var i = 0; i != dls.length; i++ ){
						if( dls[i].id == downloadId ){
							dls[i].cancel();
						}
					}
					
				});
				
			}
			else{
				
				dm.cancelDownload( downloadId );
				
			}
			
		};
		
		this.getDownloadStatusText = function( download ){
			
			var state = "undefined";
			
			if( "state" in download ){
				switch (download.state)
				{
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_DOWNLOADING:		
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_QUEUED:		
						state = "downloading";				
					break;
					
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_FINISHED:
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_SCANNING:				
						state = "succeeded";
					break;

					case Components.interfaces.nsIDownloadManager.DOWNLOAD_CANCELED:
						state = "canceled";
					break;

					case Components.interfaces.nsIDownloadManager.DOWNLOAD_PAUSED:
						state = "paused";	
					break;				

					case Components.interfaces.nsIDownloadManager.DOWNLOAD_FAILED:
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_BLOCKED_PARENTAL:
					case Components.interfaces.nsIDownloadManager.DOWNLOAD_BLOCKED_POLICY:
						state = "failed";
					break;
				}
			}
			else{
				
				if( !download.stopped ){
					state = "downloading";
				}
				else if( download.succeeded ){
					state = "succeeded";
				}
				else if( download.canceled ){
					state = "canceled";
				}
				else if( download.error ){
					state = "failed";
				}
				
			}
			
			return state;
			
		};
		
		this.getDownloadUrl = function( download ){
			
			if( download.source.spec ){
				return download.source.spec;
			}
			else{
				return download.source.url;
			}
			
		};
		
		this.getDownloadProgressInfo = function( download ){
			
			if( ("currentBytes" in download) && ("totalBytes" in download) ){
				// new maneer
				return {
					current: download.currentBytes,
					total: download.totalBytes
				};
			}
			else{
				// old maneer
				return {
					current: download.amountTransferred,
					total: download.size
				};
			}
			
		};
			
		this.createDownload = function( params, callback ){
							
			if( useNewStyle ){
				
				if( params.url.spec ){
					params.url = params.url.spec;
				}
							
				var promise = Downloads.createDownload({
					source: {
						url: params.url
					},
					target: params.targetFile
				});
				
				//dump( "Obtained promise " + promise + "\n" );
				
				promise.then( function( d ){
					//dump( "Promise completed "+d+"\n" );
					
					d.id = _nextDownloadId();
					
					var downloadsList = Downloads.getList( Downloads.PUBLIC );
					
					//dump("Request downloads list");
					
					downloadsList.then(function( list ){
						//dump("Downloads list obtained");
						
						list.add( d );
						
						//dump("Download added to list");					
					});	
					
					//dump("Call start");
				
					try{
						d.start().then( function(  ){
							
							//dump("Download finished successfully!\n");
							
						}, function( error ){
							dump( "Error while start download("+error.result+"), ("+error.becauseSourceFailed+")("+error.becauseTargetFailed+")\n" );
						} );	
					}
					catch( ex ){
						dump( "FAIL START DOWNLOAD: " + ex + "\n" );
					}
					
					//dump("Processed");
					
					callback( d );			
					
				}, function(){
					//dump( "Promise rejected " + arguments.length + "\n" );
				} );
			}
			else{
				var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
				persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES | Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE | Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
				
				var d = dm.addDownload(dm.DOWNLOAD_TYPE_DOWNLOAD, params.url, 
					params.targetPath, '', null, Math.round(Date.now() * 1000), null, persist, null);
				
				persist.progressListener = d.QueryInterface(Components.interfaces.nsIWebProgressListener);
				
				var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
				var window = windowMediator.getMostRecentWindow("navigator:browser");
				var privacyContext = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				persist.saveURI(d.source, null, params.refererUrl, null, null, d.targetFile, privacyContext);			
			
			
				callback( d );
			}
			
		};
			
		this.addView = function( _view ){
					
			if( useNewStyle ){
				var d = Downloads.getList( Downloads.PUBLIC );
				
				//dump( "Add downloads view in new maneer\n" );
				
				d.then(function( list ){
					//dump( "List obtained... Adding view...\n" );
					
					list.addView( _view );				
					
					//dump( "View added successfully\n" );
				});
			}
			else{
				var listener = new _oldStyleListener();
				listener.view = _view;
				
				oldStyleListeners.push( listener );	
				
				dm.addListener( listener );
			}
			
		};
		
		this.removeView = function( _view ){
			
			if( useNewStyle ){
				var d = Downloads.getList( Downloads.PUBLIC );
				
				d.then(function( list ){
					list.removeView( _view );
				});
			}
			else{
				
				// search index by view in old style listeners
				
				var index = -1;
				for( var i = 0; i != oldStyleListeners.length; i++ ){
					if( oldStyleListeners[i].view == _view ){
						index = i;
						break;
					}
				}
				
				if( index != -1 ){
					dm.removeListener( oldStyleListeners[index] );
					oldStyleListeners.splice( index, 1 );
				}
				
			}
			
		};
		
		this.getActiveDownloads = function( callback ){
			var result = [];
			
			if( useNewStyle ){
				var d = Downloads.getList( Downloads.PUBLIC );
								
				d.then( function( d ){
		
					var a = d.getAll();
							
					a.then(function( a ){	
						callback( a );
					});
					
				} );
			}
			else{
				var enumerator = dm.activeDownloads;
				
				while( enumerator.hasMoreElements() ){
					var download = enumerator.getNext().QueryInterface( Components.interfaces.nsIDownload );
					result.push( download );
				}
				
				callback( result );
			}
			
			
		};
		
	};

}
