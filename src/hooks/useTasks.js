import { useState, useCallback, useRef } from 'react';
import {
  getPendingTasks,
  getCompletedTasks,
  createTask,
  completeTask,
  updateTask,
  deleteTask,
  rescheduleTask,
  searchTasks,
  getCalendarTasks,
  uploadTaskImages,
} from '../api/tasksApi';

/**
 * Central hook for task-related API calls with loading/error state.
 */
export function useTasks() {
  const [pendingTasks, setPendingTasks]     = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  // Pagination
  const [pendingPage, setPendingPage]     = useState(1);
  const [pendingTotal, setPendingTotal]   = useState(0);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedTotal, setCompletedTotal] = useState(0);

  const setErr = (e) =>
    setError(e?.response?.data?.message ?? e?.message ?? 'Something went wrong');

  const fetchPending = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingTasks(page);
      setPendingTasks(data.tasks ?? []);
      setPendingPage(data.page ?? 1);
      setPendingTotal(data.totalCount ?? 0);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }, []);

  const fetchCompleted = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompletedTasks(page);
      setCompletedTasks(data.tasks ?? []);
      setCompletedPage(data.page ?? 1);
      setCompletedTotal(data.totalCount ?? 0);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }, []);

  const addTask = useCallback(async (planId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTask(planId, taskData);
      return data.task;
    } catch (e) { setErr(e); throw e; }
    finally { setLoading(false); }
  }, []);

  const markComplete = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await completeTask(taskId);
      // Optimistically remove from pending
      setPendingTasks(prev => prev.filter(t => t.task?._id !== taskId && t._id !== taskId));
      return data;
    } catch (e) { setErr(e); throw e; }
    finally { setLoading(false); }
  }, []);

  const editTask = useCallback(async (taskId, updates) => {
    setError(null);
    try {
      const data = await updateTask(taskId, updates);
      return data.task;
    } catch (e) { setErr(e); throw e; }
  }, []);

  const removeTask = useCallback(async (taskId) => {
    setError(null);
    try {
      await deleteTask(taskId);
      setPendingTasks(prev => prev.filter(t => t.task?._id !== taskId));
    } catch (e) { setErr(e); throw e; }
  }, []);

  const reschedule = useCallback(async (instanceId, newDate) => {
    setError(null);
    try {
      const data = await rescheduleTask(instanceId, newDate);
      return data.instance;
    } catch (e) { setErr(e); throw e; }
  }, []);

  const search = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchTasks(params);
      return data;
    } catch (e) { setErr(e); return null; }
    finally { setLoading(false); }
  }, []);

  const fetchCalendar = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarTasks(startDate, endDate);
      return data.tasks ?? [];
    } catch (e) { setErr(e); return []; }
    finally { setLoading(false); }
  }, []);

  const uploadImages = useCallback(async (formData) => {
    setError(null);
    try {
      const data = await uploadTaskImages(formData);
      return data.files ?? [];
    } catch (e) { setErr(e); throw e; }
  }, []);

  return {
    pendingTasks, completedTasks,
    pendingPage, pendingTotal,
    completedPage, completedTotal,
    loading, error,
    fetchPending, fetchCompleted,
    addTask, markComplete, editTask, removeTask,
    reschedule, search, fetchCalendar, uploadImages,
    setPendingTasks, setCompletedTasks,
  };
}
