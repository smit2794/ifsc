// src/components/ui/RosterGrid.tsx
import React from 'react';

export interface RosterStaffShift {
  staffId: string;
  staffName: string;
  role: string;
  shifts: {
    day: string; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    shiftType: 'REGULAR' | 'BACKUP_OFFICER' | 'ON_CALL' | 'LEAVE';
    desk?: string;
  }[];
}

interface RosterGridProps {
  roster: RosterStaffShift[];
  weekLabel?: string;
  className?: string;
}

const SHIFT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  REGULAR: { bg: 'bg-blue-50/70', text: 'text-brandNavy', label: 'Duty' },
  BACKUP_OFFICER: { bg: 'bg-teal-50', text: 'text-teal-900', label: 'Backup CO' },
  ON_CALL: { bg: 'bg-amber-50', text: 'text-amber-800', label: 'On Call' },
  LEAVE: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Off' },
};

export const RosterGrid: React.FC<RosterGridProps> = ({
  roster,
  weekLabel = 'Current Regulatory Week (Mon – Sun)',
  className = '',
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`bg-white border border-borderColor rounded-md shadow-card overflow-hidden text-xs ${className}`}>
      <div className="p-3 bg-gray-50 border-b border-borderColor flex items-center justify-between">
        <span className="font-bold text-textPrimary">Staff Compliance Duty Roster</span>
        <span className="text-[11px] text-textSecondary font-medium">{weekLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-borderColor text-textSecondary uppercase tracking-wider text-[11px] font-bold">
              <th className="p-3 sticky left-0 bg-gray-50 z-10 border-r border-borderColor min-w-[160px]">
                Staff Member
              </th>
              {days.map((day) => (
                <th key={day} className="p-2.5 text-center min-w-[90px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borderColor">
            {roster.map((row) => (
              <tr key={row.staffId} className="hover:bg-gray-50/50">
                <td className="p-3 sticky left-0 bg-white border-r border-borderColor z-10">
                  <div className="font-semibold text-textPrimary">{row.staffName}</div>
                  <div className="text-[10px] text-textSecondary">{row.role}</div>
                </td>

                {row.shifts.map((shift, idx) => {
                  const style = SHIFT_STYLES[shift.shiftType] || SHIFT_STYLES.REGULAR;
                  return (
                    <td key={idx} className="p-2 text-center">
                      <span
                        className={`inline-block w-full py-1 px-1 rounded text-[10px] font-semibold border border-transparent ${style.bg} ${style.text}`}
                        title={`${row.staffName} - ${shift.day}: ${shift.shiftType} ${shift.desk ? `(${shift.desk})` : ''}`}
                      >
                        {style.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
