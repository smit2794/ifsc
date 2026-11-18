// src/components/ui/CitationChip.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Popover } from './Popover';
import { BookOpen, ExternalLink } from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

export interface CitationChipProps {
  code: string; // e.g. "S2"
  clause: string; // e.g. "CMI Reg. 9"
  sourceTitle?: string; // e.g. "IFSCA (Capital Market Intermediaries) Regulations, 2021"
  clauseText?: string;
  version?: string;
  className?: string;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  code,
  clause,
  sourceTitle = 'IFSCA Regulatory Framework',
  clauseText = 'Mandatory governance and internal control requirement under GIFT IFSC guidelines.',
  version = 'v2.4 (Active)',
  className = '',
}) => {
  return (
    <Popover
      className={className}
      trigger={
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50/70 text-brandNavy border border-blue-200/80 hover:bg-blue-100 hover:border-brandNavy transition-all cursor-pointer"
          title={`Regulatory Citation: [${code} · ${clause}]`}
        >
          <BookOpen className="w-3 h-3 text-brandNavy/70" />
          <span>
            [{code} · {clause}]
          </span>
        </span>
      }
      content={
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-1 pb-1.5 border-b border-borderColor">
            <div>
              <span className="font-bold text-xs text-brandNavy font-mono">
                {code} · {clause}
              </span>
              <p className="text-[10px] text-textSecondary font-medium">{sourceTitle}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-700">
              {version}
            </span>
          </div>

          <p className="text-[11px] text-slate-700 italic leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
            "{clauseText}"
          </p>

          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Authority: IFSCA</span>
            <Link
              to={buildLink('/ai', { tab: 'sources', source: code })}
              className="inline-flex items-center gap-1 font-semibold text-brandNavy hover:underline"
            >
              <span>View Regulation Source</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      }
    />
  );
};
