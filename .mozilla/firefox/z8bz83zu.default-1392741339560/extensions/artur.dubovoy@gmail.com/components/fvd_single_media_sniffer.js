const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID('{213bea84-5789-4ff2-a3da-24ea819eb505}');
const CLASS_NAME = 'FVD media sniffer';
const CONTRACT_ID = '@flashvideodownloader.org/single_media_sniffer;1';

Components.utils.import("resource://fvd.single.modules/async.js");

const TITLE_MAX_LENGTH = 96;

const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';
const mediatypes_video2ext = {

	'mpeg' : 'mp4',
	'3gpp' : '3gp',
	'flv' : 'flv',
	'quicktime' : 'mov',
	'msvideo' : 'avi',
	'ms-wmv' : 'wmv',
	'ms-asf' : 'asf'
};

const mediatypes_audio2ext = {

	'realaudio' : 'ra',
	'pn-realaudio' : 'rm',
	'midi' : 'mid',
	'mpeg' : 'mp3',
	'mpeg3' : 'mp3',
	'wav' : 'wav',
	'aiff' : 'aif'
};

const video_extensions = [
	"flv",	
	"ram",
	"mpg",
	"mpeg",
	"avi",	
	"rm",
	"wmv",
	"mov",
	"asf",
	"mp3",
	"rbs",
	"movie",
	"divx",
	"mp4",
	"ogg",
	"mpeg4"
];
const audio_extensions = ["mp3"];

const games_extensions = ["swf"];

const ignore_extensions = [
	"jpg",
	"jpeg",
	"gif",
	"png",
	"bmp",
	"tiff",
	"mp3"
];

const IGNORE_SNIFFER_URL_SIGNS = [
	"soloset.net",
	"solosing.com",
	"canalrcn.com",
	"canalrcnmsn.com",
	"noticiasrcn.com",
	"headbar.net"
];

const triggerVideoSize = 1048576; 
const minFileSizeToCheck = 100 * 1024;

const VK_SETTINGS = {
	
    videoResolutions: [360, 480, 720],

	defaultVideoExt: "mpg",
	videosResolutionsExts: {
		240: "flv",
		360: "mp4",
		480: "mp4",
		720: "mp4"
	}
};

var xulRuntime = Components.classes["@mozilla.org/xre/app-info;1"]
                           .getService(Components.interfaces.nsIXULRuntime);
var userOS = xulRuntime.OS;

var KeyValueStore = new function(){
	
	var items = {};
	
	var event = {
		observe: function(subject, topic, data) {
			
			var now = new Date().getTime();
			
			var toRemove = [];
			for( var k in items ){
				if( items[k].expires && items[k].expires <= now ){
					toRemove.push( k );
				}
			}
			
			toRemove.forEach( function(){
				delete items[k];	
			} );
						
		}
	};
	var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
	
	timer.init(event, 60*1000, Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE_CAN_SKIP);
	
	this.set = function( key, value, ttl ){
		
		var now = new Date().getTime();
		
		var expires = now + ttl;
		if( !ttl ){
			expires = 0;
		}
		
		items[key] = {
			value: value,
			expires: expires
		};
		
	};
	
	this.get = function( key ) {
		
		if( typeof items[key] != "undefined" ){
			return items[key].value;
		}
		
		return null;
		
	};
	
};

/*
 * decrypt youtube signature
 */

