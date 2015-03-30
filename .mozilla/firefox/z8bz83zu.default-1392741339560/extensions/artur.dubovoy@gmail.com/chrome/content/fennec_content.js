dump("Init fennec_content " +content.document.location.href + "\n");

const POPUP_ID = "fvd-single-fennec-popup";
const STREAMSLIST_ID = "fvd-single-fennec-streams-list";
const STREAM_LIST_URL = "chrome://fvd.single/content/fennec_streams_list.html";



var domLoaded = false;
var responseMediaCallback = null;
var urlSizeCallbacks = {};

addEventListener( "load", function(){
	dump("FVD Content: Loaded " + content.document.location.href + "\n");
	if( isStreamsPage() ){		
		var document = content.document;
		
		var url = atob(content.document.location.search.replace( "?url=", "" ));
		
		if( url ){
			url = decodeURIComponent(url);

			requestMedia( function( media, message ){
				
				var container = document.getElementById("list");
				while( container.firstChild ){
					container.removeChild( container.firstChild );
				}
				
				var template = document.getElementById("streamTemplate");
				
				media.forEach(function( item, index ){
					if(item.yt_type == "full_hd") {
					  // ignore full HD for mobile devices, coz for it need to have ffmpeg installed to merge audio + video
					  return;
					}
							
					var elem = template.cloneNode( true );
					elem.removeAttribute("id");
					
					elem.querySelector(".icon").className += " " + item.ext;
					
					var title = item.ext;
					if( item.mob_name ){
						title = item.mob_name; 
					}
					
					elem.querySelector(".title").textContent = title;
					
					if( !item.size ){
						getSizeByUrl( item.url, function( size ){
							elem.querySelector(".size").textContent = prepareFileSize( size );
						} );												
					}
					else{
						elem.querySelector(".size").textContent = prepareFileSize( item.size );
					}
					
					elem.querySelector(".download").addEventListener("click", function(){
						
						var button = elem.querySelector(".download");
						
						sendAsyncMessage("FVDSingle:Content:Download", {
							media: item
						});
						
					});
						
					container.appendChild(elem);

				});
				
			}, url );
		}
		
	}
	
}, true );

content.addEventListener( "load", function(){
	
	dump("!!!Load " + content.document.location.href + "\n");
	
	domLoaded = true;
	
}, true );

content.document.addEventListener( "DOMContentLoaded", function(){
	
	domLoaded = true;

}, true );



function isStreamsPage(){
	
	return content.document.location.href.replace(content.document.location.search, "") == STREAM_LIST_URL;
	
}

function waitForBody( callback ){
	
	var interval = content.setInterval( function(){
		
		if( content.document.body ){
			callback();
			content.clearInterval( interval );
		}		
		
	}, 300 );
	
}

function requestMedia( callback, url ){
	
	responseMediaCallback = function( message ){
		
		callback( message.json.media, message.json );
		
		responseMediaCallback = null;
		
	};
	
	url = url || content.document.location.href;
	
	sendAsyncMessage("FVDSingle:Content:requestMedia", {
		url: url
	});
	
}

function getSizeByUrl( url, callback ){
	
	urlSizeCallbacks[ url ] = function( size ){
		callback( size );
	};
	
	sendAsyncMessage("FVDSingle:Content:getMediaSize", {
		url: url
	});	
			
	

}

function prepareFileSize( size ){
	
	return Math.round(size / 1024 / 1024 * 100) / 100 + "MB"; 
	
}


addMessageListener( "FVDSingle:hideIcon", function( message ){

	var elem = content.document.getElementById( POPUP_ID );
	if( elem ){
		elem.parentNode.removeChild( elem );
	}
	
});


addMessageListener( "FVDSingle:urlSize", function( message ){
	
	if( urlSizeCallbacks[ message.json.url ] ){	
		urlSizeCallbacks[ message.json.url ]( message.json.size );
		delete urlSizeCallbacks[ message.json.url ];
	}
	
});


addMessageListener( "FVDSingle:mediaResponse", function( message ){
	
	if( responseMediaCallback ){	
		responseMediaCallback( message );
	}
	
});



content.addEventListener( "close", function(){
	
	sendAsyncMessage("FVDSingle:Content:cleanUp", {
		
	});
	
} );



