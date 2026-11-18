// src/components/ui/WizardModal.tsx
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Stepper } from './Stepper';

export interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface WizardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: WizardStep[];
  onFinish: () => void;
  finishLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const WizardModal: React.FC<WizardModalProps> = ({
  open,
  onClose,
  title,
  steps,
  onFinish,
  finishLabel = 'Finish & Submit',
  size = 'lg',
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [validating, setValidating] = useState(false);

  const stepNames = steps.map((s) => s.title);
  const activeStep = steps[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === steps.length - 1;

  const handleNext = async () => {
    if (activeStep?.validate) {
      setValidating(true);
      try {
        const isValid = await activeStep.validate();
        if (!isValid) return;
      } finally {
        setValidating(false);
      }
    }

    if (isLast) {
      onFinish();
      onClose();
    } else {
      setCurrentStepIdx((idx) => idx + 1);
    }
  };

  const handleBack = () => {
    setCurrentStepIdx((idx) => Math.max(0, idx - 1));
  };

  const handleClose = () => {
    setCurrentStepIdx(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size={size}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst || validating}
            className="px-3 py-1.5 text-xs font-medium text-textSecondary bg-white border border-borderColor rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={validating}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brandNavy rounded-md hover:bg-blue-900 transition-colors focus:ring-2 focus:ring-brandNavy disabled:opacity-50"
            >
              {validating ? 'Validating...' : isLast ? finishLabel : 'Next Step'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <Stepper steps={stepNames} currentStep={currentStepIdx} />

        {activeStep?.description && (
          <p className="text-xs text-textSecondary pb-2 border-b border-borderColor">
            {activeStep.description}
          </p>
        )}

        <div className="py-2">{activeStep?.content}</div>
      </div>
    </Modal>
  );
};
