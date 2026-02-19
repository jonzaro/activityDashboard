import React from 'react';
import { ActivityItem, GitHubCommit, GitHubMerge, LinearTicket } from '../types';
import { GitBranch, GitMerge, Ticket, ExternalLink, Calendar, User } from 'lucide-react';
import { useAISummary } from '../hooks/useAISummary';

interface ActivityCardProps {
  activity: ActivityItem;
}

const SummaryText: React.FC<{ summary: string | null; loading: boolean }> = ({ summary, loading }) => {
  if (loading) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic animate-pulse mt-1 mb-1">
        Generating summary...
      </p>
    );
  }
  if (!summary) return null;
  return (
    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 mb-1 line-clamp-2">
      {summary}
    </p>
  );
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const summaryType = activity.type === 'commit' ? 'commit' : activity.type === 'merge' ? 'pr' : null;
  const summaryRepo = (activity.data as GitHubCommit | GitHubMerge).repository || '';
  const summaryId = activity.type === 'commit'
    ? (activity.data as GitHubCommit).id
    : activity.type === 'merge'
      ? String((activity.data as GitHubMerge).number)
      : '';

  const { summary, loading } = useAISummary(summaryType, summaryRepo, summaryId);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderCommitCard = (commit: GitHubCommit) => (
    <div className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/50 dark:hover:border-blue-600/50">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {commit.message}
            </h3>
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-500" />
            </a>
          </div>

          <SummaryText summary={summary} loading={loading} />

          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{commit.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(commit.timestamp)}</span>
            </div>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {commit.repository.split('/').pop()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMergeCard = (merge: GitHubMerge) => (
    <div className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-300/50 dark:hover:border-green-600/50">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
          <GitMerge className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {merge.title}
            </h3>
            <a
              href={merge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-green-500" />
            </a>
          </div>

          <SummaryText summary={summary} loading={loading} />

          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{merge.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(merge.timestamp)}</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">#{merge.number}</span>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {merge.repository.split('/').pop()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTicketCard = (ticket: LinearTicket) => {
    const statusColors = {
      created: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };

    const priorityColors = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
      medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <div className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300/50 dark:hover:border-purple-600/50">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {ticket.title}
              </h3>
              <a
                href={ticket.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-purple-500" />
              </a>
            </div>

            {ticket.description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {ticket.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>

              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(ticket.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (activity.type === 'commit') {
    return renderCommitCard(activity.data as GitHubCommit);
  } else if (activity.type === 'merge') {
    return renderMergeCard(activity.data as GitHubMerge);
  } else {
    return renderTicketCard(activity.data as LinearTicket);
  }
};
