import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, BookOpen, Clock, Tag, RefreshCw } from 'lucide-react';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await apiService.knowledge.list({ search: searchTerm || undefined, limit: 50 });
      setEntries(res.items || []);
    } catch (err) {
      console.error("Failed to fetch knowledge base entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKnowledge();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Trusted Knowledge Base (RAG)
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search historical resolutions and defect knowledge..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Querying vector knowledge base...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No historical knowledge entries found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Newly resolved bugs with confirmed resolutions will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                key={entry.id} 
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
              >
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {entry.title}
                  </h3>
                </div>
                
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 space-y-2 flex-1">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Root Cause:</span>
                    <p className="line-clamp-2 text-slate-500 dark:text-slate-400 mt-0.5">{entry.root_cause}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Resolution:</span>
                    <p className="line-clamp-2 text-emerald-600 dark:text-emerald-400 mt-0.5">{entry.fix_description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                    <Tag className="h-3 w-3" /> KB #{entry.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

