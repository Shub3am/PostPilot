// Browser Automation to post on LinkedIn
// This script will be injected into the LinkedIn post creation page to automate the posting process.

import type { historyItem } from "../../../utils/types";
import { delay, waitForElement } from "../../../utils/utils";
import { waitForEditor } from "./helper";

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "RUN_LINKEDIN_TEST") {
    checkLinkedinConnection();
  }
  if (message.type === "POST_LINKEDIN") {
    postLinkedin(message.payload);
  }
});

async function checkLinkedinConnection() {
  const profile_name = document
    .querySelector(".profile-card-name")
    ?.textContent?.trim();
  const profile_image = document.querySelector(
    ".profile-card-profile-picture",
  ) as HTMLImageElement | null;

  chrome.runtime.sendMessage({
    type: "LINKEDIN_CONNECTION_CHECK_DONE",
    payload: {
      profile_name,
      profile_image: profile_image?.src,
      status:
        profile_name && profile_image?.src ? "connected" : "not_connected",
    },
  });
}

async function postLinkedin(post: historyItem) {
  const { title, content, tags, image } = post;

  const topBar = document.querySelector(".share-box-feed-entry__top-bar");

  if (!topBar) return console.error("Post widget not found");

  const startBtn = topBar.querySelector("button");

  if (!startBtn) return console.error("Start button not found");

  startBtn.click();

  const editor = await waitForEditor();

  editor.focus();
  editor.click();

  if (image) {
    const res = await fetch(image);
    const blob = await res.blob();

    const file = new File([blob], "post-image.jpg", {
      type: blob.type,
    });

    const dt = new DataTransfer();
    dt.items.add(file);

    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dt,
    });

    editor.dispatchEvent(pasteEvent);

    await new Promise((r) => setTimeout(r, 1000));
  }

  const hashtagString = tags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");

  const finalText = `${title}

${content}

${hashtagString}`;

  editor.focus();
  document.execCommand("insertText", false, finalText);
  await delay(1000);
  await waitForElement(".share-box_actions");

  const postActions = document.querySelector(".share-box_actions");

  if (!postActions) {
    console.error("Post actions not found");
    return;
  }

  const postBtn = postActions.querySelector("button");

  if (!postBtn) {
    console.error("Post button not found");
    return;
  }

  (postBtn as HTMLButtonElement).click();
  chrome.runtime.sendMessage({
    type: "LINKEDIN_POST_DONE",
    payload: post,
  });
}
