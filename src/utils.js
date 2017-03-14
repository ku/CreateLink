
module.exports = class Utils {
  static getCurrentTab() {
    return new Promise( (resolve) => {
      chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT,
        active: true
      }, function (tabs) {
        resolve(tabs[0])
      });
    })
  }

  static sendMessageToTab(tabId, message) {
    return new Promise(function (resolve) {
      chrome.tabs.sendMessage(tabId, message, function (res) {
        resolve(res);
      });
    });
  }

  static showInputDialog(tabId) {
    return this.sendMessageToTab(tabId, {type: 'showInputDialog'})
  }
  static getSelectionText(tabId) {
    return this.sendMessageToTab(tabId, {type: 'selectedText'})
  }
}
