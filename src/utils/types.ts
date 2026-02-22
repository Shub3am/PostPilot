type Settings = {
  tokens: {
    linkedin: string;
    twitter: string;
    devto: string;
  };
  cloudinary: {
    unsigned_preset: string;
    cloud_name: string;
  };
  methods: {
    linkedin: "scrape" | "api";
    twitter: "scrape" | "api";
    devto: "api";
  };

  connectionStatus: {
    linkedin: {
      profile_name: string | null;
      profile_image: string | null;
      status: "connected" | "not_connected";
    };
    twitter: {
      profile_name: string | null;
      profile_image: string | null;
      status: "connected" | "not_connected";
    };
    devto: {
      profile_name: string | null;
      profile_image: string | null;
      status: "connected" | "not_connected";
    };
  };
};

type historyItem = {
  title: string;
  content: string;
  tags: string[];
  image: string | null;
  postedOn: string;
};

type PostPilotStorage = {
  settings: Settings;
  history: historyItem[];
};

export const default_storage: PostPilotStorage = {
  settings: {
    cloudinary: {
      unsigned_preset: "",
      cloud_name: "",
    },
    tokens: {
      linkedin: "",
      twitter: "",
      devto: "",
    },
    methods: {
      linkedin: "scrape",
      twitter: "scrape",
      devto: "api",
    },
    connectionStatus: {
      linkedin: {
        profile_name: null,
        profile_image: null,
        status: "not_connected",
      },
      twitter: {
        profile_name: null,
        profile_image: null,
        status: "not_connected",
      },
      devto: {
        profile_name: null,
        profile_image: null,
        status: "not_connected",
      },
    },
  },
  history: [],
};

export type { Settings, historyItem, PostPilotStorage };
