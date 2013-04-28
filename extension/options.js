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
      }
      window.ctable = ctable;
    }catch(e){
      console.log(e)
    }

    var formats_json_textarea = document.getElementById("formats_json");
    var export_button = document.getElementById("export");
    var import_button = document.getElementById("import");

    export_button.addEventListener( 'click', function () {
      formats_json_textarea.value = localStorage[localStorageKey];
    }, false);

    import_button.addEventListener( 'click', function () {
      localStorage[localStorageKey] = formats_json_textarea.value;
      chrome.tabs.reload();
    }, false);

    formats_json_textarea.addEventListener( 'click', function () {
      this.focus();
      this.select();
    }, false);

  });
  
}, false);
