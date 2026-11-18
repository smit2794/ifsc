// src/components/ui/ManifestViewer.tsx
import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { HashBadge } from './HashBadge';

export interface ManifestItem {
  id: string;
  title: string;
  category: string;
  hash: string;
  sizeBytes: number;
  retentionBasis: string;
}

interface ManifestViewerProps {
  packageId?: string;
  createdAt?: string;
  items: ManifestItem[];
  sealed?: boolean;
  signatory?: string;
  className?: string;
}

export const ManifestViewer: React.FC<ManifestViewerProps> = ({
  packageId = 'PKG-AUDIT-2026-Q3',
  createdAt = 'Today, 10:30 IST',
  items,
  sealed = true,
  signatory = 'Aarav Mehta, Compliance Officer',
  className = '',
}) => {
  const totalBytes = items.reduce((acc, cur) => acc + cur.sizeBytes, 0);

  return (
    <div className={`p-4 bg-white border border-borderColor rounded-md shadow-card space-y-4 text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-borderColor">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-textPrimary text-sm">Evidence Archive Manifest</h4>
            <p className="text-[11px] text-textSecondary font-mono">{packageId}</p>
          </div>
        </div>
        {sealed && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Sealed & Attested
          </span>
        )}
      </div>

      {/* Package Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-gray-50 rounded border border-borderColor text-[11px]">
        <div>
          <span className="text-gray-400 block">Total Items:</span>
          <span className="font-bold text-textPrimary tabular-nums">{items.length} Files</span>
        </div>
        <div>
          <span className="text-gray-400 block">Package Volume:</span>
          <span className="font-bold text-textPrimary tabular-nums">
            {(totalBytes / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <div>
          <span className="text-gray-400 block">Created At:</span>
          <span className="font-bold text-textPrimary">{createdAt}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Attested Signatory:</span>
          <span className="font-bold text-textPrimary truncate">{signatory}</span>
        </div>
      </div>

      {/* Files Manifest Table */}
      <div className="border border-borderColor rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-gray-50/80 border-b border-borderColor font-bold text-textSecondary uppercase">
            <tr>
              <th className="p-2">Item ID & Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Retention Basis</th>
              <th className="p-2 text-right">Integrity Seal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderColor">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/40">
                <td className="p-2">
                  <div className="flex items-center gap-1.5 font-medium text-textPrimary">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                </td>
                <td className="p-2 text-textSecondary">{item.category}</td>
                <td className="p-2 text-textSecondary font-mono text-[10px]">{item.retentionBasis}</td>
                <td className="p-2 text-right">
                  <HashBadge hash={item.hash} status="VERIFIED" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>All items cryptographically sealed in conformance with IFSCA evidentiary standard.</span>
      </div>
    </div>
  );
};
