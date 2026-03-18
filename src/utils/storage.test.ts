import { describe, expect, it, vi } from "vitest";
import { default_storage } from "./types";

const STORAGE_KEY = "postpilot";

async function importStorageModule() {
  vi.resetModules();
  return import("./storage");
}

describe("storage", () => {
  it("initializes default storage when missing", async () => {
    const { storage } = await importStorageModule();

    await storage.init();

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [STORAGE_KEY]: default_storage,
    });
  });

  it("returns connected platforms while skipping dev.to when Cloudinary is missing", async () => {
    const { storage } = await importStorageModule();

    const state = {
      ...default_storage,
      settings: {
        ...default_storage.settings,
        cloudinary: {
          cloud_name: "",
          unsigned_preset: "",
        },
        connectionStatus: {
          linkedin: {
            profile_name: "Li",
            profile_image: null,
            status: "connected" as const,
          },
          twitter: {
            profile_name: "Tw",
            profile_image: null,
            status: "connected" as const,
          },
          devto: {
            profile_name: "De",
            profile_image: null,
            status: "connected" as const,
          },
          medium: {
            profile_name: null,
            profile_image: null,
            status: "not_connected" as const,
          },
        },
      },
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: state });

    const connected = await storage.getConnectedAccounts();

    expect(connected).toEqual(["linkedin", "twitter"]);
  });

  it("adds new history item at top", async () => {
    const { storage } = await importStorageModule();

    const state = {
      ...default_storage,
      history: [
        {
          title: "old",
          content: "old content",
          image: null,
          tags: ["old"],
          postedOn: "Twitter",
        },
      ],
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: state });

    await storage.addPostHistory({
      title: "new",
      content: "new content",
      image: null,
      tags: ["new"],
      postedOn: "LinkedIn",
    });

    const finalState = await chrome.storage.local.get(STORAGE_KEY);
    const [first, second] = (finalState[STORAGE_KEY] as typeof state).history;

    expect(first.title).toBe("new");
    expect(second.title).toBe("old");
  });
});
