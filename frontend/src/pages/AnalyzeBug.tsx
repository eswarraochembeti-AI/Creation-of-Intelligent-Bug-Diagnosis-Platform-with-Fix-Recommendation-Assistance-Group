import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Brain, FileText, CheckCircle, Database, Search, Zap, RefreshCw, Download, Copy, Check, AlertTriangle, AlertCircle, Upload, Image as ImageIcon, FileCode, Trash2, X, Eye } from 'lucide-react';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

type State = 'INPUT' | 'ANALYZING' | 'RESULTS';

const EXAMPLE_STACK_TRACE = `java.lang.NullPointerException: Cannot invoke "String.length()" because "user.name" is null
    at com.example.service.UserService.processUserData(UserService.java:42)
    at com.example.controller.UserController.handleRequest(UserController.java:18)
    at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:117)
    at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089)
    at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:168)
    at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)`;

const PIPELINE_STEPS = [
  { id: 'triage', name: 'Triage', icon: AlertTriangle },
  { id: 'log', name: 'Log Analysis', icon: FileText },
  { id: 'root', name: 'Root Cause', icon: Search },
  { id: 'duplicate', name: 'Duplicate Check', icon: Database },
  { id: 'remediation', name: 'Remediation', icon: Zap },
];

export default function AnalyzeBug() {
  const [state, setState] = useState<State>('INPUT');
  const [inputContent, setInputContent] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [activeTab, setActiveTab] = useState('Bug Report');
  const [currentStep, setCurrentStep] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadedAttachment, setUploadedAttachment] = useState<{ url: string; name: string; isImage: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real API analysis result state
  const [analysisData, setAnalysisData] = useState<{ bug: any; report: any } | null>(null);

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Clipboard Paste handler (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent | ClipboardEvent) => {
    const items = (e as any).clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          toast.success('Image screenshot pasted from clipboard.');
          break;
        }
      }
    }
  };

  useEffect(() => {
    const windowPasteListener = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            toast.success('Image screenshot pasted from clipboard.');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', windowPasteListener);
    return () => window.removeEventListener('paste', windowPasteListener);
  }, []);

  const processFile = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    setSelectedFile(file);

    if (isImage) {
      const preview = URL.createObjectURL(file);
      setFilePreviewUrl(preview);
    } else {
      setFilePreviewUrl(null);
      // Read text/log file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setInputContent(text);
          if (!bugTitle) {
            setBugTitle(file.name.replace(/\.[^/.]+$/, ""));
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    const content = inputContent.trim();
    if (!content && !selectedFile) {
      setErrorMsg("Please enter bug details or attach a file/screenshot to analyze.");
      return;
    }

    setErrorMsg(null);
    setState('ANALYZING');
    setCurrentStep(0);

    // Progress animation timers
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      let attachmentInfo: { url: string; name: string; isImage: boolean } | null = null;

      // Real upload if file is attached
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await apiService.bugs.upload(selectedFile);
        if (uploadRes && uploadRes.file_url) {
          attachmentInfo = {
            url: uploadRes.file_url,
            name: uploadRes.filename || selectedFile.name,
            isImage: uploadRes.is_image || selectedFile.type.startsWith('image/')
          };
          setUploadedAttachment(attachmentInfo);
        }
      }

      const isStackTrace = activeTab === 'Stack Trace';
      const isErrorLog = activeTab === 'Error Log';

      const payload = {
        title: bugTitle.trim() || undefined,
        description: content || (selectedFile ? `Uploaded attachment: ${selectedFile.name}` : 'Bug report analysis'),
        bug_text: content || (selectedFile ? `Uploaded file: ${selectedFile.name}` : 'Bug report'),
        stack_trace: isStackTrace ? content : undefined,
        error_log: isErrorLog ? content : undefined,
        attachment_url: attachmentInfo?.url,
        attachment_name: attachmentInfo?.name,
      };

      const result = await apiService.bugs.analyze(payload);
      
      clearInterval(stepInterval);
      setCurrentStep(PIPELINE_STEPS.length);
      setAnalysisData(result);

      setTimeout(() => {
        setState('RESULTS');
      }, 500);

    } catch (err: any) {
      clearInterval(stepInterval);
      console.error("Analysis API Error:", err);
      setErrorMsg(
        err.response?.data?.detail || 
        "Unable to connect to the analysis service. Please make sure the backend server is running on port 8000."
      );
      setState('INPUT');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisData) return;
    const summaryText = `[Bug Analysis Report #${analysisData.bug?.id}]\nTitle: ${analysisData.bug?.title}\nRoot Cause: ${analysisData.report?.root_cause_result?.most_probable_cause}\nFix: ${analysisData.report?.remediation_result?.permanent_fix}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto text-slate-900 dark:text-slate-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Intelligent Bug Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Submit logs, stack traces, screenshots, or bug reports for multi-agent AI diagnosis.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* INPUT STATE */}
          {state === 'INPUT' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {['Bug Report', 'Stack Trace', 'Error Log', 'Upload File'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4">
                {/* Optional Bug Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Bug Title / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NullPointerException in OrderService checkout"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200"
                  />
                </div>

                {/* Upload Tab View vs Text View */}
                {activeTab === 'Upload File' ? (
                  <div className="space-y-4">
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".png,.jpg,.jpeg,.webp,.gif,.txt,.log,.json,.csv,.md"
                        className="hidden" 
                      />
                      <div className="mx-auto w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-3">
                        <Upload className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Click to upload or drag & drop screenshot/log
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Supports PNG, JPG, JPEG, WEBP, TXT, LOG, JSON (Max 25MB)
                      </p>
                    </div>

                    {/* Selected File / Image Preview */}
                    {selectedFile && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {filePreviewUrl ? (
                            <img 
                              src={filePreviewUrl} 
                              alt="Bug Screenshot Preview" 
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                              <FileCode className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              {selectedFile.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Text/Log document'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Additional Notes / Description (Optional)
                      </label>
                      <textarea
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        placeholder="Add context or notes about the uploaded attachment..."
                        className="w-full h-32 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      {activeTab} Content
                    </label>
                    <textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder={`Paste your ${activeTab.toLowerCase()} here...`}
                      className="w-full h-72 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-slate-300"
                    />
                  </div>
                )}

                <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={!inputContent.trim() && !selectedFile}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Analyze Bug
                    </button>
                    <button
                      onClick={() => { 
                        setInputContent(''); 
                        setBugTitle('');
                        handleRemoveFile();
                        setErrorMsg(null); 
                      }}
                      className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {activeTab !== 'Upload File' && (
                    <button
                      onClick={() => {
                        setBugTitle('NullPointerException in UserService');
                        setInputContent(EXAMPLE_STACK_TRACE);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium cursor-pointer"
                    >
                      Load Example Stack Trace
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYZING STATE */}
          {state === 'ANALYZING' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold mb-2">AI Agents Analyzing</h2>
                <p className="text-slate-500 dark:text-slate-400">Executing multi-agent diagnosis pipeline against FastAPI backend...</p>
              </div>

              <div className="relative max-w-4xl w-full px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(Math.min(currentStep, PIPELINE_STEPS.length - 1) / (PIPELINE_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="relative flex justify-between">
                  {PIPELINE_STEPS.map((step, index) => {
                    const isComplete = currentStep > index;
                    const isProcessing = currentStep === index;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 relative z-10 bg-white dark:bg-slate-900 transition-colors duration-300 ${
                          isComplete ? 'border-green-500 text-green-500' :
                          isProcessing ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                          'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                        }`}>
                          {isComplete ? <CheckCircle className="w-6 h-6" /> : 
                           isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : 
                           <step.icon className="w-6 h-6" />}
                        </div>
                        <div className={`mt-4 font-medium text-sm transition-colors duration-300 ${
                          isProcessing ? 'text-blue-600 dark:text-blue-400' : 
                          isComplete ? 'text-slate-700 dark:text-slate-300' : 
                          'text-slate-400 dark:text-slate-600'
                        }`}>
                          {step.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {state === 'RESULTS' && analysisData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Analysis Complete — Bug #{analysisData.bug?.id}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Processed by BugLens 5-Agent Architecture</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setState('INPUT')} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    New Analysis
                  </button>
                  <button onClick={handleCopy} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy Report'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Summary & Duplicates */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500"/> Executive Summary</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                      {analysisData.report?.summary || analysisData.bug?.description}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">AI Confidence</span>
                          <span className="font-medium text-green-500">
                            {Math.round(analysisData.report?.confidence_score || analysisData.report?.root_cause_result?.confidence_percentage || 85)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(analysisData.report?.confidence_score || 85)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-500/30 uppercase">
                          Severity: {analysisData.bug?.severity || analysisData.report?.triage_result?.severity}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-200 dark:border-orange-500/30 uppercase">
                          Priority: {analysisData.bug?.priority || analysisData.report?.triage_result?.priority}
                        </span>
                      </div>
                    </div>

                    {/* Attached File/Screenshot */}
                    {uploadedAttachment && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Attached Evidence
                        </div>
                        {uploadedAttachment.isImage ? (
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
                            <img 
                              src={uploadedAttachment.url} 
                              alt="Attached Bug Evidence" 
                              className="w-full max-h-48 object-contain"
                            />
                            <div className="p-2 text-xs text-slate-400 bg-slate-900 border-t border-slate-800 truncate">
                              {uploadedAttachment.name}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <FileCode className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate font-mono">{uploadedAttachment.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Duplicate Bugs */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-purple-500"/> Duplicate Detection</h3>
                    
                    {analysisData.report?.duplicate_result?.similar_bugs?.length > 0 ? (
                      <div className="space-y-3">
                        {analysisData.report.duplicate_result.similar_bugs.map((item: any) => (
                          <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                item.similarity_score >= 80 
                                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' 
                                  : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                              }`}>
                                {item.similarity_score}% match
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Status: <span className="capitalize">{item.status}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">No sufficiently similar historical bugs found in knowledge base.</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Log Analysis & Root Cause & Remediation */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Log Analysis & Root Cause */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-cyan-500"/> Root Cause Analysis</h3>
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Predicted Cause:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        {analysisData.report?.root_cause_result?.most_probable_cause}
                      </div>
                    </div>
                    {analysisData.report?.root_cause_result?.evidence?.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">RAG Evidence:</span>
                        {analysisData.report.root_cause_result.evidence.map((ev: string, idx: number) => (
                          <div key={idx} className="pl-2 border-l-2 border-cyan-500">{ev}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommended Fix */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500"/> Recommended Fix</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Immediate Mitigation:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {analysisData.report?.remediation_result?.immediate_fix}
                      </p>
                    </div>

                    {analysisData.report?.remediation_result?.historical_reference && (
                      <div className="mb-4 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                        📌 {analysisData.report.remediation_result.historical_reference}
                      </div>
                    )}

                    {analysisData.report?.remediation_result?.suggested_code_changes && (
                      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-slate-800 mb-4">
                        <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-slate-300 flex justify-between items-center font-mono">
                          <span>Suggested Code Resolution</span>
                        </div>
                        <div className="p-4 font-mono text-sm overflow-x-auto text-slate-300 whitespace-pre">
                          {analysisData.report.remediation_result.suggested_code_changes}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Permanent Architectural Fix:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {analysisData.report?.remediation_result?.permanent_fix}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

