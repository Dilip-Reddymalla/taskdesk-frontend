import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { getDashboardStats } from '../api/dashboardApi';
import { getGreeting } from '../utils/date';
import { getLevel, getLevelTitle, xpProgress, xpToNextLevel, xpInCurrentLevel, xpLevelSpan } from '../utils/xp';
import { NotificationContext } from '../context/NotificationContext';
import PriorityBadge from '../components/ui/PriorityBadge';
import Avatar from '../components/ui/Avatar';
import { CardSkeleton } from '../components/ui/Loader';
import '../styles/pages/dashboard.css';

const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function XPFloater({ visible }) {
  if (!visible) return null;
  return <div className="xp-floater">+10 XP ⚡</div>;
}

function DashboardPage() {
  const { user } = useAuth();
  const { pendingTasks, fetchPending, markComplete, loading: tasksLoading } = useTasks();
  const { addToast } = useContext(NotificationContext);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [floatingXP, setFloatingXP] = useState(null);

  useEffect(() => {
    fetchPending(1);
    (async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch { /* silent */ }
      finally { setStatsLoading(false); }
    })();
  }, []);

  const handleComplete = async (task) => {
    try {
      await markComplete(task.task?._id ?? task._id);
      setFloatingXP(Date.now());
      addToast(`✅ Task completed! +10 XP`, 'success');
      // Refresh stats
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to complete task', 'error');
    }
  };

  const level = getLevel(user?.xp ?? 0);
  const levelTitle = getLevelTitle(user?.xp ?? 0);
  const progress = xpProgress(user?.xp ?? 0);
  const xpInLevel = xpInCurrentLevel(user?.xp ?? 0);
  const xpSpan    = xpLevelSpan();
  const xpNeeded  = xpToNextLevel(user?.xp ?? 0);
  const streak    = stats?.streak ?? user?.streakCount ?? 0;

  const maxWeekly = Math.max(...(stats?.weeklyCompletion ?? []).map(d => d.count), 1);

  return (
    <div className="dashboard page-container">
      {/* Greeting */}
      <div className="dashboard__greeting">
        <h1 className="dashboard__greeting-text">
          {getGreeting()}, {user?.username} 👋
        </h1>
        <p className="dashboard__greeting-sub">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats row */}
      <div className="dashboard__stats">
        {statsLoading ? (
          <>{[0,1,2,3].map(i => <CardSkeleton key={i} />)}</>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--accent">✅</div>
              <div>
                <p className="stat-card__value stat-card__value--accent">{stats?.tasksCompletedToday ?? 0}</p>
                <p className="stat-card__label">Completed today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className={`stat-card__icon stat-card__icon--amber ${streak > 7 ? 'stat-card__icon--pulse' : ''}`}>🔥</div>
              <div>
                <p className="stat-card__value stat-card__value--amber">{streak}</p>
                <p className="stat-card__label">Day streak</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--amber">⚡</div>
              <div>
                <p className="stat-card__value stat-card__value--amber">{(user?.xp ?? 0).toLocaleString()}</p>
                <p className="stat-card__label">Total XP</p>
              </div>
            </div>
            <div className="stat-card">
              <div className={`stat-card__icon ${stats?.activeTasksByPriority?.high > 0 ? 'stat-card__icon--red' : 'stat-card__icon--muted'}`}>📋</div>
              <div>
                <p className={`stat-card__value ${stats?.activeTasksByPriority?.high > 0 ? 'stat-card__value--red' : ''}`}>
                  {(stats?.activeTasksByPriority?.high ?? 0) + (stats?.activeTasksByPriority?.medium ?? 0) + (stats?.activeTasksByPriority?.low ?? 0)}
                </p>
                <p className="stat-card__label">Active tasks</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard__main">
        {/* Left column */}
        <div className="dashboard__left">
          {/* XP Progress bar */}
          <div className="dashboard__xp-card card">
            <div className="dashboard__xp-header">
              <div>
                <p className="dashboard__xp-level">Level {level} — {levelTitle}</p>
                <p className="dashboard__xp-nums">{xpInLevel} / {xpSpan} XP · {xpNeeded} to next level</p>
              </div>
              <div className="dashboard__xp-badge">Lv.{level}</div>
            </div>
            <div className="dashboard__xp-bar-track">
              <div
                className="dashboard__xp-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Weekly bar chart */}
          <div className="dashboard__chart-card card">
            <h3 className="dashboard__section-title">Weekly completions</h3>
            <div className="dashboard__chart">
              {statsLoading
                ? DAY_SHORT.map(d => <div key={d} className="skeleton" style={{height: '60px', borderRadius: 'var(--radius-sm)'}} />)
                : (stats?.weeklyCompletion ?? Array(7).fill({count:0})).map((day, i) => {
                    const heightPct = Math.max(6, (day.count / maxWeekly) * 100);
                    const today = i === 6; // assuming last = today
                    return (
                      <div className="chart__col" key={i}>
                        <span className="chart__count">{day.count > 0 ? day.count : ''}</span>
                        <div
                          className={`chart__bar ${today ? 'chart__bar--today' : ''}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${DAY_SHORT[i]}: ${day.count} tasks`}
                        />
                        <span className="chart__label">{DAY_SHORT[i]}</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Priority breakdown */}
          {stats && (
            <div className="dashboard__priority-card card">
              <h3 className="dashboard__section-title">Active by priority</h3>
              <div className="dashboard__priority-rows">
                {[
                  { key: 'high',   label: 'High',   color: 'var(--red)',   count: stats.activeTasksByPriority?.high ?? 0 },
                  { key: 'medium', label: 'Medium', color: 'var(--amber)', count: stats.activeTasksByPriority?.medium ?? 0 },
                  { key: 'low',    label: 'Low',    color: 'var(--green)', count: stats.activeTasksByPriority?.low ?? 0 },
                ].map(p => {
                  const total = (stats.activeTasksByPriority?.high ?? 0) + (stats.activeTasksByPriority?.medium ?? 0) + (stats.activeTasksByPriority?.low ?? 0);
                  const pct = total ? (p.count / total) * 100 : 0;
                  return (
                    <div className="priority-row" key={p.key}>
                      <span className="priority-row__label">{p.label}</span>
                      <div className="priority-row__bar-track">
                        <div className="priority-row__bar-fill" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                      <span className="priority-row__count">{p.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Today's tasks */}
        <div className="dashboard__right">
          <div className="dashboard__tasks-card card">
            <h3 className="dashboard__section-title">Today's tasks</h3>
            {tasksLoading ? (
              <>{[0,1,2].map(i => <div key={i} className="skeleton" style={{height:'56px', marginBottom:'8px', borderRadius: 'var(--radius-md)'}} />)}</>
            ) : pendingTasks.length === 0 ? (
              <div className="dashboard__empty">
                <span>🎉</span>
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              <div className="dashboard__task-list">
                {pendingTasks.slice(0, 8).map(instance => (
                  <div className="dashboard__task-item" key={instance._id}>
                    <button
                      className="dashboard__task-check"
                      onClick={() => handleComplete(instance)}
                      aria-label="Complete task"
                      title="Mark as complete"
                    />
                    <div className="dashboard__task-info">
                      <p className="dashboard__task-title">{instance.task?.title ?? instance.title}</p>
                      <p className="dashboard__task-meta">{instance.task?.description ?? ''}</p>
                    </div>
                    <PriorityBadge priority={instance.task?.priority ?? instance.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP float animation */}
      {floatingXP && <XPFloater key={floatingXP} visible />}
    </div>
  );
}

export default DashboardPage;

