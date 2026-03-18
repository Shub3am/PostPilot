import { beforeEach, vi } from "vitest";

type RuntimeListener = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
) => void | Promise<void>;

type ClickListener = () => void;

type ChromeTestState = {
  runtimeMessageListeners: RuntimeListener[];
  actionClickListeners: ClickListener[];
};

const testState: ChromeTestState = {
  runtimeMessageListeners: [],
  actionClickListeners: [],
};

const storageMemory: Record<string, unknown> = {};

const chromeMock = {
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
    sendMessage: vi.fn(async () => undefined),
    onMessage: {
      addListener: vi.fn((listener: RuntimeListener) => {
        testState.runtimeMessageListeners.push(listener);
      }),
      removeListener: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn((listener: ClickListener) => {
        testState.actionClickListeners.push(listener);
      }),
    },
  },
  tabs: {
    create: vi.fn(),
    sendMessage: vi.fn(),
    remove: vi.fn(),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn(async (key?: string | string[]) => {
        if (!key) {
          return { ...storageMemory };
        }

        if (Array.isArray(key)) {
          return key.reduce<Record<string, unknown>>((acc, current) => {
            acc[current] = storageMemory[current];
            return acc;
          }, {});
        }

        return { [key]: storageMemory[key] };
      }),
      set: vi.fn(async (value: Record<string, unknown>) => {
        Object.assign(storageMemory, value);
      }),
      remove: vi.fn(async (key: string) => {
        delete storageMemory[key];
      }),
    },
  },
  notifications: {
    create: vi.fn(),
  },
};

Object.defineProperty(globalThis, "chrome", {
  value: chromeMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "__chromeTestState", {
  value: testState,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "__chromeStorageMemory", {
  value: storageMemory,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  testState.runtimeMessageListeners.length = 0;
  testState.actionClickListeners.length = 0;

  Object.keys(storageMemory).forEach((key) => {
    delete storageMemory[key];
  });

  vi.clearAllMocks();
});
