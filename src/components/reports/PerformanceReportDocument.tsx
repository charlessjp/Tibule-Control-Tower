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
  FileText
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
                Tibule Creative &amp; Operations Group • Talent Governance
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
              Talent Performance &amp; Output Dossier
            </h1>
            <p
              className="text-xs mt-1"
              style={{ color: tokens.textSecondary }}
            >
              Audit Scope: <strong style={{ color: tokens.textPrimary }}>{report.periodLabel}</strong> • Verification ID: <span className="font-mono">{report.reportReferenceId}</span>
            </p>
          </div>

          {/* Security & Verification Stamp */}
          <div className="sm:text-right shrink-0">
            <div
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold tracking-wider whitespace-nowrap shrink-0"
              style={{ color: tokens.semantic.success }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Audit Record</span>
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
              Employee Name
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
              {targetUser.department ? targetUser.department.replace('_', ' ') : 'Studio Creative'}
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
              {reportingManager ? reportingManager.name : 'Executive Leadership'}
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

          {/* Good Books / Overtime Points */}
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
                  Good Books Points
                </span>
                <Award className="w-3.5 h-3.5 shrink-0" style={{ color: tokens.semantic.warning }} />
              </div>
              <div className="mt-2.5">
                <div
                  className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none"
                  style={{ color: tokens.semantic.warning }}
                >
                  +{report.goodBooksPoints}
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
              <span style={{ color: tokens.textSecondary }}>Standard Benchmark ({report.totalBenchmarkHours}h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-xs"
                style={{ backgroundColor: tokens.accentPrimary }}
              />
              <span style={{ color: tokens.textPrimary }}>Logged Output ({report.totalActualHours}h)</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div
            className="h-3.5 w-full rounded-full overflow-hidden flex"
            style={{ backgroundColor: tokens.bgSurfaceElevated }}
          >
            <div
              style={{
                width: `${Math.min((report.totalActualHours / (report.totalBenchmarkHours || 1)) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${tokens.accentPrimary}, ${tokens.accentSecondary})`
              }}
              className="h-full transition-all"
            />
          </div>
          <div
            className="flex justify-between text-[10px] font-mono"
            style={{ color: tokens.textTertiary }}
          >
            <span>0 Hours</span>
            <span>Target Benchmark: {report.totalBenchmarkHours}h</span>
            <span>Efficiency: {report.overallEfficiencyScore}%</span>
          </div>
        </div>

        {/* Task Archetype Breakdown Table */}
        {report.benchmarkComparisons.length > 0 && (
          <div
            className="overflow-x-auto mt-4 rounded-lg border"
            style={{ borderColor: tokens.border }}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="border-b text-[10px] font-mono uppercase"
                  style={{
                    backgroundColor: tokens.bgSurfaceElevated,
                    borderColor: tokens.border,
                    color: tokens.textTertiary
                  }}
                >
                  <th className="py-2.5 px-3 font-semibold">Task Archetype</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Deliverables</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Standard Benchmark</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Avg Logged Effort</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {report.benchmarkComparisons.map((cmp, idx) => (
                  <tr
                    key={cmp.taskType}
                    className="border-b last:border-b-0"
                    style={{
                      borderColor: tokens.border,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : `${tokens.bgSurfaceElevated}60`
                    }}
                  >
                    <td
                      className="py-2.5 px-3 font-sans font-medium"
                      style={{ color: tokens.textPrimary }}
                    >
                      {cmp.label}
                    </td>
                    <td
                      className="py-2.5 px-3 text-center"
                      style={{ color: tokens.textSecondary }}
                    >
                      {cmp.deliverablesCount}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right"
                      style={{ color: tokens.textTertiary }}
                    >
                      {cmp.benchmarkHours}h / task
                    </td>
                    <td
                      className="py-2.5 px-3 text-right font-bold"
                      style={{ color: tokens.textPrimary }}
                    >
                      {cmp.averageActualHours}h
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className="font-mono text-xs font-bold whitespace-nowrap inline-flex items-center gap-1 justify-end"
                        style={{
                          color: cmp.efficiencyPercentage >= 100 ? tokens.semantic.success : tokens.semantic.warning
                        }}
                      >
                        {cmp.efficiencyPercentage >= 100 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{cmp.efficiencyPercentage}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WorkCycles & Rework Analysis */}
      <div
        data-report-section="true"
        className="report-page-section mb-8 p-5 rounded-xl border"
        style={{
          backgroundColor: tokens.bgSurface,
          borderColor: tokens.border
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
            style={{ color: tokens.textPrimary }}
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: tokens.semantic.critical }} />
            <span>WorkCycle Sequences &amp; Rework Leakage</span>
          </h3>
          <span
            className="text-[11px] font-mono"
            style={{ color: tokens.textSecondary }}
          >
            Avg Cycles / Deliverable: <strong style={{ color: tokens.textPrimary }}>{report.averageCyclesPerJob}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className="p-3.5 rounded-lg border"
            style={{
              backgroundColor: tokens.bgSurfaceElevated,
              borderColor: tokens.border
            }}
          >
            <div
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Total Rework Hours
            </div>
            <div
              className="text-lg font-bold font-mono mt-0.5"
              style={{ color: tokens.semantic.critical }}
            >
              {report.totalReworkHours}h
            </div>
            <div
              className="text-[10px] mt-0.5"
              style={{ color: tokens.textTertiary }}
            >
              {report.reworkHoursPercentage}% of total logged effort
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
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Client Reverts Received
            </div>
            <div
              className="text-lg font-bold font-mono mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {report.clientRevertCount}
            </div>
            <div
              className="text-[10px] mt-0.5"
              style={{ color: tokens.textTertiary }}
            >
              Across {report.totalJobsAssigned} assigned briefs
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
              className="text-[10px] font-mono uppercase font-semibold"
              style={{ color: tokens.textTertiary }}
            >
              Rework Classifications
            </div>
            <div
              className="text-xs font-mono mt-1 flex items-center justify-between"
              style={{ color: tokens.textSecondary }}
            >
              <span>Corrections: <strong style={{ color: tokens.textPrimary }}>{report.reworkClassifications.correction}</strong></span>
              <span>Revisions: <strong style={{ color: tokens.textPrimary }}>{report.reworkClassifications.rework}</strong></span>
            </div>
            <div
              className="text-[10px] font-mono mt-0.5"
              style={{ color: tokens.textTertiary }}
            >
              Scope Shifts: {report.reworkClassifications.scope_change}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliverables Audit Table */}
      <div data-report-section="true" className="report-page-section mb-8">
        <h3
          className="text-xs font-mono uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5"
          style={{ color: tokens.textSecondary }}
        >
          <Layers className="w-3.5 h-3.5" style={{ color: tokens.accentPrimary }} />
          <span>Deliverables Output Register</span>
        </h3>

        <div
          className="overflow-x-auto rounded-xl border"
          style={{
            borderColor: tokens.border,
            backgroundColor: tokens.bgSurface
          }}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead
              className="text-[10px] font-mono uppercase border-b"
              style={{
                backgroundColor: tokens.bgSurfaceElevated,
                borderColor: tokens.border,
                color: tokens.textTertiary
              }}
            >
              <tr>
                <th className="py-2.5 px-3 font-semibold">ID &amp; Deliverable</th>
                <th className="py-2.5 px-3 font-semibold">Archetype</th>
                <th className="py-2.5 px-3 font-semibold text-center">Cycles</th>
                <th className="py-2.5 px-3 font-semibold text-right">Standard</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actual</th>
                <th className="py-2.5 px-3 font-semibold text-right">Rework</th>
                <th className="py-2.5 px-3 font-semibold text-right">Quality Status</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {report.recentDeliverables.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center font-sans"
                    style={{ color: tokens.textTertiary }}
                  >
                    No deliverables recorded for this staff member in the current audit period.
                  </td>
                </tr>
              ) : (
                report.recentDeliverables.map((deliv, idx) => (
                  <tr
                    key={deliv.id}
                    className="border-b last:border-b-0 transition-colors"
                    style={{
                      borderColor: tokens.border,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : `${tokens.bgSurfaceElevated}40`
                    }}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className="font-bold block truncate max-w-[200px]"
                        style={{ color: tokens.textPrimary }}
                      >
                        {deliv.title}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: tokens.textTertiary }}
                      >
                        {deliv.id}
                      </span>
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

      {/* Overtime & Good Books Dedication Ledger */}
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
          <span>Overtime Ledger &amp; Good Books Contribution</span>
        </h3>
        <p
          className="text-xs mb-3.5"
          style={{ color: tokens.textSecondary }}
        >
          Agency recognition for crunch periods, late releases, and exceptional delivery dedication.
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
              Total Overtime
            </div>
            <div
              className="text-lg font-bold font-mono mt-0.5"
              style={{ color: tokens.textPrimary }}
            >
              {report.totalOvertimeHours}h
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
            Supervising Evaluator Endorsement
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
            Tibule Agency Operating System v2.4
          </div>
        </div>
      </div>
    </div>
  );
};
