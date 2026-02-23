/**
 * Medium content script for handling connection testing and post publishing
 * This script runs on Medium pages to interact with the platform
 */

import { delay, waitForElement } from "../../../utils/utils";

// This is specifically for the final publish step where Medium opens a new page with /submission in the URL to confirm and click publish. We need to listen for that page load to click the final publish button and confirm the post is published successfully.
const url = new URL(window.location.href);

if (
  url.pathname.includes("/submission") &&
  url.searchParams.get("submitType") === "publishing-post"
) {
  handleFinalPublish();
  checkForErrorAndNotify();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "RUN_MEDIUM_TEST":
      handleMediumConnectionTest();
      break;
    case "POST_MEDIUM":
      handleMediumPost(message.payload);
      break;
  }
});

/**
 * Tests the Medium connection by checking if the user is logged in
 * Looks for user profile information on the page
 */
async function handleMediumConnectionTest() {
  try {
    // TODO: Implement Medium profile detection
    // This is a placeholder - actual implementation will check for:
    // - User profile button
    // - Profile avatar/image
    // - Username in the DOM

    // Example selectors to check (need to be verified):
    // const profileButton = document.querySelector('[data-test-id="profile-button"]');
    // const userAvatar = document.querySelector('img[alt*="avatar"]');

    // For now, send a placeholder response
    if (window.location.href.includes("signin")) {
      throw new Error("User is not logged in to Medium.");
    }

    // This Finds Profile Button From Sidebar
    const span = [...document.querySelectorAll("span")].find(
      (el) => el.textContent.trim() === "Profile",
    );

    // Click its closest parent link to navigate to the profile page (if found)
    if (span) {
      const button = span.closest("a");
      if (button) button.click();
    }

    if (!window.location.href.includes("@")) {
      throw new Error(
        "unable to find profile information. Please ensure you are logged in and on your profile page.",
      );
    }
    await delay(1000); // Wait for profile page to load,
    const profileName: string = document
      .querySelector(".pw-author-name")
      ?.textContent?.trim();

    const profileTag: string = window.location.pathname.slice(1); // slices pathname:https://medium.com/@test to get @test from pathname: /@test

    const profileImage: string | null =
      document
        .querySelector(`img[alt='${profileName}']`)
        ?.getAttribute("src") ?? null;
    chrome.runtime.sendMessage({
      type: "MEDIUM_CONNECTION_CHECK_DONE",
      payload: {
        profile_name: `${profileName} (${profileTag})`,
        profile_image: profileImage || null,
        status: "connected",
      },
    });
  } catch (error) {
    console.error("Error testing Medium connection:", error);
    chrome.runtime.sendMessage({
      type: "MEDIUM_CONNECTION_CHECK_DONE",
      payload: {
        profile_name: undefined,
        profile_image: undefined,
        status: "not_connected",
      },
    });
  }
}

/**
 * Handles posting content to Medium
 * @param payload - The post data including title, content, tags, and optional image
 */
async function handleMediumPost(payload: {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
}) {
  try {
    const { title, content, tags, image } = payload;
    // TODO: Implement Medium posting logic
    // This is a placeholder - actual implementation will:
    // 1. Find the title input field
    // 2. Find the content editor (likely a contenteditable div)
    // 3. Insert the title
    // 4. Insert the content
    // 5. Add tags if supported
    // 6. Handle image upload if provided
    // 7. Click publish button
    // Navigate to new story page

    // Wait for the title editor to be available
    const titleEditor = await waitForElement(
      '[data-testid="editorTitleParagraph"]',
    );
    if (image) {
      (titleEditor as HTMLElement).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );

      await delay(500);

      const response = await fetch(image);
      const blob = await response.blob();

      const file = new File([blob], "image." + blob.type.split("/")[1], {
        type: blob.type,
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      });

      titleEditor.focus();
      titleEditor.dispatchEvent(pasteEvent);
    }
    (titleEditor as HTMLElement).click();
    titleEditor.textContent = title;
    await delay(500);

    // Click and insert title

    // Press Enter to move to content area
    titleEditor.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    await delay(500);

    // Wait for the content editor and insert content
    const contentEditor = await waitForElement(
      "[data-testid='editorParagraphText']",
    );
    (contentEditor as HTMLElement).click();
    await delay(500);
    contentEditor.textContent = content;
    contentEditor.textContent += `\n\n ${tags.map((tag) => `#${tag}`).join(", ")}`; //add hashtags to it // Add spacing after content

    await delay(2000);
    const prePublishBtn = await waitForElement(
      '[data-action-source="post_edit_prepublish"]',
    );
    (prePublishBtn as HTMLElement).click();
    await delay(1500);
    await waitForElement("button");
    console.log(window.location.href);
    let finalPublishButton: HTMLElement | undefined;

    while (!finalPublishButton) {
      await delay(500);

      finalPublishButton = [...document.querySelectorAll("button")].find(
        (btn) => btn.textContent.trim() === "Publish",
      ) as HTMLElement;
    }

    finalPublishButton.click();
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: "MEDIUM_POST_DONE",
        payload,
      });
    }, 1000);
  } catch (error) {
    console.error("Error posting to Medium:", error);
    throw error;
  }
}
async function handleFinalPublish() {
  console.log("On submission page — clicking final publish");

  // Wait until button appears
  let publishButton: HTMLElement | undefined;

  while (!publishButton) {
    await new Promise((r) => setTimeout(r, 500));

    publishButton = [...document.querySelectorAll("button")].find((btn) =>
      btn.textContent?.toLowerCase().includes("publish"),
    ) as HTMLElement;
  }

  publishButton.click();
  chrome.runtime.sendMessage({
    type: "MEDIUM_POST_DONE",
    payload: { message: null, isError: false },
  });
}
// This run until handleFinalPublish not calls runtime SendMessage, after sendMessage, the page closes automatically
async function checkForErrorAndNotify() {
  const errorElement = await waitForElement("div[role='alert']");
  if (errorElement) {
    const errorMessage = errorElement.textContent?.trim() || "Unknown error";
    chrome.runtime.sendMessage({
      type: "MEDIUM_POST_DONE",
      payload: { message: `From Medium: ${errorMessage}`, isError: true },
    });
  }
}
