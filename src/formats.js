
const formatsKey = 'format_preferences';
const defaultFormatKey = 'defaultFormat';

class Format {
  async load() {
    return Promise.all([
      new Promise(resolve => {
        chrome.storage.sync.get(defaultFormatKey, (v) => {
          this.defaultFormatName = (v[defaultFormatKey] || "Plain text")
          resolve(this.defaultFormatName)
        })
      }),
      new Promise(resolve => {
        chrome.storage.sync.get(formatsKey, (v) => {
          this.formats = (v[formatsKey] || [
            { label: "Plain text", format: '%text% %url%' },
            { label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
            { label: "markdown", format: '[%text_md%](%url%)' },
            { label: "mediaWiki", format: '[%url% %text%]' },
          ])
          resolve(this.formats)
        })
      })
    ])
  }

  setDefaultFormatName(value) {
    this.defaultFormatName = value
    chrome.storage.sync.set({
      [defaultFormatKey]: value
    });
  };

  getDefaultFormatName() {
    return this.defaultFormatName
  }

  getDefaultFormat() {
    const found = this.formats.find(f => {
      return f.label === this.defaultFormatName
    })
    return found || this.formats[0]
  }
  getFormats() {
    return this.formats
  }
  format(index) {
    return this.formats[index]
  }


  setFormats(formats) {
    this.formats = formats
    chrome.storage.sync.set({
      [formatsKey]: formats
    });
  };
}

const f = new Format()
module.exports = f
