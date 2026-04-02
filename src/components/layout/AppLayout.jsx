import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationPanel from '../notifications/NotificationPanel';
import ToastContainer from '../ui/Toast';
import SearchModal from '../ui/SearchModal';
import '../../styles/components/app-layout.css';

function AppLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout__main">
        <Topbar onSearchOpen={() => setSearchOpen(true)} />
        <main className="app-layout__content">
          {children}
        </main>
      </div>

      {/* Global overlays */}
      <NotificationPanel />
      <ToastContainer />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

export default AppLayout;
