import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl border border-blue-200 dark:border-blue-800 rotate-12">
            <Bug className="h-12 w-12" />
          </div>
        </motion.div>
        
        <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800 tracking-tighter mb-4">
          4<span className="text-blue-500">0</span>4
        </h1>
        
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Page not found
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you mistyped the URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-medium transition-colors shadow-sm">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
