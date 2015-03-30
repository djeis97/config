document.addEventListener( "FVDSingleApiEvent", function(event){
	var data = event.detail;
	
	switch( data.a ){
		case "getStreamsForUrl":
			
			try{
				var location = gBrowser.webNavigation.currentURI;
				var doc = gBrowser.selectedBrowser.contentDocument;
				var sniffedMedia = fvd_single.prepareSniffedMedia( doc, fvd_single.sniffer.get_files_all() );	
				var media = {};
				media = fvd_single.extendMediaByUrl( sniffedMedia, media, location.spec );
				
				var mediaInfo = fvd_single.downloadInstance.downloadInfoInst();
				
				if( media[location.spec] )
				{
					media = media[location.spec];
					for( var k in media )
					{
						mediaInfo.addMediaFile( media[k] );
					}
							
					data.callback( JSON.stringify(mediaInfo.getMedia()) );
				}
				else
				{
					data.callback( null );
				}	
			}
			catch( ex ){
				dump( "Cannot process ext api request " + ex + "\r\n" );
			}
			

			
		break;	
		
		case "getLikeStatus": 
			try{
				var flag = fvd_single.check_like_status( );
				data.callback( flag );
			}
			catch( ex ){
				dump( "Cannot process ext api request " + ex + "\r\n" );
			}
		break;		
		
		
		
		case "startDownload": 
			try{
				fvd_single.downloadInstance.downloadByWindow( data.media.url,
					data.media.url.download_name ? data.media.download_name : data.media.file_title,
					"." + data.media.ext);				
			}
			catch( ex ){
				
			}
		break;		
		
		case "startDownloadAll": 
			try
			{
				fvd_single.download_default( );
			}
			catch( ex ){			}
		break;		

		case "setDefautlFolder": 
			try
			{
				fvd_single.set_default_folder();
			}
			catch( ex ){			}
		break;		
		
		case "GiveUsRating": 
			try
			{
				fvd_single.give_us_rating();
			}
			catch( ex ){			}
		break;		
		
		case "Goto_Site": 
			try
			{
				fvd_single.navigate_url( data.u );
			}
			catch( ex ){			}
		break;		
		
		case "setFileTypes": 
			try
			{
				fvd_single.set_file_types();
			}
			catch( ex ){			}
		break;		
}
	
}, false, true );