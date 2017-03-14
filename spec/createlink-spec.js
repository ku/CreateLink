
const utils = require('../src/utils')
const CreateLink = require('../src/createlink')

describe("CreateLink", () => {
  var createLink = null
  beforeEach( () => {
    createLink = new CreateLink()
  })

  describe(".formats", () => {
    it('returns default formats', () => {
      expect(createLink.formats).toEqual(CreateLink.default_formats)
    })
  })

  describe(".formatInTab", () => {
    var formatId = 0
    var tab = {id: 1, url: 'http://example.com/', title: 'pageTitle'}

    beforeEach( () => {
      spyOn(utils, 'sendMessageToTab').and.returnValue(Promise.resolve(''))
    })

    it("updates clipboard", (done) => {
      const info = {}
      createLink.formatInTab(formatId, info, tab).then( (linkText) => {
        expect(linkText).toEqual('pageTitle http://example.com/')
        done()
      })
    })

    describe('with selection', () => {
      beforeEach( () => {
        spyOn(createLink, 'readFormats').and.returnValue([
          {label: "test", format: '%text% %url% %title%' },
        ])
      })
      it("uses selected text", (done) => {
        const info = {selectionText: 'selectedText'}
        createLink.formatInTab(formatId, info, tab).then( (linkText) => {
          expect(linkText).toEqual('selectedText http://example.com/ pageTitle')
          done()
        })
      })
    })

    describe('with inputs', () => {
      beforeEach( () => {
        spyOn(createLink, 'readFormats').and.returnValue([
          {label: "test", format: '%title% %input% %input%' },
        ])
        var count = 0
        spyOn(utils, 'showInputDialog').and.callFake( () => {
          return Promise.resolve('i' + (++count))
        })
      })
      it("prompts and uses inputs", (done) => {
        const info = {}
        createLink.formatInTab(formatId, info, tab).then( (linkText) => {
          expect(utils.showInputDialog).toHaveBeenCalledTimes(2)
          expect(linkText).toEqual('pageTitle i1 i2')
          done()
        })
      })
    })
  })

  describe(".formatLinkText", () => {
    var title = 'pageTitle'
    var url = 'http://example.com/'
    it("replaces %url%", () => {
      var t = createLink.formatLinkText({format: "%url%"}, url, undefined, title, [])
      expect(t).toEqual(url)
    })
    it("replaces %text%", () => {
      var t = createLink.formatLinkText({format: "%text%"}, url, "ONE\nTWO", title, [])
      expect(t).toEqual("ONE TWO")
    })
    xit("replaces %text_n%", () => {})
    xit("replaces %text_br%", () => {})
    xit("replaces %text_md%", () => {})
    it("replaces %title%", () => {
      var t = createLink.formatLinkText({format: "%title%"}, url, undefined, title, [])
      expect(t).toEqual(title)
    })
    xit("replaces %newline%", () => {})
    xit("replaces %htmlEscapedText%", () => {})
    it("replaces \t\r\n", () => {
      var t = createLink.formatLinkText({format: "\\t\\r\\n"}, url, undefined, title, [])
      expect(t).toEqual("\t\r\n")
    })
  })
})
