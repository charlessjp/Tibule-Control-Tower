import React from 'react';
import { SeniorityLevel } from '../../types';
import { SENIORITY_LABELS } from '../../data/standardTasks';

interface SeniorityBadgeProps {
  level?: SeniorityLevel | string;
  seniority?: SeniorityLevel | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const SeniorityBadge: React.FC<SeniorityBadgeProps> = ({
  level,
  seniority,
  size = 'sm',
  className = '',
  showDot = false
}) => {
  const norm = ((level || seniority || 'mid') as string).toLowerCase() as SeniorityLevel;
  const labelObj = SENIORITY_LABELS[norm] || SENIORITY_LABELS['mid'];

  const getBadgeClass = () => {
    switch (norm) {
      case 'junior':
      case 'nss_intern':
        return 'badge-seniority-junior';
      case 'senior':
        return 'badge-seniority-senior';
      case 'lead':
        return 'badge-seniority-lead';
      case 'director':
        return 'badge-seniority-director';
      case 'mid':
      default:
        return 'badge-seniority-mid';
    }
  };

  const getDotClass = () => {
    switch (norm) {
      case 'junior':
        return 'bg-[var(--color-success)]';
      case 'senior':
        return 'bg-[var(--color-strategic)]';
      case 'lead':
        return 'bg-[var(--color-warning)]';
      case 'director':
        return 'bg-[var(--color-critical)]';
      case 'mid':
      default:
        return 'bg-[var(--color-brand)]';
    }
  };

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold font-mono tracking-wide rounded-md border ${getBadgeClass()} ${sizeClasses} ${className}`}
      title={labelObj.description}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotClass()}`} />}
      <span>{labelObj.label.toUpperCase()}</span>
    </span>
  );
};
