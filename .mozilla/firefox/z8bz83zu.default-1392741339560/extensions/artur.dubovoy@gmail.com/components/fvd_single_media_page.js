const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID('{213bea84-5789-4ff2-a3da-24eb505ea819}');
const CLASS_NAME = 'FVD media page';
const CONTRACT_ID = '@flashvideodownloader.org/single_media_page;1';
const TITLE_MAX_LENGTH  = 96;
const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';

const DISPLAY_FVDSD_RATE_SHOW = 3600 * 24 * 1 * 1000; // one day

// -----------------------------------------------------
function FVD_Media_Page()  {
	
	var self = this;
	this.detector = null;
	this.sniffer = null;
	
	this.pageLoadTimer = null;
	this.Node = null;
	this.XPathResult = null;
	
	// --------------------------------------------------------------------------------
	this.alert = function(text)
	{
		var aConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		aConsoleService.logStringMessage(text);
	};
	
	// --------------------------------------------------------------------------------
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
	// --------------------------------------------------------------------------------
	function trimMore(t) {
		if (t == null) return '';
		return t.replace(/^[\s_]+|[\s_]+$/gi, '').replace(/(_){2,}/g, "_");
	}

	// --------------------------------------------------------  
	function parse_str(str){
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
	}
	
	// --------------------------------------------------------------------------------
	this.browser_progress_listener = {	
	
		
		onLocationChange: 	function(aWebProgress, aRequest, aURI){
									var doc = aWebProgress.DOMWindow.document;
									var url = doc.location.href;
								},
		onStateChange: 		function(aWebProgress, aRequest, aFlag, aStatus) {
									if(aFlag & Components.interfaces.nsIWebProgressListener.STATE_STOP)  
									{
										var doc = aWebProgress.DOMWindow.document;
										var url = doc.location.href;
										self.pageLoad( url, true );  
									} 
								},
								
	}
	
	// --------------------------------------------------------------------------------
	this.pageLoadListener = function( event )  {
	
		var win = event.target.defaultView;
	    if (win.wrappedJSObject)	win = win.wrappedJSObject;				
		var doc = win.document;
		var url = doc.location.href;
		
		this.pageLoad( url, false );
		
	}
	
	// ========================================================================================================================
	this.pageLoad = function( root_url, fl  )  {

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
		var mainWindow = wm.getMostRecentWindow("navigator:browser");  
		var gBrowser = mainWindow.gBrowser;			
		var doc = gBrowser.selectedBrowser.contentDocument;

		var url = doc.location.href;
		
		var prefsGlobal = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		
		if (url.toLowerCase().match(/https?:\/\/(?:www\.)?youtube\.com\/watch.*[\?|&]v=([^\?&]+)/i) )		{
		//	this.get_YT_Watch( doc );
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?youtube\.com\/user\/([^\/\?&]+)/i) )		{
		//	this.get_YT_User( doc );
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?twitter\./i) )	{
			//this.Rkm_Message( doc, "twitter", url );
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?instagram\./i) )	{
			//this.Rkm_Message( doc, "instagram", url );
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?vine\.co/i) )		{
			//this.Rkm_Message( doc, "vine", url );
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?yandex\.ru/i) )	{
			if( prefsGlobal.getCharPref("general.useragent.locale").indexOf("ru") != -1 ){
				this.Rkm_Message( doc, "yandex", url );
			}	
		}
		else if (url.toLowerCase().match(/https?:\/\/(?:www\.)?ya\.ru/i) )	{
			if( prefsGlobal.getCharPref("general.useragent.locale").indexOf("ru") != -1 ){
				this.Rkm_Message( doc, "yandex", url );
			}	
		}
	}
	// =========================================================   YOUTUBE   ========================================================
	this.Rkm_Message = function( document, t, url )  {

		var branch = this.registry.getBranch(SETTINGS_KEY_BRANCH);
		if (branch.getBoolPref('ads_suggestions')) 	return;	
		
		var xx = "display_rkm_"+t;
		var flag = branch.getBoolPref(xx);
		
		if (flag)	{
			var xx = "last_show_rkm_"+t;
			var last = parseInt(branch.getCharPref( xx ));

			last += DISPLAY_FVDSD_RATE_SHOW;
				
			var current_dt = new Date();
			var current_time = current_dt.getTime();
			if (last < current_time)	{
				branch.setCharPref( xx.toString(), current_time );
				self.sniffer.observer.notifyObservers(null, 'FVD.Single-Media-Rkm', t);
			}
		}
	}
	// =========================================================   YOUTUBE   ========================================================
	this.get_YT_User = function( document )  {
	
		var element = document.getElementById( "upsell-video" );
		var flvVar = element.getAttribute("data-swf-config");
		flvVar = flvVar.replace(/&quot;/g, "\"");
		
		var data = JSON.parse(flvVar);
		
		var jsn = data.args.url_encoded_fmt_stream_map;	
		var length_seconds = data.args.length_seconds;
		var title = "";
		var sps = document.getElementsByClassName( "title" );
		if (sps) title = trimMore(sps[0].textContent);
		
		var availFormats=[];
        var mediaFound = false;
				
		var fmts=jsn.split(",");
				
		for(var j in fmts) 
		{
			var parts=fmts[j].split("&");
			var fmts2={}
			var sig=null;
			for(var k in parts) 
			{
				var pline=decodeURIComponent(parts[k]);
				var m=/^sig=(.*)/.exec(pline);
				if(m)	sig=m[1];
				var match2=/^(.*?)=(.*)$/.exec(pline);
				if(match2 && match2.length==3) 
				{
					fmts2[match2[1]]=match2[2];
				}
			}
			if(fmts2['itag'] && fmts2['url']) 
			{
				if(sig) 	fmts2['url']+="&signature="+sig;
				availFormats[fmts2['itag']]=fmts2['url'];
				mediaFound = true;
			}
		}										
		
		if ( mediaFound )
		{	
			this.get_youtube_format( availFormats, title, length_seconds, document.location.href );
		}	
		
		if ( mediaFound )
		{
            if (self.sniffer.observer != null) 
			{
                self.sniffer.observer.notifyObservers(null, 'FVD.Single-Media-Detect', document.location.href);
				if ( self.sniffer.get_Insert_Button() )
				{
					self.sniffer.observer.notifyObservers(null, 'FVD.Single-Media-Youtube', document.location.href);
				}	
            }
		}
					
	}
	// --------------------------------------------------------------------------------
	this.get_YT_Watch = function( document )  {
		
		var mediaFound = false;
		var dom = document.documentElement;
		var scripts = this.xpGetStrings(dom,".//script/text()",{});

		var availFormats=[];
		var length_seconds = null;
		
		// -------------------------------------
		function ExtractFUM(fum) {
			var parts=fum.split(",");
			for(var j in parts) 
			{
				var parts2=parts[j].split("\\u0026");
				var fmts2={}
				var sig=null;
				for(var k in parts2) 
				{
					var pline=decodeURIComponent(parts2[k]);
					var m=/^sig=(.*)/.exec(pline);
					if(m)	sig=m[1];
					var match2=/^(.*?)=(.*)$/.exec(pline);
					if(match2 && match2.length==3) 	fmts2[match2[1]]=match2[2];
				}
					
				if(fmts2['itag'] && fmts2['url']) 
				{
					if(sig!=null)	fmts2['url']+="&signature="+sig;
					availFormats[fmts2['itag']]=fmts2['url'];
					mediaFound=true;									
				}
			}				
		}
			
		// ---------------------------------------
		function Extract(script) {
			var match=/fmt_url_map=([^&\\\"]+)/.exec(script);
			if(match!=null && match.length==2) 
			{
				var fum=decodeURIComponent(match[1]);
				var fmts=fum.split(",");
				for(var j in fmts) 
				{
					var m2=/^([0-9]+)\|(.*)/.exec(fmts[j]);
					if(m2 && m2.length==3) 
					{
						availFormats[m2[1]]=m2[2];
						mediaFound=true;
					}
				}
			} 
			else 
			{
				match=/url_encoded_fmt_stream_map": "(.*?)"/.exec(script);
				if(match) 
				{
					var fum=match[1];
					ExtractFUM(fum);
				}
			}				
		}
	
		// ---------------------------------------------------
		for(var i=0;i<scripts.length;i++) 
		{
			var script = scripts[i];
			Extract(script);
			
			var match=/length_seconds": (.*?),/.exec(script);
			if (match) length_seconds = match[1];
		}
		
		// --------------------------------------------------- 2 ������
		if( mediaFound == false ) 
		{
			for(var i=0;i<scripts.length;i++) 
			{
				var script=scripts[i];
				var match=/\"fmt_url_map\" *: *\"([^\"]+)\"/.exec(script);
				if(match!=null && match.length==2) 
				{
					var fmts=match[1].replace(/\\\//g,"/").split(",");
					for(var j in fmts) 
					{
						var fmt0 = fmts[j].replace(/\\u([0-9]{4})/g,function(str,p1) {
												return String.fromCharCode(parseInt(p1,16));
											});
											
						var fmt=decodeURIComponent(fmt0);
						var m2=/^([0-9]+)\|(.*)/.exec(fmt);
						if(m2 && m2.length==3) 
						{
							availFormats[m2[1]]=m2[2];
						}
					}
				}
			}
		}
		
		// ---------------------------------------------------
		if ( mediaFound )
		{	
			var title = this.xpGetString(dom,"/html/head/meta[@name='title']/@content");
			if(title==null || title.length==0) 
			{
				title = this.xpGetString(dom,".//h3[@id='playnav-restricted-title']/text()");
			}
			if(title==null || title.length==0) 
			{
				title = this.xpGetString(dom,".//div[@class='content']/div/a/img[@title]/@title");
			}			
			if(title) 
			{
				title=this.resolveNumericalEntities(title);
				title=title.replace(/"/g,"");
			}

			var fileName=title;
			fileName=fileName.replace(/(?:[\/"\?\*:\|"'\\_]|&quot;|&amp;|&gt;|&lt;)+/g,"_");
			if(title) 
			{
				title=title.replace(/&quot;/g,"\"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
			}


			
			this.get_youtube_format( availFormats, fileName, length_seconds, document.location.href );
		}	
		else  //------------------------------------------------ EMBEDS ---------------------------------
		{
			var embeds = new Array(document.embeds.length);
			for (var iii = 0; iii < document.embeds.length; iii++) 
			{
				if( document.embeds[iii].id && document.embeds[iii].id == "movie_player" )
				{
					var flvVars = null;
					if (document.embeds[iii].hasAttribute('flashvars')) flvVars = document.embeds[iii].getAttribute('flashvars');
				
					if (flvVars != null)	
					{
						var p=flvVars.split("&");
						var fileName=null;

						for(var i in p) 
						{
							var m=/^(.*?)=(.*)$/.exec(p[i]);
							if(m!=null && m.length==3) 
							{
								if(m[1]=="fmt_url_map") 
								{
									var fum=decodeURIComponent(m[2]);
									var fmts=fum.split(",");
									for(var j in fmts) 
									{
										var m2=/^([0-9]+)\|(.*)/.exec(fmts[j]);
										if(m2 && m2.length==3) 
										{
											availFormats[m2[1]]=m2[2];
										}
									}
								} 
								else if(m[1]=="url_encoded_fmt_stream_map") 
								{
									var fum=decodeURIComponent(m[2]);
									var fmts=fum.split(",");
										
									for(var j in fmts) 
									{
										var parts=fmts[j].split("&");
										var fmts2={}
										var sig=null;
										for(var k in parts) 
										{
											var pline=decodeURIComponent(parts[k]);
											var m=/^sig=(.*)/.exec(pline);
											if(m)	sig=m[1];
											var match2=/^(.*?)=(.*)$/.exec(pline);
											if(match2 && match2.length==3) 
											{
												fmts2[match2[1]]=match2[2];
											}
										}
										if(fmts2['itag'] && fmts2['url']) 
										{
											if(sig) 	fmts2['url']+="&signature="+sig;
											availFormats[fmts2['itag']]=fmts2['url'];
											mediaFound = true;
										}
									}										
								} 
								else if(m[1]=="adaptive_fmts") 
								{
									var fum=decodeURIComponent(m[2]);
									var fmts = fum.split('&');
						
									for (var i = 0; i < fmts.length; i++) 
									{
										var mu = fmts[i].split('=');
					
										if ( mu[0] == "url")
										{
											url_info = decodeURIComponent(mu[1]);
											var x = url_info.split('&');
											for (var j = 0; j < x.length; j++) 
											{
												var mt = x[j].split('=');
												if ( mt[0] == "itag")
												{
													tag = mt[1];
													availFormats[tag] = url_info;
													mediaFound = true;
												}
											}
										}
									}
								}
								else if(m[1]=="title") 
								{
									fileName=decodeURIComponent(m[2]);
									fileName=fileName.replace(/\+/g," ");
									fileName=fileName.replace(/(?:[\/"\?\*:\|"'\\_]|&quot;|&amp;|&gt;|&lt;)+/g,"_");
								}
								else if(m[1]=="length_seconds") 
								{
									length_seconds = decodeURIComponent(m[2]);
								}
							}
						}
						if ( mediaFound )
						{	
							this.get_youtube_format( availFormats, fileName, length_seconds, document.location.href );
						}	
					}	
				}
			}	
		}	

		if ( mediaFound == false )
		{
			for(var i=0;i<scripts.length;i++) 
			{
				var script=scripts[i];
				var match=/\"video_id\": \"(.*?)\".*\"t(?:oken)?\": \"(.*?)\"/m.exec(script);
				if(match!=null && match.length==3) 
				{
					videoId=match[1];
					t=match[2];
					break;
				}
				var match=/\"t(?:oken)?\": \"(.*?)\".*\"video_id\": \"(.*?)\"/m.exec(script);
				if(match!=null && match.length==3) 
				{
					videoId=match[2];
					t=match[1];
					break;
				}
			}
			
			if(videoId==null || t==null) 
			{
				for(var i=0;i<scripts.length;i++) 
				{
					var script=scripts[i];
					var match=/[^_]video_id=([^&]+)(?:&.*)&t=([^&]+)/m.exec(script);
					if(match!=null && match.length==3) 
					{
						videoId=match[1];
						t=match[2];
						break;
					}
					var match=/[&\?]t=(.*?)(?:&|&.*[^_])video_id=(.*?)(?:&|")/m.exec(script);
					if(match!=null && match.length==3) 
					{
						videoId=match[2];
						t=match[1];
						break;
					}
				}
			}
			
			if(videoId==null || t==null) 
			{
				var embeds=Util.xpGetStrings(dom,".//embed/@src",{});
				for(var i=0;i<embeds.length;i++) 
				{
					var embed=embeds[i];
					var match=/[^_]video_id=(.*?)&.*t=(.*?)(?:&|")/m.exec(embed);
					if(match!=null && match.length==3) 
					{
						videoId=match[1];
						t=match[2];
						break;
					}
				}
				if(videoId==null || t==null) return;
			}
			
			
			function StreamListener(service, availFormats) {
				this.service=service;
				this.availFormats=availFormats;
			}

			StreamListener.prototype={
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
							if(this.responseStatus==200) 
							{
								var p=this.data.split("&");
								//dump("get info "+JSON.stringify(p)+"\n");
								for(var i in p) 
								{
									var m=/^(.*?)=(.*)$/.exec(p[i]);
									if(m!=null && m.length==3) 
									{
										//dump(m[1]+"="+m[2]+"\n");
										if(m[1]=="fmt_url_map") 
										{
											var fum=decodeURIComponent(m[2]);
											var fmts=fum.split(",");
											for(var j in fmts) 
											{
												var m2=/^([0-9]+)\|(.*)/.exec(fmts[j]);
												if(m2 && m2.length==3) 
												{
													this.availFormats[m2[1]]=m2[2];
													mediaFound = true;
												}
											}
										}
									} 
								}
								if ( mediaFound )
								{	
									this.service.get_youtube_format( availFormats, fileName, length_seconds, document.location.href );
								}	
							}
							uri=null;
							channel=null;
						}
			}
			
			var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var uri = ioService.newURI("http://www.youtube.com/get_video_info?video_id="+videoId+"&fmt=135", null, null);
			var channel = ioService.newChannelFromURI(uri);
				
			channel.asyncOpen(new StreamListener(this, availFormats), null);
		}

		// ----- 
		if ( mediaFound )
		{
            if (self.sniffer.observer != null) 
			{
                self.sniffer.observer.notifyObservers(null, 'FVD.Single-Media-Detect', document.location.href);
				if ( self.sniffer.get_Insert_Button() )
				{
					self.sniffer.observer.notifyObservers(null, 'FVD.Single-Media-Youtube', document.location.href);
				}	
            }
		}
	}
	
	// ---------------------------------------------------------------------------
	this.get_youtube_format = function(availFormats, fileName, length_seconds, root_url )	{

		//  http://en.wikipedia.org/wiki/YouTube#Quality_and_codecs
		var ytf = {
					5: 		{  title: 'Low',           frm: 'flv',		size: "240p", 	video_bitrate: 0.25, 	audio_bitrate: 64        },
					6: 		{  title: 'Low',           frm: 'flv',		size: "270p", 	video_bitrate: 0.8, 	audio_bitrate: 64        },
					13: 	{  title: 'Mobile',        frm: '3gp',		size: "144p", 	video_bitrate: 0.5, 	audio_bitrate: 64        },
					17: 	{  title: 'Mobile',        frm: '3gp',	    size: "144p", 	video_bitrate: 0.05, 	audio_bitrate: 24        },
					36: 	{  title: 'Mobile',        frm: '3gp',		size: "240p", 	video_bitrate: 0.17, 	audio_bitrate: 38        },
					18: 	{  title: 'Low',           frm: 'mp4',		size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 96	     },
					22: 	{  title: 'HD',            frm: 'mp4',		size: "720p", 	video_bitrate: 2.5, 	audio_bitrate: 192       },
					34: 	{  title: 'Low',           frm: 'flv',		size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 128       },
					35: 	{  title: 'SD',            frm: 'flv',		size: "480p", 	video_bitrate: 1.0, 	audio_bitrate: 128       },
					37: 	{  title: 'Full HD',       frm: 'mp4',		size: "1080p", 	video_bitrate: 3.0, 	audio_bitrate: 192       },
					38: 	{  title: '4K',            frm: 'mp4',		size: "3072p", 	video_bitrate: 4.0, 	audio_bitrate: 192       },
					43: 	{  title: "Low",           frm: 'webm',		size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 128       },
					44: 	{  title: "SD",            frm: 'webm',		size: "480p", 	video_bitrate: 1.0, 	audio_bitrate: 128       },
					45: 	{  title: "HD",            frm: 'webm',		size: "720p", 	video_bitrate: 2.0, 	audio_bitrate: 192       },
					46: 	{  title: "Full HD",       frm: 'webm',    	size: "1080p", 	video_bitrate: 3.0, 	audio_bitrate: 192       },
					82: 	{  title: "3D Low",        frm: 'mp4',	    size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 96        },
					83: 	{  title: "3D Low",        frm: 'mp4',	    size: "240p", 	video_bitrate: 0.5, 	audio_bitrate: 96        },
					84: 	{  title: "3D HD",         frm: 'mp4',	    size: "720p", 	video_bitrate: 2.0, 	audio_bitrate: 152       },
					85: 	{  title: "3D SD",         frm: 'mp4',     	size: "520p", 	video_bitrate: 2.0, 	audio_bitrate: 152       },
					100: 	{  title: "3D Low",        frm: 'webm',		size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 128       },
					101: 	{  title: "3D Low",        frm: 'webm',		size: "360p", 	video_bitrate: 0.5, 	audio_bitrate: 192       },
					102: 	{  title: "3D HD",         frm: 'webm',		size: "720p", 	video_bitrate: 2.0, 	audio_bitrate: 192       },		
					
					133: 	{  title: "HQ133", 	 	   frm: "mp4", 		size: "240p", 	 		},
					134: 	{  title: "HQ134", 	 	   frm: "mp4", 		size: "360p", 	 		},
					135: 	{  title: "HQ135", 	 	   frm: "mp4", 		size: "480p", 	 		},
					136: 	{  title: "HQ136", 	 	   frm: "mp4", 		size: "720p", 	 		},
					137: 	{  title: "HQ137", 	 	   frm: "mp4", 		size: "1080p", 	 		},
					
					139: 	{  title: "HQ139", 	 	   frm: "mp4", 		size: "360p", 	 		},
					140: 	{  title: "HQ140", 	 	   frm: "mp4", 		size: "480p", 	 		},
					141: 	{  title: "HQ141", 	 	   frm: "mp4", 		size: "360p", 	 		},
					160: 	{  title: "HQ160", 	 	   frm: "mp4", 		size: "144p", 	 		},
				};

		var title = "video";					
		if (fileName != null) 
		{
			title = fileName;
            title = self.sniffer.decode_html.call(self.sniffer, self.sniffer.decode_html.call(self.sniffer, title));
			if (title.length > TITLE_MAX_LENGTH)   title = title.substr(0, TITLE_MAX_LENGTH) + '...';
		}	
							
		for (var i in ytf) 
		{
			if(typeof(availFormats[i]) != "undefined") 
			{
				var u = availFormats[i];
                    
				var ft = ((title != null) ? title + ' (' + ytf[i].title + '-' + ytf[i].size + ')' : null);
                   
				var ext = ytf[i].frm.toLowerCase();
					
				var q = ytf[i].title + "[" + ytf[i].size + "]";
										
				var size = null;							
				if (ytf[i].audio_bitrate)	size = (ytf[i].audio_bitrate * 128 * length_seconds) + (ytf[i].video_bitrate * 131072 * length_seconds);
				var file_item = {
								'url': u,
								'ext': ext,
								'display_name': u,
								'download_name' : ft,
								'dn' : ft,
								'pn' : ft,
								'raw_file_ext': ((i in ytf) ? (ytf[i].title) : 'FLV'),
								'root_url' : root_url,
								'time' : (new Date()).toUTCString(),
								'playable': (i in ytf) ? self.sniffer.isPlayable((ytf[i].frm)) : false,
								'direct': true,
								'yt_format': i,
								'size': size,
								'referer': ""
								};
				
				this.sniffer.files[this.sniffer.md5(i + root_url)] = file_item;
				this.sniffer.media_pages[root_url] = u;
			}
		}

		return;
	}
	
	// ===============================================================================================================================
	this.xpGetStrings = function(node,xpath) {
	
		var strings=[];
		
		var xpr = node.ownerDocument.evaluate(xpath, node, null, this.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    
		var node0 = xpr.iterateNext();
    
		while(node0 != null) 
		{
			if(node0.nodeType == this.Node.TEXT_NODE)
			{
				strings.push(node0.nodeValue);
			}	
			else if(node0.firstChild != null && node0.firstChild.nodeType == this.Node.TEXT_NODE)
			{
				strings.push(node0.firstChild.nodeValue);
			}	
			node0=xpr.iterateNext();
		}
		return strings;
	}

	// -----------------------------------------------------------------------------------------
	this.xpGetString = function(node,xpath)  {
		var text=node.ownerDocument.evaluate(xpath, node, null, this.XPathResult.STRING_TYPE, null).stringValue;
		return text;
	}
	
	// -----------------------------------------------------------------------------------------
	this.resolveNumericalEntities = function(str) {
		if(!this._resolveNumericalEntitiesCallbackDec) 
		{
			this._resolveNumericalEntitiesCallbackDec=function(m,m1) {
								try 
								{
									return String.fromCharCode(parseInt(m1,10));
								} 
								catch(e) 
								{
									return '';
								}
							}
		}
		
		if(!this._resolveNumericalEntitiesCallbackHex) 
		{
			this._resolveNumericalEntitiesCallbackHex=function(m,m1) {
								try 
								{
									return String.fromCharCode(parseInt(m1,16));
								} 
								catch(e) 
								{
									return '';
								}
							}
		}
		
		str=str.replace(/&#([0-9]+);/g,this._resolveNumericalEntitiesCallbackDec);
		str=str.replace(/&#[xX]([0-9a-fA-F]+);/g,this._resolveNumericalEntitiesCallbackHex);
		return str;
	}
	
	// ===============================================================================================================================
	try
	{
		this.detector = Components.classes['@flashvideodownloader.org/single_site_detector;1'].getService(Components.interfaces.IFVDSingleDetector);
		this.sniffer = Components.classes['@flashvideodownloader.org/single_media_sniffer;1'].getService().wrappedJSObject;
	
		this.Node = Components.interfaces.nsIDOMNode;
		this.XPathResult = Components.interfaces.nsIDOMXPathResult;

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);	

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
		var mainWindow = wm.getMostRecentWindow("navigator:browser");  
		
		try
		{
			mainWindow.document.getElementById( "appcontent" ).addEventListener("DOMContentLoaded", function( event ) {
			
														self.pageLoadListener( event );
														
													}, true);
													
													
 			mainWindow.gBrowser.addProgressListener(this.browser_progress_listener);
		}
		catch(ex)
		{
			dump( "!!! FAIL SET document appcontent listener " + ex + "\n" );
		}

    } 
	catch (e) 
	{
			
		dump( "!!! FAIL INIT MEDIA_PAGE " + e + "\n" );	
		
	};

	this.wrappedJSObject = this;
};

// -----------------------------------------------------
// class factory
var FVD_Media_Page_Factory = {
	createInstance: function (aOuter, aIID)
	{
		if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
		return (new FVD_Media_Page());
	}
};

// -----------------------------------------------------
// Moduel definition
var FVD_Media_Page_Module =
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

// -----------------------------------------------------
// Module initialization
function NSGetModule(aCompMgr, aFileSpec)
{
	return FVD_Media_Page_Module;
};


// -----------------------------------------------------
function NSGetFactory()
{
	return FVD_Media_Page_Factory; 
};
