
const utils = require('../src/utils')

beforeEach( () => {
  createNotImplemented = (msg) => {
    return () => { chrome._notImplemented(`not implemented ${msg}`) }
  }

  // mock chrome
  (function () {
    //spyOn(utils, 'getSelectionText').and.returnValue(Promise.resolve('SelectedText'))
    //
    this.window = {
      open: null
    }
    this.chrome = {
      _notImplemented: console.error,
      runtime: {
        getBackgroundPage: createNotImplemented('getBackgroundPage'),
        sendMessage:       createNotImplemented('sendMessage'),
        onMessage: {
          addListener: createNotImplemented('addListener'),
        },
      },
      tabs: {
        create:      createNotImplemented('create'),
        sendMessage: createNotImplemented('sendMessage'),
        query:       createNotImplemented('query'),
      },
      windows: {
        getCurrent: createNotImplemented('getCurrent'),
      },
      contextMenus: {
        create: (params) => { return params.id },
        removeAll:  createNotImplemented('removeAll'),
        onClicked: {
          addListener: createNotImplemented('addListener')
        }
      },
    }
  })()
})

