import api from '../config/api';

// ── GET /api/user/profile ────────────────────────────────────
export async function getUserProfile() {
  const res = await api.get('/user/profile');
  return res.data;
}
