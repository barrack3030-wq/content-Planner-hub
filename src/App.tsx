import React, { useState, useEffect, useCallback } from 'react';
import { 
  ContentItem, 
  ContentIdea, 
  ContentRules, 
  ContentPillars, 
  ContentStatus, 
  BrandProfile 
} from './types/content';
import { User, UserSession, UserSettings, AppView } from './types/auth';
import { 
  api, 
  getStoredSession, 
  saveStoredSession 
} from './services/api';
import { 
  DEFAULT_RULES, 
  DEFAULT_PILLARS, 
  DEFAULT_BRAND_PROFILE,
  loadContentItems,
  loadContentIdeas,
  resetAllDataToDefault
} from './utils/storage';
import { getMondayOfWeek, formatDateToISO } from './utils/dateUtils';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { PlannerView } from './components/PlannerView';
import { IdeasView } from './components/IdeasView';
import { RulesView } from './components/RulesView';
import { MonthlyOverviewView } from './components/MonthlyOverviewView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { ContentModal } from './components/ContentModal';
import { ExcelModal } from './components/ExcelModal';
import { WeeklyAssistantModal } from './components/WeeklyAssistantModal';
import { SuggestModal } from './components/SuggestModal';
import { ContentSuggestion } from './utils/scorecardUtils';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import { VerifyEmailView } from './components/auth/VerifyEmailView';

