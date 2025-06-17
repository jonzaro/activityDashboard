import { DashboardConfig } from "./types";

export const dashboardConfig: DashboardConfig = {
  // Hardcode your tokens directly for demo purposes
  githubToken: "your_github_token_here", // Replace with actual token
  linearToken: "your_linear_token_here", // Replace with actual token
  repositories: [
    "Smash-Creative/burn", 
    // Add any other repositories you want to track
  ],
  refreshInterval: 30000,
};
