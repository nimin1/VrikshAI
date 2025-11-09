/**
 * Loading Spinner Component
 */

import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const content = (
    <div className="vriksh-spinner-content">
      <div className={`vriksh-spinner vriksh-spinner--${size}`} />
      {message && <p className="vriksh-spinner-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="vriksh-spinner-fullscreen">{content}</div>;
  }

  return content;
}
