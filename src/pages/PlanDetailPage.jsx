import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { sendInvite } from '../api/invitesApi';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import PriorityBadge from '../components/ui/PriorityBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Loader';
import TaskTemplateModal from '../components/tasks/TaskTemplateModal';
import ScheduleModal from '../components/tasks/ScheduleModal';
import { formatDate } from '../utils/date';
import { getLevel, getLevelTitle, xpInCurrentLevel, xpLevelSpan } from '../utils/xp';
import '../styles/pages/plan-detail.css';

function PlanDetailPage() {
  const { planId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { currentPlan, fetchPlan, removePlan, kickMember, loading: planLoading } = usePlans();
  const { pendingTasks, taskTemplates, fetchPending, fetchTaskTemplates, markComplete, removeTaskSeries, loading: taskLoading } = useTasks();
  const { joinPlan, leavePlan, on } = useSocket();
  const { addToast } = useToast();

  const [inviteOpen,        setInviteOpen]        = useState(false);
  const [inviteUsername,    setInviteUsername]    = useState('');
  const [inviteLoading,     setInviteLoading]     = useState(false);
  const [inviteError,       setInviteError]       = useState('');
  const [deleteOpen,        setDeleteOpen]        = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [scheduleTarget,    setScheduleTarget]    = useState(null);
  const [activeTasksOpen,   setActiveTasksOpen]   = useState(false);

  useEffect(() => {
    fetchPlan(planId);
    fetchPending(1);
    fetchTaskTemplates(planId);
  }, [planId]);

  useEffect(() => {
    joinPlan(planId);
    return () => leavePlan(planId);
  }, [planId, joinPlan, leavePlan]);

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
      addToast('Member removed', 'info');
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
    if (!window.confirm('Delete this task and all future instances?')) return;
    try {
      await removeTaskSeries(instance.task?._id ?? instance.task ?? instance);
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
        <p style={{ color: 'var(--text-muted)' }}>Plan not found.</p>
        <Button variant="ghost" onClick={() => navigate('/plans')}>← Back to Plans</Button>
      </div>
    );
  }

  const planTasks  = pendingTasks.filter(t => t.plan?._id === planId || t.plan === planId);
  const planXp     = currentPlan.xp ?? 0;
  const planLvl    = getLevel(planXp);
  const planLvlTitle = getLevelTitle(planXp);
  const xpPct      = Math.min(100, Math.round((xpInCurrentLevel(planXp) / xpLevelSpan()) * 100));

  return (
    <div className="plan-detail page-container">

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <button className="plan-detail__back" onClick={() => navigate('/plans')} style={{ marginTop: '6px' }}>←</button>
          <div>
            <h1 className="plan-detail__title" style={{ marginBottom: '4px' }}>{currentPlan.title}</h1>
            {currentPlan.description && <p className="plan-detail__desc" style={{ marginBottom: '10px' }}>{currentPlan.description}</p>}
            {/* Plan XP bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    🏆 Plan Lv.{planLvl} <span style={{ color: 'var(--amber,#f59e0b)', fontWeight: 700 }}>{planLvlTitle}</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{planXp} XP</span>
                </div>
                <div style={{ height: '5px', borderRadius: '999px', background: 'var(--bg-tertiary)', overflow: 'hidden', width: '200px' }}>
                  <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,var(--amber,#f59e0b),var(--primary,#6366f1))', borderRadius: '999px', transition: 'width 0.4s' }} />
                </div>
              </div>
              {(currentPlan.streakCount ?? 0) > 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--amber,#f59e0b)', fontWeight: 600 }}>🔥 {currentPlan.streakCount}-day streak</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignSelf: 'flex-start', marginTop: '4px' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/plans/${planId}/log`)}>📊 View Logs</Button>
          {isOwner && (
            <>
              <Button id="invite-member-btn" variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>+ Invite</Button>
              <Button id="delete-plan-btn"   variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete Plan</Button>
            </>
          )}
        </div>
      </div>

      {/* ── MEMBERS BAR (horizontal scroll) ─────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '32px', scrollbarWidth: 'none' }}>
        {(currentPlan.members ?? []).map(member => {
          const m = member.user ?? member;
          const isM_Owner = (currentPlan.owner?._id ?? currentPlan.owner) === m._id;
          const mLvl = getLevel(m.xp ?? 0);
          return (
            <div key={m._id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
              borderRadius: '12px', flexShrink: 0, minWidth: '160px',
              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            }}>
              <Avatar username={m.username} size="sm" />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>{m.username}</p>
                  {isM_Owner && <span title="Owner" style={{ fontSize: '0.7rem' }}>👑</span>}
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>⚡ Lv.{mLvl} · {m.xp ?? 0} XP</span>
                  {(m.streakCount ?? 0) > 0 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🔥 {m.streakCount}d</span>}
                </div>
              </div>
              {isOwner && !isM_Owner && (
                <button onClick={() => handleKick(m._id)} title="Remove member"
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', opacity: 0.5, transition: 'all 0.15s', padding: '2px', flexShrink: 0 }}
                  onMouseOver={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseOut={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >✕</button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TASK TEMPLATES (card grid) ───────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Task Templates</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Blueprints · use ▶ Schedule to create instances from a template
            </p>
          </div>
          <Button id="new-template-btn" variant="primary" size="sm" onClick={() => setTemplateModalOpen(true)}>+ New Template</Button>
        </div>

        {taskLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '130px', borderRadius: '14px' }} />)}
          </div>
        ) : (!taskTemplates || taskTemplates.length === 0) ? (
          <div style={{ border: '2px dashed var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '14px', fontSize: '0.9rem' }}>
              No templates yet — create one to define recurring or one-time tasks for this plan.
            </p>
            <Button variant="primary" size="sm" onClick={() => setTemplateModalOpen(true)}>+ New Template</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {taskTemplates.map(template => {
              const isRecurring = template.recurrence?.isRecurring;
              const assignees   = template.assignedTo ?? [];
              const accentColor = template.priority === 'high' ? '#ef4444' : template.priority === 'medium' ? '#f59e0b' : '#22c55e';
              return (
                <div key={template._id} className="card" style={{
                  borderRadius: '14px', padding: '16px 16px 14px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
                }}>
                  {/* Priority accent bar top */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accentColor }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3 }}>{template.title}</p>
                    <PriorityBadge priority={template.priority ?? 'medium'} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {isRecurring ? `🔁 ${template.recurrence.type}` : '📌 one-time'}
                    </span>
                    {assignees.slice(0, 3).map(u => (
                      <span key={u._id ?? u} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        @{u.username ?? u}
                      </span>
                    ))}
                    {assignees.length > 3 && (
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>+{assignees.length - 3}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Button size="sm" variant="primary" style={{ flex: 1 }} onClick={() => setScheduleTarget(template)}>▶ Schedule</Button>
                    {isOwner && (
                      <button onClick={() => handleDeleteTaskSeries(template._id)} title="Delete template and all instances"
                        style={{ padding: '5px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px', transition: 'background 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ACTIVE TASKS (collapsible) ───────────────────────────── */}
      <div>
        <button
          id="active-tasks-toggle"
          onClick={() => setActiveTasksOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderRadius: activeTasksOpen ? '12px 12px 0 0' : '12px',
            cursor: 'pointer', userSelect: 'none',
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Active Tasks</span>
            {planTasks.length > 0 && (
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--primary)', color: '#fff', fontWeight: 600 }}>
                {planTasks.length}
              </span>
            )}
          </div>
          <span style={{ transition: 'transform 0.25s', transform: activeTasksOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }}>▼</span>
        </button>

        {activeTasksOpen && (
          taskLoading ? (
            <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '12px', borderRadius: '0 0 12px 12px' }}>
              {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: '52px', marginBottom: '8px', borderRadius: '10px' }} />)}
            </div>
          ) : planTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <p style={{ marginTop: '8px' }}>All caught up — no active tasks for this plan.</p>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              {planTasks.map((instance, idx) => (
                <div key={instance._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', gap: '12px',
                  borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                  background: 'var(--bg-primary)', transition: 'background 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <button className="plan-task-item__check" onClick={() => handleComplete(instance)} aria-label="Complete" style={{ margin: 0, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {instance.task?.title ?? 'Untitled'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {instance.date ? `📅 ${formatDate(instance.date)}` : 'No date'}
                        {instance.assignedTo?.username ? ` · @${instance.assignedTo.username}` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <PriorityBadge priority={instance.task?.priority ?? 'low'} />
                    {isOwner && (
                      <button onClick={() => handleDeleteTaskSeries(instance)} title="Delete series"
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '16px', opacity: 0.5, transition: 'opacity 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = 1}
                        onMouseOut={e => e.currentTarget.style.opacity = 0.5}
                      >🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── MODALS ───────────────────────────────────────────────── */}
      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); setInviteError(''); }} title="Invite Member" size="sm">
        <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inviteError && <div className="auth-form__error-banner">{inviteError}</div>}
          <Input id="plan-invite-input" label="Username" placeholder="@username" value={inviteUsername}
            onChange={e => { setInviteUsername(e.target.value); setInviteError(''); }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={inviteLoading}>Send Invite</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this plan?" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          All tasks and member history in this plan will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeletePlan}>Delete Plan</Button>
        </div>
      </Modal>

      <TaskTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        planId={planId}
        planMembers={currentPlan?.members ?? []}
        onSaved={() => fetchTaskTemplates(planId)}
      />

      <ScheduleModal
        isOpen={!!scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        template={scheduleTarget}
        planMembers={currentPlan?.members ?? []}
        onScheduled={() => fetchPending(1)}
      />
    </div>
  );
}

export default PlanDetailPage;
