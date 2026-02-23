import { useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: "success" | "error" | "info";
};

/**
 * Global notification provider that listens for notification messages
 * and displays them as toast notifications within the extension
 */
export function NotificationProvider() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for notification messages from background script
    const handleMessage = (
      message: {
        type: string;
        payload?: { title: string; message: string };
      },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: { received: boolean }) => void,
    ) => {
      console.log("NotificationProvider received message:", message);

      if (message.type === "SHOW_NOTIFICATION" && message.payload) {
        const notification: Notification = {
          id: Date.now(),
          title: message.payload.title,
          message: message.payload.message,
          type: "error", // Default to error for now
        };

        setNotifications((prev) => [...prev, notification]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id),
          );
        }, 5000);

        sendResponse({ received: true });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    console.log("NotificationProvider: Message listener added");

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm min-w-[300px] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all animate-slide-in ${
            notification.type === "error"
              ? "bg-red-500"
              : notification.type === "success"
                ? "bg-green-500"
                : "bg-blue-500"
          }`}>
          <div className="font-semibold mb-1">{notification.title}</div>
          <div className="text-xs opacity-90">{notification.message}</div>
        </div>
      ))}
    </div>
  );
}
