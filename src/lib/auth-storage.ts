export const AUTH_TOKEN_KEY = "nyayasetu_auth_token";
export const AUTH_USER_KEY = "nyayasetu_auth_user";
export const AUTH_EXPIRED_EVENT = "nyayasetu:auth-expired";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  requested_role: string;
  approval_status: string;
  professional_id?: string | null;
  organization?: string | null;
  city?: string | null;
  preferred_language?: string;
  approval_notes?: string | null;
  can_access_lawyer_dashboard?: boolean;
  can_access_police_dashboard?: boolean;
  can_access_admin_dashboard?: boolean;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
};

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function persistAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function notifyAuthExpired(): void {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}
