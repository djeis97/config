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

function FVD_Install()
{
	const EXTENSION_GUID = 'artur.dubovoy@gmail.com';
	const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';

	var self = this;
	
	this.step = 0;
	
	this.instant_apply = false;
	this.registry = null;
	this.folder = null;

	this.install_window = null;
	
	this.change_formats = false;
	
	this.init = function()	{
	
		window.sizeToContent();
	
		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('browser.preferences.');
		try
		{
			this.instant_apply = this.registry.getBoolPref('instantApply');
		} catch (e) {}

		this.registry = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(SETTINGS_KEY_BRANCH);
		
		if ('arguments' in window)	{
			var args = window.arguments[0].wrappedJSObject;
			this.step = args.step;	
		}
		
		var xai = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo);
		var vc = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator);
		if (vc.compare(xai.platformVersion, '1.9.3') >= 0)	{
			// works via addon manager
			AddonManager.getAddonByID(EXTENSION_GUID, function(addon)
			{
				document.getElementById('fvdsd_version_value').setAttribute('value', addon.version);
			});
		} else	{
			try	{
				var ver = Components.classes['@mozilla.org/extensions/manager;1'].getService(Components.interfaces.nsIExtensionManager).getItemForID(EXTENSION_GUID).version;
				document.getElementById('fvdsd_version_value').setAttribute('value', ver);

			} catch (e) {}
		}

		var fb = document.getElementById('fvdsd_folder_browse');
		var dm_pref = document.getElementById('fvdsd_general_download_mode');
		if (fb && dm_pref) fb.disabled = (!dm_pref.value);

		try	{
			var str = this.registry.getComplexValue('download.folder', Components.interfaces.nsISupportsString);
			var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(str.data);
			if (file.exists() && file.isDirectory())	{
				this.folder = file;
				this.folder_setup();
			}

		} catch (e) {}

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
		var main_wnd = wm.getMostRecentWindow('navigator:browser');
		
		try{
			var be = document.getElementById('fvdsd_main_button_exists');
			if (be) be.checked = true;
			
			var mp = document.getElementById('fvdsd_general_hotkey_mdf');
			if (mp) this.setup_allowed_buttons(mp.value);
	
			var pp = document.getElementById('fvdsd_install_dialog');
			if (pp) 	{
				var elem1 = document.getElementById("label_download_folder"); 
				if (elem1) elem1.setAttribute( "path", 'general' );
				
				var elem2 = document.getElementById("label_file_types"); 
				if (elem2) elem2.setAttribute( "path", 'general' );
				
				var elem3 = document.getElementById("label_file_types_yt"); 
				if (elem3) elem3.setAttribute( "path", 'general' );
			
				this.show_panel();
			}
		}
		catch( ex ){

		}
		
		var abe = document.getElementById('next_first_panel');
		if (abe) { 
			setTimeout(function () { abe.setAttribute( "class", 'dark-green' );	}, 200);			
			setTimeout(function () { abe.setAttribute( "class", 'green' );	}, 400);			
			setTimeout(function () { abe.setAttribute( "class", 'dark-green' );	}, 600);			
			setTimeout(function () { abe.setAttribute( "class", 'green' );	}, 800);			
			setTimeout(function () { abe.setAttribute( "class", 'dark-green' );	}, 1000);			
			setTimeout(function () { abe.setAttribute( "class", 'green' );	}, 1200);			
			setTimeout(function () { abe.setAttribute( "class", 'dark-green' );	}, 1400);			
			setTimeout(function () { abe.setAttribute( "class", 'green' );	}, 1600);			
			setTimeout(function () { abe.setAttribute( "class", 'dark-green' );	}, 1800);			
			setTimeout(function () { abe.setAttribute( "class", 'green' );	}, 2000);			
		}	
		
	};

	this.setup_allowed_buttons = function(modifier)	{
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
	
	this.display_swf_display_alert = function( event ){
		var pref = event.originalTarget;
		if( pref.value ){
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.download.properties');			
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        			.getService(Components.interfaces.nsIPromptService);

			prompts.alert(null, bundle.GetStringFromName("fvd.single.swf_display.alert.title"), bundle.GetStringFromName("fvd.single.swf_display.alert.text"));
		}
	}
	
	this.next = function(event)	{

		if (this.step<2) {
			this.step++; 
			this.show_panel();
		}
		else {
			this.ok(event);
		}	
	}

	this.back = function(event)	{
		if (this.step>0) this.step--; 
		this.show_panel();
	}
	
	this.show_panel = function()	{
	
		if( this.step == 1 )		this.show_panel_1();
		else if( this.step == 2 )  	this.show_panel_2();
		else if( this.step == 3 )  	this.show_panel_3();
		else 						this.show_panel_0();	
	}
	
	
	this.show_panel_0 = function()	{
		var pp = document.getElementById('fvdsd_install_dialog');
		pp.showPane(document.getElementById('fvdsd_general'));
	}
	this.show_panel_1 = function()	{
		var pp = document.getElementById('fvdsd_install_dialog');
		pp.showPane(document.getElementById('fvdsd_showfiles'));
	}
	this.show_panel_2 = function()	{
		var pp = document.getElementById('fvdsd_install_dialog');
		pp.showPane(document.getElementById('fvdsd_showfiles_yt'));
	}
	this.show_panel_3 = function()	{
		var pp = document.getElementById('fvdsd_install_dialog');
		pp.showPane(document.getElementById('fvdsd_updated'));
	}

	this.dumpp = function(x) {
		dump( '\n***********************************************************\n' );
		for ( var key in x ) 		dump(key + '  =  ' + x[key]+'\n');
		dump( '\n***********************************************************\n' );
	};
	
	// --------------------------------------------------------------------
	this.ok = function(event)	{

		this.registry.setBoolPref('install_setting', false);
	
		if (this.folder != null) {
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
		
		/*var abe = document.getElementById('fvdsd_status_button_exists');
		if (abe)	{
			var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
			observer.notifyObservers(null, 'FVD.Single-StatusButton-Change', (abe.checked == true));
		}*/

		var pp = document.getElementById('fvdsd_install_dialog');
		pp.acceptDialog();
		window.close();

		observer.notifyObservers(null, 'FVD.Single-Suggestion-Run', true);
		
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



var fvds = new FVD_Install();