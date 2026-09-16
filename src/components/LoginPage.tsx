import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, AlertCircle, Info, ShieldCheck, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, error, isConfigured, clearError } = useAuth();
  const [copied, setCopied] = useState(false);

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyHostname = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isConfigOrAuthError =
    error &&
    (error.includes('Google Sign-In is not yet enabled') ||
      error.includes('auth/configuration-not-found') ||
      error.includes('not authorized in Firebase') ||
      error.includes('auth/unauthorized-domain'));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <CheckSquare className="w-8 h-8" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          TaskFlow
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Graduate Support Engineer Trainee Assessment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {/* Assessment Objective Scope Note */}
          <div className="mb-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Assessment Scope:</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-600">
                  <li>Google Authentication via Firebase Auth</li>
                  <li>Private Task Management via Cloud Firestore</li>
                  <li>Real-time status updates (Planned, In Progress, Complete)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Missing Configuration Banner */}
          {!isConfigured && (
            <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">Firebase Configuration Required</span>
                  <p className="mt-1">
                    To connect to your Firebase project, set your Vite environment variables in your{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
                      .env
                    </code>{' '}
                    or hosting secrets.
                  </p>
                  <p className="mt-1 text-amber-700">
                    See <span className="font-semibold">README.md</span> for step-by-step setup instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-900">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-red-800">Authentication Setup Required</p>
                    <p className="mt-1 font-medium leading-relaxed text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>

              {/* Actionable Guidance when Google provider or domain is not configured */}
              {isConfigOrAuthError && (
                <div className="mt-3 pt-3 border-t border-red-200/70 text-xs text-slate-700 space-y-2.5">
                  <p className="font-semibold text-slate-800">Quick Fix Steps in Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-0.5">
                    <li>
                      Open Firebase Console for{' '}
                      <span className="font-mono font-semibold text-slate-800">{projectId}</span>
                    </li>
                    <li>
                      Go to <span className="font-semibold text-slate-800">Authentication &gt; Sign-in method</span>
                    </li>
                    <li>
                      Click <span className="font-semibold text-slate-800">Google</span>, toggle{' '}
                      <span className="font-semibold text-emerald-700">Enable</span>, select a support email, and click{' '}
                      <span className="font-semibold text-slate-800">Save</span>
                    </li>
                    <li>
                      Go to <span className="font-semibold text-slate-800">Authentication &gt; Settings &gt; Authorized Domains</span> and ensure this app&apos;s domain is added:
                    </li>
                  </ol>

                  {/* Copy Domain Row */}
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded border border-red-200/60">
                    <code className="text-[11px] font-mono text-slate-800 flex-1 truncate select-all">
                      {currentHostname}
                    </code>
                    <button
                      type="button"
                      onClick={copyHostname}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy Domain</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Direct Link to Firebase Console */}
                  <div className="pt-1">
                    <a
                      href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline"
                    >
                      <span>Open Firebase Authentication Sign-in Methods</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sign In Button */}
          <div>
            <button
              id="google-signin-button"
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{loading ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Privacy & Guardrail Footnote */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authenticated user tasks remain private and isolated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
