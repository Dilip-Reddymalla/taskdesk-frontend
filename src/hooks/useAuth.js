import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Access auth state and helpers from anywhere in the tree.
 * Usage: const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
