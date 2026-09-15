import React from 'react';
import Navbar from './Navbar';

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} BugLens.ai. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingLayout;
