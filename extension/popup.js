function onMenuSelected(tab, id) {
  if ( id == 'configure' ) {
    chrome.tabs.create({url:"options.html"});
    window.close();
  } else if ( id == 'separator' ) {
    window.close();
  } else if ( id.match(/^item(\d+)$/) ) {
    var n = RegExp.$1;
    var formats =  (chrome.extension.getBackgroundPage().instance().formats);
    var def = formats[n];

    function sendMessageCallbackHandler(response) {
      // see chrome://makelink/content/help/defininglinktypes.html
      var text = response.length > 0 ? response : tab.title;
      var data = chrome.extension.getBackgroundPage().instance().formatLinkText(
        n, tab.url, text, tab.title);

      chrome.extension.sendMessage({
        command: 'setClipboard',
        data: data
      } );
      window.close();
    }
    
    // skip retrieving selection because content scripts disabled on chrome.google.com
    // so that callback function for sendMessage does not be called.
    if ( tab.url.match( /^https:\/\/chrome.google.com\// ) ) {
      sendMessageCallbackHandler('');
    } else {
      chrome.tabs.sendMessage(tab.id, "getSelection", sendMessageCallbackHandler);
    }
  }
}

function setupEventHandlers() {
  document.addEventListener( 'mouseup', function (ev) {
    chrome.windows.getCurrent(function (w) {
      chrome.tabs.getSelected(w.id, function (t) {
        onMenuSelected(t, ev.target.id);
      });
    });
  }, false);
}
function createListElement(id, text) {
  var e = document.createElement('li');
  e.setAttribute('class', "item");
  e.setAttribute('id', id);
  e.innerText = text;
  return e;
}

function setupListItems(formats) {
  var listParent = document.getElementById("formatlist");
  var insertionPoint = document.getElementById("separator");
  var n = 0;
  formats.map( function (def) {
    var id = "item" + n;
    var e = createListElement(id, def.label);
      listParent.insertBefore(e, insertionPoint);
    n++;
  } );

}

window.addEventListener( "load", function () {
  try{
    setupEventHandlers();
console.log("backgroundpage!!!");
console.log(chrome.extension.getBackgroundPage());
console.log("backgroundpage instance!!!");
console.log(chrome.extension.getBackgroundPage().instance());
    setupListItems(chrome.extension.getBackgroundPage().instance().formats);
  }catch(e){
        chrome.extension.getBackgroundPage().console.log(e)
        chrome.extension.getBackgroundPage().console.log(e.line)
  }
}, false);
