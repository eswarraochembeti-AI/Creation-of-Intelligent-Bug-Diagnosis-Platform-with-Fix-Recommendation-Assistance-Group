import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-blue-600', 
  height = 'h-2' 
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${height}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};
