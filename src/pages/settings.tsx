import { useState, useEffect } from "react";
import { default_storage, type Settings } from "../utils/types";
import { storage } from "../utils/storage";
import { disconnectTwitter } from "../background/actions/twitter";
import { disconnectLinkedin } from "../background/actions/linkedin";
import { disconnectDevto } from "../background/actions/devto";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(default_storage.settings);
  const [notification, setNotification] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.getSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
    /*
    THIS CAPTURES BACKGROUND SERVICE WORKER SEND MESSAGE TO RELOAD PAGE AFTER CHECKING CONNECTION FOR ANY PLATFORM
    HOOKS CALLED FROM BACKGROUND ARE FOR EXAMPLE: LINKEDIN_CONNECTION_CHECK_DONE, TWITTER_CONNECTION_CHECK_DONE, DEVTO_CONNECTION_CHECK_DONE
    */
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type.includes("CHECK_DONE")) {
        window.location.reload();
      }
    });
  }, []);

  const handleTokenChange = (
    platform: keyof Settings["tokens"],
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [platform]: value,
      },
    }));
  };

  const handleMethodChange = (
    platform: keyof Settings["methods"],
    value: "scrape" | "api",
  ) => {
    setSettings((prev) => ({
      ...prev,
      methods: {
        ...prev.methods,
        [platform]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await storage.setSettings(settings);
      setNotification({
        message: "Settings saved successfully!",
        isError: false,
      });
    } catch (err) {
      setNotification({
        message: `Failed to save settings: ${err}`,
        isError: true,
      });
    }
  };

  const handleClear = async () => {
    if (
      confirm(
        "Are you sure you want to clear all settings? This cannot be undone.",
      )
    ) {
      const { status, error } = await storage.clearStorage();

      setSettings(default_storage.settings);
      setNotification({
        message: status,
        isError: error !== null,
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto ">
      {" "}
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      {notification && (
        <p
          className={
            notification.isError ? "text-red-600 mb-4" : "text-green-600 mb-4"
          }>
          {notification.message}
        </p>
      )}
      <p className="text-gray-600 mb-4">
        Configure your API tokens and preferred methods for each platform.
      </p>
      <div className="space-y-8">
        {/* LinkedIn */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">LinkedIn</h3>
          <div className="space-y-4">
            <div>
              {settings.methods.linkedin === "api" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Token
                  </label>
                  <input
                    type="password"
                    value={settings.tokens.linkedin}
                    onChange={(e) =>
                      handleTokenChange("linkedin", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter LinkedIn token"
                  />
                </div>
              )}
              {settings.methods.linkedin === "scrape" && (
                <div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    {settings.connectionStatus.linkedin.profile_image && (
                      <img
                        width={36}
                        height={36}
                        src={settings.connectionStatus.linkedin.profile_image}
                        alt="LinkedIn Profile"
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {settings.connectionStatus.linkedin.profile_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Status: {settings.connectionStatus.linkedin.status}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg m-2 ${settings.connectionStatus.linkedin.status === "connected" ? "bg-green-300" : "bg-amber-300"}`}
                    onClick={() => {
                      chrome.runtime.sendMessage({
                        type: "CHECK_LINKEDIN_CONNECTION",
                      });
                    }}>
                    {settings.connectionStatus.linkedin.status === "connected"
                      ? "Recheck Connection"
                      : "Check Connection"}
                  </button>
                  {settings.connectionStatus.linkedin.status ===
                    "connected" && (
                    <button
                      onClick={disconnectLinkedin}
                      className="bg-red-600 p-2 rounded-lg m-2 text-white hover:bg-red-700">
                      Disconnect
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={settings.methods.linkedin}
                onChange={(e) =>
                  handleMethodChange(
                    "linkedin",
                    e.target.value as "scrape" | "api",
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md">
                <option value="scrape">Scrape</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
        </div>

        {/* Twitter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Twitter</h3>
          <div className="space-y-4">
            <div>
              {settings.methods.twitter === "api" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Token
                  </label>
                  <input
                    type="password"
                    value={settings.tokens.twitter}
                    onChange={(e) =>
                      handleTokenChange("twitter", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter Twitter token"
                  />
                </div>
              )}
              {settings.methods.twitter === "scrape" && (
                <div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    {settings.connectionStatus.twitter.profile_image && (
                      <img
                        width={36}
                        height={36}
                        src={settings.connectionStatus.twitter.profile_image}
                        alt="Twitter Profile"
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {settings.connectionStatus.twitter.profile_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Status:{" "}
                        {settings.connectionStatus.twitter.status
                          .split("_")
                          .join(" ")}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg m-2 ${settings.connectionStatus.twitter.status === "connected" ? "bg-green-300" : "bg-amber-300"}`}
                    onClick={() => {
                      chrome.runtime.sendMessage({
                        type: "CHECK_TWITTER_CONNECTION",
                      }); //it should refresh page after getting response
                    }}>
                    {settings.connectionStatus.twitter.status === "connected"
                      ? "Recheck Connection"
                      : "Check Connection"}
                  </button>
                  {settings.connectionStatus.twitter.status === "connected" && (
                    <button
                      onClick={disconnectTwitter}
                      className="bg-red-600 p-2 rounded-lg m-2 text-white hover:bg-red-700">
                      Disconnect
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={settings.methods.twitter}
                onChange={(e) =>
                  handleMethodChange(
                    "twitter",
                    e.target.value as "scrape" | "api",
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md">
                <option value="scrape">Scrape</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dev.to */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Dev.to</h3>
          <div className="space-y-4">
            <div>
              <div>
                <label className="block text-sm font-medium mb-1">Token</label>
                <input
                  disabled={
                    settings.connectionStatus.devto.status === "connected"
                  }
                  type="password"
                  value={settings.tokens.devto}
                  onChange={(e) => handleTokenChange("devto", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder={
                    settings.connectionStatus.devto.status === "connected"
                      ? "Dev.to token is connected"
                      : "Enter Dev.to token"
                  }
                />
              </div>

              {settings.methods.devto && (
                <div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    {settings.connectionStatus.devto.profile_image && (
                      <img
                        width={36}
                        height={36}
                        src={settings.connectionStatus.devto.profile_image}
                        alt="Dev.to Profile"
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {settings.connectionStatus.devto.profile_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Status: {settings.connectionStatus.devto.status}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg m-2 ${settings.connectionStatus.devto.status === "connected" ? "bg-green-300" : "bg-amber-300"}`}
                    onClick={() => {
                      handleSave(); // Save the token before checking connection
                      chrome.runtime.sendMessage({
                        type: "CHECK_DEVTO_CONNECTION",
                      });
                    }}>
                    {settings.connectionStatus.devto.status === "connected"
                      ? "Recheck Connection"
                      : "Check Connection"}
                  </button>
                  {settings.connectionStatus.devto.status === "connected" && (
                    <button
                      onClick={disconnectDevto}
                      className="bg-red-600 p-2 rounded-lg m-2 text-white hover:bg-red-700">
                      Disconnect
                    </button>
                  )}
                  {
                    <div className="mt-4 p-3  rounded-md">
                      <p
                        className={`text-sm ${settings.cloudinary.cloud_name && settings.cloudinary.unsigned_preset ? "text-green-700" : "text-red-700"}`}>
                        Cloudinary settings.
                        {settings.cloudinary.unsigned_preset &&
                        settings.cloudinary.cloud_name
                          ? "This is used to upload images to Dev.to"
                          : " Please set up Cloudinary to upload images to Dev.to"}
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(
                            e.target as HTMLFormElement,
                          );
                          formData.forEach((value, key) => {
                            console.log(key, value);
                          });
                          storage.setCloudinarySettings(
                            formData.get("cloud_name") as string,
                            formData.get("unsigned_preset") as string,
                          );
                          window.location.reload();
                        }}>
                        <input
                          type="text"
                          name="cloud_name"
                          placeholder="Cloud Name"
                          defaultValue={settings.cloudinary.cloud_name}
                          className="w-full p-2 border border-gray-300 rounded-md mt-2"
                        />
                        <input
                          type="text"
                          defaultValue={settings.cloudinary.unsigned_preset}
                          name="unsigned_preset"
                          placeholder="Unsigned Upload Preset"
                          className="w-full p-2 border border-gray-300 rounded-md mt-2"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-700">
                          {settings.cloudinary.cloud_name &&
                          settings.cloudinary.unsigned_preset
                            ? "Modify Cloudinary Settings"
                            : "Set Cloudinary Settings"}
                        </button>
                      </form>
                    </div>
                  }
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <label htmlFor="devto-method">API</label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex space-x-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Save Settings
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Clear Settings
        </button>
      </div>
    </div>
  );
}
