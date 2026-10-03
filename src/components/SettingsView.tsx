import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  Clock, 
  Bell, 
  User as UserIcon,
  Mail,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ContentPillars, BrandProfile } from '../types/content';
import { User, UserSession, UserSettings } from '../types/auth';
import { DEFAULT_PILLARS } from '../utils/storage';

interface SettingsViewProps {
  user?: User | null;
  session?: UserSession | null;
  onLogout: () => void;
  brandProfile?: BrandProfile;
  onSaveBrandProfile?: (profile: BrandProfile) => void;
  pillars: ContentPillars;
  onSavePillars: (pillars: ContentPillars) => void;
  userSettings?: UserSettings;
  onSaveUserSettings?: (settings: Partial<UserSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  session,
  onLogout,
  brandProfile,
  onSaveBrandProfile,
  pillars,
  onSavePillars,
  userSettings,
  onSaveUserSettings,
  onResetAllData,
}) => {
  const [localPillars, setLocalPillars] = useState<ContentPillars>(pillars);
  
  // User Preferences from SETTINGS sheet
  const [timezone, setTimezone] = useState(userSettings?.timezone || 'Asia/Makassar');
  const [weekStart, setWeekStart] = useState<'Monday' | 'Sunday'>(userSettings?.week_start || 'Monday');
  const [emailNotifs, setEmailNotifs] = useState(userSettings?.email_notifications !== false);

  const [newIgPillar, setNewIgPillar] = useState('');
  const [newWebPillar, setNewWebPillar] = useState('');
  const [saveNotification, setSaveNotification] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveUserSettings) {
      onSaveUserSettings({
        timezone,
        week_start: weekStart,
        email_notifications: emailNotifs,
      });
    }
    triggerSaved();
  };

  const handleAddIgPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgPillar.trim()) return;
    if (localPillars.instagram.includes(newIgPillar.trim())) return;

    const updated = {
      ...localPillars,
      instagram: [...localPillars.instagram, newIgPillar.trim()],
    };
    setLocalPillars(updated);
    onSavePillars(updated);
    setNewIgPillar('');
    triggerSaved();
  };

  const handleDeleteIgPillar = (pillarName: string) => {
    const updated = {
      ...localPillars,
      instagram: localPillars.instagram.filter(p => p !== pillarName),
    };
    setLocalPillars(updated);
    onSavePillars(updated);
    triggerSaved();
  };

  const handleAddWebPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebPillar.trim()) return;
    if (localPillars.website.includes(newWebPillar.trim())) return;

    const updated = {
      ...localPillars,
      website: [...localPillars.website, newWebPillar.trim()],
    };
    setLocalPillars(updated);
    onSavePillars(updated);
    setNewWebPillar('');
    triggerSaved();
  };

  const handleDeleteWebPillar = (pillarName: string) => {
    const updated = {
      ...localPillars,
      website: localPillars.website.filter(p => p !== pillarName),
    };
    setLocalPillars(updated);
    onSavePillars(updated);
    triggerSaved();
  };

  const handleResetPillars = () => {
    if (window.confirm('Kembalikan content pillars ke konfigurasi bawaan standar?')) {
      setLocalPillars(DEFAULT_PILLARS);
      onSavePillars(DEFAULT_PILLARS);
      triggerSaved();
    }
  };

  const triggerSaved = () => {
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Pengaturan Akun &amp; Preferensi</span>
            <span>·</span>
            <span>Content Planner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-700" />
            <span>Pengaturan &amp; Akun</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun pengguna, sesi aktif, preferensi zona waktu, dan pilar konten Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveNotification && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Tersimpan
            </span>
          )}
          <button
            onClick={handleResetPillars}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pilar Standar</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Akun Pengguna & Sesi (User Account & Log Out Option) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Akun Pengguna &amp; Sesi Aktif</h2>
              <p className="text-xs text-slate-500">Kelola akun yang sedang masuk atau ganti pengguna lain</p>
            </div>
          </div>
          {user?.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Terverifikasi
            </span>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs select-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : (session?.name ? session.name.charAt(0).toUpperCase() : 'U')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">
                  {user?.name || session?.name || 'Pengguna'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {user?.user_id || session?.user_id || 'USER'}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || session?.email || 'email@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Log Out Buttons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Yakin ingin keluar dari akun (${user?.email || session?.email || 'anda'})?\nUser lainnya dapat langsung login setelah ini.`)) {
                  onLogout();
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun (Log Out)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aplikasi siap digunakan multi-user secara bergantian.</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Data dan jadwal konten tersinkron otomatis ke Google Sheets database.
          </span>
        </div>
      </div>

      {/* SECTION 2: Preferensi Waktu & Regional */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock className="w-4 h-4 text-slate-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Preferensi Waktu &amp; Notifikasi</h2>
            <p className="text-xs text-slate-500">Atur zona waktu lokal kalender dan pengingat jadwal konten</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zona Waktu (Timezone)
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
              >
                <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8) - Default</option>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hari Mulai Mingguan (Week Start)
              </label>
              <select
                value={weekStart}
                onChange={e => setWeekStart(e.target.value as 'Monday' | 'Sunday')}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500 bg-white"
              >
                <option value="Monday">Senin / Monday (Standar ISO)</option>
                <option value="Sunday">Minggu / Sunday</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="notifs"
              checked={emailNotifs}
              onChange={e => setEmailNotifs(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label htmlFor="notifs" className="text-xs text-slate-700 flex items-center gap-1 cursor-pointer">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Aktifkan notifikasi email pengingat jadwal konten mingguan</span>
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              Simpan Preferensi
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Content Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Instagram Pillars */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pilar Konten Instagram</h2>
            <p className="text-xs text-slate-500">Kategori tema untuk Reels, Carousels, Single Post, dan Stories</p>
          </div>

          <form onSubmit={handleAddIgPillar} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Edukasi, Tips Praktis, Review"
              value={newIgPillar}
              onChange={e => setNewIgPillar(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden">
            {localPillars.instagram.map(p => (
              <div key={p} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <span className="font-medium text-slate-800">{p}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteIgPillar(p)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Hapus pilar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Website Pillars */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pilar Konten Website &amp; Blog</h2>
            <p className="text-xs text-slate-500">Kategori topik artikel SEO &amp; Editorial Website</p>
          </div>

          <form onSubmit={handleAddWebPillar} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Panduan Lengkap, Tren Industri"
              value={newWebPillar}
              onChange={e => setNewWebPillar(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-hidden focus:border-slate-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden">
            {localPillars.website.map(p => (
              <div key={p} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <span className="font-medium text-slate-800">{p}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteWebPillar(p)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Hapus pilar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Danger Zone / Data Management */}
      <div className="bg-white border border-rose-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-rose-800">Reset Data Kalender &amp; Template</h3>
        <p className="text-xs text-slate-600 mt-1">
          Kembalikan contoh jadwal konten, ide, aturan, dan pilar ke status awal bawaan sistem.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Reset semua jadwal konten, ide, dan pengaturan ke template awal?')) {
              onResetAllData();
            }
          }}
          className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
        >
          Reset Data Planner ke Bawaan
        </button>
      </div>

    </div>
  );
};
