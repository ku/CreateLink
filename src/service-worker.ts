
import { ShortcutHandler } from './shortcut-handler'
import { ContextMenuHandler } from './context-menu-handler'
import { CreateLink } from './createlink'
import { MessageBroker } from './message-broker'
import fmt from './formats'

class CreateLinkExtension {
  createLink: CreateLink

  async startup() {
    this.createLink = new CreateLink()

    const broker = new MessageBroker(this.createLink);

    (new ShortcutHandler(broker)).initialize();
    await fmt.load()
    const formats = fmt.getFormats();
    (new ContextMenuHandler(broker).initialize(formats));
    broker.initialize();
    this.initialize()
  }

  initialize() {
    //document.addEventListener('copy', (ev) => {
    //  ev.preventDefault();

    //  const proxy = chrome.extension.getBackgroundPage().document.getElementById('clipboard_object')
    //  var text = proxy.value;
    //  ev.clipboardData.setData("text/plain", text);
    //  ev.clipboardData.setData("text/html", text);
    //}, true);
  }
}

const app = new CreateLinkExtension()
app.startup()

