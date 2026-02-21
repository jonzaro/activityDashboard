import { ActivityItem } from "../types";
import { AIReport, CachedReport } from "../types/team";
import { TEAM_MEMBERS } from "../config/team";

const STANDUP_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ROLLUP_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCacheKey(type: "standup" | "rollup"): string {
  if (type === "standup") {
    const today = new Date().toISOString().split("T")[0];
    return `ai-report-standup-${today}`;
  }
  // Weekly: use ISO week start (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const weekKey = monday.toISOString().split("T")[0];
  return `ai-report-rollup-${weekKey}`;
}

export function getCachedReport(
  type: "standup" | "rollup"
): AIReport | null {
  try {
    const key = getCacheKey(type);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedReport = JSON.parse(raw);
    if (Date.now() > cached.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.report;
  } catch {
    return null;
  }
}

function cacheReport(type: "standup" | "rollup", report: AIReport): void {
  const key = getCacheKey(type);
  const ttl = type === "standup" ? STANDUP_TTL : ROLLUP_TTL;
  const cached: CachedReport = {
    report,
    expiresAt: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(cached));
}

export async function generateReport(
  type: "standup" | "rollup",
  activities: ActivityItem[]
): Promise<AIReport> {
  // Build name lookup from team config
  const nameMap: Record<string, string> = {};
  TEAM_MEMBERS.forEach((m) => {
    nameMap[m.id] = m.name;
  });

  // Slim down the payload — only send what the LLM needs
  const slimActivities = activities.map((a) => ({
    type: a.type,
    source: a.source,
    timestamp: a.timestamp,
    employee: nameMap[a.employeeId || ""] || a.employeeId || "Unknown",
    title:
      a.type === "commit"
        ? (a.data as any).message
        : (a.data as any).title,
    repository: (a.data as any).repository,
  }));

  const teamRoster = TEAM_MEMBERS.map((m) => m.name);

  const response = await fetch("/.netlify/functions/ai-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, activities: slimActivities, teamRoster }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  const report: AIReport = {
    content: data.content,
    generatedAt: data.generatedAt,
    type,
  };

  cacheReport(type, report);
  return report;
}
