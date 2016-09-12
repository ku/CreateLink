class OptionsPage {
  initialize() {
    this.fillVersion()

    chrome.runtime.getBackgroundPage( (backgroundWindow) => {
      this.bg = backgroundWindow.instance();
      this.select = document.getElementById("current-default-format");

      this.setupFormatOptions();
      this.setupTable(this.bg.formats);

      this.select.addEventListener('change', (ev) => {
        var s = this.select;
        var o = s.options[s.selectedIndex];
        this.bg.setDefaultFormat(o.value);
      }, false)

    });

    document.getElementById("configure-shortcut").addEventListener('click', function () {
      chrome.tabs.create({url:'chrome://extensions/configureCommands'});
    }, false);
  }

  fillVersion() {
    var manifest = chrome.runtime.getManifest();
    var version = document.getElementById("version");
    version.innerText = manifest.version;
  }

  setSelectedFormat(format) {
    Array.prototype.slice.call(this.select.options).some( (o) => {
      if (o.value == format) {
        o.selected = true
        return true
      }
    })
  }

  setupFormatOptions() {
    var formats = this.bg.formats
    var o = document.createElement('option');
    o.textContent = '(not selected)';
    this.select.appendChild(o);

    formats.forEach( (format, i) => {
      var o = document.createElement('option');
      o.setAttribute('data-index', i);
      o.textContent = format.label;
      this.select.appendChild(o);
    })
    this.setSelectedFormat(this.bg.getDefaultFormat());
  }

  renameOption(newValue, oldValue) {
    Array.prototype.slice.call(this.select.options).some( (o) => {
      if (o.value == oldValue) {
        o.textContent = newValue;
        return true;
      }
    } )
  }

  setupTable(formats) {
    var ctable = new CocoaTable(formats, [
      'label', 'format', 'filter'
    ], {
      onRemoving: (index) => {
        this.select.removeChild(this.select.options[index + 1]);
      },
      onUpdated: (newValue, oldValue) => {
        var json = ctable.serialize();

        this.bg.setFormatPreferences(json);
        this.renameOption(newValue, oldValue);

        // Update context menus
        chrome.extension.sendMessage({
          command: 'updateContextMenus'
        });
      }
    });
  }
}

const page = new OptionsPage();
window.addEventListener('load', () => {
  page.initialize()
}, false);
