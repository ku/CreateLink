
import { getCurrentTab } from './utils'
import { MessageBroker } from './message-broker'

export class ShortcutHandler {
  broker: MessageBroker
  constructor(broker: MessageBroker) {
    this.broker = broker
  }

  initialize() {
    console.log('initializing ShortcutHandler')
    chrome.commands.onCommand.addListener(this.onKeyboardShortcut.bind(this))
  }

  onKeyboardShortcut(command: string) {
    switch (command) {
      case 'current-tab-link':
        getCurrentTab().then( (tab) => {
          this.broker.sendMessage({
            type: 'copyInFormat',
          }, (response) => {
            if (response) {
              this.flashBadge('success', response.text);
            } else {
              // User has never set the default or else the previously-defaulted
              //  format was probably removed, so let user know,
              //  but don't automatically reset the default for her/him
              this.flashBadge('fail', '')
            }
          });
        });
        break;
    }
  }

  flashBadge(type: string, text: string) {
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

    chrome.action.setBadgeText({
      "text": text
    });

    chrome.action.setBadgeBackgroundColor({
      "color": color
    });

    function clearBadge(type: string, text: string) {
      chrome.action.setBadgeText({
        text: ""
      });

      chrome.action.setBadgeBackgroundColor({
        color: [0, 0, 0, 255] // opaque
      });
    }

    setTimeout(clearBadge, 1500);
  }
}
