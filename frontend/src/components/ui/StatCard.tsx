import React from 'react';
import { Card, CardContent } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-full">{icon}</div>}
        </div>
        {(description || trend) && (
          <div className="mt-4 flex items-center text-sm">
            {trend && (
              <span className={`flex items-center font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {description && <span className="ml-2 text-gray-500">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
