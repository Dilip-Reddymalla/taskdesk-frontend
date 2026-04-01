import React from 'react';
import '../../styles/components/badge.css';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'red',   icon: '▲' },
  medium: { label: 'Medium', color: 'amber', icon: '◆' },
  low:    { label: 'Low',    color: 'green', icon: '▼' },
};

/**
 * PriorityBadge — shows priority with icon and appropriate color.
 * Props: priority ('high' | 'medium' | 'low'), showIcon (bool)
 */
function PriorityBadge({ priority = 'low', showIcon = true, size = 'sm' }) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low;
  return (
    <span className={`badge badge--${config.color} badge--${size}`}>
      {showIcon && <span className="badge-icon" aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}

export default PriorityBadge;
