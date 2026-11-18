// src/components/ui/MonthCalendar.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  date: Date | string;
  title: string;
  type?: 'OBLIGATION' | 'REPORT' | 'INCIDENT' | 'AUDIT';
  status?: string;
}

interface MonthCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  events,
  onEventClick,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className={`bg-white border border-borderColor rounded-md p-4 shadow-card ${className}`}>
      {/* Month Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-borderColor">
        <h3 className="font-bold text-sm text-textPrimary">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-textPrimary"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-textPrimary"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-textSecondary uppercase tracking-wider mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-16 p-1 bg-gray-50/40 rounded border border-transparent" />
        ))}

        {daysArray.map((day) => {
          const dayEvents = events.filter((ev) => {
            const evDate = typeof ev.date === 'string' ? new Date(ev.date) : ev.date;
            return (
              evDate.getDate() === day &&
              evDate.getMonth() === month &&
              evDate.getFullYear() === year
            );
          });

          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={`day-${day}`}
              className={`h-16 p-1 rounded border text-xs flex flex-col justify-between transition-colors overflow-hidden ${
                isToday
                  ? 'bg-blue-50/50 border-brandNavy/40'
                  : 'bg-white border-borderColor hover:border-gray-400'
              }`}
            >
              <span
                className={`text-[10px] font-semibold tabular-nums ${
                  isToday ? 'text-brandNavy font-bold' : 'text-textSecondary'
                }`}
              >
                {day}
              </span>

              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onEventClick?.(ev)}
                    className="block w-full text-left truncate text-[9px] px-1 py-0.5 rounded font-medium bg-brandNavy text-white hover:bg-blue-900 transition-colors"
                    title={ev.title}
                  >
                    {ev.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-brandNavy font-semibold pl-1">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
