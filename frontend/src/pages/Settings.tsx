import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Shield, Database, Cpu, Save, Loader2, Key } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('theme');
  const { theme, setTheme } = useTheme();

  // State for all setting tabs
  const [orgName, setOrgName] = useState('TechCorp Solutions');
  const [orgDesc, setOrgDesc] = useState('Enterprise Software Engineering & AI Diagnostics');
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [notifAnalysis, setNotifAnalysis] = useState(true);
  const [notifAssigned, setNotifAssigned] = useState(true);
  const [notifTeam, setNotifTeam] = useState(true);
  const [notifResolved, setNotifResolved] = useState(true);
  const [notifKb, setNotifKb] = useState(true);

  const [aiModel, setAiModel] = useState('sentence-transformers/all-MiniLM-L6-v2');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [duplicateThreshold, setDuplicateThreshold] = useState(80);

  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.settings.get();
        if (data) {
          if (data.theme) setTheme(data.theme as any);
          if (data.organization_name) setOrgName(data.organization_name);
          if (data.organization_desc) setOrgDesc(data.organization_desc);
          if (data.email_notif !== undefined) setEmailNotif(data.email_notif);
          if (data.push_notif !== undefined) setPushNotif(data.push_notif);
          if (data.weekly_digest !== undefined) setWeeklyDigest(data.weekly_digest);
          if (data.notif_analysis_completed !== undefined) setNotifAnalysis(data.notif_analysis_completed);
          if (data.notif_bug_assigned !== undefined) setNotifAssigned(data.notif_bug_assigned);
          if (data.notif_team_invitation !== undefined) setNotifTeam(data.notif_team_invitation);
          if (data.notif_bug_resolved !== undefined) setNotifResolved(data.notif_bug_resolved);
          if (data.notif_kb_update !== undefined) setNotifKb(data.notif_kb_update);
          if (data.ai_model) setAiModel(data.ai_model);
          if (data.confidence_threshold !== undefined) setConfidenceThreshold(data.confidence_threshold);
          if (data.session_timeout_enabled !== undefined) setSessionTimeout(data.session_timeout_enabled);
          if (data.session_timeout_minutes !== undefined) setTimeoutMinutes(data.session_timeout_minutes);
        }
      } catch (err) {
        console.warn('Loading settings from local storage fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // 1. Save to SQLite database via FastAPI
      await apiService.settings.update({
        theme,
        organization_name: orgName,
        organization_desc: orgDesc,
        email_notif: emailNotif,
        push_notif: pushNotif,
        weekly_digest: weeklyDigest,
        notif_analysis_completed: notifAnalysis,
        notif_bug_assigned: notifAssigned,
        notif_team_invitation: notifTeam,
        notif_bug_resolved: notifResolved,
        notif_kb_update: notifKb,
        ai_model: aiModel,
        confidence_threshold: confidenceThreshold,
        session_timeout_enabled: sessionTimeout,
        session_timeout_minutes: timeoutMinutes
      });

      // 2. Cache in localStorage for immediate client-side offline access
      localStorage.setItem('settings_theme', theme);
      localStorage.setItem('settings_org_name', orgName);
      localStorage.setItem('settings_org_desc', orgDesc);
      localStorage.setItem('settings_email_notif', String(emailNotif));
      localStorage.setItem('settings_push_notif', String(pushNotif));
      localStorage.setItem('settings_weekly_digest', String(weeklyDigest));
      localStorage.setItem('settings_ai_model', aiModel);
      localStorage.setItem('settings_ai_threshold', String(confidenceThreshold));
      localStorage.setItem('settings_session_timeout', String(sessionTimeout));
      localStorage.setItem('settings_timeout_minutes', String(timeoutMinutes));

      toast.success('Settings saved and synchronized with database.');
    } catch (err) {
      console.error('Settings save error:', err);
      toast.error('Failed to persist settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await apiService.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.detail || 'Failed to update password. Verify current password.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure appearance, organization preferences, notifications, and AI diagnosis parameters.</p>
          </div>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[600px]">
          <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/30">
            <nav className="space-y-1">
              {[
                { id: 'theme', icon: <Moon className="h-4 w-4" />, label: 'Appearance' },
                { id: 'org', icon: <Database className="h-4 w-4" />, label: 'Organization' },
                { id: 'notif', icon: <Bell className="h-4 w-4" />, label: 'Notifications' },
                { id: 'ai', icon: <Cpu className="h-4 w-4" />, label: 'AI Configuration' },
                { id: 'security', icon: <Shield className="h-4 w-4" />, label: 'Security' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'theme' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Appearance Settings</h2>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Theme Preference</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose your preferred visual style or sync automatically with your device system preferences.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-slate-900 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-slate-700 flex items-center justify-center">
                        <Sun className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-center">
                        <span className="font-medium text-slate-900 dark:text-white block text-sm">Light Mode</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Clean bright view</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-slate-900 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Moon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <span className="font-medium text-slate-900 dark:text-white block text-sm">Dark Mode</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">High contrast dark</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-slate-900 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <div className="text-center">
                        <span className="font-medium text-slate-900 dark:text-white block text-sm">System Default</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Follows OS theme</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'org' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Organization Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Name</label>
                    <input 
                      type="text" 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)} 
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Description</label>
                    <textarea 
                      rows={3} 
                      value={orgDesc} 
                      onChange={(e) => setOrgDesc(e.target.value)} 
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm resize-none" 
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      Organization settings are shared across all team members assigned to this workspace.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notif' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Delivery Channels</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">In-App Notification Center</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Receive live alerts and diagnosis badges directly in top navigation.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={pushNotif} 
                        onChange={(e) => setPushNotif(e.target.checked)} 
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Email Notifications (Mock Service)</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Simulate email alerts for high-priority and critical defect triage.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailNotif} 
                        onChange={(e) => setEmailNotif(e.target.checked)} 
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Weekly Defect Digest</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Weekly executive summary of resolved bugs and MTTR trends.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={weeklyDigest} 
                        onChange={(e) => setWeeklyDigest(e.target.checked)} 
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-3">Event Subscriptions</div>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Bug analysis completed', state: notifAnalysis, set: setNotifAnalysis },
                        { label: 'Bug assigned to me', state: notifAssigned, set: setNotifAssigned },
                        { label: 'Team invitation received/updated', state: notifTeam, set: setNotifTeam },
                        { label: 'Bug resolved and indexed to RAG', state: notifResolved, set: setNotifResolved },
                        { label: 'Knowledge Base article updated', state: notifKb, set: setNotifKb },
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={item.state} 
                            onChange={(e) => item.set(e.target.checked)} 
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">AI Diagnosis Parameters</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Embedding Model (RAG & Vector Retrieval)</label>
                    <select 
                      value={aiModel} 
                      onChange={(e) => setAiModel(e.target.value)} 
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
                    >
                      <option value="sentence-transformers/all-MiniLM-L6-v2">Sentence Transformers (all-MiniLM-L6-v2, 384-d dense vectors) [Active]</option>
                      <option value="multi-agent-collaborative">5-Agent Collaborative AI Pipeline (Triage, Log, RAG, Duplicate, Fix) [Active]</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-performance local embeddings running on PyTorch with sub-millisecond cosine retrieval.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Auto-Triage Confidence Threshold</label>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{confidenceThreshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={confidenceThreshold} 
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))} 
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum AI confidence score required for auto-classifying defect severity and priority.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duplicate Cosine Similarity Threshold</label>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{duplicateThreshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={duplicateThreshold} 
                      onChange={(e) => setDuplicateThreshold(Number(e.target.value))} 
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Similarity percentage threshold above which defect reports are flagged as duplicate issues.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Security & Authentication</h2>
                
                {/* Change Password Form */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    Change Password
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <button 
                      type="button"
                      onClick={handlePasswordUpdate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Account Security Preferences */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Account Security & Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 opacity-80">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Two-Factor Authentication (TOTP Authenticator)</span>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">Not Configured</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">TOTP authenticator setup requires organization security gateway connection.</div>
                      </div>
                      <input 
                        type="checkbox" 
                        disabled
                        checked={false}
                        className="h-5 w-5 rounded text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Inactivity Session Timeout</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Automatically prompt and sign out after inactivity period ({timeoutMinutes} minutes).</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.checked)}
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
