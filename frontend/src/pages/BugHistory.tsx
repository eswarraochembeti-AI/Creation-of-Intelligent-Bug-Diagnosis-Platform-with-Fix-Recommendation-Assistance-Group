import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, History, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';

const getSeverityColor = (severity: string) => {
  switch(severity?.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
};

const getStatusColor = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
};

export default function BugHistory() {
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await apiService.bugs.list({ limit: 50 });
      setBugs(res.items || []);
    } catch (err) {
      console.error("Failed to load bugs from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleResolve = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvingId(id);
    try {
      await apiService.bugs.resolve(id);
      await fetchBugs();
    } catch (err) {
      console.error("Resolution failed:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = (bug.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(bug.id).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Bug History
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or title..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 flex justify-center items-center text-slate-400">
              <Clock className="w-6 h-6 animate-spin mr-2" /> Loading bug history from database...
            </div>
          ) : filteredBugs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No bug reports found in database matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Severity</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredBugs.map((bug, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      key={bug.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{bug.id}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                        {bug.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)} capitalize`}>
                          {bug.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bug.status)} capitalize`}>
                          {bug.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {bug.created_at ? new Date(bug.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {bug.status !== 'resolved' ? (
                          <button
                            onClick={(e) => handleResolve(bug.id, e)}
                            disabled={resolvingId === bug.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {resolvingId === bug.id ? 'Resolving...' : 'Resolve & Ingest to KB'}
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Trusted Knowledge
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredBugs.length} database entries</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

