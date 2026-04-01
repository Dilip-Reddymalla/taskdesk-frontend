import api from '../config/api';

// ── POST /api/task/postTask/:planId ──────────────────────────
export async function createTask(planId, data) {
  const res = await api.post(`/task/postTask/${planId}`, data);
  return res.data;
}

// ── POST /api/task/taskComplete/:taskId ──────────────────────
export async function completeTask(taskId) {
  const res = await api.post(`/task/taskComplete/${taskId}`);
  return res.data;
}

// ── GET /api/task/get/pendingTasks?page=N ────────────────────
export async function getPendingTasks(page = 1) {
  const res = await api.get('/task/get/pendingTasks', { params: { page } });
  return res.data;
}

// ── GET /api/task/get/completedTasks?page=N ──────────────────
export async function getCompletedTasks(page = 1) {
  const res = await api.get('/task/get/completedTasks', { params: { page } });
  return res.data;
}

// ── PUT /api/task/update/:taskId ─────────────────────────────
export async function updateTask(taskId, data) {
  const res = await api.put(`/task/update/${taskId}`, data);
  return res.data;
}

// ── PATCH /api/task/reschedule/:instanceId ───────────────────
export async function rescheduleTask(instanceId, newDate) {
  const res = await api.patch(`/task/reschedule/${instanceId}`, { newDate });
  return res.data;
}

// ── DELETE /api/task/delete/:taskId ──────────────────────────
export async function deleteTask(taskId) {
  const res = await api.delete(`/task/delete/${taskId}`);
  return res.data;
}

// ── POST /api/task/upload/image (multipart) ───────────────────
export async function uploadTaskImages(formData) {
  const res = await api.post('/task/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ── GET /api/task/get/calendar?startDate=X&endDate=Y ─────────
export async function getCalendarTasks(startDate, endDate) {
  const res = await api.get('/task/get/calendar', { params: { startDate, endDate } });
  return res.data;
}

// ── GET /api/task/search ─────────────────────────────────────
export async function searchTasks({ q, priority, completed, plan, page = 1 } = {}) {
  const params = { page };
  if (q)          params.q = q;
  if (priority)   params.priority = priority;
  if (completed !== undefined) params.completed = String(completed);
  if (plan)       params.plan = plan;
  const res = await api.get('/task/search', { params });
  return res.data;
}
