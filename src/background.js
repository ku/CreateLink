
const ShortcutHandler = require('./shortcut-handler')
const ContextMenuHandler = require('./context-menu-handler')
const CreateLink = require('./createlink')
const MessageBroker = require('./message-broker')
const utils = require("./utils")

class CreateLinkExtension {
  startup() {
    this.createLink = new CreateLink()

    const broker = new MessageBroker(this.createLink);

    (new ShortcutHandler(broker)).initialize();
    (new ContextMenuHandler(broker).initialize(this.createLink.formats));
    broker.initialize();

    this.initialize()
  }

  initialize() {
    document.addEventListener('copy', (ev) => {
      ev.preventDefault();

      const proxy = chrome.extension.getBackgroundPage().document.getElementById('clipboard_object')
      var text = proxy.value;
      ev.clipboardData.setData("text/plain", text);
      ev.clipboardData.setData("text/html", text);
    }, true);
  }
}

(new CreateLinkExtension()).startup()
