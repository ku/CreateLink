var _createLink = null;

/*
chrome.windows.getAll(function (w) {
  console.log(w.map(function (w) {return w.id
      }))
});

  chrome.windows.get(218, {populate:true},function (w) {
    var tabId = w.tabs.filter(function (tab) {
      return tab.selected
  }).shift().id;
  window.t = w; 
  console.log(tabId )

  chrome.tabs.executeScript(tabId, {
    code: "alert(document.getSelection().toString())"
  }, function (r) {
    console.log(r)
  })
})
*/

function onMenuSelected(tab, id) {
  if ( id == 'configure' ) {
    chrome.tabs.create({url:"options.html"});
    window.close();
  } else if ( id == 'separator' ) {
    window.close();
  } else if ( id.match(/^item(\d+)$/) ) {
    var n = Number(RegExp.$1);
    var formats =  (_createLink.formats);

    chrome.runtime.getBackgroundPage(function (backgroundWindow) {
      chrome.windows.getCurrent({
        populate: true
      }, function (w) {
        var tabId = w.tabs.filter(function (tab) {
            return tab.selected
        }).shift().id;

        chrome.tabs.executeScript(tabId, {
          code: "var s = document.getSelection(); (s ? s.toString() : '')"
        }, function (selectedText) {
          selectedText = (selectedText instanceof Array) ? selectedText.toString() : selectedText;

          var url = tab.url;
          var title = tab.title;
          var text = (selectedText == '') ? title : selectedText;

          _createLink.formatLinkText(n, url, text, title, tabId).pipe(function (linkText) {
            _createLink.copyToClipboard(linkText);
            window.close();
          });
        })
      })
    });

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
  try {
    setupEventHandlers();

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
