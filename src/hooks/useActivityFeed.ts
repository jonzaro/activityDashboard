import { useState, useEffect, useCallback } from "react";
import {
  ActivityItem,
  FilterOptions,
  DashboardConfig,
  GitHubCommit,
  LinearTicket,
} from "../types";
import { GitHubService } from "../services/github";
import { LinearService } from "../services/linear";

export const useActivityFeed = (config: DashboardConfig) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchActivities = useCallback(async () => {
    console.log("Fetching activities with config:", config);
    setLoading(true);
    setError(null);

    try {
      const allActivities: ActivityItem[] = [];

      // Fetch GitHub commits
      if (config.githubToken && config.repositories.length > 0) {
        console.log("Fetching GitHub commits...");
        const githubService = new GitHubService(config.githubToken);
        const commits = await githubService.getCommits(config.repositories);

        console.log("GitHub commits received:", commits.length);

        const githubActivities: ActivityItem[] = commits.map((commit) => ({
          id: `github-${commit.id}`,
          type: "commit",
          source: "github",
          timestamp: commit.timestamp,
          data: commit,
        }));

        allActivities.push(...githubActivities);
      }

      // Fetch Linear tickets
      if (config.linearToken) {
        console.log("Fetching Linear tickets...");
        const linearService = new LinearService(config.linearToken);
        const tickets = await linearService.getTickets();

        console.log("Linear tickets received:", tickets.length);

        const linearActivities: ActivityItem[] = tickets.map((ticket) => ({
          id: `linear-${ticket.id}`,
          type: "ticket",
          source: "linear",
          timestamp: ticket.date,
          data: ticket,
        }));

        allActivities.push(...linearActivities);
      }

      // Sort by timestamp (newest first)
      allActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log("Total activities processed:", allActivities.length);
      console.log("Activities breakdown:", {
        github: allActivities.filter((a) => a.source === "github").length,
        linear: allActivities.filter((a) => a.source === "linear").length,
      });

      setActivities(allActivities);
      setLastFetch(new Date());
    } catch (err) {
      console.error("Error in fetchActivities:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch activities"
      );
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filterActivities = useCallback(
    (activities: ActivityItem[], filters: FilterOptions) => {
      return activities.filter((activity) => {
        // Source filter
        if (filters.source !== "all" && activity.source !== filters.source) {
          return false;
        }

        // Type filter
        if (filters.type !== "all" && activity.type !== filters.type) {
          return false;
        }

        // Time range filter
        if (filters.timeRange !== "all") {
          const now = new Date();
          const activityDate = new Date(activity.timestamp);
          let timeLimit: Date;

          switch (filters.timeRange) {
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

          if (activityDate < timeLimit) {
            return false;
          }
        }

        return true;
      });
    },
    []
  );

  return {
    activities,
    loading,
    error,
    lastFetch,
    fetchActivities,
    filterActivities,
  };
};

export interface FilterOptions {
  source: "all" | "github" | "linear";
  type: "all" | "commit" | "ticket";
  timeRange: "all" | "24h" | "7d" | "30d";
}
