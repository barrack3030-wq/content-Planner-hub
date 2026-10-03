export interface User {
  user_id: string; // e.g. "USER-001"
  name: string;
  email: string;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  last_login: string;
}

export interface UserSession {
  session_token: string;
  user_id: string;
  email: string;
  name: string;
  login_time: string;
  session_expiry: string;
}

export interface UserSettings {
  user_id: string;
  timezone: string; // default "Asia/Makassar"
  week_start: 'Monday' | 'Sunday'; // default "Monday"
  email_notifications: boolean; // default true
  brand_name?: string;
  niche?: string;
  pillars?: {
    instagram: string[];
    website: string[];
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  verification_token_preview?: string; // helpful for testing verification link
  reset_token_preview?: string; // helpful for testing password reset
  is_demo_mode?: boolean;
}

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';
export type AppView = AuthView | 'dashboard' | 'planner' | 'calendar' | 'ideas' | 'rules' | 'monthly' | 'profile' | 'settings';
