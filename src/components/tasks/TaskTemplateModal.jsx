import React, { useEffect, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * Modal for creating / editing a Task Template (Task document / blueprint).
 * Does NOT deal with instance scheduling — that's ScheduleModal's job.
 */
export default function TaskTemplateModal({ isOpen, onClose, planId, planMembers = [], onSaved }) {
  const { addTask } = useTasks();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    isRecurring: false,
    recurrenceType: 'daily',
    assignedTo: [],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ title: '', description: '', priority: 'medium', isRecurring: false, recurrenceType: 'daily', assignedTo: [] });
      setError('');
    }
  }, [isOpen]);

  const toggle = (memberId) =>
    setForm(p => ({
      ...p,
      assignedTo: p.assignedTo.includes(memberId)
        ? p.assignedTo.filter(id => id !== memberId)
        : [...p.assignedTo, memberId],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.assignedTo.length === 0) { setError('Assign to at least one member'); return; }

    setSubmitting(true);
    const body = {
      title: form.title.trim(),
      description: form.description,
      priority: form.priority,
      assignedTo: form.assignedTo,
    };
    if (form.isRecurring) {
      body.recurrence = { isRecurring: true, type: form.recurrenceType, interval: 1 };
    }

    try {
      await addTask(planId, body);
      addToast('Task template created! Use ▶ Schedule to assign dates.', 'success');
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task Template" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <div className="task-modal__error">{error}</div>}

        <Input
          id="tmpl-title"
          label="Title"
          placeholder="e.g. Daily Standup"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        />

        <div className="input-wrapper">
          <label className="input-label">Description</label>
          <textarea
            className="input-field task-modal__textarea"
            placeholder="Optional details..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="task-modal__row">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">Priority</label>
            <select
              className="task-modal__select input-field"
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="task-modal__recurring">
          <label className="task-modal__toggle">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))}
            />
            <span>Recurring task</span>
          </label>
          {form.isRecurring && (
            <select
              className="task-modal__select input-field"
              value={form.recurrenceType}
              onChange={e => setForm(p => ({ ...p, recurrenceType: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        {/* Member assignment */}
        {planMembers.length > 0 && (
          <div className="input-wrapper">
            <label className="input-label">Assign To</label>
            <div
              className="input-field"
              style={{ maxHeight: '120px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              {planMembers.map(m => (
                <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.assignedTo.includes(m._id)}
                    onChange={() => toggle(m._id)}
                  />
                  <img
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}&background=random`}
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: '50%' }}
                  />
                  <span>@{m.username}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          💡 After creating a template, use <strong>▶ Schedule</strong> on it to generate task instances with specific dates.
        </p>

        <div className="task-modal__footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>Create Template</Button>
        </div>
      </form>
    </Modal>
  );
}
