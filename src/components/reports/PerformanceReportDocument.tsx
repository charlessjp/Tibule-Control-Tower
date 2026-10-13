import React from 'react';
import { UserPerformanceReportData } from '../../utils/performanceReportEngine';
import { formatRole, formatSeniority } from '../../utils/formatters';
import { PaletteScheme, PALETTES } from '../../theme/palettes';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  FileText,
  Users,
  Briefcase,
  CalendarCheck,
  Scale,
  FolderCheck,
  ExternalLink
} from 'lucide-react';

export interface PerformanceReportDocumentProps {
  report: UserPerformanceReportData;
  documentRef?: React.RefObject<HTMLDivElement | null>;
  themeMode?: 'light' | 'dark';
  palette?: PaletteScheme;
}

export const PerformanceReportDocument: React.FC<PerformanceReportDocumentProps> = ({
  report,
  documentRef,
  themeMode: propThemeMode,
  palette: propPalette
}) => {
  const { theme: appTheme, currentPalette: appPalette } = useApp();

  // Resolve theme mode and palette: prop overrides or fallback to active app theme
  const effectiveThemeMode: 'light' | 'dark' = propThemeMode || appTheme || 'light';
  const effectivePalette: PaletteScheme = propPalette || appPalette || PALETTES[0];
  const isDark = effectiveThemeMode === 'dark';

  // Get active color tokens for the selected palette and mode
  const tokens = effectivePalette[effectiveThemeMode];
  const { targetUser, reportingManager, generatedBy } = report;
  const isTraffic = Boolean(report.isTraffic && report.trafficMetrics);
  const tm = report.trafficMetrics;

  return (
    <div
      ref={documentRef}
      id="performance-report-print-root"
      data-theme={effectiveThemeMode}
      data-palette={effectivePalette.id}
      className={`report-mode-${effectiveThemeMode} w-full max-w-[850px] mx-auto p-6 sm:p-10 rounded-2xl shadow-xl border transition-colors`}
      style={{
        backgroundColor: tokens.bgBase,
        color: tokens.textPrimary,
        borderColor: tokens.border,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Editorial Header & Agency Branding */}
      <div
        data-report-section="true"
        className="report-page-section border-b pb-6 mb-6"
        style={{ borderColor: tokens.border }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="h-2.5 w-2.5 rounded-full inline-block shrink-0 shadow-xs"
                style={{
                  backgroundColor: tokens.accentPrimary,
                  boxShadow: `0 0 10px ${tokens.glowPrimary}`
                }}
              />
              <span
                className="text-[11px] font-mono tracking-wider uppercase font-bold"
                style={{ color: tokens.textSecondary }}
              >
                {isTraffic
                  ? 'Tibule Studio Operations & Governance • Traffic Architecture'
                  : 'Tibule Creative & Operations Group • Talent Governance'}
              </span>
              <span
                className="text-[10px] font-mono tracking-wider uppercase font-bold inline-flex items-center gap-1 shrink-0"
                style={{ color: tokens.accentPrimary }}
              >
                <span>•</span>
                <span>{effectivePalette.name} Colorway</span>
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: tokens.textPrimary }}
            >
              {isTraffic
                ? 'Studio Operations & Traffic Governance Dossier'
                : 'Talent Performance & Output Dossier'}
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: tokens.textSecondary }}
            >
              {isTraffic ? (
                <>
                  Operational Scope: <strong style={{ color: tokens.textPrimary }}>{report.periodLabel}</strong> • Governance Hash: <span className="font-mono">{report.reportReferenceId}</span>
                </>
              ) : (
                <>
                  Audit Scope: <strong style={{ color: tokens.textPrimary }}>{report.periodLabel}</strong> • Verification ID: <span className="font-mono">{report.reportReferenceId}</span>
                </>
              )}
            </p>
          </div>

          {/* Security & Verification Stamp */}
          <div className="sm:text-right shrink-0">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold tracking-wider whitespace-nowrap shrink-0"
              style={{ color: tokens.semantic.success }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isTraffic ? 'Verified Operations Audit' : 'Verified Audit Record'}</span>
            </div>
            <div
              className="text-[10px] font-mono mt-1 whitespace-nowrap"
              style={{ color: tokens.textTertiary }}
            >
              Generated {new Date(report.generatedAt).toLocaleDateString()} at {new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Employee Identity Grid */}
        <div
          className="mt-6 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{
            backgroundColor: tokens.bgSurfaceElevated,
            borderColor: tokens.border
          }}
        >
          <div>
            <div
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              {isTraffic ? 'Traffic Lead' : 'Employee Name'}
            </div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {targetUser.name}
            </div>
            <div
              className="text-xs"
              style={{ color: tokens.textSecondary }}
            >
              {targetUser.jobTitle || formatRole(targetUser.role)}
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Seniority &amp; Dept
            </div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {formatSeniority(targetUser.seniority)} Tier
            </div>
            <div
              className="text-xs capitalize"
              style={{ color: tokens.textSecondary }}
            >
              {isTraffic
                ? 'Studio Traffic & Operations'
                : targetUser.department
                ? targetUser.department.replace('_', ' ')
                : 'Studio Creative'}
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Reporting Superior
            </div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {reportingManager ? reportingManager.name : 'Marcus Sterling'}
            </div>
            <div
              className="text-xs"
              style={{ color: tokens.textSecondary }}
            >
              {reportingManager ? formatRole(reportingManager.role) : 'Direct GM Oversight'}
            </div>
          </div>

          <div>
            <div
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Audit Requested By
            </div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {generatedBy.name}
            </div>
            <div
              className="text-xs"
              style={{ color: tokens.textSecondary }}
            >
              {formatRole(generatedBy.role)} {generatedBy.id === targetUser.id ? '(Self Audit)' : '(Supervisor)'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE A: TRAFFIC OPERATIONS DOSSIER (STUDIO FLOW & GOVERNANCE)           */}
      {/* ========================================================================= */}
      {isTraffic && tm ? (
        <>
          {/* Primary Traffic KPI Scorecards */}
          <div data-report-section="true" className="report-page-section mb-8">
            <h2
              className="text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5"
              style={{ color: tokens.textSecondary }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: tokens.accentPrimary }} />
              <span>Studio Flow &amp; Governance Performance Indices</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 1: Dispatch SLA Compliance */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.accentPrimary }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Dispatch SLA
                    </span>
                    <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.accentPrimary }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {tm.dispatchSlaComplianceRate}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.success }}
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>&lt; 2h Turnaround</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  Avg triage turnaround: {tm.averageDispatchTurnaroundHours}h
                </p>
              </div>

              {/* Card 2: Agency On-Time Delivery */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.success }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Agency On-Time SLA
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.success }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {tm.agencyOnTimeGovernanceRate}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.success }}
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Studio Delivery Bar</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  {tm.completedStudioTasksGoverned} completed studio tasks governed
                </p>
              </div>

              {/* Card 3: Creative Labor Shielded */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.info }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Labor Hours Shielded
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.info }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {tm.creativeHoursShielded}h
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.info }}
                    >
                      <Scale className="w-3 h-3 shrink-0" />
                      <span>Scope Defended</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  GH₵ {tm.commercialMarginProtectedGhc.toLocaleString()} variation margins held
                </p>
              </div>

              {/* Card 4: Debrief & Calendar Sync */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.warning }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Debrief Calendar Sync
                    </span>
                    <CalendarCheck className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.warning }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {tm.calendarSyncRate}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.warning }}
                    >
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>100% Calendar Synced</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  {tm.debriefsConvenedCount} mandatory CS debriefs scheduled
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Studio Intake, Dispatch & SLA Exception Governance Breakdown */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: tokens.textPrimary }}
                >
                  Studio Intake, Dispatch &amp; SLA Exception Governance Breakdown
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Systematic brief completeness audits, crisis intervention protocols, and creative capacity balancing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div
                className="p-3.5 rounded-lg border space-y-1.5"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">Brief Intake Quality</span>
                  <FolderCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-xl font-bold font-mono" style={{ color: tokens.textPrimary }}>
                  {tm.briefCompletenessAuditRate}%
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                  Mandatory pre-flight check: assets, specs, and copy confirmed before squad allocation.
                </p>
              </div>

              <div
                className="p-3.5 rounded-lg border space-y-1.5"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">SLA Relief Rulings</span>
                  <Scale className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div className="text-xl font-bold font-mono text-sky-500">
                  {tm.slaExceptionsGranted} Granted
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                  Emergency turnarounds calibrated with 24h waivers to protect creative craft and prevent night burnout.
                </p>
              </div>

              <div
                className="p-3.5 rounded-lg border space-y-1.5"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">Scope Creep Defense</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-500">
                  {tm.scopeHoldsApplied} Commercial Holds
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                  Unbriefed cutdowns and feature creep held pending commercial variation estimates from CS.
                </p>
              </div>

              <div
                className="p-3.5 rounded-lg border space-y-1.5"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">Studio Load Balance</span>
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="text-xl font-bold font-mono text-purple-500">
                  {tm.studioBalanceIndex}% Index
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                  Balanced creative capacity leveling; emergency freelance motion burst sourced for festival surge.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: SLA Exception & Commercial Scope Dispute Adjudication Log */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
                  style={{ color: tokens.textPrimary }}
                >
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>SLA Exception &amp; Commercial Scope Dispute Adjudication Log</span>
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Formal operational rulings logged to protect creative delivery, turnaround integrity, and agency margins
                </p>
              </div>
              <span className="text-[11px] font-mono" style={{ color: tokens.textTertiary }}>
                {tm.trafficCases.length} Governed Cases on Record
              </span>
            </div>

            <div className="space-y-3">
              {tm.trafficCases.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border space-y-2"
                  style={{
                    backgroundColor: tokens.bgSurfaceElevated,
                    borderColor: tokens.border
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono uppercase font-bold tracking-wider"
                        style={{ color: tokens.accentPrimary }}
                      >
                        {c.type.replace('traffic_', '').replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: tokens.textTertiary }}>·</span>
                      <h4 className="text-xs font-bold" style={{ color: tokens.textPrimary }}>
                        {c.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: tokens.textTertiary }}>
                      {new Date(c.submissionDate).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                    &ldquo;{c.narrative}&rdquo;
                  </p>

                  <div
                    className="p-2 rounded text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border"
                    style={{
                      backgroundColor: `${tokens.bgBase}80`,
                      borderColor: tokens.borderSubtle
                    }}
                  >
                    <span className="font-bold" style={{ color: tokens.semantic.success }}>
                      Ruling: {c.trafficMeta?.trafficRuling || 'Approved by Traffic Manager'}
                    </span>
                    <span style={{ color: tokens.textTertiary }}>
                      Project: {c.trafficMeta?.clientProject || 'Agency Account'} • Decision: {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Mandatory Debrief Coordination & Calendar Syncing Log */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
                  style={{ color: tokens.textPrimary }}
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  <span>Mandatory Debrief Coordination &amp; Calendar Syncing Log</span>
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Cross-functional alignment sessions convened between Client Service, Traffic, and Creative Leads
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                100% Calendar Sync Protocol Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[10px] font-mono uppercase tracking-wider"
                    style={{
                      borderColor: tokens.border,
                      color: tokens.textTertiary
                    }}
                  >
                    <th className="py-2.5 px-3 font-semibold">Deliverable Campaign</th>
                    <th className="py-2.5 px-3 font-semibold">Client Brand</th>
                    <th className="py-2.5 px-3 font-semibold">Scheduled Slot</th>
                    <th className="py-2.5 px-3 font-semibold">Teams Calendar Sync</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Governance Status</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y text-[11px]"
                  style={{ borderColor: tokens.borderSubtle }}
                >
                  <tr style={{ backgroundColor: `${tokens.bgSurfaceElevated}40` }}>
                    <td className="py-2 px-3 font-bold" style={{ color: tokens.textPrimary }}>
                      Stanbic SME Loan Animated Video Suite
                    </td>
                    <td className="py-2 px-3" style={{ color: tokens.textSecondary }}>Stanbic Bank Ghana</td>
                    <td className="py-2 px-3 font-mono" style={{ color: tokens.textSecondary }}>Today at 10:00 AM</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" /> Synced to Outlook &amp; Teams
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[11px] font-mono font-semibold text-emerald-500 inline-flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Convened
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold" style={{ color: tokens.textPrimary }}>
                      FanMilk West Africa Heritage Packaging Refresh
                    </td>
                    <td className="py-2 px-3" style={{ color: tokens.textSecondary }}>FanMilk Danone</td>
                    <td className="py-2 px-3 font-mono" style={{ color: tokens.textSecondary }}>Aug 14, 2026 at 2:00 PM</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" /> Synced to Outlook &amp; Teams
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[11px] font-mono font-semibold text-sky-500 inline-flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Signoff Complete
                      </span>
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: `${tokens.bgSurfaceElevated}40` }}>
                    <td className="py-2 px-3 font-bold" style={{ color: tokens.textPrimary }}>
                      Vodafone Red Q3 Retail POS Print System
                    </td>
                    <td className="py-2 px-3" style={{ color: tokens.textSecondary }}>Vodafone Ghana</td>
                    <td className="py-2 px-3 font-mono" style={{ color: tokens.textSecondary }}>Sep 02, 2026 at 11:30 AM</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" /> Synced to Outlook &amp; Teams
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[11px] font-mono font-semibold text-emerald-500 inline-flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Convened
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Studio Dispatch & Allocation Governance Log */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
                  style={{ color: tokens.textPrimary }}
                >
                  <Briefcase className="w-4 h-4" style={{ color: tokens.accentPrimary }} />
                  <span>Studio Dispatch &amp; Allocation Governance Log</span>
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Live operational record of agency briefs vetted, allocated to creative squads, and steered to delivery
                </p>
              </div>
              <span className="text-[11px] font-mono" style={{ color: tokens.textTertiary }}>
                Showing {tm.dispatchedJobs.length} Governed Dispatches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[10px] font-mono uppercase tracking-wider"
                    style={{
                      borderColor: tokens.border,
                      color: tokens.textTertiary
                    }}
                  >
                    <th className="py-2.5 px-3 font-semibold">Job ID</th>
                    <th className="py-2.5 px-3 font-semibold">Campaign &amp; Client</th>
                    <th className="py-2.5 px-3 font-semibold">Assigned Creative Lead</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Intake Audit</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Dispatch SLA</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Delivery Outcome</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y text-[11px]"
                  style={{ borderColor: tokens.borderSubtle }}
                >
                  {tm.dispatchedJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold" style={{ color: tokens.accentPrimary }}>
                        {j.id}
                      </td>
                      <td className="py-2 px-3 font-medium" style={{ color: tokens.textPrimary }}>
                        <div className="font-bold truncate max-w-[220px]">{j.title}</div>
                        <div className="text-[10px]" style={{ color: tokens.textTertiary }}>{j.brandName}</div>
                      </td>
                      <td className="py-2 px-3" style={{ color: tokens.textSecondary }}>
                        <div className="font-semibold">{j.assignedToName}</div>
                        <div className="text-[10px] capitalize" style={{ color: tokens.textTertiary }}>{j.assignedRole}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[11px] font-mono font-semibold text-emerald-500 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Spec Pass
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-xs">
                        &lt; {j.turnaroundHours}h
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" /> On-Time SLA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Strategic Recognition & Operational Excellence Dossier */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <h3
              className="text-xs font-mono uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5"
              style={{ color: tokens.textPrimary }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: tokens.semantic.warning }} />
              <span>Strategic Recognition &amp; Studio Operations Dossier</span>
            </h3>
            <p
              className="text-xs mb-3.5"
              style={{ color: tokens.textSecondary }}
            >
              Executive commendations for operational discipline, cross-team capacity leveling, and flawless SLA defense.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-emerald-500">
                    Executive GM Award
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary">Sep 12, 2026</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary">Studio Operations Champion</h4>
                <p className="text-[11px] text-text-secondary italic leading-relaxed">
                  &ldquo;Zero SLA dispatch breaches and maintained an 88% Studio Balance Index across all Q3 creative sprints with instant timeline conflict mediation.&rdquo;
                </p>
                <div className="text-[10px] text-text-tertiary font-mono pt-1 border-t border-border">
                  Conferred by Marcus Sterling (Managing Partner &amp; General Manager)
                </div>
              </div>

              <div
                className="p-4 rounded-xl border space-y-2"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-purple-400">
                    Architecture Milestone
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary">Annual Record</span>
                </div>
                <h4 className="text-xs font-bold text-text-primary">Enterprise Dispatch &amp; Historical Archive</h4>
                <p className="text-[11px] text-text-secondary italic leading-relaxed">
                  &ldquo;Instituted mandatory CS Debriefs, Creative Strategy Brainstorms, automated Microsoft Teams calendar syncing, and the OneDrive Year-Long Historical Archive. Governed over 1,840 tasks with 96.4% on-time agency delivery.&rdquo;
                </p>
                <div className="text-[10px] text-text-tertiary font-mono pt-1 border-t border-border">
                  Endorsed by Executive Directorate &amp; Creative Leadership
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* CASE B: CREATIVE TALENT PERFORMANCE DOSSIER (ORIGINAL METRICS & CRAFT)   */
        /* ========================================================================= */
        <>
          {/* Primary KPI Scorecards (High-Impact Visual Metrics) */}
          <div data-report-section="true" className="report-page-section mb-8">
            <h2
              className="text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5"
              style={{ color: tokens.textSecondary }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: tokens.accentPrimary }} />
              <span>Core Operational Performance Indices</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Efficiency Metric */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.accentPrimary }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Benchmark Efficiency
                    </span>
                    <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.accentPrimary }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {report.overallEfficiencyScore}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        color: report.overallEfficiencyScore >= 100 ? tokens.semantic.success : tokens.semantic.warning
                      }}
                    >
                      {report.overallEfficiencyScore >= 100 ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 shrink-0" />
                      )}
                      <span>{report.overallEfficiencyScore >= 100 ? 'Target Met' : 'Calibrating'}</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  {report.netVarianceHours >= 0
                    ? `${report.netVarianceHours}h saved vs standard`
                    : `${Math.abs(report.netVarianceHours)}h over standard`}
                </p>
              </div>

              {/* First Pass Approval */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.success }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      First-Pass Quality
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.success }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {report.firstPassApprovalRate}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.success }}
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Pass Rate</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  Approved with zero client reverts
                </p>
              </div>

              {/* On-Time Delivery */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.info }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      On-Time SLA
                    </span>
                    <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.info }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.textPrimary }}
                    >
                      {report.onTimeDeliveryRate}%
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.info }}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>SLA Met</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  {report.completedJobsCount} deliverables finalized
                </p>
              </div>

              {/* Strategic Recognition / Overtime Points */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: tokens.bgSurface,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: tokens.semantic.warning }}
                />
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-[10px] font-mono uppercase font-bold tracking-tight truncate"
                      style={{ color: tokens.textSecondary }}
                    >
                      Strategic Recognition Points
                    </span>
                    <Award className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.warning }} />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                      style={{ color: tokens.semantic.warning }}
                    >
                      +{report.recognitionPoints}
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tokens.semantic.warning }}
                    >
                      <Award className="w-3 h-3 shrink-0" />
                      <span>Pts Logged</span>
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] leading-relaxed mt-3 pt-2 border-t"
                  style={{ borderColor: `${tokens.border}50`, color: tokens.textTertiary }}
                >
                  {report.totalOvertimeHours}h logged overtime
                </p>
              </div>
            </div>
          </div>

          {/* Production Hours vs Seniority Benchmarks */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: tokens.textPrimary }}
                >
                  Seniority Benchmark vs Actual Effort Distribution
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Comparing allocated standard agency benchmark hours against logged direct execution hours
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-xs"
                    style={{ backgroundColor: tokens.borderSubtle }}
                  />
                  <span style={{ color: tokens.textSecondary }}>Benchmark Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-xs"
                    style={{ backgroundColor: tokens.accentPrimary }}
                  />
                  <span style={{ color: tokens.textSecondary }}>Actual Direct Effort</span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              {report.benchmarkComparisons.map((item) => {
                const maxVal = Math.max(item.benchmarkHours, item.averageActualHours, 1);
                const benchPct = Math.round((item.benchmarkHours / maxVal) * 100);
                const actualPct = Math.round((item.averageActualHours / maxVal) * 100);
                const isUnder = item.averageActualHours <= item.benchmarkHours;

                return (
                  <div
                    key={item.taskType}
                    className="p-3.5 rounded-lg border text-xs"
                    style={{
                      backgroundColor: tokens.bgSurfaceElevated,
                      borderColor: tokens.border
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-xs"
                          style={{ color: tokens.textPrimary }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="text-[11px] font-mono font-medium"
                          style={{ color: tokens.textSecondary }}
                        >
                          · {item.deliverablesCount} {item.deliverablesCount === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: tokens.textTertiary }}>
                          Benchmark: <strong style={{ color: tokens.textPrimary }}>{item.benchmarkHours}h</strong>
                        </span>
                        <span style={{ color: tokens.textTertiary }}>
                          Actual: <strong style={{ color: tokens.textPrimary }}>{item.averageActualHours}h</strong>
                        </span>
                        <span
                          className="text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1"
                          style={{
                            color: isUnder ? tokens.semantic.success : tokens.semantic.warning
                          }}
                        >
                          {isUnder ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{item.efficiencyPercentage}% Rate</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono w-16 text-right shrink-0"
                          style={{ color: tokens.textTertiary }}
                        >
                          Standard
                        </span>
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: `${tokens.border}60` }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${benchPct}%`,
                              backgroundColor: tokens.textTertiary
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono w-16 text-right shrink-0 font-bold"
                          style={{ color: tokens.accentPrimary }}
                        >
                          Logged
                        </span>
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: `${tokens.border}60` }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${actualPct}%`,
                              backgroundColor: isUnder ? tokens.accentPrimary : tokens.semantic.warning
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WorkCycles & Revision Quality Audit */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: tokens.textPrimary }}
                >
                  WorkCycle Iterations &amp; Revision Rigor
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Analysis of internal review rounds, rework cycles, and client revert classifications
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase font-semibold"
                  style={{ color: tokens.textTertiary }}
                >
                  Average Cycles per Job
                </div>
                <div
                  className="text-3xl font-black font-mono mt-1"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.averageCyclesPerJob}
                </div>
                <div
                  className="text-[10px] font-mono mt-1"
                  style={{
                    color: report.averageCyclesPerJob <= 1.5 ? tokens.semantic.success : tokens.semantic.warning
                  }}
                >
                  {report.averageCyclesPerJob <= 1.5 ? 'Lean Flow' : 'Multiple Review Stages'}
                </div>
              </div>

              <div
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase font-semibold"
                  style={{ color: tokens.textTertiary }}
                >
                  Client Revert Count
                </div>
                <div
                  className="text-3xl font-black font-mono mt-1"
                  style={{
                    color: report.clientRevertCount === 0 ? tokens.semantic.success : tokens.semantic.warning
                  }}
                >
                  {report.clientRevertCount}
                </div>
                <div
                  className="text-[10px] font-mono mt-1"
                  style={{ color: tokens.textSecondary }}
                >
                  Across {report.recentDeliverables.length} tracked items
                </div>
              </div>

              <div
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase font-semibold"
                  style={{ color: tokens.textTertiary }}
                >
                  Rework Ratio
                </div>
                <div
                  className="text-3xl font-black font-mono mt-1"
                  style={{
                    color: report.reworkHoursPercentage <= 10 ? tokens.semantic.success : tokens.semantic.critical
                  }}
                >
                  {report.reworkHoursPercentage}%
                </div>
                <div
                  className="text-[10px] font-mono mt-1"
                  style={{ color: tokens.textSecondary }}
                >
                  {report.totalReworkHours}h rework of {report.totalActualHours}h logged
                </div>
              </div>
            </div>

            {/* Rework Classification Breakdown */}
            <div
              className="p-3.5 rounded-lg border grid grid-cols-3 gap-2 text-center text-xs"
              style={{
                backgroundColor: tokens.bgSurfaceElevated,
                borderColor: tokens.border
              }}
            >
              <div>
                <span
                  className="text-[10px] font-mono uppercase font-bold block"
                  style={{ color: tokens.semantic.info }}
                >
                  Typo / Correction
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.reworkClassifications.correction}
                </span>
                <span
                  className="text-[10px] block"
                  style={{ color: tokens.textTertiary }}
                >
                  Minor details
                </span>
              </div>
              <div
                className="border-x"
                style={{ borderColor: tokens.border }}
              >
                <span
                  className="text-[10px] font-mono uppercase font-bold block"
                  style={{ color: tokens.semantic.warning }}
                >
                  Creative Rework
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.reworkClassifications.rework}
                </span>
                <span
                  className="text-[10px] block"
                  style={{ color: tokens.textTertiary }}
                >
                  Aesthetic shifts
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono uppercase font-bold block"
                  style={{ color: tokens.semantic.critical }}
                >
                  Scope Change
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.reworkClassifications.scope_change}
                </span>
                <span
                  className="text-[10px] block"
                  style={{ color: tokens.textTertiary }}
                >
                  Unbriefed edits
                </span>
              </div>
            </div>
          </div>

          {/* Deliverables Production Log */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: tokens.textPrimary }}
                >
                  Deliverable Production &amp; Review Log
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: tokens.textSecondary }}
                >
                  Granular task auditing across sprint commitments, benchmark variance, and review pass outcomes
                </p>
              </div>
              <span
                className="text-[11px] font-mono"
                style={{ color: tokens.textTertiary }}
              >
                Showing {report.recentDeliverables.length} Deliverables
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b text-[10px] font-mono uppercase tracking-wider"
                    style={{
                      borderColor: tokens.border,
                      color: tokens.textTertiary
                    }}
                  >
                    <th className="py-2.5 px-3 font-semibold">Deliverable</th>
                    <th className="py-2.5 px-3 font-semibold">Archetype</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Cycles</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Bench</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Actual</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Rework</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Quality Status</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y text-[11px]"
                  style={{ borderColor: tokens.borderSubtle }}
                >
                  {report.recentDeliverables.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center font-mono" style={{ color: tokens.textTertiary }}>
                        No deliverables recorded in this audit period.
                      </td>
                    </tr>
                  ) : (
                    report.recentDeliverables.map((deliv) => (
                      <tr
                        key={deliv.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium">
                          <div
                            className="font-bold truncate max-w-[240px]"
                            style={{ color: tokens.textPrimary }}
                          >
                            {deliv.title}
                          </div>
                          <div
                            className="font-mono text-[10px]"
                            style={{ color: tokens.textTertiary }}
                          >
                            ID: {deliv.id} • Due: {deliv.dueDate}
                          </div>
                        </td>
                        <td
                          className="py-2.5 px-3 font-sans"
                          style={{ color: tokens.textSecondary }}
                        >
                          {deliv.taskType}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className="font-mono text-xs font-semibold"
                            style={{ color: tokens.textSecondary }}
                          >
                            #{deliv.cyclesCount}
                          </span>
                        </td>
                        <td
                          className="py-2.5 px-3 text-right"
                          style={{ color: tokens.textTertiary }}
                        >
                          {deliv.benchmarkHours}h
                        </td>
                        <td
                          className="py-2.5 px-3 text-right font-bold"
                          style={{ color: tokens.textPrimary }}
                        >
                          {deliv.actualHours}h
                        </td>
                        <td
                          className="py-2.5 px-3 text-right font-bold"
                          style={{
                            color: deliv.reworkHours > 0 ? tokens.semantic.critical : tokens.textTertiary
                          }}
                        >
                          {deliv.reworkHours > 0 ? `+${deliv.reworkHours}h` : '0h'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {deliv.firstPassApproved ? (
                            <span
                              className="font-mono text-xs font-semibold uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1 justify-end"
                              style={{ color: tokens.semantic.success }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>First Pass</span>
                            </span>
                          ) : (
                            <span
                              className="font-mono text-xs font-semibold uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1 justify-end"
                              style={{ color: tokens.semantic.warning }}
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{deliv.revertCount} Revert(s)</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Recognition & Verified Impact Ledger */}
          <div
            data-report-section="true"
            className="report-page-section mb-8 p-5 rounded-xl border"
            style={{
              backgroundColor: tokens.bgSurface,
              borderColor: tokens.border
            }}
          >
            <h3
              className="text-xs font-mono uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5"
              style={{ color: tokens.textPrimary }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: tokens.semantic.warning }} />
              <span>Strategic Recognition &amp; Verified Impact Dossier</span>
            </h3>
            <p
              className="text-xs mb-3.5"
              style={{ color: tokens.textSecondary }}
            >
              Verified record of meaningful contribution: exceptional delivery rescues, client impact, craft excellence, and operational support.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase"
                  style={{ color: tokens.textTertiary }}
                >
                  Contributions Logged
                </div>
                <div
                  className="text-lg font-bold font-mono mt-0.5"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.overtimeCount}
                </div>
                <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Verified entries</div>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase"
                  style={{ color: tokens.textTertiary }}
                >
                  Post-5pm Hours
                </div>
                <div
                  className="text-lg font-bold font-mono mt-0.5"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.post5pmHours}h
                </div>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase"
                  style={{ color: tokens.textTertiary }}
                >
                  Pre-9am Hours
                </div>
                <div
                  className="text-lg font-bold font-mono mt-0.5"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.pre9amHours}h
                </div>
              </div>
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: tokens.bgSurfaceElevated,
                  borderColor: tokens.border
                }}
              >
                <div
                  className="text-[10px] font-mono uppercase"
                  style={{ color: tokens.textTertiary }}
                >
                  Weekend Crunch
                </div>
                <div
                  className="text-lg font-bold font-mono mt-0.5"
                  style={{ color: tokens.textPrimary }}
                >
                  {report.weekendHours}h
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Formal Endorsement & Governance Sign-off Strip */}
      <div
        data-report-section="true"
        className="report-page-section pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs"
        style={{ borderColor: tokens.border }}
      >
        <div>
          <div
            className="text-[10px] font-mono uppercase font-semibold mb-3"
            style={{ color: tokens.textTertiary }}
          >
            {isTraffic ? 'Studio Operational Directorate' : 'Supervising Evaluator Endorsement'}
          </div>
          <div
            className="h-8 border-b border-dashed flex items-end pb-1 font-mono font-bold"
            style={{
              borderColor: tokens.borderSubtle,
              color: tokens.textPrimary
            }}
          >
            {reportingManager ? reportingManager.name : 'Executive Directorate'}
          </div>
          <div
            className="text-[10px] mt-1"
            style={{ color: tokens.textTertiary }}
          >
            Verified Digital Signature
          </div>
        </div>

        <div>
          <div
            className="text-[10px] font-mono uppercase font-semibold mb-3"
            style={{ color: tokens.textTertiary }}
          >
            General Management Review
          </div>
          <div
            className="h-8 border-b border-dashed flex items-end pb-1 font-mono font-bold"
            style={{
              borderColor: tokens.borderSubtle,
              color: tokens.textPrimary
            }}
          >
            Marcus Sterling, Managing Partner
          </div>
          <div
            className="text-[10px] mt-1"
            style={{ color: tokens.textTertiary }}
          >
            Executive Studio Seal
          </div>
        </div>

        <div className="sm:text-right">
          <div
            className="text-[10px] font-mono uppercase font-semibold mb-1"
            style={{ color: tokens.textTertiary }}
          >
            Governance Verification
          </div>
          <div
            className="font-mono text-[10px] leading-tight"
            style={{ color: tokens.textSecondary }}
          >
            HASH: {report.reportReferenceId}-SHA256-OK
          </div>
          <div
            className="text-[10px] mt-1"
            style={{ color: tokens.textTertiary }}
          >
            Tibule Agency Operating System
          </div>
        </div>
      </div>
    </div>
  );
};
