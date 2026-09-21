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
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
      icon: CheckCircle2
    },
    building: {
      label: 'Building',
      desc: 'Workload rising, healthy velocity',
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      icon: TrendingUp
    },
    congested: {
      label: 'Congested',
      desc: 'High workload pressure, monitor milestones',
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
      icon: AlertTriangle
    },
    critical: {
      label: 'Critical',
      desc: 'Capacity exceeded or urgent deadline risk',
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500 animate-pulse',
      icon: AlertOctagon
    },
    blocked: {
      label: 'Blocked',
      desc: 'Progress halted by external dependency',
      bg: 'bg-purple-500/10 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-500',
      icon: ShieldAlert
    }
  }[state];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2'
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      id={`traffic-badge-${state}`}
      title={config.desc}
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className} transition-colors select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5 opacity-90 shrink-0" />}
      <span className="tracking-wide uppercase text-[11px] font-semibold">{config.label}</span>
    </span>
  );
};
