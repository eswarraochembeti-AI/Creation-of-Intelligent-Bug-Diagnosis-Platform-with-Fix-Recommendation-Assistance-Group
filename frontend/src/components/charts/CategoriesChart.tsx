import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const CategoriesChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Backend Services', value: 45, color: '#3B82F6' },
    { name: 'Frontend & UI', value: 30, color: '#8B5CF6' },
    { name: 'Database & Storage', value: 15, color: '#10B981' },
    { name: 'API & Gateway', value: 10, color: '#F59E0B' }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            dataKey="value"
            paddingAngle={4}
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
