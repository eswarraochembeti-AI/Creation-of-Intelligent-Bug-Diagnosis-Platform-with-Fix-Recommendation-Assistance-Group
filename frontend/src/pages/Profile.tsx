import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User, Mail, Building, Briefcase, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Developer');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOrganization((user as any).organization || 'TechCorp Solutions');
      setRole(user.role || 'Developer');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        role: role.toLowerCase() as any,
      });
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOrganization((user as any).organization || 'TechCorp Solutions');
      setRole(user.role || 'Developer');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          My Profile
        </h1>

        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
          
          <div className="px-6 sm:px-10 pb-10 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-8">
              <div className="relative">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-lg">
                  <div className="h-full w-full rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{name || 'User Name'}</h2>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 capitalize"><Briefcase className="h-4 w-4" /> {role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Mail className="h-4 w-4" /> Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Work Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Building className="h-4 w-4" /> Organization</label>
                  <input 
                    type="text" 
                    value={organization} 
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Briefcase className="h-4 w-4" /> Role</label>
                  <input 
                    type="text" 
                    value={role} 
                    disabled 
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed outline-none dark:text-slate-400 capitalize text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer text-sm"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
