import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import {
  CalendarPeriodKey,
  CALENDAR_PERIODS
} from '../../utils/calendarPeriodFilter';
import {
  ReportDateScope,
  formatDisplayDate
} from '../../utils/performanceReportEngine';
import { ReportScopeCalendarPicker } from '../reports/ReportScopeCalendarPicker';
import { useApp } from '../../context/AppContext';

export interface HomeDateFilterBarProps {
  period: CalendarPeriodKey;
  onPeriodChange: (period: CalendarPeriodKey) => void;
  customRange?: { startDate: string; endDate: string };
  onCustomRangeChange?: (range: { startDate: string; endDate: string }) => void;
  matchedCount?: number;
  archivedCount?: number;
  totalCount?: number;
  label?: string;
  className?: string;
  referenceDate?: Date;
}

export const HomeDateFilterBar: React.FC<HomeDateFilterBarProps> = ({
  period,
  onPeriodChange,
  customRange = { startDate: '2026-10-01', endDate: '2026-10-31' },
  onCustomRangeChange,
  matchedCount,
  archivedCount = 0,
  totalCount,
  label = 'Calendar Period',
  className = '',
  referenceDate = new Date(2026, 8, 22) // Mock studio anchor: 2026-09-22
}) => {
  const { currentPalette, theme } = useApp();
  const tokens = currentPalette[theme];

  // Harmonized theme tokens for calendar picker
  const activeTokens = useMemo(() => {
    return {
      ...tokens,
      surface: tokens.bgSurface || 'var(--color-surface)',
      surfaceElevated: tokens.bgSurfaceElevated || 'var(--color-surface-elevated)',
      base: tokens.bgBase || 'var(--color-canvas)',
      border: tokens.border || 'var(--color-border)',
      textPrimary: tokens.textPrimary || 'var(--color-text-primary)',
      textSecondary: tokens.textSecondary || 'var(--color-text-secondary)',
      textTertiary: tokens.textTertiary || 'var(--color-text-tertiary)',
      accentPrimary: tokens.accentPrimary || 'var(--color-brand)'
    };
  }, [tokens]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activePeriodConfig = useMemo(() => {
    return CALENDAR_PERIODS.find((p) => p.id === period) || CALENDAR_PERIODS[1];
  }, [period]);

  // Construct ReportDateScope representation synchronized with PDF report calendar engine
  const activeReportScope: ReportDateScope = useMemo(() => {
    if (period === 'custom') {
      return {
        mode: 'custom',
        startDate: customRange.startDate,
        endDate: customRange.endDate,
        label: `Custom Scope: ${formatDisplayDate(customRange.startDate)} – ${formatDisplayDate(customRange.endDate)}`
      };
    }
    if (period === 'q3_2026') {
      return {
        mode: 'preset',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        label: 'Q3 2026 (Third Quarter)'
      };
    }
    if (period === 'all_records') {
      return {
        mode: 'all',
        label: 'Complete Historical Archive'
      };
    }
    return {
      mode: 'custom',
      startDate: customRange?.startDate || '2026-10-01',
      endDate: customRange?.endDate || '2026-10-31',
      label: activePeriodConfig.label
    };
  }, [period, customRange, activePeriodConfig]);

  const handleReportScopeChange = (newScope: ReportDateScope) => {
    if (newScope.startDate && newScope.endDate) {
      if (onCustomRangeChange) {
        onCustomRangeChange({
          startDate: newScope.startDate,
          endDate: newScope.endDate
        });
      }
    }
    if (newScope.mode === 'all') {
      onPeriodChange('all_records');
    } else {
      onPeriodChange('custom');
    }
  };

  const formattedDateRange = useMemo(() => {
    if (period === 'custom') {
      return `${formatDisplayDate(customRange.startDate)} – ${formatDisplayDate(customRange.endDate)}`;
    }
    return activePeriodConfig.dateRange;
  }, [period, customRange, activePeriodConfig]);

  return (
    <div
      className={`rounded-xl border p-3 sm:p-3.5 transition-all duration-150 relative ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Operating Period & Unified Calendar Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            {label || 'Operating Period'}:
          </span>

          {/* Unified Primary Calendar & Scope Trigger */}
          <ReportScopeCalendarPicker
            value={activeReportScope}
            onChange={handleReportScopeChange}
            activeTokens={activeTokens}
            referenceDate={referenceDate}
            isOpen={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
            headerTitle="Operating Period Selection"
            headerSubtitle="Select custom date range or standard reporting period."
          />

          {/* Active Operating Cycle Status Indicator */}
          {activePeriodConfig.isCurrent && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active Cycle</span>
            </span>
          )}
        </div>

        {/* Deliverables Count */}
        {(matchedCount !== undefined || totalCount !== undefined) && (
          <div className="text-[11px] font-mono text-text-tertiary">
            <span className="text-text-secondary">
              <strong className="text-text-primary font-bold">{matchedCount !== undefined ? matchedCount : totalCount}</strong> deliverables
              {archivedCount > 0 && ` (${archivedCount} archived)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
