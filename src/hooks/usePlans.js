import { useState, useCallback } from 'react';
import {
  getPlans,
  getPlanById,
  createPlan,
  deletePlan,
  removePlanMember,
} from '../api/plansApi';

/**
 * Central hook for plan-related API calls with loading/error state.
 */
export function usePlans() {
  const [plans, setPlans]       = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const setErr = (e) =>
    setError(e?.response?.data?.message ?? e?.message ?? 'Something went wrong');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlans();
      setPlans(data.plans ?? []);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }, []);

  const fetchPlan = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanById(planId);
      setCurrentPlan(data.plan ?? null);
      return data.plan;
    } catch (e) { setErr(e); return null; }
    finally { setLoading(false); }
  }, []);

  const addPlan = useCallback(async (planData) => {
    setError(null);
    try {
      const data = await createPlan(planData);
      setPlans(prev => [data.plan, ...prev]);
      return data.plan;
    } catch (e) { setErr(e); throw e; }
  }, []);

  const removePlan = useCallback(async (slug) => {
    setError(null);
    try {
      await deletePlan(slug);
      setPlans(prev => prev.filter(p => p.slug !== slug));
    } catch (e) { setErr(e); throw e; }
  }, []);

  const kickMember = useCallback(async (planId, memberId) => {
    setError(null);
    try {
      const data = await removePlanMember(planId, memberId);
      setCurrentPlan(data.plan ?? null);
      return data.plan;
    } catch (e) { setErr(e); throw e; }
  }, []);

  return {
    plans, currentPlan,
    loading, error,
    fetchPlans, fetchPlan,
    addPlan, removePlan, kickMember,
    setCurrentPlan,
  };
}
