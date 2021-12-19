
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
      return sendResponse({ type: request.type, text: copyToClipboard(request.link) })
  }
});


function copyToClipboard(text) {
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
