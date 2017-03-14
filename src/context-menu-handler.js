
module.exports = class ContextMenuHandler {
  constructor(broker) {
    this.contextMenuIdList = {};
    this.broker = broker
  }

  initialize(formats) {
    this.updateContextMenus(formats)

    chrome.contextMenus.onClicked.addListener(this.onMenuItemClicked.bind(this))
    chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
        if ( request.command == 'updateContextMenus' ) {
          // options page requests upadting the items
          this.updateContextMenus();
        }
      }
    );
  }

  formatIndexOfMenuItemId(menuItemId) {
    return this.contextMenuIdList[menuItemId]
  }

  onMenuItemClicked(info, tab) {
    var formatId = this.formatIndexOfMenuItemId(info.menuItemId)

    this.broker.sendMessage({
      request: 'copyInFormat',
      format: formatId,
      info: info,
    }, tab)
  }

  updateContextMenus(formats) {
    chrome.contextMenus.removeAll();

    if (formats.length == 1) {
      chrome.contextMenus.create({
        "title": "Copy Link as " + formats[0].label,
        "id": "context-menu-item-0",
        "contexts": ["all"],
      });
    } else {
      for (var formatId = 0; formatId < formats.length; ++formatId) {
        var menuId = chrome.contextMenus.create({
          "title": formats[formatId].label,
          "id": "context-menu-item-" + formatId,
          "contexts": ["all"],
        });
        this.contextMenuIdList[menuId] = formatId;
      }
    }
  }
}
