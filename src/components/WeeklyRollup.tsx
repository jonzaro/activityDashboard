import React from "react";
import { useAIReport } from "../hooks/useAIReport";
import { ActivityItem } from "../types";
import { MarkdownContent } from "./MarkdownContent";
import { CalendarDays, RefreshCw, Clock, AlertTriangle } from "lucide-react";

interface WeeklyRollupProps {
  allActivities: ActivityItem[];
  loading: boolean;
}

export const WeeklyRollup: React.FC<WeeklyRollupProps> = ({
  allActivities,
  loading: dataLoading,
}) => {
  const {
    report,
    loading: reportLoading,
    error,
    regenerate,
  } = useAIReport("rollup", allActivities, !dataLoading);

  const loading = dataLoading || reportLoading;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Weekly Rollup
              </h2>
              {report && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Generated{" "}
                    {new Date(report.generatedAt).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={regenerate}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
            title="Regenerate report"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Regenerate</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {loading && !report && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generating weekly rollup...
              </p>
            </div>
          </div>
        )}

        {!loading && !report && !error && allActivities.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No activity data available. Wait for data to load, then revisit this
            tab.
          </p>
        )}

        {report && <MarkdownContent content={report.content} />}
      </div>
    </div>
  );
};
