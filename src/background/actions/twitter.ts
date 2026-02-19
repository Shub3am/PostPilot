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

export async function checkTwitterConnection(
  payload: {
    profile_name: string | undefined;
    profile_image: string | undefined;
    status: "connected" | "not_connected";
  },
  tabId: number | undefined,
) {
  const data = await storage.getSettings();
  console.log(payload);
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

export async function DisconnectTwitter() {
  const data = await storage.getSettings();
  data.connectionStatus.twitter = {
    profile_name: null,
    profile_image: null,
    status: "not_connected",
  };
  await storage.setSettings(data);
  window.location.reload();
}
