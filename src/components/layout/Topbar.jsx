import React, { useContext, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import '../../styles/components/topbar.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks':     'My Tasks',
  '/calendar':  'Calendar',
  '/plans':     'Plans',
  '/profile':   'Profile',
};

function Topbar({ onSearchOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount, setPanelOpen } = useContext(NotificationContext);
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname]
    ?? (location.pathname.startsWith('/plans/') ? 'Plan Details' : 'Task Desk');

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h2 className="topbar__title">{title}</h2>
      </div>

      <div className="topbar__right">
        {/* Search trigger */}
        <button
          className="topbar__search"
          onClick={onSearchOpen}
          aria-label="Open search"
          id="search-trigger"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="topbar__search-text">Search...</span>
          <span className="topbar__search-kbd">⌘K</span>
        </button>

        {/* Theme toggle */}
        <button
          className="topbar__icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ fontSize: '1rem' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notification bell */}
        <button
          className="topbar__icon-btn"
          onClick={() => setPanelOpen(true)}
          aria-label="Open notifications"
          id="notification-bell"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="topbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Avatar dropdown */}
        <div className="topbar__avatar-wrap">
          <button
            className="topbar__avatar-btn"
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="Profile menu"
            aria-expanded={dropdownOpen}
            id="profile-menu-trigger"
          >
            <Avatar username={user?.username ?? ''} src={user?.avatar} size="sm" />
          </button>

          {dropdownOpen && (
            <>
              <div className="topbar__dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
              <div className="topbar__dropdown" role="menu">
                <button
                  className="topbar__dropdown-item"
                  onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                  role="menuitem"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
                <button
                  className="topbar__dropdown-item"
                  onClick={() => { navigate('/invites'); setDropdownOpen(false); }}
                  role="menuitem"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22 6 12 13 2 6" />
                  </svg>
                  Invites
                </button>
                <hr className="topbar__dropdown-divider" />
                <button
                  className="topbar__dropdown-item topbar__dropdown-item--danger"
                  onClick={() => { handleLogout(); setDropdownOpen(false); }}
                  role="menuitem"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
