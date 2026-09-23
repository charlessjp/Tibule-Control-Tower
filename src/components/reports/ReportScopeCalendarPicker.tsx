import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  RotateCcw,
  Check,
  X,
  Sliders,
  CalendarRange,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  ReportDateScope,
  ScopeUnit,
  calculateDateRangeFromUnit,
  formatIsoDate,
  formatDisplayDate
} from '../../utils/performanceReportEngine';
import { ThemeModeTokens } from '../../theme/palettes';

interface ReportScopeCalendarPickerProps {
  value: ReportDateScope;
  onChange: (newScope: ReportDateScope) => void;
  activeTokens: ThemeModeTokens;
  referenceDate?: Date; // Default 2026-09-22
}

export const ReportScopeCalendarPicker: React.FC<ReportScopeCalendarPickerProps> = ({
  value,
  onChange,
  activeTokens: propTokens,
  referenceDate = new Date(2026, 8, 22) // Anchor to mock current date 2026-09-22
}) => {
  // Normalize tokens so activeTokens.surface, activeTokens.surfaceElevated, and activeTokens.base resolve cleanly
  const activeTokens = useMemo(() => {
    return {
      ...propTokens,
      surface: (propTokens as any).surface || propTokens.bgSurface || 'var(--color-surface)',
      surfaceElevated: (propTokens as any).surfaceElevated || propTokens.bgSurfaceElevated || 'var(--color-surface-elevated)',
      base: (propTokens as any).base || propTokens.bgBase || 'var(--color-canvas)',
    };
  }, [propTokens]);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverShift, setPopoverShift] = useState<number>(0);

  // Active view in the popover: 'quick_units' | 'calendar'
  const [activeTab, setActiveTab] = useState<'quick_units' | 'calendar'>('quick_units');

  // Boundary-aware clamping: ensure date card never hangs outside the PDF modal review screen
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const clampPopoverToScreen = () => {
      if (!containerRef.current) return;
      const triggerRect = containerRef.current.getBoundingClientRect();
      const modalEl =
        containerRef.current.closest('.max-w-6xl') ||
        containerRef.current.closest('.rounded-2xl') ||
        document.body;
      const modalRect = modalEl.getBoundingClientRect();

      // Card width on desktop is ~490px, or constrained to window minus margins
      const targetCardWidth = Math.min(490, window.innerWidth - 32);
      const rightEdge = triggerRect.left + targetCardWidth;
      const maxAllowedRight = Math.min(window.innerWidth - 16, modalRect.right - 16);

      if (rightEdge > maxAllowedRight) {
        const diff = rightEdge - maxAllowedRight;
        const minAllowedLeft = Math.max(16, modalRect.left + 16);
        const newLeft = triggerRect.left - diff;
        if (newLeft < minAllowedLeft) {
          setPopoverShift(minAllowedLeft - triggerRect.left);
        } else {
          setPopoverShift(-diff);
        }
      } else {
        setPopoverShift(0);
      }
    };

    clampPopoverToScreen();
    window.addEventListener('resize', clampPopoverToScreen);
    return () => window.removeEventListener('resize', clampPopoverToScreen);
  }, [isOpen]);

  // Manual Stepper State: quantity and unit
  const [manualQuantity, setManualQuantity] = useState<number>(() => {
    return value.quantity && value.quantity > 0 ? value.quantity : 30;
  });
  const [manualUnit, setManualUnit] = useState<ScopeUnit>(() => {
    return value.unit || 'days';
  });

  // Calendar Picker Internal State: start and end ISO strings (YYYY-MM-DD)
  const [calStart, setCalStart] = useState<string>(() => {
    return value.startDate || formatIsoDate(new Date(referenceDate.getTime() - 30 * 86400000));
  });
  const [calEnd, setCalEnd] = useState<string>(() => {
    return value.endDate || formatIsoDate(referenceDate);
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Calendar Display Month / Year
  const [viewYear, setViewYear] = useState<number>(() => {
    if (value.startDate) {
      const d = new Date(value.startDate);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return referenceDate.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value.startDate) {
      const d = new Date(value.startDate);
      if (!isNaN(d.getTime())) return d.getMonth();
    }
    return referenceDate.getMonth();
  });

  // Keep internal state aligned when prop value changes
  useEffect(() => {
    if (value.quantity) setManualQuantity(value.quantity);
    if (value.unit) setManualUnit(value.unit);
    if (value.startDate) setCalStart(value.startDate);
    if (value.endDate) setCalEnd(value.endDate);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
      const dStr = formatIsoDate(prevMonthDate);
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === formatIsoDate(referenceDate)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const curDate = new Date(viewYear, viewMonth, i);
      const dStr = formatIsoDate(curDate);
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dStr === formatIsoDate(referenceDate)
      });
    }

    // Next month padding to fill complete weeks (up to 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(viewYear, viewMonth + 1, i);
      const dStr = formatIsoDate(nextDate);
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === formatIsoDate(referenceDate)
      });
    }

    return days;
  }, [viewYear, viewMonth, referenceDate]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar date click handler
  const handleCalendarDayClick = (dateStr: string) => {
    if (!calStart || (calStart && calEnd)) {
      // First click: start new range
      setCalStart(dateStr);
      setCalEnd('');
    } else {
      // Second click: set end date
      if (dateStr < calStart) {
        setCalEnd(calStart);
        setCalStart(dateStr);
      } else {
        setCalEnd(dateStr);
      }
    }
  };

  // Computed days between calStart and calEnd
  const activeDurationDays = useMemo(() => {
    if (!calStart || !calEnd) return 0;
    const s = new Date(calStart).getTime();
    const e = new Date(calEnd).getTime();
    const diff = Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24));
    return diff + 1; // inclusive
  }, [calStart, calEnd]);

  // Apply Manual Unit Stepper
  const handleApplyManualUnit = (qty: number, unit: ScopeUnit) => {
    const computed = calculateDateRangeFromUnit(qty, unit, referenceDate);
    onChange(computed);
    setCalStart(computed.startDate || '');
    setCalEnd(computed.endDate || '');
    setIsOpen(false);
  };

  // Apply Custom Calendar Range
  const handleApplyCustomCalendar = () => {
    const effectiveStart = calStart || formatIsoDate(new Date(referenceDate.getTime() - 30 * 86400000));
    const effectiveEnd = calEnd || calStart || formatIsoDate(referenceDate);

    // Auto sort
    const [startFinal, endFinal] = effectiveStart <= effectiveEnd
      ? [effectiveStart, effectiveEnd]
      : [effectiveEnd, effectiveStart];

    const diffDays = Math.round((new Date(endFinal).getTime() - new Date(startFinal).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let unitText = `${diffDays} Days`;
    if (diffDays >= 7 && diffDays % 7 === 0) {
      unitText = `${diffDays / 7} Weeks`;
    } else if (diffDays >= 365) {
      const years = (diffDays / 365).toFixed(1).replace('.0', '');
      unitText = `${years} Years`;
    }

    const customScope: ReportDateScope = {
      mode: 'custom',
      quantity: diffDays,
      unit: 'days',
      startDate: startFinal,
      endDate: endFinal,
      label: `Custom Scope: ${formatDisplayDate(startFinal)} – ${formatDisplayDate(endFinal)} (${unitText})`
    };

    onChange(customScope);
    setIsOpen(false);
  };

  // Quick Preset Handlers
  const handleSelectPreset = (preset: ReportDateScope) => {
    onChange(preset);
    if (preset.startDate) setCalStart(preset.startDate);
    if (preset.endDate) setCalEnd(preset.endDate);
    if (preset.quantity) setManualQuantity(preset.quantity);
    if (preset.unit) setManualUnit(preset.unit);
    setIsOpen(false);
  };

  // Quick Presets organized by category with generous spacing
  const quickDaysPresets = [
    { label: '7 Days', qty: 7, unit: 'days' as ScopeUnit, desc: 'Past week' },
    { label: '14 Days', qty: 14, unit: 'days' as ScopeUnit, desc: 'Two weeks' },
    { label: '30 Days', qty: 30, unit: 'days' as ScopeUnit, desc: 'Standard month' },
    { label: '60 Days', qty: 60, unit: 'days' as ScopeUnit, desc: 'Bi-monthly' },
    { label: '90 Days', qty: 90, unit: 'days' as ScopeUnit, desc: 'Quarterly window' }
  ];

  const quickWeeksMonthsPresets = [
    { label: '4 Weeks', qty: 4, unit: 'weeks' as ScopeUnit, desc: '28 days' },
    { label: '8 Weeks', qty: 8, unit: 'weeks' as ScopeUnit, desc: '56 days' },
    { label: '12 Weeks', qty: 12, unit: 'weeks' as ScopeUnit, desc: 'Quarter' },
    { label: '6 Months', qty: 6, unit: 'months' as ScopeUnit, desc: 'Half year' }
  ];

  const quickLongTermPresets = [
    { label: '1 Year', qty: 1, unit: 'years' as ScopeUnit, desc: 'Annual dossier' },
    { label: '2 Years', qty: 2, unit: 'years' as ScopeUnit, desc: 'Multi-year track' },
    {
      label: 'Q3 2026 Cycle',
      mode: 'q3',
      desc: 'Active agency quarter'
    },
    {
      label: 'Lifetime Record',
      mode: 'all',
      desc: 'All-time data'
    }
  ];

  // Calculated preview for stepper
  const currentPreview = useMemo(() => {
    return calculateDateRangeFromUnit(manualQuantity, manualUnit, referenceDate);
  }, [manualQuantity, manualUnit, referenceDate]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none"
        style={{
          borderColor: isOpen ? activeTokens.accentPrimary : activeTokens.border,
          backgroundColor: activeTokens.surfaceElevated,
          color: activeTokens.textPrimary
        }}
        title="Click to change report timeframe scope (days, weeks, years, or custom calendar dates)"
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center transition-colors border"
          style={{
            borderColor: `${activeTokens.accentPrimary}40`,
            backgroundColor: `${activeTokens.accentPrimary}18`,
            color: activeTokens.accentPrimary
          }}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </div>

        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-[11px] truncate max-w-[200px] sm:max-w-[260px]">
            {value.label.split('(')[0].trim() || 'Select Scope'}
          </span>
          <span
            className="text-[9px] font-mono opacity-75 truncate max-w-[220px]"
            style={{ color: activeTokens.textSecondary }}
          >
            {value.startDate && value.endDate
              ? `${value.startDate} → ${value.endDate}`
              : value.mode === 'all'
              ? 'Complete Archive'
              : 'Configured Scope'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ml-1 text-text-tertiary ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {/* Clamped Popover Panel: Never stretches outside PDF review screen */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-[calc(100vw-2rem)] sm:w-[480px] md:w-[490px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 shadow-2xl overflow-hidden backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${popoverShift}px`,
            backgroundColor: activeTokens.surfaceElevated,
            borderColor: activeTokens.border,
            color: activeTokens.textPrimary,
            boxShadow: '0 20px 45px -10px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b-2 flex items-center justify-between"
            style={{ borderColor: activeTokens.border }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  borderColor: `${activeTokens.accentPrimary}40`,
                  backgroundColor: `${activeTokens.accentPrimary}20`,
                  color: activeTokens.accentPrimary
                }}
              >
                <CalendarRange className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>Report Timeframe Scope</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold border"
                    style={{
                      borderColor: `${activeTokens.accentPrimary}30`,
                      backgroundColor: `${activeTokens.accentPrimary}15`,
                      color: activeTokens.accentPrimary
                    }}
                  >
                    Anchor: 2026-09-22
                  </span>
                </h4>
                <p className="text-[10px]" style={{ color: activeTokens.textSecondary }}>
                  Configure trailing duration (Days, Weeks, Years) or select calendar range.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg border hover:bg-black/10 dark:hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              style={{ borderColor: activeTokens.border }}
              title="Close picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className="grid grid-cols-2 p-2 gap-1.5 border-b-2"
            style={{
              backgroundColor: `${activeTokens.surface}90`,
              borderColor: activeTokens.border
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('quick_units')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer text-left ${
                activeTab === 'quick_units'
                  ? 'font-bold shadow-xs'
                  : 'hover:border-border text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'quick_units' ? activeTokens.surfaceElevated : `${activeTokens.surface}40`,
                borderColor:
                  activeTab === 'quick_units' ? activeTokens.accentPrimary : activeTokens.border,
                color:
                  activeTab === 'quick_units' ? activeTokens.textPrimary : activeTokens.textSecondary
              }}
            >
              <div
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  borderColor:
                    activeTab === 'quick_units'
                      ? activeTokens.accentPrimary
                      : `${activeTokens.border}`,
                  backgroundColor:
                    activeTab === 'quick_units'
                      ? `${activeTokens.accentPrimary}20`
                      : 'transparent',
                  color:
                    activeTab === 'quick_units'
                      ? activeTokens.accentPrimary
                      : activeTokens.textTertiary
                }}
              >
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-bold font-mono uppercase tracking-wide">
                  Duration Stepper
                </span>
                <span className="text-[9px] text-text-tertiary truncate">
                  Days, Weeks, Months, Years
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer text-left ${
                activeTab === 'calendar'
                  ? 'font-bold shadow-xs'
                  : 'hover:border-border text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'calendar' ? activeTokens.surfaceElevated : `${activeTokens.surface}40`,
                borderColor:
                  activeTab === 'calendar' ? activeTokens.accentPrimary : activeTokens.border,
                color:
                  activeTab === 'calendar' ? activeTokens.textPrimary : activeTokens.textSecondary
              }}
            >
              <div
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  borderColor:
                    activeTab === 'calendar'
                      ? activeTokens.accentPrimary
                      : `${activeTokens.border}`,
                  backgroundColor:
                    activeTab === 'calendar'
                      ? `${activeTokens.accentPrimary}20`
                      : 'transparent',
                  color:
                    activeTab === 'calendar'
                      ? activeTokens.accentPrimary
                      : activeTokens.textTertiary
                }}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-bold font-mono uppercase tracking-wide">
                  Interactive Calendar
                </span>
                <span className="text-[9px] text-text-tertiary truncate">
                  Exact start &amp; end dates
                </span>
              </div>
            </button>
          </div>

          {/* Body Content with Ample Spacing */}
          <div className="p-3.5 sm:p-4 space-y-3.5 max-h-[480px] overflow-y-auto">
            {activeTab === 'quick_units' ? (
              <div className="space-y-3.5">
                {/* Manual Stepper & Unit Frame */}
                <div
                  className="p-3.5 rounded-xl border-2 space-y-3 shadow-2xs"
                  style={{
                    backgroundColor: `${activeTokens.surface}40`,
                    borderColor: activeTokens.border
                  }}
                >
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: activeTokens.border }}>
                    <label className="text-xs font-mono uppercase font-bold text-text-secondary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                      <span>Configure Trailing Duration</span>
                    </label>
                    <div
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1"
                      style={{
                        borderColor: `${activeTokens.accentPrimary}40`,
                        backgroundColor: `${activeTokens.accentPrimary}15`,
                        color: activeTokens.accentPrimary
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Past {manualQuantity} {manualUnit}</span>
                    </div>
                  </div>

                  {/* Duration Stepper and Metric Pills */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    {/* Stepper Box */}
                    <div className="w-full sm:w-36 space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-tertiary block">
                        Quantity:
                      </label>
                      <div
                        className="flex items-center rounded-xl border-2 overflow-hidden shadow-2xs"
                        style={{
                          borderColor: activeTokens.border,
                          backgroundColor: activeTokens.surfaceElevated
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setManualQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1.5 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-r active:scale-95"
                          style={{ borderColor: activeTokens.border }}
                          title="Decrease duration"
                        >
                          –
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={3650}
                          value={manualQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setManualQuantity(isNaN(val) ? 1 : Math.max(1, val));
                          }}
                          className="flex-1 text-center text-xs font-mono font-bold bg-transparent py-1.5 outline-hidden"
                          style={{
                            color: activeTokens.textPrimary
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setManualQuantity((q) => q + 1)}
                          className="px-3 py-1.5 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-l active:scale-95"
                          style={{ borderColor: activeTokens.border }}
                          title="Increase duration"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Unit Selector Pills */}
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-tertiary block">
                        Time Metric Unit:
                      </label>
                      <div
                        className="grid grid-cols-4 rounded-xl border-2 p-1 gap-1"
                        style={{
                          borderColor: activeTokens.border,
                          backgroundColor: activeTokens.surfaceElevated
                        }}
                      >
                        {(['days', 'weeks', 'months', 'years'] as ScopeUnit[]).map((u) => {
                          const isSelected = manualUnit === u;
                          return (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setManualUnit(u)}
                              className={`py-1.5 px-1 rounded-lg capitalize text-xs font-semibold font-mono transition-all cursor-pointer text-center border ${
                                isSelected
                                  ? 'font-bold shadow-xs border-transparent'
                                  : 'hover:border-border text-text-secondary hover:text-text-primary border-transparent'
                              }`}
                              style={{
                                backgroundColor: isSelected ? activeTokens.accentPrimary : 'transparent',
                                color: isSelected ? '#ffffff' : activeTokens.textSecondary
                              }}
                            >
                              {u}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Window Preview & Apply Button */}
                  <div
                    className="p-3 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
                    style={{
                      borderColor: activeTokens.border,
                      backgroundColor: activeTokens.surfaceElevated
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <div
                        className="w-6 h-6 rounded-md border flex items-center justify-center shrink-0"
                        style={{
                          borderColor: `${activeTokens.accentPrimary}30`,
                          backgroundColor: `${activeTokens.accentPrimary}15`,
                          color: activeTokens.accentPrimary
                        }}
                      >
                        <CalendarIcon className="w-3 h-3" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[9px] text-text-tertiary uppercase font-bold">
                          Calculated Audit Window:
                        </div>
                        <div className="font-semibold text-text-primary text-xs flex items-center gap-1.5 flex-wrap">
                          <span>{currentPreview.startDate}</span>
                          <ArrowRight className="w-3 h-3 text-text-tertiary inline" />
                          <span>{currentPreview.endDate}</span>
                          <span
                            className="text-[9px] font-mono px-1 py-0.2 rounded border font-bold"
                            style={{
                              borderColor: activeTokens.border,
                              backgroundColor: `${activeTokens.surface}60`,
                              color: activeTokens.accentPrimary
                            }}
                          >
                            {manualQuantity} {manualUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyManualUnit(manualQuantity, manualUnit)}
                      className="px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer text-white shrink-0"
                      style={{ backgroundColor: activeTokens.accentPrimary }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Scope</span>
                    </button>
                  </div>
                </div>

                {/* Instant Duration Presets by Category */}
                <div
                  className="p-3.5 rounded-xl border-2 space-y-3"
                  style={{
                    backgroundColor: `${activeTokens.surface}30`,
                    borderColor: activeTokens.border
                  }}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase font-bold text-text-secondary flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-text-tertiary" />
                      <span>Quick Duration Presets</span>
                    </label>
                    <span className="text-[9px] font-mono text-text-tertiary">
                      Click to apply
                    </span>
                  </div>

                  {/* Day Presets */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-text-tertiary block">
                      Days Granularity:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {quickDaysPresets.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            const calc = calculateDateRangeFromUnit(p.qty, p.unit, referenceDate);
                            handleSelectPreset(calc);
                          }}
                          className="px-2 py-1.5 rounded-lg border text-xs font-medium flex flex-col items-center justify-center hover:scale-102 hover:shadow-xs transition-all cursor-pointer text-center group"
                          style={{
                            borderColor: activeTokens.border,
                            backgroundColor: activeTokens.surfaceElevated,
                            color: activeTokens.textPrimary
                          }}
                        >
                          <span className="font-bold font-mono text-xs group-hover:text-brand transition-colors">
                            {p.label}
                          </span>
                          <span className="text-[8px] text-text-tertiary font-mono truncate">
                            {p.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weeks & Months Presets */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-text-tertiary block">
                      Weeks &amp; Monthly Blocks:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {quickWeeksMonthsPresets.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            const calc = calculateDateRangeFromUnit(p.qty, p.unit, referenceDate);
                            handleSelectPreset(calc);
                          }}
                          className="px-2 py-1.5 rounded-lg border text-xs font-medium flex flex-col items-center justify-center hover:scale-102 hover:shadow-xs transition-all cursor-pointer text-center group"
                          style={{
                            borderColor: activeTokens.border,
                            backgroundColor: activeTokens.surfaceElevated,
                            color: activeTokens.textPrimary
                          }}
                        >
                          <span className="font-bold font-mono text-xs group-hover:text-brand transition-colors">
                            {p.label}
                          </span>
                          <span className="text-[8px] text-text-tertiary font-mono truncate">
                            {p.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Years & Agency Cycles */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-text-tertiary block">
                      Annual Tracks &amp; Special Cycles:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {quickLongTermPresets.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            if (p.mode === 'q3') {
                              handleSelectPreset({
                                mode: 'preset',
                                startDate: '2026-07-01',
                                endDate: '2026-09-30',
                                label: 'Q3 2026 Active Cycle (Jul 1 – Sep 30, 2026)'
                              });
                            } else if (p.mode === 'all') {
                              handleSelectPreset({
                                mode: 'all',
                                label: 'Complete Lifetime Record'
                              });
                            } else if (p.qty && p.unit) {
                              const calc = calculateDateRangeFromUnit(p.qty, p.unit, referenceDate);
                              handleSelectPreset(calc);
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg border text-xs font-medium flex flex-col items-center justify-center hover:scale-102 hover:shadow-xs transition-all cursor-pointer text-center group"
                          style={{
                            borderColor: activeTokens.border,
                            backgroundColor: activeTokens.surfaceElevated,
                            color: activeTokens.textPrimary
                          }}
                        >
                          <span className="font-bold font-mono text-xs group-hover:text-brand transition-colors">
                            {p.label}
                          </span>
                          <span className="text-[8px] text-text-tertiary font-mono truncate">
                            {p.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Calendar Grid Tab - Compact, Spacious & Fully Bordered */
              <div
                className="p-3.5 rounded-xl border-2 space-y-3 shadow-2xs"
                style={{
                  backgroundColor: `${activeTokens.surface}40`,
                  borderColor: activeTokens.border
                }}
              >
                {/* Month / Year Navigator Toolbar */}
                <div
                  className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: activeTokens.surfaceElevated,
                    borderColor: activeTokens.border
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-sm">
                      {monthNames[viewMonth]} {viewYear}
                    </span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border"
                      style={{
                        borderColor: `${activeTokens.accentPrimary}30`,
                        backgroundColor: `${activeTokens.accentPrimary}15`,
                        color: activeTokens.accentPrimary
                      }}
                    >
                      Audit Month
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="px-2 py-1 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
                      style={{ borderColor: activeTokens.border }}
                      title="Previous month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMonth(referenceDate.getMonth());
                        setViewYear(referenceDate.getFullYear());
                      }}
                      className="px-2 py-1 text-[11px] font-mono uppercase font-bold rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      style={{ borderColor: activeTokens.border }}
                      title="Jump to reference anchor date"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="px-2 py-1 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
                      style={{ borderColor: activeTokens.border }}
                      title="Next month"
                    >
                      <span className="hidden sm:inline text-[11px]">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Days Matrix Box */}
                <div
                  className="p-2.5 rounded-xl border space-y-1.5"
                  style={{
                    backgroundColor: activeTokens.surfaceElevated,
                    borderColor: activeTokens.border
                  }}
                >
                  {/* Day of week headers */}
                  <div
                    className="grid grid-cols-7 text-center text-[10px] font-mono font-bold uppercase tracking-wider py-1 border-b"
                    style={{ borderColor: activeTokens.border, color: activeTokens.textSecondary }}
                  >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="py-0.5">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar 42-cell matrix */}
                  <div className="grid grid-cols-7 gap-1 pt-1">
                    {calendarDays.map((cd, index) => {
                      const isStart = calStart === cd.dateStr;
                      const isEnd = calEnd === cd.dateStr;
                      const effectiveRangeEnd = calEnd || hoverDate;

                      const inRange =
                        calStart &&
                        effectiveRangeEnd &&
                        cd.dateStr > (calStart < effectiveRangeEnd ? calStart : effectiveRangeEnd) &&
                        cd.dateStr < (calStart < effectiveRangeEnd ? effectiveRangeEnd : calStart);

                      const isSelectedEndpoint = isStart || isEnd;

                      return (
                        <button
                          key={`${cd.dateStr}-${index}`}
                          type="button"
                          onClick={() => handleCalendarDayClick(cd.dateStr)}
                          onMouseEnter={() => {
                            if (calStart && !calEnd) {
                              setHoverDate(cd.dateStr);
                            }
                          }}
                          onMouseLeave={() => setHoverDate(null)}
                          className={`h-8 sm:h-8.5 rounded-lg text-xs font-mono relative flex items-center justify-center transition-all cursor-pointer border ${
                            !cd.isCurrentMonth ? 'opacity-30' : ''
                          }`}
                          style={{
                            backgroundColor: isSelectedEndpoint
                              ? activeTokens.accentPrimary
                              : inRange
                              ? `${activeTokens.accentPrimary}20`
                              : 'transparent',
                            borderColor: isSelectedEndpoint
                              ? activeTokens.accentPrimary
                              : inRange
                              ? `${activeTokens.accentPrimary}40`
                              : cd.isToday
                              ? activeTokens.accentPrimary
                              : activeTokens.border,
                            color: isSelectedEndpoint
                              ? '#ffffff'
                              : inRange
                              ? activeTokens.accentPrimary
                              : activeTokens.textPrimary,
                            fontWeight: isSelectedEndpoint || cd.isToday ? 700 : 500,
                            boxShadow: isSelectedEndpoint
                              ? '0 2px 8px rgba(0,0,0,0.2)'
                              : 'none'
                          }}
                        >
                          {cd.dayNumber}
                          {cd.isToday && !isSelectedEndpoint && (
                            <div
                              className="absolute bottom-0.5 w-1 h-1 rounded-full"
                              style={{ backgroundColor: activeTokens.accentPrimary }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explicit Start/End Date Manual Inputs */}
                <div
                  className="p-2.5 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                  style={{
                    backgroundColor: activeTokens.surfaceElevated,
                    borderColor: activeTokens.border
                  }}
                >
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-mono text-text-tertiary uppercase font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Start Date (From):</span>
                    </label>
                    <input
                      type="date"
                      value={calStart}
                      onChange={(e) => setCalStart(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono font-bold bg-surface text-text-primary outline-hidden focus:border-brand"
                      style={{ borderColor: activeTokens.border }}
                    />
                    <div className="text-[9px] font-mono text-text-secondary truncate">
                      {calStart ? formatDisplayDate(calStart) : 'Pick start date'}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-mono text-text-tertiary uppercase font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      <span>End Date (To):</span>
                    </label>
                    <input
                      type="date"
                      value={calEnd}
                      onChange={(e) => setCalEnd(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono font-bold bg-surface text-text-primary outline-hidden focus:border-brand"
                      style={{ borderColor: activeTokens.border }}
                    />
                    <div className="text-[9px] font-mono text-text-secondary truncate">
                      {calEnd ? formatDisplayDate(calEnd) : 'Pick end date'}
                    </div>
                  </div>
                </div>

                {/* Instructions & Apply Button */}
                <div
                  className="p-2.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
                  style={{
                    borderColor: activeTokens.border,
                    backgroundColor: activeTokens.surfaceElevated
                  }}
                >
                  <div className="text-xs font-mono text-text-secondary">
                    {calStart && calEnd ? (
                      <div className="space-y-0.5">
                        <div className="text-[9px] text-text-tertiary uppercase font-bold">
                          Selected Custom Window:
                        </div>
                        <div className="font-semibold text-text-primary flex items-center gap-1.5 flex-wrap text-xs">
                          <span>{calStart}</span>
                          <ArrowRight className="w-3 h-3 text-text-tertiary inline" />
                          <span>{calEnd}</span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border font-bold"
                            style={{
                              borderColor: `${activeTokens.accentPrimary}40`,
                              backgroundColor: `${activeTokens.accentPrimary}15`,
                              color: activeTokens.accentPrimary
                            }}
                          >
                            {activeDurationDays} Days
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-text-tertiary italic">
                        Click on the calendar to select start and end dates.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCustomCalendar}
                    disabled={!calStart}
                    className="px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-white shrink-0"
                    style={{ backgroundColor: activeTokens.accentPrimary }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Date Range</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Popover Footer Active Summary Bar */}
          <div
            className="px-4 py-2.5 border-t-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono"
            style={{
              backgroundColor: `${activeTokens.surface}95`,
              borderColor: activeTokens.border
            }}
          >
            <div className="flex items-center gap-2 text-text-secondary truncate max-w-full sm:max-w-[320px]">
              <span className="font-bold text-text-primary uppercase text-[9px] tracking-wider shrink-0">
                Active:
              </span>
              <span className="truncate font-semibold text-text-primary text-[11px]">
                {value.label}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const defaultScope = calculateDateRangeFromUnit(30, 'days', referenceDate);
                  onChange(defaultScope);
                  setIsOpen(false);
                }}
                className="text-[10px] font-medium text-text-tertiary hover:text-text-primary flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: activeTokens.border }}
                title="Reset to default 30 days"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (30 Days)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
