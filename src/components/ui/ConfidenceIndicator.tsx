// src/components/ui/ConfidenceIndicator.tsx
import React from 'react';

interface ConfidenceIndicatorProps {
  score: number; // 0 to 100
  label?: string;
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  label,
  className = '',
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  let band = {
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-600',
    text: 'High Confidence',
  };

  if (clampedScore < 50) {
    band = {
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      bar: 'bg-rose-600',
      text: 'Low Confidence',
    };
  } else if (clampedScore < 80) {
    band = {
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      bar: 'bg-amber-600',
      text: 'Moderate Confidence',
    };
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded border text-xs ${band.color} ${className}`}
      title={`AI Evidence Confidence Score: ${clampedScore}% (${band.text})`}
    >
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${band.bar} transition-all duration-300`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <span className="font-semibold tabular-nums">
        {clampedScore}%
      </span>
      {label && <span className="text-[10px] opacity-80">({label})</span>}
    </div>
  );
};
