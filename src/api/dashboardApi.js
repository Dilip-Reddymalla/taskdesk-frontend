import api from '../config/api';

// ── GET /api/dashboard/stats ─────────────────────────────────
export async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}
