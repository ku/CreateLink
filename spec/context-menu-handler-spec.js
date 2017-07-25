
const ContextMenuHandler = require('../src/context-menu-handler.js')
const utils = require('../src/utils')

describe("ContextMenuHandler", () => {
  const subject = () => {
    return new ContextMenuHandler()
  }

  describe(".onMessage", () => {
    describe("with request=updateFormats", () => {
      let n = 10
      beforeEach( () => {
        spyOn(chrome.contextMenus, 'removeAll')
        spyOn(chrome.contextMenus, 'create').and.callFake( _ => n++)
      })

      it("updates context menu items", () => {
        const subject = new ContextMenuHandler()
        const formats = [
            {label: 'first', format: 'format1'},
            {label: 'second', format: 'format2'},
          ]
        subject.onMessage({
          request: 'updateFormats',
          formats: JSON.stringify(formats)
        })

        expect(chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1)
        expect(chrome.contextMenus.create).toHaveBeenCalledWith({
          "title": "first",
          "id": "context-menu-item-0",
          "contexts": ["all"],
        })
        expect(chrome.contextMenus.create).toHaveBeenCalledWith({
          "title": "second",
          "id": "context-menu-item-1",
          "contexts": ["all"],
        })

        expect(formats[subject.formatIndexOfMenuItemId(10)]).toEqual(formats[0])
        expect(formats[subject.formatIndexOfMenuItemId(11)]).toEqual(formats[1])
      })
    })
  })
})
