
const utils = require('./utils')

module.exports = class PopupHandler {
  initialize() {
    this.initializeMenuItems()
  }

  initializeMenuItems() {
    document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false);

    chrome.runtime.sendMessage({request: 'formats'}, (response) => {
      var formats = response.formats
      this.setupListItems(formats);
    })
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
    formats.map( (def) => {
      var id = "item" + n;
      var e = this.createListElement(id, def.label);
        listParent.insertBefore(e, insertionPoint);
      n++;
    } );
  }

  onMouseUp(ev) {
    utils.getCurrentTab().then( (tab) => {
      this.onMenuSelected(tab, ev.target.id);
    })
  }

  onMenuSelected(tab, id) {
    if ( id == 'configure' ) {
      chrome.tabs.create({url:"options.html"});
      window.close();
    } else if ( id == 'separator' ) {
      window.close();
    } else if ( id.match(/^item(\d+)$/) ) {
      var formatId = Number(RegExp.$1);

      chrome.runtime.sendMessage({
        request: 'copyInFormat',
        format: formatId,
      }, () => {
        window.close()
      })
    }
  }
}
