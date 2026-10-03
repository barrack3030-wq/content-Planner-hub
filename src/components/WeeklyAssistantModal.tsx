import React from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { ContentItem, ContentRules } from '../types/content';
import { formatWeekRange } from '../utils/dateUtils';
import { calculateWeeklyScorecard } from '../utils/scorecardUtils';

interface WeeklyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  rules: ContentRules;
  activeMonday: Date;
  onOpenSuggest: () => void;
  onNewContent: () => void;
}

export const WeeklyAssistantModal: React.FC<WeeklyAssistantModalProps> = ({
  isOpen,
  onClose,
  items,
  rules,
  activeMonday,
  onOpenSuggest,
  onNewContent,
}) => {
  if (!isOpen) return null;

  const result = calculateWeeklyScorecard(items, rules, activeMonday);
  const { scorecards, missingItemsCount, overallStatus } = result;

  const igFormats = [
    scorecards.instagram.Carousel,
    scorecards.instagram.Photo,
    scorecards.instagram.Reel,
    scorecards.instagram.Story,
  ];

  const webFormats = [
    scorecards.website.Blog,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Weekly Content Check
              </h2>
              <p className="text-xs text-slate-500">
                {formatWeekRange(activeMonday)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Questions Check */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-bold text-slate-800 w-40 shrink-0">1. Sesuai Pakem?</span>
            <span className={`font-semibold ${missingItemsCount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {missingItemsCount === 0 ? '✓ Ya, target pakem terpenuhi' : `⚠️ Belum, kurang ${missingItemsCount} konten`}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-slate-800 w-40 shrink-0">2. Status Mingguan:</span>
            <span className="font-medium text-slate-700">
              {overallStatus}
            </span>
          </div>
        </div>

        {/* Detailed breakdown list */}
        <div className="space-y-4 text-xs">
          
          {/* Instagram List */}
          <div>
            <span className="font-bold text-slate-900 block mb-1.5">Instagram:</span>
            <div className="space-y-1 pl-2">
              {igFormats.map(f => {
                const reached = f.planned >= f.target;
                return (
                  <div key={f.format} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                    <span className="text-slate-700 font-medium">{f.format}</span>
                    <span className={`font-semibold flex items-center gap-1 ${reached ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {reached ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Target reached ({f.planned}/{f.target})
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Needs {f.remaining} more ({f.planned}/{f.target})
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Website List */}
          <div>
            <span className="font-bold text-slate-900 block mb-1.5">Website:</span>
            <div className="space-y-1 pl-2">
              {webFormats.map(f => {
                const reached = f.planned >= f.target;
                return (
                  <div key={f.format} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                    <span className="text-slate-700 font-medium">Blog Article</span>
                    <span className={`font-semibold flex items-center gap-1 ${reached ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {reached ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Target reached ({f.planned}/{f.target})
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Needs {f.remaining} more ({f.planned}/{f.target})
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total missing banner */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
            <span className="text-slate-900">Total missing:</span>
            <span className={`font-mono tabular-nums ${missingItemsCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {missingItemsCount > 0 ? `${missingItemsCount} content` : '0 (All complete)'}
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {missingItemsCount > 0 ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenSuggest();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Suggest Content</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onNewContent();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
              >
                <span>Add Extra Content</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
