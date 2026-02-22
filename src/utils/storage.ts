// Utility functions for managing PostPilot storage via Chrome's storage API
// Handles saving and retrieving drafts, settings, and history
import type { PostPilotStorage, historyItem } from "./types";
import { default_storage } from "./types";
const STORAGE_KEY = "postpilot";

class Storage {
  constructor() {
    this.init();
  }

  /**
   * Initializes storage with default structure if not present
   */
  async init(): Promise<void> {
    const storage = await chrome.storage.local.get(STORAGE_KEY);
    if (!storage[STORAGE_KEY]) {
      await chrome.storage.local.set({
        [STORAGE_KEY]: default_storage as PostPilotStorage,
      });
    }
  }

  /**
   * Retrieves the entire PostPilot storage object
   */
  async getStorage(): Promise<PostPilotStorage> {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    if (!data[STORAGE_KEY]) {
      throw new Error("PostPilot storage not found");
    }
    return data[STORAGE_KEY] as PostPilotStorage;
  }

  /**
   * Updates the entire PostPilot storage object
   */
  async setStorage(data: PostPilotStorage): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  /**
   * Retrieves user settings from storage
   */
  async getSettings(): Promise<PostPilotStorage["settings"]> {
    const data = await this.getStorage();
    return data.settings;
  }

  /**
   * Updates user settings in storage
   */
  async setSettings(settings: PostPilotStorage["settings"]): Promise<void> {
    const data = await this.getStorage();
    data.settings = settings;
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  async clearStorage(): Promise<{ status: string; error: null | string }> {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      await this.init();
      return Promise.resolve({ status: "success", error: null });
    } catch (error) {
      return Promise.reject({ status: "error", error: error });
    }
  }

  async addPostHistory(post: historyItem): Promise<void> {
    const data = await this.getStorage();
    data.history.unshift(post);
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }
  async clearHistory(): Promise<void> {
    const data = await this.getStorage();
    data.history = [];
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  async getConnectedAccounts(): Promise<string[]> {
    const data = await this.getStorage();

    let connectedPlatforms = Object.entries(data.settings.connectionStatus)
      .filter(([, value]) => value.status === "connected")
      .map(([key]) => key);
    if (
      !data.settings.cloudinary.cloud_name &&
      !data.settings.cloudinary.unsigned_preset
    ) {
      connectedPlatforms = connectedPlatforms.filter(
        (platform) => platform !== "devto",
      );
    }
    return connectedPlatforms;
  }

  /**
   * Sets Cloudinary configuration for image uploads
   * Required for Dev.to image uploads as they need external image URLs
   * @param cloud_name - The Cloudinary cloud name
   * @param unsigned_preset - The unsigned upload preset name
   */
  async setCloudinarySettings(
    cloud_name: string,
    unsigned_preset: string,
  ): Promise<void> {
    const data = await this.getStorage();
    data.settings.cloudinary.cloud_name = cloud_name;
    data.settings.cloudinary.unsigned_preset = unsigned_preset;
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }
}

export const storage = new Storage();
