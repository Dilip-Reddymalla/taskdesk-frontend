import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Access the toast queue and helper to add toasts.
 * Usage:
 *   const { addToast } = useToast();
 *   addToast('Task completed!', 'success');
 * Types: 'success' | 'error' | 'info' | 'invite' | 'task'
 */
export function useToast() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useToast must be used inside <NotificationProvider>');
  const { toasts, addToast, removeToast } = ctx;
  return { toasts, addToast, removeToast };
}
