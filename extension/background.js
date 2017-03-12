function getCurrentTab(callback) {
  chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
    active: true
  }, function (tabs) {
    callback(tabs[0]);
  });
}

function flashBadge(type, text) {
  // Taken from https://github.com/chitsaou/copy-as-markdown/
  var color;

  switch (type) {
    case "success":
      color = "#738a05";
      break;
    case "fail":
      color = "#d11b24";
      text = "!";
      break;
    default:
      return; // don't know what it is. quit.
  }

  chrome.browserAction.setBadgeText({
    "text": text
  });

  chrome.browserAction.setBadgeBackgroundColor({
    "color": color
  });

  function clearBadge(type, text) {
    chrome.browserAction.setBadgeText({
      text: ""
    });

    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 255] // opaque
    });
  }

  setTimeout(clearBadge, 1500);
}

chrome.commands.onCommand.addListener(onKeyboardShortcut);

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

var formatPreferencesKey = 'format_preferences';
var defaultFormatKey = 'defaultFormat';

CreateLink.prototype.setDefaultFormat = function (value) {
  localStorage[defaultFormatKey] = value;
};

CreateLink.prototype.getDefaultFormat = function () {
  return localStorage[defaultFormatKey];
};

CreateLink.prototype.setFormatPreferences = function (formatsString) {
  localStorage[formatPreferencesKey] = formatsString;
};

CreateLink.prototype.getFormatPreferences = function () {
  return JSON.parse(localStorage[formatPreferencesKey] || '[]');
};

CreateLink.prototype.readFormats = function () {
  var formats;
  try {
    formats = this.getFormatPreferences();
  } catch(e) {
  }
  if ( !formats || formats.length == 0 ) {
    formats = CreateLink.default_formats;
  }
  return formats;
};

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
  return new Promise(function (resolve) {
    chrome.tabs.sendMessage(tabId, message, function (res) {
      resolve(res);
    });
  });
}

CreateLink.prototype.indexOfFormatByLabel = function (label) {
  var formats = this.formats;
  for (var i = 0, len = formats.length; i < len; i++) {
    var item = formats[i];
    if (item.label === label) {
      return i;
    }
  }
  return -1;
};
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
    var inputPromises = m.map(function () {
      return sendMessageToTab(tabId, {type: 'showInputDialog'});
    });
    d = Promise.all(inputPromises).then(function () {
      var inputs = _.toArray(arguments);
      var index = 0;
      data = data.replace(/%input%/g, function (s) {
        return inputs[index++];
      });
      return data;
    });
  } else {
    d = Promise.resolve(data);
  }

  d = d.then(function (data) {
    if (def.filter) {
      var m = def.filter.match(/^s\/(.+?)\/(.*?)\/(\w*)$/);
      if (m) {
        var r = new RegExp(m[1], m[3]);
        data = data.replace(r, m[2]);
      } else {
        return sendMessageToTab(tabId, {type: 'evaluateFilter', code: def.filter, string: data})
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

function onMenuItemClick(formatId, info, tab) {
  var url;
  if (info.mediaType === 'image') {
    url = info.srcUrl;
  } else {
    url = info.linkUrl || info.pageUrl || tab.url;
  }
  var text = info.selectionText || tab.title;
  var title = tab.title;

  instance().formatLinkText(formatId, url, text, title, tab.id).then(function (linkText) {
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
    var formatId = contextMenuIdList[info.menuItemId];
    onMenuItemClick(formatId, info, tab);
  })
}

function onKeyboardShortcut(command) {
  switch (command) {
    case 'current-tab-link':
      getCurrentTab(function (tab) {
        var target = instance();
        var label = target.getDefaultFormat();
        var formatId = target.indexOfFormatByLabel(label);
        if (formatId >= 0) {
          var info = {};
          onMenuItemClick(formatId, info, tab);
          flashBadge('success', label);
        } else {
          // User has never set the default or else the previously-defaulted
          //  format was probably removed, so let user know,
          //  but don't automatically reset the default for her/him
          flashBadge('fail');
        }
      });
      break;
  }
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
