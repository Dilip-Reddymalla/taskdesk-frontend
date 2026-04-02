import React, { useContext, useEffect, useCallback } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/date';
import { acceptInvite, rejectInvite } from '../../api/invitesApi';
import '../../styles/components/notification-panel.css';

const TYPE_ICONS = {
  task_assigned:  { icon: '🔔', color: 'var(--accent)' },
  task_completed: { icon: '✅', color: 'var(--green)' },
  task_updated:   { icon: '✏️', color: 'var(--amber)' },
  invite_received:{ icon: '📨', color: 'var(--cyan)' },
};

function NotificationPanel() {
  const {
    notifications,
    panelOpen, setPanelOpen,
    markRead, markAllRead,
    loading,
    fetchNotifications,
    addToast,
  } = useContext(NotificationContext);

  useEffect(() => {
    if (panelOpen) fetchNotifications();
  }, [panelOpen, fetchNotifications]);

  const handleAcceptInvite = useCallback(async (notification) => {
    // If notification has data.invite, use that. Otherwise fallback to relatedId which is the invite _id.
    const inviteId = notification?.data?._id || notification?.relatedId;
    const planId = notification?.data?.plan?._id || notification?.data?.plan;
    
    if (!inviteId) return;
    try {
      // Pass inviteId to backend. planId is optional now in the updated backend.
      await acceptInvite(inviteId, planId || '');
      await markRead(notification._id);
      addToast('✅ Invite accepted! You joined the plan.', 'success');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to accept invite', 'error');
    }
  }, [markRead, addToast]);

  const handleRejectInvite = useCallback(async (notification) => {
    const inviteId = notification?.data?._id || notification?.relatedId;
    
    if (!inviteId) return;
    try {
      await rejectInvite(inviteId);
      await markRead(notification._id);
      addToast('Invite rejected.', 'info');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to reject invite', 'error');
    }
  }, [markRead, addToast]);

  if (!panelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="notif-backdrop" onClick={() => setPanelOpen(false)} />

      {/* Drawer */}
      <aside className="notif-panel" aria-label="Notifications">
        {/* Header */}
        <div className="notif-panel__header">
          <div>
            <h3 className="notif-panel__title">Notifications</h3>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="notif-panel__count">
                {notifications.filter(n => !n.isRead).length} unread
              </span>
            )}
          </div>
          <div className="notif-panel__header-actions">
            <button className="notif-panel__mark-all" onClick={markAllRead}>
              Mark all read
            </button>
            <button
              className="notif-panel__close"
              onClick={() => setPanelOpen(false)}
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="notif-panel__body">
          {loading && (
            <div className="notif-panel__empty">Loading…</div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="notif-panel__empty">
              <span className="notif-panel__empty-icon">🎉</span>
              <p className="notif-panel__empty-title">You're all caught up!</p>
              <p className="notif-panel__empty-sub">No new notifications.</p>
            </div>
          )}

          {notifications.map((notif) => {
            const config = TYPE_ICONS[notif.type] ?? TYPE_ICONS.task_assigned;
            const isInvite = notif.type === 'invite_received';

            return (
              <div
                key={notif._id}
                className={`notif-item ${notif.isRead ? 'notif-item--read' : ''}`}
                onClick={() => !notif.isRead && markRead(notif._id)}
              >
                <div
                  className="notif-item__icon"
                  style={{ background: config.color + '22', color: config.color }}
                >
                  {config.icon}
                </div>
                <div className="notif-item__body">
                  <p className="notif-item__message">{notif.message}</p>
                  <p className="notif-item__time">{formatRelativeTime(notif.createdAt)}</p>
                  {isInvite && !notif.isRead && (
                    <div className="notif-item__actions">
                      <button
                        className="notif-item__btn notif-item__btn--accept"
                        onClick={(e) => { e.stopPropagation(); handleAcceptInvite(notif); }}
                      >Accept</button>
                      <button
                        className="notif-item__btn notif-item__btn--reject"
                        onClick={(e) => { e.stopPropagation(); handleRejectInvite(notif); }}
                      >Decline</button>
                    </div>
                  )}
                </div>
                {!notif.isRead && <div className="notif-item__unread-dot" />}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export default NotificationPanel;
