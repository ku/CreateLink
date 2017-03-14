
const utils = require("./utils")

module.exports = class ShortcutHandler {
  constructor(broker) {
    this.broker = broker
  }

  initialize() {
    chrome.commands.onCommand.addListener(this.onKeyboardShortcut.bind(this))
  }

  onKeyboardShortcut(command) {
    switch (command) {
      case 'current-tab-link':
        utils.getCurrentTab().then( (tab) => {
          this.broker.sendMessage({
            request: 'copyInFormat',
            format: -1,
          }, tab, (response) => {
            if (response) {
              this.flashBadge('success', response.formatName);
            } else {
              // User has never set the default or else the previously-defaulted
              //  format was probably removed, so let user know,
              //  but don't automatically reset the default for her/him
              this.flashBadge('fail')
            }
          });
        });
        break;
    }
  }

  flashBadge(type, text) {
    // Taken from https://github.com/chitsaou/copy-as-markdown/
    var color;

    switch (type) {
      case "success":
        color = "#738a05";
        break;
      case "fail":
        color = "#d11b24";
        text = "!";
        break;
      default:
        return; // don't know what it is. quit.
    }

    chrome.browserAction.setBadgeText({
      "text": text
    });

    chrome.browserAction.setBadgeBackgroundColor({
      "color": color
    });

    function clearBadge(type, text) {
      chrome.browserAction.setBadgeText({
        text: ""
      });

      chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 0, 0, 255] // opaque
      });
    }

    setTimeout(clearBadge, 1500);
  }
}
