// src/components/ui/charts/StackedBarChart.tsx
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface StackedSeries {
  dataKey: string;
  name?: string;
  color: string;
  stackId?: string;
}

interface StackedBarChartProps {
  data: Record<string, string | number>[];
  xAxisKey: string;
  series: StackedSeries[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  xAxisKey,
  series,
  height = 240,
  showLegend = true,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E3E8EF' }}
          />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E3E8EF',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />}
          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color}
              stackId={s.stackId || 'stack'}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
