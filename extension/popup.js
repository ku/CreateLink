var _createLink = null;

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
  try {
    chrome.runtime.getBackgroundPage(function (backgroundWindow) {
      _createLink = backgroundWindow.instance();

      var formats = _createLink.formats;
      setupListItems(formats);
    });
  }catch(e){
    chrome.runtime.getBackgroundPage(function (backgroundWindow) {
      backgroundWindow.console.log(e, e.line)
    });
  }
}, false);
