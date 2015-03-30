// tabs-on-statusline.js -- put tabstoolbar on pentadactyl statusline
// @Author:      eric.zou (frederick.zou@gmail.com)
// @License:     GPL (see http://www.gnu.org/licenses/gpl.txt)
// @Created:     Sun 23 Oct 2011 01:04:54 PM CST
// @Last Change: Sat 12 Jan 2013 06:15:39 PM CST
// @Revision:    95
// @Description:
// @Usage:
// @TODO:
// @CHANGES:
// @Readme:     recommend settings: set showtabline=always
"use strict";

let TOS = {
	init: function() {
		TOS._tabsToolbar = document.getElementById("TabsToolbar");
		TOS._tabsToolbar_parent = TOS._tabsToolbar.parentNode;
		TOS._tabsToolbar_prev = TOS._tabsToolbar.previousSibling;
		TOS._tabsToolbar_next = TOS._tabsToolbar.nextSibling;
		TOS._widget = document.getElementById('dactyl-statusline-field-tos');
		if (!TOS._widget) {
            TOS._widget = DOM.fromJSON(["toolbox", {"xmlns": XUL, "id":
                        "dactyl-statusline-field-tos", "align": "stretch",
                        "dactyl:highlight": "TOS"
                }], document);
		}
		statusline.widgets.url.parentNode.insertBefore(TOS._widget, statusline.widgets.url.nextSibling);
		commandline.widgets.addElement({
				name: "tos",
				getGroup: function () this.statusbar,
				getValue: function () statusline.visible && options["tabs-on-statusline"] && (options["showtabline"] !== "never"),
				noValue: true
		});
	},
	setup: function() {
		prefs.safeSet("browser.tabs.drawInTitlebar", false);
		TOS._widget.appendChild(TOS._tabsToolbar);
	},
	restore: function() {
		if (TOS._tabsToolbar_prev)
			return TOS._tabsToolbar_parent.insertBefore(TOS._tabsToolbar, TOS._tabsToolbar_prev.nextSibling);
		if (TOS._tabsToolbar_next)
			return TOS._tabsToolbar_parent.insertBefore(TOS._tabsToolbar, TOS._tabsToolbar_next);
		return TOS._tabsToolbar_parent.appendChild(TOS._tabsToolbar);
	}
};
TOS.init();

highlight.loadCSS(
    "[dactyl|highlight~=\"StatusCmdLine\"] {-moz-box-align:center;}\n" +
    "[dactyl|highlight~=\"StatusCmdLine\"] #TabsToolbar {background-color:transparent !important;background-image:none !important;-moz-appearance:none !important;}\n" +
    "[dactyl|highlight~=\"StatusLineBroken\"] [dactyl|highlight*=\"Status\"] {background-color:transparent;color:#313633;}\n" +
    "[dactyl|highlight~=\"StatusLineExtended\"] [dactyl|highlight*=\"Status\"] {background-color:transparent;color:#313633;}\n" +
    "[dactyl|highlight~=\"StatusLineSecure\"] [dactyl|highlight*=\"Status\"] {background-color:transparent;color:#313633;}"
, true);

// Options
group.options.add(["tabs-on-statusline", "tos"],
    "Put tabstoolbar on pentadactyl statusline! ",
    "boolean",
    true,
    {
        setter: function (value) {
			if (this.hasChanged && (options["tabs-on-statusline"] !== value)) {
				if (value) {
					TOS.setup();
				} else {
					TOS.restore();
				}
				tabs.updateTabCount()
			}
			return value;
        }
    }
);

if (options["tabs-on-statusline"]) {
	TOS.setup();
	tabs.updateTabCount()
}

function onUnload() { // :rehash, exit firefox/current window, disable pentadactyl extension
	TOS.restore();
}
