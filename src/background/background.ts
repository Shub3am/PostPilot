// Background script for the PostPilot Chrome extension

// import { storage } from "../utils/storage";
import {
  checkLinkedinConnection,
  postedToLinkedin,
  postToLinkedin,
  testLinkedinConnection,
} from "./actions/linkedin";
import {
  checkTwitterConnection,
  postToTwitter,
  testTwitterConnection,
} from "./actions/twitter";

// Open the extension's main interface when the action icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    // Used for receiving connection check results from content scripts
    case "TWITTER_CONNECTION_CHECK_DONE":
      checkTwitterConnection(message.payload, sender?.tab?.id);
      break;
    case "LINKEDIN_CONNECTION_CHECK_DONE":
      checkLinkedinConnection(message.payload, sender?.tab?.id);
      break;
    case "LINKEDIN_POST_DONE":
      postedToLinkedin(message.payload, sender?.tab?.id);
      break;
    case "POST_TO_LINKEDIN":
      postToLinkedin(message.payload);
      break;
    case "POST_TO_TWITTER":
      postToTwitter(message.payload);
      break;
    // Used for checking connection status when user clicks on "Check Connection" button in the extension UI
    case "CHECK_TWITTER_CONNECTION":
      testTwitterConnection();
      break;
    case "CHECK_LINKEDIN_CONNECTION":
      testLinkedinConnection();
      break;
    default:
      console.warn("Unknown message type:", message.type);
  }
});
