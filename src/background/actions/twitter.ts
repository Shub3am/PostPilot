import { storage } from "../../utils/storage";

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
    console.error("Not connected to Twitter");
    return;
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

export async function disconnectTwitter() {
  const data = await storage.getSettings();
  data.connectionStatus.twitter = {
    profile_name: null,
    profile_image: null,
    status: "not_connected",
  };
  await storage.setSettings(data);
  window.location.reload();
}
