import { storage } from "./storage";

export function waitForElement(selector: string, timeout = 10000) {
  return new Promise<Element>((resolve, reject) => {
    const interval = 200;
    let elapsed = 0;

    const timer = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      }

      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        reject(new Error("Element not found"));
      }
    }, interval);
  });
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function typeLikeUser(editor: HTMLElement, text: string) {
  editor.focus();
  editor.click();

  for (const char of text) {
    const keyDown = new KeyboardEvent("keydown", {
      bubbles: true,
      key: char,
    });

    const keyPress = new KeyboardEvent("keypress", {
      bubbles: true,
      key: char,
    });

    const input = new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: char,
    });

    editor.dispatchEvent(keyDown);
    editor.dispatchEvent(keyPress);

    // Draft.js reacts to this
    document.execCommand("insertText", false, char);

    editor.dispatchEvent(input);

    await new Promise((r) => setTimeout(r, 4));
  }
}

export async function UploadBase64ToCloudinary(base64: string) {
  const storageData = await storage.getStorage();
  const cloudName = storageData.settings.cloudinary.cloud_name;
  const uploadPreset = storageData.settings.cloudinary.unsigned_preset;

  const formData = new FormData();
  formData.append("file", base64);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url; // <-- THIS is what you use as main_image
}
