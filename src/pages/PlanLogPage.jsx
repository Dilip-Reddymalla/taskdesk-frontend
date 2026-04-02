import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';
import { getTaskTemplatesApi } from '../api/tasksApi';
import { getPlanLogApi } from '../api/tasksApi';
import { CardSkeleton } from '../components/ui/Loader';
import '../styles/pages/plan-detail.css'; // Reuse some useful classes

function PlanLogPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentPlan, fetchPlan } = usePlans();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchPlan(planId);
  }, [planId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tempRes, logRes] = await Promise.all([
          getTaskTemplatesApi(planId),
          getPlanLogApi(planId)
        ]);
        setTemplates(tempRes.templates || []);
        setLogs(logRes.instances || []);
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [planId]);

  // Aggregate stats per template
  const logData = useMemo(() => {
    if (!templates.length) return { maxDays: 0, rows: [] };

    let maxDays = 0;
    const now = new Date();
    // Normalize "today" to start of day for comparison
    now.setHours(0, 0, 0, 0);

    const rows = templates.map(t => {
      // "Day 1" starts on the template's creation date (normalized to midnight)
      const startDate = new Date(t.createdAt);
      startDate.setHours(0, 0, 0, 0);

      // Diff in ms -> days
      const msDiff = now.getTime() - startDate.getTime();
      let daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1;
      
      // Safety cap (e.g. 100 days) so it doesn't break the browser if old
      if (daysPassed < 1) daysPassed = 1;
      if (daysPassed > 100) daysPassed = 100;
      
      if (daysPassed > maxDays) maxDays = daysPassed;

      // Group instances for this template by date
      const instancesForTemplate = logs.filter(l => (l.task?._id || l.task) === t._id);
      
      const dayData = {};
      for (let dayIndex = 1; dayIndex <= daysPassed; dayIndex++) {
        // Calculate the Date for Day N
        const targetDate = new Date(startDate.getTime());
        targetDate.setDate(targetDate.getDate() + (dayIndex - 1));
        
        // Find if there's an instance scheduled exactly on this targetDate
        // (instances have `date` field normalized to midnight)
        const instance = instancesForTemplate.find(inst => {
          const instDate = new Date(inst.date);
          instDate.setHours(0, 0, 0, 0);
          return instDate.getTime() === targetDate.getTime();
        });

        if (instance) {
          dayData[dayIndex] = {
            hasInstance: true,
            isCompleted: instance.isCompleted
          };
        } else {
          dayData[dayIndex] = { hasInstance: false };
        }
      }

      return {
        template: t,
        startDate,
        daysPassed,
        dayData
      };
    });

    return { maxDays, rows };
  }, [templates, logs]);

  if (loading || !currentPlan) {
    return (
      <div className="page-container">
        <div style={{ marginBottom: 20 }}>
          <button className="plan-detail__back" onClick={() => navigate(`/plans/${planId}`)}>←</button>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  // Generate cols: Day 1 .. maxDays
  const columns = Array.from({ length: logData.maxDays }, (_, i) => i + 1);

  return (
    <div className="page-container" style={{ 
      maxWidth: '100%', 
      margin: '-24px -24px -32px -24px', 
      padding: '24px 32px',
      minHeight: 'calc(100vh - 72px)',
      background: 'var(--bg-base)',
      transition: 'background 0.3s ease',
      color: 'var(--text-secondary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button className="plan-detail__back" onClick={() => navigate(`/plans/${planId}`)} style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{currentPlan.title} — Log Tracker</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Personal recurring task tracker starting from Day 1</p>
        </div>
      </div>

      <div className="mobile-only-msg" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'right' }}>
        Swipe to view more days →
      </div>

      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        {logData.rows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No task templates found.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '450px', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <th style={{ padding: '10px 12px', border: '1px solid var(--border)', width: '220px', minWidth: '220px' }}>Task Name</th>
                {columns.map(dayNum => (
                  <th key={dayNum} style={{ padding: '8px 4px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '40px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logData.rows.map((row, idx) => (
                <tr key={row.template._id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px', verticalAlign: 'middle', border: '1px solid var(--border)' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{row.template.title}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Start: {row.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  {columns.map(dayNum => {
                    const cell = row.dayData[dayNum];
                    // If this day represents the future for this specific task
                    if (dayNum > row.daysPassed) {
                      return (
                        <td key={dayNum} style={{ padding: '8px 4px', textAlign: 'center', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ width: '24px', height: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                            <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>-</span>
                          </div>
                        </td>
                      );
                    }

                    // For valid past/present days
                    if (cell && cell.hasInstance) {
                      if (cell.isCompleted) {
                        return (
                          <td key={dayNum} style={{ padding: '4px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div style={{ width: '28px', height: '28px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: '#10b981', color: '#fff', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 800 }}>✓</span>
                            </div>
                          </td>
                        );
                      } else {
                        // Pending instance. Is today?
                        if (dayNum === row.daysPassed) {
                          return (
                            <td key={dayNum} style={{ padding: '4px', textAlign: 'center', border: '1px solid var(--border)', background: 'rgba(245, 158, 11, 0.05)' }}>
                              <div style={{ width: '24px', height: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '2px solid #f59e0b', color: '#d97706', background: '#fff' }} title="Pending today">
                                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>P</span>
                              </div>
                            </td>
                          );
                        } else {
                          // Past day, not done
                          return (
                            <td key={dayNum} style={{ padding: '4px', textAlign: 'center', border: '1px solid var(--border)', background: 'rgba(239, 68, 68, 0.05)' }}>
                              <div style={{ width: '24px', height: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: '#ef4444' }} title="Overdue / Not done">
                                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>×</span>
                              </div>
                            </td>
                          );
                        }
                      }
                    } else {
                      return (
                        <td key={dayNum} style={{ padding: '8px 4px', textAlign: 'center', border: '1px solid var(--border)' }}>
                          <div style={{ width: '24px', height: '24px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--border)', opacity: 0.5 }}>-</span>
                          </div>
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PlanLogPage;
