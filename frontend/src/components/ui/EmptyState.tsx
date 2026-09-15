import React from 'react';
import { motion } from 'framer-motion';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-gray-300 bg-gray-50"
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gray-500">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};
