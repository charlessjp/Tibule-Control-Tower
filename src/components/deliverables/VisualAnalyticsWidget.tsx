import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Compass,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen,
  Layers,
  Sparkles,
  Award,
  Clock,
  Building2,
  User,
  Users
} from 'lucide-react';
import { getChartColorPair } from '../../utils/chartColorUtils';
import { ProgressionCase, Job } from '../../types';
import { formatSeniority } from '../../utils/formatters';
import { GraphInterpretationModal } from './GraphInterpretationModal';
import {
  canViewUserAnalytics,
  getPermittedAnalyticsStaff,
  getPermittedAnalyticsTeams
} from '../../utils/reportPermissions';
import { isJobInCalendarPeriod } from '../../utils/calendarPeriodFilter';

export interface VisualAnalyticsWidgetProps {
  title?: string;
  subtitle?: string;
  scope?: 'agency' | 'team' | 'employee' | 'case' | 'traffic' | 'client_service';
  employeeId?: string;
  teamId?: string;
  caseData?: ProgressionCase;
  className?: string;
  compact?: boolean;
  defaultTab?: 'radar' | 'barchart';
  showFieldManualButton?: boolean;
  showFullAnalyticsLink?: boolean;
}

export const VisualAnalyticsWidget: React.FC<VisualAnalyticsWidgetProps> = ({
  title,
  subtitle,
  scope = 'agency',
  employeeId,
  teamId,
  caseData,
  className = '',
  compact = false,
  defaultTab = 'radar',
  showFieldManualButton = true,
  showFullAnalyticsLink = !caseData
}) => {
  const {
    jobs,
    users,
    teams,
    currentUser,
    theme,
    currentPalette,
    setActiveView,
    homeCalendarPeriod,
    homeCustomDateRange,
    deliveryImpactLogs
  } = useApp();
  const isDark = theme === 'dark';
  const isPure = currentPalette.id === 'pure';
  const tokens = currentPalette[theme];

  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const isLeadOrManager =
    currentUser.role === 'manager' ||
    currentUser.role === 'director' ||
    currentUser.role === 'team_lead' ||
    currentUser.role === 'traffic_manager' ||
    currentUser.role === 'client_service';
  const isStrictEmployee = !isGM && !isLeadOrManager;

  // Interactive Scope Sectioning State
  const [activeScope, setActiveScope] = useState<'agency' | 'team' | 'employee'>(() => {
    if (caseData || scope === 'employee' || employeeId || isStrictEmployee) return 'employee';
    if (scope === 'team' || teamId || isLeadOrManager) return 'team';
    return isGM ? 'agency' : 'employee';
  });
  const [selectedWidgetTeamId, setSelectedWidgetTeamId] = useState<string>(() => {
    return teamId || currentUser.teamId || teams[0]?.id || 'team-creative';
  });
  const [selectedWidgetStaffId, setSelectedWidgetStaffId] = useState<string>(() => {
    return employeeId || currentUser.id;
  });

  const permittedStaff = useMemo(() => {
    return getPermittedAnalyticsStaff(currentUser, users, teams);
  }, [currentUser, users, teams]);

  const permittedTeams = useMemo(() => {
    return getPermittedAnalyticsTeams(currentUser, teams);
  }, [currentUser, teams]);

  // Safety clamps for role, seniority, team and staff
  useEffect(() => {
    if (isStrictEmployee && activeScope !== 'employee') {
      setActiveScope('employee');
    } else if (!isGM && activeScope === 'agency') {
      setActiveScope(isLeadOrManager ? 'team' : 'employee');
    }
  }, [isStrictEmployee, isGM, isLeadOrManager, activeScope]);

  useEffect(() => {
    if (!permittedTeams.some((t) => t.id === selectedWidgetTeamId)) {
      setSelectedWidgetTeamId(permittedTeams[0]?.id || currentUser.teamId || 'team-creative');
    }
  }, [permittedTeams, selectedWidgetTeamId, currentUser.teamId]);

  useEffect(() => {
    if (!permittedStaff.some((u) => u.id === selectedWidgetStaffId)) {
      setSelectedWidgetStaffId(currentUser.id);
    }
  }, [permittedStaff, selectedWidgetStaffId, currentUser.id]);

  const [activeTab, setActiveTab] = useState<'radar' | 'barchart'>(defaultTab);
  const [colorMode, setColorMode] = useState<'complementary' | 'graphite'>('complementary');
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedRadarDim, setSelectedRadarDim] = useState<string>('On-Time SLA Delivery');

  // Filtered jobs according to active sectioned scope and operating calendar period
  const targetJobs: Job[] = useMemo(() => {
    if (caseData) {
      if (caseData.evidenceData?.linkedJobIds && caseData.evidenceData.linkedJobIds.length > 0) {
        const linked = jobs.filter(j => caseData.evidenceData.linkedJobIds.includes(j.id));
        if (linked.length > 0) return linked;
      }
      return jobs.filter(j => j.assigneeId === caseData.employeeId);
    }

    const scopedJobs = (() => {
      if (activeScope === 'employee') {
        const candidate = users.find(u => u.id === selectedWidgetStaffId);
        const targetUserObj = (candidate && canViewUserAnalytics(currentUser, candidate, teams))
          ? candidate
          : currentUser;
        const targetId = targetUserObj.id;
        return targetId
          ? jobs.filter(j => j.assigneeId === targetId || j.assigneeName === targetUserObj.name)
          : jobs;
      }

      if (activeScope === 'team') {
        const targetTeam = teams.find(t => t.id === selectedWidgetTeamId);
        const memberIds = targetTeam?.memberIds || [];
        return jobs.filter(j => j.teamId === selectedWidgetTeamId || memberIds.includes(j.assigneeId));
      }

      if (scope === 'client_service') {
        return jobs.filter(j => j.workflowStage === 'client_review' || j.workflowStage === 'client_revert' || j.brandId);
      }

      if (scope === 'traffic') {
        return jobs;
      }

      return jobs;
    })();

    // Filter by active home operating calendar period
    const inPeriodJobs = scopedJobs.filter(j =>
      isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange)
    );

    // If there are deliverables in the selected calendar period, use them; otherwise gracefully fallback to all scoped deliverables
    return inPeriodJobs.length > 0 ? inPeriodJobs : scopedJobs;
  }, [
    jobs,
    caseData,
    activeScope,
    selectedWidgetStaffId,
    selectedWidgetTeamId,
    users,
    teams,
    scope,
    currentUser,
    homeCalendarPeriod,
    homeCustomDateRange
  ]);

  // Color contrast pair
  const { actualColor, plannedColor } = useMemo(() => {
    return getChartColorPair(
      currentPalette.id,
      tokens.accentPrimary,
      isDark,
      colorMode
    );
  }, [currentPalette.id, tokens.accentPrimary, isDark, colorMode]);

  // Radar chart dimensions: Aligned with Graph Interpretation Manual & Operational Suite
  const radarDimensions = useMemo(() => {
    const totalJobs = targetJobs.length;

    // 1. On-Time SLA Delivery (Target: >=90%)
    const overdueOrAtRisk = targetJobs.filter(
      j => j.isAtRisk || (j.status !== 'completed' && new Date(j.dueDate).getTime() < Date.now())
    ).length;
    const onTimeScore = totalJobs > 0
      ? Math.max(0, Math.min(100, Math.round(((totalJobs - overdueOrAtRisk) / totalJobs) * 100)))
      : 90;

    // 2. Scope Quoting Accuracy (Target: >=85%)
    const jobsWithHours = targetJobs.filter(j => (j.estimatedHours || 0) > 0);
    const quotingAccuracyScore = jobsWithHours.length > 0
      ? Math.round(
          jobsWithHours.reduce((acc, j) => {
            const actual = j.actualHours || j.actualEffortHours || 0;
            const est = j.estimatedHours;
            const dev = Math.abs(actual - est) / est;
            return acc + Math.max(0, 100 - dev * 100);
          }, 0) / jobsWithHours.length
        )
      : 85;

    // 3. First-Time Client Approval Rate (Target: >=85%)
    const revertTrackedJobs = targetJobs.filter(
      j => j.clientRevertInfo !== undefined || j.workflowStage === 'completed' || j.status === 'completed'
    );
    const zeroRevertCount = revertTrackedJobs.filter(
      j => !j.clientRevertInfo || j.clientRevertInfo.revertCount === 0
    ).length;
    const firstTimeApprovalScore = revertTrackedJobs.length > 0
      ? Math.round((zeroRevertCount / revertTrackedJobs.length) * 100)
      : 88;

    // 4. Blocker & Delivery Impact Resolution Agility (Target: >=80%)
    const relevantJobIds = new Set(targetJobs.map((j) => j.id));
    const targetImpacts = deliveryImpactLogs.filter((l) => !l.jobId || relevantJobIds.has(l.jobId));
    const activeImpactsCount = targetImpacts.filter((l) => l.status === 'active').length;
    const resolvedOrMitigatedImpactsCount = targetImpacts.filter((l) => l.status === 'resolved' || l.status === 'mitigated').length;
    
    const currentlyBlocked = targetJobs.filter(j => j.status === 'blocked' || !!j.blockedSince).length;
    const totalImpediments = currentlyBlocked + targetImpacts.length;
    const clearedImpediments = (totalJobs - currentlyBlocked) + resolvedOrMitigatedImpactsCount;
    
    const blockerAgilityScore = totalImpediments > 0
      ? Math.max(0, Math.min(100, Math.round(((clearedImpediments) / (totalJobs + targetImpacts.length)) * 100)))
      : totalJobs > 0
      ? Math.max(0, Math.round(((totalJobs - currentlyBlocked) / totalJobs) * 100))
      : 80;

    // 5. Internal Review Pass Rate (Target: >=85%)
    const evaluatedInternalJobs = targetJobs.filter(
      j =>
        j.workflowStage === 'in_production' ||
        j.workflowStage === 'internal_review' ||
        j.workflowStage === 'client_service_handoff' ||
        j.workflowStage === 'completed'
    );
    const jobsWithInternalRework = evaluatedInternalJobs.filter(
      j =>
        (j.feedbackHistory && j.feedbackHistory.length > 0) ||
        (j.workCycles && j.workCycles.some(c => c.cycleType === 'internal_revision'))
    ).length;
    const internalPassScore = evaluatedInternalJobs.length > 0
      ? Math.max(0, Math.min(100, Math.round(((evaluatedInternalJobs.length - jobsWithInternalRework) / evaluatedInternalJobs.length) * 100)))
      : 88;

    // 6. Rework Effort Control (Target: >=85%)
    const totalActualHours = targetJobs.reduce(
      (acc, j) => acc + (j.actualHours || j.actualEffortHours || 0),
      0
    );
    const totalReworkHours = targetJobs.reduce(
      (acc, j) => acc + (j.reworkEffortHours || 0),
      0
    );
    const reworkControlScore = totalActualHours > 0
      ? Math.max(0, Math.min(100, Math.round(((totalActualHours - totalReworkHours) / totalActualHours) * 100)))
      : 86;

    return [
      {
        dimension: 'On-Time SLA Delivery',
        value: onTimeScore,
        fullMark: 100,
        target: 90,
        formula: '((Total Deliverables - Overdue/At-Risk) / Total) × 100',
        desc: 'Proportion of deliverables completed or tracking ahead of milestone SLA deadline without unapproved extensions.',
        impact: activeScope === 'employee' ? 'Personal reliability track record for role advancement.' : 'Direct driver of client retention and contractual SLA compliance.'
      },
      {
        dimension: 'Scope Quoting Accuracy',
        value: quotingAccuracyScore,
        fullMark: 100,
        target: 85,
        formula: 'Mean (1 - |Actual - Scoped| / Scoped) × 100',
        desc: 'Ratio of initial estimated hours to actual logged timesheet hours across finished deliverables.',
        impact: activeScope === 'employee' ? 'Demonstrates estimation maturity and delivery autonomy.' : 'Protects agency gross margin and stops invisible scope erosion.'
      },
      {
        dimension: 'First-Time Client Approval Rate',
        value: firstTimeApprovalScore,
        fullMark: 100,
        target: 85,
        formula: '(Zero-Revert Deliverables / Evaluated Deliverables) × 100',
        desc: 'Percentage of deliverables accepted by client on Stage 10 sign-off without triggering revert loops.',
        impact: 'Eliminates unbudgeted rework, preserving sprint capacity.'
      },
      {
        dimension: 'Blocker Resolution Agility',
        value: blockerAgilityScore,
        fullMark: 100,
        target: 80,
        formula: '((Total - Stalled/Blocked Deliverables) / Total) × 100',
        desc: 'Clearance rate and proactive escalation for external asset hold dependencies.',
        impact: 'Maintains continuous production cadence without idle desk time.'
      },
      {
        dimension: 'Internal Review Pass Rate',
        value: internalPassScore,
        fullMark: 100,
        target: 85,
        formula: '((Reviewed Deliverables - Internal Rejections) / Reviewed) × 100',
        desc: 'Deliverables passing Stage 07 Studio Lead critique without being rejected back for internal rework.',
        impact: 'Quality gatekeeping: catches craftsmanship gaps before client dispatch.'
      },
      {
        dimension: 'Rework Effort Control',
        value: reworkControlScore,
        fullMark: 100,
        target: 85,
        formula: '((Total Logged Hours - Total Rework Hours) / Total Logged Hours) × 100',
        desc: 'Percentage of timesheet hours invested in fresh creative deliverables vs fixing rework.',
        impact: 'Stops unbilled revision bleed and protects studio efficiency.'
      }
    ];
  }, [targetJobs, activeScope, caseData, deliveryImpactLogs]);

  // Category Distribution (Planned vs Actual)
  const categoryDistribution = useMemo(() => {
    const rawCategories = Array.from(new Set(targetJobs.map(j => j.category)));
    const categories = rawCategories.length > 0 ? rawCategories : ['Brand Systems', 'Motion & 3D', 'Digital Design', 'Broadcast TVC'];

    return categories.map(cat => {
      const catJobs = targetJobs.filter(j => j.category === cat);
      const planned = catJobs.length > 0 ? catJobs.reduce((acc, j) => acc + j.estimatedHours, 0) : 45;
      const actual = catJobs.length > 0 ? catJobs.reduce((acc, j) => acc + j.actualHours, 0) : 48;
      return {
        category: cat.replace(' Systems', '').replace(' Identity', '').replace(' & Experience', ''),
        planned,
        actual
      };
    });
  }, [targetJobs]);

  const currentRadarObj = radarDimensions.find(d => d.dimension === selectedRadarDim) || radarDimensions[0];

  const tooltipBg = 'var(--color-surface-elevated)';
  const tooltipBorder = 'var(--color-border)';
  const tooltipColor = 'var(--color-text-primary)';

  // Default titles and scope labels according to context
  const currentTeamObj = teams.find(t => t.id === selectedWidgetTeamId);
  const currentStaffObj = users.find(u => u.id === selectedWidgetStaffId);

  const scopeLabel =
    activeScope === 'employee'
      ? `${currentStaffObj?.name || 'Staff'}`
      : activeScope === 'team'
      ? `${currentTeamObj?.name || 'Department'}`
      : 'Agency-Wide';

  const resolvedTitle =
    caseData
      ? `Visual Evidence & Performance Telemetry: ${caseData.employeeName}`
      : title
      ? `${title} (${scopeLabel})`
      : `${scopeLabel} Workload & Delivery Visual Analytics`;

  const resolvedSubtitle =
    subtitle ||
    (caseData
      ? `Audited telemetry for Case ${caseData.id}. Demonstrates applicant deliverable health, quoting accuracy, and operational maturity.`
      : activeScope === 'employee'
      ? `Individual staff telemetry for ${currentStaffObj?.name || 'Specialist'}: deliverable hours distribution, quoting accuracy, and SLA adherence.`
      : activeScope === 'team'
      ? `Department-level telemetry for ${currentTeamObj?.name || 'Squad'}: collective workload capacity, SLA pass rate, and quoting variance.`
      : 'Calibrated multi-dimensional telemetry tracking quoting accuracy, capacity saturation, and SLA health across all agency streams.');

  return (
    <div className={`space-y-4 ${className}`}>
      <SpotlightCard className="p-5 sm:p-6 border border-border shadow-xs">
        {/* Card Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 shrink-0" style={{ color: actualColor }} />
              <h3 className="text-base font-bold tracking-tight text-text-primary">
                {resolvedTitle}
              </h3>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
              {resolvedSubtitle}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-surface-elevated border border-border text-xs max-w-full overflow-x-auto">
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'radar'
                    ? 'bg-surface border border-border shadow-xs text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Compass className="w-3.5 h-3.5" style={{ color: activeTab === 'radar' ? actualColor : undefined }} />
                <span>Operational Pillars</span>
              </button>
              <button
                onClick={() => setActiveTab('barchart')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'barchart'
                    ? 'bg-surface border border-border shadow-xs text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: activeTab === 'barchart' ? actualColor : undefined }} />
                <span>Hours Variance</span>
              </button>
            </div>

            {/* Field Manual Guide */}
            {showFieldManualButton && (
              <button
                onClick={() => setGuideModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
                title="Open Operations Graph Field Manual"
              >
                <BookOpen className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="hidden sm:inline">Field Manual</span>
              </button>
            )}

            {/* Jump to Full Visual Analytics Studio */}
            {showFullAnalyticsLink && (
              <button
                onClick={() => setActiveView('visual_analytics')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: isPure && isDark ? 'var(--color-surface-elevated)' : actualColor,
                  color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast,
                  border: isPure && isDark ? '1px solid var(--color-border)' : undefined
                }}
                title={isStrictEmployee ? "Open your full interactive telemetry studio" : "Open full interactive Visual Analytics suite"}
              >
                <span>{isStrictEmployee ? 'Full Telemetry Studio' : 'Full Analytics Suite'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Scope Sectioning Switcher */}
        {!caseData && (
          <div className="my-4 py-2.5 px-3 rounded-xl bg-surface-elevated/70 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-text-tertiary mr-1">
                Section Scope:
              </span>
              {isStrictEmployee ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border shadow-xs text-text-primary font-bold">
                  <User className="w-3.5 h-3.5" style={{ color: actualColor }} />
                  <span>Personal &amp; Team Subordinates</span>
                </div>
              ) : (
                <>
                  {isGM && (
                    <button
                      type="button"
                      onClick={() => setActiveScope('agency')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeScope === 'agency'
                          ? 'bg-surface border border-border shadow-xs text-text-primary font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" style={{ color: activeScope === 'agency' ? actualColor : undefined }} />
                      <span>Agency-Wide</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveScope('team')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeScope === 'team'
                        ? 'bg-surface border border-border shadow-xs text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" style={{ color: activeScope === 'team' ? actualColor : undefined }} />
                    <span>Department Wide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScope('employee')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeScope === 'employee'
                        ? 'bg-surface border border-border shadow-xs text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" style={{ color: activeScope === 'employee' ? actualColor : undefined }} />
                    <span>Staff Specific</span>
                  </button>
                </>
              )}
            </div>

            {/* Drilldown pickers */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeScope === 'team' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-text-tertiary font-mono">Department:</span>
                  <select
                    value={selectedWidgetTeamId}
                    onChange={(e) => setSelectedWidgetTeamId(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-semibold text-text-primary cursor-pointer focus:outline-hidden"
                  >
                    {permittedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeScope === 'employee' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedWidgetStaffId(currentUser.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      selectedWidgetStaffId === currentUser.id
                        ? 'border-brand text-brand bg-brand-muted/20 font-bold'
                        : 'border-border text-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    Me ({currentUser.name.split(' ')[0]})
                  </button>
                  <select
                    value={selectedWidgetStaffId}
                    onChange={(e) => setSelectedWidgetStaffId(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-semibold text-text-primary cursor-pointer focus:outline-hidden max-w-[200px] truncate"
                    title={
                      permittedStaff.length === 1
                        ? "Authorized for personal telemetry only"
                        : "Select permitted staff member"
                    }
                  >
                    {permittedStaff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.id === currentUser.id ? `★ ${u.name} (Me)` : `${u.name} (${u.jobTitle})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="text-[11px] font-mono text-text-tertiary">
                {targetJobs.length} deliverable{targetJobs.length !== 1 ? 's' : ''} in view
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: 6 OPERATIONAL PILLARS RADAR */}
        {/* ============================================================== */}
        {activeTab === 'radar' && (
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Radar Chart */}
              <div className="lg:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDimensions}>
                    <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{
                        fill: isDark ? '#94a3b8' : '#475569',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={(e: any) => {
                        if (e && e.value) setSelectedRadarDim(e.value);
                      }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{
                        fill: isDark ? '#64748b' : '#94a3b8',
                        fontSize: 9
                      }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke={actualColor}
                      fill={actualColor}
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        color: tooltipColor,
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                      formatter={(val: any) => [`${val} / 100`, 'Health Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Pillar Badges & Dimension Inspector */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                  Audited Operational Pillars
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {radarDimensions.map(d => {
                    const isSelected = d.dimension === currentRadarObj.dimension;
                    const isTargetMet = d.value >= d.target;
                    return (
                      <button
                        key={d.dimension}
                        onClick={() => setSelectedRadarDim(d.dimension)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                          isSelected
                            ? 'bg-surface border-brand shadow-xs ring-1 ring-brand/40'
                            : 'bg-surface-elevated/70 border-border hover:border-brand/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-text-secondary truncate block">{d.dimension}</span>
                          <span
                            className="font-mono font-bold text-xs"
                            style={{ color: isTargetMet ? 'var(--color-success)' : 'var(--color-warning)' }}
                          >
                            {d.value}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                          <span>Target: ≥{d.target}%</span>
                          {isTargetMet ? (
                            <span className="text-emerald-500 font-bold">Pass ✓</span>
                          ) : (
                            <span className="text-amber-500 font-bold">Watch</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pillar Explainer Card */}
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{currentRadarObj.dimension}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor:
                          currentRadarObj.value >= currentRadarObj.target
                            ? 'var(--color-success-muted)'
                            : 'var(--color-warning-muted)',
                        color:
                          currentRadarObj.value >= currentRadarObj.target
                            ? 'var(--color-success)'
                            : 'var(--color-warning)'
                      }}
                    >
                      {currentRadarObj.value}% (Benchmark: ≥{currentRadarObj.target}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">{currentRadarObj.desc}</p>
                  
                  {/* Mathematical Formula from Field Manual */}
                  {(currentRadarObj as any).formula && (
                    <div className="py-1 px-2 rounded-md bg-surface border border-border/80 font-mono text-[10px] text-text-tertiary">
                      <span className="text-text-secondary font-sans font-semibold mr-1">Formula:</span>
                      {(currentRadarObj as any).formula}
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-border flex items-center justify-between gap-1.5 text-[10px] text-text-tertiary">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: actualColor }} />
                      <span className="truncate">{currentRadarObj.impact}</span>
                    </div>
                    {showFieldManualButton && (
                      <button
                        onClick={() => setGuideModalOpen(true)}
                        className="shrink-0 font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
                        title="View metric details in Graph Interpretation Manual"
                      >
                        Manual <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: HOURS VARIANCE (PLANNED VS ACTUAL) */}
        {/* ============================================================== */}
        {activeTab === 'barchart' && (
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-text-secondary">
                Deliverable hours comparison across studio categories. Highlights scope discipline and quoting precision.
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: plannedColor }} />
                  <span className="text-text-secondary">Planned Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: actualColor }} />
                  <span className="text-text-secondary">Actual Hours</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <XAxis
                    dataKey="category"
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      color: tooltipColor,
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                    formatter={(val: any, name: any) => [`${val} hrs`, name === 'planned' ? 'Planned Hours' : 'Actual Audited Hours']}
                  />
                  <Bar dataKey="planned" fill={plannedColor} radius={[4, 4, 0, 0]} name="Planned" />
                  <Bar dataKey="actual" fill={actualColor} radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Footer Audit Benchmark Strip */}
        <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
              <span>SLA Baseline: ≥85% Met</span>
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Activity className="w-3.5 h-3.5" style={{ color: actualColor }} />
              <span>Timesheet Variance: ±5.2% Margin</span>
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
              <span>Audit Cycle: Q3/Q4 2026</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-tertiary">
              Control Tower Telemetry v3.4
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* Field Manual Modal */}
      {guideModalOpen && (
        <GraphInterpretationModal
          isOpen={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          initialSection={activeTab === 'radar' ? 'radar' : 'barchart'}
        />
      )}
    </div>
  );
};
