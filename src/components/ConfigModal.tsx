import React, { useState } from 'react';
import { DashboardConfig } from '../types';
import { Settings, Github, Ticket, Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [formData, setFormData] = useState<DashboardConfig>(config);
  const [newRepo, setNewRepo] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showLinearToken, setShowLinearToken] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfigChange(formData);
    onClose();
  };

  const addRepository = () => {
    if (newRepo.trim() && !formData.repositories.includes(newRepo.trim())) {
      setFormData({
        ...formData,
        repositories: [...formData.repositories, newRepo.trim()],
      });
      setNewRepo('');
    }
  };

  const removeRepository = (repo: string) => {
    setFormData({
      ...formData,
      repositories: formData.repositories.filter(r => r !== repo),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Dashboard Configuration
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* GitHub Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                GitHub Integration
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={formData.githubToken || ''}
                  onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showGithubToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  github.com/settings/tokens
                </a>
                {' '}with repo access
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repositories
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newRepo}
                  onChange={(e) => setNewRepo(e.target.value)}
                  placeholder="owner/repository"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addRepository()}
                />
                <button
                  onClick={addRepository}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              <div className="space-y-2">
                {formData.repositories.map((repo) => (
                  <div
                    key={repo}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">{repo}</span>
                    <button
                      onClick={() => removeRepository(repo)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linear Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Linear Integration
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Token
              </label>
              <div className="relative">
                <input
                  type={showLinearToken ? 'text' : 'password'}
                  value={formData.linearToken || ''}
                  onChange={(e) => setFormData({ ...formData, linearToken: e.target.value })}
                  placeholder="lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowLinearToken(!showLinearToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showLinearToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Create a token at{' '}
                <a
                  href="https://linear.app/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  linear.app/settings/api
                </a>
              </p>
            </div>
          </div>

          {/* Refresh Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Refresh Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-refresh interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.refreshInterval / 60000}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  refreshInterval: parseInt(e.target.value) * 60000 
                })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};