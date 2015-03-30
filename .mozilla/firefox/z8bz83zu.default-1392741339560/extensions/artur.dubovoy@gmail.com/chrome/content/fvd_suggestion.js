try
{
	// try import addon manager for extension version detection in firefox4
	Components.utils.import('resource://gre/modules/AddonManager.jsm');

} catch (e) {}

function Log(outputString) 
{
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(outputString);
}

function FVD_Suggestion()
{
	const EXTENSION_GUID = 'artur.dubovoy@gmail.com';
	const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';

	var self = this;
	
	this.step = 0;
	
	this.instant_apply = false;
	this.registry = null;
	
	this.init = function()	{
		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('browser.preferences.');
		try
		{
			this.instant_apply = this.registry.getBoolPref('instantApply');
		} catch (e) {}

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(SETTINGS_KEY_BRANCH);
		
		var xai = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo);
		var vc = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator);

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var main_wnd = wm.getMostRecentWindow('navigator:browser');
		
	};

	this.display_show_display_alert = function( event )
	{
		var pref = event.originalTarget;
		var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.settings.properties');			
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, bundle.GetStringFromName("fvd.single.select_format.alert.title"), bundle.GetStringFromName("fvd.single.select_format.alert.text"));
	}


	// -------------------------------------------
	this.main_showfiles_click = function(event, name)
	{
		this.change_formats = true;
	};
	
	this.main_button_setup = function(event)
	{
		if (this.instant_apply)
		{
			var be = event.originalTarget;
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			observer.notifyObservers(null, 'FVD.Single-MainButton-Change', (be.checked == true));
		}
	};
	
	this.status_button_setup = function(){
		
		if (this.instant_apply){
			var abe = document.getElementById('fvdsd_status_button_exists');
			if (abe)
			{
				var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
				observer.notifyObservers(null, 'FVD.Single-StatusButton-Change', (abe.checked == true));
			}
		}
		

	}
	
	this.display_swf_display_alert = function( event ){
		var pref = event.originalTarget;
		if( pref.value ){
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');			
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        			.getService(Components.interfaces.nsIPromptService);

			prompts.alert(null, bundle.GetStringFromName("fvd.single.swf_display.alert.title"), bundle.GetStringFromName("fvd.single.swf_display.alert.text"));
		}
	}
	
	
	this.ok = function(event)	{

		this.registry.setBoolPref('ads_suggestions', false);
		
		this.registry.setCharPref( "superfish.ramp.start_time", "1" );
		this.registry.setBoolPref( "enable_superfish", true );
		
		//var pp = document.getElementById('fvdsd_suggestion_dialog');
		//pp.acceptDialog();
		window.close();
		
		return true;
	};

	this.cancel = function(event)	{

		this.registry.setBoolPref('ads_suggestions', true);
	
		//var pp = document.getElementById('fvdsd_suggestion_dialog');
		//pp.acceptDialog();
		window.close();
		
		return true;
	};

	this.xul_ns_resolver = function(prefix)
	{
		var ns = {
				'xul' : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
				'html' : 'http://www.w3.org/1999/xhtml'
		};
		return ns[prefix] || null;
	};

	window.addEventListener('load', function () {self.init.call(self)}, false);
};



var fvdsg = new FVD_Suggestion();