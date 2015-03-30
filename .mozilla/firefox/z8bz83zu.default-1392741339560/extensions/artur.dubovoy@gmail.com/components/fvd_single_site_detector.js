const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID('{4f4c3241-9e9f-4ee4-8ca6-c7703f93fe66}');
const CLASS_NAME = 'FVD single site detector';
const CONTRACT_ID = '@flashvideodownloader.org/single_site_detector;1';

//const SETTINGS_KEY_BRANCH = 'fvd_single.';
const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';
const STORAGE_FOLDER = 'FVD Single';
const AD_SIGNS_FILE = 'ad_signs.txt';
const NOTIFY_CHECK_INTERVAL = 60000; // 1min

var adUpdateUrls = ["https://s3.amazonaws.com/fvd-suite/ad_signs.txt", "http://flashvideodownloader.org/fvd-suite/sites/ads.txt"];

function FVD_Single_Detector(){
	dump( "Init detector!!\n" );
}



function FVD_Single_Detector(){
	
    var self = this;
    this.ad_signs = [];
    
    this.alert = function(text){
        var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        aConsoleService.logStringMessage(text);
    };
    
    this.timer_observer_struct = {
    
        observe: function(){
            self.server_notify.call(self);
        }
    };
    

    
    this.parse_ad_signs = function(txt){
        var tmp = txt.split("\n");
        this.ad_signs = [];
        for (var i = 0; i != tmp.length; i++) {
            var sign = tmp[i];
            sign = sign.replace(/\s+/, "");
            if (!sign) {
                continue;
            }
            this.ad_signs.push(sign);
        }
        
        
        return true;
    };
    
    this.getUrl = function(url, callback){
        var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
        ajax.open('GET', url, true);
        ajax.setRequestHeader('Cache-Control', 'no-cache');
        ajax.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
        ajax.onreadystatechange = callback;
        ajax.send(null);
    }
    
    
    
    this.download_ad_signs = function(done, urlIndex){
        urlIndex = urlIndex || 0;
        
        if (urlIndex >= adUpdateUrls.length) {
            return false;
        }
        
        this.getUrl(adUpdateUrls[urlIndex], function(){
            try {
				
				if( this.readyState == 4 ){
	                if ( (this.status == 200) && (this.responseText)) {
	                    self._write_file(AD_SIGNS_FILE, this.responseText);
	                    self.parse_ad_signs.call(self, this.responseText);
	                  
	                    if ((done != undefined) && (done != null)) 
	                        done();
	                }
	                else {
						dump( "FAIL download from " + adUpdateUrls[urlIndex] + "\r\n" );
	                	return self.download_ad_signs(done, urlIndex + 1);
	                }
				}
            } 
            catch (e) {
            }
        });
        
    };
    
    this.download_ad_signs_from_local = function(){
        var filePath = "chrome://fvd.single/content/data/ad_signs.txt";
        var content = this._get_file_contents(filePath);
        this._write_file(AD_SIGNS_FILE, content);
    }
    
    
    this._write_file = function(filePath, content){
        var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
        file.append(STORAGE_FOLDER);
        
        if (!file.exists()) 
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
        if (file.exists() && file.isDirectory()) {
            file.append(filePath);
            var fos = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
            fos.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
            
            var ct = Components.classes['@mozilla.org/intl/converter-output-stream;1'].createInstance(Components.interfaces.nsIConverterOutputStream);
            ct.init(fos, 'UTF-8', 0, 0);
            ct.writeString(content);
            ct.close();
        }
    }
    
    
    this._get_file_contents_async = function(file_url, callback){
        try {
            var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
            ajax.open('GET', file_url);
            ajax.overrideMimeType('text/plain');
			
			ajax.onload = function(){
				callback( ajax.responseText );
			}
			
			ajax.onerror = function(){
				callback( "" );
			}
			
            ajax.send(null);            
        } 
        catch (ex) {
            return "";
        }
        
    };
	
    this._get_file_contents = function(file_url){
        try {
            var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
            ajax.open('GET', file_url, false);
            ajax.overrideMimeType('text/plain');
            ajax.send(null);
            
            return ajax.responseText;
        } 
        catch (ex) {
            return "";
        }
        
    };
    
    
    

    
	this.fileExists = function( filePath ){
        var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
        if (file){
            file.append(STORAGE_FOLDER);
            if (file.exists() && file.isDirectory()) {
				file.append(filePath);
				
				if (file.exists()) {
					return true;
				}
			}

		}
		
		return false;
	}
	

    this.load_ad_signs = function(){
        // open profile folder
		
        var file = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
		
        if (file) {
						
            file.append(STORAGE_FOLDER);
            if (file.exists() && file.isDirectory()) {
				
                file.append(AD_SIGNS_FILE);
                
                if (file.exists() && file.isFile() && file.isReadable()) {
						
                    var file_url = '';
                    
                    try {
                        var fh = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService).getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
                        var file_url = fh.getURLSpecFromFile(file);
                    } 
                    catch (e) {
                    }
					
                    if (file_url != '') {
						
						this._get_file_contents_async( file_url, function( responseText ){
							self.parse_ad_signs(responseText);
						} );
									
						return true;
						
                    }
                }
            }
        }
        
        return false;
    };
    
    
    this.server_notify = function(){
        var current_dt = new Date();
        var current_time = current_dt.getTime();
        var last_time = 0;
        try {
            last_time = Date.parse(this.registry.getCharPref('supported_sites.last_check'));
            if (isNaN(last_time)) 
				last_time = 0;
			
            
        } 
        catch (e) {
        }
		
		if( last_time == 0 ){
			// this is first run
			this._updateLastCheck();
			this._update_check_interval();
			
			return false;
		}
        
        // need check ?
		var checkInterval;
		try{
			checkInterval = this.registry.getCharPref('supported_sites.check_interval');		
		}
		catch( ex ){
			this.registry.clearUserPref('supported_sites.check_interval'); // clear value because it have old type Integer
			return false;
		}
	   
        if (Math.abs(current_time - last_time) > checkInterval) {
            this._update_check_interval();
            self.download_ad_signs.call(self, function(){
            });   
        }
        else {
            this.notify_timer.init(this.timer_observer_struct, NOTIFY_CHECK_INTERVAL, this.notify_timer.TYPE_ONE_SHOT);
        }
    };
    
    this._update_check_interval = function(){
        checkInterval = 2160000000 + 3600 * 24 * 1000 * (Math.round(Math.random() * 100) % 5) + Math.round(1000 * 60 * 60 * Math.random());
			
        self.registry.setCharPref('supported_sites.check_interval', checkInterval);
    };
	
	this._updateLastCheck = function(){
		var current_dt = new Date();
		self.registry.setCharPref('supported_sites.last_check', current_dt.toUTCString());
	}
    
    this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(SETTINGS_KEY_BRANCH);
    this.notify_timer = Components.classes['@mozilla.org/timer;1'].createInstance(Components.interfaces.nsITimer);
    	
    this.server_notify();
	
	
	
    if (!this.load_ad_signs()) {
        this._update_check_interval();
        this.download_ad_signs_from_local();
    }
    
    
   

};

