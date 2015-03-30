var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);	

function _getMainWindow(){
	var mainWindow = opener.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	                       .getInterface(Components.interfaces.nsIWebNavigation)
	                       .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
	                       .rootTreeItem
	                       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	                       .getInterface(Components.interfaces.nsIDOMWindow);
	
   	return mainWindow;
}

var installListener = new function(){
	
	this.onInstallEnded = function(){
				
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var restart = promptService.confirm( window, "Youtube Downloader Installed", "Youtube downloader has been successfully installed. You need to restart your browser. Do you want to restart and restore Opened Tabs?" );
	
		if( restart ){
			var boot = Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(Components.interfaces.nsIAppStartup);
			boot.quit(Components.interfaces.nsIAppStartup.eForceQuit|Components.interfaces.nsIAppStartup.eRestart);
		}
	
		window.close();
		
	}
	
}

function navigate_url(url, event)
{
	var browser = _getMainWindow().getBrowser();
	var tab = browser.addTab(url);
	if (tab) browser.selectedTab = tab;	
};

function signPetition(){
	
	navigate_url( "http://www.change.org/petitions/youtube-googlede-allow-third-party-recording-tools-for-youtube-freedomonyoutube" );
	window.close();
	
}

function goToMozilla(){
	
	Components.utils.import('resource://gre/modules/AddonManager.jsm');	
	AddonManager.getInstallForURL( "https://addons.mozilla.org/firefox/downloads/latest/456252/addon-456252-latest.xpi?src=dp-btn-primary", function( addonInstall ){
		
		document.getElementById( "installationDeck" ).selectedIndex = 1;
		
		addonInstall.addListener( installListener );
		addonInstall.install();
		
	}, "application/x-xpinstall" );
	
	
	//navigate_url( "https://addons.mozilla.org/en-US/firefox/addon/fvd-synchronizer/" );
	//window.close();
}
