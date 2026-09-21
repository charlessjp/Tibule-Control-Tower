import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, AlertCircle, AlertTriangle, Activity } from 'lucide-react';

export interface CapacityMeterProps {
  percent: number; // e.g., 75, 95, 108, 120
  hoursCommitted?: number;
  hoursContracted?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

export const CapacityMeter: React.FC<CapacityMeterProps> = ({
  percent,
  hoursCommitted,
  hoursContracted = 40,
  label = 'Operational Capacity',
  size = 'md',
  showLegend = false,
  className = ''
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Operational Pressure Bands (Not employee failure, but systemic pressure)
  let band: 'healthy' | 'watch' | 'pressure' | 'critical';
  let bandLabel: string;
  let bandDesc: string;
  let colorVar: string;
  let icon: React.ReactNode;

  if (percent <= 80) {
    band = 'healthy';
    bandLabel = 'Healthy (0–80%)';
    bandDesc = 'Within expected operating envelope';
    colorVar = 'var(--color-success)';
    icon = <ShieldCheck className="w-3.5 h-3.5" style={{ color: colorVar }} />;
  } else if (percent <= 100) {
    band = 'watch';
    bandLabel = 'Watch (80–100%)';
    bandDesc = 'High utilization near planned ceiling';
    colorVar = 'var(--color-info)';
    icon = <Activity className="w-3.5 h-3.5" style={{ color: colorVar }} />;
  } else if (percent <= 110) {
    band = 'pressure';
    bandLabel = 'Pressure (100–110%)';
    bandDesc = 'Capacity pressure detected · Monitor pacing';
    colorVar = 'var(--color-warning)';
    icon = <AlertTriangle className="w-3.5 h-3.5" style={{ color: colorVar }} />;
  } else {
    band = 'critical';
    bandLabel = 'Critical (110%+)';
    bandDesc = 'Urgent capacity overload · Rebalance advised';
    colorVar = 'var(--color-critical)';
    icon = <AlertCircle className="w-3.5 h-3.5" style={{ color: colorVar }} />;
  }

  // Segment count
  const totalSegments = 20;
  const filledSegments = Math.min(totalSegments, Math.round((percent / 120) * totalSegments));
  const normalizedFill = Math.min(100, Math.max(0, (percent / 125) * 100));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header Label & Metric */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="font-semibold truncate text-text-secondary">{label}</span>
        </div>

        <div className="flex items-baseline gap-1 shrink-0 font-mono">
          <span className="font-bold text-sm" style={{ color: colorVar }}>
            {Math.round(percent)}%
          </span>
          {hoursCommitted !== undefined && (
            <span className="text-[11px] text-text-tertiary">
              ({hoursCommitted}h / {hoursContracted}h)
            </span>
          )}
        </div>
      </div>

      {/* Segmented Operational Pressure Bar */}
      {size === 'sm' ? (
        <div
          className="h-1.5 w-full rounded-full overflow-hidden flex"
          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, percent)}%`,
              backgroundColor: colorVar
            }}
          />
        </div>
      ) : (
        <div className="space-y-1">
          {/* Segmented Track */}
          <div className="grid grid-cols-20 gap-0.5 h-2 w-full">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isFilled = idx < filledSegments;
              const segmentPct = (idx + 1) * (120 / totalSegments);
              let segmentColor = 'var(--color-success)';
              if (segmentPct > 110) segmentColor = 'var(--color-critical)';
              else if (segmentPct > 100) segmentColor = 'var(--color-warning)';
              else if (segmentPct > 80) segmentColor = 'var(--color-info)';

              return (
                <div
                  key={idx}
                  className="rounded-xs transition-colors duration-200"
                  style={{
                    backgroundColor: isFilled
                      ? segmentColor
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)'
                  }}
                  title={`Segment ${idx + 1}/${totalSegments} (~${Math.round(segmentPct)}%)`}
                />
              );
            })}
          </div>

          {/* Sub-label describing operational state */}
          <div className="flex items-center justify-between text-[10px] text-text-tertiary">
            <span className="truncate">{bandDesc}</span>
            <span className="font-mono uppercase font-medium">{band}</span>
          </div>
        </div>
      )}

      {/* Optional Educational Legend */}
      {showLegend && (
        <div
          className="mt-2.5 pt-2 border-t grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
            <span className="text-text-secondary">0–80% Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-info)' }} />
            <span className="text-text-secondary">80–100% Watch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
            <span className="text-text-secondary">100–110% Pressure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-critical)' }} />
            <span className="text-text-secondary">110%+ Critical</span>
          </div>
        </div>
      )}
    </div>
  );
};
