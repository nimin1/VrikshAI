/**
 * Reusable Card Component
 */

import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  onClick,
  hoverable = false,
  className = '',
}: CardProps) {
  const classNames = [
    'vriksh-card',
    hoverable || onClick ? 'vriksh-card--hoverable' : '',
    onClick ? 'vriksh-card--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {(title || subtitle) && (
        <div className="vriksh-card__header">
          {title && <h3 className="vriksh-card__title">{title}</h3>}
          {subtitle && <p className="vriksh-card__subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="vriksh-card__content">{children}</div>
    </div>
  );
}
