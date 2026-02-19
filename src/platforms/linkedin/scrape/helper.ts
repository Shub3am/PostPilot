export function waitForEditor(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    // if editor already exists
    const existing = document.querySelector(".ql-editor");
    if (existing) {
      resolve(existing as HTMLElement);
      return;
    }

    // watch DOM until LinkedIn renders it
    const observer = new MutationObserver(() => {
      const editor = document.querySelector(".ql-editor");

      if (editor) {
        observer.disconnect();
        resolve(editor as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
