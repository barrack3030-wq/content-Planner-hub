import React, { useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContentItem, ContentRules } from '../types/content';
import { isDateInMonth, getMonthName } from '../utils/dateUtils';

interface MonthlyOverviewViewProps {
  items: ContentItem[];
  rules: ContentRules;
  initialYear: number;
  initialMonth: number; // 0-indexed (9 for October)
}

export const MonthlyOverviewView: React.FC<MonthlyOverviewViewProps> = ({
  items,
  rules,
  initialYear,
  initialMonth,
}) => {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter items in this month
  const monthItems = items.filter(item => isDateInMonth(item.date, currentYear, currentMonth));

  // Count items per format
  const counts = {
    Reel: monthItems.filter(i => i.format === 'Reel').length,
    Carousel: monthItems.filter(i => i.format === 'Carousel').length,
    Photo: monthItems.filter(i => i.format === 'Photo').length,
    Story: monthItems.filter(i => i.format === 'Story').length,
    Blog: monthItems.filter(i => i.format === 'Blog').length,
  };

  // Published counts
  const publishedCounts = {
    Reel: monthItems.filter(i => i.format === 'Reel' && i.status === 'Published').length,
    Carousel: monthItems.filter(i => i.format === 'Carousel' && i.status === 'Published').length,
    Photo: monthItems.filter(i => i.format === 'Photo' && i.status === 'Published').length,
    Story: monthItems.filter(i => i.format === 'Story' && i.status === 'Published').length,
    Blog: monthItems.filter(i => i.format === 'Blog' && i.status === 'Published').length,
  };

  // Monthly target is roughly 4 weeks of weekly rule
  const weeksInMonth = 4;
  const targets = {
    Reel: rules.instagram.reel * weeksInMonth,
    Carousel: rules.instagram.carousel * weeksInMonth,
    Photo: rules.instagram.photo * weeksInMonth,
    Story: rules.instagram.story * weeksInMonth,
    Blog: rules.website.blog * weeksInMonth,
  };

  const totalMonthlyTarget = targets.Reel + targets.Carousel + targets.Photo + targets.Story + targets.Blog;
  const totalMonthlyPlanned = monthItems.length;
  const totalMonthlyPublished = monthItems.filter(i => i.status === 'Published').length;

  const renderMetricRow = (
    label: string,
    actual: number,
    target: number,
    published: number
  ) => {
    const isReached = actual >= target;
    const percentage = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 100;

    return (
      <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
              {actual} / {target}
            </span>
            {isReached ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${isReached ? 'bg-emerald-600' : 'bg-amber-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{published} published</span>
          <span>{isReached ? 'Target fulfilled' : `Need ${target - actual} more`}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Month Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Monthly Consistency Overview</span>
            <span>·</span>
            <span>4-Week Pakem Alignment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <span>{getMonthName(currentYear, currentMonth)}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-r border-slate-300 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-800">
              {getMonthName(currentYear, currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l border-slate-300 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* High-level Monthly KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-medium text-slate-500">Monthly Target</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalMonthlyTarget}
            </span>
            <span className="text-xs text-slate-500">Based on 4-wk pakem</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-medium text-slate-500">Total Planned</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalMonthlyPlanned}
            </span>
            <span className="text-xs text-slate-500">
              {Math.round((totalMonthlyPlanned / (totalMonthlyTarget || 1)) * 100)}% of target
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-medium text-slate-500">Total Published</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 tabular-nums">
              {totalMonthlyPublished}
            </span>
            <span className="text-xs text-slate-500">Live this month</span>
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Instagram Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Instagram Consistency</h2>
              <p className="text-xs text-slate-500">Target for 4 full weeks</p>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-700">
              {counts.Reel + counts.Carousel + counts.Photo + counts.Story} / {targets.Reel + targets.Carousel + targets.Photo + targets.Story}
            </span>
          </div>

          <div className="space-y-3">
            {renderMetricRow('Reel', counts.Reel, targets.Reel, publishedCounts.Reel)}
            {renderMetricRow('Carousel', counts.Carousel, targets.Carousel, publishedCounts.Carousel)}
            {renderMetricRow('Single Photo', counts.Photo, targets.Photo, publishedCounts.Photo)}
            {renderMetricRow('Story', counts.Story, targets.Story, publishedCounts.Story)}
          </div>
        </div>

        {/* Website Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Website Blog Consistency</h2>
              <p className="text-xs text-slate-500">Long-form editorial articles</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-700">
              {counts.Blog} / {targets.Blog}
            </span>
          </div>

          <div className="space-y-3">
            {renderMetricRow('Blog Article', counts.Blog, targets.Blog, publishedCounts.Blog)}
          </div>

          {/* Strategic Note */}
          <div className="p-4 rounded border border-slate-200 bg-slate-50 text-xs text-slate-600 mt-6 space-y-1.5">
            <div className="font-semibold text-slate-800">Monthly Rhythm Check</div>
            <p>
              Konsistensi bulanan mencerminkan kedisiplinan eksekusi content rules. Jika salah satu format tertinggal (misalnya Story atau Blog), jadwalkan batching di minggu berikutnya.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
