import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const stored = localStorage.getItem('refreshToken');
    if (!stored) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored }),
      });
      if (!res.ok) { logout(); return false; }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? data);
      } else if (res.status === 401 || res.status === 403) {
        // Try refresh
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem('token')!;
          const res2 = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${newToken}` },
          });
          if (res2.ok) {
            const data2 = await res2.json();
            setUser(data2.user ?? data2);
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.warn('Backend indisponível, sessão não restaurada.');
      }
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, refreshToken]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // Auto-refresh: check every 90 minutes and refresh token proactively
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token || !user) return;
      // Decode expiry without library
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        // If less than 10 minutes left, refresh
        if (expiresIn < 10 * 60 * 1000) {
          refreshToken();
        }
      } catch { /* ignore */ }
    }, 5 * 60 * 1000); // check every 5 minutes
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }

    const data: AuthResponse & { refreshToken?: string } = await res.json();
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
