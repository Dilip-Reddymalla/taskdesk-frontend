import React, { useEffect, useState } from 'react';
import { useInvites } from '../hooks/useInvites';
import { useToast } from '../hooks/useToast';
import { useSocket } from '../hooks/useSocket';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { CardSkeleton } from '../components/ui/Loader';
import { formatDate } from '../utils/date';
import '../styles/pages/plans.css'; // Reuse some standard page styles or just inline needed styles

export default function InvitesPage() {
  const { invites, loading, error, fetchInvites, handleAccept, handleReject } = useInvites();
  const { addToast } = useToast();
  const { on } = useSocket();
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  // Real-time updates for invites
  useEffect(() => {
    const cleanup = on('invite_received', () => {
      fetchInvites();
    });
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [on, fetchInvites]);

  const onAccept = async (inviteId, planId) => {
    try {
      await handleAccept(inviteId, planId);
      addToast('Invite accepted! You have joined the plan.', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to accept invite', 'error');
    }
  };

  const onReject = async (inviteId) => {
    try {
      await handleReject(inviteId);
      addToast('Invite rejected.', 'info');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to reject invite', 'error');
    }
  };

  // Split invites
  const pendingInvites = invites.filter(i => i.status === 'pending');
  // History includes accepted and rejected, or just rejected depending on what we want to show
  const historyInvites = invites.filter(i => i.status !== 'pending'); 

  const displayedInvites = tab === 'pending' ? pendingInvites : historyInvites;

  return (
    <div className="page-container page-container--center" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ padding: '32px 0 24px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Invites</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Manage your plan invitations here.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginTop: '24px', paddingBottom: '12px' }}>
          <button 
            onClick={() => setTab('pending')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1rem', fontWeight: tab === 'pending' ? 'bold' : 'normal',
              color: tab === 'pending' ? 'var(--text)' : 'var(--text-secondary)', cursor: 'pointer',
              borderBottom: tab === 'pending' ? '2px solid var(--text)' : 'none', paddingBottom: '4px'
            }}
          >
            Pending ({pendingInvites.length})
          </button>
          <button 
            onClick={() => setTab('history')}
            style={{ 
              background: 'none', border: 'none', fontSize: '1rem', fontWeight: tab === 'history' ? 'bold' : 'normal',
              color: tab === 'history' ? 'var(--text)' : 'var(--text-secondary)', cursor: 'pointer',
              borderBottom: tab === 'history' ? '2px solid var(--text)' : 'none', paddingBottom: '4px'
            }}
          >
            History ({historyInvites.length})
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginTop: '16px' }}>{error}</div>}

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <>{[1, 2].map(i => <CardSkeleton key={i} />)}</>
          ) : displayedInvites.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
              <p>No {tab} invites found.</p>
            </div>
          ) : (
            displayedInvites.map(invite => (
              <div key={invite._id} className="card" style={{ display: 'flex', padding: '20px', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Avatar username={invite.sender?.username} size="md" />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px', fontWeight: 'bold' }}>
                      {invite.plan?.title || 'Unknown Plan'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Invited by <strong>@{invite.sender?.username}</strong> on {formatDate(invite.createdAt)}
                    </p>
                    {tab === 'history' && (
                      <span style={{ 
                        display: 'inline-block', marginTop: '8px', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px',
                        background: invite.status === 'accepted' ? 'var(--green)' : 'var(--danger)',
                        color: invite.status === 'accepted' ? '#fff' : '#fff'
                      }}>
                        {invite.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" onClick={() => onReject(invite._id)}>Reject</Button>
                    <Button variant="primary" onClick={() => onAccept(invite._id, invite.plan?._id)}>Accept</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
