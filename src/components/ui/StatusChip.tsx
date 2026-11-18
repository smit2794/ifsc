// src/components/ui/StatusChip.tsx
import React from 'react';

export type ControlStatus = 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN' | 'NOT_APPLICABLE';

interface StatusChipProps {
  status: ControlStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<
  ControlStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string }
> = {
  PASS: {
    label: 'PASS',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  FAIL: {
    label: 'FAIL',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-200',
    dotClass: 'bg-rose-600',
  },
  WARNING: {
    label: 'WARNING',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-600',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    bgClass: 'status-unknown-hatch',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    dotClass: 'bg-slate-500',
  },
  NOT_APPLICABLE: {
    label: 'N/A',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-800',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-600',
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded border tabular-nums select-none ${config.bgClass} ${config.textClass} ${config.borderClass} ${padding} ${className}`}
      title={`Control Evaluation Status: ${config.label}`}
      role="status"
    >
      {showIcon && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
