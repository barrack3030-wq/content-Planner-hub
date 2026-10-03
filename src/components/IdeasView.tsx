import React, { useState } from 'react';
import { Lightbulb, Plus, Calendar, ArrowRight, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import { ContentIdea, Channel, ContentFormat, Priority, ContentPillars } from '../types/content';
import { formatDateToISO } from '../utils/dateUtils';

interface IdeasViewProps {
  ideas: ContentIdea[];
  pillars: ContentPillars;
  onAddIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  onUpdateIdea: (id: string, idea: Partial<ContentIdea>) => void;
  onDeleteIdea: (id: string) => void;
  onMoveToPlanner: (idea: ContentIdea, scheduledDate: string) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  pillars,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onMoveToPlanner,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);

  // Move to planner modal state
  const [moveToPlannerIdea, setMoveToPlannerIdea] = useState<ContentIdea | null>(null);
  const [targetDate, setTargetDate] = useState(formatDateToISO(new Date()));

  // New Idea form state
  const [channel, setChannel] = useState<Channel>('Instagram');
  const [suggestedFormat, setSuggestedFormat] = useState<ContentFormat>('Reel');
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState('Discovery');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');

  const [channelFilter, setChannelFilter] = useState<'All' | Channel>('All');

  const handleOpenAdd = () => {
    setTitle('');
    setChannel('Instagram');
    setSuggestedFormat('Reel');
    setPillar(pillars.instagram[0] || 'Discovery');
    setDescription('');
    setReference('');
    setPriority('Medium');
    setNotes('');
    setEditingIdea(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setChannel(idea.channel);
    setSuggestedFormat(idea.suggestedFormat);
    setPillar(idea.pillar);
    setDescription(idea.description || '');
    setReference(idea.reference || '');
    setPriority(idea.priority);
    setNotes(idea.notes || '');
    setShowAddModal(true);
  };

  const handleChannelChange = (newChannel: Channel) => {
    setChannel(newChannel);
    if (newChannel === 'Website') {
      setSuggestedFormat('Blog');
      setPillar(pillars.website[0] || 'Destination Guide');
    } else {
      setSuggestedFormat('Reel');
      setPillar(pillars.instagram[0] || 'Discovery');
    }
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingIdea) {
      onUpdateIdea(editingIdea.id, {
        title,
        channel,
        suggestedFormat,
        pillar,
        description,
        reference,
        priority,
        notes,
      });
    } else {
      onAddIdea({
        title,
        channel,
        suggestedFormat,
        pillar,
        description,
        reference,
        priority,
        notes,
      });
    }

    setShowAddModal(false);
    setEditingIdea(null);
  };

  const handleConfirmMove = () => {
    if (moveToPlannerIdea && targetDate) {
      onMoveToPlanner(moveToPlannerIdea, targetDate);
      setMoveToPlannerIdea(null);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    if (channelFilter !== 'All' && idea.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Content Ideas Backlog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store potential topics and hooks before assigning them to your weekly schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector */}
          <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setChannelFilter('All')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                channelFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChannelFilter('Instagram')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                channelFilter === 'Instagram' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setChannelFilter('Website')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                channelFilter === 'Website' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Website
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Idea</span>
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No ideas in backlog</p>
            <p className="text-xs text-slate-400 mt-1">Capture creative topics here and move them to the planner anytime.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs font-semibold text-slate-800 underline"
            >
              + Create first idea
            </button>
          </div>
        ) : (
          filteredIdeas.map(idea => (
            <div
              key={idea.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold ${idea.channel === 'Instagram' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {idea.channel}
                    </span>
                    <span>·</span>
                    <span className="text-slate-600">{idea.suggestedFormat}</span>
                  </div>

                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                    idea.priority === 'High' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200'
                  }`}>
                    {idea.priority} Priority
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {idea.title}
                </h3>

                {idea.pillar && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    Pillar: <span className="text-slate-700 font-medium">{idea.pillar}</span>
                  </div>
                )}

                {idea.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {idea.description}
                  </p>
                )}

                {idea.reference && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{idea.reference}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(idea)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                    title="Edit idea"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteIdea(idea.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMoveToPlannerIdea(idea);
                    setTargetDate(formatDateToISO(new Date()));
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  <span>Add to Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add / Edit Idea */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-5 shadow-lg">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              {editingIdea ? 'Edit Content Idea' : 'Add New Content Idea'}
            </h2>

            <form onSubmit={handleSaveIdea} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Idea Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Things You Should Know Before Visiting Banggai"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={e => handleChannelChange(e.target.value as Channel)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suggested Format
                  </label>
                  {channel === 'Instagram' ? (
                    <select
                      value={suggestedFormat}
                      onChange={e => setSuggestedFormat(e.target.value as ContentFormat)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                    >
                      <option value="Reel">Reel</option>
                      <option value="Carousel">Carousel</option>
                      <option value="Photo">Photo</option>
                      <option value="Story">Story</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Blog"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-100 rounded text-slate-500 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pillar
                  </label>
                  <select
                    value={pillar}
                    onChange={e => setPillar(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  >
                    {(channel === 'Instagram' ? pillars.instagram : pillars.website).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Idea Description / Angle
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the story angle, hook, or problem addressed?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reference URL / Inspiration
                  </label>
                  <input
                    type="text"
                    placeholder="Link or notes"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Asset requirements etc."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                >
                  {editingIdea ? 'Save Changes' : 'Save Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Move to Planner (Select Target Date) */}
      {moveToPlannerIdea && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-sm w-full p-5 shadow-lg">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span>Schedule Idea in Planner</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Moving <strong className="text-slate-900">"{moveToPlannerIdea.title}"</strong> to the content planner. Select the publish/target date:
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMoveToPlannerIdea(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
              >
                Schedule to Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
