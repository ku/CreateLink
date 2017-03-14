
const utils = require('./utils')

module.exports = class MessageBroker {
  constructor(createLink) {
    this.createLink = createLink
  }

  initialize() {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this))
  }

  sendMessage(msg, tab, cb) {
    return this.onMessage(msg, {tab: tab}, cb)
  };

  onMessage(msg, sender, sendResponse) {
    if (typeof sender === 'function') {
      sendResponse = sender
      sender = null
    }
    if (!sendResponse) {
      sendResponse = function () {}
    }

    const method = this["on" + msg.request.replace(/^./, s => s.toUpperCase())]
    if (method instanceof Function) {
      method.call(this, msg, sender, sendResponse)
    } else {
      console.error('unknown message', msg)
    }
  }

  onFormats(msg, sender, sendResponse) {
    sendResponse({
      formats: JSON.parse(JSON.stringify(this.createLink.formats)),
      defaultFormat: this.createLink.getDefaultFormat(),
    })
  }


  onSetDefaultFormat(msg, sender, sendResponse) {
    this.createLink.setDefaultFormat(msg.format);
  }

  onUpdateFormats(msg, sender, sendResponse) {
    this.createLink.setFormatPreferences(msg.formats);
  }

  onCopyInFormat(msg, sender, sendResponse) {
    let formatId = msg.format

    if (formatId === -1) {
      formatId = this.createLink.getDefaultFormatId()
    }

    if (formatId >= 0) {
      const tab = sender && sender.tab;

      (tab ? Promise.resolve(tab) : utils.getCurrentTab()).then( (tab) => {
        (msg.info ? Promise.resolve(msg.info) : utils.getSelectionText(tab.id).then( (selectionText) => {
          return { selectionText }
        })).then( (info) => {
          return this.createLink.formatInTab(formatId, info, tab).then( (linkText) => {
            this.createLink.copyToClipboard(linkText)

            const formatName = this.createLink.formats[formatId].label
            sendResponse({formatName})
          })
        })
      })
    } else {
      sendResponse(null)
    }
  }
}
