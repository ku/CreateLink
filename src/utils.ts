export interface Message {
  type: string
  link?: string
  code?: string  // used by content script. valid with type = 'evaluateFilter'
  string?: string // link string.valid with type = 'evaluateFilter'
}

export interface ResponseMessage {
  type: string
  text?: string
}

export function getCurrentTab(): Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    chrome.windows.getCurrent({
      populate: true,
      windowTypes: ["normal"],
    }, function (w: chrome.windows.Window) {
      const t = w.tabs.find(t => t.active)
      resolve(t)
    })
  })
}

export function sendMessageToTab(tabId: number, message: Message): Promise<ResponseMessage | null> {
  return new Promise(function (resolve, reject) {
    chrome.tabs.sendMessage(tabId, message, function (res) {
      if (!res && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(res)
      }
    });
  });
}

export function showInputDialog(tabId: number): Promise<ResponseMessage> {
  return sendMessageToTab(tabId, { type: 'showInputDialog' })
}
export function getSelectionText(tabId: number): Promise<ResponseMessage> {
  return sendMessageToTab(tabId, { type: 'selectedText' })
}

// This function does not work in service worker due to lack of ClipboardItem.
// Need to run in content script.
export function copyToClipboard(document: Document, text: string): Promise<void> {
  let itemParams: { [name: string]: Blob } = {
    'text/plain': new Blob([text], { type: "text/plain" }),
  }

  // add text/html if the text looks like containing an anchor.
  try {
    const div = document.createElement('div')
    div.innerHTML = text
    const a = div.querySelector('a')
    if (a) {
      itemParams['text/html'] = new Blob([text], { type: "text/html" })
    }

    const items = [new ClipboardItem(itemParams)];
    return navigator.clipboard.write(items).then( () => {
      console.log('copied', itemParams)
    }, (reason) => {
      console.log('Clipboard API failed', reason)
      copyToClipboardHTML(document, text)
    })
  } catch(e) {
      console.log("falling back to execCommand('copy')", e)
      copyToClipboardHTML(document, text)
  }
}

// fall back if Clipboard API failed
function copyToClipboardHTML(document: Document, text: string) {
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
  textarea.appendChild(document.createTextNode(text))
  textarea.select()
  document.execCommand("copy");
  textarea.parentNode.removeChild(textarea)
  return text
}


