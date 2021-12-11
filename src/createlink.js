
const utils = require('./utils')
const fmt = require('./formats')

class CreateLink {
  constructor() {
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

  formatLinkText(def, url, text, title, inputs) {
    text = text || ''

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

  async formatInTab(def, info, tab) {
    var url;
    if (info.mediaType === 'image') {
      url = info.srcUrl;
    } else {
      url = info.linkUrl || info.pageUrl || tab.url;
    }
    var text = info.selectionText || tab.title;
    var title = tab.title;

    return this.formatString(tab.id, def, url, text, title)
  }

  async formatString(tabId, def, url, text, title) {
    const inputs = await this.getInputs(def, tabId)
    const linkText = this.formatLinkText(def, url, text, title, inputs)
    return this.applyFilter(tabId, def, linkText)
  }

  indexOfFormatByLabel(label) {
    const formats = fmt.getFormats();
    for (var i = 0, len = formats.length; i < len; i++) {
      var item = formats[i];
      if (item.label === label) {
        return i;
      }
    }
    // use plain text as default format.
    return 1;
  };
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

module.exports = CreateLink
