import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  ListOrdered, 
  Lightbulb, 
  Sliders, 
  FileSpreadsheet, 
  Plus, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { User } from '../types/auth';

export type ActiveTab = 'dashboard' | 'calendar' | 'planner' | 'ideas' | 'rules' | 'monthly' | 'settings' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewContent: () => void;
  onOpenExcel: () => void;
  totalPlannedThisWeek: number;
  brandName?: string;
  user?: User | null;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onNewContent,
  onOpenExcel,
  brandName,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'ideas', label: 'Ideas', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'rules', label: 'Rules & Pakem', icon: <Sliders className="w-4 h-4" /> },
    { id: 'monthly', label: 'Monthly', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Wordmark & Channel Indicators */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="text-left font-semibold text-slate-900 tracking-tight text-base hover:text-slate-700 transition-colors flex items-center gap-2"
            >
              <span>Content Planner</span>
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                · {brandName ? brandName : 'Instagram & Blog'}
              </span>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & User Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
              title="Import, Export & Template"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={onNewContent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Content</span>
            </button>

            {/* User Profile Badge button */}
            {user && (
              <div className="hidden sm:flex items-center pl-1 border-l border-slate-200 gap-1.5">
                <button
                  onClick={() => handleSelectTab('profile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
                    activeTab === 'profile'
                      ? 'bg-slate-100 border-slate-300 font-semibold text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title={`Logged in as ${user.name} (${user.user_id})`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[100px]">{user.name}</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                    {user.user_id}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 md:hidden border border-slate-200 rounded"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-3 space-y-1 shadow-sm">
          {user && (
            <div className="p-2 mb-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-900 block">{user.name}</span>
                  <span className="font-mono text-[11px] text-slate-500">{user.user_id}</span>
                </div>
              </div>
              <button
                onClick={() => handleSelectTab('profile')}
                className="text-xs font-semibold text-slate-700 underline"
              >
                Profile
              </button>
            </div>
          )}

          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {user && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-rose-700 hover:bg-rose-50 text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.email})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
