import { storage } from "../../utils/storage";

/**
 * Tests the Twitter/X connection by opening a tab and sending a test message
 * Creates a new tab, waits for it to load, then sends a message to run the connection test
 */
export function testTwitterConnection() {
  chrome.tabs.create(
    {
      url: "https://x.com/home",
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
              type: "RUN_TWITTER_TEST",
            });
          }, 1000);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    },
  );
}

/**
 * Posts content to Twitter/X by opening the compose tweet page
 * Verifies connection before posting and sends post data to the content script
 * @param post - The post data including title, content, tags, and optional image
 * @throws Error if not connected to Twitter
 */
export async function postToTwitter(post: {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
}) {
  const data = await storage.getSettings();
  if (
    !data.connectionStatus.twitter ||
    data.connectionStatus.twitter.status !== "connected"
  ) {
    throw new Error("Not connected to Twitter. Please check your connection in settings.");
  }

  chrome.tabs.create(
    {
      url: "https://x.com/compose/tweet",
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
              type: "POST_TWITTER",
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
 * Saves the posted Twitter content to history and closes the tab
 * @param payload - The post data that was published
 * @param tabId - Optional tab ID to close after posting
 */
export async function postedToTwitter(
  payload: {
    title: string;
    content: string;
    tags: string[];
    image: string | null;
  },
  tabId: number | undefined,
) {
  storage.addPostHistory({
    ...payload,
    postedOn: "Twitter",
  });
  if (tabId) {
    setTimeout(() => {
      chrome.tabs.remove(tabId);
    }, 2500);
  }
}

/**
 * Updates the Twitter connection status in storage after a connection check
 * @param payload - Connection status data including profile name, image, and status
 * @param tabId - Optional tab ID to close after the check completes
 */
export async function checkTwitterConnection(
  payload: {
    profile_name: string | undefined;
    profile_image: string | undefined;
    status: "connected" | "not_connected";
  },
  tabId: number | undefined,
) {
  const data = await storage.getSettings();
  data.connectionStatus.twitter = {
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
 * Disconnects the Twitter integration by resetting the connection status
 * Clears profile information and reloads the page to reflect changes
 */
export async function disconnectTwitter() {
  try {
    const data = await storage.getSettings();
    data.connectionStatus.twitter = {
      profile_name: null,
      profile_image: null,
      status: "not_connected",
    };
    await storage.setSettings(data);
    window.location.reload();
  } catch (error) {
    alert(`Failed to disconnect Twitter: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
