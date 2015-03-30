var EXPORTED_SYMBOLS = ["async"]; 

async = {
  chain: function( callbacksChain ){
    
    var dataObject = {};
    
    var f = function(){
      if( callbacksChain.length > 0 ){
        var nextCallback = callbacksChain.shift();            
        nextCallback( f, dataObject );
      }         
    };
    
    f();
    
  },
  
  arrayProcess: function( dataArray, callback, finishCallback ){
    
    var f = function( i ){
      
      if( i >= dataArray.length ){
        finishCallback();
      }
      else{
        callback( dataArray[i], function(){
          f(i + 1);
        } );
      }
      
    };
    
    f(0);     
    
  }
};
