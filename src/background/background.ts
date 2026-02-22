/*
 * Background service worker
 * Handles message routing between content scripts and social media posting actions.
 */

import { testDevtoConnection, postToDevto } from "./actions/devto";
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
import { showErrorNotification } from "../utils/utils";

/*
 * @listens chrome.action.onClicked - Opens the extension page when the extension icon is clicked
 */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

// Map of platform names to their corresponding post functions
const postFunctions: { [key: string]: Function } = {
  twitter: postToTwitter,
  linkedin: postToLinkedin,
  devto: postToDevto,
};

/**
 * Message listener for communication between content scripts and the extension background
 * Handles various message types for:
 * - Connection testing and verification for each platform
 * - Post completion notifications
 * - Creating and distributing posts to selected platforms
 */
/* 
This listener handles various message types related to checking connections, posting content, and more.

Message listener for communication between content scripts and the extension's background service worker.

*/
chrome.runtime.onMessage.addListener(
  async (message, sender: chrome.runtime.MessageSender) => {
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
        // Post to all selected platforms asynchronously
        message.payload.platforms.forEach(async (platform: string) => {
          const postFunction = postFunctions[platform.toLowerCase()];
          if (postFunction) {
            try {
              await postFunction(message.payload);
            } catch (error) {
              showErrorNotification(
                `Failed to post to ${platform}`,
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
              );
            }
          }
        });
        break;

      case "CHECK_TWITTER_CONNECTION":
        try {
          testTwitterConnection();
        } catch (error) {
          showErrorNotification(
            "Twitter Connection Failed",
            error instanceof Error
              ? error.message
              : "Failed to test Twitter connection",
          );
        }
        break;
      case "CHECK_LINKEDIN_CONNECTION":
        try {
          testLinkedinConnection();
        } catch (error) {
          showErrorNotification(
            "LinkedIn Connection Failed",
            error instanceof Error
              ? error.message
              : "Failed to test LinkedIn connection",
          );
        }
        break;
      case "CHECK_DEVTO_CONNECTION":
        try {
          await testDevtoConnection();
        } catch (error) {
          showErrorNotification(
            "Dev.to Connection Failed",
            error instanceof Error
              ? error.message
              : "Failed to test Dev.to connection",
          );
        }
        break;
      default:
        break;
    }
  },
);
