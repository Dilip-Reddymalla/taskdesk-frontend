import React, { useEffect, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function TaskModal({ isOpen, onClose, planId, plans, task, onSaved }) {
  const { addTask, editTask, loading, editInstance } = useTasks();
  const { addToast } = useToast();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    assignedTo: [],
    planId: planId ?? '',
    isRecurring: false,
    recurrenceType: 'daily',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateType, setUpdateType] = useState('single');

  const isInstance = !!task?.task;

  useEffect(() => {
    if (task) {
      const rawAssignedTo = task?.task?.assignedTo || task?.assignedTo || [];
      const assignedToArray = Array.isArray(rawAssignedTo) ? rawAssignedTo : [rawAssignedTo];
      
      setForm({
        title: task?.title ?? task?.task?.title ?? '',
        description: task?.description ?? task?.task?.description ?? '',
        priority: task?.priority ?? task?.task?.priority ?? 'medium',
        startDate: '', endDate: '',
        assignedTo: assignedToArray.filter(a => a).map(a => typeof a === 'object' ? (a._id || a) : a),
        planId: task?.plan?._id ?? (typeof task?.plan === 'string' ? task.plan : null) ?? planId ?? '',
        isRecurring: false,
        recurrenceType: 'daily',
      });
      setUpdateType('single');
    } else {
      setForm(prev => ({ ...prev, title: '', description: '', priority: 'medium', planId: planId ?? '', assignedTo: [] }));
    }
    setError('');
  }, [task, planId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.planId) { setError('Please select a plan'); return; }

    setIsSubmitting(true);
    const body = {
      title: form.title.trim(),
      description: form.description,
      priority: form.priority,
    };
    if (form.startDate) body.startDate = form.startDate;
    if (form.endDate) body.endDate = form.endDate;
    if (form.isRecurring) {
      body.recurrence = { isRecurring: true, type: form.recurrenceType, interval: 1 };
    }
    if (form.assignedTo && form.assignedTo.length > 0) {
      body.assignedTo = form.assignedTo;
    }

    try {
      if (isEdit) {
        if (isInstance) {
          await editInstance(task._id, { ...body, updateType });
        } else {
          await editTask(task._id, body);
        }
        addToast('Task updated', 'success');
      } else {
        await addTask(form.planId, body);
        addToast('Task created! ✅', 'success');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="md">
      <form onSubmit={handleSubmit} className="task-modal__form">
        {error && <div className="task-modal__error">{error}</div>}

        <Input
          id="task-title"
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        />

        <div className="input-wrapper">
          <label className="input-label">Description</label>
          <textarea
            className="task-modal__textarea input-field"
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

          {!isEdit && (
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">Plan</label>
              <select
                className="task-modal__select input-field"
                value={form.planId}
                onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
                disabled={!!planId}
              >
                <option value="">Select plan...</option>
                {plans && plans.length > 0 ? plans.map(pl => (
                  <option key={pl._id} value={pl._id}>{pl.title}</option>
                )) : planId ? (
                  <option value={planId}>Current Plan</option>
                ) : null}
              </select>
            </div>
          )}
        </div>

        {/* Assigned To Section */}
        {(() => {
          const selectedPlanObj = (plans || []).find(p => p._id === form.planId);
          const members = selectedPlanObj?.members || [];
          if (!selectedPlanObj || members.length === 0) return null;

          return (
            <div className="input-wrapper" style={{ marginTop: '8px' }}>
              <label className="input-label">Assign To</label>
              <div 
                className="task-modal__assignees input-field" 
                style={{ 
                  maxHeight: '100px', overflowY: 'auto', padding: '8px',
                  display: 'flex', flexDirection: 'column', gap: '6px'
                }}
              >
                {members.map(member => (
                  <label key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={form.assignedTo.includes(member._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm(p => ({
                          ...p, 
                          assignedTo: checked 
                            ? [...p.assignedTo, member._id]
                            : p.assignedTo.filter(id => id !== member._id)
                        }));
                      }}
                    />
                    <img src={member.avatar || 'https://via.placeholder.com/30'} alt="" style={{width: 24, height: 24, borderRadius: '50%'}} />
                    <span>@{member.username}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="task-modal__row">
          <Input id="task-startDate" label="Start date" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          <Input id="task-endDate" label="End date" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
        </div>

        {isEdit && isInstance && (
          <div className="input-wrapper" style={{ marginTop: '16px' }}>
            <label className="input-label">Update Scope</label>
            <select className="task-modal__select input-field" value={updateType} onChange={e => setUpdateType(e.target.value)}>
              <option value="single">Only this specific instance</option>
              <option value="future">This and all future instances</option>
            </select>
          </div>
        )}

        <div className="task-modal__recurring">
          <label className="task-modal__toggle">
            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))} />
            <span>Recurring task</span>
          </label>
          {form.isRecurring && (
            <select className="task-modal__select input-field" value={form.recurrenceType} onChange={e => setForm(p => ({ ...p, recurrenceType: e.target.value }))}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        <div className="task-modal__footer">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
