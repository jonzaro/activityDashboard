import { useMemo } from "react";
import { useActivityFeed } from "./useActivityFeed";
import { TEAM_MEMBERS } from "../config/team";
import { DashboardConfig, ActivityItem } from "../types";

export const useTeamActivityFeed = (config: DashboardConfig) => {
  // Hooks must be called unconditionally, so we always call 3 but use
  // undefined username for slots beyond the current TEAM_MEMBERS list.
  const feed0 = useActivityFeed(config, TEAM_MEMBERS[0]?.githubUsername);
  const feed1 = useActivityFeed(config, TEAM_MEMBERS[1]?.githubUsername);
  const feed2 = useActivityFeed(config, TEAM_MEMBERS[2]?.githubUsername);

  const allFeeds = [feed0, feed1, feed2];
  const feeds = allFeeds.slice(0, TEAM_MEMBERS.length);

  const feedActivities = feeds.map((f) => f.activities);

  const memberActivities: Record<string, ActivityItem[]> = useMemo(() => {
    const result: Record<string, ActivityItem[]> = {};
    TEAM_MEMBERS.forEach((member, i) => {
      result[member.id] = feeds[i].activities.map((a) => ({
        ...a,
        employeeId: member.id,
      }));
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, feedActivities);

  const allActivities: ActivityItem[] = useMemo(() => {
    return Object.values(memberActivities)
      .flat()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [memberActivities]);

  const loading = feeds.some((f) => f.loading);
  const error = feeds
    .map((f, i) =>
      f.error ? `${TEAM_MEMBERS[i].name}: ${f.error}` : null
    )
    .filter(Boolean)
    .join("; ") || null;

  const memberErrors: Record<string, string | null> = {};
  TEAM_MEMBERS.forEach((member, i) => {
    memberErrors[member.id] = feeds[i].error;
  });

  const memberLoading: Record<string, boolean> = {};
  TEAM_MEMBERS.forEach((member, i) => {
    memberLoading[member.id] = feeds[i].loading;
  });

  const lastFetch = feeds
    .map((f) => f.lastFetch)
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] || null;

  const fetchActivities = () => {
    feeds.forEach((f) => f.fetchActivities());
  };

  return {
    memberActivities,
    allActivities,
    memberErrors,
    memberLoading,
    loading,
    error,
    lastFetch,
    fetchActivities,
  };
};
