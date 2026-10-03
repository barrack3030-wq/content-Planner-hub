import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { User, UserSession } from '../../types/auth';
import { GoogleSignInModal } from './GoogleSignInModal';

interface RegisterViewProps {
  onNavigateToLogin: (registeredEmail?: string, successMsg?: string) => void;
  onNavigateToVerify: (token?: string, email?: string) => void;
  onLoginSuccess?: (user: User, session: UserSession) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToLogin,
  onNavigateToVerify,
  onLoginSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; tokenPreview?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Nama wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Format email harus valid.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(name.trim(), email.trim(), password);

      if (res.success) {
        setSuccessInfo({
          message: res.message || 'Account created successfully. Please check your email to verify your account.',
          tokenPreview: res.verification_token_preview,
        });
      } else {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration error.');
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
            Create your account
          </h1>
          <p className="text-xs text-slate-500">
            Start planning your content.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          
          {/* Success State */}
          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Account Created</span>
                </div>
                <p>{successInfo.message}</p>
                {successInfo.tokenPreview && (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900">
                    <span className="font-semibold block">Generated Verification Token:</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-[10px] block mt-1 select-all break-all">
                      {successInfo.tokenPreview}
                    </code>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToVerify(successInfo.tokenPreview, email.trim())}
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Verify Account Now
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToLogin(email.trim(), 'Please verify your email before logging in.')}
                  className="w-full py-2 px-4 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Option: Sign in with Google */}
              {onLoginSuccess && (
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
                    <span>Instant Sign up with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-slate-200" />
                    <span className="bg-white px-2 text-[11px] text-slate-400 absolute">
                      or register with email
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aji Pratama"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="aji@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                      placeholder="Re-enter password"
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
                  <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="text-xs font-semibold text-slate-900 hover:underline"
                >
                  Login
                </button>
              </div>
            </>
          )}

        </div>

      </div>

      {onLoginSuccess && (
        <GoogleSignInModal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
          onLoginSuccess={onLoginSuccess}
          defaultEmail="barrack3030@gmail.com"
        />
      )}
    </div>
  );
};
