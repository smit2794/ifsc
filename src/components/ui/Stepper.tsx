// src/components/ui/Stepper.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: string | number; // Step name or 0-indexed number
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  className = '',
}) => {
  const currentIndex =
    typeof currentStep === 'number'
      ? currentStep
      : steps.findIndex((s) => s.toLowerCase() === String(currentStep).toLowerCase());

  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step} className="flex items-start gap-3 relative">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-[-16px] w-0.5 ${
                    idx < activeIdx ? 'bg-brandNavy' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                  isCompleted
                    ? 'bg-brandNavy text-white'
                    : isCurrent
                    ? 'bg-brandNavy text-white ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-500 border border-borderColor'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="pt-0.5">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-brandNavy' : isCompleted ? 'text-textPrimary' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto py-2 ${className}`}>
      <ol className="flex items-center min-w-max">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <li key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isCompleted
                      ? 'bg-brandNavy text-white'
                      : isCurrent
                      ? 'bg-brandNavy text-white ring-4 ring-blue-100'
                      : 'bg-gray-100 text-gray-500 border border-borderColor'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent
                      ? 'text-brandNavy'
                      : isCompleted
                      ? 'text-textPrimary'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 mx-2 ${
                    idx < activeIdx ? 'bg-brandNavy' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
