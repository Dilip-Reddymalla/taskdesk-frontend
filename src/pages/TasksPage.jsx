import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { usePlans } from '../hooks/usePlans';
import { useToast } from '../hooks/useToast';
import { useSocket } from '../hooks/useSocket';
import Modal from '../components/ui/Modal';
import PriorityBadge from '../components/ui/PriorityBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Loader';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import TaskModal from '../components/tasks/TaskModal';
import { formatDate, isToday, isOverdue, isTomorrow, isYesterday } from '../utils/date';
import '../styles/pages/tasks.css';

const PRIORITIES = ['', 'high', 'medium', 'low'];



function TaskCard({ task, onClick }) {
  const title = task.task?.title ?? task.title ?? 'Untitled';
  const priority = task.task?.priority ?? task.priority ?? 'low';
  const dueDate = task.date;
  const isCompleted = task.status === 'completed' || task.isCompleted;
  const overdue = !isCompleted && dueDate && isOverdue(dueDate);

  return (
    <div
      className={`task-card card ${isCompleted ? 'task-card--done' : ''} ${overdue ? 'task-card--overdue' : ''}`}
      onClick={() => onClick?.(task)}
      style={{ cursor: 'pointer', transition: 'transform 0.15s ease', ':hover': { transform: 'translateY(-2px)' } }}
    >
      <div className="task-card__body" style={{ marginLeft: 0 }}>
        <p className={`task-card__title ${isCompleted ? 'task-card__title--done' : ''}`}>{title}</p>
        <div className="task-card__meta">
          {dueDate && (
            <span className={`task-card__date ${overdue ? 'task-card__date--overdue' : isToday(dueDate) ? 'task-card__date--today' : ''}`}>
              📅 {isToday(dueDate) ? 'Today' : formatDate(dueDate)}
            </span>
          )}
          {task.plan?.title && <span className="task-card__plan">📋 {task.plan.title}</span>}
        </div>
      </div>
      <PriorityBadge priority={priority} />
    </div>
  );
}

