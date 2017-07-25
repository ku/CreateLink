class OptionsPage {
  initialize() {
    this.fillVersion()

    chrome.runtime.sendMessage({request: 'formats'}, ({formats, defaultFormat}) => {
      this.select = document.getElementById("current-default-format");

      this.setupFormatOptions(formats, defaultFormat);
      this.setupTable(formats);

      this.select.addEventListener('change', (ev) => {
        var s = this.select;
        var o = s.options[s.selectedIndex];

        chrome.runtime.sendMessage({request: 'setDefaultFormat', format: o.value})
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

  setupFormatOptions(formats, defaultFormat) {
    var o = document.createElement('option');
    o.textContent = '(not selected)';
    this.select.appendChild(o);

    formats.forEach( (format, i) => {
      var o = document.createElement('option');
      o.setAttribute('data-index', i);
      o.textContent = format.label;
      this.select.appendChild(o);
    })
    this.setSelectedFormat(defaultFormat)
  }

  renameOption(newValue, oldValue) {
    Array.prototype.slice.call(this.select.options).some( (o) => {
      if (o.value == oldValue) {
        o.textContent = newValue;
        return true;
      }
    } )
  }

  onRemoving(index) {
    this.select.removeChild(this.select.options[index + 1]);
  }

  onUpdated(ctable, newValue, oldValue) {
    var json = ctable.serialize();

    this.renameOption(newValue, oldValue);

    chrome.runtime.sendMessage({request: 'updateFormats', formats: json})
  }

  setupTable(formats) {
    var ctable = new CocoaTable(formats, [
      'label', 'format', 'filter'
    ], {
      onRemoving: this.onRemoving.bind(this),
      onUpdated: (newValue, oldValue) => {
        this.onUpdated(ctable, newValue, oldValue)
      },
    });
  }
}

const page = new OptionsPage();
window.addEventListener('load', () => {
  page.initialize()
}, false);
