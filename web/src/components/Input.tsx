/**
 * Reusable Input Component
 */

import React from 'react';
import './Input.css';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
}

export default function Input({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  className = '',
}: InputProps) {
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`vriksh-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="vriksh-input-label">
          {label}
          {required && <span className="vriksh-input-required">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`vriksh-input ${error ? 'vriksh-input--error' : ''}`}
      />

      {error && <span className="vriksh-input-error">{error}</span>}
    </div>
  );
}
