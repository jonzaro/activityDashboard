import { DashboardConfig } from "./types";

// Parse comma-separated repositories from environment variable
const getRepositories = (): string[] => {
  const repoEnv = import.meta.env.VITE_REPOSITORIES || "";
  return repoEnv.split(",").filter((repo) => repo.trim().length > 0);
};

// Get refresh interval with fallback to 30 seconds
const getRefreshInterval = (): number => {
  const interval = Number(import.meta.env.VITE_REFRESH_INTERVAL);
  return !isNaN(interval) ? interval : 30000;
};

export const dashboardConfig: DashboardConfig = {
  // Use environment variables for tokens
  githubToken: import.meta.env.VITE_GITHUB_TOKEN,
  linearToken: import.meta.env.VITE_LINEAR_TOKEN,
  repositories: getRepositories(),
  refreshInterval: getRefreshInterval(),
};
