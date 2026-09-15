import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeeklyTrendsChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 7 },
    { name: 'Wed', count: 6 },
    { name: 'Thu', count: 9 },
    { name: 'Fri', count: 5 },
    { name: 'Sat', count: 1 },
    { name: 'Sun', count: 0 }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Defect Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
