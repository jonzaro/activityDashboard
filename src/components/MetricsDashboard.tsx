import React, { useMemo } from "react";
import { ActivityItem } from "../types";
import { TEAM_MEMBERS } from "../config/team";
import { GitBranch, GitMerge, Ticket, Users } from "lucide-react";

interface MetricsDashboardProps {
  memberActivities: Record<string, ActivityItem[]>;
}

interface MemberMetrics {
  id: string;
  name: string;
  commits: number;
  merges: number;
  tickets: number;
  total: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  memberActivities,
}) => {
  const metrics: MemberMetrics[] = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const activities = memberActivities[member.id] || [];
      const commits = activities.filter((a) => a.type === "commit").length;
      const merges = activities.filter((a) => a.type === "merge").length;
      const tickets = activities.filter((a) => a.type === "ticket").length;
      return {
        id: member.id,
        name: member.name,
        commits,
        merges,
        tickets,
        total: commits + merges + tickets,
      };
    });
  }, [memberActivities]);

  const totals = useMemo(() => {
    return {
      commits: metrics.reduce((sum, m) => sum + m.commits, 0),
      merges: metrics.reduce((sum, m) => sum + m.merges, 0),
      tickets: metrics.reduce((sum, m) => sum + m.tickets, 0),
      total: metrics.reduce((sum, m) => sum + m.total, 0),
    };
  }, [metrics]);

  const maxCommits = Math.max(...metrics.map((m) => m.commits), 1);
  const maxMerges = Math.max(...metrics.map((m) => m.merges), 1);
  const maxTickets = Math.max(...metrics.map((m) => m.tickets), 1);

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];

  return (
    <div className="space-y-8">
      {/* Team Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Activities"
          value={totals.total}
          gradient="from-gray-500 to-gray-600"
        />
        <StatCard
          icon={<GitBranch className="w-5 h-5" />}
          label="Commits"
          value={totals.commits}
          gradient="from-blue-500 to-purple-600"
        />
        <StatCard
          icon={<GitMerge className="w-5 h-5" />}
          label="PRs Merged"
          value={totals.merges}
          gradient="from-green-500 to-teal-600"
        />
        <StatCard
          icon={<Ticket className="w-5 h-5" />}
          label="Tickets"
          value={totals.tickets}
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Per-Member Breakdown */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Team Comparison
        </h2>

        {/* Commits */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <GitBranch className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Commits
            </h3>
          </div>
          {metrics.map((m, i) => (
            <ComparisonBar
              key={m.id}
              name={m.name}
              value={m.commits}
              max={maxCommits}
              gradient={gradients[i]}
            />
          ))}
        </div>

        {/* PRs Merged */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <GitMerge className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              PRs Merged
            </h3>
          </div>
          {metrics.map((m, i) => (
            <ComparisonBar
              key={m.id}
              name={m.name}
              value={m.merges}
              max={maxMerges}
              gradient={gradients[i]}
            />
          ))}
        </div>

        {/* Tickets */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Ticket className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tickets
            </h3>
          </div>
          {metrics.map((m, i) => (
            <ComparisonBar
              key={m.id}
              name={m.name}
              value={m.tickets}
              max={maxTickets}
              gradient={gradients[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}> = ({ icon, label, value, gradient }) => (
  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5">
    <div
      className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white mb-3`}
    >
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {value}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const ComparisonBar: React.FC<{
  name: string;
  value: number;
  max: number;
  gradient: string;
}> = ({ name, value, max, gradient }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center space-x-3 mb-2">
      <span className="w-20 text-sm text-gray-600 dark:text-gray-400 text-right">
        {name}
      </span>
      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
        {value}
      </span>
    </div>
  );
};
