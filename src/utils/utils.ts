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
