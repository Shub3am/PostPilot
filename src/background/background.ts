/*
 * Background service worker
 * Handles message routing between content scripts and social media posting actions.
 */

import {
  checkLinkedinConnection,
  postedToLinkedin,
  postToLinkedin,
  testLinkedinConnection,
} from "./actions/linkedin";
import {
  checkTwitterConnection,
  postedToTwitter,
  postToTwitter,
  testTwitterConnection,
} from "./actions/twitter";

/*
 * @listens chrome.action.onClicked - Opens the extension page when the extension icon is clicked
 */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

/* 
This listener handles various message types related to checking connections, posting content, and more.

Message listener for communication between content scripts and the extension's background service worker.

*/
chrome.runtime.onMessage.addListener(
  (message, sender: chrome.runtime.MessageSender) => {
    switch (message.type) {
      case "TWITTER_CONNECTION_CHECK_DONE":
        checkTwitterConnection(message.payload, sender?.tab?.id);
        break;
      case "LINKEDIN_CONNECTION_CHECK_DONE":
        checkLinkedinConnection(message.payload, sender?.tab?.id);
        break;
      case "LINKEDIN_POST_DONE":
        postedToLinkedin(message.payload, sender?.tab?.id);
        break;
      case "TWITTER_POST_DONE":
        postedToTwitter(message.payload, sender?.tab?.id);
        break;

      case "CREATE_POST":
        postToLinkedin(message.payload);
        postToTwitter(message.payload);
        break;

      case "CHECK_TWITTER_CONNECTION":
        testTwitterConnection();
        break;
      case "CHECK_LINKEDIN_CONNECTION":
        testLinkedinConnection();
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  },
);
