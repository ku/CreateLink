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
  return new Promise(function (resolve) {
    chrome.tabs.sendMessage(tabId, message, function (res) {
      resolve(res);
    });
  });
}

export function showInputDialog(tabId: number): Promise<ResponseMessage> {
  return sendMessageToTab(tabId, { type: 'showInputDialog' })
}
export function getSelectionText(tabId: number): Promise<ResponseMessage> {
  return sendMessageToTab(tabId, { type: 'selectedText' })
}

export function copyToClipboard(document: Document, text: string) {
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

