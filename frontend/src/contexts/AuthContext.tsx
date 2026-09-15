import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../lib/types';
import { apiService } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string, organization?: string, role?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiService.auth.me();
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await apiService.auth.login({ 
      email: email.trim(), 
      password: password || 'password123' 
    });
    if (res && res.access_token) {
      localStorage.setItem('token', res.access_token);
      const userData = await apiService.auth.me();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const register = async (name: string, email: string, password: string, organization?: string, role?: string) => {
    await apiService.auth.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      organization: organization?.trim() || 'TechCorp Solutions',
      role: (role || 'developer').toLowerCase()
    });

    // Automatically login after successful registration
    await login(email, password);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await apiService.auth.updateProfile(data);
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, updateProfile, logout }}>
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

