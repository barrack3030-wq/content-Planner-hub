import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Plus,
  HelpCircle
} from 'lucide-react';
import { ContentItem, ContentRules } from '../types/content';
import { formatWeekRange, getDaysOfWeek, isDateInWeek } from '../utils/dateUtils';
import { calculateWeeklyScorecard } from '../utils/scorecardUtils';
import { StatusBadge, OverallStatusBadge } from './ScorecardBadge';

interface DashboardViewProps {
  items: ContentItem[];
  rules: ContentRules;
  activeMonday: Date;
  onChangeWeek: (newMonday: Date) => void;
  onResetToCurrentWeek: () => void;
  onCheckThisWeek: () => void;
  onSuggestContent: () => void;
  onNewContentForDate?: (dateStr: string) => void;
  onSelectContent: (item: ContentItem) => void;
  onNavigateToTab: (tab: 'calendar' | 'planner' | 'rules') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  rules,
  activeMonday,
  onChangeWeek,
  onResetToCurrentWeek,
  onCheckThisWeek,
  onSuggestContent,
  onNewContentForDate,
  onSelectContent,
  onNavigateToTab,
}) => {
  const scorecardResult = calculateWeeklyScorecard(items, rules, activeMonday);
  const { scorecards, totalPlanned, totalPublished, totalRemaining, overallStatus, missingItemsCount } = scorecardResult;

  const handlePrevWeek = () => {
    const prev = new Date(activeMonday);
    prev.setDate(prev.getDate() - 7);
    onChangeWeek(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(activeMonday);
    next.setDate(next.getDate() + 7);
    onChangeWeek(next);
  };

  const daysOfWeek = getDaysOfWeek(activeMonday);
  const weekItems = items.filter(item => isDateInWeek(item.date, activeMonday));

  const igFormats = [
    scorecards.instagram.Reel,
    scorecards.instagram.Carousel,
    scorecards.instagram.Photo,
    scorecards.instagram.Story,
  ];

  const webFormats = [
    scorecards.website.Blog,
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Week Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Weekly Content Scorecard</span>
            <span>·</span>
            <span>Instagram &amp; Website</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Week: {formatWeekRange(activeMonday)}
            </h1>
            <OverallStatusBadge status={overallStatus} />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Week navigation buttons */}
          <div className="inline-flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-xs">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-300 transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onResetToCurrentWeek}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l border-slate-300 transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Assistant Actions */}
          <button
            onClick={onCheckThisWeek}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Check This Week</span>
          </button>

          {missingItemsCount > 0 && (
            <button
              onClick={onSuggestContent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Suggest Content</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Metric Cards: Total Planned, Published, Remaining */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Total Planned</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalPlanned}
            </span>
            <span className="text-xs text-slate-500">
              {scorecardResult.totalPlanned >= (rules.instagram.reel + rules.instagram.carousel + rules.instagram.photo + rules.instagram.story + rules.website.blog)
                ? 'Target satisfied'
                : 'Items scheduled'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Published</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 tabular-nums">
              {totalPublished}
            </span>
            <span className="text-xs text-slate-500">
              Live &amp; completed
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Remaining to Target</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${totalRemaining > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
              {totalRemaining}
            </span>
            <span className="text-xs text-slate-500">
              {totalRemaining === 0 ? 'All rules fulfilled' : 'Need to plan/publish'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Content Scorecard (Core Feature) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Weekly Content Scorecard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target vs Planned consistency based on your defined rules
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('rules')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
          >
            Edit Pakem Rules
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-5">
          
          {/* Instagram Channel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900">Instagram</span>
                <span className="text-xs text-slate-500">
                  ({rules.instagram.reel + rules.instagram.carousel + rules.instagram.photo + rules.instagram.story} target/week)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {igFormats.map(card => {
                const percentage = card.target > 0 ? Math.min(100, Math.round((card.planned / card.target) * 100)) : 100;
                const isReached = card.planned >= card.target;
                const isExceeded = card.planned > card.target;

                return (
                  <div key={card.format} className="border border-slate-200 rounded p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{card.format}</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {card.planned} / {card.target}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {isExceeded ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Target exceeded ({card.planned}/{card.target})
                          </span>
                        ) : isReached ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ✓ Target reached
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            ⚠️ Need {card.remaining} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isReached ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Website Channel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900">Website</span>
                <span className="text-xs text-slate-500">
                  ({rules.website.blog} target/week)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {webFormats.map(card => {
                const percentage = card.target > 0 ? Math.min(100, Math.round((card.planned / card.target) * 100)) : 100;
                const isReached = card.planned >= card.target;
                const isExceeded = card.planned > card.target;

                return (
                  <div key={card.format} className="border border-slate-200 rounded p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">Blog Article</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {card.planned} / {card.target}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {isExceeded ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Target exceeded ({card.planned}/{card.target})
                          </span>
                        ) : isReached ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ✓ Target reached
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            ⚠️ Need {card.remaining} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isReached ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Weekly Advice & Guidance */}
              <div className="mt-6 p-4 rounded border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Weekly Rule Principle</span>
                </div>
                <p>
                  Every week should have a balanced mix of Instagram formats (Reel, Carousel, Photo, Story) and long-form Blog articles to maintain audience growth and SEO authority.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    onClick={onCheckThisWeek}
                    className="font-medium text-slate-900 hover:underline flex items-center gap-1"
                  >
                    Run Weekly Audit <ArrowRight className="w-3 h-3" />
                  </button>
                  {missingItemsCount > 0 && (
                    <button
                      onClick={onSuggestContent}
                      className="font-semibold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      Fill Missing Content <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* This Week's Content Schedule Snapshot */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Weekly Content Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled content for {formatWeekRange(activeMonday)}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {daysOfWeek.map(day => {
            const dayItems = weekItems.filter(item => item.date === day.dateStr);

            return (
              <div
                key={day.dateStr}
                className={`border rounded p-3 flex flex-col justify-between min-h-[140px] ${
                  day.isToday
                    ? 'border-slate-400 bg-slate-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-800">{day.dayName}</span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {day.dateNumber}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {dayItems.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic block py-1">
                        No content
                      </span>
                    ) : (
                      dayItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onSelectContent(item)}
                          className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:border-slate-400 cursor-pointer transition-colors text-left"
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700">{item.format}</span>
                            <span>{item.channel === 'Instagram' ? 'IG' : 'Web'}</span>
                          </div>
                          <div className="text-xs font-medium text-slate-900 truncate mt-0.5" title={item.title}>
                            {item.title}
                          </div>
                          <div className="mt-1">
                            <StatusBadge status={item.status} size="sm" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onNewContentForDate && onNewContentForDate(day.dateStr)}
                    className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5"
                    title={`Add content on ${day.dayName}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
