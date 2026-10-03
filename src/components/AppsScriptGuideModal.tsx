import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, FileCode, Database, Download } from 'lucide-react';
import { APPS_SCRIPT_CODE, downloadAppsScriptFile } from '../utils/appsScriptCode';

interface AppsScriptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptGuideModal: React.FC<AppsScriptGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-2xl my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Google Sheets &amp; Apps Script Backend Setup
              </h2>
              <p className="text-xs text-slate-500">
                Turn any Google Spreadsheet into your multi-user database
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step-by-Step Instructions
            </h3>

            <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                <strong>Option A (Recommended): Create from Google Sheets</strong><br />
                Open{' '}
                <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">
                  sheets.new <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and in the menu click <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                <strong>Option B: Standalone Script on script.google.com</strong><br />
                If you already created a script at{' '}
                <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">
                  script.google.com <ExternalLink className="w-3 h-3 inline" />
                </a>, this updated Code.gs will automatically create <em>"Content Planner Database"</em> in your Google Drive or link any Spreadsheet ID!
              </li>
              <li>
                <strong>Copy &amp; Paste Backend Code:</strong> Click the button below to copy the complete Code.gs (~1,400 lines), then paste it into your Apps Script editor, replacing any default code.
              </li>
              <li>
                <strong>Deploy as Web App:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Click <strong>Deploy &gt; New deployment</strong> (or Manage deployments &gt; Edit &gt; New version)</li>
                  <li>Select type: <strong>Web app</strong></li>
                  <li>Execute as: <strong>Me (your account)</strong></li>
                  <li>Who has access: <strong>Anyone</strong> (crucial for API requests)</li>
                </ul>
              </li>
              <li>
                <strong>Authorize &amp; Link:</strong> Click <strong>Deploy</strong>, grant Google permissions, and copy the Web App URL!
              </li>
            </ol>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <span>Complete Backend Code (`google-apps-script/Code.gs`)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadAppsScriptFile}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Code.gs</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied Full Code!' : 'Copy Complete Code.gs'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-slate-200 rounded font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48 border border-slate-800">
              <pre>{`/**
 * =========================================================================
 * CONTENT PLANNER - GOOGLE APPS SCRIPT BACKEND
 * Multi-User Authentication & Isolated Content Database for Google Sheets
 * =========================================================================
 */
// Full code contains:
// - doGet & doPost HTTP API endpoints
// - Auto database schema generator (USERS, SESSIONS, CONTENTS, IDEAS, RULES, SETTINGS)
// - Multi-user isolation enforced by session user_id
// - Password SHA-256 hashing & verification email tokens
// - Standalone Google Drive auto-creation fallback & Spreadsheet ID linking
... click "Copy Complete Code.gs" above to copy the full ~1,400 lines.`}</pre>
            </div>
            <p className="text-[11px] text-slate-500">
              ✓ Ready for production: Contains all sheets, verification tokens, password hashing, and user-isolated query logic.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to clipboard' : 'Click to copy full code'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