FVD_Single_Detector.prototype = {
    is_ad: function(url){
        url = url.toLowerCase();
        for (var i in this.ad_signs) {
            var ad_sign = this.ad_signs[i];
            if (url.indexOf(ad_sign) != -1) {
                return true;
            }
        }
        return false;
    },
    
    is_supported: function(url){        
        return false;
    },
    
    is_adult: function(url){
        var m = url.match(/^((https?:\/\/)(www\.)?([0-9a-z-\.]+))\//);
        if (m != null) {
            var url = m[1] + '/';
            var s_url = ((m[3] == '') ? m[2] + 'www.' + m[4] : m[2] + m[4]) + '/';
            
            for (var i in this.sites) {
                if (((this.sites[i].indexOf(url) != -1) || (this.sites[i].indexOf(s_url) != -1)) && (i == 'VIDEO:ADULT')) 
                    return true;
            }
        }
        
        return false;
    },
    
    QueryInterface: function(aIID){
        if (!aIID.equals(Components.interfaces.IFVDSingleDetector) && !aIID.equals(Components.interfaces.nsISupports)) 
            throw Components.results.NS_ERROR_NO_INTERFACE;
        return this;
    }
};




// class factory
var FVD_Single_Detector_Factory = {
    createInstance: function(aOuter, aIID){
        if (aOuter != null) 
            throw Components.results.NS_ERROR_NO_AGGREGATION;
        return (new FVD_Single_Detector().QueryInterface(aIID));
    }
};

// Moduel definition
var FVD_Single_Detector_Module = {
    registerSelf: function(aCompMgr, aFileSpec, aLocation, aType){
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    },
    
    unregisterSelf: function(aCompMgr, aLocation, aType){
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
    },
    
    getClassObject: function(aCompMgr, aCID, aIID){
        if (!aIID.equals(Components.interfaces.nsIFactory)) 
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
        if (aCID.equals(CLASS_ID)) 
            return FVD_Single_Detector_Factory;
        
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },
    
    canUnload: function(aCompMgr){
        return true;
    }
};

// Module initialization
function NSGetModule(aCompMgr, aFileSpec){
    return FVD_Single_Detector_Module;
};


function NSGetFactory(){
    return FVD_Single_Detector_Factory;
};
