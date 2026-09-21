import React from 'react';
import { TrafficState } from '../../types';

interface TrafficPulseBadgeProps {
  state: TrafficState;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const TrafficPulseBadge: React.FC<TrafficPulseBadgeProps> = ({
  state,
  size = 'md',
  showDetails = true
}) => {
  const config = {
    clear: {
      label: 'Flow Clear',
      pulseClass: 'bg-[var(--color-success)]',
      bgClass: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30',
      bars: 1,
      caption: 'Healthy runway buffer'
    },
    building: {
      label: 'Absorbing Load',
      pulseClass: 'bg-[var(--color-brand)]',
      bgClass: 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] border-[var(--color-brand)]/35',
      bars: 2,
      caption: 'Approaching optimal density'
    },
    congested: {
      label: 'Saturated',
      pulseClass: 'bg-[var(--color-warning)]',
      bgClass: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30',
      bars: 3,
      caption: 'Buffer depleted'
    },
    critical: {
      label: 'Turbulence',
      pulseClass: 'bg-[var(--color-critical)]',
      bgClass: 'bg-[var(--color-critical)]/10 text-[var(--color-critical)] border-[var(--color-critical)]/30',
      bars: 4,
      caption: 'SLA breach exposure'
    },
    blocked: {
      label: 'Dependency Hold',
      pulseClass: 'bg-slate-400',
      bgClass: 'bg-surface-elevated text-text-secondary border-border',
      bars: 4,
      caption: 'External pipeline friction'
    }
  }[state] || {
    label: 'Flow Clear',
    pulseClass: 'bg-[var(--color-success)]',
    bgClass: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30',
    bars: 1,
    caption: 'Healthy runway buffer'
  };

  const sizeClasses = {
    sm: 'text-[10px] py-0.5 px-2 gap-1.5',
    md: 'text-xs py-1 px-2.5 gap-2',
    lg: 'text-sm py-1.5 px-3.5 gap-2.5'
  }[size];

  return (
    <div className={`inline-flex items-center rounded-md font-mono font-medium border ${config.bgClass} ${sizeClasses}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseClass}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseClass}`} />
      </span>

      <span className="font-semibold uppercase tracking-wider">{config.label}</span>

      {/* Mini flow meter bars */}
      <div className="flex items-center gap-0.5 ml-0.5 opacity-80">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-0.5 rounded-full transition-all ${
              bar <= config.bars
                ? size === 'sm' ? 'h-2 bg-current' : 'h-2.5 bg-current'
                : size === 'sm' ? 'h-1.5 bg-current/20' : 'h-1.5 bg-current/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
