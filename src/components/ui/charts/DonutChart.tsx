// src/components/ui/charts/DonutChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export interface DonutSegment {
  name: string;
  value: number;
  color?: string;
  isUnknown?: boolean;
}

interface DonutChartProps {
  data: DonutSegment[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerText?: {
    value: string | number;
    label: string;
  };
  className?: string;
}

const DEFAULT_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#94A3B8', '#3B82F6'];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 220,
  innerRadius = 60,
  outerRadius = 85,
  centerText,
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Pattern def for UNKNOWN hatch */}
          <defs>
            <pattern
              id="unknownDiagonalHatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#94A3B8" strokeWidth="2" />
            </pattern>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => {
              const fill = entry.isUnknown
                ? 'url(#unknownDiagonalHatch)'
                : entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={fill}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              );
            })}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="bg-white border border-borderColor p-2 rounded shadow-md text-xs">
                    <p className="font-semibold text-textPrimary">{item.name}</p>
                    <p className="text-textSecondary tabular-nums font-bold">
                      Count: {item.value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center value overlay */}
      {centerText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-textPrimary tabular-nums leading-none">
            {centerText.value}
          </span>
          <span className="text-[10px] text-textSecondary font-medium mt-1 uppercase tracking-wider">
            {centerText.label}
          </span>
        </div>
      )}
    </div>
  );
};
