const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID('{4DEB1A94-8EC5-11E0-A356-F8E84724019B}');
const CLASS_NAME = 'FVD single youtube parser';
const CONTRACT_ID = '@flashvideodownloader.org/single_youtube_parser;1';

//const SETTINGS_KEY_BRANCH = 'fvd_single.';
const SETTINGS_KEY_BRANCH = 'extensions.fvd_single.';
const STORAGE_FOLDER = 'FVD Single';

function FVD_Single_Youtube_Parser(){
	
	QueryInterface: function(aIID)
	{
		if (!aIID.equals(Components.interfaces.IFVDSingleYoutubeParser) && !aIID.equals(Components.interfaces.nsISupports)) throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	}
	
}

// class factory
var FVD_Single_Youtube_Parser_Factory = 
{
	createInstance: function (aOuter, aIID)
	{
		if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
		return (new FVD_Single_Youtube_Parser().QueryInterface(aIID));
	}
};

// Moduel definition
var FVD_Single_Youtube_Parser =
{
	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
	},

	getClassObject: function(aCompMgr, aCID, aIID)
	{
		if (!aIID.equals(Components.interfaces.nsIFactory)) throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		if (aCID.equals(CLASS_ID)) return FVD_Single_Youtube_Parser_Factory;

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr)
	{
		return true;
	}
};


// Module initialization
function NSGetModule(aCompMgr, aFileSpec)
{
	return FVD_Single_Detector_Module;
};


function NSGetFactory()
{
	return FVD_Single_Detector_Factory; 
};
