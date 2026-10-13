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
      case 'nsp_intern':
        return 'badge-seniority-junior';
      case 'specialist':
      case 'mid':
        return 'badge-seniority-mid';
      case 'senior':
        return 'badge-seniority-senior';
      case 'art_director':
      case 'lead':
        return 'badge-seniority-lead';
      case 'associate_director':
        return 'badge-seniority-associate';
      case 'director':
        return 'badge-seniority-director';
      default:
        return 'badge-seniority-mid';
    }
  };

  const getDotClass = () => {
    switch (norm) {
      case 'junior':
      case 'nss_intern':
      case 'nsp_intern':
        return 'bg-[var(--color-success)]';
      case 'specialist':
      case 'mid':
        return 'bg-[var(--color-brand)]';
      case 'senior':
        return 'bg-[var(--color-strategic)]';
      case 'art_director':
      case 'lead':
        return 'bg-[var(--color-warning)]';
      case 'associate_director':
        return 'bg-[var(--color-strategic)]';
      case 'director':
        return 'bg-[var(--color-critical)]';
      default:
        return 'bg-[var(--color-brand)]';
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] gap-1',
    sm: 'text-[11px] gap-1.5',
    md: 'text-xs gap-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold font-mono tracking-wider ${getBadgeClass()} ${sizeClasses} ${className}`}
      title={labelObj.description}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotClass()}`} />}
      <span>{labelObj.label.toUpperCase()}</span>
    </span>
  );
};
