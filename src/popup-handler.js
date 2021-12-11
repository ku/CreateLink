const utils = require('./utils')
const fmt = require('./formats');
const CreateLink = require('./createlink');

module.exports = class PopupHandler {
  initialize() {
    this.initializeMenuItems()
  }

  async initializeMenuItems() {
    document.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    await fmt.load()
    const formats = fmt.getFormats()
    this.setupListItems(formats);
  }

  createListElement(id, text) {
    var e = document.createElement('li');
    e.setAttribute('class', "item");
    e.setAttribute('id', id);
    e.innerText = text;
    return e;
  }

  setupListItems(formats) {
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

  onMouseUp(ev) {
    utils.getCurrentTab().then((tab) => {
      this.onMenuSelected(tab, ev.target.id);
    })
  }

  async onMenuSelected(tab, id) {
    if (id == 'configure') {
      chrome.tabs.create({ url: "options.html" });
      window.close();
    } else if (id == 'separator') {
    } else if (id.match(/^item(\d+)$/)) {
      var formatIndex = Number(RegExp.$1);

      const def = fmt.format(formatIndex)
      const selectionText = await utils.getSelectionText(tab.id)
      const text = selectionText || tab.title

      const cl = new CreateLink()
      const link = await cl.formatInTab(def, { selectionText }, tab)
      utils.copyToClipboard(document, link)
      window.close();
    }
  }
}
