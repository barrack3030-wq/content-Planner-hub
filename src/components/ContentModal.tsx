import React, { useState, useEffect } from 'react';
import { X, Instagram, Globe, HelpCircle, Copy, Check } from 'lucide-react';
import { 
  ContentItem, 
  Channel, 
  ContentFormat, 
  InstagramFormat, 
  ContentStatus, 
  Priority, 
  ContentPillars 
} from '../types/content';
import { formatDateToISO } from '../utils/dateUtils';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  existingItem?: ContentItem | null;
  defaultDate?: string;
  pillars: ContentPillars;
}

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItem,
  defaultDate,
  pillars,
}) => {
  const [channel, setChannel] = useState<Channel>('Instagram');
  const [format, setFormat] = useState<ContentFormat>('Reel');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || formatDateToISO(new Date()));
  const [pillar, setPillar] = useState('');
  const [status, setStatus] = useState<ContentStatus>('Planned');
  const [priority, setPriority] = useState<Priority>('Medium');

  // Instagram Fields
  const [creativeBrief, setCreativeBrief] = useState('');
  const [visualConcept, setVisualConcept] = useState('');
  const [hook, setHook] = useState('');
  const [caption, setCaption] = useState('');
  const [cta, setCta] = useState('');
  const [reference, setReference] = useState('');
  const [objective, setObjective] = useState('');

  // Website Fields
  const [articleTitle, setArticleTitle] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [searchIntent, setSearchIntent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [articleOutline, setArticleOutline] = useState('');
  const [articleBrief, setArticleBrief] = useState('');
  const [draftArticle, setDraftArticle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [internalLinkNotes, setInternalLinkNotes] = useState('');

  // Common Notes
  const [notes, setNotes] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleCopyCaption = () => {
    if (!caption) return;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  useEffect(() => {
    if (existingItem) {
      setChannel(existingItem.channel);
      setFormat(existingItem.format);
      setTitle(existingItem.title);
      setDate(existingItem.date);
      setPillar(existingItem.pillar);
      setStatus(existingItem.status);
      setPriority(existingItem.priority);

      setCreativeBrief(existingItem.creativeBrief || '');
      setVisualConcept(existingItem.visualConcept || '');
      setHook(existingItem.hook || '');
      setCaption(existingItem.caption || '');
      setCta(existingItem.cta || '');
      setReference(existingItem.reference || '');
      setObjective(existingItem.objective || '');

      setArticleTitle(existingItem.articleTitle || existingItem.title || '');
      setTargetKeyword(existingItem.targetKeyword || '');
      setSearchIntent(existingItem.searchIntent || '');
      setMetaTitle(existingItem.metaTitle || '');
      setMetaDescription(existingItem.metaDescription || '');
      setSlug(existingItem.slug || '');
      setArticleOutline(existingItem.articleOutline || '');
      setArticleBrief(existingItem.articleBrief || '');
      setDraftArticle(existingItem.draftArticle || '');
      setFeaturedImage(existingItem.featuredImage || '');
      setInternalLinkNotes(existingItem.internalLinkNotes || '');

      setNotes(existingItem.notes || '');
    } else {
      // New item
      setChannel('Instagram');
      setFormat('Reel');
      setTitle('');
      setDate(defaultDate || formatDateToISO(new Date()));
      setPillar(pillars.instagram[0] || 'Discovery');
      setStatus('Planned');
      setPriority('Medium');

      setCreativeBrief('');
      setVisualConcept('');
      setHook('');
      setCaption('');
      setCta('');
      setReference('');
      setObjective('');

      setArticleTitle('');
      setTargetKeyword('');
      setSearchIntent('');
      setMetaTitle('');
      setMetaDescription('');
      setSlug('');
      setArticleOutline('');
      setArticleBrief('');
      setDraftArticle('');
      setFeaturedImage('');
      setInternalLinkNotes('');

      setNotes('');
    }
  }, [existingItem, defaultDate, pillars, isOpen]);

  if (!isOpen) return null;

  const handleChannelSelect = (newChannel: Channel) => {
    setChannel(newChannel);
    if (newChannel === 'Website') {
      setFormat('Blog');
      setPillar(pillars.website[0] || 'Destination Guide');
    } else {
      setFormat('Reel');
      setPillar(pillars.instagram[0] || 'Discovery');
    }
  };

  const handleAutoSlug = (text: string) => {
    const generated = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave(
      {
        channel,
        format,
        title: title.trim(),
        date,
        pillar,
        status,
        priority,
        notes: notes.trim() || undefined,
        // Instagram
        creativeBrief: channel === 'Instagram' ? creativeBrief.trim() || undefined : undefined,
        visualConcept: channel === 'Instagram' ? visualConcept.trim() || undefined : undefined,
        hook: channel === 'Instagram' ? hook.trim() || undefined : undefined,
        caption: channel === 'Instagram' ? caption.trim() || undefined : undefined,
        cta: channel === 'Instagram' ? cta.trim() || undefined : undefined,
        reference: channel === 'Instagram' ? reference.trim() || undefined : undefined,
        objective: channel === 'Instagram' ? objective.trim() || undefined : undefined,
        // Website
        articleTitle: channel === 'Website' ? (articleTitle.trim() || title.trim()) : undefined,
        targetKeyword: channel === 'Website' ? targetKeyword.trim() || undefined : undefined,
        searchIntent: channel === 'Website' ? searchIntent.trim() || undefined : undefined,
        metaTitle: channel === 'Website' ? metaTitle.trim() || undefined : undefined,
        metaDescription: channel === 'Website' ? metaDescription.trim() || undefined : undefined,
        slug: channel === 'Website' ? slug.trim() || undefined : undefined,
        articleOutline: channel === 'Website' ? articleOutline.trim() || undefined : undefined,
        articleBrief: channel === 'Website' ? articleBrief.trim() || undefined : undefined,
        draftArticle: channel === 'Website' ? draftArticle.trim() || undefined : undefined,
        featuredImage: channel === 'Website' ? featuredImage.trim() || undefined : undefined,
        internalLinkNotes: channel === 'Website' ? internalLinkNotes.trim() || undefined : undefined,
      },
      existingItem ? existingItem.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-3xl my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {existingItem ? 'Edit Scheduled Item' : 'New Content Item'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {existingItem ? existingItem.title : 'Add to Content Planner'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Channel *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChannelSelect('Instagram')}
                className={`p-3 rounded border text-left flex items-start gap-3 transition-colors ${
                  channel === 'Instagram'
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Instagram className={`w-5 h-5 mt-0.5 ${channel === 'Instagram' ? 'text-purple-700' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Instagram</span>
                  <span className="text-[11px] text-slate-500">Reel, Carousel, Photo, Story</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSelect('Website')}
                className={`p-3 rounded border text-left flex items-start gap-3 transition-colors ${
                  channel === 'Website'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${channel === 'Website' ? 'text-blue-700' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Website</span>
                  <span className="text-[11px] text-slate-500">Blog Article</span>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content Title *
              </label>
              <input
                type="text"
                required
                placeholder={channel === 'Instagram' ? 'e.g. 5 Common Mistakes Most Beginners Make' : 'e.g. The Complete Strategic Guide: Step-by-Step Implementation'}
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (channel === 'Website' && !slug) {
                    handleAutoSlug(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
              />
            </div>

            {/* Date & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Schedule Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format *
                </label>
                {channel === 'Instagram' ? (
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value as InstagramFormat)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  >
                    <option value="Reel">Reel</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Photo">Photo</option>
                    <option value="Story">Story</option>
                  </select>
                ) : (
                  <div className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-100 rounded text-slate-600 font-medium">
                    Blog Article
                  </div>
                )}
              </div>
            </div>

            {/* Pillar, Status, Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Pillar
                </label>
                <select
                  value={pillar}
                  onChange={e => setPillar(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                >
                  {(channel === 'Instagram' ? pillars.instagram : pillars.website).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workflow Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ContentStatus)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                >
                  <option value="Idea">Idea</option>
                  <option value="Planned">Planned</option>
                  <option value="Production">Production</option>
                  <option value="Ready">Ready</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

          </div>

          {/* Conditional Channel Fields */}
          {channel === 'Instagram' ? (
            <div className="space-y-4 pt-4 border-t border-slate-200 bg-purple-50/20 p-4 rounded border">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram Creative Fields</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hook (First 3 seconds / 1st line)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stop making this mistake! Here is the proven alternative..."
                    value={hook}
                    onChange={e => setHook(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Call To Action (CTA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Save this post for your weekly team review!"
                    value={cta}
                    onChange={e => setCta(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Creative Brief
                </label>
                <textarea
                  rows={2}
                  placeholder="Core message, visual tone, pace, and editing directives..."
                  value={creativeBrief}
                  onChange={e => setCreativeBrief(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visual Concept
                </label>
                <textarea
                  rows={2}
                  placeholder="Scene breakdown: Scene 1 problem hook, Scene 2 solution framework, Scene 3 recap CTA..."
                  value={visualConcept}
                  onChange={e => setVisualConcept(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Caption Copy
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className={`tabular-nums ${caption.length > 2200 ? 'text-rose-600 font-bold' : ''}`}>
                      {caption.length} / 2,200 chars
                    </span>
                    <span>·</span>
                    <span className={`tabular-nums ${(caption.match(/#[a-zA-Z0-9_]+/g) || []).length > 30 ? 'text-rose-600 font-bold' : ''}`}>
                      {(caption.match(/#[a-zA-Z0-9_]+/g) || []).length} / 30 tags
                    </span>
                    {caption && (
                      <>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={handleCopyCaption}
                          className="text-slate-700 hover:text-slate-900 underline font-medium flex items-center gap-0.5"
                        >
                          {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Full caption copy including hashtags and formatting..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reference / Inspiration URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/reel/..."
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content Objective
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brand awareness, Saves, Lead Generation"
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t border-slate-200 bg-blue-50/20 p-4 rounded border">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Website Blog &amp; SEO Fields</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Primary Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. strategic execution framework 2026"
                    value={targetKeyword}
                    onChange={e => setTargetKeyword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Search Intent
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Informational, Commercial Guide"
                    value={searchIntent}
                    onChange={e => setSearchIntent(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. strategic-execution-framework-2026"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Featured Image URL or Asset
                  </label>
                  <input
                    type="text"
                    placeholder="Asset path or notes"
                    value={featuredImage}
                    onChange={e => setFeaturedImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta Title (Max 60 chars)
                  </label>
                  <input
                    type="text"
                    placeholder="The Complete Strategic Execution Playbook (2026)"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta Description (Max 160 chars)
                  </label>
                  <input
                    type="text"
                    placeholder="Discover proven step-by-step methods, actionable templates, and avoid costly missteps..."
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Brief &amp; Target Audience
                </label>
                <textarea
                  rows={2}
                  placeholder="Key angle, word count target, tone, and searcher persona..."
                  value={articleBrief}
                  onChange={e => setArticleBrief(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Outline (H2 / H3 Structure)
                </label>
                <textarea
                  rows={3}
                  placeholder="1. Executive Overview&#10;2. The Core Problem Statement&#10;3. 5-Step Implementation Framework&#10;4. Common Pitfalls &amp; Solutions&#10;5. Action Checklist"
                  value={articleOutline}
                  onChange={e => setArticleOutline(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Draft Article / Key Sections
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono tabular-nums">
                      {draftArticle.trim() ? draftArticle.trim().split(/\s+/).length : 0} words
                    </span>
                    <span>·</span>
                    <span>
                      ~{Math.max(1, Math.ceil((draftArticle.trim() ? draftArticle.trim().split(/\s+/).length : 0) / 200))} min read
                    </span>
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder="Article draft content or notes..."
                  value={draftArticle}
                  onChange={e => setDraftArticle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

              {/* SERP Search Preview */}
              <div className="p-3 bg-white border border-slate-200 rounded text-left space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Search Engine Result Preview (Google SERP)
                </div>
                <div className="text-blue-700 text-xs font-semibold hover:underline cursor-pointer truncate">
                  {metaTitle || articleTitle || title || 'Article Headline'}
                </div>
                <div className="text-emerald-700 text-[11px] font-mono truncate">
                  https://yoursite.com/blog/{slug || 'strategic-headline'}
                </div>
                <div className="text-slate-600 text-xs line-clamp-2">
                  {metaDescription || articleBrief || 'Learn practical step-by-step strategies, clear frameworks, and expert insights in this detailed guide.'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Linking Notes
                </label>
                <input
                  type="text"
                  placeholder="Link to /core-playbook and /case-studies"
                  value={internalLinkNotes}
                  onChange={e => setInternalLinkNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
                />
              </div>

            </div>
          )}

          {/* Common Notes */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Notes &amp; Logistics
            </label>
            <input
              type="text"
              placeholder="Tag partners, photographer credits, budget notes, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              {existingItem ? 'Update Content' : 'Save to Planner'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
