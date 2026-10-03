import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { api } from '../../services/api';

interface VerifyEmailViewProps {
  initialToken?: string;
  initialEmail?: string;
  onNavigateToLogin: (registeredEmail?: string, successMsg?: string) => void;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({
  initialToken = '',
  initialEmail = '',
  onNavigateToLogin,
}) => {
  const [token, setToken] = useState(initialToken);
  const [emailForResend, setEmailForResend] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; tokenPreview?: string } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!token.trim()) {
      setStatusMessage({ type: 'error', text: 'Verification token is required.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyEmail(token.trim());
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || 'Email verified successfully! You can now log in.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Verification failed. The link may have expired or is invalid.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error verifying account.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForResend.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email to resend link.' });
      return;
    }

    setResending(true);
    try {
      const res = await api.resendVerification(emailForResend.trim());
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || 'New verification email sent. Please check your inbox.',
          tokenPreview: res.verification_token_preview,
        });
        if (res.verification_token_preview) {
          setToken(res.verification_token_preview);
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to resend verification email.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error resending email.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verify your email
          </h1>
          <p className="text-xs text-slate-500">
            Please verify your email before using the Content Planner application.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Status Alert */}
          {statusMessage && (
            <div className={`p-3.5 rounded border text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <p>{statusMessage.text}</p>
                {statusMessage.tokenPreview && (
                  <div className="pt-1 text-[11px]">
                    <span className="font-semibold block">Generated Token:</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-[10px] block mt-0.5 select-all break-all">
                      {statusMessage.tokenPreview}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}

          {statusMessage?.type === 'success' ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToLogin(emailForResend, 'Email verified! Please enter your credentials to login.')}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
              >
                Proceed to Login
              </button>
            </div>
          ) : (
            <>
              {/* Form 1: Verify Token */}
              <form onSubmit={handleVerify} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Paste your token from email"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <span>{loading ? 'Verifying...' : 'Verify Account'}</span>
                </button>
              </form>

              {/* Form 2: Resend Verification */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  Didn't receive the email or link expired?
                </span>

                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={emailForResend}
                      onChange={e => setEmailForResend(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
                  </button>
                </form>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
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
