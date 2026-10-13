import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CSActiveTimerWidget } from './CSActiveTimerWidget';
import { CSLogTimeModal } from './CSLogTimeModal';
import { CSDiscrepancyReconcileModal } from './CSDiscrepancyReconcileModal';
import { getCurrentOperatingWeekDates } from '../../data/clientServicesTimesheets';
import { CONFIRMED_CS_DISCIPLINES } from '../../data/clientServicesOperatingModel';
import {
  CSTimesheetEntry,
  CSDiscrepancyAlert,
  CSDisciplineId,
  DiscrepancyStatus
} from '../../types';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Building2,
  User,
  Filter,
  CheckSquare,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  DollarSign
} from 'lucide-react';

export const CSTimesheetsAuditView: React.FC = () => {
  const {
    timesheetEntries,
    discrepancyAlerts,
    deleteTimesheetEntry,
    adjustTimesheetHours,
    users,
    jobs,
    currentUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'timesheets' | 'discrepancies' | 'matrix'>('timesheets');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [discrepancyTypeFilter, setDiscrepancyTypeFilter] = useState<string>('all');
  const [discrepancyStatusFilter, setDiscrepancyStatusFilter] = useState<string>('all');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedDayForLog, setSelectedDayForLog] = useState<string | undefined>(undefined);
  const [auditModalAlert, setAuditModalAlert] = useState<CSDiscrepancyAlert | null>(null);

  // Client Services practitioners list
  const csMembers = useMemo(() => {
    return users.filter(
      (u) =>
        u.department === 'client_services' ||
        u.role === 'client_service' ||
        u.role === 'director' ||
        u.teamId === 'team-client-service'
    );
  }, [users]);

  // Operating week dates (Mon to Fri)
  const weekDates = useMemo(() => getCurrentOperatingWeekDates(), []);
  const weekDays = [
    { label: 'Monday', index: 0, date: weekDates[0] },
    { label: 'Tuesday', index: 1, date: weekDates[1] },
    { label: 'Wednesday', index: 2, date: weekDates[2] },
    { label: 'Thursday', index: 3, date: weekDates[3] },
    { label: 'Friday', index: 4, date: weekDates[4] }
  ];

  // Filtered timesheet entries
  const filteredEntries = useMemo(() => {
    return timesheetEntries.filter((e) => {
      if (selectedUserId !== 'all' && e.userId !== selectedUserId) return false;
      return true;
    });
  }, [timesheetEntries, selectedUserId]);

  // Overall Department Totals
  const totalDepartmentLoggedHours = useMemo(() => {
    return timesheetEntries.reduce((sum, e) => sum + e.hours, 0);
  }, [timesheetEntries]);

  const totalBaselineCapacity = csMembers.length * 40.0; // 40h universal baseline per practitioner

  // Discrepancy counts
  const overtimeAlerts = useMemo(() => {
    return discrepancyAlerts.filter((a) => a.type === 'overtime');
  }, [discrepancyAlerts]);

  const jobVarianceAlerts = useMemo(() => {
    return discrepancyAlerts.filter((a) => a.type === 'job_variance');
  }, [discrepancyAlerts]);

  const reconciledCount = useMemo(() => {
    return discrepancyAlerts.filter((a) => a.status === 'reconciled').length;
  }, [discrepancyAlerts]);

  const reconciliationRate = discrepancyAlerts.length > 0
    ? Math.round((reconciledCount / discrepancyAlerts.length) * 100)
    : 100;

  // Selected practitioner metrics
  const selectedUserMetrics = useMemo(() => {
    if (selectedUserId === 'all') return null;
    const user = csMembers.find((u) => u.id === selectedUserId);
    const userEntries = timesheetEntries.filter((e) => e.userId === selectedUserId);
    const totalHours = userEntries.reduce((sum, e) => sum + e.hours, 0);
    const accountMgmtHours = userEntries
      .filter((e) => e.disciplineId === 'account_management')
      .reduce((sum, e) => sum + e.hours, 0);
    const disciplineHours = totalHours - accountMgmtHours;
    const isOvertime = totalHours > 40.0;
    const overtimeHours = isOvertime ? Math.round((totalHours - 40.0) * 10) / 10 : 0;

    return {
      user,
      totalHours: Math.round(totalHours * 10) / 10,
      accountMgmtHours: Math.round(accountMgmtHours * 10) / 10,
      disciplineHours: Math.round(disciplineHours * 10) / 10,
      isOvertime,
      overtimeHours,
      utilizationPct: Math.round((totalHours / 40.0) * 100)
    };
  }, [selectedUserId, csMembers, timesheetEntries]);

  // Filtered discrepancies list
  const filteredDiscrepancies = useMemo(() => {
    return discrepancyAlerts.filter((a) => {
      if (discrepancyTypeFilter !== 'all' && a.type !== discrepancyTypeFilter) return false;
      if (discrepancyStatusFilter !== 'all' && a.status !== discrepancyStatusFilter) return false;
      if (selectedUserId !== 'all' && a.userId !== selectedUserId) return false;
      return true;
    });
  }, [discrepancyAlerts, discrepancyTypeFilter, discrepancyStatusFilter, selectedUserId]);

  const openLogForDay = (dateStr?: string) => {
    setSelectedDayForLog(dateStr);
    setIsLogModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Department Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Universal 40h Baseline */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              40h Capacity Baseline
            </span>
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-text-primary">
              {Math.round(totalDepartmentLoggedHours * 10) / 10}h
            </span>
            <span className="text-xs font-mono text-text-secondary">
              / {totalBaselineCapacity}h pool
            </span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Universal 40.0h capacity pool across {csMembers.length} practitioners.
          </p>
        </div>

        {/* Active Overtime (>40h) */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Overtime Flagged (&gt;40h)
            </span>
            <span className={`p-1.5 rounded-lg ${overtimeAlerts.length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${overtimeAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {overtimeAlerts.length}
            </span>
            <span className="text-xs font-mono text-text-secondary">
              practitioners
            </span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Exceeding weekly 40.0h capacity threshold.
          </p>
        </div>

        {/* Job Allocation Overburn (>25%) */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Brief Overburn Variances
            </span>
            <span className={`p-1.5 rounded-lg ${jobVarianceAlerts.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${jobVarianceAlerts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {jobVarianceAlerts.length}
            </span>
            <span className="text-xs font-mono text-text-secondary">
              briefs &gt;25% overburn
            </span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Logged hours exceeding initial brief estimates.
          </p>
        </div>

        {/* Manager Audit Rate */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Discrepancy Audit Rate
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {reconciliationRate}%
            </span>
            <span className="text-xs font-mono text-text-secondary">
              ({reconciledCount}/{discrepancyAlerts.length} reconciled)
            </span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Manager reviewed and reconciled variances.
          </p>
        </div>
      </div>

      {/* 2. Embedded Live Stopwatch Activity Widget */}
      <CSActiveTimerWidget onOpenLogModal={() => openLogForDay()} />

      {/* 3. Practitioner Filter Bar & 40h Baseline Indicator */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase text-text-tertiary">
              Practitioner:
            </span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="p-2 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs font-medium focus:outline-none focus:border-brand"
            >
              <option value="all">All Client Services Practitioners ({csMembers.length})</option>
              {csMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.jobTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setActiveSubTab('timesheets')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'timesheets'
                  ? 'bg-brand text-brand-contrast shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Daily Timesheets (5-Day Grid)
            </button>
            <button
              onClick={() => setActiveSubTab('discrepancies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'discrepancies'
                  ? 'bg-brand text-brand-contrast shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Discrepancy Audit</span>
              {discrepancyAlerts.filter((a) => a.status === 'flagged').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'matrix'
                  ? 'bg-brand text-brand-contrast shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              40h Capacity Matrix
            </button>
          </div>
        </div>

        {/* Selected Practitioner 40h Baseline Gauge (if individual selected) */}
        {selectedUserMetrics && (
          <div className="pt-3 border-t border-border/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">
                  {selectedUserMetrics.user?.name}
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  ({selectedUserMetrics.user?.jobTitle})
                </span>
                {selectedUserMetrics.isOvertime ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    +{selectedUserMetrics.overtimeHours}h Overtime Flagged
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    On Track (40.0h Baseline)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
                <span>Account Mgmt: <strong className="text-text-primary">{selectedUserMetrics.accountMgmtHours}h</strong></span>
                <span>•</span>
                <span>Disciplines: <strong className="text-text-primary">{selectedUserMetrics.disciplineHours}h</strong></span>
                <span>•</span>
                <span>Total: <strong className="text-text-primary">{selectedUserMetrics.totalHours}h</strong> / 40.0h</span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full bg-surface-elevated h-2.5 rounded-full overflow-hidden flex border border-border">
              <div
                className="h-full bg-brand transition-all"
                style={{
                  width: `${Math.min(100, Math.round((selectedUserMetrics.accountMgmtHours / 40) * 100))}%`
                }}
                title={`Account Management: ${selectedUserMetrics.accountMgmtHours}h`}
              />
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(100, Math.round((selectedUserMetrics.disciplineHours / 40) * 100))}%`
                }}
                title={`Discipline Execution: ${selectedUserMetrics.disciplineHours}h`}
              />
              {selectedUserMetrics.isOvertime && (
                <div
                  className="h-full bg-red-500 animate-pulse transition-all"
                  style={{
                    width: `${Math.min(30, Math.round((selectedUserMetrics.overtimeHours / 40) * 100))}%`
                  }}
                  title={`Overtime: +${selectedUserMetrics.overtimeHours}h`}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. SUB-TAB 1: 5-Day Mon-Fri Daily Timesheet Strip & Grid */}
      {activeSubTab === 'timesheets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
              <Calendar className="w-4 h-4" />
              <span>Current Operating Horizon (Monday – Friday)</span>
            </div>
            <button
              onClick={() => openLogForDay()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Hours</span>
            </button>
          </div>

          {/* 5-Day Mon-Fri Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {weekDays.map((day) => {
              const dayEntries = filteredEntries.filter((e) => e.date === day.date);
              const dayTotalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
              const isOver8h = dayTotalHours > 8.0;

              return (
                <div
                  key={day.index}
                  className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col justify-between shadow-xs min-h-[380px]"
                >
                  {/* Day Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-text-primary block">
                          {day.label}
                        </span>
                        <span className="text-[10px] font-mono text-text-tertiary">
                          {day.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                            isOver8h
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-surface-elevated text-text-primary border border-border'
                          }`}
                        >
                          {dayTotalHours}h
                        </span>
                        <span className="text-[9px] font-mono text-text-tertiary block mt-0.5">
                          / 8.0h std
                        </span>
                      </div>
                    </div>

                    {/* Entries List */}
                    <div className="space-y-2.5">
                      {dayEntries.length === 0 ? (
                        <div className="py-8 text-center text-text-tertiary text-xs">
                          <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
                          <span>No time logged</span>
                        </div>
                      ) : (
                        dayEntries.map((entry) => {
                          const discDef = CONFIRMED_CS_DISCIPLINES.find((d) => d.id === entry.disciplineId);

                          return (
                            <div
                              key={entry.id}
                              className="bg-surface-elevated border border-border rounded-xl p-2.5 text-xs space-y-1.5 hover:border-brand/40 transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-mono font-bold text-text-primary text-xs">
                                  {entry.hours}h
                                </span>
                                <div className="flex items-center gap-1">
                                  {entry.isBillable && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      BILLABLE
                                    </span>
                                  )}
                                  <button
                                    onClick={() => deleteTimesheetEntry(entry.id)}
                                    title="Delete Entry"
                                    className="text-text-tertiary hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="font-semibold text-text-primary truncate" title={entry.jobTitle}>
                                {entry.jobTitle}
                              </div>

                              <div className="flex items-center gap-1 flex-wrap">
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium truncate max-w-[120px]"
                                  style={{
                                    backgroundColor: discDef ? `${discDef.badgeColor}20` : 'rgba(255,255,255,0.05)',
                                    color: discDef ? discDef.badgeColor : 'var(--color-text-secondary)',
                                    border: `1px solid ${discDef ? `${discDef.badgeColor}40` : 'var(--color-border)'}`
                                  }}
                                >
                                  {discDef?.name || 'Account Mgmt'}
                                </span>
                                <span className="text-[10px] text-text-tertiary truncate">
                                  {entry.clientName}
                                </span>
                              </div>

                              <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                                {entry.description}
                              </p>

                              {/* Quick Adjustment Buttons (+15m, +30m, +1h) */}
                              <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                                <span>Adjust:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => adjustTimesheetHours(entry.id, 0.25)}
                                    className="px-1.5 py-0.5 rounded bg-surface border border-border hover:text-text-primary hover:border-brand/40 cursor-pointer"
                                  >
                                    +15m
                                  </button>
                                  <button
                                    onClick={() => adjustTimesheetHours(entry.id, 0.5)}
                                    className="px-1.5 py-0.5 rounded bg-surface border border-border hover:text-text-primary hover:border-brand/40 cursor-pointer"
                                  >
                                    +30m
                                  </button>
                                  <button
                                    onClick={() => adjustTimesheetHours(entry.id, 1.0)}
                                    className="px-1.5 py-0.5 rounded bg-surface border border-border hover:text-text-primary hover:border-brand/40 cursor-pointer"
                                  >
                                    +1h
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Add Entry for this day button */}
                  <button
                    onClick={() => openLogForDay(day.date)}
                    className="mt-3 w-full py-1.5 text-center text-xs font-semibold rounded-xl border border-dashed border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Time</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 2: Discrepancy Audit Dashboard */}
      {activeSubTab === 'discrepancies' && (
        <div className="space-y-4">
          {/* Discrepancy Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase text-text-tertiary">Type:</span>
              <select
                value={discrepancyTypeFilter}
                onChange={(e) => setDiscrepancyTypeFilter(e.target.value)}
                className="p-1.5 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs focus:outline-none focus:border-brand"
              >
                <option value="all">All Discrepancy Types</option>
                <option value="overtime">Overtime (&gt;40h Capacity Baseline)</option>
                <option value="job_variance">Job Allocation Overburn (&gt;25%)</option>
                <option value="discipline_drift">Functional Discipline Drift</option>
              </select>

              <span className="text-xs font-mono uppercase text-text-tertiary ml-2">Status:</span>
              <select
                value={discrepancyStatusFilter}
                onChange={(e) => setDiscrepancyStatusFilter(e.target.value)}
                className="p-1.5 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs focus:outline-none focus:border-brand"
              >
                <option value="all">All Audit Statuses</option>
                <option value="flagged">Flagged (Unresolved)</option>
                <option value="under_review">Under Review</option>
                <option value="reconciled">Reconciled</option>
              </select>
            </div>

            <span className="text-xs font-mono text-text-tertiary">
              Showing {filteredDiscrepancies.length} discrepancy items
            </span>
          </div>

          {/* Discrepancy Items List */}
          <div className="space-y-3">
            {filteredDiscrepancies.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-tertiary">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <h4 className="text-sm font-bold text-text-primary">No Discrepancies Found</h4>
                <p className="text-xs text-text-secondary mt-1">
                  All Client Services timesheets and job allocations are within compliant 40-hour and budget parameters.
                </p>
              </div>
            ) : (
              filteredDiscrepancies.map((alert) => {
                const statusBadge =
                  alert.status === 'reconciled'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : alert.status === 'under_review'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20';

                return (
                  <div
                    key={alert.id}
                    className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-3 hover:border-brand/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md bg-surface-elevated border border-border text-text-primary font-bold">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${statusBadge}`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-text-primary">
                          {alert.userName}
                        </span>
                        <span className="text-[11px] font-mono text-text-tertiary">
                          ({alert.userRole})
                        </span>
                      </div>

                      <button
                        onClick={() => setAuditModalAlert(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-surface-elevated text-text-primary hover:border-brand/50 transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-brand" />
                        <span>Audit &amp; Reconcile</span>
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary">
                      {alert.title}
                    </h4>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Numeric Variance Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-text-tertiary block">Planned / Baseline</span>
                        <span className="font-bold text-text-primary">{alert.plannedHours}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-tertiary block">Actual Logged</span>
                        <span className="font-bold text-text-primary">{alert.actualHours}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-tertiary block">Variance</span>
                        <span className={`font-bold ${alert.varianceHours > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {alert.varianceHours > 0 ? `+${alert.varianceHours}h` : `${alert.varianceHours}h`} ({alert.variancePercentage}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-tertiary block">Weekly Load</span>
                        <span className="font-bold text-text-primary">{alert.weeklyTotalHours}h</span>
                      </div>
                    </div>

                    {/* Audit Notes if present */}
                    {alert.auditNotes && (
                      <div className="bg-surface-elevated rounded-xl p-2.5 text-xs border border-border/60 text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-text-primary block text-[11px]">Audit Decision Note:</strong>
                          <span>{alert.auditNotes}</span>
                          {alert.reconciledByName && (
                            <span className="text-[10px] font-mono text-text-tertiary block mt-0.5">
                              Audited by {alert.reconciledByName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 3: Department 40h Capacity Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Client Services 40-Hour Capacity Baseline Matrix
              </h3>
              <p className="text-xs text-text-secondary">
                Department-wide breakdown of 40h pools across Account Management vs Specialist Disciplines.
              </p>
            </div>
            <span className="text-xs font-mono text-text-tertiary">
              {csMembers.length} Practitioners
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border/60">
              <thead className="bg-surface-elevated text-text-tertiary font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Practitioner &amp; Role</th>
                  <th className="py-3 px-4">Baseline Pool</th>
                  <th className="py-3 px-4">Logged Total</th>
                  <th className="py-3 px-4">Account Mgmt</th>
                  <th className="py-3 px-4">Specialist Disciplines</th>
                  <th className="py-3 px-4">Utilization</th>
                  <th className="py-3 px-4">Discrepancy Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {csMembers.map((member) => {
                  const mEntries = timesheetEntries.filter((e) => e.userId === member.id);
                  const total = mEntries.reduce((sum, e) => sum + e.hours, 0);
                  const acct = mEntries.filter((e) => e.disciplineId === 'account_management').reduce((sum, e) => sum + e.hours, 0);
                  const disc = total - acct;
                  const util = Math.round((total / 40.0) * 100);
                  const isOvertime = total > 40.0;
                  const userAlerts = discrepancyAlerts.filter((a) => a.userId === member.id && a.status !== 'reconciled');

                  return (
                    <tr key={member.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-text-primary block">{member.name}</span>
                        <span className="text-[11px] text-text-tertiary">{member.jobTitle}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">40.0h</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${isOvertime ? 'text-red-400' : 'text-text-primary'}`}>
                          {Math.round(total * 10) / 10}h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{Math.round(acct * 10) / 10}h</td>
                      <td className="py-3 px-4 text-text-secondary">{Math.round(disc * 10) / 10}h</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${util > 100 ? 'text-red-400' : util >= 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {util}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {isOvertime ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            Overtime (+{Math.round((total - 40.0) * 10) / 10}h)
                          </span>
                        ) : userAlerts.length > 0 ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {userAlerts.length} Variances
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserId(member.id);
                            setActiveSubTab('timesheets');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-border hover:border-brand text-text-primary transition-colors cursor-pointer"
                        >
                          View Timesheet
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Time Modal */}
      <CSLogTimeModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultDate={selectedDayForLog}
        defaultUserId={selectedUserId !== 'all' ? selectedUserId : undefined}
      />

      {/* Discrepancy Reconcile Modal */}
      <CSDiscrepancyReconcileModal
        alert={auditModalAlert}
        isOpen={!!auditModalAlert}
        onClose={() => setAuditModalAlert(null)}
      />
    </div>
  );
};
