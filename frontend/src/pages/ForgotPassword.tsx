import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Bug, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setIsSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl overflow-hidden relative p-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[100px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-8 shadow-2xl z-10 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bug className="h-6 w-6 text-white" />
            </div>
          </div>
          
          {isSubmitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-300 text-sm mb-6">
                We have sent a password reset link to <br/>
                <span className="font-semibold text-white">{email}</span>
              </p>
              <Link to="/login" className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-slate-300 text-sm mb-8">Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative text-left">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-400" />
                </div>
                
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)] mt-2">
                  Send Reset Link
                </button>
              </form>
              
              <div className="mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
