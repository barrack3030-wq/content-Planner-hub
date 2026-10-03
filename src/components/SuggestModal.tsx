import React, { useState } from 'react';
import { X, Sparkles, Plus, Calendar, Check } from 'lucide-react';
import { ContentItem, ContentRules, ContentFormat } from '../types/content';
import { calculateWeeklyScorecard, generateSuggestionsForMissing, ContentSuggestion } from '../utils/scorecardUtils';
import { formatDateToISO } from '../utils/dateUtils';

interface SuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  rules: ContentRules;
  activeMonday: Date;
  onAddSuggestedItem: (suggestion: ContentSuggestion, dateStr: string) => void;
}

export const SuggestModal: React.FC<SuggestModalProps> = ({
  isOpen,
  onClose,
  items,
  rules,
  activeMonday,
  onAddSuggestedItem,
}) => {
  const [selectedDates, setSelectedDates] = useState<Record<number, string>>({});
  const [addedIndexes, setAddedIndexes] = useState<number[]>([]);

  if (!isOpen) return null;

  const result = calculateWeeklyScorecard(items, rules, activeMonday);
  const suggestions = generateSuggestionsForMissing(result.scorecards);

  const defaultDateStr = formatDateToISO(activeMonday);

  const handleAdd = (suggestion: ContentSuggestion, index: number) => {
    const chosenDate = selectedDates[index] || defaultDateStr;
    onAddSuggestedItem(suggestion, chosenDate);
    setAddedIndexes(prev => [...prev, index]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Auto Content Suggestions
              </h2>
              <p className="text-xs text-slate-500">
                Recommended ideas tailored to fulfill your missing weekly targets
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

        {/* Suggestion list */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {suggestions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Check className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">All weekly targets are already satisfied!</p>
              <p className="text-slate-400 mt-1">No missing formats detected for this week.</p>
            </div>
          ) : (
            suggestions.map((sug, idx) => {
              const isAdded = addedIndexes.includes(idx);
              const currentDateVal = selectedDates[idx] || defaultDateStr;

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span className={`font-semibold ${sug.channel === 'Instagram' ? 'text-purple-700' : 'text-blue-700'}`}>
                          {sug.channel}
                        </span>
                        <span>·</span>
                        <span className="text-slate-800 font-medium">{sug.format}</span>
                        <span>·</span>
                        <span>Pillar: {sug.pillar}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        "{sug.title}"
                      </h4>
                      {sug.hook && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          Hook: {sug.hook}
                        </p>
                      )}
                      {sug.creativeBrief && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Brief: {sug.creativeBrief}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
                      {sug.reason}
                    </span>
                  </div>

                  {/* Date selection & Action */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <label className="text-slate-600 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date:</span>
                      </label>
                      <input
                        type="date"
                        value={currentDateVal}
                        disabled={isAdded}
                        onChange={e => setSelectedDates(prev => ({ ...prev, [idx]: e.target.value }))}
                        className="px-2 py-1 text-xs border border-slate-300 rounded font-mono bg-white disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>

                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 self-end sm:self-auto">
                        <Check className="w-3.5 h-3.5" />
                        Added to Planner
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdd(sug, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors self-end sm:self-auto shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Planner</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
