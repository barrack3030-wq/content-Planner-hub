import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Calendar,
  Filter
} from 'lucide-react';
import { ContentItem, Channel, ContentStatus } from '../types/content';
import { formatShortDate, isDateInWeek, isDateInMonth } from '../utils/dateUtils';
import { StatusBadge } from './ScorecardBadge';

interface PlannerViewProps {
  items: ContentItem[];
  activeMonday: Date;
  onSelectContent: (item: ContentItem) => void;
  onNewContent: () => void;
  onDeleteContent: (id: string) => void;
  onDuplicateContent: (item: ContentItem) => void;
  onUpdateStatus: (id: string, newStatus: ContentStatus) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  items,
  activeMonday,
  onSelectContent,
  onNewContent,
  onDeleteContent,
  onDuplicateContent,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'All' | Channel>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | ContentStatus>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('week');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Date filter
      if (dateFilter === 'week' && !isDateInWeek(item.date, activeMonday)) {
        return false;
      }
      if (dateFilter === 'month') {
        const d = new Date(activeMonday);
        if (!isDateInMonth(item.date, d.getFullYear(), d.getMonth())) {
          return false;
        }
      }

      // Channel filter
      if (selectedChannel !== 'All' && item.channel !== selectedChannel) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesPillar = (item.pillar || '').toLowerCase().includes(q);
        const matchesKeyword = (item.targetKeyword || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesPillar && !matchesKeyword) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [items, dateFilter, activeMonday, selectedChannel, selectedStatus, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Content Planner</h1>
            <p className="text-xs text-slate-500">
              Manage all scheduled, production, and published content
            </p>
          </div>

          <button
            onClick={onNewContent}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Content</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, keyword, pillar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-hidden focus:border-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Date Filter Segment */}
          <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-50">
            <button
              onClick={() => setDateFilter('week')}
              className={`flex-1 py-1 text-xs font-medium rounded text-center transition-colors ${
                dateFilter === 'week' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`flex-1 py-1 text-xs font-medium rounded text-center transition-colors ${
                dateFilter === 'month' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`flex-1 py-1 text-xs font-medium rounded text-center transition-colors ${
                dateFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Channel Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value as 'All' | Channel)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-hidden focus:border-slate-400 bg-white text-slate-700"
            >
              <option value="All">All Channels (IG &amp; Web)</option>
              <option value="Instagram">Instagram</option>
              <option value="Website">Website</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as 'All' | ContentStatus)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-hidden focus:border-slate-400 bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Idea">Idea</option>
              <option value="Planned">Planned</option>
              <option value="Production">Production</option>
              <option value="Ready">Ready</option>
              <option value="Published">Published</option>
            </select>
          </div>

        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-28">Date</th>
                <th className="py-2.5 px-3 w-28">Channel</th>
                <th className="py-2.5 px-3 w-24">Format</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3 w-36">Pillar</th>
                <th className="py-2.5 px-3 w-32">Status</th>
                <th className="py-2.5 px-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-600">No content items found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or click "+ New Content" to add one.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                      {formatShortDate(item.date)}
                    </td>

                    {/* Channel */}
                    <td className="py-2.5 px-3">
                      <span className={`font-medium ${item.channel === 'Instagram' ? 'text-purple-700' : 'text-blue-700'}`}>
                        {item.channel}
                      </span>
                    </td>

                    {/* Format */}
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {item.format}
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectContent(item)}
                        className="text-left font-medium text-slate-900 hover:text-slate-600 hover:underline max-w-md line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </button>
                      {item.targetKeyword && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          kw: {item.targetKeyword}
                        </div>
                      )}
                    </td>

                    {/* Pillar */}
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">
                      {item.pillar || '—'}
                    </td>

                    {/* Status with quick selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={item.status}
                        onChange={e => onUpdateStatus(item.id, e.target.value as ContentStatus)}
                        className="text-xs py-0.5 px-1.5 border border-slate-200 rounded bg-white text-slate-800 focus:outline-hidden focus:border-slate-400 cursor-pointer"
                      >
                        <option value="Idea">Idea</option>
                        <option value="Planned">Planned</option>
                        <option value="Production">Production</option>
                        <option value="Ready">Ready</option>
                        <option value="Published">Published</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectContent(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                          title="Edit brief and details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateContent(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                          title="Duplicate item"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteContent(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete content"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          <span>Tip: Click title or edit icon to open brief &amp; captions</span>
        </div>
      </div>
    </div>
  );
};
