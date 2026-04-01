import api from '../config/api';

// ── GET /api/notification/get ────────────────────────────────
export async function getNotifications({ page = 1, showRead = false } = {}) {
  const params = { page };
  if (showRead) params.showRead = 'true';
  const res = await api.get('/notification/get', { params });
  return res.data;
}

// ── PATCH /api/notification/read/:notificationId ─────────────
export async function markNotificationRead(notificationId) {
  const res = await api.patch(`/notification/read/${notificationId}`);
  return res.data;
}

// ── PATCH /api/notification/read-all ────────────────────────
export async function markAllNotificationsRead() {
  const res = await api.patch('/notification/read-all');
  return res.data;
}
