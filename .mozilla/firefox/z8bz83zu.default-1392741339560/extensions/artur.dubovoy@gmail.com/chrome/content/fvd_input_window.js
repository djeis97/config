function FVD_SINGLE_INPUT_WINDOW()
{
	var self = this;
	this.mode = '';
	this.init = function()
	{
		if ('arguments' in window)
		{
			var params = window.arguments[0];
			if ('type' in params)
			{
				this.mode = params['type'];
				var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.input_window.properties');
				var title = label = button = '';

				switch (params['type'])
				{
					case 'share_url':
					{
						title = bundle.GetStringFromName('fvd.single.input_window.share.title');
						label = bundle.GetStringFromName('fvd.single.input_window.share.label');
						button = bundle.GetStringFromName('fvd.single.input_window.share.button');
						break;
					}

					case 'whois':
					{
						title = bundle.GetStringFromName('fvd.single.input_window.whois.title');
						label = bundle.GetStringFromName('fvd.single.input_window.whois.label');
						button = bundle.GetStringFromName('fvd.single.input_window.whois.button');
						break;
					}
				}

				var dialog = document.getElementById('fvd_single_input_window');
				if (dialog != null) dialog.setAttribute('title', title);

				var apply_button = document.documentElement.getButton('accept');
				if (apply_button != null) apply_button.setAttribute('label', button);

				var tx_label = document.getElementById('fvd_single_text_label');
				if (tx_label != null) tx_label.setAttribute('value', label);
			}

			if ('value' in params)
			{
				var textbox = document.getElementById('fvd_single_textbox');
				if (textbox != null) textbox.value = params['value'];
			}
		}

		window.addEventListener('unload', this.unload_caller, false);
		window.removeEventListener('load', this.load_caller, false);

		var tx = document.getElementById('fvd_single_textbox');
		if (tx != null) tx.addEventListener('input', this.input, false);
		this.input(null);
	};

	this.finish = function()
	{
		window.removeEventListener('unload', this.unload_caller, false);
		var tx = document.getElementById('fvd_single_textbox');
		if (tx != null) tx.removeEventListener('input', this.input, false);
	};

	this.input = function(event)
	{
		var text_box = (event != null) ? event.originalTarget : document.getElementById('fvd_single_textbox'); 
		var button = document.documentElement.getButton('accept');

		switch (self.mode)
		{
			case 'share_url':
			{
				if (text_box.value.match(/^\s*?(?:https?|ftps?|ed2k):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/i) != null)
				{
					if (button != null) button.disabled = false;
				} else
				{
					if (button != null) button.disabled = true;
				}
				break;
			}

			case 'whois':
			{
				if (text_box.value.match(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/) != null)
				{
					if (button != null) button.disabled = false;
				} else
				{
					if (button != null) button.disabled = true;
				}
				break;
			} 
		}
	};

	this.accept = function()
	{
		try{
			window.arguments[0].accept = true;
			window.arguments[0].value = document.getElementById('fvd_single_textbox').value;			
		}
		catch( ex ){
			
		}
		return true;
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

	this.load_caller = function () {self.init.call(self)};
	this.unload_caller = function () {self.finish.call(self)};

	window.addEventListener('load', this.load_caller, false);
}

var fvd_siw = new FVD_SINGLE_INPUT_WINDOW();