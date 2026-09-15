import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ModulesChartProps {
  data?: Array<{ name?: string; module?: string; count?: number; errors?: number }>;
}

export const ModulesChart = ({ data }: ModulesChartProps) => {
  const chartData = data && data.length > 0 ? data.map(d => ({
    module: d.module || d.name || 'Module',
    errors: d.errors ?? d.count ?? 0
  })) : [
    { module: 'Auth', errors: 12 },
    { module: 'Payment', errors: 8 },
    { module: 'Database', errors: 6 },
    { module: 'API', errors: 15 },
    { module: 'UI', errors: 4 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="module" type="category" />
          <Tooltip cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="errors" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
