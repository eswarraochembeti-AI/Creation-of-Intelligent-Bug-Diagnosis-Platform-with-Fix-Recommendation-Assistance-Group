import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, UserPlus, Mail, Calendar, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at?: string;
  organization?: string;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch Team Members and Invitations from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const [membersData, invitesData] = await Promise.all([
        apiService.team.members(),
        apiService.team.invitations().catch(() => [])
      ]);
      setMembers(membersData || []);
      setInvitations(invitesData || []);
    } catch (err) {
      console.warn('Failed to load team members from API', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Validate form
  const validateForm = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) {
      errs.name = 'Full Name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Invite Submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const res = await apiService.team.invite({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        message: message.trim() || undefined
      });

      if (res && res.success) {
        toast.success('Invitation created successfully in database.');
        setIsInviteModalOpen(false);
        setName('');
        setEmail('');
        setMessage('');
        setRole('Developer');
        setErrors({});
        await fetchMembers();
      } else {
        setApiError(res?.message || 'Failed to create invitation.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to create invitation.';
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Invitation
  const handleCancelInvite = async (invId: number | string) => {
    try {
      await apiService.team.cancelInvitation(invId);
      toast.success('Invitation canceled.');
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel invitation.');
    }
  };

  // Resend Invitation
  const handleResendInvite = async (invId: number | string) => {
    try {
      await apiService.team.resendInvitation(invId);
      toast.success('Invitation renewed for 7 days.');
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend invitation.');
    }
  };

  // Handle Role Change
  const handleRoleChange = async (memberId: string | number, newRole: string) => {
    try {
      await apiService.team.updateRole(memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole.toLowerCase() } : m));
      toast.success(`Role updated to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update role';
      toast.error(errMsg);
      fetchMembers();
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId: string | number, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;
    try {
      await apiService.team.remove(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Team member removed successfully.');
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to remove member';
      toast.error(errMsg);
    }
  };

  const filteredUsers = members.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Team Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage team members, roles, and pending invitations.
            </p>
          </div>
          <button 
            onClick={() => {
              setApiError(null);
              setErrors({});
              setIsInviteModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <input 
              type="text" 
              placeholder="Search members by name, email, or role..." 
              className="w-full max-w-md px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {filteredUsers.length} of {members.length} members
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined / Invited</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span>Loading team members...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No team members found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      key={user.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg border border-blue-200 dark:border-blue-800 flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                              {user.name}
                            </div>
                            <div className="text-slate-500 flex items-center gap-1 text-xs mt-0.5">
                              <Mail className="h-3 w-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role.toLowerCase()} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 capitalize cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="developer">Developer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {(user.status || '').toLowerCase() === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleRemoveMember(user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" 
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Member Modal */}
        <AnimatePresence>
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && setIsInviteModalOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1, y: 0 }}
                className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden z-10"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send an invitation to join your bug diagnosis team</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => !isSubmitting && setIsInviteModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                  {apiError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Test User"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white text-sm transition-all`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email"
                      placeholder="e.g. testuser@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white text-sm transition-all`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Personal Message <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Welcome to the bug diagnosis team! Please join our workspace."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white text-sm resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Create Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Pending Invitations Section */}
        {invitations && invitations.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  Pending Team Invitations ({invitations.filter(i => i.status === 'Pending').length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Database-backed invitation tokens valid for 7 days</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {invitations.map((inv) => (
                <div key={inv.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{inv.email}</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">{inv.role}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        inv.status === 'Pending' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    {inv.message && <p className="text-xs text-slate-500 italic">"{inv.message}"</p>}
                    <p className="text-[11px] text-slate-400">Token: <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">{inv.token}</code> • Created: {formatDate(inv.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleResendInvite(inv.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Renew (7d)
                        </button>
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

