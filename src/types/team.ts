export interface TeamMember {
  id: string;
  name: string;
  githubUsername: string;
  avatar?: string;
}

export type TabId =
  | "jon"
  | "michael"
  | "steve"
  | "metrics"
  | "standup"
  | "rollup";

export interface AIReport {
  content: string;
  generatedAt: string;
  type: "standup" | "rollup";
}

export interface CachedReport {
  report: AIReport;
  expiresAt: number;
}
