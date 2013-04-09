window.addEventListener( 'load', function () {
  var localStorageKey = 'format_preferences';
  var formats = chrome.extension.getBackgroundPage().instance().formats;
  try{
    var ctable	= new CocoaTable(formats, [
      'label', 'format', 'filter'
    ] );
    ctable._listener.onUpdated = function () {
      var json = ctable.serialize();
      localStorage[localStorageKey] = json;
    }
    window.ctable = ctable;
    }catch(e){
      console.log(e)
    }
}, false);
