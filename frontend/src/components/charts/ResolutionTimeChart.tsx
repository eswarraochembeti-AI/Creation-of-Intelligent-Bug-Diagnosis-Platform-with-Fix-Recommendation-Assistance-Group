import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ResolutionTimeChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: '<1h', count: 3 },
    { name: '1-4h', count: 6 },
    { name: '4-24h', count: 2 },
    { name: '>24h', count: 1 }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved Bugs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
