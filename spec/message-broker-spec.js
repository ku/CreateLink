

const utils = require('../src/utils')
const CreateLink = require('../src/createlink')
const MessageBroker = require('../src/message-broker')

describe("MessageBroker", () => {
  let broker = null
  let createLink = null
  let cb = null
  let tab = {
    id: 10,
    title: "jake the dog",
    url: "http://example.com/"
  }

  beforeEach( () => {
    createLink = new CreateLink()
    //createLink.copyToClipboard = () => {}
    spyOn(createLink, 'copyToClipboard').and.returnValue()
    broker = new MessageBroker(createLink)
    cb = jasmine.createSpy('sendResponse')
  })
  describe('onCopyInFormat', () => {
    beforeEach( () => {
    })
    describe('called by context menu', () => {
      describe('if the target is A tag', () => {
        it('uses a.href as url', (done) => {
          broker.onCopyInFormat({
            format: 1,
            info: {
              "pageUrl": "http://example.com/",
              "linkUrl": "http://example.com/next.html"
            }
          }, {tab: tab}, cb)

          setTimeout( () => {
            expect(createLink.copyToClipboard).toHaveBeenCalledWith(`<a href="http://example.com/next.html">jake the dog</a>`)
            expect(cb).toHaveBeenCalledWith({formatName: 'HTML'})
            done()
          }, 0)
        })
      })
      describe('if the target is IMG tag', () => {
        it('uses image url as url', (done) => {
          broker.onCopyInFormat({
            format: 1,
            info: {
              "mediaType": "image",
              "pageUrl": "http://example.com/",
              "srcUrl": "http://example.com/jake.jpg"
            }
          }, {tab: tab}, cb)

          setTimeout( () => {
            expect(createLink.copyToClipboard).toHaveBeenCalledWith(`<a href="http://example.com/jake.jpg">jake the dog</a>`)
            expect(cb).toHaveBeenCalledWith({formatName: 'HTML'})
            done()
          }, 0)
        })
      })
      describe('otherwise', () => {
        it('uses title and page url', (done) => {
          broker.onCopyInFormat({
            format: 1,
            info: {
              "pageUrl": "http://example.com/",
            }
          }, {tab: tab}, cb)

          setTimeout( () => {
            expect(createLink.copyToClipboard).toHaveBeenCalledWith(`<a href="http://example.com/">jake the dog</a>`)
            expect(cb).toHaveBeenCalledWith({formatName: 'HTML'})
            done()
          }, 0)
        })
      })
      describe('with text selection', () => {
        it('uses title and page url', (done) => {
          spyOn(utils, 'getSelectionText').and.returnValue(Promise.resolve('selectedText'))
          broker.onCopyInFormat({
            format: 1,
          }, {tab: tab}, cb)

          setTimeout( () => {
            expect(createLink.copyToClipboard).toHaveBeenCalledWith(`<a href="http://example.com/">selectedText</a>`)
            expect(cb).toHaveBeenCalledWith({formatName: 'HTML'})
            done()
          }, 0)
        })
      })
    })
    describe('called by shortcut key', () => {
      describe('with text selection', () => {
        it('uses title and page url', (done) => {
          spyOn(createLink, 'getDefaultFormatId').and.returnValue(0)
          spyOn(utils, 'getSelectionText').and.returnValue(Promise.resolve('selectedText'))
          broker.onCopyInFormat({
            format: -1,
          }, {tab: tab}, cb)

          setTimeout( () => {
            expect(createLink.copyToClipboard).toHaveBeenCalledWith(`selectedText http://example.com/`)
            expect(cb).toHaveBeenCalledWith({formatName: 'Plain text'})
            done()
          }, 0)
        })
      })
    })
  })
})
