import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService, RegisterPayload, getSessionValue, clearAuthSession } from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => void;
  rememberedEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rememberedEmail, setRememberedEmail] = useState<string>(() => localStorage.getItem('ent_crm_remember_email') || '');

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getSessionValue("access_token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await authService.profile();
        setUser(user);
      } catch (error) {
        try {
          await authService.refresh();
          setUser(await authService.profile());
        } catch {
          clearAuthSession();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password, rememberMe);
      setUser(res.user);
      if (rememberMe) {
        localStorage.setItem("ent_crm_remember_email", email);
        setRememberedEmail(email);
      } else {
        localStorage.removeItem("ent_crm_remember_email");
        setRememberedEmail('');
      }
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        rememberedEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
