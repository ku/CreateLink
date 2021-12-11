
const utils = require('./utils')
const fmt = require('./formats');

module.exports = class MessageBroker {
  constructor(createLink) {
    this.createLink = createLink
  }

  initialize() {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this))
  }

  sendMessage(msg, tab, cb) {
    return this.onMessage(msg, { tab: tab }, cb)
  };

  onMessage(msg, sender, sendResponse) {
    if (typeof sender === 'function') {
      sendResponse = sender
      sender = null
    }
    if (!sendResponse) {
      sendResponse = function () { }
    }

    const method = this["on" + msg.request.replace(/^./, s => s.toUpperCase())]
    if (method instanceof Function) {
      method.call(this, msg, sender, sendResponse)
    } else {
      console.error('unknown message', msg)
    }
  }

  onUpdateFormats(msg, sender, sendResponse) {
    // do nothing.
  }

  // only shortcut handler uses this message.
  async onCopyInFormat(msg, sender, sendResponse) {
     fmt.load().then( async() => {
       const def = fmt.getDefaultFormat()
       const tab = await utils.getCurrentTab();
       utils.getSelectionText(tab.id).then((selectionText) => {
         return { selectionText }
       }).then((info) => {
         return this.createLink.formatInTab(def, info, tab).then((link) => {
           utils.sendMessageToTab(tab.id, { type: 'copyToClipboard', link })
         })
       })
       sendResponse({ formatName: def.label })

     })
  }
}
