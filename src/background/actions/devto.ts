import { storage } from "../../utils/storage";
import type { historyItem, PostPilotStorage } from "../../utils/types";
import { UploadBase64ToCloudinary } from "../../utils/utils";

// Using dev.to API version V1
// Documentation: https://developers.forem.com/api/v1

type devToUser = {
  type_of: "user";
  id: number;
  username: string;
  name: string;
  twitter_username: string | null;
  github_username: string | null;
  summary: string;
  location: string;
  website_url: string;
  joined_at: string;
  profile_image: string;
};

/**
 * Tests the connection to Dev.to API using the stored API key
 * Fetches user information to verify the token is valid
 * Updates the connection status in storage
 * Sends a message to reload the settings page after completion
 */
export async function testDevtoConnection() {
  const storageData = await storage.getStorage();
  const token = checkToken(storageData);

  const getUser: devToUser | null = await fetch("https://dev.to/api/users/me", {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to verify dev.to token.");
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error(
        `Error verifying dev.to token: ${error}`,
      );
    });
  if (!getUser) {
    storageData.settings.connectionStatus.devto = {
      profile_name: null,
      profile_image: null,
      status: "not_connected",
    };
    await storage.setStorage(storageData);
    throw new Error("Failed to retrieve dev.to user information.");
  } else {
    storageData.settings.connectionStatus.devto = {
      profile_name: getUser.name,
      profile_image: getUser.profile_image,
      status: "connected",
    };
  }

  await storage.setStorage(storageData);
  chrome.runtime.sendMessage({ type: "DEVTO_CONNECTION_CHECK_DONE" });
}

/**
 * Disconnects the Dev.to integration by resetting the connection status
 * Clears profile information and reloads the page to reflect changes
 */
export async function disconnectDevto() {
  try {
    const data = await storage.getSettings();
    data.connectionStatus.devto = {
      profile_name: null,
      profile_image: null,
      status: "not_connected",
    };
    await storage.setSettings(data);
    window.location.reload();
  } catch (error) {
    alert(`Failed to disconnect Dev.to: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Publishes an article to Dev.to using their API
 * 
 * @param postData - The post data including title, content, image, and tags
 * 
 * Dev.to API schema for article publishing (V1):
 * {
 *   "article": {
 *     "title": "string",
 *     "body_markdown": "string",
 *     "published": boolean,
 *     "series": "string",
 *     "main_image": "string",
 *     "canonical_url": "string",
 *     "description": "string",
 *     "tags": "string",
 *     "organization_id": number
 *   }
 * }
 */
/* dev.to publish article api schema for V1
request
{
  "article": {
    "title": "string",
    "body_markdown": "string",
    "published": false,
    "series": "string",
    "main_image": "string",
    "canonical_url": "string",
    "description": "string",
    "tags": "string",
    "organization_id": 0
  }
}
  */
export async function postToDevto(postData: historyItem) {
  const { title, content, image, tags } = postData;
  const uploadedImageUrl = image ? await UploadBase64ToCloudinary(image) : null;
  const storageData = await storage.getStorage();
  const token = checkToken(storageData);
  
  const articleData = {
    article: {
      title: title,
      body_markdown: content,
      published: true,
      main_image: uploadedImageUrl,
      tags: tags.slice(0, 4), // dev.to allows max 4 tags, so we take the first 4
    },
  };
  
  const publishArticle: ArticleResponse = await fetch(
    "https://dev.to/api/articles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": `${token}`,
      },
      body: JSON.stringify(articleData),
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to publish article to dev.to.");
      }
      if (response.status !== 201) {
        throw new Error(
          `Unexpected response status: ${response.status}. Expected 201 Created. Failed to publish article to dev.to.`,
        );
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error(
        `Error publishing article to dev.to: ${error}`,
      );
    });

  storage.addPostHistory({
    postedOn: "dev.to",
    title: publishArticle.title,
    content: publishArticle.body_markdown,
    image: publishArticle.cover_image || null,
    tags: publishArticle.tags,
  });
}

/**
 * Validates and retrieves the Dev.to API token from storage
 * @param storage - The PostPilot storage object containing settings
 * @returns The Dev.to API token
 * @throws Error if the token is missing
 */
function checkToken(storage: PostPilotStorage): string {
  const token = storage.settings.tokens.devto;
  if (!token) {
    throw Error("Dev.to token is missing. Please set it in the settings.");
  }
  return token;
}

type ArticleResponse = {
  type_of: "article";
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id: number | null;
  published_timestamp: string; // ISO string
  positive_reactions_count: number;
  cover_image: string | null;
  social_image: string | null;
  canonical_url: string;
  created_at: string; // ISO string
  edited_at: string | null;
  crossposted_at: string | null;
  published_at: string | null;
  last_comment_at: string | null;
  reading_time_minutes: number;
  tag_list: string | string[];
  tags: string[];
  body_html: string;
  body_markdown: string;
};
