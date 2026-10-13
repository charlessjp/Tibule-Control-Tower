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
      textClass: 'text-[var(--color-success)]',
      bars: 1,
      caption: 'Healthy runway buffer'
    },
    building: {
      label: 'Absorbing Load',
      pulseClass: 'bg-[var(--color-brand)]',
      textClass: 'text-[var(--color-brand)]',
      bars: 2,
      caption: 'Approaching optimal density'
    },
    congested: {
      label: 'Saturated',
      pulseClass: 'bg-[var(--color-warning)]',
      textClass: 'text-[var(--color-warning)]',
      bars: 3,
      caption: 'Buffer depleted'
    },
    critical: {
      label: 'Turbulence',
      pulseClass: 'bg-[var(--color-critical)]',
      textClass: 'text-[var(--color-critical)]',
      bars: 4,
      caption: 'SLA breach exposure'
    },
    blocked: {
      label: 'Dependency Hold',
      pulseClass: 'bg-slate-400',
      textClass: 'text-text-secondary',
      bars: 4,
      caption: 'External pipeline friction'
    }
  }[state] || {
    label: 'Flow Clear',
    pulseClass: 'bg-[var(--color-success)]',
    textClass: 'text-[var(--color-success)]',
    bars: 1,
    caption: 'Healthy runway buffer'
  };

  const sizeClasses = {
    sm: 'text-[10px] gap-1.5',
    md: 'text-xs gap-2',
    lg: 'text-sm gap-2.5'
  }[size];

  return (
    <div className={`inline-flex items-center font-mono font-bold ${config.textClass} ${sizeClasses}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseClass}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseClass}`} />
      </span>

      <span className="uppercase tracking-wider">{config.label}</span>

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
