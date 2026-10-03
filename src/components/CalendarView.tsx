import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { ContentItem } from '../types/content';
import { formatWeekRange, getDaysOfWeek } from '../utils/dateUtils';
import { StatusBadge } from './ScorecardBadge';

interface CalendarViewProps {
  items: ContentItem[];
  activeMonday: Date;
  onChangeWeek: (newMonday: Date) => void;
  onResetToCurrentWeek: () => void;
  onSelectContent: (item: ContentItem) => void;
  onNewContentForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  activeMonday,
  onChangeWeek,
  onResetToCurrentWeek,
  onSelectContent,
  onNewContentForDate,
}) => {
  const daysOfWeek = getDaysOfWeek(activeMonday);

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

  return (
    <div className="space-y-6">
      {/* Top Calendar Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Weekly Content Calendar</span>
            <span>·</span>
            <span>Monday to Sunday Schedule</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-700" />
            <span>{formatWeekRange(activeMonday)}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Calendar Columns Grid (Desktop 7 columns, Mobile Stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map(day => {
          const dayItems = items.filter(item => item.date === day.dateStr);

          return (
            <div
              key={day.dateStr}
              className={`bg-white border rounded-lg flex flex-col transition-colors ${
                day.isToday ? 'border-slate-400 ring-1 ring-slate-300' : 'border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 border-b flex items-center justify-between ${
                day.isToday ? 'bg-slate-100/70 border-slate-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{day.dayName}</span>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">{day.dateStr}</span>
                </div>
                <button
                  onClick={() => onNewContentForDate(day.dateStr)}
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors"
                  title={`Add content on ${day.dayName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-2 space-y-2 flex-1 min-h-[220px]">
                {dayItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400">
                    <span className="text-xs">No posts scheduled</span>
                    <button
                      onClick={() => onNewContentForDate(day.dateStr)}
                      className="mt-2 text-xs text-slate-600 hover:text-slate-900 underline"
                    >
                      + Schedule post
                    </button>
                  </div>
                ) : (
                  dayItems.map(item => {
                    const isInstagram = item.channel === 'Instagram';
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectContent(item)}
                        className="p-2.5 rounded border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 cursor-pointer transition-all text-left shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                          <span className={`font-semibold ${isInstagram ? 'text-purple-700' : 'text-blue-700'}`}>
                            {item.channel}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {item.format}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2" title={item.title}>
                          {item.title}
                        </h4>

                        {item.pillar && (
                          <div className="text-[10px] text-slate-500 mt-1 truncate">
                            {item.pillar}
                          </div>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                          <StatusBadge status={item.status} size="sm" />
                          {item.priority === 'High' && (
                            <span className="text-[10px] text-rose-600 font-medium">High</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
