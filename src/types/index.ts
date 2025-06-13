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

export interface LinearTicket {
  id: string;
  title: string;
  status: 'created' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  date: string;
  url: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ActivityItem {
  id: string;
  type: 'commit' | 'ticket';
  source: 'github' | 'linear';
  timestamp: string;
  data: GitHubCommit | LinearTicket;
}

export interface FilterOptions {
  source: 'all' | 'github' | 'linear';
  type: 'all' | 'commit' | 'ticket';
  timeRange: 'all' | '24h' | '7d' | '30d';
}

export interface DashboardConfig {
  githubToken?: string;
  linearToken?: string;
  repositories: string[];
  refreshInterval: number;
}