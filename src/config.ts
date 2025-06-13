import { DashboardConfig } from "./types";

export const dashboardConfig: DashboardConfig = {
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || "",
  linearToken: import.meta.env.VITE_LINEAR_TOKEN || "",
  repositories: (import.meta.env.VITE_REPOSITORIES || "")
    .split(",")
    .filter(Boolean),
  refreshInterval: Number(import.meta.env.VITE_REFRESH_INTERVAL || 30000),
};
