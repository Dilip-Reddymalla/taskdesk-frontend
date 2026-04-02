import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { sendInvite } from '../api/invitesApi';
import Button from '../components/ui/Button';
import Avatar, { AvatarStack } from '../components/ui/Avatar';
import PriorityBadge from '../components/ui/PriorityBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Loader';
import { formatDate } from '../utils/date';
import '../styles/pages/plan-detail.css';

function PlanDetailPage() {
  const { planId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { currentPlan, fetchPlan, removePlan, kickMember, loading: planLoading } = usePlans();
  const { pendingTasks, fetchPending, markComplete, removeTaskSeries, loading: taskLoading } = useTasks();
  const { joinPlan, leavePlan, on } = useSocket();
  const { addToast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPlan(planId);
    fetchPending(1); // Filtered server-side by membership
  }, [planId]);

  useEffect(() => {
    joinPlan(planId);
    return () => leavePlan(planId);
  }, [planId, joinPlan, leavePlan]);

  // Real-time refresh
  useEffect(() => {
    const c1 = on('task_created',   () => fetchPending(1));
    const c2 = on('task_completed', () => fetchPending(1));
    const c3 = on('member_joined',  () => fetchPlan(planId));
    return () => [c1, c2, c3].forEach(fn => typeof fn === 'function' && fn());
  }, [on, planId]);

  const isOwner = currentPlan?.owner?._id === user?._id || currentPlan?.owner === user?._id;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) { setInviteError('Username required'); return; }
    setInviteLoading(true);
    try {
      await sendInvite({ reciverUserName: inviteUsername.trim(), planID: planId });
      addToast(`Invite sent to @${inviteUsername}!`, 'success');
      setInviteUsername('');
      setInviteOpen(false);
    } catch (err) {
      setInviteError(err?.response?.data?.message ?? 'Failed to send invite');
    } finally { setInviteLoading(false); }
  };

  const handleKick = async (memberId) => {
    try {
      await kickMember(planId, memberId);
      addToast('Member removed from plan', 'info');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to remove member', 'error');
    }
  };

  const handleDeletePlan = async () => {
    try {
      await removePlan(currentPlan.slug ?? planId);
      addToast('Plan deleted', 'info');
      navigate('/plans');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to delete plan', 'error');
    }
  };

  const handleComplete = async (task) => {
    try {
      await markComplete(task.task?._id ?? task._id);
      addToast('✅ Task completed! +10 XP', 'success');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed', 'error');
    }
  };

  const handleDeleteTaskSeries = async (instance) => {
    if (!window.confirm("Are you sure you want to permanently delete this task and all future instances?")) return;
    try {
      await removeTaskSeries(instance.task?._id ?? instance.task);
      addToast('Task series deleted', 'info');
    } catch (e) {
      addToast('Failed to delete series', 'error');
    }
  };

  if (planLoading && !currentPlan) {
    return <div className="plan-detail page-container"><CardSkeleton /></div>;
  }

  if (!currentPlan) {
    return (
      <div className="plan-detail page-container page-container--center">
        <p style={{color:'var(--text-muted)'}}>Plan not found.</p>
        <Button variant="ghost" onClick={() => navigate('/plans')}>← Back to Plans</Button>
      </div>
    );
  }

  const planTasks = pendingTasks.filter(t => t.plan?._id === planId || t.plan === planId);

  return (
    <div className="plan-detail page-container">
      {/* Header */}
      <div className="plan-detail__header">
        <div className="plan-detail__header-left">
          <button className="plan-detail__back" onClick={() => navigate('/plans')}>←</button>
          <div>
            <h1 className="plan-detail__title">{currentPlan.title}</h1>
            {currentPlan.description && <p className="plan-detail__desc">{currentPlan.description}</p>}
          </div>
        </div>
        <div className="plan-detail__header-right">
          <AvatarStack users={currentPlan.members ?? []} max={5} />
          {isOwner && (
            <>
              <Button id="invite-member-btn" variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>
                + Invite
              </Button>
              <Button id="delete-plan-btn" variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                Delete Plan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="plan-detail__body">
        {/* Members sidebar */}
        <div className="plan-detail__members">
          <h3 className="plan-detail__section-title">Members</h3>
          <div className="plan-detail__member-list">
            {(currentPlan.members ?? []).map(member => {
              const m = member.user ?? member;
              const isM_Owner = (currentPlan.owner?._id ?? currentPlan.owner) === m._id;
              return (
                <div className="plan-member" key={m._id}>
                  <Avatar username={m.username} size="sm" />
                  <div className="plan-member__info">
                    <p className="plan-member__name">{m.username}</p>
                    <p className="plan-member__role">{isM_Owner ? '👑 Owner' : 'Member'}</p>
                  </div>
                  {isOwner && !isM_Owner && (
                    <button
                      className="plan-member__kick"
                      onClick={() => handleKick(m._id)}
                      title="Remove member"
                    >✕</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="plan-detail__tasks">
          <h3 className="plan-detail__section-title">Active Tasks</h3>
          {taskLoading ? (
            <>{[0,1,2].map(i => <div key={i} className="skeleton" style={{height:'56px',marginBottom:'8px',borderRadius:'var(--radius-md)'}} />)}</>
          ) : planTasks.length === 0 ? (
            <div className="plan-detail__empty">
              <span>✅</span>
              <p>No active tasks in this plan.</p>
            </div>
          ) : (
            <div className="plan-detail__task-list">
              {planTasks.map(instance => (
                <div className="plan-task-item card" key={instance._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className="plan-task-item__check"
                      onClick={() => handleComplete(instance)}
                      aria-label="Complete"
                      style={{ margin: 0 }}
                    />
                    <div className="plan-task-item__info">
                      <p className="plan-task-item__title" style={{ margin: '0 0 4px', fontSize: '15px' }}>
                        {instance.task?.title ?? 'Untitled'}
                      </p>
                      <p className="plan-task-item__meta" style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                        {instance.date ? `Scheduled ${formatDate(instance.date)}` : 'No date'}
                        {instance.assignedTo?.username ? ` · @${instance.assignedTo.username}` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <PriorityBadge priority={instance.task?.priority ?? 'low'} />
                    {isOwner && (
                      <button 
                        onClick={() => handleDeleteTaskSeries(instance)}
                        title="Delete entire task series"
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '18px', padding: '4px', opacity: 0.7, transition: 'opacity 0.2s' }}
                        onMouseOver={(e) => e.target.style.opacity = 1}
                        onMouseOut={(e) => e.target.style.opacity = 0.7}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); setInviteError(''); }} title="Invite Member" size="sm">
        <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inviteError && <div className="auth-form__error-banner">{inviteError}</div>}
          <Input id="plan-invite-input" label="Username" placeholder="@username" value={inviteUsername} onChange={e => { setInviteUsername(e.target.value); setInviteError(''); }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={inviteLoading}>Send Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Confirm */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this plan?" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          All tasks and member history in this plan will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeletePlan}>Delete Plan</Button>
        </div>
      </Modal>
    </div>
  );
}

export default PlanDetailPage;

