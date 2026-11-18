// src/components/ui/ExportFormatModal.tsx
import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useToast } from './Toast';

export type ExportFormat = 'PDF' | 'CSV' | 'XLSX';

interface ExportFormatModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onExport?: (format: ExportFormat) => void;
}

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  open,
  onClose,
  title = 'Export Regulatory Record Archive',
  onExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('PDF');
  const toast = useToast();

  const handleConfirm = () => {
    onExport?.(selectedFormat);
    toast.show({
      message: 'Export prepared',
      description: `${title} successfully prepared in ${selectedFormat} format.`,
      variant: 'success',
    });
    onClose();
  };

  const formats: { format: ExportFormat; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      format: 'PDF',
      label: 'Signed PDF Document',
      desc: 'Official compliance format with cryptographic integrity seals and stamps.',
      icon: FileText,
    },
    {
      format: 'CSV',
      label: 'Structured CSV Dataset',
      desc: 'Raw tabular ledger ready for external audit review and reconciliations.',
      icon: FileSpreadsheet,
    },
    {
      format: 'XLSX',
      label: 'Excel Spreadsheet (.xlsx)',
      desc: 'Formatted multi-tab workbook with metadata headers and formulas.',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-textSecondary hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brandNavy text-white hover:bg-blue-900 rounded"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Export</span>
          </button>
        </div>
      }
    >
      <div className="space-y-2 py-1">
        {formats.map((f) => {
          const Icon = f.icon;
          const isSelected = selectedFormat === f.format;

          return (
            <div
              key={f.format}
              onClick={() => setSelectedFormat(f.format)}
              className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-blue-50/50 border-brandNavy ring-1 ring-brandNavy'
                  : 'bg-white border-borderColor hover:bg-gray-50'
              }`}
            >
              <div
                className={`p-1.5 rounded mt-0.5 ${
                  isSelected ? 'bg-brandNavy text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-textPrimary">{f.label}</p>
                <p className="text-[11px] text-textSecondary mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
