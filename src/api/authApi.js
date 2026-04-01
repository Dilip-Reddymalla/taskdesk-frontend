import api from '../config/api';

// ── POST /api/auth/register ──────────────────────────────────
export async function registerUser({ username, email, password }) {
  const res = await api.post('/auth/register', { username, email, password });
  return res.data;
}

// ── POST /api/auth/login ─────────────────────────────────────
export async function loginUser({ email, username, password }) {
  const body = { password };
  if (email) body.email = email;
  if (username) body.username = username;
  const res = await api.post('/auth/login', body);
  return res.data;
}

// ── GET /api/auth/me ─────────────────────────────────────────
export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// ── DELETE /api/auth/deleteUser ──────────────────────────────
export async function deleteAccount(password) {
  const res = await api.delete('/auth/deleteUser', { data: { password } });
  return res.data;
}

// ── POST /api/auth/google?code=<code> ────────────────────────
export async function googleLogin(code) {
  const res = await api.post(`/auth/google?code=${code}`);
  return res.data;
}

// ── POST /api/auth/verify-email ──────────────────────────────
export async function verifyEmail({ userId, code }) {
  const res = await api.post('/auth/verify-email', { userId, code });
  return res.data;
}

// ── POST /api/auth/resend-verification ───────────────────────
export async function resendVerification(userId) {
  const res = await api.post('/auth/resend-verification', { userId });
  return res.data;
}
