// src/components/ui/ChecklistItem.tsx
import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, MinusCircle } from 'lucide-react';

export type ChecklistStatus = 'CONFIRMED' | 'EXCEPTION' | 'UNVERIFIED' | 'NOT_APPLICABLE';

interface ChecklistItemProps {
  label: string;
  description?: string;
  status: ChecklistStatus;
  onChange?: (nextStatus: ChecklistStatus) => void;
  disabled?: boolean;
  className?: string;
}

const STATUS_ORDER: ChecklistStatus[] = ['CONFIRMED', 'EXCEPTION', 'UNVERIFIED', 'NOT_APPLICABLE'];

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  label,
  description,
  status,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleToggle = () => {
    if (disabled || !onChange) return;
    const currentIdx = STATUS_ORDER.indexOf(status);
    const nextIdx = (currentIdx + 1) % STATUS_ORDER.length;
    onChange(STATUS_ORDER[nextIdx]);
  };

  const statusConfig = {
    CONFIRMED: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      label: 'Confirmed',
    },
    EXCEPTION: {
      color: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      label: 'Exception Flagged',
    },
    UNVERIFIED: {
      color: 'status-unknown-hatch text-slate-700 border-slate-300',
      icon: HelpCircle,
      iconColor: 'text-slate-500',
      label: 'Unverified',
    },
    NOT_APPLICABLE: {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: MinusCircle,
      iconColor: 'text-gray-400',
      label: 'N/A',
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div
      onClick={handleToggle}
      className={`p-3 rounded-md border flex items-center justify-between gap-3 text-xs transition-all ${
        disabled ? 'cursor-default' : 'cursor-pointer hover:border-brandNavy'
      } bg-white border-borderColor ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${statusConfig.iconColor}`} />
        <div className="truncate">
          <p className="font-semibold text-textPrimary leading-snug">{label}</p>
          {description && (
            <p className="text-[11px] text-textSecondary mt-0.5 leading-normal">{description}</p>
          )}
        </div>
      </div>

      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 select-none ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    </div>
  );
};
