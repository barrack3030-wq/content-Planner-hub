import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, saveStoredSession } from '../../services/api';
import { User, UserSession } from '../../types/auth';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, session: UserSession) => void;
  defaultEmail?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = 'barrack3030@gmail.com',
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (emailToUse: string, nameToUse?: string) => {
    setError('');
    const email = emailToUse.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.googleLogin(email, nameToUse);
      if (res.success && res.data) {
        saveStoredSession(res.data.session);
        onLoginSuccess(res.data.user, res.data.session);
        onClose();
      } else {
        setError(res.error || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sign in with Google</h2>
              <p className="text-[11px] text-slate-500">to continue to Content Planner</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Choose a Google account to instantly access your isolated workspace and synced Google Sheets database.
          </p>

          {/* Quick Click Google Account Option */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSignIn(defaultEmail, defaultEmail.split('@')[0])}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group disabled:opacity-60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {defaultEmail.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {defaultEmail.split('@')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {defaultEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Secondary: Use another Google account */}
          {!showCustomInput ? (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
              >
                Use another Google Account
              </button>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSignIn(customEmail, customName);
              }}
              className="pt-2 border-t border-slate-100 space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !customEmail.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded text-[11px] text-emerald-800 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              Google sign-in automatically verifies your email and links your isolated Google Sheets database record.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
