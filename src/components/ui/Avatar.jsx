import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import '../../styles/components/avatar.css';

/**
 * Avatar — initials-based, deterministic color from username.
 * Props: username, size ('xs'|'sm'|'md'|'lg'), src (optional image URL)
 */
function Avatar({ username = '', size = 'md', src, className = '' }) {
  const initials = getInitials(username);
  const color    = getAvatarColor(username);

  if (src) {
    return (
      <div className={`avatar avatar--${size} ${className}`} title={username}>
        <img src={src} alt={username} className="avatar__img" />
      </div>
    );
  }

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ background: color + '33', border: `1px solid ${color}55`, color }}
      title={username}
      aria-label={username}
    >
      {initials}
    </div>
  );
}

/**
 * AvatarStack — shows up to `max` avatars stacked, then a +N overflow pill.
 */
export function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const visible  = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="avatar-stack">
      {visible.map((u, i) => (
        <Avatar
          key={u._id ?? i}
          username={u.username}
          src={u.avatar}
          size={size}
          style={{ zIndex: visible.length - i }}
        />
      ))}
      {overflow > 0 && (
        <div className={`avatar avatar--${size} avatar--overflow`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default Avatar;
