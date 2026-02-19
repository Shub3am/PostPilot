// Browser Automation to post on Twitter
// This script will be injected into the Twitter post creation page to automate the posting process.

import { waitForElement } from "../../../utils/utils";

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "RUN_TWITTER_TEST") {
    checkTwitterConnection();
  }
});

async function checkTwitterConnection() {
  try {
    const profileBtn = document.querySelector("[aria-label='Profile']");

    if (profileBtn) {
      (profileBtn as HTMLElement).click();
      await waitForElement("[data-testid='UserName']");
      await waitForElement('[data-testid="UserAvatar-Container-Shubh3m"] img');
    } else {
      throw new Error("Profile button not found");
    }

    const profile_name =
      document
        .querySelector('[data-testid="UserName"]')
        ?.textContent?.split("@")
        .join("/") || null;

    const profile_image =
      document
        .querySelector('[data-testid="UserAvatar-Container-Shubh3m"] img')
        ?.getAttribute("src") || null;
    const lazy_click: HTMLElement | null = document.querySelector(
      '[data-testid="UserAvatar-Container-Shubh3m"] img',
    );
    lazy_click?.click();

    chrome.runtime.sendMessage({
      type: "TWITTER_CONNECTION_CHECK_DONE",
      payload: {
        profile_name,
        profile_image,
        status: profile_name && profile_image ? "connected" : "not_connected",
      },
    });
  } catch (error) {
    console.error("Error checking Twitter connection:", error);
    chrome.runtime.sendMessage({
      type: "TWITTER_CONNECTION_CHECK_DONE",
      payload: {
        profile_name: null,
        profile_image: null,
        status: "not_connected",
      },
    });
  }
}

// //const editor = document.querySelector(
//   ".public-DraftEditor-content"
// ) as HTMLElement | null;

// if (editor) {
//   editor.focus();
//   document.execCommand("insertText", false, "feqfq");
// }
