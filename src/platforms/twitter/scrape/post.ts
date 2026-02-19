// Browser Automation to post on Twitter
// This script will be injected into the Twitter post creation page to automate the posting process.

import { typeLikeUser, waitForElement } from "../../../utils/utils";
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
  await waitForElement('div[role="textbox"]');

  const editor = document.querySelector(
    'div[role="textbox"][contenteditable="true"]',
  ) as HTMLElement | null;

  if (!editor) return console.error("Editor not found");

  editor.focus();
  editor.click();
  if (image) {
    const res = await fetch(image);
    const blob = await res.blob();

    const file = new File([blob], "tweet-image.jpg", {
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

    // wait for twitter upload to initialize
    await new Promise((r) => setTimeout(r, 1200));
  }
  await delay(2000);
  const mainEditor = document.querySelector(
    'div[role="textbox"][contenteditable="true"]',
  ) as HTMLElement | null;
  mainEditor.focus();
  mainEditor.click();
  const finalText = `${title}

  ${content}

  ${tags.map((t) => `#${t}`).join(" ")}`;
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(mainEditor as Node);
  range.collapse(false);

  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand("insertText", false, finalText);
  // typeLikeUser(mainEditor as HTMLElement, finalText);

  // editor.textContent = "";
  // editor.dispatchEvent(
  //   new InputEvent("beforeinput", {
  //     bubbles: true,
  //     cancelable: true,
  //     inputType: "insertText",
  //     data: finalText,
  //   }),
  // );

  // editor.textContent = finalText;

  // editor.dispatchEvent(
  //   new InputEvent("input", {
  //     bubbles: true,
  //     inputType: "insertText",
  //     data: finalText,
  //   }),
  // );

  console.log("Inserted tweet content");
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
