// Browser Automation to post on Dev.to
// This script will be injected into the Dev.to post creation page to automate the posting process.

chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message in content script:", message);
  if (message.type === "RUN_DEVTO_TEST") {
    checkDevtoConnection();
  }
});

async function checkDevtoConnection() {
  const profile_name =
    document
      .querySelector('[class*="profile"] [class*="name"]')
      ?.textContent?.trim() ||
    document.querySelector("h1")?.textContent?.trim();
  const profile_image = document.querySelector(
    '[class*="profile"] img',
  ) as HTMLImageElement | null;
  console.log("Dev.to profile name:", profile_name);
  console.log("Dev.to profile image:", profile_image?.src);
  chrome.runtime.sendMessage({
    type: "DEVTO_CONNECTION_CHECK_DONE",
    payload: {
      profile_name,
      profile_image: profile_image?.src,
      status:
        profile_name && profile_image?.src ? "connected" : "not_connected",
    },
  });
}
