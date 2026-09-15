import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function SessionTimeoutManager() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

  // Get configured timeout (default 30 mins, minimum 1 min for testing)
  const getTimeoutDurationMs = useCallback(() => {
    const isEnabled = localStorage.getItem('settings_session_timeout') !== 'false';
    if (!isEnabled) return null; // Disabled
    const mins = Number(localStorage.getItem('settings_timeout_minutes')) || 30;
    return mins * 60 * 1000;
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningShownRef.current) {
      warningShownRef.current = false;
      setShowWarning(false);
    }
  }, []);

  const handleStaySignedIn = () => {
    resetActivity();
    toast.success('Session extended successfully.');
  };

  const handleLogoutDueToInactivity = useCallback(() => {
    setShowWarning(false);
    warningShownRef.current = false;
    logout();
    navigate('/login');
    toast.error('Session expired due to inactivity. Please sign in again.');
  }, [logout, navigate]);

  // Set up activity event listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];
    
    // Throttled activity listener
    let throttleTimeout: any = null;
    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          if (!warningShownRef.current) {
            lastActivityRef.current = Date.now();
          }
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Ticker checking every second
    const interval = setInterval(() => {
      const timeoutMs = getTimeoutDurationMs();
      if (!timeoutMs) return;

      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = timeoutMs - elapsed;

      // 60-second warning threshold
      const warningThresholdMs = 60 * 1000;

      if (remainingMs <= 0) {
        // Expired!
        handleLogoutDueToInactivity();
      } else if (remainingMs <= warningThresholdMs) {
        // Within warning zone
        warningShownRef.current = true;
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      } else {
        if (warningShownRef.current) {
          warningShownRef.current = false;
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, getTimeoutDurationMs, handleLogoutDueToInactivity]);

  if (!user || !showWarning) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
        >
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Session Expiring Soon
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            You have been inactive for a while. For security reasons, your session will automatically terminate in:
          </p>

          <div className="my-5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 font-mono text-2xl font-bold">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleStaySignedIn}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Stay Signed In
            </button>
            <button
              onClick={handleLogoutDueToInactivity}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Sign Out Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
