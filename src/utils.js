
module.exports = class Utils {
  static getCurrentTab() {
    return new Promise((resolve) => {
      chrome.windows.getCurrent({
        populate: true,
        windowTypes: ["normal"],
      }, function (w) {
        const t = w.tabs.find(t => t.active)
        resolve(t)
      })
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
    return this.sendMessageToTab(tabId, { type: 'showInputDialog' })
  }
  static getSelectionText(tabId) {
    return this.sendMessageToTab(tabId, { type: 'selectedText' })
  }

  static copyToClipboard(document, text) {
    // it does not copy the text to clipboard if it's hidden completely by "display: none".
    const textarea = document.createElement('textarea')
    textarea.setAttribute('style', `
        position: absolute;
        width: 0.1px;
        height: 0.1px;
        right: 200%;
        opacity: 0.1;
      `)
    textarea.setAttribute('id', 'clipboard_object')
    document.body.appendChild(textarea)

    textarea.value = text;
    textarea.select();
    document.execCommand("copy");
    textarea.parentNode.removeChild(textarea)
  }
}
