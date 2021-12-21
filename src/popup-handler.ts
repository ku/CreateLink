import { getCurrentTab, copyToClipboard, getSelectionText } from './utils'
import fmt, { FormatDefinition } from './formats'
import { CreateLink } from './createlink'

interface ContextMenuItem {
  id: string
}

export class PopupHandler {
  initialize() {
    this.initializeMenuItems()
  }

  async initializeMenuItems() {
    document.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    await fmt.load()
    const formats = fmt.getFormats()
    this.setupListItems(formats);
  }

  createListElement(id: string, text: string) {
    var e = document.createElement('li');
    e.setAttribute('class', "item");
    e.setAttribute('id', id);
    e.innerText = text;
    return e;
  }

  setupListItems(formats: FormatDefinition[]) {
    var listParent = document.getElementById("formatlist");
    var insertionPoint = document.getElementById("separator");
    var n = 0;
    formats.map((def) => {
      var id = "item" + n;
      var e = this.createListElement(id, def.label);
      listParent.insertBefore(e, insertionPoint);
      n++;
    });
  }

  onMouseUp(ev: Event) {
    getCurrentTab().then((tab: chrome.tabs.Tab) => {
      if (ev.target === null) {
        throw new Error("target is null")
      }
      const target = (ev.target as unknown) as ContextMenuItem
      this.onMenuSelected(tab, target.id);
    })
  }

  async onMenuSelected(tab: chrome.tabs.Tab, id: string) {
    if (id == 'configure') {
      chrome.tabs.create({ url: "options.html" });
      window.close();
    } else if (id == 'separator') {
    } else if (id.match(/^item(\d+)$/)) {
      var formatIndex = Number(RegExp.$1);

      const def = fmt.format(formatIndex)
      const response = await getSelectionText(tab.id)
      let selectionText
      if (response instanceof Object) {
        selectionText = response.text
      }
      const cl = new CreateLink()
      const link = await cl.formatInTab(def, {
        selectionText,
        pageUrl: tab.url,
      }, tab)
      copyToClipboard(document, link)
      window.close();
    }
  }
}
