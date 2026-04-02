import { useState, useCallback } from 'react';
import { getAllInvitesApi, acceptInvite, rejectInvite } from '../api/invitesApi';

export function useInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllInvitesApi();
      setInvites(data.invites ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to fetch invites');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAccept = useCallback(async (inviteId, planId) => {
    try {
      await acceptInvite(inviteId, planId);
      await fetchInvites();
    } catch (err) {
      throw err;
    }
  }, [fetchInvites]);

  const handleReject = useCallback(async (inviteId) => {
    try {
      await rejectInvite(inviteId);
      await fetchInvites();
    } catch (err) {
      throw err;
    }
  }, [fetchInvites]);

  return {
    invites,
    loading,
    error,
    fetchInvites,
    handleAccept,
    handleReject,
  };
}
