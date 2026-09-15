import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MonthlyTrendsChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Jan', bugs: 5, resolved: 3 },
    { name: 'Feb', bugs: 8, resolved: 6 },
    { name: 'Mar', bugs: 12, resolved: 9 }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bugs" stroke="#ef4444" strokeWidth={2} name="Reported Defects" />
          <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
