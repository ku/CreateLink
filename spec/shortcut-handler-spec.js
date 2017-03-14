
const utils = require("../src/utils")
const ShortcutHandler = require('../src/shortcut-handler.js')
const CreateLink = require('../src/createlink.js')

describe("ShortcutHandler", () => {
  var handler = null
  var createLink = null
  var broker = null

  beforeEach( () => {
    broker = {
      sendMessage: jasmine.createSpy('sendMessage').and.callFake( (msg, tab, cb) => {
        cb({formatName: 'HTML'})
      })
    }

    createLink = new CreateLink()
    handler = new ShortcutHandler(broker)
  })

  describe(".onKeyboardShortcut", () => {
    let tab = {id: 10}
    beforeEach( () => {
      spyOn(utils, 'getCurrentTab').and.returnValue(Promise.resolve(tab))
      spyOn(handler, 'flashBadge')
    })
    it('updates clipboard', (done) => {
      handler.onKeyboardShortcut('current-tab-link')
      setTimeout( () => {
        expect(broker.sendMessage.calls.count()).toEqual(1)
        expect(broker.sendMessage).toHaveBeenCalledWith({
          request: 'copyInFormat',
          format: -1,
        }, tab, jasmine.any(Function))

        expect(handler.flashBadge).toHaveBeenCalledWith('success', 'HTML')
        done()
      }, 0)
    })
  })
})
