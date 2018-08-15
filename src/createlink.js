
const utils = require('./utils')

class CreateLink {
  get formats() {
    return this.readFormats();
  }

  applyFilter(tabId, def, data) {
    if (def.filter) {
      var m = def.filter.match(/^s\/(.+?)\/(.*?)\/(\w*)$/);
      if (m) {
        var r = new RegExp(m[1], m[3]);
        data = data.replace(r, m[2]);
      } else {
        return utils.sendMessageToTab(tabId, {type: 'evaluateFilter', code: def.filter, string: data})
      }
    }
    return Promise.resolve(data);
  }

  formatLinkText(def, url, text, textonly, title, inputs) {
    text = text || ''
    textonly = textonly || ''

    var data = def.format.
      replace(/%url%/g, url).
      replace(/%text%/g, text.replace(/\n/g, ' ')).
      replace(/%textonly%/g, textonly.replace(/\n/g, ' ')).
      // TODO: allow customizing instead of hardcoding, eg using regex replace
      replace(/%onnonemptyselection%/g, textonly == "" ? "" : " TITLE: ").
      replace(/%text_n%/g, text).
      replace(/%text_br%/g, text.replace(/\n/g, '<br />\n')).
      replace(/%text_md%/g, text.replace(/[|\\`*_{}\[\]()#+\-.!]/g, '\\$&')).
      replace(/%title%/g, title).
      replace(/%newline%/g, '\n').
      replace(/%htmlEscapedText%/g, escapeHTML(text)).
      replace(/\\t/g, '\t').
      replace(/\\n/g, '\n').
      replace(/\\r/g, '\r');

    let index = 0
    return data.replace(/%input%/g, (s) => {
      return inputs[index++]
    })
  }

  getInputs(def, tabId) {
    const m = def.format.match(/%input%/g)
    if (m) {
      return Promise.all( m.map( () => {
        return utils.showInputDialog(tabId)
      }) )
    } else {
      return Promise.resolve([])
    }
  }

  formatInTab(formatId, info, tab) {
    var url;
    if (info.mediaType === 'image') {
      url = info.srcUrl;
    } else {
      url = info.linkUrl || info.pageUrl || tab.url;
    }
    var text = info.selectionText || tab.title;
    var textonly = info.selectionText;
    var title = tab.title;

    var def = this.formats[formatId]
    return this.formatString(tab.id, def, url, text, textonly, title)
  }

  formatString(tabId, def, url, text, textonly, title) {
    return this.getInputs(def, tabId).then( (inputs) => {
      const linkText = this.formatLinkText(def, url, text, textonly, title, inputs)
      return this.applyFilter(tabId, def, linkText)
    })
  }

  copyToClipboard(text) {
    const backgroundPage = chrome.extension.getBackgroundPage()
    let textarea = document.getElementById('clipboard_object');
    if (!textarea) {
      textarea = backgroundPage.document.createElement('textarea')
      textarea.setAttribute('id', 'clipboard_object')
      backgroundPage.document.body.appendChild(textarea)
    }
    textarea.value = text;
    textarea.select();
    document.execCommand("copy");
  }

  setDefaultFormat(value) {
    localStorage[defaultFormatKey] = value;
  };

  getDefaultFormat() {
    return localStorage[defaultFormatKey];
  };

  getDefaultFormatId() {
    const formatName = this.getDefaultFormat()
    return this.indexOfFormatByLabel(formatName);
  }

  setFormatPreferences(formatsString) {
    localStorage[formatPreferencesKey] = formatsString;
  };

  getFormatPreferences() {
    return JSON.parse(localStorage[formatPreferencesKey] || '[]');
  };

  readFormats() {
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
  indexOfFormatByLabel(label) {
    var formats = this.formats;
    for (var i = 0, len = formats.length; i < len; i++) {
      var item = formats[i];
      if (item.label === label) {
        return i;
      }
    }
    return -1;
  };
  static defaultFormats() {
    return CreateLink.default_formats
  }
}

var formatPreferencesKey = 'format_preferences';
var defaultFormatKey = 'defaultFormat';

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

CreateLink.default_formats = [
    {label: "Plain text", format: '%text% %url%' },
    {label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
    {label: "markdown", format: '[%text_md%](%url%)' },
    {label: "mediaWiki", format: '[%url% %text%]' },
];

module.exports = CreateLink
