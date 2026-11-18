// src/components/ui/KPICard.tsx
import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string | number;
    isPositive?: boolean;
    period?: string;
  };
  subtitle?: string;
  statusBadge?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  delta,
  subtitle,
  statusBadge,
  icon: Icon,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`bg-white border border-borderColor rounded-md p-4 shadow-card transition-all ${
        isClickable
          ? 'cursor-pointer hover:border-brandNavy hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brandNavy'
          : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-textSecondary uppercase tracking-wider truncate">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-md bg-gray-50 text-brandNavy border border-borderColor shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-textPrimary tabular-nums">
          {value}
        </div>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>

      {(delta || subtitle) && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-textSecondary">
          {delta && (
            <span
              className={`font-semibold tabular-nums flex items-center gap-0.5 ${
                delta.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <span>{delta.isPositive ? '↑' : '↓'}</span>
              <span>{delta.value}</span>
              {delta.period && <span className="text-gray-400 font-normal ml-1">vs {delta.period}</span>}
            </span>
          )}
          {subtitle && <span className="truncate text-[11px] text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
