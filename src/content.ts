import { copyToClipboard } from './utils'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case 'ping':
      return sendResponse({type: 'pong'})
    case 'showInputDialog':
      const text = window.prompt("CreateLink needs your input");
      return sendResponse({type: request.type, text});
    case 'selectedText':
      const s = document.getSelection()
      return sendResponse({ type: request.type, text: (s ? s.toString() : '')})
    case 'evaluateFilter':
      const f = new Function('s', request.code)
      return sendResponse({ type: request.type, text: f.call(null, request.string)})
    case 'copyToClipboard':
      return sendResponse({ type: request.type, text: copyToClipboard(document, request.link) })
  }
});
