// src/components/ui/FilterBar.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
  selectedValue?: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  onFilterChange?: (key: string, val: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  const hasActiveFilters =
    Boolean(searchValue) || filters.some((f) => f.selectedValue && f.selectedValue !== 'ALL');

  return (
    <div
      className={`p-3 bg-white border border-borderColor rounded-md flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
        {/* Search input */}
        {onSearchChange && (
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-bgPage border border-borderColor rounded focus:outline-none focus:ring-2 focus:ring-brandNavy focus:bg-white"
            />
          </div>
        )}

        {/* Filter dropdowns */}
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-1.5">
            <label className="text-[11px] font-medium text-textSecondary whitespace-nowrap">
              {filter.label}:
            </label>
            <select
              value={filter.selectedValue || 'ALL'}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
              className="py-1.5 px-2 bg-white border border-borderColor rounded text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy"
            >
              <option value="ALL">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-textSecondary hover:text-textPrimary bg-gray-50 hover:bg-gray-100 rounded border border-borderColor transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};
