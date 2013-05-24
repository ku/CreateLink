window.addEventListener( 'load', function () {
  var localStorageKey = 'format_preferences';

  var manifest = chrome.runtime.getManifest();;
  var version = document.getElementById("version");
  version.innerText = manifest.version;

  chrome.runtime.getBackgroundPage(function (backgroundWindow) {
    var formats = backgroundWindow.instance().formats;
    
    try{
      var ctable	= new CocoaTable(formats, [
        'label', 'format', 'filter'
      ] );
      ctable._listener.onUpdated = function () {
        var json = ctable.serialize();
        localStorage[localStorageKey] = json;

        // Update context menus
        chrome.extension.sendMessage({
          command: 'updateContextMenus',
        });
      }
      window.ctable = ctable;
    }catch(e){
      console.log(e)
    }
  });
  
}, false);
