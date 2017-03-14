chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'showInputDialog') {
    var text = window.prompt("CreateLink needs your input");
    return sendResponse(text);
  } else if (request.type === 'selectedText') {
    var s = document.getSelection()
    return sendResponse(s ? s.toString() : '')
  } else if (request.type === 'evaluateFilter') {
    var f = new Function('s', request.code)
    return sendResponse(f.call(null, request.string))
  }
});
