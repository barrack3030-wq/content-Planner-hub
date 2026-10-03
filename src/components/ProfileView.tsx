import React, { useState } from 'react';
import { User, UserSession } from '../types/auth';
import { api, saveStoredSession } from '../services/api';
import { User as UserIcon, Mail, ShieldCheck, Calendar, Clock, Lock, KeyRound, LogOut, Check, AlertCircle } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  session: UserSession;
  onUserUpdated: (updatedUser: User) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  session,
  onUserUpdated,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await api.updateProfile(session.session_token, name.trim());
      if (res.success) {
        setProfileSuccess(true);
        const updated = { ...user, name: name.trim() };
        onUserUpdated(updated);
        // Also update session name
        saveStoredSession({ ...session, name: name.trim() });
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(res.error || 'Failed to update name.');
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error updating profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.changePassword(session.session_token, currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3500);
      } else {
        setPasswordError(res.error || 'Failed to change password. Verify your current password.');
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Error changing password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Account Center</span>
            <span>·</span>
            <span>Multi-User Isolated Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-slate-700" />
            <span>My Profile</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal credentials, workspace owner ID, and session security.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Identity & Info Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Primary Identity
              </span>
              <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
              <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                {user.user_id}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Account: <strong>{user.verified ? 'Yes' : 'No'}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Today'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded">
              <span className="font-bold text-slate-800 block">Strict Data Isolation</span>
              <p>
                All your content items, rules, pillars, and ideas in the Google Sheet are uniquely locked to <strong>{user.user_id}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Forms (Name & Password) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card 1: Update Name */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Update your display name in the workspace</p>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-100 rounded text-slate-500 cursor-not-allowed font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email address acts as your verified security handle.
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs disabled:opacity-60"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-slate-500">Ensure your account uses a strong 8+ character password</p>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Password updated successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs disabled:opacity-60"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
