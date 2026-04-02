import React, { useEffect, useState, useCallback } from 'react';
import { usePlans } from '../hooks/usePlans';
import { useToast } from '../hooks/useToast';
import { sendInvite } from '../api/invitesApi';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar, { AvatarStack } from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/plans.css';

function CreatePlanModal({ isOpen, onClose, onCreated }) {
  const { addPlan } = usePlans();
  const { addToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      const plan = await addPlan(form);
      addToast(`Plan "${plan.title}" created!`, 'success');
      onCreated?.(plan);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to create plan');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Plan" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="auth-form__error-banner">{error}</div>}
        <Input id="plan-title" label="Plan name" placeholder="e.g. Sprint 1, Q2 Goals" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        <div className="input-wrapper">
          <label className="input-label">Description (optional)</label>
          <textarea
            className="input-field"
            placeholder="What is this plan about?"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Create Plan</Button>
        </div>
      </form>
    </Modal>
  );
}

function InviteModal({ isOpen, onClose, planId }) {
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Username is required'); return; }
    setLoading(true);
    try {
      await sendInvite({ reciverUserName: username.trim(), planID: planId });
      addToast(`Invite sent to @${username}!`, 'success');
      setUsername('');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to send invite');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member" size="sm">
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div className="auth-form__error-banner">{error}</div>}
        <Input
          id="invite-username"
          label="Username"
          placeholder="Enter their username"
          value={username}
          onChange={e => { setUsername(e.target.value); setError(''); }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Send Invite</Button>
        </div>
      </form>
    </Modal>
  );
}

function PlanCard({ plan, onDelete }) {
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="plan-card card" onClick={() => navigate(`/plans/${plan._id}`)}>
      <div className="plan-card__header">
        <div className="plan-card__avatar-wrap">
          <div className="plan-card__icon">📋</div>
        </div>
        <div className="plan-card__info">
          <p className="plan-card__title">{plan.title}</p>
          {plan.description && <p className="plan-card__desc">{plan.description}</p>}
        </div>
      </div>

      <div className="plan-card__meta">
        <AvatarStack users={plan.members ?? []} max={4} size="xs" />
        <span className="plan-card__member-count">{plan.members?.length ?? 0} members</span>
        {plan.taskCount > 0 && <Badge color="ghost">{plan.taskCount} tasks</Badge>}
      </div>

      <div className="plan-card__actions" onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setInviteOpen(true); }}
          id={`invite-btn-${plan._id}`}
        >
          + Invite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); navigate(`/plans/${plan._id}`); }}
          id={`view-plan-${plan._id}`}
        >
          View →
        </Button>
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} planId={plan._id} />
    </div>
  );
}

function PlansPage() {
  const { plans, loading, fetchPlans, removePlan } = usePlans();
  const { addToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removePlan(deleteTarget.slug);
      addToast('Plan deleted', 'info');
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to delete', 'error');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="plans-page page-container">
      <div className="plans-page__header">
        <div>
          <h1 className="plans-page__title">Plans</h1>
          <p className="plans-page__sub">Collaborative workspaces for your teams</p>
        </div>
        <Button id="create-plan-btn" variant="primary" onClick={() => setCreateOpen(true)}>
          + New Plan
        </Button>
      </div>

      {loading ? (
        <div className="plans-page__grid">
          {[0,1,2].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="plans-page__empty">
          <span>📋</span>
          <h3>No plans yet</h3>
          <p>Create your first plan and invite your team to get started.</p>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>Create a plan</Button>
        </div>
      ) : (
        <div className="plans-page__grid">
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} onDelete={() => setDeleteTarget(plan)} />
          ))}
        </div>
      )}

      <CreatePlanModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => fetchPlans()} />

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete plan?" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Deleting "<strong>{deleteTarget?.title}</strong>" will remove all tasks in it for all members.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete plan</Button>
        </div>
      </Modal>
    </div>
  );
}

export default PlansPage;

