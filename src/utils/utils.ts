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
