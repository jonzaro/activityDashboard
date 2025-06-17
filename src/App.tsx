import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "./hooks/useTheme";
import { useActivityFeed } from "./hooks/useActivityFeed";
import { ActivityCard } from "./components/ActivityCard";
import { FilterBar } from "./components/FilterBar";
import { ConfigModal } from "./components/ConfigModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { dashboardConfig } from "./config";
import { DashboardConfig, FilterOptions } from "./types";
import {
  Moon,
  Sun,
  Settings,
  RefreshCw,
  Activity,
  AlertTriangle,
  Github,
  Ticket,
} from "lucide-react";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<DashboardConfig>(dashboardConfig);

  const [filters, setFilters] = useState<FilterOptions>({
    source: "all",
    type: "all",
    timeRange: "all",
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const {
    activities,
    loading,
    error,
    lastFetch,
    fetchActivities,
    filterActivities,
  } = useActivityFeed(config);

  const filteredActivities = useMemo(
    () => filterActivities(activities, filters),
    [activities, filters, filterActivities]
  );

  useEffect(() => {
    localStorage.setItem("dashboardConfig", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(fetchActivities, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, fetchActivities]);

  const handleConfigChange = (newConfig: DashboardConfig) => {
    setConfig(newConfig);
  };

  // Force the app to consider itself configured by setting this to true
  const isConfigured = true; // Previously: config.githubToken || config.linearToken;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Activity className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Developer Activity Dashboard
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Track your development activity across GitHub and Linear in one
              beautiful dashboard.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <Github className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  GitHub Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  View your latest commits, pull requests, and repository
                  activity in real-time.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <Ticket className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Linear Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track your issues, tasks, and project progress across all
                  Linear workspaces.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
            >
              <Settings className="w-5 h-5" />
              <span>Get Started - Configure Integrations</span>
            </button>
          </div>
        </div>

        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>
    );
  }

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
                  Developer Dashboard
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
                onClick={() => setIsConfigOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
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
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={activities.length}
          filteredCount={filteredActivities.length}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No activities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activities.length === 0
                ? "No activities have been loaded yet. Check your configuration and try refreshing."
                : "No activities match your current filters. Try adjusting your filter criteria."}
            </p>
            {activities.length === 0 && (
              <button
                onClick={() => setIsConfigOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Integrations</span>
              </button>
            )}
          </div>
        )}

        {!loading && filteredActivities.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onConfigChange={handleConfigChange}
      /> */}
    </div>
  );
}

export default App;
