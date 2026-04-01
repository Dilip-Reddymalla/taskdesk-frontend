import React from 'react';
import '../../styles/components/loader.css';

/**
 * Spinner — inline or full-page loading indicator.
 */
export function Spinner({ size = 'md', color = 'accent' }) {
  return (
    <div className={`spinner spinner--${size} spinner--${color}`} role="status" aria-label="Loading" />
  );
}

/**
 * SkeletonBlock — single pulsing placeholder block.
 */
export function SkeletonBlock({ width = '100%', height = 16, borderRadius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: borderRadius ?? 'var(--radius-sm)' }}
      role="presentation"
    />
  );
}

/**
 * Full-page loading overlay.
 */
export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Generic Skeleton for a card (title + 3 lines).
 */
export function CardSkeleton() {
  return (
    <div className="card" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
      <SkeletonBlock width="60%" height={18} />
      <SkeletonBlock height={12} />
      <SkeletonBlock width="80%" height={12} />
      <SkeletonBlock width="40%" height={12} />
    </div>
  );
}
