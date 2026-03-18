import { beforeEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({
  testDevtoConnection: vi.fn(),
  postToDevto: vi.fn(),
  checkLinkedinConnection: vi.fn(),
  postedToLinkedin: vi.fn(),
  postToLinkedin: vi.fn(),
  testLinkedinConnection: vi.fn(),
  checkTwitterConnection: vi.fn(),
  postedToTwitter: vi.fn(),
  postToTwitter: vi.fn(),
  testTwitterConnection: vi.fn(),
  checkMediumConnection: vi.fn(),
  postedToMedium: vi.fn(),
  postToMedium: vi.fn(),
  testMediumConnection: vi.fn(),
  showNotification: vi.fn(),
}));

vi.mock("./actions/devto", () => ({
  testDevtoConnection: mocked.testDevtoConnection,
  postToDevto: mocked.postToDevto,
}));

vi.mock("./actions/linkedin", () => ({
  checkLinkedinConnection: mocked.checkLinkedinConnection,
  postedToLinkedin: mocked.postedToLinkedin,
  postToLinkedin: mocked.postToLinkedin,
  testLinkedinConnection: mocked.testLinkedinConnection,
}));

vi.mock("./actions/twitter", () => ({
  checkTwitterConnection: mocked.checkTwitterConnection,
  postedToTwitter: mocked.postedToTwitter,
  postToTwitter: mocked.postToTwitter,
  testTwitterConnection: mocked.testTwitterConnection,
}));

vi.mock("./actions/medium", () => ({
  checkMediumConnection: mocked.checkMediumConnection,
  postedToMedium: mocked.postedToMedium,
  postToMedium: mocked.postToMedium,
  testMediumConnection: mocked.testMediumConnection,
}));

vi.mock("../utils/utils", () => ({
  showNotification: mocked.showNotification,
}));

async function loadBackgroundListener() {
  vi.resetModules();
  await import("./background");
  const state = (globalThis as any).__chromeTestState;
  return {
    messageListener: state.runtimeMessageListeners[0],
    clickListener: state.actionClickListeners[0],
  };
}

describe("background message routing", () => {
  beforeEach(() => {
    Object.values(mocked).forEach((mockFn) => mockFn.mockReset());
  });

  it("opens extension page when action icon is clicked", async () => {
    const { clickListener } = await loadBackgroundListener();

    clickListener();

    expect(chrome.runtime.getURL).toHaveBeenCalledWith("index.html");
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: "chrome-extension://test/index.html",
    });
  });

  it("routes CREATE_POST to platform handlers", async () => {
    mocked.postToTwitter.mockResolvedValue(undefined);
    mocked.postToLinkedin.mockResolvedValue(undefined);

    const { messageListener } = await loadBackgroundListener();

    await messageListener(
      {
        type: "CREATE_POST",
        payload: {
          title: "t",
          content: "c",
          tags: ["tag"],
          image: null,
          platforms: ["twitter", "linkedin"],
        },
      },
      {} as chrome.runtime.MessageSender,
    );

    await Promise.resolve();

    expect(mocked.postToTwitter).toHaveBeenCalledTimes(1);
    expect(mocked.postToLinkedin).toHaveBeenCalledTimes(1);
  });

  it("shows notification when platform posting fails", async () => {
    mocked.postToMedium.mockRejectedValue(new Error("post failed"));

    const { messageListener } = await loadBackgroundListener();

    await messageListener(
      {
        type: "CREATE_POST",
        payload: {
          title: "t",
          content: "c",
          tags: [],
          image: null,
          platforms: ["medium"],
        },
      },
      {} as chrome.runtime.MessageSender,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocked.showNotification).toHaveBeenCalledWith(
      "Failed to post to medium",
      "post failed",
    );
  });

  it("shows notification when dev.to connection test throws", async () => {
    mocked.testDevtoConnection.mockRejectedValue(new Error("bad token"));

    const { messageListener } = await loadBackgroundListener();

    await messageListener(
      {
        type: "CHECK_DEVTO_CONNECTION",
      },
      {} as chrome.runtime.MessageSender,
    );

    expect(mocked.showNotification).toHaveBeenCalledWith(
      "Dev.to Connection Failed",
      "bad token",
    );
  });
});
