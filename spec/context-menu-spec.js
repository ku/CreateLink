
const utils = require('../src/utils')
const CreateLink = require('../src/createlink')
const ContextMenuHandler = require('../src/context-menu-handler')

describe("ContextMenuHandler", () => {
  var handler = null
  var broker = null

  beforeEach( () => {
    broker = {
      sendMessage: jasmine.createSpy('sendMessage')
    }
    handler = new ContextMenuHandler(broker)
  })

  describe('onMenuItemClicked', () => {
    it('sends message', (done) => {
      spyOn(handler, 'formatIndexOfMenuItemId').and.returnValue(1)
      const info = { "pageUrl": "http://example.com/", menuItemId: "context-menu-item-1", selectedText: 'selectedText' }
      const tab = { id: 10 }
      handler.onMenuItemClicked(info, tab)
      setTimeout( () => {
        expect(broker.sendMessage).toHaveBeenCalledWith({
          request: 'copyInFormat',
          format: 1,
          info: info,
        }, tab)
        done()
      }, 0)
    })
  })

  describe('initialize', () => {
    it('initializes events and menu items', () => {
      spyOn(chrome.contextMenus, 'create').and.callThrough()
      spyOn(chrome.contextMenus, 'removeAll')
      spyOn(chrome.contextMenus.onClicked, 'addListener')
      spyOn(chrome.runtime.onMessage, 'addListener')

      handler.initialize(CreateLink.defaultFormats())

      expect(chrome.contextMenus.removeAll).toHaveBeenCalled()
      expect(chrome.contextMenus.onClicked.addListener).toHaveBeenCalled()
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled()
      expect(chrome.contextMenus.create.calls.count()).toEqual(4)
      expect(handler)
    })
  })

  describe('formatIndexOfMenuItemId', () => {
    it('initializes events and menu items', () => {
      spyOn(chrome, '_notImplemented').and.callFake( () => {})
      handler.initialize(CreateLink.defaultFormats())
      expect(handler.formatIndexOfMenuItemId("context-menu-item-1")).toEqual(1)
    })
  })
})
