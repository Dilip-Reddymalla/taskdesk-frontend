import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getToken, setToken, clearToken, decodeToken } from '../utils/auth';
import { getMe } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);  // true on first mount
  const [error, setError]         = useState(null);

  // On mount: try to restore session from stored token
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token || !decodeToken(token)) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Token was stale / server rejected it
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  /**
   * Call after a successful login or register API call.
   * Persists the token and sets user state.
   */
  const login = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
    setError(null);
  }, []);

  /**
   * Clear state and token on logout.
   */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  /**
   * Update user fields in state (e.g. after XP change or profile update).
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  }), [user, loading, error, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
