/**
 * rkmMessage namespace.
 */
 
(function(){

	const RATE_MESSAGE_ID = "fvd-single-rate-message";

	FVD_SINGLE_rkmMessage = function(  ){

		var self = this;
	
		// -------------------------------------------------------
		this.init = function(  ){
		
			this.obsService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);		
		
			this.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		                       .getInterface(Components.interfaces.nsIWebNavigation)
		                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		                       .rootTreeItem
		                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		                       .getInterface(Components.interfaces.nsIDOMWindow);
							   
			var reg = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
			this.registry = reg.getBranch('extensions.fvd_single.');
			this.registry.QueryInterface(Components.interfaces.nsIPrefBranch2);
		};	
	
		// -------------------------------------------------------
		this.insert = function( type ){
		
			try	{
				this.displayRateMessage(type);
			}
			catch (ex)	{
				dump(ex);
			}	
		};	
	
		// -------------------------------------------------------
		this.displayRateMessage = function( type ){

			var doc = gBrowser.selectedBrowser.contentDocument;
		
			var message = doc.getElementById( this.RATE_MESSAGE_ID );
			
			if (type == "yandex")	{
				var addon_title = "Yandex Next";
				var first_line = "Ищи быстрее, экономь время (FireFox).";
				var second_line = null;
				var third_line = null;
				var button_title = "Узнать больше >>";
				var dont_again = true;
				var show_corner = true;
				var message_delay = 500;
				var url = "https://addons.mozilla.org/ru/firefox/addon/yandex-next/";
			}
			else if (type == "ffmpeg")	{
				var addon_title = "Full HD video download requires ffmpeg.";
				var first_line = "Due to new changes on YouTube, full hd video goes without audio stream.";
				var second_line = "FVD Downloader automatically downloads mp4 and mp3 files. After download is finished,";
				var third_line = "they will be merged into one Full HD mp4 file with audio stream. Enjoy!";
				var button_title = "Ok";
				var dont_again = false;
				var show_corner = false;
				var message_delay = 10;
				var url = null;
			}
		
			// ---------
			function _click() {
				if( message )	{
					message.setAttribute("style", "position: fixed; top: -1000px; right: 10px;	border: 5px solid rgba(0,0,0,0.5); background-clip: padding-box; background-color: #fff; border-radius: 10px; opacity: 0; -webkit-transition: opacity ease 500ms; font: 10px sans-serif; padding: 10px; text-align: center; overflow: hidden;	min-width: 250px; -webkit-transition-duration: 400ms; -webkit-transition-timing-function: ease-in-out; -webkit-transition-property: opacity;");
				}

				var browser = self.mainWindow.getBrowser();
	
				if (browser && url)	{
					var tab = browser.addTab(url);
					if (tab) browser.selectedTab = tab;
				}	
				
				if (type == "ffmpeg")	{
					fvd_single.downloadInstance.downloadByWindowFullHD( 
														fvd_single.downloadInstance.download_media_HD.yt_id,
														fvd_single.downloadInstance.download_media_HD.video_url, 
														fvd_single.downloadInstance.download_media_HD.audio_url, 
														fvd_single.downloadInstance.download_media_HD.name,
														fvd_single.downloadInstance.download_media_HD.ext, 
														fvd_single.downloadInstance.download_media_HD.referer,
														function( id_video, id_audio, dir_path, file_name ) {
				
															if( id_video ) {
					
																var ff = fvd_single.downloadFullHD;
																ff.push({ 	url: fvd_single.downloadInstance.download_media_HD.video_url, 
																				video_id: id_video, 
																				audio_id: id_audio, 
																				video_state: false, 
																				audio_state: false,
																				name: fvd_single.downloadInstance.download_media_HD.name,
																				path: dir_path,
																				file: file_name
																			});
															}	
														});
				}
			}
	
			// ---------
			function _hideRateMessage( event ){
				//rkmMessage.hideRateMessage();
				//message.removeEventListener( "click", _hideRateMessage, false );
			}

		
			if( !message )	{		
				message = doc.createElement("div");
				message.setAttribute("id", this.RATE_MESSAGE_ID);
				message.setAttribute("style", "position: fixed; top: -1000px; right: 10px;	border: 5px solid rgba(0,0,0,0.5); background-clip: padding-box; background-color: #fff; border-radius: 10px; opacity: 0; -webkit-transition: opacity ease 500ms; font: 10px sans-serif; padding: 10px; text-align: center; overflow: hidden;	min-width: 250px; -webkit-transition-duration: 400ms; -webkit-transition-timing-function: ease-in-out; -webkit-transition-property: opacity;");
				doc.body.appendChild( message );	
				message.addEventListener( "click", _hideRateMessage, false );
			
		
				var div = doc.createElement("div");
				div.setAttribute("class", "fvd_rate_content");
				div.setAttribute("style", "margin-bottom: 5px;");
				message.appendChild( div );	
		
				var div1 = doc.createElement("div");
				div1.setAttribute("class", "click linkedText bold center");
				div1.setAttribute("style", "margin-bottom: 5px;  cursor:pointer; font-weight:bold; font-size:11px;");
				div1.textContent = addon_title;
				div.appendChild( div1 );	
				div1.addEventListener( "click", _click, false );
		
				var div2 = doc.createElement("div");
				div2.setAttribute("class", "click linkedText");
				div2.setAttribute("style", "margin-top:15px; margin-bottom: 5px;  cursor:pointer;");
				div2.textContent = first_line;
				div.appendChild( div2 );	
				div2.addEventListener( "click", _click, false );

				var div3 = doc.createElement("div");
				div3.setAttribute("class", "click linkedText center");
				div3.setAttribute("style", "margin-bottom: 5px; cursor:pointer;");
				div3.textContent = second_line;
				div.appendChild( div3 );	
				div3.addEventListener( "click", _click, false );

				if (third_line)	{
					var div3a = document.createElement("div");
					div3a.setAttribute("class", "click linkedText center");
					div3a.textContent = third_line;
					div.appendChild( div3a );	
					div3a.addEventListener( "click", _click, false );
				}
				
				var div4 = doc.createElement("div");
				div4.setAttribute("class", "rate-button");
				div4.setAttribute("style", "margin-bottom: 5px; margin-top:15px; height: 24px;");
				div.appendChild( div4 );	

				var div4a = doc.createElement("a");
				div4a.setAttribute("class", "button_concealed");
				div4a.setAttribute("style", "text-decoration: none; margin-bottom: 5px; background: linear-gradient(#84C63C, #489615) repeat scroll 0 0 #489615; padding: 6px 16px 8px 16px; font-size: 12px; display: inline-block; text-align: center; text-decoration: none;	cursor: pointer; border-radius: 6px;	border: 0;	color: #fff;	box-shadow: 0 3px rgba(0,0,0,.05),0 -4px rgba(0,0,0,.05) inset;	-moz-box-shadow: 0 3px rgba(0,0,0,.05),0 -4px rgba(0,0,0,.05) inset;	-webkit-box-shadow: 0 3px rgba(0,0,0,.05),0 -4px rgba(0,0,0,.05) inset;	text-shadow: 0 1px 0 rgba(255,255,255,.5);");
				div4.appendChild( div4a );	
				div4a.addEventListener( "click", _click, false );
				
				var div4s = doc.createElement("span");
				div4s.textContent = button_title
				div4a.appendChild( div4s );	
				
				if (dont_again)	{
					var div5 = doc.createElement("div");
					div5.setAttribute("style", "margin-bottom: 5px; margin-top: 20px;	font: 10px sans-serif;	text-align:right;");
					div.appendChild( div5 );	

					var div5l = doc.createElement("label");
					div5l.setAttribute("style", "display: inline-block;	vertical-align: top;	font: 10px sans-serif;");
					div5.appendChild( div5l );	
				
					var div5ls = doc.createElement("strong");
					div5ls.setAttribute("style", "font-weight: normal; line-height: 0px; font: 10px sans-serif;");
					div5ls.textContent = "Do not display again";
					div5l.appendChild( div5ls );	
				
					var div5i = doc.createElement("input");
					div5i.setAttribute("type", "checkbox");
					div5i.setAttribute("style", "margin: 0px; margin-left: 2px;	vertical-align: bottom;");
					div5i.removeAttribute("checked");
					div5l.appendChild( div5i );	

					div5l.addEventListener("click", function(){
								var xx = "display_rkm_"+type;
								self.registry.setBoolPref(xx, false)				
								self.hideRateMessage();
							}, false);
				}
			}
	
			setTimeout(function(){
						if ( show_corner )	{
							message.setAttribute("style", "z-index: 2147483638; position: fixed; top: 10px; right: 10px;	border: 5px solid rgba(0,0,0,0.5); background-clip: padding-box; background-color: #fff; border-radius: 10px; opacity: 1; -webkit-transition: opacity ease 500ms; font: 10px sans-serif; padding: 10px; text-align: center; overflow: hidden;	min-width: 250px; -webkit-transition-duration: 400ms; -webkit-transition-timing-function: ease-in-out; -webkit-transition-property: opacity;");
						}
						else	{
							var top = window.innerHeight / 2 - 100;
							var left = window.innerWidth / 2 - 150;
							message.setAttribute("style", "z-index: 2147483638; position: fixed; top: "+top+"px; left: "+left+"px;	border: 5px solid rgba(0,0,0,0.5); background-clip: padding-box; background-color: #fff; border-radius: 10px; opacity: 1; -webkit-transition: opacity ease 500ms; font: 10px sans-serif; padding: 10px; text-align: center; overflow: hidden;	min-width: 250px; -webkit-transition-duration: 400ms; -webkit-transition-timing-function: ease-in-out; -webkit-transition-property: opacity;");
						}
					}, message_delay);
		};
	
		// -------------------------------------------------------
		this.hideRateMessage = function( type ){
		
			var doc = gBrowser.selectedBrowser.contentDocument;
			
			var message = doc.getElementById( this.RATE_MESSAGE_ID );
			if( message )	{
				message.setAttribute("style", "position: fixed; top: -1000px; right: 10px;	border: 5px solid rgba(0,0,0,0.5); background-clip: padding-box; background-color: #fff; border-radius: 10px; opacity: 0; -webkit-transition: opacity ease 500ms; font: 10px sans-serif; padding: 10px; text-align: center; overflow: hidden;	min-width: 250px; -webkit-transition-duration: 400ms; -webkit-transition-timing-function: ease-in-out; -webkit-transition-property: opacity;");
			}

		};


// ================================================================================================
	}	
})();
