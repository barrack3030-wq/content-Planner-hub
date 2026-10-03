import { User, UserSession, UserSettings, ApiResponse } from '../types/auth';
import { ContentItem, ContentIdea, ContentRules } from '../types/content';

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztqawfmGvaQNRw0GS3rvwVYojnlivpo5bgUmaQFfxS7Nl00p8JSiRDLLRIRcHieQ_c/exec';

const STORAGE_KEYS = {
  APPS_SCRIPT_URL: 'cp_apps_script_url_v1',
  SPREADSHEET_ID: 'cp_spreadsheet_id_v1',
  SIM_USERS: 'cp_gas_sim_users_v1',
  SIM_SESSIONS: 'cp_gas_sim_sessions_v1',
  SIM_VERIFY_TOKENS: 'cp_gas_sim_verify_tokens_v1',
  SIM_RESET_TOKENS: 'cp_gas_sim_reset_tokens_v1',
  SIM_CONTENTS: 'cp_gas_sim_contents_v1',
  SIM_IDEAS: 'cp_gas_sim_ideas_v1',
  SIM_RULES: 'cp_gas_sim_rules_v1',
  SIM_SETTINGS: 'cp_gas_sim_settings_v1',
  ACTIVE_SESSION: 'cp_active_session_v1',
};

// Retrieve configured Google Apps Script Web App URL (custom, env, or default)
export function getAppsScriptUrl(): string {
  const custom = localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL);
  if (custom !== null && custom !== undefined) return custom.trim();
  // Vite env var
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APPS_SCRIPT_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  return DEFAULT_APPS_SCRIPT_URL;
}

export function setAppsScriptUrl(url: string): void {
  localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, url.trim());
}

// Stored Spreadsheet ID or Sheet URL (for standalone Apps Script)
export function getSpreadsheetId(): string {
  const custom = localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
  return custom ? custom.trim() : '';
}

export function setSpreadsheetId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id.trim());
}

// Local Session Helpers
export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    const expiry = new Date(session.session_expiry).getTime();
    if (Date.now() > expiry) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: UserSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
}

// Helper: Simple SHA-256 for local simulator
async function hashPasswordSim(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + ':cp_secure_salt_key_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generic Request Executor: Calls Real Apps Script if URL provided, else executes local Google Sheets Simulator
async function callApi<T>(action: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const scriptUrl = getAppsScriptUrl();

  // REAL GOOGLE APPS SCRIPT WEB APP API CALL
  if (scriptUrl) {
    try {
      const spreadsheetId = getSpreadsheetId();
      const payload: Record<string, unknown> = {
        action,
        app_url: window.location.origin + window.location.pathname,
        ...(spreadsheetId ? { spreadsheet_id: spreadsheetId } : {}),
        ...params,
      };

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Prevents unnecessary preflight issues with Google Apps Script
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return { success: false, error: `Apps Script HTTP Error: ${response.status} ${response.statusText}` };
      }

      const data = await response.json();

      // Clear diagnostic if remote Apps Script threw getSheetByName error on null
      if (data && !data.success && typeof data.error === 'string' && data.error.includes("reading 'getSheetByName'")) {
        return {
          success: false,
          error: "Google Spreadsheet is not linked in Apps Script yet. Please update Code.gs with the latest script from Settings > Setup Guide, or bind the script inside a Google Sheet (Extensions > Apps Script).",
        };
      }

      return data as ApiResponse<T>;
    } catch (err) {
      console.warn('Google Apps Script request failed, falling back to local simulator:', err);
      // Fall through to simulator if network failed
    }
  }

  // BUILT-IN GOOGLE APPS SCRIPT & GOOGLE SHEETS SIMULATOR
  return simulateAppsScriptBackend<T>(action, params);
}

// =========================================================================
// GOOGLE APPS SCRIPT & GOOGLE SHEETS LOCAL ENGINE SIMULATOR
// Faithfully mirrors all rules, database schema, user isolation, and tokens!
// =========================================================================

