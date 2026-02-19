export interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  repository: string;
  url: string;
  author: {
    name: string;
    avatar?: string;
  };
}

export interface GitHubMerge {
  id: string;
  title: string;
  timestamp: string;
  repository: string;
  url: string;
  number: number;
  author: {
    name: string;
    avatar?: string;
  };
}

export interface LinearTicket {
  id: string;
  title: string;
  status: "created" | "assigned" | "in_progress" | "completed" | "closed";
  date: string;
  url: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface ActivityItem {
  id: string;
  source: "github" | "linear";
  type: "commit" | "merge" | "ticket";
  timestamp: string;
  data: GitHubCommit | GitHubMerge | LinearTicket;
}

export interface FilterOptions {
  type: string;
  source: "all" | "github" | "linear";
  timeRange: "all" | "24h" | "7d" | "30d";
}

export interface DashboardConfig {
  githubToken?: string;
  linearToken?: string;
  repositories: string[];
  refreshInterval: number;
}
