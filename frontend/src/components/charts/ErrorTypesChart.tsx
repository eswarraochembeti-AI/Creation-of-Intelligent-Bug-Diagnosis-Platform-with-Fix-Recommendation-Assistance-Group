import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const ErrorTypesChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'NullPointer', value: 35 },
    { name: 'Timeout', value: 25 },
    { name: 'Auth/Token', value: 20 },
    { name: 'MemoryLeak', value: 12 },
    { name: 'Syntax', value: 8 }
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" opacity={0.4} />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
          <Radar name="Defects" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
