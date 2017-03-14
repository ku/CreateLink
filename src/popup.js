
const PopupHandler = require('./popup-handler')

window.addEventListener("load", function () {
  const handler = new PopupHandler()
  handler.initialize()
}, false)

