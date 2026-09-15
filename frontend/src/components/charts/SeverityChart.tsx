import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SeverityChartProps {
  data?: Array<{ name: string; value: number; fill?: string; color?: string }>;
}

export const SeverityChart = ({ data }: SeverityChartProps) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Critical', value: 4, color: '#ef4444' },
    { name: 'High', value: 8, color: '#f97316' },
    { name: 'Medium', value: 12, color: '#eab308' },
    { name: 'Low', value: 6, color: '#10b981' },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color || entry.fill || '#3b82f6'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
