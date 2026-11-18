// src/components/ui/CountdownClock.tsx
import React from 'react';
import { useTicker } from '../../hooks/useTicker';
import { formatTimeIST } from '../../utils/dateHelpers';
import { Clock, AlertCircle, CheckCircle2, PauseCircle } from 'lucide-react';

export type ClockState = 'RUNNING' | 'MET' | 'LATE' | 'PAUSED';

interface CountdownClockProps {
  targetTime: Date | string | number;
  fromTime?: Date | string | number;
  state?: ClockState;
  metAt?: Date | string | number;
  lateReason?: string;
  label?: string;
  className?: string;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({
  targetTime,
  fromTime,
  state = 'RUNNING',
  metAt,
  lateReason,
  label,
  className = '',
}) => {
  useTicker(); // Subscribes to the single application-wide 1s pulse

  const targetDate = typeof targetTime === 'object' ? targetTime : new Date(targetTime);
  const fromDate = fromTime ? (typeof fromTime === 'object' ? fromTime : new Date(fromTime)) : null;

  const now = Date.now();
  const diffMs = targetDate.getTime() - now;
  const isOverdue = diffMs <= 0;

  // Determine actual display state
  const effectiveState: ClockState =
    state === 'MET' ? 'MET' : state === 'PAUSED' ? 'PAUSED' : isOverdue ? 'LATE' : 'RUNNING';

  // Calculate format string
  const absDiff = Math.abs(diffMs);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((absDiff / 1000) % 60);

  // Time window percentage for color shift (green -> amber -> red)
  let colorBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (fromDate && effectiveState === 'RUNNING') {
    const totalWindow = targetDate.getTime() - fromDate.getTime();
    if (totalWindow > 0) {
      const remainingRatio = Math.max(0, diffMs / totalWindow);
      if (remainingRatio < 0.2) {
        colorBadge = 'bg-rose-50 text-rose-800 border-rose-200';
      } else if (remainingRatio < 0.5) {
        colorBadge = 'bg-amber-50 text-amber-800 border-amber-200';
      }
    }
  } else if (effectiveState === 'RUNNING' && diffMs < 3600_000) {
    // Under 1 hour remaining
    colorBadge = 'bg-rose-50 text-rose-800 border-rose-200';
  }

  if (effectiveState === 'MET') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200 ${className}`}
        title={`Deadline fulfilled at ${metAt ? formatTimeIST(metAt) : 'record completion'}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {label ? `${label}: ` : ''}
          Met at {metAt ? formatTimeIST(metAt) : 'time of filing'}
        </span>
      </div>
    );
  }

  if (effectiveState === 'PAUSED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold bg-gray-100 text-gray-700 border-gray-300 ${className}`}
      >
        <PauseCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span>{label ? `${label}: ` : ''}Clock Paused</span>
      </div>
    );
  }

  if (effectiveState === 'LATE') {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold bg-rose-50 text-rose-800 border-rose-300 tabular-nums"
          title={lateReason ? `Late: ${lateReason}` : 'Filing deadline exceeded'}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
          <span>
            {label ? `${label}: ` : ''}
            LATE by {days > 0 ? `${days}d ` : ''}
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </span>
        </div>
        {lateReason && (
          <span className="text-[10px] text-rose-700 italic">
            Reason recorded: {lateReason}
          </span>
        )}
      </div>
    );
  }

  // RUNNING state
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold tabular-nums transition-colors ${colorBadge} ${className}`}
      title={`Target deadline: ${targetDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`}
    >
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>
        {label ? `${label}: ` : ''}
        {days > 0 ? `${days}d ` : ''}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