export default function App() {
  // Session & User State
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // App Routing State
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [urlToken, setUrlToken] = useState<string>('');
  const [loginEmailPrefill, setLoginEmailPrefill] = useState<string>('');
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string>('');

  // Content Data State (Strictly isolated per user_id)
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(DEFAULT_BRAND_PROFILE);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [rules, setRules] = useState<ContentRules>(DEFAULT_RULES);
  const [pillars, setPillars] = useState<ContentPillars>(DEFAULT_PILLARS);

  // Date context: Oct 5, 2026 week
  const [activeMonday, setActiveMonday] = useState<Date>(() => {
    return getMondayOfWeek(new Date(2026, 9, 5));
  });

  // Modal states
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch isolated data for current user session
  const loadUserData = useCallback(async (activeSession: UserSession) => {
    try {
      // 1. Fetch user's isolated content items
      const contentRes = await api.getContents(activeSession.session_token);
      if (contentRes.success && contentRes.data) {
        if (contentRes.data.length === 0 && activeSession.user_id === 'USER-001') {
          // Seed initial baseline for demo user Aji
          const seedItems = loadContentItems();
          setItems(seedItems);
          // Persist seed items for this user
          seedItems.forEach(item => api.saveContent(activeSession.session_token, item));
        } else {
          setItems(contentRes.data);
        }
      }

      // 2. Fetch user's isolated ideas
      const ideasRes = await api.getIdeas(activeSession.session_token);
      if (ideasRes.success && ideasRes.data) {
        if (ideasRes.data.length === 0 && activeSession.user_id === 'USER-001') {
          const seedIdeas = loadContentIdeas();
          setIdeas(seedIdeas);
          seedIdeas.forEach(idea => api.saveIdea(activeSession.session_token, idea));
        } else {
          setIdeas(ideasRes.data);
        }
      }

      // 3. Fetch user's isolated rules
      const rulesRes = await api.getRules(activeSession.session_token);
      if (rulesRes.success && rulesRes.data) {
        setRules(rulesRes.data);
      }

      // 4. Fetch user's settings
      const settingsRes = await api.getSettings(activeSession.session_token);
      if (settingsRes.success && settingsRes.data) {
        setUserSettings(settingsRes.data);
        if (settingsRes.data.brand_name || settingsRes.data.niche) {
          setBrandProfile({
            name: settingsRes.data.brand_name || `${activeSession.name}'s Studio`,
            niche: settingsRes.data.niche || 'Universal',
          });
        }
        if (settingsRes.data.pillars) {
          setPillars(settingsRes.data.pillars);
        }
      }
    } catch (err) {
      console.error('Failed to load user data from backend:', err);
    }
  }, []);

  // 1. Check Session & Parse URL on initial mount
  useEffect(() => {
    const initApp = async () => {
      // Check query parameters (e.g. ?view=verify-email&token=XYZ)
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as AppView | null;
      const tokenParam = params.get('token') || '';

      if (tokenParam) {
        setUrlToken(tokenParam);
      }

      if (viewParam && ['verify-email', 'reset-password', 'login', 'register', 'forgot-password'].includes(viewParam)) {
        setCurrentView(viewParam);
        setIsInitializing(false);
        return;
      }

      // Validate stored session
      const stored = getStoredSession();
      if (stored) {
        try {
          const res = await api.validateSession(stored.session_token);
          if (res.success && res.data) {
            setUser(res.data.user);
            setSession(res.data.session);
            saveStoredSession(res.data.session);

            // Check if verified
            if (!res.data.user.verified) {
              setCurrentView('verify-email');
            } else {
              setCurrentView('dashboard');
              await loadUserData(res.data.session);
            }
            setIsInitializing(false);
            return;
          }
        } catch {
          // invalid session
        }
        // If validation failed
        saveStoredSession(null);
        setSession(null);
        setUser(null);
      }

      setCurrentView('login');
      setIsInitializing(false);
    };

    initApp();
  }, [loadUserData]);

  // Handle Login Success
  const handleLoginSuccess = async (loggedInUser: User, activeSession: UserSession) => {
    setUser(loggedInUser);
    setSession(activeSession);
    saveStoredSession(activeSession);

    if (!loggedInUser.verified) {
      setCurrentView('verify-email');
      showToast('Please verify your email to unlock all features.');
      return;
    }

    setCurrentView('dashboard');
    showToast(`Welcome back, ${loggedInUser.name}!`);
    await loadUserData(activeSession);
  };

  // Handle Logout
  const handleLogout = async () => {
    if (session) {
      try {
        await api.logout(session.session_token);
      } catch (e) {
        console.error(e);
      }
    }
    saveStoredSession(null);
    setSession(null);
    setUser(null);
    setUserSettings(null);
    setItems([]);
    setIdeas([]);
    setCurrentView('login');
    showToast('Logged out successfully.');
  };

  // Content Handlers (Persisted to backend with session token)
  const handleOpenNewContent = (dateStr?: string) => {
    setEditingItem(null);
    setModalDefaultDate(dateStr || formatDateToISO(activeMonday));
    setIsContentModalOpen(true);
  };

  const handleOpenEditContent = (item: ContentItem) => {
    setEditingItem(item);
    setModalDefaultDate(item.date);
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (
    data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    let updatedItem: ContentItem;

    if (existingId) {
      updatedItem = {
        ...data,
        id: existingId,
        createdAt: now,
        updatedAt: now,
      };
      setItems(prev => prev.map(i => (i.id === existingId ? { ...i, ...data, updatedAt: now } : i)));
      showToast('Content updated successfully');
    } else {
      updatedItem = {
        ...data,
        id: `item-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setItems(prev => [updatedItem, ...prev]);
      showToast('New content added to planner');
    }

    // Persist to Google Apps Script backend
    if (session) {
      api.saveContent(session.session_token, updatedItem);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Delete this content item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Item deleted');
      if (session) {
        api.deleteContent(session.session_token, id);
      }
    }
  };

  const handleDuplicateContent = async (item: ContentItem) => {
    const now = new Date().toISOString();
    const duplicated: ContentItem = {
      ...item,
      id: `item-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: 'Planned',
      createdAt: now,
      updatedAt: now,
    };
    setItems(prev => [duplicated, ...prev]);
    showToast('Item duplicated');
    if (session) {
      api.saveContent(session.session_token, duplicated);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ContentStatus) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    const updated = { ...target, status: newStatus, updatedAt: now };

    setItems(prev => prev.map(item => (item.id === id ? updated : item)));
    showToast(`Status updated to ${newStatus}`);
    if (session) {
      api.saveContent(session.session_token, updated);
    }
  };

  // Idea Handlers
  const handleAddIdea = async (ideaData: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    const newIdea: ContentIdea = {
      id: `idea-${Date.now()}`,
      ...ideaData,
      createdAt: new Date().toISOString(),
    };
    setIdeas(prev => [newIdea, ...prev]);
    showToast('Idea added to backlog');
    if (session) {
      api.saveIdea(session.session_token, newIdea);
    }
  };

  const handleUpdateIdea = async (id: string, updated: Partial<ContentIdea>) => {
    const target = ideas.find(i => i.id === id);
    if (!target) return;
    const full = { ...target, ...updated };
    setIdeas(prev => prev.map(idea => (idea.id === id ? full : idea)));
    showToast('Idea updated');
    if (session) {
      api.saveIdea(session.session_token, full);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    showToast('Idea removed from backlog');
    if (session) {
      api.deleteIdea(session.session_token, id);
    }
  };

  const handleMoveIdeaToPlanner = async (idea: ContentIdea, scheduledDate: string) => {
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      channel: idea.channel,
      format: idea.suggestedFormat,
      title: idea.title,
      date: scheduledDate,
      pillar: idea.pillar,
      status: 'Planned',
      priority: idea.priority,
      creativeBrief: idea.channel === 'Instagram' ? idea.description : undefined,
      articleBrief: idea.channel === 'Website' ? idea.description : undefined,
      reference: idea.reference,
      notes: idea.notes,
      createdAt: now,
      updatedAt: now,
    };

    setItems(prev => [newItem, ...prev]);
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
    showToast(`Scheduled "${idea.title}" to planner on ${scheduledDate}`);

    if (session) {
      api.saveContent(session.session_token, newItem);
      api.deleteIdea(session.session_token, idea.id);
    }
  };

  const handleAddSuggestedItem = async (suggestion: ContentSuggestion, dateStr: string) => {
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      channel: suggestion.channel,
      format: suggestion.format,
      title: suggestion.title,
      date: dateStr,
      pillar: suggestion.pillar,
      status: 'Planned',
      priority: 'High',
      hook: suggestion.hook,
      creativeBrief: suggestion.channel === 'Instagram' ? suggestion.creativeBrief : undefined,
      articleBrief: suggestion.channel === 'Website' ? suggestion.creativeBrief : undefined,
      notes: `Suggested to fulfill ${suggestion.reason}`,
      createdAt: now,
      updatedAt: now,
    };

    setItems(prev => [newItem, ...prev]);
    showToast(`Added suggested ${suggestion.format} to planner!`);
    if (session) {
      api.saveContent(session.session_token, newItem);
    }
  };

  const handleImportSuccess = async (imported: ContentItem[]) => {
    setItems(prev => [...imported, ...prev]);
    showToast(`Imported ${imported.length} items from Excel`);
    if (session) {
      imported.forEach(i => api.saveContent(session.session_token, i));
    }
  };

  const handleSaveRules = async (newRules: ContentRules) => {
    setRules(newRules);
    showToast('Weekly content rules saved');
    if (session) {
      api.saveRules(session.session_token, newRules);
    }
  };

  const handleSaveUserSettings = async (updated: Partial<UserSettings>) => {
    const merged = { ...userSettings, ...updated } as UserSettings;
    setUserSettings(merged);
    showToast('User preferences saved');
    if (session) {
      api.saveSettings(session.session_token, merged);
    }
  };

  const handleResetAllData = () => {
    resetAllDataToDefault();
    setBrandProfile(DEFAULT_BRAND_PROFILE);
    setRules(DEFAULT_RULES);
    setPillars(DEFAULT_PILLARS);
    const demoItems = loadContentItems();
    const demoIdeas = loadContentIdeas();
    setItems(demoItems);
    setIdeas(demoIdeas);
    showToast('Restored universal demo sample data');
    if (session) {
      demoItems.forEach(i => api.saveContent(session.session_token, i));
      demoIdeas.forEach(i => api.saveIdea(session.session_token, i));
      api.saveRules(session.session_token, DEFAULT_RULES);
    }
  };

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Connecting to Content Planner...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATION VIEWS (Public / Non-session views)
  // =========================================================================

  if (!session || !user) {
    if (currentView === 'register') {
      return (
        <RegisterView
          onNavigateToLogin={(regEmail, msg) => {
            if (regEmail) setLoginEmailPrefill(regEmail);
            if (msg) setLoginSuccessNotice(msg);
            setCurrentView('login');
          }}
          onNavigateToVerify={(token, email) => {
            if (token) setUrlToken(token);
            if (email) setLoginEmailPrefill(email);
            setCurrentView('verify-email');
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    if (currentView === 'forgot-password') {
      return (
        <ForgotPasswordView
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToReset={token => {
            if (token) setUrlToken(token);
            setCurrentView('reset-password');
          }}
        />
      );
    }

    if (currentView === 'reset-password') {
      return (
        <ResetPasswordView
          initialToken={urlToken}
          onNavigateToLogin={(regEmail, successMsg) => {
            if (regEmail) setLoginEmailPrefill(regEmail);
            if (successMsg) setLoginSuccessNotice(successMsg);
            setCurrentView('login');
          }}
        />
      );
    }

    if (currentView === 'verify-email') {
      return (
        <VerifyEmailView
          initialToken={urlToken}
          initialEmail={loginEmailPrefill}
          onNavigateToLogin={(regEmail, successMsg) => {
            if (regEmail) setLoginEmailPrefill(regEmail);
            if (successMsg) setLoginSuccessNotice(successMsg);
            setCurrentView('login');
          }}
        />
      );
    }

    // Default: Login View
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigate={view => setCurrentView(view)}
        initialEmail={loginEmailPrefill}
        successNotice={loginSuccessNotice}
      />
    );
  }

  // If logged in but email not verified yet (Rule 15)
  if (user && !user.verified) {
    return (
      <VerifyEmailView
        initialToken={urlToken}
        initialEmail={user.email}
        onNavigateToLogin={() => handleLogout()}
      />
    );
  }

  // =========================================================================
  // PRIVATE AUTHENTICATED VIEWS
  // =========================================================================

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Top App Header & Nav */}
      <Navigation
        activeTab={currentView as ActiveTab}
        setActiveTab={tab => setCurrentView(tab)}
        onNewContent={() => handleOpenNewContent()}
        onOpenExcel={() => setIsExcelModalOpen(true)}
        totalPlannedThisWeek={items.length}
        brandName={brandProfile.name}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentView === 'dashboard' && (
          <DashboardView
            items={items}
            rules={rules}
            activeMonday={activeMonday}
            onChangeWeek={setActiveMonday}
            onResetToCurrentWeek={() => setActiveMonday(getMondayOfWeek(new Date(2026, 9, 5)))}
            onCheckThisWeek={() => setIsAssistantModalOpen(true)}
            onSuggestContent={() => setIsSuggestModalOpen(true)}
            onNewContentForDate={handleOpenNewContent}
            onSelectContent={handleOpenEditContent}
            onNavigateToTab={tab => setCurrentView(tab)}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            items={items}
            activeMonday={activeMonday}
            onChangeWeek={setActiveMonday}
            onResetToCurrentWeek={() => setActiveMonday(getMondayOfWeek(new Date(2026, 9, 5)))}
            onSelectContent={handleOpenEditContent}
            onNewContentForDate={handleOpenNewContent}
          />
        )}

        {currentView === 'planner' && (
          <PlannerView
            items={items}
            activeMonday={activeMonday}
            onSelectContent={handleOpenEditContent}
            onNewContent={() => handleOpenNewContent()}
            onDeleteContent={handleDeleteContent}
            onDuplicateContent={handleDuplicateContent}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentView === 'ideas' && (
          <IdeasView
            ideas={ideas}
            pillars={pillars}
            onAddIdea={handleAddIdea}
            onUpdateIdea={handleUpdateIdea}
            onDeleteIdea={handleDeleteIdea}
            onMoveToPlanner={handleMoveIdeaToPlanner}
          />
        )}

        {currentView === 'rules' && (
          <RulesView
            rules={rules}
            onSaveRules={handleSaveRules}
          />
        )}

        {currentView === 'monthly' && (
          <MonthlyOverviewView
            items={items}
            rules={rules}
            initialYear={activeMonday.getFullYear()}
            initialMonth={activeMonday.getMonth()}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            session={session}
            onUserUpdated={updated => setUser(updated)}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            user={user}
            session={session}
            onLogout={handleLogout}
            brandProfile={brandProfile}
            onSaveBrandProfile={newProfile => {
              setBrandProfile(newProfile);
              handleSaveUserSettings({ brand_name: newProfile.name, niche: newProfile.niche });
            }}
            pillars={pillars}
            onSavePillars={newPillars => {
              setPillars(newPillars);
              handleSaveUserSettings({ pillars: newPillars });
            }}
            userSettings={userSettings || undefined}
            onSaveUserSettings={handleSaveUserSettings}
            onResetAllData={handleResetAllData}
          />
        )}

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg transition-all animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Modal: Content Editor / Creator */}
      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => {
          setIsContentModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveContent}
        existingItem={editingItem}
        defaultDate={modalDefaultDate}
        pillars={pillars}
      />

      {/* Modal: Excel Integration */}
      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        items={items}
        activeMonday={activeMonday}
        onImportSuccess={handleImportSuccess}
      />

      {/* Modal: Weekly Planning Assistant */}
      <WeeklyAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        items={items}
        rules={rules}
        activeMonday={activeMonday}
        onOpenSuggest={() => setIsSuggestModalOpen(true)}
        onNewContent={() => handleOpenNewContent()}
      />

      {/* Modal: Auto Suggestion for Missing Formats */}
      <SuggestModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        items={items}
        rules={rules}
        activeMonday={activeMonday}
        onAddSuggestedItem={handleAddSuggestedItem}
      />

    </div>
  );
}
