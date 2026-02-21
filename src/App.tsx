import React, { useState, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useTeamActivityFeed } from "./hooks/useTeamActivityFeed";
import { TabNav } from "./components/TabNav";
import { EmployeeFeed } from "./components/EmployeeFeed";
import { MetricsDashboard } from "./components/MetricsDashboard";
import { StandupReport } from "./components/StandupReport";
import { WeeklyRollup } from "./components/WeeklyRollup";
import { dashboardConfig } from "./config";
import { DashboardConfig } from "./types";
import { TabId } from "./types/team";
import { getTeamMember } from "./config/team";
import { Moon, Sun, RefreshCw, Activity } from "lucide-react";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("jon");

  const [config] = useState<DashboardConfig>(() => {
    try {
      const savedConfig = localStorage.getItem("dashboardConfig");
      return savedConfig
        ? { ...dashboardConfig, ...JSON.parse(savedConfig) }
        : dashboardConfig;
    } catch {
      return dashboardConfig;
    }
  });

  const {
    memberActivities,
    allActivities,
    memberErrors,
    memberLoading,
    loading,
    lastFetch,
    fetchActivities,
  } = useTeamActivityFeed(config);

  useEffect(() => {
    localStorage.setItem("dashboardConfig", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(fetchActivities, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, fetchActivities]);

  const renderContent = () => {
    // Employee tabs
    const member = getTeamMember(activeTab);
    if (member) {
      return (
        <EmployeeFeed
          member={member}
          activities={memberActivities[member.id] || []}
          loading={memberLoading[member.id] || false}
          error={memberErrors[member.id] || null}
        />
      );
    }

    if (activeTab === "metrics") {
      return <MetricsDashboard memberActivities={memberActivities} />;
    }

    if (activeTab === "standup") {
      return <StandupReport allActivities={allActivities} loading={loading} />;
    }

    if (activeTab === "rollup") {
      return <WeeklyRollup allActivities={allActivities} loading={loading} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Team Dashboard
                </h1>
                {lastFetch && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {lastFetch.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchActivities}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                title="Refresh activities"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
