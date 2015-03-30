function FVD_SINGLE_LICENSE()
{
	var self = this;

	this.init = function()
	{
		document.getElementsByTagName("dialog")[0].getButton("accept").className += " accept";
		
		
		if ('arguments' in window)
		{
			var params = window.arguments[0]
			if ('title' in params)
			{
				try
				{
					var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.license.properties');
					var title = bundle.GetStringFromName(params.title);

					var dialog = document.getElementById('fvd_single_license_dialog');
					if (dialog) dialog.setAttribute('title', title);

				} catch (e) {}
			}

			if ((!('ddw' in params)) || (params.ddw != true))
			{
				var ddw = document.getElementById('fvd_single_disable_warnings_hbox');
				if (ddw) ddw.style.display = 'none';
			} else
			{
				var disable_warnings = document.getElementById('fvd_single_disable_warnings_check');
				disable_warnings.disabled = true;
			}

			if ('url' in params)
			{
				try
				{
					var ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
					ajax.open('GET', params.url, true);
					ajax.overrideMimeType('text/plain');
					ajax.onload = function(){
									if (ajax.responseText != null)
									{
										var lic = document.getElementById('fvd_single_license_txt');
										if (lic)
										{
											setTimeout(function(){	lic.value = ajax.responseText;	}, 100);
										} 
									}
								}
					
					ajax.send(null);

				} catch (e) {}
			}
		}
		/*
		var accept_btn = document.documentElement.getButton('accept');
		accept_btn.disabled = true;
		*/
	};

	this.accept = function()
	{
		var accept_check = document.getElementById('fvd_single_accept_check');
		if (accept_check.checked)
		{
			try{
				window.arguments[0].accept = true;
				window.arguments[0].ddw = document.getElementById('fvd_single_disable_warnings_check').checked;				
			}
			catch( ex ){
				
			}
			return true;
		}
		return false;
	};

	this.cancel = function()
	{
		try{
			window.arguments[0].accept = false;
			window.arguments[0].ddw = false;				
		}
		catch( ex ){
			
		}
	};

	this.accept_check_toggle = function(event)
	{
		var check = event.originalTarget;
		var accept_btn = document.documentElement.getButton('accept');
		if (accept_btn) accept_btn.disabled = !check.checked;
		
		var disable_warnings = document.getElementById('fvd_single_disable_warnings_check');
		disable_warnings.disabled = !check.checked;
		if (disable_warnings.disabled) disable_warnings.checked = false;
	};

	window.addEventListener('load', function () {self.init.call(self)}, false);
}

var fvd_sl = new FVD_SINGLE_LICENSE();