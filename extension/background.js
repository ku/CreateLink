
chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if ( request.command == 'setClipboard' ) {
      copyToClipboard(request.data);
    } else if ( request.command == 'updateContextMenus' ) {
      updateContextMenus();
    }
  }
);
function CreateLink() {
  var self = this;
  this.__defineGetter__( "formats", function () {
    return self.readFormats();
  } );
}
CreateLink.default_formats = [
    {label: "Plain text", format: '%text% %url%' },
    {label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
    {label: "markdown", format: '[%text_md%](%url%)' },
    {label: "mediaWiki", format: '[%url% %text%]' },
];

CreateLink.prototype.copyToClipboard = function (text) {
  var proxy = document.getElementById('clipboard_object');
  proxy.value = text;
  proxy.select();
  document.execCommand("copy");
}

CreateLink.prototype.readFormats = function () {
  var formats;
  try {
    formats = JSON.parse( localStorage.format_preferences );
  } catch(e) {
  }
  if ( !formats ) {
    formats = CreateLink.default_formats;
  }
  return formats;
}
function escapeHTML(text) {
  return text ? text.replace(/[&<>'"]/g, convertHTMLChar) : text;
}
function convertHTMLChar(c) { return charMap[c]; }
var charMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&apos;',
  '"': '&quot;'
};
function showPrompt(text, pos, subject) {
  var msg = "Please enter the input text for \n" + subject;
  var s = window.prompt(msg);
  return (s === null) ? "" : s;
}

function sendMessageToTab(tabId, message) {
  return _.Deferred(function (d) {
    chrome.tabs.sendMessage(tabId, message, function (res) {
      d.resolve(res);
    });
  });
}

CreateLink.prototype.format = function (formatId) {
  return this.formats[formatId];
}
CreateLink.prototype.formatLinkText = function (formatId, url, text, title, tabId) {
  var d;

  var def = this.format(formatId);
  var data = def.format.
    replace(/%url%/g, url).
    replace(/%text%/g, text.replace(/\n/g, ' ')).
    replace(/%text_n%/g, text).
    replace(/%text_br%/g, text.replace(/\n/g, '<br />\n')).
    replace(/%text_md%/g, text.replace(/[|\\`*_{}\[\]()#+\-.!]/g, '\\$&')).
    replace(/%title%/g, title).
    replace(/%newline%/g, '\n').
    replace(/%htmlEscapedText%/g, escapeHTML(text)).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');
  
  var m = data.match(/%input%/g);
  if (m) {
    var inputDeferreds = m.map(function () {
      return sendMessageToTab(tabId, 'showInputDialog');
    });
    d = _.when.apply(_, inputDeferreds).pipe(function () {
      var inputs = _.toArray(arguments);
      var index = 0;
      data = data.replace(/%input%/g, function (s) {
        return inputs[index++];
      });
      return data;
    });
  } else {
    d = _.Deferred().resolve(data);
  }

  d.pipe(function (data) {
    if (def.filter) {
      var m = def.filter.match(/^s\/(.+?)\/(.*?)\/(\w*)$/);
      if (m) {
        data = data.replace(m[1], m[2]);
      }
    }
    return data;
  });

  return d;
}

function instance() {
	if ( !window.__instance ) {
		window.__instance = new CreateLink();
	}
	return window.__instance;
}

function onMenuItemClick(contextMenuIdList, info, tab) {
  var url;
  if (info.mediaType === 'image') {
    url = info.srcUrl;
  } else {
    url = info.linkUrl ||  info.pageUrl;
  }
  var text = info.selectionText || tab.title;
  var title = tab.title;

  var formatId = contextMenuIdList[info.menuItemId];
  instance().formatLinkText(formatId, url, text, title, tab.id).pipe(function (linkText) {
    instance().copyToClipboard(linkText);
  });
}

function updateContextMenus() {
  var contextMenuIdList = {};

  chrome.contextMenus.removeAll();

  var formats = instance().formats;
  if (formats.length == 1) {
    chrome.contextMenus.create({
      "title": "Copy Link as " + formats[0].label,
      "id": "context-menu-item-0",
      "contexts": ["all"],
    });
  } else {
    for (var i = 0; i < formats.length; ++i) {
      var menuId = chrome.contextMenus.create({
        "title": formats[i].label,
        "id": "context-menu-item-" + i,
        "contexts": ["all"],
      });
      contextMenuIdList[menuId] = i;
    }
  }

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var n = Number(info.menuItemId.split(/-/).pop());
    onMenuItemClick(contextMenuIdList, info, tab);
  })
}

window.addEventListener('load', function () {
  updateContextMenus();
  
  document.addEventListener('copy', function (ev) {
    ev.preventDefault();

    var proxy = document.getElementById('clipboard_object');
    var text = proxy.value;
    ev.clipboardData.setData("text/plain", text);
    ev.clipboardData.setData("text/html", text);
  }, true);
}, false);
