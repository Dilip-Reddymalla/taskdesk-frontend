import React from 'react';
import { useToast } from '../../hooks/useToast';
import '../../styles/components/toast.css';

const TYPE_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  invite: '📨',
  task: '✅',
};

const TYPE_CLASS = {
  success: 'toast--success',
  error:   'toast--error',
  info:    'toast--info',
  invite:  'toast--invite',
  task:    'toast--task',
};

/**
 * ToastContainer — renders the global toast stack in bottom-right corner.
 * Mount this once at root level (inside App.jsx).
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${TYPE_CLASS[toast.type] ?? 'toast--info'}`}
          role="alert"
        >
          <span className="toast__icon">
            {TYPE_ICONS[toast.type] ?? 'ℹ'}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
