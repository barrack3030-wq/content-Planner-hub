import React, { useState } from 'react';
import { Sliders, Check, RotateCcw } from 'lucide-react';
import { ContentRules } from '../types/content';
import { DEFAULT_RULES } from '../utils/storage';

interface RulesViewProps {
  rules: ContentRules;
  onSaveRules: (newRules: ContentRules) => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ rules, onSaveRules }) => {
  const [formData, setFormData] = useState<ContentRules>(rules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInstagramChange = (field: keyof ContentRules['instagram'], value: number) => {
    const val = Math.max(0, isNaN(value) ? 0 : value);
    setFormData(prev => ({
      ...prev,
      instagram: {
        ...prev.instagram,
        [field]: val,
      },
    }));
    setSavedSuccess(false);
  };

  const handleWebsiteChange = (field: keyof ContentRules['website'], value: number) => {
    const val = Math.max(0, isNaN(value) ? 0 : value);
    setFormData(prev => ({
      ...prev,
      website: {
        ...prev.website,
        [field]: val,
      },
    }));
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all weekly target rules to initial defaults?')) {
      setFormData(DEFAULT_RULES);
      onSaveRules(DEFAULT_RULES);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const weeklyInstagramTotal =
    formData.instagram.reel +
    formData.instagram.carousel +
    formData.instagram.photo +
    formData.instagram.story;

  const weeklyWebsiteTotal = formData.website.blog;
  const weeklyGrandTotal = weeklyInstagramTotal + weeklyWebsiteTotal;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Pakem Konten Mingguan</span>
            <span>·</span>
            <span>Target Volume</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <span>Content Rules &amp; Targets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tentukan pakem target jumlah konten per minggu untuk Instagram dan Website Blog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Instagram Rules Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Instagram Rules</h2>
              <p className="text-xs text-slate-500">Target posting per minggu per format</p>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              {weeklyInstagramTotal} posts / week
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            
            {/* Reel */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Reel Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.instagram.reel}
                  onChange={e => handleInstagramChange('reel', parseInt(e.target.value, 10))}
                  className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-hidden focus:border-slate-500"
                />
                <span className="text-xs text-slate-500">/ week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Short-form video for discovery</p>
            </div>

            {/* Carousel */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Carousel Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.instagram.carousel}
                  onChange={e => handleInstagramChange('carousel', parseInt(e.target.value, 10))}
                  className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-hidden focus:border-slate-500"
                />
                <span className="text-xs text-slate-500">/ week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Multi-slide educational cards</p>
            </div>

            {/* Photo */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Single Photo Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.instagram.photo}
                  onChange={e => handleInstagramChange('photo', parseInt(e.target.value, 10))}
                  className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-hidden focus:border-slate-500"
                />
                <span className="text-xs text-slate-500">/ week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Cinematic stills &amp; hero visuals</p>
            </div>

            {/* Story */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Story Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.instagram.story}
                  onChange={e => handleInstagramChange('story', parseInt(e.target.value, 10))}
                  className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-hidden focus:border-slate-500"
                />
                <span className="text-xs text-slate-500">/ week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Daily updates, polls &amp; BTS</p>
            </div>

          </div>
        </div>

        {/* Website Rules Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Website Rules</h2>
              <p className="text-xs text-slate-500">Target publikasi artikel blog per minggu</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {weeklyWebsiteTotal} articles / week
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            {/* Blog Article */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Blog Article Target
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.website.blog}
                  onChange={e => handleWebsiteChange('blog', parseInt(e.target.value, 10))}
                  className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-hidden focus:border-slate-500"
                />
                <span className="text-xs text-slate-500">/ week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Long-form SEO guides, tutorials &amp; case studies</p>
            </div>

            {/* Total Target Summary */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Total Weekly Target</span>
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {weeklyGrandTotal} total pieces
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ~{weeklyGrandTotal * 4} content pieces projected every 4 weeks
              </p>
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-4 h-4" />
                Pakem rules updated successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-xs"
          >
            Save Rules &amp; Update Scorecard
          </button>
        </div>

      </form>
    </div>
  );
};
