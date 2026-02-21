import { TeamMember, TabId } from "../types/team";

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "jon", name: "Jon", githubUsername: "jonzaro" },
  { id: "michael", name: "Michael", githubUsername: "Zaronian" },
  { id: "steve", name: "Steve", githubUsername: "steve-rodri" },
];

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "jon", label: "Jon", icon: "user" },
  { id: "michael", label: "Michael", icon: "user" },
  { id: "steve", label: "Steve", icon: "user" },
  { id: "metrics", label: "Metrics", icon: "bar-chart" },
  { id: "standup", label: "Daily Standup", icon: "clipboard" },
  { id: "rollup", label: "Weekly Rollup", icon: "calendar" },
];

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.id === id);
}
