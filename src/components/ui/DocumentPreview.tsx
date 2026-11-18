// src/components/ui/DocumentPreview.tsx
import React from 'react';
import { FileText, FileSpreadsheet, FileCode, File, Download, ShieldCheck } from 'lucide-react';
import { HashBadge } from './HashBadge';

interface DocumentPreviewProps {
  fileName: string;
  fileSize?: string | number;
  category?: string;
  uploadedAt?: string;
  sha256?: string;
  onDownload?: () => void;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  fileSize = '1.4 MB',
  category = 'Statutory Filing',
  uploadedAt,
  sha256,
  onDownload,
  className = '',
}) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const Icon =
    ext === 'pdf'
      ? FileText
      : ext === 'csv' || ext === 'xlsx'
      ? FileSpreadsheet
      : ext === 'json'
      ? FileCode
      : File;

  return (
    <div className={`p-4 bg-white border border-borderColor rounded-md shadow-card space-y-3 text-xs ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded bg-blue-50 text-brandNavy border border-blue-100 shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-textPrimary truncate">{fileName}</h4>
            <div className="flex items-center gap-2 text-[11px] text-textSecondary mt-0.5">
              <span>{category}</span>
              <span>•</span>
              <span className="tabular-nums">{typeof fileSize === 'number' ? `${(fileSize / 1024).toFixed(1)} KB` : fileSize}</span>
              {uploadedAt && (
                <>
                  <span>•</span>
                  <span>{uploadedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="p-1.5 rounded border border-borderColor hover:bg-gray-50 text-textSecondary hover:text-textPrimary transition-colors"
            title="Download preview file"
            aria-label="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {sha256 && (
        <div className="pt-2 border-t border-borderColor flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Integrity Sealed
          </span>
          <HashBadge hash={sha256} status="VERIFIED" />
        </div>
      )}
    </div>
  );
};
