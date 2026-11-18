// src/components/ui/charts/LineChart.tsx
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface LineSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

interface LineChartProps {
  data: Record<string, string | number>[];
  xAxisKey: string;
  series: LineSeries[];
  height?: number;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  series,
  height = 240,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E3E8EF' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E3E8EF',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
            }}
          />
          {series.map((s, idx) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color || (idx === 0 ? '#1D3A8A' : '#0F9D8A')}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color || '#1D3A8A' }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
