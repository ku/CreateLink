
const PopupHandler = require('../src/popup-handler.js')
const utils = require('../src/utils')

describe("PopupHandler", () => {
  describe(".onMenuSelected", () => {
    describe("with id = 'configure'", () => {
      beforeEach( () => {
        spyOn(chrome.tabs, 'create')
        window.close = jasmine.createSpy('close')
      })
      it("opens options page", () => {
        (new PopupHandler()).onMenuSelected(1, 'configure')
        expect(chrome.tabs.create).toHaveBeenCalledWith({url: 'options.html'})
        expect(window.close).toHaveBeenCalled()
      })
    })
    describe("with id = 'separator'", () => {
      beforeEach( () => {
        window.close = jasmine.createSpy('close')
      })
      it("closes itself", () => {
        (new PopupHandler()).onMenuSelected(1, 'separator')
        expect(window.close).toHaveBeenCalled()
      })
    })

    describe("with id = 'item0'", () => {
      var handler = null
      var formatIndex = 2
      var tabId = 1
      var tab = {id: tabId, selected: true, url: 'http://example.com/', title: 'pageTitle'}

      beforeEach( () => {
        window.close = jasmine.createSpy('close')
        spyOn(utils, 'getCurrentTab').and.returnValue(tab)
        spyOn(chrome.runtime, 'sendMessage').and.callFake( (params, cb) => {
          return cb()
        })
        handler = new PopupHandler()
      })

      it("updates clipboard", (done) => {
        handler.onMenuSelected(tab, `item${formatIndex}`)
        setTimeout(() => {
          expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
            request: 'copyInFormat',
            format: formatIndex,
          }, jasmine.any(Function))
          expect(window.close).toHaveBeenCalled()
          done()
        }, 0)
      })
    })
  })
})
