import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Copy, CheckCircle2, AlertTriangle, AlertCircle, FileText, AlertOctagon } from 'lucide-react';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';

export default function DuplicateIssues() {
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!inputText.trim()) return;
    setIsChecking(true);
    setErrorMsg(null);
    try {
      const res = await apiService.bugs.checkDuplicates({
        text: inputText,
        duplicate_threshold: 0.8,
        similar_threshold: 0.4
      });
      setDuplicateData(res);
    } catch (err: any) {
      console.error("Duplicate check failed:", err);
      setErrorMsg("Failed to run vector duplicate search. Please check backend connection.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Copy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Semantic Duplicate Detection
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">New Issue Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Paste the bug description or stack trace below to perform dense vector similarity search across historical defects.</p>
            
            <textarea 
              className="w-full flex-1 min-h-[300px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none font-mono text-sm"
              placeholder="Paste bug description or stack trace here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleCheck}
                disabled={isChecking || !inputText.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                {isChecking ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Checking Embeddings...</>
                ) : (
                  <><FileText className="h-4 w-4" /> Check for Duplicates</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vector Search Results</h2>

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm mb-4">
                {errorMsg}
              </div>
            )}
            
            {!duplicateData && !isChecking && (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <Copy className="h-12 w-12 mb-4 opacity-50" />
                <p>Paste bug details and click check to search vector embeddings</p>
              </div>
            )}
            
            {isChecking && (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                  <p>Generating 384-d MiniLM vector embeddings & computing cosine similarity...</p>
                </div>
              </div>
            )}

            {!isChecking && duplicateData && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Highest Similarity: <strong className="text-slate-900 dark:text-white">{duplicateData.highest_similarity}%</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold uppercase ${
                    duplicateData.is_likely_duplicate 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {duplicateData.is_likely_duplicate ? '⚠️ Likely Duplicate (>80%)' : '✅ Unique / Low Match'}
                  </span>
                </div>

                {duplicateData.similar_bugs?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm italic">
                    No sufficiently similar historical bugs found in knowledge base above configured threshold.
                  </div>
                ) : (
                  duplicateData.similar_bugs.map((item: any, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      key={item.id || i} 
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KB #{item.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 capitalize">
                              {item.status || 'resolved'}
                            </span>
                          </div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                          {item.root_cause && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              Root Cause: {item.root_cause}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 font-bold text-lg">
                            {item.similarity_score >= 80 ? (
                              <AlertOctagon className="h-5 w-5 text-red-500" />
                            ) : item.similarity_score >= 50 ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            <span className={item.similarity_score >= 80 ? 'text-red-600 dark:text-red-400' : item.similarity_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                              {item.similarity_score}%
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">Cosine Score</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${item.similarity_score >= 80 ? 'bg-red-500' : item.similarity_score >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(item.similarity_score, 100)}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

