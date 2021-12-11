const CreateLink = require('./createlink')
const utils = require('./utils')
const fmt = require('./formats')

// run in service worker context.
module.exports = class ContextMenuHandler {
  constructor(broker) {
    this.contextMenuIdList = {};
    this.broker = broker
  }

 initialize(formats) {
   this.updateContextMenus(formats)

    chrome.contextMenus.onClicked.addListener(this.onMenuItemClicked.bind(this))
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this))
  }

  onMessage(request, sender, sendResponse) {
    if (request.request == 'updateFormats') {
      // options page requests updating the items
      this.updateContextMenus(request.formats)
    }
  }

  formatIndexOfMenuItemId(menuItemId) {
    return this.contextMenuIdList[menuItemId]
  }

  // callback function for contextMenus.onClicked cannot be an async function.
  onMenuItemClicked(info, tab) {
    utils.sendMessageToTab(tab.id, { type: 'ping' }).then(async (response) => {
      if (response !== "pong") {
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
        utils.sendMessageToTab(tab.id, { type: 'copyToClipboard', link })
      })
    })
  }

  updateContextMenus(formats) {
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
