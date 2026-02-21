import React from "react";
import { TabId } from "../types/team";
import { TABS } from "../config/team";
import {
  User,
  BarChart3,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  "bar-chart": <BarChart3 className="w-4 h-4" />,
  clipboard: <ClipboardList className="w-4 h-4" />,
  calendar: <CalendarDays className="w-4 h-4" />,
};

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
              : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
          }`}
        >
          {iconMap[tab.icon]}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
