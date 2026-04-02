import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTasks } from '../../api/tasksApi';
import { getPlans } from '../../api/plansApi';
import PriorityBadge from './PriorityBadge';
import { Spinner } from './Loader';
import { formatDate } from '../../utils/date';
import '../../styles/components/search-modal.css';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchModal({ onClose }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState({ tasks: [], plans: [] });
  const [loading, setLoading]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(query, 300);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debounced.trim()) { setResults({ tasks: [], plans: [] }); return; }
    (async () => {
      setLoading(true);
      try {
        const [taskData, planData] = await Promise.all([
          searchTasks({ q: debounced, page: 1 }),
          getPlans(),
        ]);
        const filteredPlans = (planData.plans ?? []).filter(p =>
          p.title.toLowerCase().includes(debounced.toLowerCase())
        ).slice(0, 4);
        setResults({ tasks: (taskData.tasks ?? []).slice(0, 5), plans: filteredPlans });
      } catch { setResults({ tasks: [], plans: [] }); }
      finally { setLoading(false); }
    })();
  }, [debounced]);

  const totalResults = results.tasks.length + results.plans.length;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i+1, totalResults-1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i-1, 0)); }
    if (e.key === 'Enter') {
      // Navigate to active result
      const allResults = [...results.plans.map(p=>({type:'plan',data:p})), ...results.tasks.map(t=>({type:'task',data:t}))];
      const active = allResults[activeIdx];
      if (!active) return;
      if (active.type === 'plan') { navigate(`/plans/${active.data._id}`); onClose(); }
      if (active.type === 'task') { navigate('/tasks'); onClose(); }
    }
  }, [onClose, totalResults, results, activeIdx, navigate]);

  return (
    <div className="search-modal" role="dialog" aria-label="Global search">
      <div className="search-modal__backdrop" onClick={onClose} />
      <div className="search-modal__container">
        {/* Input */}
        <div className="search-modal__input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-modal__input"
            placeholder="Search tasks, plans..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            id="global-search-input"
          />
          {loading && <Spinner size="sm" />}
          <kbd className="search-modal__esc">Esc</kbd>
        </div>

        {/* Results */}
        {query && (
          <div className="search-modal__results">
            {/* Plans */}
            {results.plans.length > 0 && (
              <div className="search-modal__group">
                <p className="search-modal__group-label">PLANS</p>
                {results.plans.map((plan, i) => (
                  <button
                    key={plan._id}
                    className={`search-modal__result ${activeIdx === i ? 'search-modal__result--active' : ''}`}
                    onClick={() => { navigate(`/plans/${plan._id}`); onClose(); }}
                  >
                    <span className="search-modal__result-icon">📋</span>
                    <div className="search-modal__result-info">
                      <p className="search-modal__result-title">{plan.title}</p>
                      <p className="search-modal__result-sub">{plan.members?.length ?? 0} members</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            {results.tasks.length > 0 && (
              <div className="search-modal__group">
                <p className="search-modal__group-label">TASKS</p>
                {results.tasks.map((t, i) => (
                  <button
                    key={t._id}
                    className={`search-modal__result ${activeIdx === results.plans.length + i ? 'search-modal__result--active' : ''}`}
                    onClick={() => { navigate('/tasks'); onClose(); }}
                  >
                    <span className="search-modal__result-icon">✅</span>
                    <div className="search-modal__result-info">
                      <p className="search-modal__result-title">{t.task?.title ?? t.title}</p>
                      <p className="search-modal__result-sub">
                        {t.plan?.title} · {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <PriorityBadge priority={t.task?.priority ?? t.priority} size="xs" />
                  </button>
                ))}
              </div>
            )}

            {!loading && totalResults === 0 && (
              <div className="search-modal__empty">
                No results for "{query}"
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="search-modal__hint">
            <p>Type to search across tasks and plans</p>
            <div className="search-modal__shortcuts">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
