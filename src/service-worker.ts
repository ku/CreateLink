
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
  }
}

const app = new CreateLinkExtension()
app.startup()

