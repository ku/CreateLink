chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === 'showInputDialog') {
    var text = window.prompt("CreateLink needs your input");
    return sendResponse(text);
  }
});
