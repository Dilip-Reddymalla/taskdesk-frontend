import React from 'react';
import '../../styles/components/badge.css';

/**
 * Generic Badge component
 * Props: children, color ('accent'|'green'|'red'|'amber'|'cyan'|'pink'|'ghost')
 */
function Badge({ children, color = 'ghost', size = 'sm', className = '' }) {
  return (
    <span className={`badge badge--${color} badge--${size} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
