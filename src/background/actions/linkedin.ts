import { storage } from "../../utils/storage";

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
