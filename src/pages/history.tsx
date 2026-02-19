import { useEffect, useState } from "react";
import { storage } from "../utils/storage";
import type { historyItem } from "../utils/types";

export default function History() {
  const [history, setHistory] = useState<historyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await storage.getStorage();
        setHistory(data.history);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">History</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">History</h2>
        <p className="text-gray-500">No posts yet. Create your first post!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              {item.image && (
                <div className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {item.content}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    Tags:{" "}
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-xs">
                  Posted on {item.postedOn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
