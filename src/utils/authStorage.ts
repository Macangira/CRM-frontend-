const SESSION_KEYS = ['access_token', 'ent_crm_auth_token', 'refresh_token', 'ent_crm_session_persistent'] as const;

export type AuthSessionKey = typeof SESSION_KEYS[number];

export function getSessionValue(key: AuthSessionKey) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function clearAuthSession() {
  SESSION_KEYS.forEach(key => { localStorage.removeItem(key); sessionStorage.removeItem(key); });
  localStorage.removeItem('ent_crm_session_persistent');
  sessionStorage.removeItem('ent_crm_session_persistent');
}

export function storeAuthSession(accessToken: string, refreshToken: string, rememberMe: boolean) {
  clearAuthSession();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('access_token', accessToken);
  storage.setItem('ent_crm_auth_token', accessToken);
  storage.setItem('refresh_token', refreshToken);
  storage.setItem('ent_crm_session_persistent', String(rememberMe));
}
