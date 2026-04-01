import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';
import Avatar from '../ui/Avatar';
import { getLevel, getLevelTitle, xpProgress } from '../../utils/xp';
import '../../styles/components/sidebar.css';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    color: 'var(--accent)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/tasks',
    label: 'My Tasks',
    color: 'var(--cyan)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    path: '/calendar',
    label: 'Calendar',
    color: 'var(--amber)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    path: '/plans',
    label: 'Plans',
    color: 'var(--green)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    color: 'var(--pink)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, setPanelOpen } = useContext(NotificationContext);

  const level = getLevel(user?.xp ?? 0);
  const levelTitle = getLevelTitle(user?.xp ?? 0);
  const progress = xpProgress(user?.xp ?? 0);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" stroke="none" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" stroke="none" opacity="0.6" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" stroke="none" opacity="0.6" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" stroke="none" opacity="0.3" />
          </svg>
        </div>
        <span className="sidebar__logo-text">Task Desk</span>
      </div>

      {/* User info */}
      <div className="sidebar__user">
        <Avatar username={user?.username ?? ''} src={user?.avatar} size="md" />
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">{user?.username}</p>
          <p className="sidebar__user-level">Lv.{level} · {levelTitle}</p>
        </div>
      </div>

      {/* XP mini bar */}
      <div className="sidebar__xp-bar">
        <div className="sidebar__xp-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
          >
            <span className="sidebar__nav-dot" style={{ background: item.color }} />
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        {/* Notifications bell */}
        <button
          className="sidebar__bell"
          onClick={() => setPanelOpen(true)}
          aria-label="Open notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="sidebar__bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Logout */}
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
