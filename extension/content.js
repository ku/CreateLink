chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var sel = window.getSelection();
    sendResponse(sel ? sel.toString() : '');
});
