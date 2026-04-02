import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/not-found.css';

function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__glow" aria-hidden="true" />
      <div className="not-found__content">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="not-found__btn">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

