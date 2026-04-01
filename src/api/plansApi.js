import api from '../config/api';

// ── POST /api/plan/post ──────────────────────────────────────
export async function createPlan({ title, description }) {
  const res = await api.post('/plan/post', { title, description });
  return res.data;
}

// ── GET /api/plan/get ─────────────────────────────────────────
export async function getPlans() {
  const res = await api.get('/plan/get');
  return res.data;
}

// ── GET /api/plan/:planId ─────────────────────────────────────
export async function getPlanById(planId) {
  const res = await api.get(`/plan/${planId}`);
  return res.data;
}

// ── DELETE /api/plan/delete/:slug ────────────────────────────
export async function deletePlan(slug) {
  const res = await api.delete(`/plan/delete/${slug}`);
  return res.data;
}

// ── DELETE /api/plan/:planId/member/:memberId ─────────────────
export async function removePlanMember(planId, memberId) {
  const res = await api.delete(`/plan/${planId}/member/${memberId}`);
  return res.data;
}
