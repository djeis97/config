// Tab Sidebar
"use strict";


let TSB = {
	init: function () {
		TSB.tabbar = document.getElementById("TabsToolbar");
		TSB.browserWindow = document.getElementById("content-deck");
		TSB.vbox = document.getElementById("browser-panel");
		TSB.tabbar_old_sibling = TSB.tabbar.nextSibling;
		TSB.tabbar_old_parent = TSB.tabbar.parentNode;
		TSB.browserWindow_old_sibling = TSB.browserWindow.nextSibling;
		TSB.browserWindow_old_parent = TSB.browserWindow.parentNode;
		TSB.box = document.createElement("hbox");
	},
	start: function () {
		TSB.box.appendChild(TSB.tabbar);
		TSB.box.appendChild(TSB.browserWindow);
		TSB.vbox.insertBefore(TSB.box, TSB.vbox.firstChild);
	},
	end: function () {
		if (TSB.tabbar_old_sibling) {TSB.tabbar_old_sibling.parentNode.insertBefore(TSB.tabbar, TSB.tabbar_old_sibling);}
		else {TSB.tabbar_old_parent.appendChild(TSB.tabbar);};
		if (TSB.browserWindow_old_sibling) {TSB.browserWindow_old_sibling.parentNode.insertBefore(TSB.browserWindow, TSB.browserWindow_old_sibling);}
		else {TSB.browserWindow_old_parent.appendChild(TSB.browserWindow);};
		return true;
	}
};

TSB.init();

group.options.add(["tabs-on-sidebar", "tos"],
    "Put tabs on vertical sidebar!",
    "boolean",
    false,
    {
        setter: function (value) {
			if (this.hasChanged && (options["tabs-on-sidebar"] !== value)) {
				if (value) {
					TSB.start();
				} else {
					TSB.end();
				}
				tabs.updateTabCount()
			}
			return value;
        }
    }
);

if (options["tabs-on-sidebar"]) {
	TSB.start();
	tabs.updateTabCount()
}

function onUnload() {
	TSB.end();
	tabs.updateTabCount()
}
