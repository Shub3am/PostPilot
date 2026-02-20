import { useState } from "react";
import {
  FileText,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from "lucide-react";
import DraftContent from "../pages/draft";
import Settings from "../pages/settings";
import History from "../pages/history";

type Page = "draft" | "settings" | "history";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "draft",
    label: "Draft a Content",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />,
  },
  {
    id: "history",
    label: "History",
    icon: <HistoryIcon className="w-5 h-5" />,
  },
];

export function Layout() {
  const [currentPage, setCurrentPage] = useState<Page>("draft");

  const renderPage = () => {
    switch (currentPage) {
      case "draft":
        return <DraftContent />;
      case "settings":
        return <Settings />;
      case "history":
        return <History />;
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">PostPilot</h1>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-gray-200 p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left text-sm ${
                  currentPage === id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
