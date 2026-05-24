import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        userAPI.getProfile().catch(() => {});
        setLoading(false);
        return;
      }

      try {
        const refreshResponse = await authAPI.refresh();
        const refreshedToken = refreshResponse.data.token;
        localStorage.setItem('token', refreshedToken);
        setToken(refreshedToken);

        const profileResponse = await userAPI.getProfile();
        setUser(profileResponse.data);
        localStorage.setItem('user', JSON.stringify(profileResponse.data));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    window.addEventListener('dayout:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('dayout:auth-expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    const handleAuthRefreshed = (event) => {
      setToken(event.detail.token);
    };

    window.addEventListener('dayout:auth-refreshed', handleAuthRefreshed);
    return () => window.removeEventListener('dayout:auth-refreshed', handleAuthRefreshed);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Local logout should still happen if server logout fails.
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
