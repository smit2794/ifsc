// src/components/ui/AIDraftBanner.tsx
import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Modal } from './Modal';

export interface AIDraftBannerProps {
  onAccept?: () => void;
  onReject?: (reason: string) => void;
  confidence?: number;
  citedEventsCount?: number;
  title?: string;
  className?: string;
}

export const AIDraftBanner: React.FC<AIDraftBannerProps> = ({
  onAccept,
  onReject,
  confidence = 88,
  citedEventsCount = 3,
  title = 'AI draft: requires human review',
  className = '',
}) => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const handleAccept = () => {
    setStatus('ACCEPTED');
    onAccept?.();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    setStatus('REJECTED');
    setRejectOpen(false);
    onReject?.(rejectReason.trim());
  };

  return (
    <div
      className={`border rounded-md p-3 transition-all ${
        status === 'ACCEPTED'
          ? 'bg-emerald-50 border-emerald-300'
          : status === 'REJECTED'
          ? 'bg-rose-50 border-rose-300'
          : 'bg-amber-50/70 border-amber-300'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-amber-100 text-amber-900 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-textPrimary tracking-tight">
                {title}
              </span>
              <ConfidenceIndicator score={confidence} />
              {citedEventsCount > 0 && (
                <span className="text-[10px] text-textSecondary font-medium bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                  {citedEventsCount} verified events cited
                </span>
              )}
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Draft synthesized by read-only analysis engine. Human compliance officer decision required.
            </p>
          </div>
        </div>

        {/* Actions */}
        {status === 'PENDING' && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-brandNavy text-white text-xs font-semibold hover:bg-blue-900 transition-colors focus:ring-2 focus:ring-brandNavy"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Draft</span>
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        )}

        {status === 'ACCEPTED' && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
            Accepted by Compliance Officer
          </span>
        )}

        {status === 'REJECTED' && (
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded">
            Proposal Rejected
          </span>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject AI Proposal"
        subtitle="Record the rationale for audit log compliance."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 rounded disabled:opacity-50"
            >
              Submit Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <label className="block text-xs font-bold text-textPrimary">
            Reason for rejecting AI draft
          </label>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why the synthesized proposal was not accepted..."
            className="w-full p-2 border border-borderColor rounded-md text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </Modal>
    </div>
  );
};
