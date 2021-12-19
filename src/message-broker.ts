
import { Message, ResponseMessage, getSelectionText, getCurrentTab, sendMessageToTab} from './utils'
import fmt from './formats'
import { CreateLink } from './createlink'

type MessageResponder = ((response?: ResponseMessage) => void)

export class MessageBroker {
  createLink: CreateLink

  constructor(createLink: CreateLink) {
    this.createLink = createLink
  }

  initialize() {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this))
  }

  sendMessage(msg: Message, cb: MessageResponder) {
    return this.onMessage(msg, cb)
  };

  onMessage(msg: Message, sendResponse: MessageResponder) {
    const method = (this as any)["on" + msg.type.replace(/^./, s => s.toUpperCase())]
    if (method instanceof Function) {
      method.call(this, msg, sendResponse)
    } else {
      console.error('unknown message', msg)
    }
  }

  onUpdateFormats(msg: Message, sendResponse: MessageResponder) {
    // do nothing.
  }

  // only shortcut handler uses this message.
  async onCopyInFormat(msg: Message, sendResponse: MessageResponder) {
     fmt.load().then( async() => {
       const def = fmt.getDefaultFormat()
       const tab = await getCurrentTab();
       getSelectionText(tab.id).then((response) => {
         return {
            selectionText: response.text,
            pageUrl: tab.url,
         }
       }).then((info) => {
         return this.createLink.formatInTab(def, info, tab).then((link) => {
           sendMessageToTab(tab.id, { type: 'copyToClipboard', link })
         })
       })
       sendResponse({ type: 'copyInFormat', text: def.label })
     })
  }
}
