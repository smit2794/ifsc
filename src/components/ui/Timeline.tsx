// src/components/ui/Timeline.tsx
import React from 'react';
import { formatDateTimeIST } from '../../utils/dateHelpers';

export interface TimelineEvent {
  id?: string;
  timestamp: Date | string | number;
  actor: string;
  action: string;
  detail?: string;
  badge?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  if (events.length === 0) {
    return <p className="text-xs text-textSecondary italic">No timeline events recorded.</p>;
  }

  return (
    <div className={`space-y-4 relative ${className}`}>
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id || idx} className="flex items-start gap-3 relative">
            {!isLast && (
              <div className="absolute left-2.5 top-5 bottom-[-16px] w-0.5 bg-gray-200" />
            )}
            <div className="w-5 h-5 rounded-full bg-blue-50 border-2 border-brandNavy shrink-0 mt-0.5 z-10" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-xs text-textPrimary">
                  {event.action}
                </span>
                <span className="text-[10px] text-textSecondary tabular-nums font-mono">
                  {formatDateTimeIST(event.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-textSecondary mt-0.5">
                by <span className="font-medium text-textPrimary">{event.actor}</span>
              </p>
              {event.detail && (
                <p className="text-xs text-textSecondary mt-1 p-2 bg-gray-50 border border-borderColor rounded text-slate-700">
                  {event.detail}
                </p>
              )}
              {event.badge && <div className="mt-1">{event.badge}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
