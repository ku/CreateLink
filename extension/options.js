window.addEventListener( 'load', function () {
  var manifest = chrome.runtime.getManifest();
  var version = document.getElementById("version");
  version.innerText = manifest.version;

  chrome.runtime.getBackgroundPage(function (backgroundWindow) {
    var instance = backgroundWindow.instance();
    var formats = instance.formats;

    var defaultFormatButton = document.getElementById('set-default-format');
    var currentDefault = instance.getDefaultFormat();
    document.getElementById('current-default-format').textContent = String(currentDefault);
    defaultFormatButton.textContent = 'Set default to ' + currentDefault;
    defaultFormatButton.addEventListener('click', function () {
      var v = defaultFormatButton.getAttribute('data-selected-value');
      instance.setDefaultFormat(v);
      document.getElementById('current-default-format').textContent = v;
    });
    
    try{
      var ctable = new CocoaTable(formats, [
        'label', 'format', 'filter'
      ] );
      
      ctable.onSelectedRowChanged(function (rowEvent) {
        try {
          var currentSelectedRow = rowEvent.detail.current;
          var selectedName = currentSelectedRow.querySelector('span').textContent;
          defaultFormatButton.textContent = 'Set default to ' + selectedName;
          defaultFormatButton.setAttribute('data-selected-value', selectedName);
        } catch (e) {
          console.log(e);
        }
      });

      ctable._listener.onUpdated = function () {
        var json = ctable.serialize();
        instance.setFormatPreferences(json);

        // Update context menus
        chrome.extension.sendMessage({
          command: 'updateContextMenus'
        });
      };
      window.ctable = ctable;
    }catch(e){
      console.log(e);
    }
  });
  
}, false);
