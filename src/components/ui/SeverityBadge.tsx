// src/components/ui/SeverityBadge.tsx
import React from 'react';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md';
  className?: string;
}

const SEVERITY_CONFIG: Record<
  SeverityLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  LOW: {
    label: 'Low',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  className = '',
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded border ${config.bg} ${config.text} ${config.border} ${padding} ${className}`}
      title={`Severity Level: ${config.label}`}
    >
      {config.label}
    </span>
  );
};
