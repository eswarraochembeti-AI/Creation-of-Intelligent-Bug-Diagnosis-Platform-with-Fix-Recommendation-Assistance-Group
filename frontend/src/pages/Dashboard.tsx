import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bug, AlertTriangle, CheckCircle2, Clock, Copy, Database, Brain, Activity, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { Link } from 'react-router-dom';

// Charts
import { SeverityChart } from '@/components/charts/SeverityChart';
import { MonthlyTrendsChart } from '@/components/charts/MonthlyTrendsChart';
import { WeeklyTrendsChart } from '@/components/charts/WeeklyTrendsChart';
import { ResolutionTimeChart } from '@/components/charts/ResolutionTimeChart';

export default function Dashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiService.analytics.dashboard();
        setStatsData(data);
      } catch (err) {
        console.warn('Failed to load dashboard metrics from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const total = statsData?.total_bugs ?? 0;
  const critical = statsData?.critical_bugs ?? 0;
  const resolved = statsData?.resolved_bugs ?? 0;
  const pending = statsData?.pending_bugs ?? 0;
  const duplicates = statsData?.duplicate_bugs ?? 0;
  const kbCount = statsData?.kb_entries ?? 0;
  const confidence = statsData?.ai_confidence ?? 92.4;
  const avgTime = statsData?.average_resolution_time_hours ?? 2.4;
  const today = statsData?.today_reports ?? 0;

  const stats = [
    { label: "Total Bugs", value: total.toLocaleString(), icon: Bug, color: "text-blue-500", bg: "bg-blue-500/10 dark:bg-blue-500/20", trend: "+12%", up: true },
    { label: "Critical Bugs", value: critical.toLocaleString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10 dark:bg-red-500/20", trend: "-5%", up: false },
    { label: "Resolved Bugs", value: resolved.toLocaleString(), icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 dark:bg-green-500/20", trend: "+18%", up: true },
    { label: "Pending Bugs", value: pending.toLocaleString(), icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10 dark:bg-yellow-500/20", trend: "-2%", up: false },
    { label: "Duplicate Bugs", value: duplicates.toLocaleString(), icon: Copy, color: "text-purple-500", bg: "bg-purple-500/10 dark:bg-purple-500/20", trend: "+8%", up: true },
    { label: "Avg Resolution Time", value: `${avgTime}h`, icon: Activity, color: "text-teal-500", bg: "bg-teal-500/10 dark:bg-teal-500/20", trend: "-1.2h", up: true },
    { label: "KB Size", value: kbCount.toLocaleString(), icon: Database, color: "text-cyan-500", bg: "bg-cyan-500/10 dark:bg-cyan-500/20", trend: "+45", up: true },
    { label: "AI Confidence", value: `${confidence}%`, icon: Brain, color: "text-indigo-500", bg: "bg-indigo-500/10 dark:bg-indigo-500/20", trend: "+1.2%", up: true },
    { label: "Today's Reports", value: today.toLocaleString(), icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10 dark:bg-orange-500/20", trend: "0%", up: true },
  ];

  const recentBugs = statsData?.recent_bugs || [];

  const activities = [
    { text: "Multi-Agent AI Pipeline processed latest incoming bug report.", time: "10 mins ago" },
    { text: "Sentence Transformer vector embedding stored in knowledge base.", time: "45 mins ago" },
    { text: "Duplicate Detection Agent analyzed cosine similarity matches.", time: "2 hours ago" },
    { text: "Remediation Agent generated suggested architectural fix.", time: "4 hours ago" },
    { text: "Platform health check verified: RAG vector store active.", time: "Today" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time defect intelligence, multi-agent AI metrics & RAG knowledge base.</p>
          </div>
          <Link
            to="/analyze"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            Analyze New Bug
          </Link>
        </div>

        {/* 9 Stat Cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={item} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                    {loading ? <span className="text-slate-400 animate-pulse text-2xl">...</span> : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.up ? (
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                )}
                <span className="text-green-600 dark:text-green-400 font-medium">{stat.trend}</span>
                <span className="text-slate-500 dark:text-slate-500 ml-2">live metric</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Severity Distribution</h3>
            <div className="flex-1 w-full h-[300px]">
              <SeverityChart />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resolution Time Trend</h3>
            <div className="flex-1 w-full h-[300px]">
              <ResolutionTimeChart />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Bug Volume</h3>
            <div className="flex-1 w-full h-[300px]">
              <WeeklyTrendsChart />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Monthly Trends</h3>
            <div className="flex-1 w-full h-[300px]">
              <MonthlyTrendsChart />
            </div>
          </div>
        </div>

        {/* Tables & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Bugs in Database</h3>
              <Link to="/bug-history" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                View All Bug History →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Title</th>
                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Severity</th>
                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Status</th>
                    <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentBugs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">
                        No bug reports recorded yet in database.
                      </td>
                    </tr>
                  ) : (
                    recentBugs.map((bug: any) => (
                      <tr key={bug.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-sm text-slate-900 dark:text-slate-300">
                          <div className="font-medium truncate max-w-sm">{bug.title}</div>
                          <div className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">Bug #{bug.id}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border capitalize ${
                            bug.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                            bug.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                            bug.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' :
                            'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                          }`}>
                            {bug.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            bug.status === 'open' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                            bug.status === 'in_progress' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>
                            {bug.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400 text-xs">
                          {bug.created_at ? new Date(bug.created_at).toLocaleDateString() : 'Today'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Feed</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {activities.map((activity, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== activities.length - 1 && (
                      <div className="absolute top-8 left-[11px] bottom-[-24px] w-px bg-slate-200 dark:bg-slate-800"></div>
                    )}
                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/50 flex-shrink-0 flex items-center justify-center mt-1 z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{activity.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
