import api from '../config/api';

// ── POST /api/invite/send ────────────────────────────────────
export async function sendInvite({ reciverUserName, planID }) {
  const res = await api.post('/invite/send', { reciverUserName, planID });
  return res.data;
}

// ── GET /api/invite/pending ──────────────────────────────────
export async function getPendingInvites() {
  const res = await api.get('/invite/pending');
  return res.data;
}

// ── POST /api/invite/accept/:inviteId ────────────────────────
export async function acceptInvite(inviteId, planId) {
  const res = await api.post(`/invite/accept/${inviteId}`, { planId });
  return res.data;
}

// ── POST /api/invite/reject/:inviteId ────────────────────────
export async function rejectInvite(inviteId) {
  const res = await api.post(`/invite/reject/${inviteId}`);
  return res.data;
}
