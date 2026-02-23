import { storage } from "../../utils/storage";
import { showNotification } from "../../utils/utils";

/**
 * Tests the Medium connection by opening a Medium tab and sending a test message
 * Creates a new tab, waits for it to load, then sends a message to run the connection test
 */
export function testMediumConnection() {
  chrome.tabs.create(
    {
      url: "https://medium.com/me/stats",
      active: true,
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
              type: "RUN_MEDIUM_TEST",
            });
          }, 1000);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    },
  );
}

/**
 * Posts content to Medium by opening the new story page and sending post data to the content script
 * @param post - The post data including title, content, tags, and optional image
 */
export async function postToMedium(post: {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
}) {
  chrome.tabs.create(
    {
      url: "https://medium.com/new-story",
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
              type: "POST_MEDIUM",
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
 * Updates the Medium connection status in storage after a connection check
 * @param payload - Connection status data including profile name, image, and status
 * @param tabId - Optional tab ID to close after the check completes
 */
export async function checkMediumConnection(
  payload: {
    profile_name: string | undefined;
    profile_image: string | undefined;
    status: "connected" | "not_connected";
  },
  tabId: number | undefined,
) {
  const data = await storage.getSettings();
  data.connectionStatus.medium = {
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
 * Saves the posted Medium content to history and closes the tab
 * @param post - The post data that was published
 * @param tabId - Optional tab ID to close after posting
 */
export async function postedToMedium(
  payload: { isError: boolean; message: string },
  tabId: number | undefined,
) {
  if (payload.isError) {
    showNotification(
      "Medium Post Failed",
      `Failed to post to Medium: ${payload.message}`,
    );
  }
  if (tabId) {
    setTimeout(() => {
      chrome.tabs.remove(tabId);
    }, 2500);
  }
}

/**
 * Disconnects the Medium integration by resetting the connection status
 * Clears profile information and reloads the page to reflect changes
 */
export async function disconnectMedium() {
  try {
    const data = await storage.getSettings();
    data.connectionStatus.medium = {
      profile_name: null,
      profile_image: null,
      status: "not_connected",
    };
    await storage.setSettings(data);
    window.location.reload();
  } catch (error) {
    alert(
      `Failed to disconnect Medium: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
