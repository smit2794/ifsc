// src/components/ui/ConfirmDialog.tsx
import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title = 'Confirmation Required',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertCircle : AlertTriangle;

  const confirmBtnStyles = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
    : 'bg-brandNavy hover:bg-blue-900 text-white focus:ring-brandNavy';

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-textSecondary bg-white border border-borderColor rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${confirmBtnStyles}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-2">
        <div
          className={`p-2 rounded-full shrink-0 ${
            isDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs text-textSecondary leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};
