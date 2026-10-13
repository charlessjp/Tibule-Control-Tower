import React from 'react';
import { TrafficState } from '../../types';
import { CheckCircle2, TrendingUp, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface TrafficBadgeProps {
  state: TrafficState;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrafficBadge: React.FC<TrafficBadgeProps> = ({
  state,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const config = {
    clear: {
      label: 'Clear',
      desc: 'Capacity available, work on schedule',
      colorVar: 'var(--color-success)',
      textColor: 'text-text-secondary',
      icon: CheckCircle2,
      pulse: false
    },
    building: {
      label: 'Building',
      desc: 'Workload rising, healthy velocity',
      colorVar: 'var(--color-brand)',
      textColor: 'text-text-secondary',
      icon: TrendingUp,
      pulse: false
    },
    congested: {
      label: 'Congested',
      desc: 'High workload pressure, monitor milestones',
      colorVar: 'var(--color-warning)',
      textColor: 'text-text-primary',
      icon: AlertTriangle,
      pulse: false
    },
    critical: {
      label: 'Critical',
      desc: 'Capacity exceeded or urgent deadline risk',
      colorVar: 'var(--color-critical)',
      textColor: 'font-bold',
      icon: AlertOctagon,
      pulse: true
    },
    blocked: {
      label: 'Blocked',
      desc: 'Progress halted by external dependency',
      colorVar: 'var(--color-strategic)',
      textColor: 'text-text-primary',
      icon: ShieldAlert,
      pulse: false
    }
  }[state];

  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-xs font-semibold gap-1.5',
    lg: 'text-sm font-semibold gap-2'
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      id={`traffic-badge-${state}`}
      title={config.desc}
      className={`inline-flex items-center ${config.textColor} ${sizeClasses} ${className} select-none`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: config.colorVar }}
      />
      {showIcon && (
        <IconComponent
          className="w-3.5 h-3.5 opacity-90 shrink-0"
          style={{ color: config.colorVar }}
        />
      )}
      <span className="tracking-wider uppercase text-[11px] font-mono font-medium">
        {config.label}
      </span>
    </span>
  );
};