interface SimUserRecord {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  last_login: string;
}

interface SimSessionRecord {
  session_token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

interface SimTokenRecord {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

// Initial demo user
const SEED_SIM_USERS: SimUserRecord[] = [
  {
    user_id: 'USER-001',
    name: 'Aji',
    email: 'aji@gmail.com',
    password_hash: '22e92c2df9e51c8a41031317d74db1909e755e3ceaa57e84aa68d9f1092e0797', // hash of "password123"
    verified: true,
    status: 'active',
    created_at: '2026-10-01T08:00:00Z',
    last_login: '2026-10-03T00:00:00Z',
  }
];

function getSimUsers(): SimUserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SIM_USERS, JSON.stringify(SEED_SIM_USERS));
      return SEED_SIM_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_SIM_USERS;
  }
}

function saveSimUsers(users: SimUserRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_USERS, JSON.stringify(users));
}

function getSimSessions(): SimSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSimSessions(sessions: SimSessionRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_SESSIONS, JSON.stringify(sessions));
}

function getSimVerifyTokens(): SimTokenRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_VERIFY_TOKENS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSimVerifyTokens(tokens: SimTokenRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_VERIFY_TOKENS, JSON.stringify(tokens));
}

function getSimResetTokens(): SimTokenRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_RESET_TOKENS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSimResetTokens(tokens: SimTokenRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_RESET_TOKENS, JSON.stringify(tokens));
}

