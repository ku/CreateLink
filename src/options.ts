
import fmt, { FormatDefinition } from './formats'

class OptionsPage {
  select: HTMLSelectElement
  selectedFormatName: string

  async initialize() {
    await fmt.load()
    this.fillVersion()

    const formats = fmt.getFormats()
    const defaultFormatName = fmt.getDefaultFormatName()

    this.select = document.getElementById("current-default-format") as HTMLSelectElement;
    this.selectedFormatName = defaultFormatName

    this.buildFormatOptions(formats, defaultFormatName);
    this.setupTable(formats);

    this.select.addEventListener('change', (ev) => {
      var s = this.select;
      var o = s.options[s.selectedIndex];

      fmt.setDefaultFormatName(o.value)
      this.selectedFormatName = o.value
    }, false)

    document.getElementById("configure-shortcut").addEventListener('click', function () {
      chrome.tabs.create({ url: 'chrome://extensions/configureCommands' });
    }, false);
  }

  fillVersion() {
    var manifest = chrome.runtime.getManifest();
    var version = document.getElementById("version");
    version.innerText = manifest.version;
  }

  setSelectedFormat(formatName: string) {
    Array.from(this.select.options).some((o) => {
      if (o.value == formatName) {
        o.selected = true
        return true
      }
    })
  }

  buildFormatOptions(formats: FormatDefinition[], defaultFormatName: string) {
    Array.from(this.select.options).forEach(o => o.parentNode.removeChild(o))
    formats.forEach((format, i) => {
      var o = document.createElement('option');
      o.setAttribute('data-index', String(i));
      o.textContent = format.label;
      this.select.appendChild(o);
    })
    this.setSelectedFormat(defaultFormatName)
  }

  renameOption(newValue: string, oldValue: string) {
    Array.from(this.select.options).some((o) => {
      if (o.value == oldValue) {
        o.textContent = newValue;
        return true;
      }
    })
  }

  onRemoving(index: number) {
    this.select.removeChild(this.select.options[index]);
    const selectedOption = Array.from(this.select.options).find(o => o.selected)
    this.selectedFormatName = selectedOption.value
    fmt.setDefaultFormatName(selectedOption.value)
  }

  onUpdated(ctable: any, newValue: string, oldValue: string) {
    var formats = ctable.formats();

    this.buildFormatOptions(formats, this.selectedFormatName);

    this.renameOption(newValue, oldValue);
    fmt.setFormats(formats)
    chrome.runtime.sendMessage({ request: 'updateFormats', formats })
  }

  setupTable(formats: FormatDefinition[]) {
    var ctable = new CocoaTable(formats, [
      'label', 'format', 'filter'
    ], {
      onRemoving: this.onRemoving.bind(this),
      onUpdated: (newValue: string, oldValue: string) => {
        this.onUpdated(ctable, newValue, oldValue)
      },
    });
  }
}

const page = new OptionsPage();
window.addEventListener('load', () => {
  page.initialize()
}, false);
