import { storage } from "../../utils/storage";
import type { historyItem, PostPilotStorage } from "../../utils/types";
import { UploadBase64ToCloudinary } from "../../utils/utils";
// Using dev.to version V1

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
      console.log(error);
      throw new Error(
        `Error verifying dev.to token. Please check the console for more details. ${error}`,
      );
    });
  console.log("Dev.to user info:", getUser);
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

export async function disconnectDevto() {
  const data = await storage.getSettings();
  data.connectionStatus.devto = {
    profile_name: null,
    profile_image: null,
    status: "not_connected",
  };
  await storage.setSettings(data);
  window.location.reload();
}

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
  console.log("Posting to dev.to with data:", postData);
  const articleData = {
    article: {
      title: title,
      body_markdown: content,
      published: true,
      main_image: uploadedImageUrl,
      tags: tags.slice(0, 4), // dev.to allows max 4 tags, so we take the first 4
    },
  };
  console.log("Constructed article data for dev.to:", articleData);
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
      console.log("Dev.to API response status:", response);
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
      console.log(error);
      throw new Error(
        `Error publishing article to dev.to. Please check the console for more details. ${error}`,
      );
    });

  console.log(publishArticle);

  storage.addPostHistory({
    postedOn: "dev.to",
    title: publishArticle.title,
    content: publishArticle.body_markdown,
    image: publishArticle.cover_image || null,
    tags: publishArticle.tags,
  });
}

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
