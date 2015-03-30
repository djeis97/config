function FVD_SHORT_URLS()
{
	var self = this;
	var ajax = null;

	this.init = function()
	{
		if (('arguments' in window) && (window.arguments.length))
		{
			var url_tx = document.getElementById('fvd_single_url');
			if (url_tx != null) url_tx.value = window.arguments[0];
		}

		window.addEventListener('keydown', this.escape_test, false);
		window.addEventListener('unload', this.unload_caller, false);

		window.removeEventListener('load', this.load_caller, false);

		var url_tx = document.getElementById('fvd_single_url');
		if (url_tx != null) url_tx.addEventListener('input', this.url_changes_test, false);
		this.url_changes_test(null);
	};

	this.finish = function()
	{
	        if (this.ajax != null)
		{
			try
			{
				if (this.ajax.readyState != 4)
				{
					this.ajax.onreadystatechange = null;
					this.ajax.abort();
				}
			} catch (e) {}
			this.ajax = null;
		}

		window.removeEventListener('keydown', this.escape_test, false);
		window.removeEventListener('unload', this.unload_caller, false);

		var url_tx = document.getElementById('fvd_single_url');
		if (url_tx != null) url_tx.removeEventListener('input', this.url_changes_test, false);
	};

	this.escape_test = function(event)
	{
		if (event.keyCode == event.DOM_VK_ESCAPE) window.close();
	};

	this.url_changes_test = function(event)
	{
		var url_box = (event != null) ? event.originalTarget : document.getElementById('fvd_single_url'); 
		var button = document.getElementById('fvd_single_generate');
		if (url_box.value.match(/^\s*?(?:https?|ftps?|ed2k):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/i) != null)
		{
			if (button != null) button.disabled = false;
		} else
		{
			if (button != null) button.disabled = true;
		}
	};

	this.disable_form = function(disable)
	{
		var url_tx = document.getElementById('fvd_single_url');
		if (url_tx != null) url_tx.disabled = disable;

		var alias_tx = document.getElementById('fvd_single_alias');
		if (alias_tx != null) alias_tx.disabled = disable;

		var button = document.getElementById('fvd_single_generate');
		if (button != null) button.disabled = disable;
	};

	this.generate = function(event)
	{
		var url = '';
		var alias = '';

		var url_tx = document.getElementById('fvd_single_url');
		if (url_tx != null) url = url_tx.value;

		var alias_tx = document.getElementById('fvd_single_alias');
		if (alias_tx != null) alias = alias_tx.value;


		url = url.replace(/^\s+/, '').replace(/\s+$/, '');
		alias = alias.replace(/^\s+/, '').replace(/\s+$/, '');

		if (url)
		{
			this.disable_form(true);
			
			var deck = document.getElementById('fvd_single_generate_resdeck');
			if (deck != null) deck.selectedIndex = 1;

			this.ajax = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
			this.ajax.open('POST', 'http://x2t.com/dantist_api.php', true);
			this.ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			this.ajax.overrideMimeType('text/plain');
			this.ajax.onreadystatechange = function()
			{
				try
				{
					if (this.readyState == 4)
					{
						self.ajax = null;
						if (this.status == 200)
						{
							try
							{								
								var json = JSON.parse( this.responseText );								

								if (('status' in json) && (json['status'] == 'ok') && ('short_url' in json))
								{
									var su = document.getElementById('fvd_single_short_url');
									if (su != null) su.value = json['short_url'];
									if (deck != null) deck.selectedIndex = 0;
								} else
								{
									if (deck != null) deck.selectedIndex = 2;
								}

	                        			} catch (e)
							{
								if (deck != null) deck.selectedIndex = 2;
							}
						} else
						{
							if (deck != null) deck.selectedIndex = 1;
						}

						self.disable_form.call(self, false);
						self.url_changes_test.call(self, null);
					}
				} catch (e) {}
			};
			var data = 'url=' + encodeURIComponent(url);
			if (alias != '') data += '&alias=' + encodeURIComponent(alias);
			this.ajax.send(data);
		}
	};

	this.load_caller = function () {self.init.call(self)};
	this.unload_caller = function () {self.finish.call(self)};

	window.addEventListener('load', this.load_caller, false);
}

var fvd_sl = new FVD_SHORT_URLS();