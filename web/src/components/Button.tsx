/**
 * Reusable Button Component
 */

import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const classNames = [
    'vriksh-button',
    `vriksh-button--${variant}`,
    `vriksh-button--${size}`,
    fullWidth ? 'vriksh-button--full-width' : '',
    loading ? 'vriksh-button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="vriksh-button__spinner" />
      ) : (
        children
      )}
    </button>
  );
}
