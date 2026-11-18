// src/components/ui/ProgressRing.tsx
import React from 'react';

interface ProgressRingProps {
  percent: number;
  label?: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  label,
  sublabel,
  size = 120,
  strokeWidth = 10,
  color = '#1D3A8A',
  trackColor = '#E3E8EF',
  className = '',
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-xl font-bold text-textPrimary tabular-nums leading-none">
          {label ?? `${Math.round(clampedPercent)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] text-textSecondary font-medium mt-1 truncate max-w-[80%]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
