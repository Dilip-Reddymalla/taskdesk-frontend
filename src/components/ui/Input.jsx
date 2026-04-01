import React, { forwardRef } from 'react';
import '../../styles/components/input.css';

/**
 * Input component
 * Props: label, error, hint, leftIcon, rightIcon, ...native input props
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? Math.random()}`;

  return (
    <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-field-wrap">
        {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`input-field ${leftIcon ? 'input-field--left-pad' : ''} ${rightIcon ? 'input-field--right-pad' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="input-hint">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
