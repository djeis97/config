var EXPORTED_SYMBOLS = ["fvd_single_AD"]; 

Components.utils.import("resource://fvd.single.modules/misc.js");
Components.utils.import("resource://fvd.single.modules/settings.js");

fvd_single_AD = new function(){
	
	var AD_FILES_DIR = "chrome://fvd.single/content/data";
	
	var self = this;
	
	this.fileName = function( num ){
		
		if( num ){
			num = "_" + num;
		}
		else{
			num = "";
		}
		
		var fileName = "ad_" + fvd_single_Misc.getOS() + num + ".txt";
		return fileName;
	};
	
	this.fileURL = function( num ){		
		var url = AD_FILES_DIR + "/" + this.fileName(num);		
		return url;
	};
	
	this.incrementRotateCounter = function( num ){
		
		fvd_single_Misc.readUrl( self.fileURL( num ), function( contents ){
			
			if( !contents ){
				callback( null );
				return;
			}
			
			var index = -1;
			
			try{
				index = fvd_single_Settings.getIntVal( "ad_file_index." + self.fileName( num ) );				
			}
			catch( ex ){
				
			}
			
			index++;
			
			if( index < 0 ){
				index = 0;
			}
				
			var lines = contents.split( "\n" );
			
			if( lines.length < index + 1 ){
				index = 0;
			}
			
			fvd_single_Settings.setIntVal( "ad_file_index." + self.fileName( num ), index );			
					
		} );
		
	};
	
	this.getRotateItem = function( params, callback ){
		
		params = params || {};
		
		fvd_single_Misc.readUrl( self.fileURL( params.num ), function( contents ){
			
			if( !contents ){
				callback( null );
				return;
			}
			
			var index = -1;
			
			try{
				index = fvd_single_Settings.getIntVal( "ad_file_index." + self.fileName( params.num ) );				
			}
			catch( ex ){
				
			}
			
			index++;
			
			if( index < 0 ){
				index = 0;
			}
				
			var lines = contents.split( "\n" );
			
			if( lines.length < index + 1 ){
				index = 0;
			}
			
			var data = lines[index].trim().split( "|" );
			
			if( data.length < 2 ){
				callback( null );
				return;
			}
			
			callback( {
				url: data[0],
				title: data[1]
			} );
									
		} );
						
	};
	
};
	