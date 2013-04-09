var useNPAPI = false;

function copyToClipboard(text) {
  var proxy = document.getElementById('clipboard_object');
  if ( useNPAPI )
    proxy.set(text);
  else {
    proxy.value = text;
    proxy.select();
    document.execCommand("copy");
  }
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if ( request.command == 'setClipboard' ) {
      copyToClipboard(request.data);
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
    {label: "mediaWiki", format: '[%url% %text%]' },
];
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
CreateLink.prototype.formatLinkText = function (formatId, url, text, title) {
  var def = this.formats[formatId];
  var data = def.format.
    replace(/%url%/g, url).
    replace(/%text%/g, text.replace(/\n/g, ' ')).
    replace(/%text_n%/g, text).
    replace(/%text_br%/g, text.replace(/\n/g, '<br />\n')).
    replace(/%title%/g, title).
    replace(/%newline%/g, '\n').
    replace(/%htmlEscapedText%/g, escapeHTML(text)).
    // TODO: window.prompt does not respond in popup window.
    //replace(/%input%/g, showPrompt).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');
  chrome.extension.getBackgroundPage().console.log("def.filter")
  chrome.extension.getBackgroundPage().console.log(def.filter)
  if (def.filter) {
    var m = def.filter.match(/^s\/(.+?)\/(.*?)\/(\w*)$/);
    chrome.extension.getBackgroundPage().console.log(m)
    if (m) {
      data = data.replace(m[1], m[2]);
    }
  }
  return data;
}
	
function instance() {
	if ( !window.__instance ) {
		window.__instance = new CreateLink();
	}
	return window.__instance;
}

function onMenuItemClick(info, tab) {
	/*alert("info: " + JSON.stringify(info) + "\n" +
				"tab: " + JSON.stringify(tab));*/
	var formatId = contextMenuIdList[info.menuItemId];
	var url = info.linkUrl ? info.linkUrl : info.pageUrl;
	var text = info.selectionText ? info.selectionText : tab.title;
	var title = tab.title;
	var linkText = instance().formatLinkText(formatId, url, text, title);
	copyToClipboard(linkText);
}
var contextMenuIdList = {}
var formats =	instance().formats;
if (formats.length == 1) {
	chrome.contextMenus.create({"title": "Copy Link as " + formats[0].label,
								"contexts": ["all"],
								"onclick": onMenuItemClick});
} else {
	for (var i = 0; i < formats.length; ++i) {
		var menuId = chrome.contextMenus.create({"title": formats[i].label,
									"contexts": ["all"],
									"onclick": onMenuItemClick});
		contextMenuIdList[menuId] = i;
	}
}
