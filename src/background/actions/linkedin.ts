import { storage } from "../../utils/storage";

/**
 * Tests the LinkedIn connection by opening a LinkedIn tab and sending a test message
 * Creates a new tab, waits for it to load, then sends a message to run the connection test
 */
export function testLinkedinConnection() {
  chrome.tabs.create(
    {
      url: "https://www.linkedin.com/feed",
      active: false,
    },
    (tab) => {
      if (!tab.id) {
        return;
      }
      const tabId = tab.id;
      const listener = (listenerId: number, info: { status?: string }) => {
        if (listenerId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              type: "RUN_LINKEDIN_TEST",
            });
          }, 1000);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    },
  );
}

/**
 * Posts content to LinkedIn by opening the feed and sending post data to the content script
 * @param post - The post data including title, content, tags, and optional image
 */
export async function postToLinkedin(post: {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
}) {
  chrome.tabs.create(
    {
      url: "https://www.linkedin.com/feed",
      active: false,
    },
    (tab) => {
      if (!tab.id) {
        return;
      }
      const tabId = tab.id;
      const listener = (listenerId: number, info: { status?: string }) => {
        if (listenerId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              type: "POST_LINKEDIN",
              payload: post,
            });
          }, 1000);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    },
  );
}

/**
 * Updates the LinkedIn connection status in storage after a connection check
 * @param payload - Connection status data including profile name, image, and status
 * @param tabId - Optional tab ID to close after the check completes
 */
export async function checkLinkedinConnection(
  payload: {
    profile_name: string | undefined;
    profile_image: string | undefined;
    status: "connected" | "not_connected";
  },
  tabId: number | undefined,
) {
  const data = await storage.getSettings();
  data.connectionStatus.linkedin = {
    profile_name: payload.profile_name || null,
    profile_image: payload.profile_image || null,
    status: payload.status,
  };
  await storage.setSettings(data);
  if (tabId) {
    chrome.tabs.remove(tabId);
  }
}

/**
 * Saves the posted LinkedIn content to history and closes the tab
 * @param post - The post data that was published
 * @param tabId - Optional tab ID to close after posting
 */
export async function postedToLinkedin(
  post: {
    title: string;
    content: string;
    tags: string[];
    image: string | null;
  },
  tabId: number | undefined,
) {
  storage.addPostHistory({
    ...post,
    postedOn: "Linkedin",
  });
  if (tabId) {
    setTimeout(() => {
      chrome.tabs.remove(tabId);
    }, 2500);
  }
}

/**
 * Disconnects the LinkedIn integration by resetting the connection status
 * Clears profile information and reloads the page to reflect changes
 */
export async function disconnectLinkedin() {
  try {
    const data = await storage.getSettings();
    data.connectionStatus.linkedin = {
      profile_name: null,
      profile_image: null,
      status: "not_connected",
    };
    await storage.setSettings(data);
    window.location.reload();
  } catch (error) {
    alert(
      `Failed to disconnect LinkedIn: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
