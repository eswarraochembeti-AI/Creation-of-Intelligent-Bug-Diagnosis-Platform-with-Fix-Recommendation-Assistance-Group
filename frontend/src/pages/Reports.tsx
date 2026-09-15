import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileBarChart, Download, FileText, Table, Printer, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiService.reports.generate(reportType);
      setReportData(data);
    } catch (err) {
      console.warn('Failed to load report from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCsv = () => {
    if (!reportData || !reportData.items || reportData.items.length === 0) {
      toast.error('No report data available to export.');
      return;
    }

    const headers = ['ID', 'Title', 'Severity', 'Priority', 'Status', 'Module', 'Root Cause', 'Recommended Fix', 'Created At'];
    const rows = reportData.items.map((item: any) => [
      item.id,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.severity,
      item.priority,
      item.status,
      item.module,
      `"${(item.root_cause || '').replace(/"/g, '""')}"`,
      `"${(item.recommended_fix || '').replace(/"/g, '""')}"`,
      item.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buglens_${reportType}_defect_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || {
    total_bugs: 0,
    resolved_bugs: 0,
    critical_bugs: 0,
    high_bugs: 0,
    resolution_rate: 0,
  };

  const findings = reportData?.findings || [
    'Generating comprehensive defect diagnosis analysis from SQLite database records.',
    'Tracking multi-agent resolution rates and RAG vector store additions.'
  ];

  const items = reportData?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileBarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Report Generation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate structured defect intelligence reports and export database diagnostics.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm cursor-pointer"
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Overview</option>
                <option value="monthly">Monthly Analysis</option>
                <option value="developer">Developer Performance</option>
                <option value="project">Project Defect Breakdown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scope Filter</label>
              <input 
                type="text" 
                placeholder="All projects / Active sprint"
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-sm outline-none cursor-not-allowed" 
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={fetchReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart className="w-4 h-4" />}
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {reportType} Defect Intelligence Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generated from SQLite database & multi-agent AI diagnosis records
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </button>
              <button 
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Issues Analyzed</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total_bugs}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Resolved Issues</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.resolved_bugs}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Resolution Rate</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.resolution_rate}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Critical Defect Count</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.critical_bugs}</div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Key Intelligence Findings</h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {findings.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Detailed Defect Table */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Recent Defect Records</h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No defect records available in database.
                      </td>
                    </tr>
                  ) : (
                    items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">#{item.id}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate font-medium">{item.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full capitalize font-semibold ${
                            item.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                            item.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full capitalize font-semibold ${
                            item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                          {item.root_cause}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
