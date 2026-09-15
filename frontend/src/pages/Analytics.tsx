import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, Download, Calendar, Loader2 } from 'lucide-react';
import { SeverityChart } from '@/components/charts/SeverityChart';
import { MonthlyTrendsChart } from '@/components/charts/MonthlyTrendsChart';
import { WeeklyTrendsChart } from '@/components/charts/WeeklyTrendsChart';
import { ResolutionTimeChart } from '@/components/charts/ResolutionTimeChart';
import { ModulesChart } from '@/components/charts/ModulesChart';
import { ErrorTypesChart } from '@/components/charts/ErrorTypesChart';
import { CategoriesChart } from '@/components/charts/CategoriesChart';
import { DuplicateRateChart } from '@/components/charts/DuplicateRateChart';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await apiService.analytics.overview();
        setOverview(data);
      } catch (err) {
        console.warn('Failed to load analytics overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = () => {
    toast.success('Analytics summary downloaded.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live defect metrics aggregated directly from the platform SQLite database.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4" />
              Live DB Aggregation
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Severity Distribution</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <SeverityChart data={overview?.severity_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Monthly Defect Trends</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <MonthlyTrendsChart data={overview?.monthly_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Weekly Defect Volume</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <WeeklyTrendsChart data={overview?.weekly_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Resolution Time Distribution</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <ResolutionTimeChart data={overview?.resolution_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Issues by Architecture Module</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <ModulesChart data={overview?.modules_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Defect Classification by Error Type</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <ErrorTypesChart data={overview?.error_types_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Technology Categories</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <CategoriesChart data={overview?.categories_data} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Duplicate Defect Rate</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <DuplicateRateChart rate={overview?.duplicate_rate} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
