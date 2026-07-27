import axios from 'axios';
import { getSessionValue, clearAuthSession, storeAuthSession } from '../utils/authStorage';

// Ensure baseURL is http://crmtasktracker-production.up.railway.app without trailing /api to avoid double /api/api/ prefix
export const API_BASE_URL = "https://crmtasktracker-production.up.railway.app/" ;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT bearer token from localStorage
apiClient.interceptors.request.use(
  config => {
    const token = getSessionValue('access_token') || getSessionValue('ent_crm_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

let refreshRequest: Promise<string> | null = null;

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const request = error.config as typeof error.config & { _retry?: boolean };
    const isRefreshRequest = request?.url?.includes('/api/auth/refresh');
    if (error.response?.status !== 401 || request?._retry || isRefreshRequest) return Promise.reject(error);

    request._retry = true;
    const refreshToken = getSessionValue('refresh_token');
    if (!refreshToken) return Promise.reject(error);
    try {
      refreshRequest ||= apiClient.post('/api/auth/refresh', { refresh_token: refreshToken }, { headers: { Authorization: undefined } })
        .then(response => {
          const rememberMe = localStorage.getItem('ent_crm_session_persistent') === 'true' || sessionStorage.getItem('ent_crm_session_persistent') === 'true';
          storeAuthSession(response.data.access_token, response.data.refresh_token, rememberMe);
          return response.data.access_token as string;
        })
        .finally(() => { refreshRequest = null; });
      const token = await refreshRequest;
      request.headers.Authorization = `Bearer ${token}`;
      return apiClient(request);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
