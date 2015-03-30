var EXPORTED_SYMBOLS = [];

// start settings
var WELCOME_URL = "https://nimbus.everhelper.me/app-update/firefoxdownloader.php?v={VERSION}",
    WELCOME_IMAGE_SRC = "chrome://fvd.single/skin/fvd.single.new.png",
    EXTENSION_ID = "artur.dubovoy@gmail.com",
    BUTTON_ID = "fvd_single_button";
// end settings

Components.utils.import("resource://gre/modules/Timer.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");

var nsPreferences = {
  get mPrefService() {
    return Components.classes["@mozilla.org/preferences-service;1"]
      .getService(Components.interfaces.nsIPrefBranch);
  },

  setBoolPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setBoolPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  getBoolPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getBoolPref(aPrefName);
    } catch (e) {
      return aDefVal != undefined ? aDefVal : null;
    }
    return null; // quiet warnings
  },

  setCharPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setCharPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  getCharPref: function (aPrefName) {
    try {
      return this.mPrefService.getCharPref(aPrefName);
    } catch (e) {}
  },

  setIntPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setIntPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  getIntPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getIntPref(aPrefName);
    } catch (e) {
      return aDefVal != undefined ? aDefVal : null;
    }
    return null; // quiet warnings
  }

};


var 
  CHECK_FREQUENCY = 1000,
  PREF_PREFIX = "extensions.fvd_welcome_mod." + EXTENSION_ID + ".",
  PREF_LAST_VERSION_KEY = PREF_PREFIX + "last_ver",
  PREF_NEED_WELCOME_KEY = PREF_PREFIX + "need_welcome",
  wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    
var Welcome = new function(){
  
  function getCurrentVersion(cb){
    AddonManager.getAddonByID(EXTENSION_ID, function(a){
      if(!a){
        return cb(null);
      }
      
      cb(a.version);
    });
  }
  
  function startTimer(){
    setTimeout(function(){
      checkVersionChanges();
      
      startTimer();
    }, CHECK_FREQUENCY);
  }
  
  function getWelcomeUrl(){
    var version = nsPreferences.getCharPref(PREF_LAST_VERSION_KEY);
    
    return WELCOME_URL.replace("{VERSION}", version);
  }
  
  function clickListener(e){
    var url = getWelcomeUrl();

    var domWindow = e.view;
    
    var gBrowser = domWindow.gBrowser;
    var tab = gBrowser.addTab(url);
    gBrowser.selectedTab = tab;
    
    restore();
    
    e.stopPropagation();
    e.preventDefault();
  }
  
  function restore(){
    nsPreferences.setBoolPref(PREF_NEED_WELCOME_KEY, false);      
    
    // get all main windows
    var windows = wm.getEnumerator("navigator:browser");
    
    while (windows.hasMoreElements()) {
      var domWindow = windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
      var document = domWindow.document;
      
      var btn = document.getElementById(BUTTON_ID);
      
      if(btn && btn.hasAttribute("fvd-welcome-active")){
        btn.removeAttribute("fvd-welcome-active");        
        btn.removeAttribute("style");        
        btn.removeEventListener("click", clickListener, true);
      }
    }     
  }
  
  function setupButton(){
    // get all main windows
    var windows = wm.getEnumerator("navigator:browser");

    while (windows.hasMoreElements()) {
      var domWindow = windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
      var document = domWindow.document;
      
      var btn = document.getElementById(BUTTON_ID);
      
      if(btn && !btn.hasAttribute("fvd-welcome-active")){
        btn.setAttribute("fvd-welcome-active", 1);        
        btn.setAttribute("style", "list-style-image: url('"+WELCOME_IMAGE_SRC+"');-moz-image-region: rect(0px 24px 24px 0px);");        
        btn.addEventListener("click", clickListener, true);
      }
    }     
  }
  
  function checkVersionChanges(){    
    getCurrentVersion(function(currentVer){
      if(!nsPreferences.getCharPref(PREF_LAST_VERSION_KEY)){
        AddonManager.getAddonByID(EXTENSION_ID, function(a){
          nsPreferences.setCharPref(PREF_LAST_VERSION_KEY, currentVer);          
          if(a && a.installDate && a.updateDate){
            if(a.installDate.getTime() != a.updateDate.getTime()){
              nsPreferences.setBoolPref(PREF_NEED_WELCOME_KEY, true);   
            }
          }
        });        
        return;
      }
      
      if(currentVer != nsPreferences.getCharPref(PREF_LAST_VERSION_KEY)){
        nsPreferences.setCharPref(PREF_LAST_VERSION_KEY, currentVer);
        nsPreferences.setBoolPref(PREF_NEED_WELCOME_KEY, true);        
      }
      
      if(nsPreferences.getBoolPref(PREF_NEED_WELCOME_KEY)){
        setupButton();
      }
    });
  }
  
  startTimer();
  
};
