import api from '../config/api';

// ── TEMPLATE routes ───────────────────────────────────────────

// POST /api/task/template/create/:planId  — create a new task template
export async function createTask(planId, data) {
  const res = await api.post(`/task/template/create/${planId}`, data);
  return res.data;
}

// GET /api/task/template/get/:planId — fetch all templates for a plan
export async function getTaskTemplatesApi(planId) {
  const res = await api.get(`/task/template/get/${planId}`);
  return res.data;
}

// PUT /api/task/template/update/:taskId — edit a template
export async function updateTask(taskId, data) {
  const res = await api.put(`/task/template/update/${taskId}`, data);
  return res.data;
}

// DELETE /api/task/template/delete/:taskId — delete template + all instances
export async function deleteTask(taskId) {
  const res = await api.delete(`/task/template/delete/${taskId}`);
  return res.data;
}

// ── INSTANCE routes ───────────────────────────────────────────

// POST /api/task/instance/schedule/:taskId — schedule instances from a template
export async function scheduleTaskInstancesApi(taskId, data) {
  const res = await api.post(`/task/instance/schedule/${taskId}`, data);
  return res.data;
}

// POST /api/task/instance/complete/:taskId — mark an instance as complete
export async function completeTask(taskId) {
  const res = await api.post(`/task/instance/complete/${taskId}`);
  return res.data;
}

// PUT /api/task/instance/edit/:instanceId — edit a specific instance
export async function editTaskInstanceApi(instanceId, body) {
  const res = await api.put(`/task/instance/edit/${instanceId}`, body);
  return res.data;
}

// PATCH /api/task/instance/reschedule/:instanceId — move to new date
export async function rescheduleTask(instanceId, newDate) {
  const res = await api.patch(`/task/instance/reschedule/${instanceId}`, { newDate });
  return res.data;
}

// DELETE /api/task/instance/delete/:instanceId — delete a single instance
export async function deleteTaskInstance(instanceId) {
  const res = await api.delete(`/task/instance/delete/${instanceId}`);
  return res.data;
}

// ── FETCH / QUERY instances ───────────────────────────────────

// GET /api/task/get/pendingTasks?page=N
export async function getPendingTasks(page = 1) {
  const res = await api.get('/task/get/pendingTasks', { params: { page } });
  return res.data;
}

// GET /api/task/get/completedTasks?page=N
export async function getCompletedTasks(page = 1) {
  const res = await api.get('/task/get/completedTasks', { params: { page } });
  return res.data;
}

// GET /api/task/get/all-tasks?page=N
export async function getAllTasksApi(page = 1) {
  const res = await api.get('/task/get/all-tasks', { params: { page } });
  return res.data;
}

// GET /api/task/get/calendar?startDate=X&endDate=Y
export async function getCalendarTasks(startDate, endDate) {
  const res = await api.get('/task/get/calendar', { params: { startDate, endDate } });
  return res.data;
}

// GET /api/task/search
export async function searchTasks({ q, priority, completed, plan, page = 1 } = {}) {
  const params = { page };
  if (q)          params.q = q;
  if (priority)   params.priority = priority;
  if (completed !== undefined) params.completed = String(completed);
  if (plan)       params.plan = plan;
  const res = await api.get('/task/search', { params });
  return res.data;
}

export async function getPlanLogApi(planId) {
  const res = await api.get(`/task/instance/log/${planId}`);
  return res.data;
}

// ── ATTACHMENTS ───────────────────────────────────────────────

// POST /api/task/upload/image (multipart)
export async function uploadTaskImages(formData) {
  const res = await api.post('/task/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
