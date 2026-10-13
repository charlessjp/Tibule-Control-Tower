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
      className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 transition-all duration-200 shadow-xs relative ${className}`}
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Top Row: PDF Report Calendar Implementation + Active Cycle indicator + Date Horizon Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {label && (
            <span className="text-[11px] font-mono font-bold text-text-tertiary hidden sm:inline uppercase">
              {label}:
            </span>
          )}

          {/* Unified Primary Calendar & Scope Trigger (Exact PDF Report Implementation) */}
          <ReportScopeCalendarPicker
            value={activeReportScope}
            onChange={handleReportScopeChange}
            activeTokens={activeTokens}
            referenceDate={referenceDate}
            isOpen={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
            headerTitle="Workspace Operating Horizon"
            headerSubtitle="Select custom date range or configure duration stepper (Days, Weeks, Months)."
          />

          {/* Active Operating Cycle Status Indicator */}
          {activePeriodConfig.isCurrent && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Cycle</span>
            </span>
          )}
        </div>

        {/* Right Info: Date Range & Deliverables Count */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary flex-wrap">
          <span className="font-medium text-text-secondary">{formattedDateRange}</span>
          {(matchedCount !== undefined || totalCount !== undefined) && (
            <>
              <span>•</span>
              <span className="font-semibold text-text-primary">
                {matchedCount !== undefined ? matchedCount : totalCount} deliverable
                {(matchedCount !== 1 && totalCount !== 1) ? 's' : ''} in scope
                {archivedCount > 0 && ` (${archivedCount} archived)`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick Period Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-mono text-text-tertiary mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {CALENDAR_PERIODS.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onPeriodChange(p.id);
                if (p.id === 'custom') {
                  setIsCalendarOpen(true);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'border font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-brand) 40%, transparent)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
              title={p.description}
            >
              {p.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
