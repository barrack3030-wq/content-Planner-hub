import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

interface ResetPasswordViewProps {
  initialToken?: string;
  onNavigateToLogin: (registeredEmail?: string, successMsg?: string) => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  initialToken = '',
  onNavigateToLogin,
}) => {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token.trim(), newPassword);
      if (res.success) {
        onNavigateToLogin('', 'Password has been reset successfully. Please log in with your new password.');
      } else {
        setErrorMessage(res.error || 'Failed to reset password. The link may have expired or been used.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your reset token and choose a strong new password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel &amp; Return to Login</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
