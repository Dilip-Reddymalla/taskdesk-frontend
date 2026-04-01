import React, {
  createContext, useState, useContext, useEffect,
  useCallback, useMemo, useRef
} from 'react';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationsApi';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const { on } = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [panelOpen, setPanelOpen]         = useState(false);

  // Toast queue: { id, message, type, data }
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // ── Fetch notifications from server ──────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getNotifications({ showRead: true });
      setNotifications(data.notifications ?? []);
      setUnreadCount((data.notifications ?? []).filter(n => !n.isRead).length);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
    else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // ── Toast helpers ─────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info', data = null) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, data }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Add incoming notification ─────────────────────────────────
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(c => c + 1);
  }, []);

  // ── Mark single as read ───────────────────────────────────────
  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  // ── Listen for real-time socket events ───────────────────────
  useEffect(() => {
    const cleanup = [];

    cleanup.push(on('invite_received', (invite) => {
      addNotification({
        _id: Date.now().toString(),
        type: 'invite_received',
        message: `You received an invite to join "${invite?.plan?.title ?? 'a plan'}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: invite,
      });
      addToast(`📨 Invite received: ${invite?.plan?.title ?? 'a plan'}`, 'invite', invite);
    }));

    cleanup.push(on('task_created', (task) => {
      addToast(`✅ New task: "${task?.title ?? 'Untitled'}"`, 'task');
    }));

    cleanup.push(on('task_completed', (payload) => {
      addToast(`🎉 A task was completed!`, 'success');
    }));

    cleanup.push(on('task_updated', (task) => {
      addToast(`✏️ Task updated: "${task?.title ?? ''}"`, 'info');
    }));

    cleanup.push(on('member_joined', (payload) => {
      addToast(`👋 A new member joined the plan`, 'info');
    }));

    return () => cleanup.forEach(fn => typeof fn === 'function' && fn());
  }, [on, addNotification, addToast]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    panelOpen,
    setPanelOpen,
    toasts,
    fetchNotifications,
    addNotification,
    addToast,
    removeToast,
    markRead,
    markAllRead,
  }), [
    notifications, unreadCount, loading, panelOpen,
    toasts, fetchNotifications, addNotification,
    addToast, removeToast, markRead, markAllRead,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
