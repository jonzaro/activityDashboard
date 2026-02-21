import React, { useState, useMemo, useCallback } from "react";
import { TeamMember } from "../types/team";
import { ActivityItem, FilterOptions } from "../types";
import { ActivityCard } from "./ActivityCard";
import { FilterBar } from "./FilterBar";
import { LoadingSpinner } from "./LoadingSpinner";
import { Activity, AlertTriangle } from "lucide-react";

interface EmployeeFeedProps {
  member: TeamMember;
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
}

export const EmployeeFeed: React.FC<EmployeeFeedProps> = ({
  member,
  activities,
  loading,
  error,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    source: "all",
    type: "all",
    timeRange: "all",
  });

  const filterActivities = useCallback(
    (items: ActivityItem[], f: FilterOptions) => {
      return items.filter((activity) => {
        if (f.source !== "all" && activity.source !== f.source) return false;
        if (f.type !== "all" && activity.type !== f.type) return false;
        if (f.timeRange !== "all") {
          const now = new Date();
          const activityDate = new Date(activity.timestamp);
          let timeLimit: Date;
          switch (f.timeRange) {
            case "24h":
              timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              break;
            case "7d":
              timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "30d":
              timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
            default:
              return true;
          }
          if (activityDate < timeLimit) return false;
        }
        return true;
      });
    },
    []
  );

  const filteredActivities = useMemo(
    () => filterActivities(activities, filters),
    [activities, filters, filterActivities]
  );

  return (
    <div>
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
              Error loading {member.name}'s activity
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
          <p className="text-gray-600 dark:text-gray-400">
            {activities.length === 0
              ? `No activities loaded for ${member.name}. Check configuration and try refreshing.`
              : "No activities match your current filters. Try adjusting your filter criteria."}
          </p>
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
    </div>
  );
};
