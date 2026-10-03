import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, saveStoredSession } from '../../services/api';
import { User, UserSession } from '../../types/auth';
import { GoogleSignInModal } from './GoogleSignInModal';

interface LoginViewProps {
  onLoginSuccess: (user: User, session: UserSession) => void;
  onNavigate: (view: 'register' | 'forgot-password' | 'verify-email') => void;
  initialEmail?: string;
  successNotice?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
  initialEmail = '',
  successNotice = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setUnverifiedEmail('');

    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);

      if (res.success && res.data) {
        saveStoredSession(res.data.session);
        onLoginSuccess(res.data.user, res.data.session);
      } else {
        const err = res.error || 'Email or password is incorrect.';
        setErrorMessage(err);
        if (err.toLowerCase().includes('verify') || (res as unknown as Record<string, unknown>).needs_verification) {
          setUnverifiedEmail(email.trim());
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
            Content Planner
          </h1>
          <p className="text-xs text-slate-500">
            Plan your Instagram &amp; Blog content better.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500">
              Sign in with your email and password to access your isolated workspace.
            </p>
          </div>

          {/* Success / Alert Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={() => onNavigate('verify-email')}
                    className="font-semibold text-rose-900 underline block"
                  >
                    Click here to enter token or resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Option: Sign in with Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-2 px-4 rounded border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google Email</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white px-2 text-[11px] text-slate-400 absolute">
                or sign in with password
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Helper Hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">Test Account:</span>
            <p>Email: <code className="text-slate-900 font-mono">aji@gmail.com</code></p>
            <p>Password: <code className="text-slate-900 font-mono">password123</code></p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Don't have an account?{' '}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-xs font-semibold text-slate-900 hover:underline"
            >
              Create an account
            </button>
          </div>
        </div>

      </div>

      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onLoginSuccess={onLoginSuccess}
        defaultEmail="barrack3030@gmail.com"
      />
    </div>
  );
};
