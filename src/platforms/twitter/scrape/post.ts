// Browser Automation to post on Twitter
// This script will be injected into the Twitter post creation page to automate the posting process.

import { waitForElement } from "../../../utils/utils";
import { delay } from "../../../utils/utils";
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "RUN_TWITTER_TEST":
      checkTwitterConnection();
      break;
    case "POST_TWITTER":
      postToTwitter(message.payload);
      break;
    default:
      break;
  }
});

async function postToTwitter(post: {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
}) {
  const { title, content, tags, image } = post;

  await waitForElement('div[role="textbox"][contenteditable="true"]');
  const editor = document.querySelector(
    'div[role="textbox"][contenteditable="true"]',
  ) as HTMLElement | null;

  if (!editor) return console.error("Editor not found");

  let finalText =
    (title ? title + "\n\n" : "") +
    (content ? content + "\n\n" : "") +
    (tags.length ? tags.map((t) => "#" + t).join(" ") : "");

  finalText = finalText.trim();

  // Focus and clear
  editor.focus();
  editor.click();

  // Use execCommand to insert text — this fires the right React synthetic events
  document.execCommand("selectAll", false, undefined);
  document.execCommand("delete", false, undefined);

  // Insert text via clipboard (most reliable method for React-controlled editors)
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", finalText);

  const pasteEvent = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    clipboardData,
  });

  editor.dispatchEvent(pasteEvent);
  await delay(300);

  // If paste didn't work, fall back to execCommand insertText
  if (!editor.textContent?.includes(finalText.slice(0, 20))) {
    document.execCommand("selectAll", false, undefined);
    document.execCommand("delete", false, undefined);
    document.execCommand("insertText", false, finalText);
  }

  if (image) {
    const res = await fetch(image);
    const blob = await res.blob();
    const file = new File([blob], "tweet-image.jpg", { type: blob.type });

    const dt = new DataTransfer();
    dt.items.add(file);

    editor.focus();
    editor.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      }),
    );
    await delay(1500);
  }
  const postButton = document.querySelector(
    'button[data-testid="tweetButton"]',
  ) as HTMLButtonElement | null;
  if (!postButton) {
    console.error("Post button not found");
    return;
  }
  postButton.click();
  await delay(2000);
  chrome.runtime.sendMessage({
    type: "TWITTER_POST_DONE",
    payload: post,
  });
}

async function checkTwitterConnection() {
  try {
    const profileBtn = document.querySelector("[aria-label='Profile']");

    if (profileBtn) {
      (profileBtn as HTMLElement).click();
      await waitForElement("[data-testid='UserName']");
    } else {
      throw new Error("Profile button not found");
    }

    const profile_name =
      document
        .querySelector('[data-testid="UserName"]')
        ?.textContent?.split("@")
        .join("/") || null;
    const profileImageSelectorClass = `[data-testid="UserAvatar-Container-${profile_name?.split("/")[1]}"] img`;
    await waitForElement(profileImageSelectorClass);

    const profile_image =
      document.querySelector(profileImageSelectorClass)?.getAttribute("src") ||
      null;
    const lazy_click: HTMLElement | null = document.querySelector(
      profileImageSelectorClass,
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
