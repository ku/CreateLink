
import { Message, ResponseMessage, getSelectionText, getCurrentTab, sendMessageToTab } from './utils'
import { ShortcutHandler } from './shortcut-handler'
import { ContextMenuHandler } from './context-menu-handler'
import fmt from './formats'

type MessageResponder = ((response?: ResponseMessage) => void)

class CreateLinkExtension {
  async startup() {
    (new ShortcutHandler()).initialize();
  }
}

const app = new CreateLinkExtension()
app.startup()


chrome.runtime.onMessage.addListener(function (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  console.log({ message })
  switch (message.type) {
    case 'updateFormats':
      ContextMenuHandler.updateContextMenus()
      break
  }
})


chrome.contextMenus.onClicked.addListener( async function(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  ContextMenuHandler.onMenuItemClicked(info, tab)
})

chrome.runtime.onInstalled.addListener(async function () {
  ContextMenuHandler.updateContextMenus()
})
