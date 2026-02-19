import React from "react";
import { FilterOptions } from "../types";
import { Filter, Github, Ticket, Calendar } from "lucide-react";

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}) => {
  const FilterButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ active, onClick, children, icon }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
          : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </button>
  );

  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} activities
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Source Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Source:
          </span>
          <FilterButton
            active={filters.source === "all"}
            onClick={() => onFiltersChange({ ...filters, source: "all" })}
          >
            All
          </FilterButton>
          <FilterButton
            active={filters.source === "github"}
            onClick={() => onFiltersChange({ ...filters, source: "github" })}
            icon={<Github />}
          >
            GitHub
          </FilterButton>
          <FilterButton
            active={filters.source === "linear"}
            onClick={() => onFiltersChange({ ...filters, source: "linear" })}
            icon={<Ticket />}
          >
            Linear
          </FilterButton>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Time Range Filters */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            Time:
          </span>
          <FilterButton
            active={filters.timeRange === "all"}
            onClick={() => onFiltersChange({ ...filters, timeRange: "all" })}
          >
            All Time
          </FilterButton>
          <FilterButton
            active={filters.timeRange === "24h"}
            onClick={() => onFiltersChange({ ...filters, timeRange: "24h" })}
          >
            24h
          </FilterButton>
          <FilterButton
            active={filters.timeRange === "7d"}
            onClick={() => onFiltersChange({ ...filters, timeRange: "7d" })}
          >
            7d
          </FilterButton>
          <FilterButton
            active={filters.timeRange === "30d"}
            onClick={() => onFiltersChange({ ...filters, timeRange: "30d" })}
          >
            30d
          </FilterButton>
        </div>
      </div>
    </div>
  );
};
