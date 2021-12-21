import fmt, { FormatDefinition } from "./formats";
import { MessageBroker } from './message-broker'
import {CreateLink } from './createlink'
import { sendMessageToTab } from './utils'

// run in service worker context.
export class ContextMenuHandler {
  broker: MessageBroker
  contextMenuIdList: { [name: string]: number }

  constructor(broker: MessageBroker) {
    this.broker = broker
    this.contextMenuIdList = {};
  }

 initialize(formats: FormatDefinition[]) {
   this.updateContextMenus(formats)

    chrome.contextMenus.onClicked.addListener(this.onMenuItemClicked.bind(this))
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this))
  }

  onMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: ((response?: any) => void)) {
    if (request.type == 'updateFormats') {
      // options page requests updating the items
      this.updateContextMenus(request.formats)
    }
  }

  formatIndexOfMenuItemId(menuItemId: string|number): number {
    return this.contextMenuIdList[String(menuItemId)]
  }

  // callback function for contextMenus.onClicked cannot be an async function.
  onMenuItemClicked(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    sendMessageToTab(tab.id, { type: 'ping' }).then(async (response) => {
      if (response && response.type !== "pong") {
        // Reload the tab. The tab might be opened before this extension is installed.
        // It should respond once it is reloaded.
        chrome.tabs.reload(tab.id)
        throw new Error("content script is not responding.")
      }
      await fmt.load()
      const formatIndex = this.formatIndexOfMenuItemId(info.menuItemId)
      const def = fmt.format(formatIndex)
      const cl = new CreateLink()
      cl.formatInTab(def, info, tab).then(link => {
        sendMessageToTab(tab.id, { type: 'copyToClipboard', link })
      })
    })
  }

  updateContextMenus(formats: FormatDefinition[]) {
    chrome.contextMenus.removeAll();

    if (formats.length == 1) {
      const menuId = chrome.contextMenus.create({
        "title": "Copy Link as " + formats[0].label,
        "id": "context-menu-item-0",
        "contexts": ["all"],
      });
      this.contextMenuIdList[menuId] = 0;
    } else {
      for (var formatIndex = 0; formatIndex < formats.length; ++formatIndex) {
        const menuId = chrome.contextMenus.create({
          "title": formats[formatIndex].label,
          "id": "context-menu-item-" + formatIndex,
          "contexts": ["all"],
        });
        this.contextMenuIdList[menuId] = formatIndex;
      }
    }
  }
}
