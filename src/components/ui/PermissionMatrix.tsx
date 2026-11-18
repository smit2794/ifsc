// src/components/ui/PermissionMatrix.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, AlertTriangle } from 'lucide-react';
import { buildLink } from '../../utils/buildLink';

export interface RoleColumn {
  key: string;
  label: string;
  isTradingRole?: boolean;
}

export interface PersonPermissions {
  id: string;
  name: string;
  department: string;
  primaryRole: string;
  roles: Record<string, boolean>; // roleKey -> hasRole
  hasConflict?: boolean;
  conflictDetails?: {
    roleKey: string;
    caseId: string;
    message: string;
  };
}

interface PermissionMatrixProps {
  roles: RoleColumn[];
  people: PersonPermissions[];
  className?: string;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  roles,
  people,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-borderColor rounded-md shadow-card overflow-hidden text-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-borderColor text-textSecondary uppercase tracking-wider text-[11px] font-bold">
              <th className="p-3 sticky left-0 bg-gray-50 z-10 border-r border-borderColor min-w-[180px]">
                Staff Member & Department
              </th>
              {roles.map((r) => (
                <th key={r.key} className="p-3 text-center min-w-[110px]">
                  <span>{r.label}</span>
                  {r.isTradingRole && (
                    <span className="block text-[9px] text-amber-700 font-normal mt-0.5">
                      Trading Desk
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borderColor">
            {people.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50/50">
                {/* Person identification */}
                <td className="p-3 sticky left-0 bg-white border-r border-borderColor z-10">
                  <div className="font-semibold text-textPrimary">{person.name}</div>
                  <div className="text-[11px] text-textSecondary">{person.primaryRole} · {person.department}</div>
                </td>

                {/* Role cells */}
                {roles.map((r) => {
                  const hasPermission = Boolean(person.roles[r.key]);
                  const isConflictCell =
                    person.hasConflict && person.conflictDetails?.roleKey === r.key;

                  if (isConflictCell) {
                    return (
                      <td
                        key={r.key}
                        className="p-2 text-center bg-rose-100 border-2 border-rose-500 rounded-sm transition-colors hover:bg-rose-200"
                      >
                        <Link
                          to={buildLink(`/clients/cases/${person.conflictDetails?.caseId || 'CASE-2026-031'}`)}
                          className="inline-flex flex-col items-center gap-1 group py-0.5 px-1.5 rounded"
                          title={person.conflictDetails?.message || 'Conflict of Interest: SoD violation detected'}
                        >
                          <span className="p-1 rounded-full bg-rose-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[10px] font-bold text-rose-900 underline decoration-rose-600 group-hover:text-rose-950">
                            {person.conflictDetails?.caseId}
                          </span>
                        </Link>
                      </td>
                    );
                  }

                  return (
                    <td key={r.key} className="p-3 text-center">
                      {hasPermission ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-50 text-emerald-700">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full text-gray-300">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
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
