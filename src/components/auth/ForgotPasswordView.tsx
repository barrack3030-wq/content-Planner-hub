import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
  onNavigateToReset: (token?: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateToLogin,
  onNavigateToReset,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ message: string; tokenPreview?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    if (!email.trim()) {
      setErrorMessage('Email wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      if (res.success) {
        setSuccessInfo({
          message: res.message || 'If an account exists with this email, a password reset link has been sent.',
          tokenPreview: res.reset_token_preview,
        });
      } else {
        setErrorMessage(res.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error processing request.');
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
            Forgot your password?
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email and we'll send you a secure link to reset it.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          
          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reset Link Sent</span>
                </div>
                <p>{successInfo.message}</p>
                {successInfo.tokenPreview && (
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900">
                    <span className="font-semibold block">Generated Reset Token (One-Time):</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-[10px] block mt-1 select-all break-all">
                      {successInfo.tokenPreview}
                    </code>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToReset(successInfo.tokenPreview)}
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Proceed to Reset Password
                </button>

                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-2 px-4 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email address
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