function getSimContents(): (ContentItem & { user_id: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_CONTENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSimContents(contents: (ContentItem & { user_id: string })[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_CONTENTS, JSON.stringify(contents));
}

function getSimIdeas(): (ContentIdea & { user_id: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_IDEAS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSimIdeas(ideas: (ContentIdea & { user_id: string })[]): void {
  localStorage.setItem(STORAGE_KEYS.SIM_IDEAS, JSON.stringify(ideas));
}

function getSimRules(): Record<string, ContentRules> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_RULES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSimRules(rules: Record<string, ContentRules>): void {
  localStorage.setItem(STORAGE_KEYS.SIM_RULES, JSON.stringify(rules));
}

function getSimSettings(): Record<string, UserSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSimSettings(settings: Record<string, UserSettings>): void {
  localStorage.setItem(STORAGE_KEYS.SIM_SETTINGS, JSON.stringify(settings));
}

function generateRandomToken(len = 36): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

// Simulation Dispatcher
async function simulateAppsScriptBackend<T>(action: string, params: Record<string, unknown>): Promise<ApiResponse<T>> {
  // Artificial slight network delay for realism
  await new Promise(r => setTimeout(r, 120));

  const now = new Date();
  const users = getSimUsers();
  const sessions = getSimSessions();
  const verifyTokens = getSimVerifyTokens();
  const resetTokens = getSimResetTokens();

  // Helper to validate session
  const validateSessionToken = (token?: string): SimSessionRecord | null => {
    if (!token) return null;
    const found = sessions.find(s => s.session_token === token);
    if (!found) return null;
    if (new Date(found.expires_at).getTime() < Date.now()) return null;
    return found;
  };

  switch (action) {
    case 'register': {
      const name = String(params.name || '').trim();
      const email = String(params.email || '').trim().toLowerCase();
      const password = String(params.password || '');

      if (!name) return { success: false, error: 'Nama wajib diisi.' };
      if (!email) return { success: false, error: 'Email wajib diisi.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Format email harus valid.' };
      if (password.length < 8) return { success: false, error: 'Password minimal 8 karakter.' };

      if (users.some(u => u.email === email)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Generate USER-XXX
      let maxNum = 0;
      users.forEach(u => {
        if (u.user_id.startsWith('USER-')) {
          const n = parseInt(u.user_id.replace('USER-', ''), 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
      const userId = `USER-${String(maxNum + 1).padStart(3, '0')}`;
      const hash = await hashPasswordSim(password);

      const newUser: SimUserRecord = {
        user_id: userId,
        name,
        email,
        password_hash: hash,
        verified: false,
        status: 'active',
        created_at: now.toISOString(),
        last_login: '',
      };
      users.push(newUser);
      saveSimUsers(users);

      // Create Verification Token
      const token = generateRandomToken(36);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);

      verifyTokens.push({
        token,
        user_id: userId,
        created_at: now.toISOString(),
        expires_at: expiry.toISOString(),
        used: false,
      });
      saveSimVerifyTokens(verifyTokens);

      return {
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        data: {
          user_id: userId,
          name,
          email,
          verified: false,
        } as unknown as T,
        verification_token_preview: token,
        is_demo_mode: true,
      };
    }

    case 'verifyEmail':
    case 'verify_email': {
      const token = String(params.token || '').trim();
      if (!token) return { success: false, error: 'Verification token is required.' };

      const found = verifyTokens.find(t => t.token === token);
      if (!found) return { success: false, error: 'Invalid verification token.' };
      if (found.used) return { success: false, error: 'This verification token has already been used.' };
      if (Date.now() > new Date(found.expires_at).getTime()) {
        return { success: false, error: 'Verification token has expired. Please request a new verification email.' };
      }

      found.used = true;
      saveSimVerifyTokens(verifyTokens);

      const user = users.find(u => u.user_id === found.user_id);
      if (user) {
        user.verified = true;
        saveSimUsers(users);
        return { success: true, message: 'Email verified successfully! You can now log in.' };
      }
      return { success: false, error: 'User not found.' };
    }

    case 'resendVerification':
    case 'resend_verification': {
      const email = String(params.email || '').trim().toLowerCase();
      const user = users.find(u => u.email === email);
      if (!user) return { success: false, error: 'No account found with this email.' };
      if (user.verified) return { success: false, error: 'This email is already verified. You can log in directly.' };

      const token = generateRandomToken(36);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);

      verifyTokens.push({
        token,
        user_id: user.user_id,
        created_at: now.toISOString(),
        expires_at: expiry.toISOString(),
        used: false,
      });
      saveSimVerifyTokens(verifyTokens);

      return {
        success: true,
        message: 'A new verification email has been sent. Please check your inbox.',
        verification_token_preview: token,
        is_demo_mode: true,
      };
    }

    case 'login': {
      const email = String(params.email || '').trim().toLowerCase();
      const password = String(params.password || '');

      if (!email || !password) return { success: false, error: 'Email or password is required.' };

      const hash = await hashPasswordSim(password);
      const user = users.find(u => u.email === email && u.password_hash === hash);

      if (!user) {
        return { success: false, error: 'Email or password is incorrect.' };
      }

      if (!user.verified) {
        return {
          success: false,
          error: 'Please verify your email before continuing.',
        };
      }

      if (user.status === 'suspended') {
        return { success: false, error: 'Your account has been suspended. Please contact support.' };
      }

      user.last_login = now.toISOString();
      saveSimUsers(users);

      const sessionToken = generateRandomToken(48);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      const sessionRecord: SimSessionRecord = {
        session_token: sessionToken,
        user_id: user.user_id,
        created_at: now.toISOString(),
        expires_at: expiry.toISOString(),
      };
      sessions.push(sessionRecord);
      saveSimSessions(sessions);

      const safeUser: User = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login,
      };

      const userSession: UserSession = {
        session_token: sessionToken,
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        login_time: now.toISOString(),
        session_expiry: expiry.toISOString(),
      };

      return {
        success: true,
        message: 'Login successful.',
        data: {
          user: safeUser,
          session: userSession,
        } as unknown as T,
        is_demo_mode: true,
      };
    }

    case 'googleLogin':
    case 'google_login': {
      const email = String(params.email || '').trim().toLowerCase();
      let name = String(params.name || '').trim();
      if (!name && email) {
        name = email.split('@')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Valid Google email address is required.' };
      }

      let user = users.find(u => u.email === email);
      if (!user) {
        let maxNum = 0;
        for (const u of users) {
          if (u.user_id.startsWith('USER-')) {
            const num = parseInt(u.user_id.replace('USER-', ''), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
        const nextId = `USER-${String(maxNum + 1).padStart(3, '0')}`;
        user = {
          user_id: nextId,
          name,
          email,
          password_hash: 'GOOGLE_AUTH_VERIFIED',
          verified: true,
          status: 'active',
          created_at: now.toISOString(),
          last_login: now.toISOString(),
        };
        users.push(user);
        saveSimUsers(users);

        const rulesMap = getSimRules();
        if (!rulesMap[nextId]) {
          rulesMap[nextId] = {
            instagram: { reel: 2, carousel: 2, photo: 1, story: 5 },
            website: { blog: 2 },
          };
          saveSimRules(rulesMap);
        }
      } else {
        user.verified = true;
        user.last_login = now.toISOString();
        saveSimUsers(users);
      }

      const sessionToken = generateRandomToken(48);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      sessions.push({
        session_token: sessionToken,
        user_id: user.user_id,
        created_at: now.toISOString(),
        expires_at: expiry.toISOString(),
      });
      saveSimSessions(sessions);

      return {
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            verified: true,
            status: user.status,
            created_at: user.created_at,
            last_login: user.last_login,
          },
          session: {
            session_token: sessionToken,
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            login_time: now.toISOString(),
            session_expiry: expiry.toISOString(),
          },
        } as unknown as T,
      };
    }

    case 'validateSession':
    case 'validate_session': {
      const sessionToken = String(params.session_token || '');
      const session = validateSessionToken(sessionToken);
      if (!session) return { success: false, error: 'Your session has expired. Please log in again.' };

      const user = users.find(u => u.user_id === session.user_id);
      if (!user) return { success: false, error: 'User not found.' };

      const safeUser: User = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login,
      };

      const userSession: UserSession = {
        session_token: session.session_token,
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        login_time: session.created_at,
        session_expiry: session.expires_at,
      };

      return {
        success: true,
        data: { user: safeUser, session: userSession } as unknown as T,
      };
    }

    case 'logout': {
      const sessionToken = String(params.session_token || '');
      const filtered = sessions.filter(s => s.session_token !== sessionToken);
      saveSimSessions(filtered);
      return { success: true, message: 'Logged out successfully.' };
    }

    case 'forgotPassword':
    case 'forgot_password': {
      const email = String(params.email || '').trim().toLowerCase();
      const user = users.find(u => u.email === email);
      if (!user) {
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        };
      }

      const token = generateRandomToken(40);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 2);

      resetTokens.push({
        token,
        user_id: user.user_id,
        created_at: now.toISOString(),
        expires_at: expiry.toISOString(),
        used: false,
      });
      saveSimResetTokens(resetTokens);

      return {
        success: true,
        message: 'A password reset link has been sent to your email.',
        reset_token_preview: token,
        is_demo_mode: true,
      };
    }

    case 'resetPassword':
    case 'reset_password': {
      const token = String(params.token || '').trim();
      const newPassword = String(params.new_password || '');

      if (!token) return { success: false, error: 'Reset token is required.' };
      if (newPassword.length < 8) return { success: false, error: 'Password minimal 8 karakter.' };

      const found = resetTokens.find(t => t.token === token);
      if (!found) return { success: false, error: 'Invalid password reset token.' };
      if (found.used) return { success: false, error: 'This password reset token has already been used.' };
      if (Date.now() > new Date(found.expires_at).getTime()) {
        return { success: false, error: 'Password reset link has expired. Please request a new one.' };
      }

      found.used = true;
      saveSimResetTokens(resetTokens);

      const user = users.find(u => u.user_id === found.user_id);
      if (user) {
        user.password_hash = await hashPasswordSim(newPassword);
        saveSimUsers(users);
        return { success: true, message: 'Password has been reset successfully. Please log in with your new password.' };
      }
      return { success: false, error: 'User not found.' };
    }

    case 'updateProfile':
    case 'update_profile': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Your session has expired. Please log in again.' };

      const name = String(params.name || '').trim();
      if (!name) return { success: false, error: 'Name cannot be empty.' };

      const user = users.find(u => u.user_id === session.user_id);
      if (user) {
        user.name = name;
        saveSimUsers(users);
        return { success: true, message: 'Profile updated successfully.', data: { name } as unknown as T };
      }
      return { success: false, error: 'User not found.' };
    }

    case 'changePassword':
    case 'change_password': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Your session has expired. Please log in again.' };

      const currentPassword = String(params.current_password || '');
      const newPassword = String(params.new_password || '');
      if (newPassword.length < 8) return { success: false, error: 'New password must be at least 8 characters.' };

      const user = users.find(u => u.user_id === session.user_id);
      if (!user) return { success: false, error: 'User not found.' };

      const currentHash = await hashPasswordSim(currentPassword);
      if (user.password_hash !== currentHash) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      user.password_hash = await hashPasswordSim(newPassword);
      saveSimUsers(users);
      return { success: true, message: 'Password updated successfully.' };
    }

    // ---------------- DATA ISOLATION QUERIES (Strict user_id filtering) ----------------
    case 'getContents':
    case 'get_contents': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const contents = getSimContents();
      const userContents = contents.filter(c => c.user_id === session.user_id);
      return { success: true, data: userContents as unknown as T };
    }

    case 'saveContent':
    case 'save_content': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const item = (params.item || params) as ContentItem;
      const contents = getSimContents();
      const existingIdx = contents.findIndex(c => c.id === item.id && c.user_id === session.user_id);

      if (existingIdx >= 0) {
        contents[existingIdx] = { ...item, user_id: session.user_id, updatedAt: now.toISOString() };
      } else {
        contents.unshift({ ...item, id: item.id || `item-${Date.now()}`, user_id: session.user_id, createdAt: now.toISOString(), updatedAt: now.toISOString() });
      }
      saveSimContents(contents);
      return { success: true, message: 'Content saved.' };
    }

    case 'deleteContent':
    case 'delete_content': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const id = String(params.content_id || params.id || '');
      const contents = getSimContents();
      const filtered = contents.filter(c => !(c.id === id && c.user_id === session.user_id));
      saveSimContents(filtered);
      return { success: true, message: 'Content deleted.' };
    }

    case 'getIdeas':
    case 'get_ideas': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const ideas = getSimIdeas();
      const userIdeas = ideas.filter(i => i.user_id === session.user_id);
      return { success: true, data: userIdeas as unknown as T };
    }

    case 'saveIdea':
    case 'save_idea': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const idea = (params.idea || params) as ContentIdea;
      const ideas = getSimIdeas();
      const existingIdx = ideas.findIndex(i => i.id === idea.id && i.user_id === session.user_id);

      if (existingIdx >= 0) {
        ideas[existingIdx] = { ...idea, user_id: session.user_id };
      } else {
        ideas.unshift({ ...idea, id: idea.id || `idea-${Date.now()}`, user_id: session.user_id, createdAt: now.toISOString() });
      }
      saveSimIdeas(ideas);
      return { success: true, message: 'Idea saved.' };
    }

    case 'deleteIdea':
    case 'delete_idea': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const id = String(params.idea_id || params.id || '');
      const ideas = getSimIdeas();
      const filtered = ideas.filter(i => !(i.id === id && i.user_id === session.user_id));
      saveSimIdeas(filtered);
      return { success: true, message: 'Idea deleted.' };
    }

    case 'getRules':
    case 'get_rules': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const rulesMap = getSimRules();
      const userRules = rulesMap[session.user_id] || {
        instagram: { reel: 2, carousel: 2, photo: 1, story: 5 },
        website: { blog: 2 },
      };
      return { success: true, data: userRules as unknown as T };
    }

    case 'saveRules':
    case 'save_rules': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const rulesMap = getSimRules();
      rulesMap[session.user_id] = params.rules as ContentRules;
      saveSimRules(rulesMap);
      return { success: true, message: 'Rules saved.' };
    }

    case 'getSettings':
    case 'get_settings': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const settingsMap = getSimSettings();
      const userSettings = settingsMap[session.user_id] || {
        user_id: session.user_id,
        timezone: 'Asia/Makassar',
        week_start: 'Monday',
        email_notifications: true,
      };
      return { success: true, data: userSettings as unknown as T };
    }

    case 'saveSettings':
    case 'save_settings': {
      const session = validateSessionToken(String(params.session_token || ''));
      if (!session) return { success: false, error: 'Unauthorized.' };

      const settingsMap = getSimSettings();
      const newSettings = (params.settings || params) as UserSettings;
      settingsMap[session.user_id] = { ...newSettings, user_id: session.user_id };
      saveSimSettings(settingsMap);
      return { success: true, message: 'Settings saved.' };
    }

    default:
      return { success: false, error: `Invalid action: ${action}` };
  }
}

