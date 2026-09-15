import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DuplicateRateChart = ({ rate }: { rate?: number }) => {
  const currentRate = rate !== undefined ? rate : 12.5;
  const chartData = [
    { week: 'W1', duplicateRate: 15 },
    { week: 'W2', duplicateRate: 18 },
    { week: 'W3', duplicateRate: 14 },
    { week: 'Current', duplicateRate: currentRate }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick}%`} />
          <Tooltip formatter={(value) => [`${value}%`, 'Duplicate Rate']} />
          <Line type="stepAfter" dataKey="duplicateRate" stroke="#f43f5e" strokeWidth={2} name="Duplicate Rate" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
