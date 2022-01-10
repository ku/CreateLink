import fmt, { FormatDefinition } from "./formats";
import { CreateLink } from './createlink'
import { ResponseMessage, sendMessageToTab } from './utils'

// run in service worker context.
export class ContextMenuHandler {

  // callback function for contextMenus.onClicked cannot be an async function.
  static onMenuItemClicked(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): Promise<ResponseMessage> {
    return sendMessageToTab(tab.id, { type: 'ping' }).then(async (response) => {
      if (response && response.type !== "pong") {
        // Reload the tab. The tab might be opened before this extension is installed.
        // It should respond once it is reloaded.
        chrome.tabs.reload(tab.id)
        throw new Error("content script is not responding.")
      }
      await fmt.load()

      const formatIndex = parseInt(String(info.menuItemId).split('-').pop())
      const def = fmt.format(formatIndex)
      const cl = new CreateLink()
      const link = await cl.formatInTab(def, info, tab)
      return cl.copyToClipboard(tab.id, link)
    })
  }

  static async updateContextMenus() {
    await fmt.load()
    const formats = fmt.getFormats();

    chrome.contextMenus.removeAll();

    if (formats.length == 1) {
      const menuId = chrome.contextMenus.create({
        "title": "Copy Link as " + formats[0].label,
        "id": "context-menu-item-0",
        "contexts": ["all"],
      });
    } else {
      for (var formatIndex = 0; formatIndex < formats.length; ++formatIndex) {
        const props: chrome.contextMenus.CreateProperties = {
          "title": formats[formatIndex].label,
          "id": "context-menu-item-" + formatIndex,
          "contexts": ["all"],
        }
        console.log("menuItem", props)
        const menuId = chrome.contextMenus.create(props);
      }
    }
  }
}