// -------------------------------------------------------------------------
// HIGH-LEVEL API EXPORTS
// -------------------------------------------------------------------------

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    callApi<{ user_id: string; email: string; name: string; verified: boolean }>('register', { name, email, password }),

  verifyEmail: (token: string) =>
    callApi<{ message: string }>('verifyEmail', { token }),

  resendVerification: (email: string) =>
    callApi<{ message: string }>('resendVerification', { email }),

  login: (email: string, password: string) =>
    callApi<{ user: User; session: UserSession }>('login', { email, password }),

  googleLogin: (email: string, name?: string) =>
    callApi<{ user: User; session: UserSession }>('googleLogin', { email, name }),

  validateSession: (session_token: string) =>
    callApi<{ user: User; session: UserSession }>('validateSession', { session_token }),

  logout: (session_token: string) =>
    callApi<{ message: string }>('logout', { session_token }),

  forgotPassword: (email: string) =>
    callApi<{ message: string }>('forgotPassword', { email }),

  resetPassword: (token: string, new_password: string) =>
    callApi<{ message: string }>('resetPassword', { token, new_password }),

  updateProfile: (session_token: string, name: string) =>
    callApi<{ name: string }>('updateProfile', { session_token, name }),

  changePassword: (session_token: string, current_password: string, new_password: string) =>
    callApi<{ message: string }>('changePassword', { session_token, current_password, new_password }),

  // User Isolated Data
  getContents: (session_token: string) =>
    callApi<ContentItem[]>('getContents', { session_token }),

  saveContent: (session_token: string, item: ContentItem) =>
    callApi<{ id: string }>('saveContent', { session_token, item }),

  deleteContent: (session_token: string, content_id: string) =>
    callApi<{ message: string }>('deleteContent', { session_token, content_id }),

  getIdeas: (session_token: string) =>
    callApi<ContentIdea[]>('getIdeas', { session_token }),

  saveIdea: (session_token: string, idea: ContentIdea) =>
    callApi<{ id: string }>('saveIdea', { session_token, idea }),

  deleteIdea: (session_token: string, idea_id: string) =>
    callApi<{ message: string }>('deleteIdea', { session_token, idea_id }),

  getRules: (session_token: string) =>
    callApi<ContentRules>('getRules', { session_token }),

  saveRules: (session_token: string, rules: ContentRules) =>
    callApi<{ message: string }>('saveRules', { session_token, rules }),

  getSettings: (session_token: string) =>
    callApi<UserSettings>('getSettings', { session_token }),

  saveSettings: (session_token: string, settings: Partial<UserSettings>) =>
    callApi<{ message: string }>('saveSettings', { session_token, settings }),

  // Diagnostics & Spreadsheet Linking
  ping: (spreadsheet_id?: string) =>
    callApi<{ message: string; connected_spreadsheet?: string; spreadsheet_url?: string; spreadsheet_id?: string }>('ping', { spreadsheet_id }),

  linkSpreadsheet: (spreadsheet_id: string) =>
    callApi<{ message: string; spreadsheet_id?: string; spreadsheet_url?: string }>('linkSpreadsheet', { spreadsheet_id }),
};
