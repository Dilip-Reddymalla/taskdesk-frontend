import React, { useEffect, useState } from 'react';
import { scheduleTaskInstancesApi } from '../../api/tasksApi';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import PriorityBadge from '../ui/PriorityBadge';

/**
 * Modal for scheduling task instances from an existing task template.
 * Lets you pick a date range and which plan members to generate instances for.
 */
export default function ScheduleModal({ isOpen, onClose, template, planMembers = [], onScheduled }) {
  const { addToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-select members from the template's assignedTo
  useEffect(() => {
    if (isOpen && template) {
      const preSelected = (template.assignedTo || []).map(u => typeof u === 'object' ? u._id : u);
      setSelectedMembers(preSelected);
      setStartDate('');
      setEndDate('');
      setError('');
    }
  }, [isOpen, template]);

  const toggle = (memberId) =>
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) { setError('Start date is required'); return; }
    if (!endDate) { setError('End date is required'); return; }
    if (new Date(startDate) > new Date(endDate)) { setError('Start date must be before end date'); return; }
    if (selectedMembers.length === 0) { setError('Select at least one member'); return; }

    setSubmitting(true);
    try {
      const res = await scheduleTaskInstancesApi(template._id, {
        startDate,
        endDate,
        assignedTo: selectedMembers,
      });
      addToast(`✅ ${res.count} task instance(s) scheduled!`, 'success');
      onScheduled?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to schedule instances');
    } finally {
      setSubmitting(false);
    }
  };

  if (!template) return null;

  const recLabel = template.recurrence?.isRecurring
    ? `Recurring · ${template.recurrence.type}`
    : 'One-time';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Task Instances" size="md">
      {/* Template summary card */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>{template.title}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{recLabel}</p>
        </div>
        <PriorityBadge priority={template.priority ?? 'medium'} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <div className="task-modal__error">{error}</div>}

        <div className="task-modal__row">
          <Input
            id="sched-start"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <Input
            id="sched-end"
            label="End Date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {/* Member selector */}
        <div className="input-wrapper">
          <label className="input-label">Schedule For</label>
          <div
            className="input-field"
            style={{ maxHeight: '130px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {planMembers.map(m => (
              <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(m._id)}
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

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          📅 One task instance will be created per selected member per {template.recurrence?.isRecurring ? template.recurrence.type + ' interval' : 'day'} in the date range.
          Duplicate dates for the same member are automatically skipped.
        </p>

        <div className="task-modal__footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting}>Schedule Instances</Button>
        </div>
      </form>
    </Modal>
  );
}
