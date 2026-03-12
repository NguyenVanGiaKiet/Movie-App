'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getMe();
      setUser(res.data?.user || null);
    } catch {
      Cookies.remove('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data;
    Cookies.set('token', token, { expires: 7 });
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { user, token } = res.data;
    Cookies.set('token', token, { expires: 7 });
    setUser(user);
    return user;
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data?.user);
    return res.data?.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
