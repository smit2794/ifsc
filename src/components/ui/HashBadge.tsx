// src/components/ui/HashBadge.tsx
import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

export type HashIntegrityStatus = 'VERIFIED' | 'MISMATCH' | 'UNVERIFIED';

interface HashBadgeProps {
  hash: string;
  status?: HashIntegrityStatus;
  chars?: number;
  className?: string;
}

export const HashBadge: React.FC<HashBadgeProps> = ({
  hash,
  status = 'VERIFIED',
  chars = 8,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const displayHash = hash ? `${hash.substring(0, chars)}...` : 'N/A';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hash && navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusConfig = {
    VERIFIED: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      title: 'Integrity Verified: SHA-256 signature matches audit archive',
    },
    MISMATCH: {
      color: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      title: 'Integrity Alert: Hash mismatch detected against original capture',
    },
    UNVERIFIED: {
      color: 'bg-gray-50 text-gray-700 border-gray-300',
      icon: HelpCircle,
      iconColor: 'text-gray-400',
      title: 'Verification Pending: SHA-256 seal awaiting scheduled integrity audit',
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <Tooltip content={`SHA-256: ${hash} (${statusConfig.title})`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium tabular-nums select-all ${statusConfig.color} ${className}`}
      >
        <Icon className={`w-3 h-3 shrink-0 ${statusConfig.iconColor}`} />
        <span>{displayHash}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-0.5 hover:bg-black/5 rounded text-gray-500 hover:text-textPrimary transition-colors ml-0.5"
          aria-label="Copy full SHA-256 hash"
          title="Copy full SHA-256 hash"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </span>
    </Tooltip>
  );
};
