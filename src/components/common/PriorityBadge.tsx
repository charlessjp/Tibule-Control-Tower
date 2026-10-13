import React from 'react';
import { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  showDot = true,
  className = ''
}) => {
  const norm = (priority || 'medium').toLowerCase();

  const getBadgeClass = () => {
    switch (norm) {
      case 'urgent':
        return 'badge-priority-urgent';
      case 'high':
        return 'badge-priority-high';
      case 'medium':
        return 'badge-priority-medium';
      case 'low':
      default:
        return 'badge-priority-low';
    }
  };

  const getDotClass = () => {
    switch (norm) {
      case 'urgent':
        return 'bg-[var(--color-critical)] animate-pulse';
      case 'high':
        return 'bg-[var(--color-warning)]';
      case 'medium':
        return 'bg-[var(--color-brand)]';
      case 'low':
      default:
        return 'bg-[var(--color-text-tertiary)]';
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] gap-1',
    sm: 'text-[11px] gap-1.5',
    md: 'text-xs gap-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider font-mono ${getBadgeClass()} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotClass()}`} />}
      <span>{norm}</span>
    </span>
  );
};
