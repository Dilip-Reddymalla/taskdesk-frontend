import React, { useEffect, useCallback } from 'react';
import '../../styles/components/modal.css';

/**
 * Modal component
 * Props: isOpen, onClose, title, children, size ('sm' | 'md' | 'lg' | 'xl')
 */
function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, title]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-container modal--${size}`}>
          {/* Header */}
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">{children}</div>

          {/* Optional footer */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export default Modal;
