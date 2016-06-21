window.addEventListener( 'load', function () {
  var manifest = chrome.runtime.getManifest();
  var version = document.getElementById("version");
  version.innerText = manifest.version;
  var defaultFormatValueStorageAttribute = 'data-selected-value';

  chrome.runtime.getBackgroundPage(function (backgroundWindow) {
    var target = backgroundWindow.instance();
    var formats = target.formats;

    var defaultFormatButton = document.getElementById('set-default-format');
    var currentDefault = target.getDefaultFormat();
    var currentDefaultEl = document.getElementById('current-default-format');
    currentDefaultEl.textContent = String(currentDefault);
    defaultFormatButton.textContent = 'Set default to ' + currentDefault;
    defaultFormatButton.addEventListener('click', function () {
      var v = defaultFormatButton.getAttribute(defaultFormatValueStorageAttribute);
      backgroundWindow.instance().setDefaultFormat(v);
      currentDefaultEl.textContent = v;
    });
    
    try{
      var ctable = new CocoaTable(formats, [
        'label', 'format', 'filter'
      ] );
      
      ctable.onSelectedRowChanged(function (rowEvent) {
        try {
          // This would happen while the user is in the middle of
          //  editing/creating a new format. Safe to ignore, so we do.
          var currentSelectedRow = rowEvent.detail.current;
          var selectedName = currentSelectedRow.querySelector('span').textContent;
          defaultFormatButton.textContent = 'Set default to ' + selectedName;
          defaultFormatButton.setAttribute(defaultFormatValueStorageAttribute, selectedName);
        } catch (e) {
          console.log(e);
        }
      });

      ctable._listener.onUpdated = function () {
        var json = ctable.serialize();
        backgroundWindow.instance().setFormatPreferences(json);

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