var SignatureDecryptor = function(ytVideoId) {
  var playerContents = "";
  var storage_code = null;
  this.decrypt = function(page, s, cb) {
    async.chain([
      function(next) {
		  
        if(playerContents && storage_code) {
          return next();
        }
        var m = page.match(/"js"\s*:\s*"(.+?)"/i);
        if(!m) {
          return cb(new Error("Fail get player url"));
        }
        var playerUrl = m[1].replace(/\\/g, "");
        if(playerUrl[0] == "/") {
          playerUrl = "https:" + playerUrl;
        }

        var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
        ajax.open('GET', playerUrl, true);
        ajax.onload = function(){
          playerContents = ajax.responseText;
		  
		  storage_code = findSignatureCode(playerContents);
		  //dump('storage_code = '+storage_code+'\n');		
		  
          playerContents = playerContents.trim();
          playerContents = playerContents.replace(/^\s*\(\s*function\s*\(\s*\)\s*{/, "");
          playerContents = playerContents.replace(/}\s*\)\s*\(\s*\)\s*;\s*$/, "");
          
          //dump(playerContents.substr(0, 100)+"\n");
          //dump("..."+playerContents.substr(playerContents.length-100, 100)+"\n");
          next();
        };
        ajax.onerror = function(err){
          cb( err );
        };
        ajax.send( null );
      },
      function() {
        // get decode function name
        var m = playerContents.match(/\.signature\s*=\s*(\w+)\s*\(.+?\)/);
        if(!m) {
          var sig2 = decode(s, storage_code);
          if (!sig2) return cb(new Error("decrypt signature not found"));
		  cb(null, sig2);
		  return;
        }
		else {
		  var funcName = m[1];
		}	
        var sandbox = new Components.utils.Sandbox("https://www.youtube.com/watch?v="+ytVideoId);
        sandbox.navigator = {};
        sandbox.window = {
          history: {},
          location: {},
          __exposedProps__ : { 
            history : "r",
            location: "r",
            onYouTubeIframeAPIReady: "wr"
          },
        };
        sandbox.document = {};
        Components.utils.evalInSandbox(playerContents, sandbox, "1.8", "youtube-player.js");          
        var sig = Components.utils.evalInSandbox(funcName+"(\""+s+"\")", sandbox);
        cb(null, sig);
      }
    ]);
  };
  function findMatch(text, regexp) {
    var matches=text.match(regexp);
    return (matches)?matches[1]:null;
  }
  function isString(s) {
    return (typeof s==='string' || s instanceof String);
  }
  function isInteger(n) {
    return (typeof n==='number' && n%1==0);
  }
  function findSignatureCode(sourceCode) {
    //dump('findSignatureCode\n');
    var signatureFunctionName = findMatch(sourceCode, /\.set\s*\("signature"\s*,\s*([a-zA-Z0-9_$][\w$]*)\(/)
							 || findMatch(sourceCode, /\.sig\s*\|\|\s*([a-zA-Z0-9_$][\w$]*)\(/)
							 || findMatch(sourceCode, /\.signature\s*=\s*([a-zA-Z_$][\w$]*)\([a-zA-Z_$][\w$]*\)/); 
	
    if (signatureFunctionName == null) return null;
	
    signatureFunctionName=signatureFunctionName.replace('$','\\$');    
	
    var regCode = new RegExp('function \\s*' + signatureFunctionName + '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);(.+);return [\\w$]*\\.join');
	
    var functionCode = findMatch(sourceCode, regCode);
    //dump('====' + signatureFunctionName + ' -- ' + functionCode + '\n');            
	
    if (functionCode == null) return null;
    
    var reverseFunctionName = findMatch(sourceCode, /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/);
    //dump('====' + reverseFunctionName + '\n');
    if (reverseFunctionName) reverseFunctionName=reverseFunctionName.replace('$','\\$');        
	
    var sliceFunctionName = findMatch(sourceCode, /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/);
    //dump('====' + sliceFunctionName + '\n');
    if (sliceFunctionName) sliceFunctionName=sliceFunctionName.replace('$','\\$');    
    
    var regSlice = new RegExp('\\.(?:'+'slice'+(sliceFunctionName?'|'+sliceFunctionName:'')+')\\s*\\(\\s*(?:[a-zA-Z_$][\\w$]*\\s*,)?\\s*([0-9]+)\\s*\\)'); 
    var regReverse = new RegExp('\\.(?:'+'reverse'+(reverseFunctionName?'|'+reverseFunctionName:'')+')\\s*\\([^\\)]*\\)');  
    var regSwap = new RegExp('[\\w$]+\\s*\\(\\s*[\\w$]+\\s*,\\s*([0-9]+)\\s*\\)');
    var regInline = new RegExp('[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]');
    var functionCodePieces=functionCode.split(';');
    var decodeArray=[];
	
    for (var i=0; i<functionCodePieces.length; i++) {
      functionCodePieces[i]=functionCodePieces[i].trim();
      var codeLine=functionCodePieces[i];
      if (codeLine.length>0) {
        var arrSlice=codeLine.match(regSlice);
        var arrReverse=codeLine.match(regReverse);
        //dump(i+': '+codeLine+' --'+(arrSlice?' slice length '+arrSlice.length:'') +' '+(arrReverse?'reverse':'')+'\n');
        if (arrSlice && arrSlice.length >= 2) { // slice
		  var slice=parseInt(arrSlice[1], 10);
		  if (isInteger(slice)){ 
		    decodeArray.push(-slice);
		  } 
		  else return null;
        } 
	    else if (arrReverse && arrReverse.length >= 1) { 
          decodeArray.push(0);
        } 
	    else if (codeLine.indexOf('[0]') >= 0) { 
          if (i+2<functionCodePieces.length && functionCodePieces[i+1].indexOf('.length') >= 0 && functionCodePieces[i+1].indexOf('[0]') >= 0) {
            var inline=findMatch(functionCodePieces[i+1], regInline);
            inline=parseInt(inline, 10);
            decodeArray.push(inline);
            i+=2;
          } 
		  else return null;
        } 
	    else if (codeLine.indexOf(',') >= 0) { 
          var swap=findMatch(codeLine, regSwap);      
          swap=parseInt(swap, 10);
          if (isInteger(swap) && swap>0){
            decodeArray.push(swap);
          } 
		  else return null;
        } 
	    else {
		  return null;
	    }	  
      }
    }
    
    if (decodeArray) {
	  return decodeArray;
    }
	return null;
  }
  function swap(a,b) {
	  var c = a[0];
	  a[0] = a[b%a.length];
	  a[b] = c;
	  return a
  };
  function decode(sig, arr) { // encoded decryption
    if (!isString(sig)) return null;
    var sigA=sig.split('');
    for (var i=0;i<arr.length;i++) {
	  var act=arr[i];
	  if (!isInteger(act)) return null;
	  sigA=(act>0)?swap(sigA, act):((act==0)?sigA.reverse():sigA.slice(-act));
    }
    var result=sigA.join('');
    return result;
  }
  
  
};


//---------------------------  Log  --------------------------
function Log(text)
{
	var aConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
	aConsoleService.logStringMessage(text);
};

// -----------------------------------------------------
function MediaPrepare( data ){
	
	if (data.url.indexOf("#") != -1)  data.url = data.url.substring(0,data.url.indexOf("#"));
	// dailymotion.com
	var lurl = data.url.toLowerCase();		
	if( ( lurl.indexOf( "dailymotion.com" ) != -1 || lurl.indexOf( ".dmcdn.net" ) != -1 ) && lurl.indexOf( "/frag(" ) != -1 )
	{
		// remove fragment data from url
		data.url = data.url.replace( /\/frag\(.?\)/, "" );
		data.size = null;

		if (!data.name)
		{
		
			var url = data.url;
			var tmp = url.split( "?" );
			url = tmp[0];
			tmp = url.split( "/" );
			tmp = tmp[ tmp.length - 1 ];

			data.name = tmp;	
		
		}
		return data;
	}
	return null;
}


const VK_VideoAnalyzer = {
    vars: null,
    videoHost: null,
    resolutions: null,
	maxSize: null,
	
	queryStringToObject: function(str){
		var obj = {};
		str.split('&').forEach(function(param){
		    var parts = param.split('=');
		    var key = decodeURIComponent(parts[0] || '');
		    if (!key) return;
			
		    var value = decodeURIComponent(parts[1] || '');
			
		    if (/^[+-]?[0-9]+$/.test(value))  value = parseInt(value, 10);
		    else 
		        if (/^[+-]?[0-9]+\.[0-9]*$/.test(value)) value = parseFloat(value);
		    
		    obj[key] = value;
		});
		
		return obj;
	},
	
    extractLinks: function(flvString){
    
		this.resolutions = VK_SETTINGS.videoResolutions;
	
		this._prepareAnalyzer( flvString );
		
        var links = { 240: this._flvUrl() };
        var self = this;
        this.resolutions.forEach(function(size) {
            var uri = self._hdUrl(size);
            if (uri)
                links[size] = uri;
        });

        var title = decodeURIComponent(this.vars.md_title || '').replace(/\+/g, ' ');
    	
		return {
			"links": links,
			"title": title
		};
		
    },
    
    _intVal: function(str){
        return parseInt(str);
    },
    
    _prepareAnalyzer: function( flvString ){
        this.vars = this.queryStringToObject(flvString);            
		
		var vars = this.vars;
		
		this.host = vars.host || 'vk.com';   // 'vkontakte.ru';
		
        vars.vkid = this._intVal(vars.vkid);
        vars.uid = this._intVal(vars.uid);
        
        var maxResolutionId = this._intVal(vars.hd);
        var maxSize = this._getMaxSize(maxResolutionId);
        
        vars.no_flv = this._intVal(vars.no_flv) != 0;
        this.isVK = this._intVal(vars.is_vk) != 0;
        
        vars.hd360_link = vars.hd_link || null;
        
        this.resolutions.forEach(function(size){
            var link = vars['hd' + size + '_link'];
            if (link && maxSize < size)  maxSize = size;
        });
        
        this.maxSize = maxSize;
    },
    
    _getMaxSize: function(id){
        if (id == 0) 
            return 240;
        
        return this.resolutions[id - 1];
    },
    
    _flvUrl: function(){
        var vars = this.vars;
        
        if (vars.no_flv)   return this._hdUrl(240);
        
        if (vars.sd_link)  return vars.sd_link;
        
        if (vars.uid <= 0) return 'http://' + this.host + '/assets/videos/' + vars.vtag + '' + vars.vkid + '.vk.flv';
        
        return this._host() + 'u' + this._uid(vars.uid) + '/video/' + vars.vtag + '.flv';
    },
    _hdUrl: function(size){
        var vars = this.vars;
        
        if (size > 240) {
            var link = vars['hd' + size + '_link'];
            if (link) 
                return link;
        }
        
        if (vars.uid <= 0 || size > this.maxSize) 
            return null;
        
        return this._host() + 'u' + this._uid(vars.uid) + '/video/' + vars.vtag + '.' + size + '.mp4';
    },
    _host: function(){
        var host = this.host;
        if (host.substr(0, 4) == 'http') 
            return host;
        
        return 'http://cs' + host + (this.isVK ? '.vk.com/' : '.vkontakte.ru/');
    },
    _uid: function(uid){
        uid = '' + uid;
        while (uid.length < 5) 
            uid = '0' + uid;
        
        return uid;
    }    
};

// -----------------------------------------------------
function loadPageContents( url, callback ){
	
	var url = url;
	
	//dump( "Load page content " + url + "\n" );
	
	var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
	ajax.open('GET', url, true);
	
	ajax.setRequestHeader("X-FVD-Extra", "yes");
	
	//ajax.setRequestHeader('Cache-Control', 'no-cache');
	//ajax.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;  	
	ajax.request_url = url;
	
	ajax.onload = function(){
		callback( ajax.responseText );
	};
	
	ajax.onerror = function(){
		callback( null );
	};
	
	ajax.send( null );
	
}

// -----------------------------------------------------
function FVD_Media_Sniffer()
{
	
	var self = this;
	this.detector = null;
	this.observer = null;
	this.files = {};
	this.media_pages = {};
	this.media = {};

	this.dm_id = [];
	
	this.debug = false;
	
	this.timers = []; // timers for youtube
	
	this.allowYoutube = true;
	this.silentMode	= false;

	function YTVideoExists( root_url, ytId, ytFormat ){
		
		//dump( ytFormat + "|" + ytId + " <--- check\n" );
						
		for( var k in self.files ){
			
			//dump( self.files[k].yt_format + "|" + self.files[k].yt_id + "\n" );
			
			if( self.files[k].yt_id == ytId && self.files[k].yt_format == ytFormat && self.files[k].root_url == root_url ){
				return true;
			}
		}
		
		return false; 
			
	}

	// -----------------------------------------------------------
    this.isPlayable = function(ext, contentType){
        var playable = false;
        
        if (video_extensions.indexOf(ext) != -1) {
            playable = true;
        }
        
        if (audio_extensions.indexOf(ext) != -1) {
            playable = true;
        }
        
        if (contentType) {
            if (contentType.toLowerCase().indexOf("video") != -1) {
                playable = true;
            }
            if (contentType.toLowerCase().indexOf("audio") != -1) {
                playable = true;
            }
        }
        
        return playable;
    };

	this.dumpp = function(x) {
 		dump( '\n<***********************************************************\n' );
		for ( var key in x ) {
			try {
				if (typeof x[key] == 'undefined') 	dump(key + '  = undefined \n');
				else if (typeof x[key] == 'function') 	dump(key + '  = function \n');
				else if (typeof x[key] == 'object') 	dump(key + '  = object \n');
				else								dump(key + '  =  ' + x[key]+'\n');
			} catch(e) {
				dump(key + '  - exception \n');
			}	
		}	
		dump( '\n***********************************************************>\n' ); 
	};
	
	this.alert = function(text)
	{
		var aConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		aConsoleService.logStringMessage(text);
	};
	
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

	this.decode_html = function(html)
	{
		var converter = Components.classes['@mozilla.org/widget/htmlformatconverter;1'].createInstance(Components.interfaces.nsIFormatConverter);
		var fstr = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
		var tstr = {value:null};
		var text = html;
		fstr.data = html;

		try
		{
			converter.convert('text/html', fstr, fstr.toString().length, 'text/unicode', tstr, {});
		} catch(e) {}
		if (tstr.value)
		{
			tstr = tstr.value.QueryInterface(Components.interfaces.nsISupportsString);
			text = tstr.toString();
		}
		return text;
	};

	// ---------------------------------------------------------------------------------
    this.getBrowserFromChannel = function(aChannel){
        try {
            var notificationCallbacks = aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;
            
            if (!notificationCallbacks) 
                return null;
            
			var domWin = notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
			
			var  gBrowser   = domWin.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		                       .getInterface(Components.interfaces.nsIWebNavigation)
		                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		                       .rootTreeItem
		                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		                       .getInterface(Components.interfaces.nsIDOMWindow);

			var gBrowser = mainWindow.gBrowser;			
           
            return gBrowser.getBrowserForDocument(domWin.top.document);
        } 
        catch (e) {
            return null;
        }
    };
	

	this.checkVkontakteAudio = function( doc ){
				
		try
		{					
			if( doc.location.href.indexOf( "vk.com/audio" ) != -1  )
			{	
				var list=doc.getElementById("initial_list");
				if ( !list) return;
			
				var elements = list.getElementsByClassName( "audio" );
			
				var anyAudioFound = false;
				
				var root_url = doc.location.href;

				for( var i = 0; i != elements.length; i++ )
				{
				
					var audioBlock = elements[i];
					
					try
					{
						var id = audioBlock.getAttribute( "id" );	
						
						var tmp = id.split("_");
						id = tmp[1];
						
						// get audio url and title
						var hidden = audioBlock.getElementsByTagName( "input" )[0];
						var tmp = hidden.value.split(",");
						var url = tmp[0];
						if (!url) continue;
						
						var titleBlock = audioBlock.getElementsByClassName("info")[0];
						
						var title = titleBlock.getElementsByTagName( "a" )[0].textContent;
						title += "-" + titleBlock.getElementsByTagName( "span" )[0].textContent;
						
						var u = url;						
						var ext = this._get_file_ext( url );
		
						var file_item = {
								"display_name": u,
								"download_name" : title,
								'dn' : title,
								'pn' : title,
								'url': u,
								'ext': ext,
								'raw_file_ext': ext,
								'root_url' : root_url,
								'time' : (new Date()).toUTCString(),
								"playable": self.isPlayable(ext),
								'direct': true,
								'yt_format': i,
								referer: ""
								};
		
						this.files[this.md5(u + root_url)] = file_item;
						this.media_pages[root_url] = u;
						
						anyAudioFound = true;									
					}
					catch( ex ){
						dump( "EX2: " + ex + "\n" );
					}
				}

				if (this.observer != null && anyAudioFound) 
				{
					this.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);
				}
				
			}
			
		}
		catch( ex ){
			dump( "Ex while VK Audio check: " + ex + "\r\n" );
		}
	};
	
	this.vk_add_video = function( url, title, type, ext, size, root_url ){
	
		var file_item = {
				"display_name": url,
				"download_name" : title,
				'dn' : title,
				'pn' : title,
				'url': url,
				'ext': ext,
				'raw_file_ext': type + " [" + size + "]",
				'root_url' : root_url,
				'time' : (new Date()).toUTCString(),
				"playable": self.isPlayable(ext),
				'direct': true,
				'yt_format': size,
				referer: ""
				};
		
		this.files[this.md5(url + root_url)] = file_item;
		this.media_pages[root_url] = url;
	};
						
	
	// --------------------------------------------------------  
	this.parse_str = function (str){
		var glue1 = '=';
		var glue2 = '&';
		var array2 = str.split(glue2);
		var array3 = [];
		for(var x=0; x<array2.length; x++)
		{
			var tmp = array2[x].split(glue1);
			array3[unescape(tmp[0])] = unescape(tmp[1]).replace(/[+]/g, ' ');
		}
		return array3;
	};
	
	// ----------------------------
	this.check_vkontakte_video = function( http_channel ){
		try{
			var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
			
			if( url.indexOf( "vk.com/video" ) == -1  ) return false;
	
			var wnd = this.parent_window( http_channel );	
			var doc = wnd.document;
			var root_url = doc.location.href;
			
        	var player = doc.getElementById("video_player");
			if (!player) return false;
			var title=doc.getElementById("mv_min_title").textContent;
        	var flvVars = player.getAttribute("flashvars");

			if (flvVars != null)
			{
				var param_js=this.parse_str(flvVars);
				//self.dumpp(param_js);				

				if (param_js['hd']=="0")
				{
					if (param_js['no_flv']=="")
					{
						var proverka=param_js["host"].search(/(vkadre.ru)/i);
						if (proverka!=-1)
						{
							this.vk_add_video('http://'+param_js["host"]+'/assets/videos/'+param_js["vtag"]+''+param_js["vkid"]+'.vk.flv', title, 'Low', 'flv','240p',root_url);					
						}
						else
						{
							this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.flv', title, 'Low', 'flv','240p',root_url);					
						}
					}
					if (param_js['no_flv']=="0")
					{
						if (param_js["host"].search(/(vkadre.ru)/i) != -1)		{
							this.vk_add_video('http://'+param_js["host"]+'/assets/videos/'+param_js["vtag"]+''+param_js["vkid"]+'.vk.flv', title, 'Low', 'flv', '240p',root_url);					
						}
						else if (param_js["host"].search(/(psv4.vk.me)/i) != -1)		{
							this.vk_add_video(param_js["url240"], title, 'Low', 'flv', '240p',root_url);					
						}
						else  {
							this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.flv', title, 'Low', 'flv', '240p',root_url);					
						} 
					}
					if (param_js['no_flv']=="1")
					{
						this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.240.mp4', title, 'SD',  'mp4','240p',root_url);					
					}
				}
				else if (param_js['hd']=="1")
				{       
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.360.mp4', title, 'High', 'mp4','360p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.240.mp4', title, 'SD', 'mp4','240p',root_url);					
				} 
				else if (param_js['hd']=="2")
				{      
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.480.mp4', title, 'High', 'mp4','480p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.360.mp4', title, 'High', 'mp4','360p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.240.mp4', title, 'SD', 'mp4','240p',root_url);					
				} 
				else if (param_js['hd']=="3")
				{       
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.720.mp4', title, 'HD', 'mp4','720p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.480.mp4', title, 'High', 'mp4','480p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.360.mp4', title, 'High', 'mp4','360p',root_url);					
                    this.vk_add_video('http://cs'+param_js["host"]+'.vk.com/u'+param_js["uid"]+'/videos/'+param_js["vtag"]+'.240.mp4', title, 'SD', 'mp4','240p',root_url);					
				} 		   			 
				
				if (this.observer != null)
				{
					this.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);	
					if ( this.get_Insert_Button_VK() )	{
						this.observer.notifyObservers(null, 'FVD.Single-Media-VKontakteVideo', root_url);	
					}	
				}	
			}	
			
		}
		catch( ex ){
			dump( "Exception (sniffer-check_vkontakte): " + ex );
		}
		
	};
	// ----------------------------------------------------------------------------------
	this.check_vkontakte_audio = function( http_channel ){
		var dn ='';
		var dt = '';
		var url = '';
		var ext = '';
		var root_url = '';
		var id = '';

		try
		{
			root_url = this.root_document_url(http_channel);
		} 
		catch (e) {	}
		
		if( root_url.indexOf("vk.com") == -1 )
		{
			return false;
		}		
		
		try
		{
			url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
		} 
		catch (e) {}

		// --- парсинг страницы
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
		var mainWindow = wm.getMostRecentWindow("navigator:browser");  
		var gBrowser = mainWindow.gBrowser;			
		var doc = gBrowser.selectedBrowser.contentDocument;

		var elements = doc.querySelectorAll( ".audio" );
        var mediaFound = false;
		var title = "";
		
		for (var i = 0; i < elements.length; i++) 
		{
			var audioBlock = elements[i];
			
			var inpts = audioBlock.getElementsByTagName("input");
			if (inpts)
			{
			
				var input = inpts[0];
				if( input && input.id && input.id.indexOf( "audio_info" ) != -1 )
				{
					var v = input.value;
					if ( !v) continue;
					var t = v.split(",");
					if ( !t) continue;
					parser_url = t[0];
				
					if (parser_url == url)
					{
						var titleBlock = audioBlock.getElementsByClassName("info")[0];
						title = titleBlock.getElementsByTagName( "a" )[0].textContent;
						title += "-" + titleBlock.getElementsByTagName( "span" )[0].textContent;
					
						var id = audioBlock.getAttribute( "id" );
						id = id.substr(5, id.length);	
					}	
				}
			}
		}
		dn = title.trim();

		try
		{
			dt = dn ? dn : this.parent_document_title(http_channel);
			ext = this._get_file_ext(http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec);									
			if (!ext) ext = this.parent_document_ext(http_channel);
		} catch (e) {}

		var nameFromChannel = this._extract_file_name_from_channel(http_channel);
		var size = null;
		try
		{
			var size = 	http_channel.getResponseHeader( "Content-Length" );			
		}
		catch(ex){}
				
		var contentType = http_channel.getResponseHeader( "Content-Type" );		
		
		var referer = null;
		
		try
		{
			referer = http_channel.getRequestHeader( "Referer" );		
		}
		catch( ex ){	}
				
		var file_item = {
			'display_name': nameFromChannel ? nameFromChannel : url,
			'download_name' : nameFromChannel,
			'dn' : dn,
			'pn' : dt,
			'url': url,
			'ext': this._is_video_ext(ext) ? ext : null,
			'raw_file_ext': ext,
			'root_url' : root_url,
			'time' : (new Date()).toUTCString(),
			'playable': this.isPlayable(ext, contentType),
			'yt_format': id,
			'direct': true,
			'size': size,
			'referer': referer
		};

		this.files[this.md5(dt + ext + root_url)] = file_item;
		this.media_pages[root_url] = url;
		
		if (this.observer != null)	{
			this.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);
			if ( self.get_Insert_Button_VK() )	{
				this.observer.notifyObservers(null, 'FVD.Single-Media-VKontakteAudio', root_url);	
			}	
		}	
		
		return true;
	};
	// ----------------------------------------------------------------------------------
	this.check_vkontakte = function( http_channel ){
		try
		{
			var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
			
			if( url.indexOf( "vk.com/video" ) != -1  )
			{
				this.check_vkontakte_video( http_channel );
				
				return true;
			}	
			else if ( /vk.me\/([^.]*).mp3/i.test(url) )		{
				var f = this.check_vkontakte_audio( http_channel );
				return f;
			}
			else if ( /vk-cdn.net\/([^.]*).mp3/i.test(url) )		{
				var f = this.check_vkontakte_audio( http_channel );
				return f;
			}
			
		}
		catch( ex ){
			dump( "Exception (sniffer-check_vkontakte): " + ex );
		}
		
	};

	// ----------------------------------------------------------------------------------
	this.get_Insert_Button_VK = function()
	{
		var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
		try
		{
			return branch.getBoolPref('display_vk_button' );
		} catch (e){	}
		
		return false;
	};

	// ----------------------------------------------------------------------------------
	this.get_Insert_Button = function()
	{
		var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
		try
		{
			return branch.getBoolPref('display_youtube_button' );
		} catch (e){	}
		
		return false;
	};

	// ----------------------------------------------------------------------------------------------	
	this.check_dailymotion = function( http_channel ){

		try
		{
			var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
			if( !url.match( /http:\/\/(www\.)?dailymotion(\.co)?\.([^\.\/]+)\//i ) )		return false;
			//dump("DMTEST FOUND: " + url + "\n");
			
			var wnd = null;
			var root_url = null;
			try		{
				ir = http_channel.loadGroup.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				wnd = ir.getInterface(Components.interfaces.nsIDOMWindow);  
			}
			catch(ex) 		{
				dump("DMTEST: not found window " + url);
				return false;
			}
			
			var doc = null;
			if( wnd != null && wnd.document != null)  doc = wnd.document;
			if ( doc == null) {
			  //dump("DMTEST: not found doc " + url);
			  return false;
			}
		
			var parsedMediaList = [];
			var mediaFound = false;
			var videoTitle  = "";
			var videoId = null;
		
			var metaElements = doc.head.getElementsByTagName("meta");
			
			if (metaElements)
			{
				for(var i=0; i<metaElements.length; i++) 
				{
					var metaElement=metaElements[i];
					var metaName=metaElement.getAttribute("name");
						
					if(metaName=="twitter:player") 
					{
						var videoId=/([^\/]+)$/.exec(metaElement.getAttribute("value"))[1];
					}
				}
			}	
		}
		catch( ex )
		{
			dump( "Exception check_dailymotion : " + ex );
		}
		if ( videoId == null ) {
		  // checking for meta tag is maked when page is not loaded?
		  var m = url.match(/dailymotion\.com\/video\/([^_]+?)_[^/]+$/i);
		  if(!m) {
		    // try to get from mobile comscore url
		    var m = url.match(/dailymotion\.com\/mobile\/comscore_video\?video=([^&?]+)$/i);
		    if(!m) {
		      return;
		    }
		  }
		  videoId = m[1];
		}
		//dump("DMTEST: dailymotion video id: " + videoId);    
		//dump("DMTEST: dmfound for " + url);
		//if ( this.dm_id.indexOf(videoId) != -1) return;
		
		this.dm_id.push(videoId);
		
		var icon="";
		var baseFileName="video";
		var links=doc.getElementsByTagName("link");
		for(var u=0;u<links.length;u++) 
		{
			var link=links[u];
			if(link.getAttribute("rel")=="shortcut icon")			icon=link.getAttribute("href");
					
			if(link.getAttribute("rel")=="canonical")				baseFileName=/([^\/]*)$/.exec(link.getAttribute("href"))[1];
		}
		baseFileName = decodeURIComponent( baseFileName );
		root_url = doc.location.href;
		if(root_url.indexOf("about:") === 0 || !root_url) {
		  // page not totally loaded
		  root_url = url;
		}
		//dump("DMTEST root url is: "+root_url);

		// ---------------------------------	
		function StreamListener() {
		}
		
		StreamListener.prototype = {
		
			QueryInterface: function(iid) {
					    if (!iid.equals(Components.interfaces.nsISupports) && !iid.equals(Components.interfaces.nsIStreamListener)) 
						{
					        throw Components.results.NS_ERROR_NO_INTERFACE;
					    }
					    return this;
					},
			onStartRequest: function(request,context) {
						this.httpChannel=request.QueryInterface(Components.interfaces.nsIHttpChannel);
						this.responseStatus=this.httpChannel.responseStatus;
						this.data="";
					},
			onDataAvailable: function(request,context,inputStream,offset,count) {
						var sstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);
						sstream.init(inputStream, "utf-8", 256, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
						var str={};
						var n=sstream.readString(128,str);
						while(n>0) 
						{
							this.data+=str.value;
							str={};
							n=sstream.readString(128,str);
						}
					},
			onStopRequest: function(request,context,nsresult) {
						if(this.responseStatus==200) 	{
							try		{
								var m=/var *info *= *(.*),/.exec(this.data);
								if(m) 	{
									var info=JSON.parse(m[1]);
									var tags={	"h264": 		{  	label: "MEDIUM",		},
												"h264_hd1080": 	{	label: "HD1080",		},
												"h264_hd720": 	{	label: "HD720",			},
												"h264_hq": 		{	label: "HQ",			},
												"h264_hd": 		{	label: "HD",			},
												"h264_sd": 		{	label: "SD",			},
												"h264_ld": 		{	label: "LD",			},
									};
									
									for(var tag in tags) 	{
										var url=info['stream_'+tag+'_url'];
										if(url)  	{
											var title = info['title'];
											if (title) baseFileName = title;		
											var label=tags[tag].label;
											var extension="flv";
											var mExt=/\.([0-9a-zA-Z]+)(?:$|\?)/.exec(url);
											if(mExt)  extension=mExt[1];
											
											var ft = "["+label+"] "+baseFileName;
											
											var file_item = {
														"display_name": url,
														"download_name" : ft,
														"file_title" : ft,
														'dn' : ft,
														'pn' : ft,
														'url': url,
														'ext': extension,
														'raw_file_ext': label,
														'root_url' : root_url,
														'time' : (new Date()).toUTCString(),
														'playable': self.isPlayable(extension),
														'direct': true,
														'yt_format': '',
														'referer': ''
													};
				
											self.files[self.md5(label + root_url)] = file_item;
											self.media_pages[root_url] = url;
                      
                      //dump("DMTEST: Add media for daily motion: " + root_url);
                      
											mediaFound = true;
										}
									}
									
									//---
									if ( mediaFound )	{
										if (self.observer != null) 	{
											self.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);
				
											if ( self.get_Insert_Button() )		{
												self.observer.notifyObservers(null, 'FVD.Single-Media-DailyMotion', root_url);
											}	
										}
									}
								} 
							} 
							catch(e) 	{
								dump("!!! [fvd_single_media_page] get_DM_Video Stream: "+e+"\n"+e.fileName+":"+e.lineNumber+"\n");
							}
						}
					}
		};
		// ---------------------------------	
		
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var uri = ioService.newURI("http://www.dailymotion.com/embed/video/"+videoId, null, null);
		var channel = ioService.newChannelFromURI(uri);
				
		channel.asyncOpen(new StreamListener(), null);
		
		return false;
	};
	
	
	// ---------------------------------------------------------------------------------------------- listeners
	
	this.browser_progress_listener = {	
		onLocationChange: function(aWebProgress, aRequest, aURI){
			//self.checkVkontakteAudio( aWebProgress.DOMWindow.document );
		}
	};

	// ----------------------------------------------------------------------------------------------	
	this.pageLoadListener = function( event ){
		//this.checkVkontakteAudio( event.target );
	};
	
	this.check_youtube_channel_page = function(http_channel){
        // First page of channel (without #<video_id>)
        // check by page contents
        
		return;
		
        try 
		{

            var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
            
            if( !url.match(/^http:\/\/(www\.)?youtube\.com\/user\//) )		return false;
			
			
			try
			{
				var contentType = http_channel.getResponseHeader( "Content-Type" );
				if( contentType.indexOf("text/html") == -1 )
				{
					return false;
				}
			}
			catch( ex )
			{
				return false;	
			}
									
           	var b = this.getBrowserFromChannel(http_channel);
			if( b )
			{	
				var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
				timer.init(this.event, 5000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
				
				this.timers.push( {
					"timer": timer,
					"browser": b
				});
			}
        } 
        catch (ex) {
            dump("!!FAIL!!" + ex + "\r\n");
        }
        
   };
    
	// -------------------------------------------------------------------------------------------------
 	this._parseYoutubeEmbed = function(content, root_url, request_url, youtube_id, callback){
   	
		//var m = content.match(/<span\s*itemprop\s*=\s*"author"\s*itemscope\s*itemtype\s*=\s*"http:\/\/schema\.org\/Person"\s*>(.+?)<\/span>/im);
		var m = content.match(/<span\s*itemprop\s*=\s*"author"\s*itemscope\s*itemtype\s*=\s*".+?"\s*>((?:.|\s)+?)<\/span>/im);
		if(m) {
		  var isVevo = /href="[^"]+?VEVO"/.test(m[1]);
		  //dump("ISVEVO? " + isVevo + "\n");
		  if(isVevo) {
			// ignore vevo videos
			return;
		  }
		}
		else {
		  //dump("####TNOA FOUDN!\n");
		}
   	
		root_url = root_url.replace( /&spf=.+/, "" );

		var sigDecrypt = new SignatureDecryptor(youtube_id);
			
		/*
		 * helper function. search formats string by specified regEx
		 */
		function _extendFormatsByRegEx( regEx, cb ){
			var tmp = content.match( regEx );
			//dump("##trying to get videos for "+ youtube_id +"\n");
			if( tmp )	{
				tmp[1] = tmp[1].replace(/\\u0026/g, "&");
				var map = tmp[1].split(",");
				//dump("##precount formats: " + map.length + "\n");
				async.arrayProcess(map, function(mapEl, apNext) {
					var m = mapEl.match(/itag=([0-9]+)/i);
					if (!m) {
						//dump("##fail parse itag\n");
						return apNext();
					}         
					var tag = m[1];
					m = mapEl.match(/url=([^&]+)/i);
					if (!m) {
						//dump("##fail parse url\n");
						return apNext();
					}          
					var url = m[1];  
					url = decodeURIComponent(url);    
					//dump("##found " + tag + "\n");
					
					async.chain([
						function(next) {
						  m = mapEl.match(/sig=([^&]+)/);
						  if (m) {
							url += "&signature="+m[1];
							//dump("\n\nFound simple sig " + m[1] + "\n\n");  
							next();
						  }   
						  else {
							m = mapEl.match(/(?:^|&)s=([^&]+)/);
							if(m) {
							  // we detect encrypted signature
							  //dump("###FOUND encrypted signature!!! "+m[1]+"\n");
							  sigDecrypt.decrypt(content, m[1], function(err, sig) {
								if(err) {
								  //dump("Fail decrypt signature: " + err + "\n");
								  return apNext();
								}
								//dump("#signature decrypted success: " + sig + "\n");
								url += "&signature="+sig;
								next();  
							  });
							  //url += "&signature="+m[1];              
							}
							else {
							  // maybe signature already in url
							  next();
							}
						  }   
						},
						function() {
						  formats[tag] = url;
						  foundFormats = true;
						  apNext();
						}
					]);        
			  }, function() {
				cb();
			  });
				
			}
			else {
			  //dump("##nothing for "+regEx+":(\n");
			  cb();
			}			
		}

		function get_ext_url( id ) {
			if ( id == 137) {
				return formats[140];
			}	
			if ( id == 138) {
				return formats[140];
			}	
			if ( id == 272) {
				return formats[140];
			}	
			return null;
		}	
		
		// define itag and format description associations	
		var ytf = {  
			5: 		{  title: 'Low',           frm: 'flv',		size: "240p",  type: 'button',       },
			6: 		{  title: 'Low',           frm: 'flv',		size: "270p",  type: 'button',       },
			13: 	{  title: 'Mobile',        frm: '3gp',		size: "144p",  type: 'button',       },
			17: 	{  title: 'Mobile',        frm: '3gp',	    size: "144p",  type: 'button',       },
			18: 	{  title: 'Low',           frm: 'mp4',		size: "360p",  type: 'button',	      },
			22: 	{  title: 'HD',            frm: 'mp4',		size: "720p",  type: 'button',       },
			34: 	{  title: 'Low',           frm: 'flv',		size: "360p",  type: 'button',       },
			35: 	{  title: 'SD',            frm: 'flv',		size: "480p",  type: 'button',       },								
			36: 	{  title: 'Mobile',        frm: '3gp',		size: "240p",  type: 'button',       },
			37: 	{  title: 'Full HD',       frm: 'mp4',		size: "1080p", type: 'button',       },
			38: 	{  title: '4K',            frm: 'mp4',		size: "3072p", type: 'button',       },
			43: 	{  title: "Low",           frm: 'webm',		size: "360p",  type: 'button',       },
			44: 	{  title: "SD",            frm: 'webm',		size: "480p",  type: 'button',       },
			45: 	{  title: "HD",            frm: 'webm',		size: "720p",  type: 'button',       },
			46: 	{  title: "Full HD",       frm: 'webm',    	size: "1080p", type: 'button',       },
			82: 	{  title: "3D Low",        frm: 'mp4',	    size: "360p",  type: 'button',       },
			83: 	{  title: "3D Low",        frm: 'mp4',	    size: "240p",  type: 'button',       },
			84: 	{  title: "3D HD",         frm: 'mp4',	    size: "720p",  type: 'button',       },
			85: 	{  title: "3D SD",         frm: 'mp4',     	size: "520p",  type: 'button',       },
			100: 	{  title: "3D Low",        frm: 'webm',		size: "360p",  type: 'button',       },
			101: 	{  title: "3D Low",        frm: 'webm',		size: "360p",  type: 'button',       },
			102: 	{  title: "3D HD",         frm: 'webm',		size: "720p",  type: 'button',       },
			
			// adaptive formats
			160: 	{  title: "[Low]", 	   	   frm: "mp4", 		size: "144p",  type: 'video', 	 	},
			133: 	{  title: "[Low]", 	 	   frm: "mp4", 		size: "240p",  type: 'video', 	 	},
			134: 	{  title: "[Low]", 	 	   frm: "mp4", 		size: "360p",  type: 'video', 	 	},
			135: 	{  title: "[SD]", 	 	   frm: "mp4", 		size: "480p",  type: 'video', 	 	},
			136: 	{  title: "[HD]", 	 	   frm: "mp4", 		size: "720p",  type: 'video', 	 	},
			137: 	{  title: "[Full HD]", 	   frm: "mp4", 		size: "1080p", type: 'full_hd', 	},
			
			138: 	{  title: "[4K]", 	   	   frm: "mp4", 		size: "2160p", type: 'ultra_hd', 	},
			272: 	{  title: "[4K]", 	   	   frm: "webm", 	size: "2160p", type: 'ultra_hd', 	},
			
			139:    {  title: "[139]",         frm: 'mp3',    	size: "n/a", type: 'audio',      },
			140:    {  title: "[140]",         frm: 'mp3',    	size: "n/a", type: 'audio',      },
			141:    {  title: "[141]",         frm: 'mp3',    	size: "n/a", type: 'audio',      },
			171:    {  title: "[171]",         frm: 'webm',    	size: "n/a", type: 'audio',      },
			172:    {  title: "[172]",         frm: 'webm',    	size: "n/a", type: 'audio',      },
		};
		
		var list_ytf = [138, 137, 5,6,13,17,18,22,34,35,36,37,38,43,44,45,46,82,83,84,85,100,101,102 ];
		var formats = {};
		var foundFormats = false;
		
		async.chain([
		  function(next) {
			var jsr = content.match(/<embed[^>]+flashvars="([^\"]+?)"/i);
	  
			if (jsr != null) {
			  var data = jsr[1].split('&amp;');
			  for (var i = 0, j = data.length; i < j; i++) {
				if (data[i].indexOf('fmt_url_map') == 0) {
				  info = (decodeURIComponent(data[i].substr(data[i].indexOf('fmt_url_map') + 12)));
				  var map = info.split(',');
				  map.forEach(function(el, i, a){
					var mk = el.split('|');
					if (mk.length == 2) {
					  formats[mk[0]] = mk[1];
					}
				  });
				  
				  foundFormats = true;
				  break;
				}
			  }
                  
			  if (!foundFormats) {
				// try extract url_encoded_fmt_stream_map
				for (var i = 0, j = data.length; i < j; i++) {
				  if (data[i].indexOf('url_encoded_fmt_stream_map') == 0) {
					info = (decodeURIComponent(data[i].substr(data[i].indexOf('url_encoded_fmt_stream_map') + "url_encoded_fmt_stream_map".length + 1)));
					var map = info.split(",");
					for (var ii = 0; ii != map.length; ii++) {
					  var m = map[ii].match(/itag=([0-9]+)/i);
					  if (!m)      
						continue;
					  var tag = m[1];
					  m = map[ii].match(/url=([^&]+)/i);
					  if (!m)       
						continue;
					  var url = m[1];
					  m = map[ii].match(/sig=([^&]+)/);
					  if (!m)   
						continue;
					  url += "&signature="+m[1];                              
					  formats[tag] = decodeURIComponent(url);
					  
					  foundFormats = true;
					}
					break;
				  }
				}
			  }
			}
			next();
		  },
		  function(next) {
			if(!foundFormats) {
			  _extendFormatsByRegEx( /"adaptive_fmts"\s*:\s*"(.+?)"/i, function() {
				_extendFormatsByRegEx( /"url_encoded_fmt_stream_map"\s*:\s*"(.+?)"/i, next );            
			  } );
			}
			else {
			   next();	
			}	
		  },
		  function() {
			if (foundFormats) {
			  var title = content.match(/<meta\sname=\"title\" content=\"([^\"]+)\">/i);
			  if (title != null) {
				title = self.decode_html.call(self, self.decode_html.call(self, title[1]));
				if (title.length > TITLE_MAX_LENGTH)   
				  title = title.substr(0, TITLE_MAX_LENGTH) + '...';
			  }
                  
			  var items = {};
			  var mediaFound = false;
			  
			  var parsedMediaList = [];      
  
			  //for (var i in ytf) 
			  for (var ii=0; ii<list_ytf.length; ii++)  {           
				i = list_ytf[ii];
				if (!(i in formats))                  
				  continue;
				// check youtube video already exists
				if( YTVideoExists( root_url, youtube_id,  i ) ) {
				  mediaFound = true;
				  continue;
				}
				var u = formats[i];
				if ((i in ytf)) {
				  var ft = ((title != null) ? title + ' (' + ytf[i].title + ')' : null);
				}
				var ext = (i in ytf) ? ytf[i].frm : 'FLV';
				if (!callback) {
				  var file_item = {
					"display_name": u,
					"download_name" : ft,
					'dn' : ft,
					'pn' : ft,
					'url': u,
					'ext': ext,
					'raw_file_ext': ((i in ytf) ? (ytf[i].title) : 'FLV'),
					'root_url' : root_url,
					'time' : (new Date()).toUTCString(),
					"playable": (i in ytf) ? self.isPlayable((ytf[i].frm)) : false,
					'direct': true,
					'yt_format': i,
					'yt_id': youtube_id,
					'yt_type': ytf[i].type,
					'ext_url': get_ext_url(i),
					'referer': "",
					"mob_name": ext + " ("+ytf[i].title+")" // name for mobile ff
				  };
				  
				  self.files[self.md5(u + root_url)] = file_item;
				  //this.files[this.md5(i + root_url)] = file_item;
				  self.media_pages[root_url] = u;
				}
				else {
				  var media = {
					display_name: u,
					url: u,
					type: ((i in ytf) ? (ytf[i].title) : 'FLV'),
					height: ((i in ytf) ? (ytf[i].size) : null),
					node: null,
					yt_id: youtube_id,
					ext: ((i in ytf) ? ytf[i].frm : 'FLV'),
					file_title: ft,
					direct: true,
					yt_format: i,
					playable: (i in ytf) ? self.isPlayable((ytf[i].frm)) : false,
					"headers": {
					  "referer": "",
					  "content_type": "video/x-flv",
					  "cookies": "",
					  "user_agent": ""
					},
					root_url: root_url,
					mob_name: ext + " ("+ytf[i].title+")" // name for mobile ff
				  };
				  parsedMediaList.push(media);
				} 
						  
				mediaFound = true;
			  }
		  
			  if (callback) {
				callback(parsedMediaList, youtube_id);
			  }
                  
			  if (mediaFound && !callback) {                            
				if (self.observer != null) {
				  self.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);
				  if ( self.get_Insert_Button() ) {
					self.observer.notifyObservers(null, 'FVD.Single-Media-Youtube', root_url);
				  } 
				}
			  }
                  
			}
		  }
		]);

	};
    
	// -----------------------------------------------------------------------------------------------
	this.getContentFromYoutubePage = function( root_url, videoId, callback, http_channel ){
			
		try
		{
			
			if( http_channel )
			{
								
				var b = self.getBrowserFromChannel( http_channel );
				if( b )
				{
					
					function _loadListener(){			
								if( b.contentDocument.location.href != "about:blank" )
								{
									self._parseYoutubeEmbed( b.contentDocument.documentElement.innerHTML, root_url, root_url, videoId, callback );		
									//dump("Parse from opened tab("+b.contentDocument.location.href+", "+root_url+")\n\n");	
								}	
						
								b.removeEventListener( "DOMContentLoaded", _loadListener );
							}
					
					b.addEventListener( "DOMContentLoaded", _loadListener, false );	
					
					return;
					
				}
				
			}

			
		}
		catch( ex ){
			
			dump( "error: " + ex + "\n" );
			
		}
				
		// send request to youtube
		var flag = false;
		var scheme = "http";
		
		if( root_url.toLowerCase().indexOf("https") == 0 ){
			scheme = "https";
		}

		var url = scheme + "://www.youtube.com/watch?v="+videoId;
	
		//
		var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
		ajax.open('GET', url, true);
		ajax.youtube_id = videoId;
		ajax.setRequestHeader('X-FVD-Extra', 'yes');
		//ajax.setRequestHeader('Cache-Control', 'no-cache');
		ajax.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 5.1; rv:15.0) Gecko/20100101 Firefox/15.0');
		ajax.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_FROM_CACHE;  	
		ajax.root_url = root_url;
		ajax.request_url = url;
		
		ajax.onreadystatechange = function(){
			try {
							
				if (this.readyState == 4) {
					
					if (this.status == 200) {
						
						var content = this.responseText;						
						
						flag = self._parseYoutubeEmbed( content, this.root_url, this.request_url, this.youtube_id, callback );
					}
				}
			} 
			catch (e) {		
				
				dump( "Failed: " + e.stack + "\n" );
				
			}
		};
		ajax.send( null );
		return flag;
	};

	// -----------------------------------------------------------------------------
	this.check_youtube_channel = function( http_channel ){		
        var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;

		try
		{
			var _httpChannel = http_channel.QueryInterface(Components.interfaces.nsIHttpChannel);		
			if( _httpChannel.getRequestHeader("X-FVD-Extra") )			return;
		}
		catch( ex ){
			
		}
		
        //var matches = url.match(/ytimg\.com\/vi\/(.+?)\/[^\.\/]+?default\.jpg/i);
		
		if (url.toLowerCase().indexOf("youtube.com/user") == -1) 		return;
		
        var root_url = url;

       	matches = url.match(/https?:\/\/(?:www\.)?youtube\.com\/user\/.+?[\?&]v=([^&]+)/i);		
		
		if( matches )
		{  
					  
			this.getContentFromYoutubePage(root_url, matches[1], null, null);			
			
			return;	
		}
		else{

		}		
		
		// try to get video id from channel contents
		
       	matches = url.match(/https?:\/\/(?:www\.)?youtube\.com\/user\/([^\/\?&]+)/i);	
		
		if( matches )
		{
			
			loadPageContents( "http://www.youtube.com/user/" + matches[1], function( contents ){

				if( !contents ){
					return;
				}
		
				
				contents = contents.replace( "\\/", "/" );
							
				matches = contents.match( /data-swf-config\s*=\s*"(.+?)"/i );
				if( matches ){				 	
					
					var conf = matches[1];
					
					matches = conf.match( /\\\/vi\\\/(.+?)\\\//i ); 	
						
					if( matches ){			
												
						self.getContentFromYoutubePage(root_url, matches[1], null, http_channel);							
					}
					else{

					}
			
					
				}
				else{
				
				}
										
			} );
		}
		
	};
	// --------------------------------------------------------------------------------------------
	this.check_youtube_page = function( http_channel ){
		var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
		
		try
		{
			var _httpChannel = http_channel.QueryInterface(Components.interfaces.nsIHttpChannel);		
			if( _httpChannel.getRequestHeader("X-FVD-Extra") )		return;
			
		}
		catch( ex ){
			
		}
		
		if( /watch_fragments_ajax/i.test(url) )		return false;
		
		var matches = url.match(/https?:\/\/(?:www\.|m\.)?youtube\.com\/watch.*[\?|&]v=([^\?&]+)/i);
		
		if( !matches )
		{        
		 	return false;        
		}
		
		var root_url = url;		
		
		this.getContentFromYoutubePage( root_url, matches[1], null, null );   
	};

	// ---------------------------------------------------------------------------------------
	this.check_youtube_embeds = function( http_channel ){		
	
		var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;

		var matches = url.match(/:\/\/(?:www\.)?(?:youtube|youtube-nocookie)\.com\/v\/([^\?&]+)/i);
		
		if( !matches ){
			matches = url.match(/:\/\/(?:www\.)?(?:youtube|youtube-nocookie)\.com\/embed\/([^\?&]+)/i);
		}	

		if( !matches ){
			return false;
		}		
		
		var root_url = "";
		try{
			root_url = this.root_document_url(http_channel);		
			
			try{
				if( root_url && root_url.indexOf( "about:" ) == 0 ){
					root_url = url;
				}						
			}
			catch( ex ){
				
			}
			
		}
		catch(ex){}
		
		this.getContentFromYoutubePage( root_url, matches[1], null, null );		
	
	},
	
	// ----------------------------------------------------------------------------------------------
	this.observer_struct = {observe : function(aSubject, aTopic, aData)
	{
		if (self.silentMode) return;	
	
		switch (aTopic)
		{
			case 'http-on-examine-cached-response':
			case 'http-on-examine-response':
			{
			
				try
				{						
					aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
					
					if( self.allowYoutube )
					{
						self.check_youtube_channel( aSubject );
						self.check_youtube_page( aSubject );
						self.check_youtube_embeds(aSubject);						
					}
					else
					{
						var url = aSubject.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
						
						if( url.indexOf("://s.ytimg.com") != -1 || url.indexOf("://o-o.preferred.") != -1 || url.indexOf("youtube.com") != -1 )
						{
							return;
						}								
					}
					
					if (self.check_vkontakte( aSubject ) ) return;

					if (self.check_dailymotion( aSubject )) return;

					
                    try 
					{
                        //self.check_youtube_channel_page(aSubject);
                    } 
                    catch (ex) {
                    	dump( "ERROR EX " + ex + "\r\n" );
                    }
					
					// all successed GET responces
					if ((aSubject.requestMethod == 'GET') && (aSubject.responseStatus < 400))
					{
						// check for video and audio types
						if (self.needed_media.call(self, aSubject))
						{
							// save link
							self.save_link.call(self, aSubject);
						}
					}

				} catch (e){
					dump("ERROR " + e + "\r\n");
				}
				break;
			}

			case 'nsPref:changed':
			{
				switch (aData)
				{
					case 'news.update_interval':
					{
						self.news_update_interval = self.registry.getIntPref(aData);
						break;
					}
					break;
				}
			}
		}
	}};

	this._get_file_ext = function( path ){
		try{
			var tmp = path.split("?");
			tmp = tmp[0].split( "." );
			var ext = tmp[tmp.length-1].toLowerCase();		
			return ext;	
		}
		catch(ex){
			return null;
		}		
	};
	
	this._is_video_ext = function( ext ){
		for( var i = 0; i != video_extensions.length; i++ ){			
			if( ext == video_extensions[i] ){
				return true;
			}
		}		
		return false;
	};
	
	this._is_game_ext = function( ext ){
		for( var i = 0; i != games_extensions.length; i++ ){			
			if( ext == games_extensions[i] ){
				return true;
			}
		}		
		return false;
	};
	
	this._is_ignored_ext = function( ext ){
		
		for( var i = 0; i != ignore_extensions.length; i++ ){			
			if( ext == ignore_extensions[i] ){
				return true;
			}
		}		
		return false;
		
	};

	this._extract_file_name_from_channel = function(http_channel){
		// check disposition name
		try{
			var dn = this.disposition_name(http_channel);
			if( dn ){
				return dn;
			}
		}
		catch(ex){}
		/*
		var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
		var tmp = url.split( "?" );
		url = tmp[0];
		tmp = url.split( "/" );
		tmp = tmp[ tmp.length - 1 ];
		
		if( tmp.indexOf( "." ) != -1 ){
			var replaceExt = this._get_ext_from_content_type( http_channel );
			if( replaceExt ){
				tmp = tmp.split( "." );
				tmp.pop();
				tmp.push( replaceExt );
				tmp = tmp.join(".");
			}
			return decodeURIComponent(tmp);
		}
		*/
		return  null;		
	};
	
	// obtain video extension from Content-type header
	// extensions patters:
	// video/x-(.+)
	// video/(.+?)
	this._get_ext_from_content_type = function( http_channel ){
		try{
			var contentType = http_channel.getResponseHeader( "Content-Type" );
			if( contentType ){
				var m = null;
				
				if( m = /video\/x-([^;]+)/.exec(contentType) ){
					return m[1];
				}
				else if( m = /video\/([^ ,]+)/.exec(contentType) ){
					return m[1];
				}
				
				return null;
			}
		}
		catch(ex){}		
		
		return null;
	};
	
	// --------------------------------------------   ��������� �� ������������� ������ � youtube
	this.needed_media = function(http_channel) 
	{	
	
		var url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
		if (url.indexOf("#") != -1)  url = url.substring(0, url.indexOf("#"));
		
		// youtube � vk
		if( url.indexOf("://s.ytimg.com") != -1 || 
		    url.indexOf("://o-o.preferred.") != -1 || 
		    url.indexOf("youtube.com") != -1 /*||   issue462 
		    url.indexOf(".googlevideo.com") != -1*/ ) {
		  // ignore  
			return false;      
		}
		
		if( url.indexOf( "vk.com" ) != -1  ) return false;
		
		// check url is in ignore list
		
		var ignore = false;
		IGNORE_SNIFFER_URL_SIGNS.forEach(function( sign ){
			if( url.indexOf( sign ) != -1 ){
				ignore = true;
				return false;
			}
		});
		
		if( ignore )			return;
			
		// if scheme is chrome - ignore this video
		if( http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.scheme == "chrome" )
		{
			return false;
		}
			
		// check min size
		try
		{
			var contentLength = http_channel.getResponseHeader('Content-Length');
			if( contentLength )
			{
				if( contentLength < minFileSizeToCheck )		return false;
			}
		}
		catch(e){
			return false; // fail check media length
		}
			
		var ext = this._get_file_ext( url );
		
		if( this._is_ignored_ext( ext ) )  {
			return false;
/* 			fl = true;
			
			try	{
				root_url = this.root_document_url(http_channel);
				if(!root_url)      root_url = url;
			} catch (e) {		}
			
			// проверим на audio-файл vk.com
			if ( /vk.com/i.test(root_url) )		fl=false;			
			
			if (fl) return false;
			else {
				if ( self.get_Insert_Button_VK() )		{
					this.observer.notifyObservers(null, 'FVD.Single-Media-VKontakteAudio', root_url);	
				}	
			} */
		}	
		
		// check Location header, if set, no handle this url
		try
		{
			var ct = http_channel.getResponseHeader('Location');
			if( ct ){
				return false;
			}

		} catch (e) {}		
	  
		// Content-type check	
		try
		{
			var ct = http_channel.getResponseHeader('Content-Type');
			
			var cta = ct.match(/^([a-z0-9]+)\//i);
			if (cta != null)
			{
				var t = cta[1].toLowerCase();
				//if ((t == 'audio') || (t == 'video')){
				if (t == 'audio'){
					return false;	
				}
				if (t == 'video'){
					return true;	
				}
			}

		} catch (e) {}		
		
		// check extension								
		if( this._is_video_ext( ext ) )		return true;
		
		if( this._is_game_ext( ext ) )		return true;
	
		// check disposition extension
		try
		{
			var dn = this.disposition_name(http_channel);
			var ext = this._get_file_ext( dn );			
			
			if( this._is_video_ext( ext ) || this._is_game_ext( ext ) )		return true;
					
		} 
		catch (e) {		}
		
		
		// check size
		try
		{
			var contentLength = http_channel.getResponseHeader('Content-Length');
			if( contentLength >= triggerVideoSize )		return true;
		}
		catch(e){		}
				
		return false;
	};

	this.disposition_name = function(http_channel)
	{
		try
		{
			var cd = http_channel.getResponseHeader('Content-Disposition');
			var at = cd.match(/^(inline|attachment);/i);

			if ((at != null) && (at[1].toLowerCase() == 'attachment'))
			{
				cd = cd.substr(at[0].length);
				if (cd.charAt(cd.length - 1) != ';') cd += ';';

				var fnm = cd.match(/filename="(.*?)"\s*?(?:;|$)/i);
				if (fnm == null) fnm = cd.match(/filename=(.*?)\s*?(?:;|$)/i);
				if (fnm != null) return fnm[1];
			}

		} catch (e) {}
		return '';
	};

	this.parent_window = function( http_channel ){
		var wnd = null;
		
 		try	{
			ir = http_channel.loadGroup.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
			wnd = ir.getInterface(Components.interfaces.nsIDOMWindow);  
			return wnd;
		}
		catch(ex)	{		 
			//dump('parent_window ->http_channel.loadGroup.notificationCallbacks.QueryInterface\n');
		} 
		
		try {
//			var notificationCallbacks = http_channel.notificationCallbacks ? http_channel.notificationCallbacks : http_channel.loadGroup.notificationCallbacks;
//			if (!notificationCallbacks)     return null;
//			wnd = notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
//			return gBrowser.getBrowserForDocument(wnd.top.document);
			
			wnd = http_channel.notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
			return wnd;
		}
		catch (e) {
			dump(e + "\n");
			return null;
		}		
		
	};

	this.parent_document_title = function(http_channel)
	{
		try
		{
			var ir = ((http_channel.notificationCallbacks != null) ? http_channel.notificationCallbacks : http_channel.loadGroup.notificationCallbacks).QueryInterface(Components.interfaces.nsIInterfaceRequestor);
			var wnd = ir.getInterface(Components.interfaces.nsIDOMWindow);

			if (wnd != null)
			{
				var ogt = (wnd.document.evaluate('/html/head/meta[@property="og:title"]', wnd.document.documentElement, null, 9, null)).singleNodeValue; // 9 - XPathResult.FIRST_ORDERED_NODE_TYPE
				if (ogt != null)
				{
					return ogt.getAttribute('content');
				} else
				{
					return wnd.document.title;
				}
			}

		} catch (e) {}
		return '';
	};

	this._requester_url = function( http_channel ){		
		var wnd = this.parent_window( http_channel );

        return wnd.top.document.location.toString();	
	};

	this.root_document_url = function(http_channel)
	{
		try
		{
			try{
				var root_url = this._requester_url( http_channel );
				return root_url;
			}
			catch( ex ){				
				http_channel = http_channel.QueryInterface(Components.interfaces.nsIHttpChannel);
				var root_url = this._requester_url( http_channel );
				return root_url;
			}

		} catch (e) {			
			// get from referer
			try{
				var ref = http_channel.getRequestHeader('Referer');	
				if(ref){
					return ref;
				}
			}
			catch(ex){
			}
		}
		return '';
	};

	this.parent_document_ext = function(http_channel)
	{
		try
		{
			var ct = http_channel.getResponseHeader('Content-Type');
			var cta = ct.match(/^([a-z0-9]+)\/([a-z0-9\-\.]+)/i);
			if (cta != null)
			{
				var t = cta[1].toLowerCase();
				if ((t == 'audio') || (t == 'video'))
				{
					var it = cta[2];

					var itx = cta[2].match(/^x-(.*)$/i);
					if (itx != null) it = itx[1];
					it = it.toLowerCase();

					var cts = ((t == 'video') ? mediatypes_video2ext : mediatypes_audio2ext); 
					if (it in cts)
					{
						return cts[it];
					}
				}
			}

		} catch (e) {}
		return '';
	};

	this.getSizeByUrl = function( url, callback ){
	
		var cached = KeyValueStore.get( "sizefor:"+url );
		if( cached ){			
			var event = {
				notify: function(timer) {
					callback( url, cached );
				}
			};
			 
			// Now it is time to create the timer...  
			var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
			timer.initWithCallback(event, 100, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
			
			return;
		}
		
		function _setToCache( size ){
			KeyValueStore.set( "sizefor:"+url, size, 5 * 60 * 1000 );
		}
	
        var ajax = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		ajax.open('GET', url, true);
		ajax.setRequestHeader('Cache-Control', 'no-cache');
		ajax.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;  
		ajax.url = url;
				
		ajax.onreadystatechange = function(){
						if( this.readyState == 3 )
						{
							var size = this.getResponseHeader("Content-Length");
							if (this.status == 200) 
							{
								if( size )
								{
									_setToCache( size );
									callback( this.url, size );											
									this.abort();
								}
							}				
						}
			
						if (this.readyState == 4) 
						{
							if (this.status == 200) 
							{
								var size = null;
								try
								{
									size = this.getResponseHeader("Content-Length");
								}
								catch(ex){}
								
								_setToCache( size );							
								callback( this.url, size );					
							}
							else
							{
								callback( this.url, null );
							}
						}
			
					};		
		
		ajax.send( null );
	};

	// --------------------------------------------------------------------------
	this.save_link = function(http_channel)
	{
		var dn ='';
		var dt = '';
		var url = '';
		var ext = '';
		var root_url = '';

		// get ext from content-type
		ext = this._get_ext_from_content_type( http_channel );		

		try
		{
			dn = this.disposition_name(http_channel);

		} catch (e) {}

		try
		{
			dt = this.parent_document_title(http_channel);
			if (dn)
			{
				var exs = dn.match(/([^\.]+)$/i);
				if ((exs != null) && (exs[1] != dn))
				{
					if( !ext ){
						ext = exs[1].toLowerCase();						
					}				

					dn = dn.substr(0, dn.length - ext.length - 1);
				}
			}
			else{
				if( !ext ){
					ext = this._get_file_ext(http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec);									
				}
			}

			if (!ext) ext = this.parent_document_ext(http_channel);

		} catch (e) {}

		try
		{
			url = http_channel.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
			if (url.indexOf("#") != -1)  url = url.substring(0, url.indexOf("#"));
		} catch (e) {}

		try
		{
			root_url = this.root_document_url(http_channel);

		} catch (e) {

		}
		if(userOS == "Android") {
      // fennec only
      if(root_url == "about:blank") {
        root_url = "";
      }
      if(!root_url) {
        // use same url as file for root_url
        root_url = url;
      }      
    }
		
		var nameFromChannel = this._extract_file_name_from_channel(http_channel);
		var size = null;
		try{
			var size = 	http_channel.getResponseHeader( "Content-Length" );			
		}
		catch(ex){}

		if( ext && ext.toLowerCase() == "swf" ){
			if(!this.getSwfDisplayState()){
				return false; // not add swf
			}
		}
		
		if( root_url.indexOf("chrome://") != -1 )
		{
			return false;//ignore chrome
		}		
			
		var contentType = null;	
		try
		{	
			contentType = http_channel.getResponseHeader( "Content-Type" );		
		}
		catch( ex )	{	}
		
		
		var referer = null;
		try
		{
			referer = http_channel.getRequestHeader( "Referer" );		
		}
		catch( ex ){	}
				
		// url preparations step dailymotion - ���������
/*		var media = MediaPrepare( {	url: url,  size: size, name: nameFromChannel } );
		if (media)
		{
			url = media.url;
			size = media.size;
			dt = media.name;
		}	*/
		
		var file_item = {
			"display_name": nameFromChannel ? nameFromChannel : url,
			"download_name" : nameFromChannel,
			'dn' : dn,
			'pn' : dt,
			'url': url,
			'ext': this._is_video_ext(ext) ? ext : null,
			'raw_file_ext': ext,
			'root_url' : root_url,
			'time' : (new Date()).toUTCString(),
			"playable": this.isPlayable(ext, contentType),
			'direct': true,
//			"size": size,
			referer: referer
		};

		if( size )		file_item.size = size;
		this.files[this.md5(url + root_url)] = file_item;

	//	this.files[this.md5(dt + ext + root_url)] = file_item;
		this.media_pages[root_url] = url;
			
		if (this.observer != null) {
		  this.observer.notifyObservers(null, 'FVD.Single-Media-Detect', root_url);
		  if(userOS == "Android") {
		    this.observer.notifyObservers(null, 'FVD.Single-Media-Detect', url);  
		  }
		} 
		  		
	};

	this.remove_files_by_page_url = function( page_url )
	{
		var countRemoved = 0;
		
		for (var i in this.files)
		{
			if (this.files[i]['root_url'] == page_url)	{
				delete this.files[i];
				countRemoved++;
			}
		}
		
		if( typeof this.media_pages[page_url] != "undefined" )
		{
			delete this.media_pages[page_url];
		}
		

		//dump( "Total files count: " + Object.keys(this.files).length + "\n\n" );

		return countRemoved;
	};

	this.get_files = function(url)
	{
		var f = {};

		for (var i in this.files)
		{
			if (this.files[i]['root_url'] == url) f[i] = this.files[i];
		}		
			
		return f;
	};
	
	this.get_files_all = function(  ){
		var media = {};
		
		for( var i in this.files ){			
			var file = this.files[i];
			
			if( !file.root_url ){
				continue;
			}
			
			if( !( file.root_url in media ) ){
				media[file.root_url] = {};
			}
			media[file.root_url][i] = file;
		}
		
		// clone object before return
		return JSON.parse( JSON.stringify( media ) );
	};
	
	this.get_files_url = function( url ){
		var media = {};
		
		for( var i in this.files )
		{			
			var file = this.files[i];

			if( !file.root_url )	continue;
			
			if (this.fileroot_url == url)
			{	
				if( !( file.root_url in media ) )		media[file.root_url] = {};
				media[file.root_url][i] = file;
			}
		}
		return media;
	};
	
	

	this.has_media = function(url)
	{
		if (url in this.media_pages)
		{
			return true;
		}
		return false;
	};

	try
	{
		this.detector = Components.classes['@flashvideodownloader.org/single_site_detector;1'].getService(Components.interfaces.IFVDSingleDetector);
	
		this.observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
		this.observer.addObserver(this.observer_struct, 'http-on-examine-response', false);
		this.observer.addObserver(this.observer_struct, 'http-on-examine-cached-response', false);

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);	

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
		var mainWindow = wm.getMostRecentWindow("navigator:browser");  
		
		try
		{
			mainWindow.document.getElementById( "appcontent" ).addEventListener("DOMContentLoaded", function( event ){
				self.pageLoadListener( event );
			}, true);
			mainWindow.gBrowser.addProgressListener(this.browser_progress_listener);
		}
		catch(ex){
			dump( "!!! FAIL SET document appcontent listener " + ex + "\n" );
		}
		

    } catch (e) {
			
		dump( "!!! FAIL INIT SNIFFER " + e + "\n" );	
		
	};

	this.wrappedJSObject = this;
};

var _snifferInstance = new FVD_Media_Sniffer(); 

// -----------------------------------------------------
// class factory
var FVD_Media_Sniffer_Factory = 
{
	createInstance: function (aOuter, aIID)
	{
		if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
		return _snifferInstance;
	}
};

// Moduel definition
var FVD_Media_Sniffer_Module =
{
	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
	},

	getClassObject: function(aCompMgr, aCID, aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIFactory)) throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		if (aCID.equals(CLASS_ID)) return FVD_Media_Sniffer_Factory;

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr)
	{
		return true;
	}
};

// Module initialization
function NSGetModule(aCompMgr, aFileSpec)
{
	return FVD_Media_Sniffer_Module;
};


function NSGetFactory()
{
	return FVD_Media_Sniffer_Factory; 
};



