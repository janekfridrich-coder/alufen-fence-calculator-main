import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiRequest } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiRequest('/api/auth?action=me', { method: 'GET' }).then(({ data }) => {
      if (cancelled) return;
      setUser(data?.user ?? null);
      setIsLoadingAuth(false);
    });
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:expired', onExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await apiRequest('/api/auth?action=login', { body: { email, password } });
    if (error) throw new Error(error.message);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/api/auth?action=logout');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
