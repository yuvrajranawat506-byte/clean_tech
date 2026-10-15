// frontend/src/context/AuthContext.jsx
// Global authentication state — wraps entire app
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial check done

  // On app load, restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('ecotrack_user');
    const token = localStorage.getItem('ecotrack_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid with server
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => logout()) // Token invalid — clear session
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('ecotrack_token', token);
    localStorage.setItem('ecotrack_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('ecotrack_token', token);
    localStorage.setItem('ecotrack_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setUser(null);
  }, []);

  const updateUserInContext = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('ecotrack_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInContext, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
