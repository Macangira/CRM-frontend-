import { apiClient } from "../api/fastapiClient";
import { clearAuthSession, getSessionValue, storeAuthSession } from '../utils/authStorage';

export interface RegisterPayload {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: string;
}

export { clearAuthSession, getSessionValue } from '../utils/authStorage';

export const authService = {
  // POST /api/auth/register (UserRegister Schema: fname, lname, email, password, phone)
  async register(payload: RegisterPayload) {
    try {
      const res = await apiClient.post("/api/auth/register", payload);
      console.log("FastAPI Register Success:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("FastAPI Register Failed:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msg = detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'field'}: ${d.msg}`).join(', ');
        throw new Error(msg);
      }
      if (typeof detail === 'string') {
        throw new Error(detail);
      }
      if (err.code === 'ERR_NETWORK' || !err.response) {
        throw new Error("FastAPI Backend (http://crmtasktracker-production.up.railway.app) connect nahi ho pa raha. Kripya check karein ki FastAPI server running hai ya nahi.");
      }
      throw new Error(detail || err.message || "Registration failed");
    }
  },

  // POST /api/auth/login (LoginUserRequest Schema: email, password)
  async login(email: string, password: string, rememberMe = false) {
    try {
      const res = await apiClient.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      console.log("FastAPI Login Success:", res.data);

      const token = res.data.access_token || res.data.token;
      const refreshToken = res.data.refresh_token;
      if (!token || !refreshToken) throw new Error('The server did not return a complete session.');
      storeAuthSession(token, refreshToken, rememberMe);

      // Fetch Real Logged-in User Profile from GET /api/auth/profile
      const profile = await apiClient.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        token,
        user: profile.data,
      };
    } catch (err: any) {
      console.error("FastAPI Login Failed:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msg = detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'field'}: ${d.msg}`).join(', ');
        throw new Error(msg);
      }
      if (typeof detail === 'string') {
        throw new Error(detail);
      }
      if (err.code === 'ERR_NETWORK' || !err.response) {
        throw new Error("FastAPI Backend Server (http://crmtasktracker-production.up.railway.app) offline hai. Kripya python server start karein.");
      }
      throw new Error(err.message || "Galat Email ya Password! Kripya sahi credentials daalein.");
    }
  },

  async refresh() {
    const refreshToken = getSessionValue('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    const res = await apiClient.post('/api/auth/refresh', { refresh_token: refreshToken }, { headers: { Authorization: undefined } });
    const accessToken = res.data.access_token;
    const nextRefreshToken = res.data.refresh_token;
    if (!accessToken || !nextRefreshToken) throw new Error('Invalid refresh response');
    const rememberMe = getSessionValue('ent_crm_session_persistent') === 'true';
    storeAuthSession(accessToken, nextRefreshToken, rememberMe);
    return accessToken;
  },

  // POST /api/auth/verified-email (Query params: email, otp)
  async verifyEmail(email: string, otp: string) {
    try {
      const res = await apiClient.post("/api/auth/verified-email", null, {
        params: { email: email.trim().toLowerCase(), otp: otp.trim() }
      });
      return res.data;
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "OTP verification failed";
      throw new Error(detail);
    }
  },

  // POST /api/auth/send-verify-email-otp (Query params: email)
  async resendVerifyOtp(email: string) {
    try {
      const res = await apiClient.post("/api/auth/send-verify-email-otp", null, {
        params: { email: email.trim().toLowerCase() }
      });
      return res.data;
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to resend OTP";
      throw new Error(detail);
    }
  },

  // POST /api/auth/forget-password (Query params: email)
  async forgotPassword(email: string) {
    try {
      const res = await apiClient.post("/api/auth/forget-password", null, {
        params: { email: email.trim().toLowerCase() }
      });
      return res.data;
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to send reset OTP";
      throw new Error(detail);
    }
  },

  // POST /api/auth/reset-password (Query params: email, otp, password)
  async resetPassword(email: string, otp: string, password: string) {
    try {
      const res = await apiClient.post("/api/auth/reset-password", null, {
        params: {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password
        }
      });
      return res.data;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msg = detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'field'}: ${d.msg}`).join(', ');
        throw new Error(msg);
      }
      throw new Error(detail || err.message || "Failed to reset password");
    }
  },

  // DELETE /api/auth/log-out
  async logout() {
    try {
      await apiClient.delete("/api/auth/log-out");
    } catch (e) {
      // ignore
    } finally {
      clearAuthSession();
    }
  },

  // GET /api/auth/profile
  async profile() {
    const res = await apiClient.get("/api/auth/profile");
    return res.data;
  },

  // PUT /api/auth/profile-update
  async profileUpdate(data: { fname?: string; lname?: string; phone?: string }) {
    const res = await apiClient.put("/api/auth/profile-update", data);
    return res.data;
  },

  // POST /api/auth/change-password
  async changePassword(data: any) {
    const res = await apiClient.post("/api/auth/change-password", data);
    return res.data;
  },
};
