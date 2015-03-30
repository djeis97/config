try
{
	// try import addon manager for extension version detection in firefox4
	Components.utils.import('resource://gre/modules/AddonManager.jsm');

} catch (e) {}

Components.utils.import("resource://fvd.single.modules/settings.js");
Components.utils.import("resource://fvd.single.modules/config.js");

function Log(outputString) 
{
	Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(outputString);
}

function FVD_Settings()
{
	const EXTENSION_GUID = 'artur.dubovoy@gmail.com';
//	const SETTINGS_KEY_BRANCH = 'fvd_single.';
	const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';

	var self = this;
	this.instant_apply = false;
	this.registry = null;
	this.folder = null;
	this.ffmpeg_file = null;

	this.change_formats = false;
	
	var prefsGlobal = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	this.dumpp = function(x) {
		dump( '\n***********************************************************\n' );
		var i=0;
		for ( var key in x ) 	{	dump(key + '  =  ' + x[key]+'\n'); i++; if (i>50) return; }
		dump( '\n***********************************************************\n' );
	};
	
	this.init = function()
	{
		var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;  
	
		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('browser.preferences.');
		try	{
			this.instant_apply = this.registry.getBoolPref('instantApply');
		} catch (e) {}

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(SETTINGS_KEY_BRANCH);
		
		var x_path = 0;	
		if ('arguments' in window)
		{
			var args = window.arguments[0].wrappedJSObject;
			if( args.path == 'default_folder' )  x_path = 1;	
			else if( args.path == 'file_types' )  x_path = 2;	
			else if( args.path == 'file_types_yt' )  x_path = 3;	
			else if( args.path == 'ffmpeg_file' )  x_path = 4;	
		}
		
		
		var xai = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo);
		var vc = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator);
		if (vc.compare(xai.platformVersion, '1.9.3') >= 0)
		{
			// works via addon manager
			AddonManager.getAddonByID(EXTENSION_GUID, function(addon)
			{
				document.getElementById('fvdsd_version_value').setAttribute('value', addon.version);
			});
		} else
		{
			try
			{
				var ver = Components.classes['@mozilla.org/extensions/manager;1'].getService(Components.interfaces.nsIExtensionManager).getItemForID(EXTENSION_GUID).version;
				document.getElementById('fvdsd_version_value').setAttribute('value', ver);

			} catch (e) {}
		}

		var fb = document.getElementById('fvdsd_folder_browse');
		var dm_pref = document.getElementById('fvdsd_general_download_mode');
		if (fb && dm_pref) fb.disabled = (!dm_pref.value);

		try
		{
			var str = this.registry.getComplexValue('download.folder', Components.interfaces.nsISupportsString);
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(str.data);
			if (file.exists() && file.isDirectory())
			{
				this.folder = file;
				this.folder_setup();
			}

		} catch (e) {}

		try
		{
			var str = this.registry.getComplexValue('download.ffmpeg_file', Components.interfaces.nsISupportsString);
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(str.data);
			if (file.exists() && !file.isDirectory())
			{
				this.ffmpeg_file = file;
				this.ffmpeg_file_setup();
			}

		} catch (e) {}

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var main_wnd = wm.getMostRecentWindow('navigator:browser');
		
		try{
			var be = document.getElementById('fvdsd_main_button_exists');
			if (be) be.checked = main_wnd.fvd_single.is_main_button_exists();
	
			//var abe = document.getElementById('fvdsd_status_button_exists');
			//if (abe) abe.checked = main_wnd.fvd_single.is_status_button_exists();
			
			var mp = document.getElementById('fvdsd_general_hotkey_mdf');
			if (mp) this.setup_allowed_buttons(mp.value);
	
			var pp = document.getElementById('fvdsd_settings_dialog');
			var general_tabbox = document.getElementById('fvdsd_general_tabbox');
			if (pp)	{
				var elem1 = document.getElementById("label_download_folder"); 
				if (elem1) elem1.setAttribute( "path", 'general' );
				
				var elem2 = document.getElementById("label_file_types"); 
				if (elem2) elem2.setAttribute( "path", 'general' );
				
				var elem3 = document.getElementById("label_file_types_yt"); 
				if (elem3) elem3.setAttribute( "path", 'general' );
			
				if( x_path == 1 )	{
					if (elem1) elem1.setAttribute( "path", 'folder' );
					pp.showPane(document.getElementById('fvdsd_general'));
	
					general_tabbox.selectedIndex = 1;	
				}	
				else if( x_path == 2 )  
				{
					if (elem2) elem2.setAttribute( "path", 'formats' );
					pp.showPane(document.getElementById('fvdsd_showfiles'));
				}	
				else if( x_path == 3 )  
				{
					if (elem3) elem3.setAttribute( "path", 'formats' );
					pp.showPane(document.getElementById('fvdsd_showfiles_yt'));
				}	
				else if( x_path == 4 )  {
					if (elem3) elem3.setAttribute( "path", 'formats' );
					var panel_yt = document.getElementById("fvdsd_showfiles_yt");
					pp.showPane(panel_yt);
					var youtube_tabbox = document.getElementById('fvdsd_youtube_tabbox');
					youtube_tabbox.selectedIndex = 1;	
				}	
				else pp.showPane(document.getElementById('fvdsd_general'));	
			}
		}
		catch( ex ){

		}
		
		if( osString.toLowerCase() != "linux" )	{
			var panel = document.getElementById("fvdsd_showfiles_yt"); 
			var tabs = panel.getElementsByTagName("tab");
			tabs[1].style.display = "none";
		}
		else {
		
			var elem = document.getElementById("fvdsd_ffmpeg_manual"); 
			if( prefsGlobal.getCharPref("general.useragent.locale").indexOf("ru") != -1 ){
				elem.setAttribute( "href", 'http://flashvideodownloader.org/ffmpeg/indexru.html' );
			}
			else {
				elem.setAttribute( "href", 'http://flashvideodownloader.org/ffmpeg/indexen.html' );
			}
		}
	};

	this.setup_allowed_buttons = function(modifier)
	{
		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var main_wnd = wm.getMostRecentWindow('navigator:browser');

		var used_keys = [];
		var krs = main_wnd.document.evaluate('//xul:key[@key]', main_wnd.document.documentElement, this.xul_ns_resolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var key = null;
		while ((key = krs.iterateNext()) != null)
		{
			var bk = key.getAttribute('key').toUpperCase();
			if (!(key.hasAttribute('id') && (key.getAttribute('id') == 'fvd_single_hotkey')))
			{
				if ((bk != '') && (used_keys.indexOf(bk) == -1))
				{
					var md = key.getAttribute('modifiers');
					if (((md.indexOf('accel') != -1) || (md.indexOf('control') != -1)) && (md.indexOf(modifier) != -1)) used_keys.push(bk);
				}
			}
		}

		var key_chooser = document.getElementById('fvdsd_general_hotkey_popup');
		var kir = document.evaluate('./xul:menuitem', key_chooser, this.xul_ns_resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (kir.snapshotLength)
		{
			for (var i = 0, j = kir.snapshotLength; i < j; i ++)
			{
				var ki = kir.snapshotItem(i);
				if (used_keys.indexOf(ki.getAttribute('value')) != -1)
				{
					ki.setAttribute('hidden', 'true');
				} else
				{
					if (ki.hasAttribute('hidden')) ki.setAttribute('hidden', 'false');
				}
			}
		}
	};

	this.ffmpeg_file_setup = function()
	{
		var ft = document.getElementById('fvdsd_ffmpeg_file_text');
		if (ft && this.ffmpeg_file)
		{
			ft.value = this.ffmpeg_file.leafName;

			var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			var fh = ios.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
			var icon = document.getElementById('fvdsd_ffmpeg_file_icon');
			icon.setAttribute('src', 'moz-icon://' + fh.getURLSpecFromFile(this.ffmpeg_file));
		}
	};

	
	this.folder_setup = function()
	{
		var ft = document.getElementById('fvdsd_folder_text');
		if (ft && this.folder)
		{
			ft.value = this.folder.leafName;

			var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			var fh = ios.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
			var icon = document.getElementById('fvdsd_folder_icon');
			icon.setAttribute('src', 'moz-icon://' + fh.getURLSpecFromFile(this.folder));
		}
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
	
/*	this.status_button_setup = function(){
		
		if (this.instant_apply){
			var abe = document.getElementById('fvdsd_status_button_exists');
			if (abe)
			{
				var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
				observer.notifyObservers(null, 'FVD.Single-StatusButton-Change', (abe.checked == true));
			}
		}
		

	}*/
	
	this.display_swf_display_alert = function( event ){
		var pref = event.originalTarget;
		if( pref.value ){
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');			
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        			.getService(Components.interfaces.nsIPromptService);

			prompts.alert(null, bundle.GetStringFromName("fvd.single.swf_display.alert.title"), bundle.GetStringFromName("fvd.single.swf_display.alert.text"));
		}
	}

	this.cancel = function(event) {
		window.close();
	}
	
	this.ok = function(event)	{
		if (this.folder != null)	{
			try	{
				var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
				str.data = this.folder.path;
				this.registry.setComplexValue('download.folder', Components.interfaces.nsISupportsString, str);
		
			} catch (e){}
		}

		var be = document.getElementById('fvdsd_main_button_exists');
		if (be)	{
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			observer.notifyObservers(null, 'FVD.Single-MainButton-Change', (be.checked == true));
		}
		
/*		var abe = document.getElementById('fvdsd_status_button_exists');
		if (abe)		{
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			observer.notifyObservers(null, 'FVD.Single-StatusButton-Change', (abe.checked == true));
		}*/

		
		return true;
	};

	this.folder_mode_change = function(event)
	{
		var pref = event.originalTarget;
		var fb = document.getElementById('fvdsd_folder_browse');
		if (fb && pref) fb.disabled = (!pref.value);
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

			if (this.instant_apply)
			{
				try
				{
					var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
					str.data = this.folder.path;
					this.registry.setComplexValue('download.folder', Components.interfaces.nsISupportsString, str);
		
				} catch (e){}
			}
		}
	};

	this.ffmpeg_file_browse = function(event)
	{
		var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.settings.properties');
		var title = bundle.GetStringFromName('fvd.single.select_ffmpeg_file.title');

		var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
		fp.init(window, title, Components.interfaces.nsIFilePicker.modeOpen);

		if (fp.show() == Components.interfaces.nsIFilePicker.returnOK)	{
			this.ffmpeg_file = fp.file;
			this.ffmpeg_file_setup();
			
			var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
			str.data = this.ffmpeg_file.path;
			this.registry.setComplexValue('download.ffmpeg_file', Components.interfaces.nsISupportsString, str);
			
		}
	};

	this.modifier_select = function(event)
	{
		var mp = document.getElementById('fvdsd_general_hotkey_mdf');
		if (mp) this.setup_allowed_buttons(mp.value);
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



var fvds = new FVD_Settings();