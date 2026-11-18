// src/components/ui/DiffViewer.tsx
import React, { useState } from 'react';

interface DiffViewerProps {
  originalTitle?: string;
  revisedTitle?: string;
  originalText: string;
  revisedText: string;
  clauseReference?: string;
  effectiveDate?: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalTitle = 'Current Regulatory Requirement',
  revisedTitle = 'Proposed Circular Amendment',
  originalText,
  revisedText,
  clauseReference,
  effectiveDate,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  return (
    <div className={`border border-borderColor rounded-md overflow-hidden bg-white shadow-card text-xs ${className}`}>
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-borderColor flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-textPrimary">Regulatory Clause Comparison</span>
          {clauseReference && (
            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-blue-100 text-brandNavy font-semibold">
              {clauseReference}
            </span>
          )}
          {effectiveDate && (
            <span className="text-[11px] text-textSecondary">
              Effective: {effectiveDate}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded border border-borderColor bg-white overflow-hidden text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'split' ? 'bg-brandNavy text-white' : 'text-textSecondary hover:bg-gray-50'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('unified')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'unified' ? 'bg-brandNavy text-white' : 'text-textSecondary hover:bg-gray-50'
            }`}
          >
            Unified View
          </button>
        </div>
      </div>

      {/* Content comparison */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-borderColor font-mono text-[11px]">
          {/* Original */}
          <div className="p-4 bg-rose-50/20">
            <span className="font-bold text-rose-900 block mb-2 font-sans text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {originalTitle}
            </span>
            <div className="p-3 bg-white rounded border border-rose-200 text-rose-950 whitespace-pre-wrap leading-relaxed">
              {originalText}
            </div>
          </div>

          {/* Revised */}
          <div className="p-4 bg-emerald-50/20">
            <span className="font-bold text-emerald-900 block mb-2 font-sans text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {revisedTitle}
            </span>
            <div className="p-3 bg-white rounded border border-emerald-200 text-emerald-950 whitespace-pre-wrap leading-relaxed">
              {revisedText}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3 font-mono text-[11px]">
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded text-rose-950 line-through">
            {originalText}
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-emerald-950">
            {revisedText}
          </div>
        </div>
      )}
    </div>
  );
};
