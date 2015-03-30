var EXPORTED_SYMBOLS = ["fvd_single_Misc"]; 

Components.utils.import('resource://gre/modules/AddonManager.jsm');

if (typeof fvd_single_Misc == "undefined") {

	var fvd_single_Misc = {

		firstInstalledVersion: function( guid, callback, forceFirstVer ){
							
			Components.utils.import("resource://fvd.single.modules/settings.js");

			try{
				var ver = fvd_single_Settings.getStringVal( "first_installed_version" );
				callback( ver );	
			}
			catch( ex ){
				
				AddonManager.getAddonByID(guid, function(addon){
					
					var v = forceFirstVer ? forceFirstVer : addon.version;
					
					fvd_single_Settings.setStringVal( "first_installed_version", forceFirstVer ? forceFirstVer : addon.version )
					callback( v );		
					
				});
					
			}
			
		},
		
		getInstallDate: function(){
			
			Components.utils.import("resource://fvd.single.modules/settings.js");
			
			try{
				var time = fvd_single_Settings.getStringVal( "install_date" );				
				
				return parseInt(time);
			}
			catch( ex ){
				var time = new Date().getTime();
				fvd_single_Settings.setStringVal( "install_date", time )
				return time;
			}
			
		},
		
		appVersion: function(){
			
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo); 
			
			return info.version.split(".")[0];
			
		},
		
		getOS: function(){
			
			var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;  
			
			if( osString == "Darwin" ){
				return "mac"
			}
			else if( osString == "Linux" ){
				return "linux"
			}
			else{
				return "win";
			}			
			
		},
		
		objectsDiffFields: function( o1, o2, checkFields ){
			
			var fields = [];
			
			checkFields.forEach( function( field ){
			
				if( o1[field] && o1[field].trim ){
					o1[field] = o1[field].trim();
				}
				
				if( o2[field] && o2[field].trim ){
					o2[field] = o2[field].trim();
				}	
				
				if( o1[field] != o2[field] ){
					fields.push( field );
				}
				
			} );
			
			return fields;
			
		},
		
		readUrl: function( url, callback ){
			var request = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
			request.open('GET', url, true);   
			request.responseType = "text";
			try {
				request.send(null);  
			} catch (e) {  }
			request.onload = function(){
				callback( request.responseText );
			};
			return null;
		},
		
		ucfirst: function (str) {
			var f = str.charAt(0).toUpperCase();
			return f + str.substr(1);
		},
		

		compareHostAppVersionWith: function( compareVersion ){
			
			var info = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo); 		
			
			var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
			
			return  versionComparator.compare( info.version, compareVersion );
			
		},
		
		md5: function( str ){
			
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

			converter.charset = "UTF-8";
			var result = {};

			var data = converter.convertToByteArray(str, result);
			var ch = Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash);
			ch.init(ch.MD5);
			ch.update(data, data.length);
			var hash = ch.finish(false);
			
			// convert the binary hash data to a hex string.
			var s = [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
			
			return s;
			
			
		},
		
		toHexString: function (charCode){
			return ("0" + charCode.toString(16)).slice(-2);
		},
		
		fileToNativeUri: function(localFile){
			var ios = Components.classes["@mozilla.org/network/io-service;1"].
									 getService(Components.interfaces.nsIIOService);
			return ios.newFileURI(localFile);			
		},
		
		fileToURI: function( localFile ){
			var url = this.fileToNativeUri( localFile );	
			url = url.spec;
			
			return url;		
		},
		
		filePathToURI: function( path ){
			try{
				
				if( fvd_speed_dial_Misc.appVersion() < 13 ){
					var localFile = Components.classes["@mozilla.org/file/local;1"]
											  .createInstance(Components.interfaces.nsILocalFile);						
				}
				else{
					var localFile = Components.classes["@mozilla.org/file/local;1"]
											  .createInstance(Components.interfaces.nsIFile);						
				}
										  
				localFile.initWithPath( path );
		
				return 	this.fileToURI(localFile);	  
			}
			catch( ex ){			
				return null;
			}
		},
		
		fileURIToPath: function( url ){		
			var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);		
			var fileUrl = iOService.newURI( url, null, null );
			var file = fileUrl.QueryInterface(Components.interfaces.nsIFileURL).file;
			return file.path;  
		},
		
		fileExists: function( path ){
			try{
				if (fvd_speed_dial_Misc.appVersion() < 13) {
					var localFile = Components.classes["@mozilla.org/file/local;1"]
											  .createInstance(Components.interfaces.nsILocalFile);						
				}
				else{
					var localFile = Components.classes["@mozilla.org/file/local;1"]
											  .createInstance(Components.interfaces.nsIFile);		
				}

				localFile.initWithPath( path );
				
				return localFile.exists();	
			}
			catch( ex ){			
				return false;
			}
		},
		
		loadCSS: function( url ){
			var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
								.getService(Components.interfaces.nsIStyleSheetService);
			var ios = Components.classes["@mozilla.org/network/io-service;1"]
								.getService(Components.interfaces.nsIIOService);
			var uri = ios.newURI( url, null, null );
			if(!sss.sheetRegistered(uri, sss.USER_SHEET)){
				sss.loadAndRegisterSheet(uri, sss.USER_SHEET);					
			}

		},
		
		validateText: function( type, text ){
			switch( type ){
				case "email":
				
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test( text );
				
				break;
			}
		},
		
		prepareUrlToCompare: function( url ){
			url = url.toLowerCase();
			// remove http from sign
			url = url.replace("http://", "");
			url = url.replace("https://", "");		
			// remove www from sign
			url = url.replace( "www.", "" );
			// remove and "/"
			if( url.charAt( url.length - 1 ) == "/" ){
				url = url.substring( 0, url.length - 1 );
			}
			
			return url;
		},
		
		isUrlsEqual: function( url1, url2 ){
			return this.prepareUrlToCompare( url1 ) == this.prepareUrlToCompare( url2 );
		},
		
		arrayUnique: function( a ){
			
			var result = [];
			
			for( var i = 0; i != a.length; i++ ){
				var v = a[i];
				if( result.indexOf( v ) == -1 ){
					result.push( v );
				}
			}
			
			return result;
			
		},
		
		getMainWindow: function(){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
			var mainWindow = wm.getMostRecentWindow("navigator:browser"); 
			
			return mainWindow;
		},
		
		parseHotKey: function( text ){
			var parts = text.split("+");
			
			var modifiers = [];		
			var key = "";
			
			if( parts.length > 0 ){							
				parts.slice( 0, parts.length - 1 ).forEach(function( part ){
					switch( part.trim() ){
						case "CTRL":
							modifiers.push( "accel" );
						break;
						case "ALT":
							modifiers.push( "alt" );							
						break;
						case "SHIFT":
							modifiers.push( "shift" );														
						break;
					}
				});
				key = parts[ parts.length - 1 ].trim();
			}			

			modifiers = modifiers.join( " " );
			
			return {
				modifiers: modifiers,
				key: key
			};
		},
		
		getActiveHotKeys: function( modifiers, key ){
			var mainWindow = this.getMainWindow();
			
			var keys = [];
			
			key  = key.toLowerCase();
			
			var elements = mainWindow.document.getElementsByTagName( "key" );
			for( var i = 0; i != elements.length; i++ ){
				var element = elements[i];
				if( element.getAttribute( "modifiers" ) == modifiers && element.getAttribute( "key" ).toLowerCase() == key ){
					keys.push( element );
				}
			}
			
			return keys;
		}
	
	
	
	
	};

	
}; 
		