function TasksPage() {
  const {
    pendingTasks, completedTasks, allTasks,
    loading, error,
    fetchPending, fetchCompleted, fetchAllTasks,
    markComplete, removeTask,
    pendingTotal, completedTotal, allTasksTotal,
    pendingPage, completedPage, allTasksPage,
  } = useTasks();

  const { plans, fetchPlans } = usePlans();
  const { addToast } = useToast();
  const { on } = useSocket();

  const [tab, setTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditingTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [filter, setFilter] = useState({ priority: '', search: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPending(1);
    fetchCompleted(1);
    fetchAllTasks(1);
    fetchPlans();
  }, []);

  useEffect(() => {
    const cleanup1 = on('task_created', () => { fetchPending(1); fetchAllTasks(1); });
    const cleanup2 = on('task_completed', () => { fetchPending(1); fetchCompleted(1); fetchAllTasks(1); });
    const cleanup3 = on('task_updated', () => { fetchPending(1); fetchAllTasks(1); });
    return () => [cleanup1, cleanup2, cleanup3].forEach(fn => typeof fn === 'function' && fn());
  }, [on, fetchPending, fetchCompleted, fetchAllTasks]);

  const handleComplete = async (task) => {
    try {
      await markComplete(task.task?._id ?? task._id);
      addToast('✅ Task completed! +10 XP', 'success');
      fetchCompleted(1);
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeTask(deleteTarget._id);
      addToast('Task deleted', 'info');
    } catch (e) {
      addToast('Failed to delete', 'error');
    }
    setDeleteTarget(null);
  };

  const displayedTasks = (tab === 'pending' ? pendingTasks : tab === 'completed' ? completedTasks : allTasks).filter(t => {
    if (!t) return false;
    const title = (t?.title ?? t?.task?.title ?? '').toLowerCase();
    if (filter.search && !title.includes(filter.search.toLowerCase())) return false;
    if (filter.priority && (t?.priority ?? t?.task?.priority) !== filter.priority) return false;
    return true;
  });

  // Group tasks by relative dates natively
  const groupedTasks = displayedTasks.reduce((acc, t) => {
    if (!t) return acc;
    let group = 'No Date';
    if (tab === 'pending' || tab === 'all') {
      if (!t.date) group = 'Upcoming';
      else if (isOverdue(t.date) && !t.isCompleted) group = 'Overdue';
      else if (isToday(t.date)) group = 'Today';
      else if (isTomorrow(t.date)) group = 'Tomorrow';
      else group = 'Upcoming';
    } else {
      if (!t.completedAt) group = 'Older';
      else if (isToday(t.completedAt)) group = 'Today';
      else if (isYesterday(t.completedAt)) group = 'Yesterday';
      else group = 'Older';
    }
    if (!acc[group]) acc[group] = [];
    acc[group].push(t);
    return acc;
  }, {});

  const pendingOrder = ['Overdue', 'Today', 'Tomorrow', 'Upcoming'];
  const completedOrder = ['Today', 'Yesterday', 'Older'];
  const groupOrder = tab === 'completed' ? completedOrder : pendingOrder;

  return (
    <div className="tasks-page page-container">
      {/* Header */}
      <div className="tasks-page__header">
        <div>
          <h1 className="tasks-page__title">My Tasks</h1>
          <p className="tasks-page__sub">{pendingTotal} pending · {completedTotal} completed</p>
        </div>
        <Button id="new-task-btn" variant="primary" onClick={() => {
          console.log('New Task button clicked! Setting modalOpen to true.');
          setEditingTask(null);
          setModalOpen(true);
        }}>
          + New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="tasks-page__filters">
        <input
          className="tasks-page__search input-field"
          placeholder="🔍 Search tasks..."
          value={filter.search}
          onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
          id="task-search"
        />
        <select
          className="tasks-page__filter-select input-field"
          value={filter.priority}
          onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))}
          id="task-priority-filter"
        >
          <option value="">All priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="tasks-page__tabs">
        <button
          className={`tasks-page__tab ${tab === 'pending' ? 'tasks-page__tab--active' : ''}`}
          onClick={() => setTab('pending')}
          id="tab-pending"
        >
          Pending <span className="tasks-page__tab-count">{pendingTotal}</span>
        </button>
        <button
          className={`tasks-page__tab ${tab === 'completed' ? 'tasks-page__tab--active' : ''}`}
          onClick={() => setTab('completed')}
          id="tab-completed"
        >
          Completed <span className="tasks-page__tab-count">{completedTotal}</span>
        </button>
        <button
          className={`tasks-page__tab ${tab === 'all' ? 'tasks-page__tab--active' : ''}`}
          onClick={() => setTab('all')}
          id="tab-all"
        >
          All Tasks <span className="tasks-page__tab-count">{allTasksTotal}</span>
        </button>
      </div>

      {/* Task list */}
      <div className="tasks-page__list">
        {loading && displayedTasks.length === 0 && [0, 1, 2, 3].map(i => <CardSkeleton key={i} />)}

        {!loading && displayedTasks.length === 0 && (
          <div className="tasks-page__empty">
            <span>{tab === 'pending' ? '🎉' : tab === 'completed' ? '📋' : '📭'}</span>
            <p>{tab === 'pending' ? 'No pending tasks!' : tab === 'completed' ? 'No completed tasks yet.' : 'No tasks exist.'}</p>
            {tab === 'pending' && (
              <Button variant="primary" onClick={() => setModalOpen(true)}>Create your first task</Button>
            )}
          </div>
        )}

        {(!loading || displayedTasks.length > 0) && groupOrder.map(group => {
          const tasksInGroup = groupedTasks[group];
          if (!tasksInGroup || tasksInGroup.length === 0) return null;
          return (
            <div key={group} className="tasks-page__group" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                {group} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({tasksInGroup.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tasksInGroup.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={(t) => setViewTask(t)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {tab === 'pending' && pendingTotal > 20 && (
        <div className="tasks-page__pagination">
          <Button variant="ghost" size="sm" disabled={pendingPage === 1} onClick={() => fetchPending(pendingPage - 1)}>← Prev</Button>
          <span>Page {pendingPage}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchPending(pendingPage + 1)}>Next →</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        plans={plans}
        task={editTask}
        onSaved={() => {
          console.log('TaskModal onSaved called.');
          fetchPending(1); fetchCompleted(1); fetchAllTasks(1);
        }}
      />

      {/* Task Details Info Modal */}
      <TaskDetailsModal
        isOpen={!!viewTask}
        onClose={() => setViewTask(null)}
        task={viewTask}
        onComplete={handleComplete}
        onEdit={(t) => {
          setEditingTask(t);
          setModalOpen(true);
        }}
        onDelete={(t) => setDeleteTarget(t)}
        onUploaded={(addedImages) => {
          setViewTask(prev => ({...prev, images: [...(prev?.images || []), ...addedImages]}));
          fetchPending(pendingPage); fetchCompleted(completedPage); fetchAllTasks(allTasksPage);
        }}
      />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete task?" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          This will remove the task and all future incomplete instances. Completed history is preserved.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;

