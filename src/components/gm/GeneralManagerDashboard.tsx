import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficPulseBadge } from '../common/TrafficPulseBadge';
import { OperationalPulseRibbon } from '../common/OperationalPulseRibbon';
import { SpotlightCard } from '../common/SpotlightCard';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import { INITIAL_ARCHIVED_TASKS } from '../../data/historicTasksData';
import { getContributionCategoryBadge } from '../../utils/formatters';
import {
  Building2,
  GitPullRequestDraft,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  Globe,
  Award,
  Sunrise,
  Sunset,
  Sparkles,
  ThumbsUp,
  HelpCircle,
  Send,
  X,
  XCircle,
  RotateCcw,
  HeartHandshake,
  Cpu,
  Flame,
  Calendar,
  Eye,
  ExternalLink,
  Filter,
  BarChart3
} from 'lucide-react';
import { Job, ArchivedTaskRecord } from '../../types';
import {
  CalendarPeriodKey,
  CALENDAR_PERIODS,
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod
} from '../../utils/calendarPeriodFilter';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';

export const GeneralManagerDashboard: React.FC = () => {
  const {
    teams,
    users,
    jobs,
    archivedTasks,
    employeeCapacities,
    setSelectedEmployeeId,
    setSelectedJobId,
    setActiveView,
    setMetricTraceModal,
    getUserOvertimeSummary,
    contributions,
    verifyContribution,
    recogniseContribution,
    requestClarification,
    declineContribution,
    reopenContribution,
    openLogContributionModal,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange
  } = useApp();

  const [drilldownTeamId, setDrilldownTeamId] = useState<string | null>(null);
  const [contributionTab, setContributionTab] = useState<'all' | 'pending' | 'verified' | 'clarification' | 'declined'>('all');
  const [recognitionModalId, setRecognitionModalId] = useState<string | null>(null);
  const [recognitionNote, setRecognitionNote] = useState<string>('');
  const [clarificationModalId, setClarificationModalId] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [declineModalId, setDeclineModalId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [showAffectedDeliverablesModal, setShowAffectedDeliverablesModal] = useState<boolean>(false);
  const [showFrictionInline, setShowFrictionInline] = useState<boolean>(false);
  const [funnelScope, setFunnelScope] = useState<'period' | 'cumulative'>('period');
  const [activePerspective, setActivePerspective] = useState<'command' | 'capacity' | 'impact' | 'assurance' | 'all'>('command');

  const activePeriodConfig = React.useMemo(() => {
    if (homeCalendarPeriod === 'custom') {
      return {
        id: 'custom' as CalendarPeriodKey,
        label: `Custom Window (${homeCustomDateRange.startDate} – ${homeCustomDateRange.endDate})`,
        shortLabel: 'Custom Window',
        badge: 'Custom',
        dateRange: `${homeCustomDateRange.startDate} – ${homeCustomDateRange.endDate}`,
        description: 'User-specified calendar horizon'
      };
    }
    return CALENDAR_PERIODS.find((p) => p.id === homeCalendarPeriod) || CALENDAR_PERIODS[1];
  }, [homeCalendarPeriod, homeCustomDateRange]);

  // Scoped deliverables and archives for the selected calendar period
  const periodJobs = React.useMemo(() => {
    return jobs.filter((j) => isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange));
  }, [jobs, homeCalendarPeriod, homeCustomDateRange]);

  const periodArchived = React.useMemo(() => {
    return (archivedTasks || INITIAL_ARCHIVED_TASKS).filter((t) =>
      isArchivedInCalendarPeriod(t, homeCalendarPeriod, homeCustomDateRange)
    );
  }, [archivedTasks, homeCalendarPeriod, homeCustomDateRange]);

  // High-level organisation metrics scoped to selected calendar period
  const activeJobs = periodJobs.filter((j) => j.status !== 'completed');
  const atRiskJobs = activeJobs.filter((j) => j.isAtRisk || j.priority === 'urgent');
  const blockedJobs = activeJobs.filter((j) => j.status === 'blocked');

  // Inter-Team Flow Velocity & Handoff Constriction (Computed dynamically from deliverable logs)
  const creativeMembers = users.filter((u) => u.teamId === 'team-creative');
  const creativeAssigned = creativeMembers.reduce(
    (sum, m) => sum + (employeeCapacities[m.id]?.assignedHours || 0),
    0
  );
  const creativeCap = creativeMembers.reduce(
    (sum, m) => sum + (m.capacityHoursPerWeek || 38),
    0
  );
  const creativeSatPercent = Math.round((creativeAssigned / (creativeCap || 1)) * 100);

  const csMembers = users.filter((u) => u.teamId === 'team-client-service' || u.department === 'client_services');
  const csAssigned = csMembers.reduce(
    (sum, m) => sum + (employeeCapacities[m.id]?.assignedHours || 0),
    0
  );
  const csCap = csMembers.reduce(
    (sum, m) => sum + (m.capacityHoursPerWeek || 38),
    0
  );
  const csSatPercent = Math.round((csAssigned / (csCap || 1)) * 100);

  // Deliverables encountering handoff friction, latency, or client reverts in the selected period
  const frictionDeliverables = periodJobs.filter(
    (j) =>
      j.status === 'blocked' ||
      j.isAtRisk ||
      (j.workflowStage === 'client_service_handoff' && j.status !== 'completed') ||
      (j.clientRevertInfo && j.clientRevertInfo.revertCount > 0)
  );
  const frictionNodeCount = frictionDeliverables.length;
  const totalFrictionLatencyHours = frictionDeliverables.reduce((acc, j) => {
    const diff = Math.max(0, j.actualHours - j.estimatedHours);
    return acc + (diff > 0 ? diff : 6);
  }, 0);
  const avgHandoffLatencyHours =
    frictionNodeCount > 0 ? (totalFrictionLatencyHours / frictionNodeCount).toFixed(1) : '0';

  const reviewDeliverables = periodJobs.filter(
    (j) => j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff'
  );
  const avgGateReviewHours =
    reviewDeliverables.length > 0
      ? (reviewDeliverables.reduce((acc, j) => acc + (j.reworkEffortHours || 2.5), 0) / reviewDeliverables.length).toFixed(1)
      : '3.8';

  const onTimeJobsCount = periodJobs.filter(
    (j) => !j.isAtRisk && (j.status === 'completed' || new Date(j.dueDate).getTime() >= Date.now())
  ).length;
  const onTimeDeliveryPercent = Math.round((onTimeJobsCount / (periodJobs.length || 1)) * 100);

  // Organizational Assurance Funnel (Computed dynamically from period vs cumulative deliverables)
  const periodLiveTotal = periodJobs.length;
  const periodLiveAssigned = periodJobs.filter((j) => j.status !== 'unassigned' && !!j.assigneeId).length;
  const periodLiveExecution = periodJobs.filter(
    (j) =>
      j.status === 'in_progress' ||
      j.status === 'review' ||
      j.workflowStage === 'in_production' ||
      j.workflowStage === 'internal_review' ||
      j.workflowStage === 'client_service_handoff'
  ).length;
  const periodLiveDelivered = periodJobs.filter((j) => j.status === 'completed' || j.workflowStage === 'completed').length;
  const periodLiveVerifiedAudit = periodJobs.filter(
    (j) =>
      (j.status === 'completed' || j.workflowStage === 'completed') &&
      (!j.clientRevertInfo || j.clientRevertInfo.revertCount === 0)
  ).length;

  const periodArchiveCount = periodArchived.length;
  const periodArchiveDeliveredOnTime = periodArchived.filter((t) => t.slaStatus === 'on_time').length;

  const allLiveTotal = jobs.length;
  const allLiveAssigned = jobs.filter((j) => j.status !== 'unassigned' && !!j.assigneeId).length;
  const allLiveExecution = jobs.filter(
    (j) =>
      j.status === 'in_progress' ||
      j.status === 'review' ||
      j.workflowStage === 'in_production' ||
      j.workflowStage === 'internal_review' ||
      j.workflowStage === 'client_service_handoff'
  ).length;
  const allLiveDelivered = jobs.filter((j) => j.status === 'completed' || j.workflowStage === 'completed').length;
  const allLiveVerifiedAudit = jobs.filter(
    (j) =>
      (j.status === 'completed' || j.workflowStage === 'completed') &&
      (!j.clientRevertInfo || j.clientRevertInfo.revertCount === 0)
  ).length;

  const allArchiveCount = INITIAL_ARCHIVED_TASKS.length;
  const allArchiveDeliveredOnTime = INITIAL_ARCHIVED_TASKS.filter((t) => t.slaStatus === 'on_time').length;

  const isScopePeriod = funnelScope === 'period';

  const funnelJobsCreated = isScopePeriod
    ? periodLiveTotal + periodArchiveCount
    : allLiveTotal + allArchiveCount;
  const funnelAssigned = isScopePeriod
    ? periodLiveAssigned + periodArchiveCount
    : allLiveAssigned + allArchiveCount;
  const funnelInExecution = isScopePeriod ? periodLiveExecution : allLiveExecution;
  const funnelDelivered = isScopePeriod
    ? periodLiveDelivered + periodArchiveCount
    : allLiveDelivered + allArchiveCount;
  const funnelVerifiedAudit = isScopePeriod
    ? periodLiveVerifiedAudit + periodArchiveDeliveredOnTime
    : allLiveVerifiedAudit + allArchiveDeliveredOnTime;

  const funnelAssignedPercent = Math.round((funnelAssigned / (funnelJobsCreated || 1)) * 100);
  const funnelExecutionPercent = Math.round((funnelInExecution / (funnelJobsCreated || 1)) * 100);
  const funnelDeliveredPercent = Math.round((funnelDelivered / (funnelJobsCreated || 1)) * 100);
  const funnelAuditPercent =
    funnelDelivered > 0 ? Math.round((funnelVerifiedAudit / funnelDelivered) * 100) : 100;

  // Compute team heatmaps
  const teamHeatmaps = teams.map((team) => {
    const members = users.filter((u) => u.teamId === team.id);
    const assignedHours = members.reduce(
      (sum, m) => sum + (employeeCapacities[m.id]?.assignedHours || 0),
      0
    );
    const capacityHours = members.reduce(
      (sum, m) => sum + (m.capacityHoursPerWeek || 38),
      0
    );
    const percent = Math.round((assignedHours / (capacityHours || 1)) * 100);

    return {
      team,
      members,
      percent,
      assignedHours,
      capacityHours,
      activeCount: periodJobs.filter((j) => j.teamId === team.id && j.status !== 'completed').length
    };
  });

  return (
    <div id="general-manager-intelligence" className="space-y-8 pb-16">
      {/* 1. High-Altitude Organisational Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Executive Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-1">
              Organizational Intelligence
            </h1>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Executive birds-eye view of agency capacity, active bottlenecks, cross-department handoffs, and team performance across all departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveView('summary_matrix')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface-elevated text-text-primary hover:bg-surface transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Summary Matrix</span>
            </button>
          </div>
        </div>

        {/* Operating Date Horizon Filter */}
        <HomeDateFilterBar
          period={homeCalendarPeriod}
          onPeriodChange={setHomeCalendarPeriod}
          customRange={homeCustomDateRange}
          onCustomRangeChange={setHomeCustomDateRange}
          matchedCount={periodJobs.length}
          archivedCount={periodArchived.length}
          totalCount={jobs.length}
          label="Agency Period"
        />

        {/* Executive Perspective Lens */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border overflow-x-auto text-xs">
          {[
            { id: 'command', label: 'Command Center', icon: Activity, badge: frictionNodeCount > 0 ? `${frictionNodeCount} Alerts` : 'Optimal', isDanger: frictionNodeCount > 0 },
            { id: 'capacity', label: 'Team Capacity & Heatmap', icon: Users, badge: `${teamHeatmaps.length} Teams` },
            { id: 'impact', label: 'Strategic Impact', icon: Award, badge: `${contributions.length} Records` },
            { id: 'assurance', label: 'Assurance Funnel', icon: ShieldCheck, badge: `${onTimeDeliveryPercent}% On-Time` },
            { id: 'all', label: 'All Sections', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePerspective === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePerspective(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand' : 'text-text-tertiary'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    tab.isDanger
                      ? 'bg-amber-500/15 text-amber-500'
                      : isActive
                      ? 'bg-brand/10 text-brand'
                      : 'bg-surface text-text-tertiary'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2 & 3. COMMAND CENTER PERSPECTIVE */}
      {(activePerspective === 'command' || activePerspective === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 2. Macro Operational Pulse Ribbon */}
          <OperationalPulseRibbon
            contextTitle="Enterprise Operational Horizon"
            scopeSubtitle="Active cross-functional capacity and SLA adherence"
          />

          {/* 3. INTERACTIVE CROSS-TEAM PIPELINE & HANDOFF CONSTRICTION */}
          <section className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <GitPullRequestDraft className="w-4 h-4 text-brand" />
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Inter-Team Flow Velocity &amp; Handoff Constriction
              </h2>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">
              Dynamically computed from active deliverable stage transitions, blocker logs, and SLA variances.
            </p>
          </div>

          <span
            className="text-xs font-mono font-semibold flex items-center gap-1.5"
            style={{
              color: frictionNodeCount > 0 ? 'var(--color-warning)' : 'var(--color-success)'
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: frictionNodeCount > 0 ? 'var(--color-warning)' : 'var(--color-success)'
              }}
            />
            {frictionNodeCount} Active Friction {frictionNodeCount === 1 ? 'Node' : 'Nodes'} Identified
          </span>
        </div>

        {/* Visual Pipeline Schematic */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center">
            {/* Step 1: Creative Team */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Source Team</span>
              <div className="font-bold text-text-primary text-sm">Creative Design</div>
              <div className="text-xs font-mono text-brand font-semibold">
                {creativeSatPercent}% Saturation
              </div>
            </div>

            {/* Constriction Connector */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div
                className="w-full flex items-center justify-center gap-1 text-xs"
                style={{ color: frictionNodeCount > 0 ? 'var(--color-critical)' : 'var(--color-success)' }}
              >
                <span className="h-0.5 flex-1 bg-border" />
                {frictionNodeCount > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <span className="h-0.5 flex-1 bg-border" />
              </div>
              <span
                className="text-[10px] font-mono font-bold uppercase mt-1"
                style={{ color: frictionNodeCount > 0 ? 'var(--color-critical)' : 'var(--color-success)' }}
              >
                {avgHandoffLatencyHours}h Latency
              </span>
            </div>

            {/* Step 2: Target Team */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Target Team</span>
              <div className="font-bold text-text-primary text-sm">Client Service</div>
              <div className="text-xs font-mono text-amber-500 font-semibold">
                {csSatPercent}% Saturation
              </div>
            </div>

            {/* Step 3: Handoff Gate */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="w-full flex items-center justify-center gap-1 text-emerald-500 text-xs">
                <span className="h-0.5 flex-1 bg-border" />
                <ArrowRight className="w-4 h-4 shrink-0" />
                <span className="h-0.5 flex-1 bg-border" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase mt-1 text-emerald-500">
                {avgGateReviewHours}h Gate Review
              </span>
            </div>

            {/* Step 4: Final Verification */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border text-center space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Outcome Gate</span>
              <div className="font-bold text-text-primary text-sm">Client Delivery</div>
              <div className="text-xs font-mono text-emerald-500 font-semibold">
                {onTimeDeliveryPercent}% On-Time
              </div>
            </div>
          </div>

          {/* Deep-dive into the constriction */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-brand">
                Bottleneck Root Cause Analysis ({activePeriodConfig.shortLabel}):
              </span>
              <p className="text-text-secondary leading-relaxed">
                {frictionNodeCount > 0
                  ? `${frictionNodeCount} active deliverable${frictionNodeCount === 1 ? '' : 's'} are experiencing latency (average ${avgHandoffLatencyHours}h above estimate) during production handoffs, revisions, or client reviews.`
                  : `All operational handoffs between Creative and Client Service are tracking cleanly in ${activePeriodConfig.shortLabel} with zero blocking constrictions.`}
              </p>
            </div>

            {frictionNodeCount > 0 && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAffectedDeliverablesModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-1.5 bg-brand text-brand-contrast"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect ({frictionNodeCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFrictionInline((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface hover:bg-surface-hover text-text-secondary cursor-pointer transition-colors"
                >
                  {showFrictionInline ? 'Hide List' : 'Preview'}
                </button>
              </div>
            )}
          </div>

          {/* Quick inline preview of affected deliverables if toggled */}
          {showFrictionInline && frictionDeliverables.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-text-secondary border-b border-border/60 pb-2">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Deliverable Handoff Constriction Manifest ({frictionDeliverables.length})
                </span>
                <span className="text-[11px] text-text-tertiary">Select any deliverable to examine live dossier</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {frictionDeliverables.map((deliv) => {
                  const assignee = users.find((u) => u.id === deliv.assigneeId);
                  const variance = deliv.actualHours - deliv.estimatedHours;
                  return (
                    <div
                      key={deliv.id}
                      onClick={() => setSelectedJobId(deliv.id)}
                      className="p-3 rounded-lg bg-surface border border-border/80 hover:border-[var(--color-brand)] transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs group-hover:text-[var(--color-brand)] transition-colors">
                            {deliv.id}
                          </span>
                          <span className="text-[10px] font-mono text-text-tertiary">
                            · {deliv.workflowStage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-500 font-bold">
                          {variance > 0 ? `+${variance}h latency` : deliv.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-text-primary line-clamp-1">
                        {deliv.title}
                      </div>
                      <div className="text-[11px] text-text-tertiary flex items-center justify-between">
                        <span>{deliv.clientProject}</span>
                        <span className="font-mono">{assignee?.name || 'Unassigned'}</span>
                      </div>
                      {(deliv.blockerReason || deliv.clientRevertInfo?.rootCauseReason) && (
                        <div className="text-[10px] text-text-secondary italic bg-surface-elevated/80 p-1.5 rounded border border-border/60">
                          {deliv.blockerReason || deliv.clientRevertInfo?.rootCauseReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
      )}

      {/* 3.5 & 4. TEAM CAPACITY & HEATMAP PERSPECTIVE */}
      {(activePerspective === 'capacity' || activePerspective === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 3.5. EXECUTIVE VISUAL ANALYTICS TELEMETRY RADAR */}
          <VisualAnalyticsWidget
            scope="agency"
            title="Executive Visual Analytics & Operational Radar Telemetry"
            subtitle={`Agency-wide telemetry for ${activePeriodConfig.label}. Quantifies deliverable hours variance, quoting accuracy, and six studio operational pillars.`}
          />

          {/* 4. ORGANISATIONAL HEATMAP (Progressive Disclosure) */}
          <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Team Saturation & Runway Heatmap
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">
              Progressive disclosure navigation: Organisation ➔ Department ➔ Individual Workstream.
            </p>
          </div>
          <span className="text-xs font-mono text-text-tertiary">Real-time capacity density</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teamHeatmaps.map(({ team, members, percent, assignedHours, capacityHours, activeCount }) => {
            const isSelected = drilldownTeamId === team.id;
            const isHigh = percent >= 85;

            return (
              <SpotlightCard
                key={team.id}
                onClick={() => setDrilldownTeamId(isSelected ? null : team.id)}
                className="p-5 cursor-pointer space-y-4"
                style={isSelected ? {
                  borderColor: 'var(--color-brand)',
                  boxShadow: '0 0 20px var(--color-halo-glow, rgba(3,193,214,0.3))'
                } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-base text-text-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      {team.name}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      {members.length} Members · {activeCount} Active Deliverables
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className={`text-lg font-bold ${isHigh ? 'text-amber-500' : 'text-text-primary'}`}>
                      {percent}%
                    </span>
                    <span className="text-[10px] text-text-tertiary block">saturation</span>
                  </div>
                </div>

                {/* Visual Capacity Bar */}
                <div className="w-full h-2 rounded-full bg-surface-elevated border border-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent > 90 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-brand-primary'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border/40 font-mono">
                  <span>{assignedHours} / {capacityHours}h committed</span>
                  <span className="text-brand-primary font-bold flex items-center gap-1 font-sans">
                    {isSelected ? 'Collapse' : 'Drill Down'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Drill-down section */}
        {drilldownTeamId && (
          <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono uppercase font-bold text-text-tertiary">
              <span>Team Member Lanes: {teams.find((t) => t.id === drilldownTeamId)?.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {users
                .filter((u) => u.teamId === drilldownTeamId)
                .map((member) => {
                  const cap = employeeCapacities[member.id];
                  const ot = getUserOvertimeSummary(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedEmployeeId(member.id)}
                      className="p-3.5 rounded-xl bg-surface border border-border/70 hover:border-brand-primary/50 cursor-pointer space-y-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary text-xs truncate">
                          {member.name}
                        </span>
                        <TrafficPulseBadge state={cap?.trafficState || 'clear'} size="sm" showDetails={false} />
                      </div>
                      <div className="text-[11px] text-text-tertiary font-mono">
                        {cap?.capacityPercent}% saturation · {cap?.activeJobsCount} jobs
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-border/50">
                        <span className="font-bold" style={{ color: ot.totalHours > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>
                          {ot.totalHours > 0 ? `+${ot.totalHours}h OT` : '9-5 Baseline'}
                        </span>
                        <span className="font-bold flex items-center gap-0.5" style={{ color: 'var(--color-success)' }}>
                          <Award className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                          +{ot.recognitionPoints} pts recognition
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>
        </div>
      )}

      {/* 5. EXECUTIVE STRATEGIC RECOGNITION & VERIFIED IMPACT */}
      {(activePerspective === 'impact' || activePerspective === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {(() => {
        const verifiedContribs = contributions.filter((c) => c.status === 'VERIFIED' || c.status === 'RECOGNISED');
        const pendingReview = contributions.filter((c) => c.status === 'SUBMITTED');
        const needsClarification = contributions.filter((c) => c.status === 'CLARIFICATION_REQUIRED');

        const deliveryCount = contributions.filter((c) => c.category === 'exceptional_delivery').length;
        const clientCount = contributions.filter((c) => c.category === 'client_impact').length;
        const collabCount = contributions.filter((c) => c.category === 'collaboration').length;
        const craftCount = contributions.filter((c) => c.category === 'craft_quality').length;
        const processCount = contributions.filter((c) => c.category === 'process_improvement').length;

        return (
          <section className="p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                  <h2 className="text-lg font-bold text-text-primary tracking-tight">
                    Strategic Recognition &amp; Verified Impact
                  </h2>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-3xl mt-1">
                  Executive oversight into verified contribution across all 7 impact dimensions: Exceptional Delivery, Client Impact, Collaboration, Craft &amp; Quality, Process Improvement, Operational Support, and Exceptional Effort.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => openLogContributionModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity hover:opacity-90 shrink-0"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Submit Strategic Nomination</span>
                </button>

                <span
                  className="px-3 py-1 rounded-xl font-mono text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--color-success-muted)',
                    borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
                    color: 'var(--color-success)'
                  }}
                >
                  {verifiedContribs.length} Verified Entries
                </span>
                {pendingReview.length > 0 && (
                  <span
                    className="px-3 py-1 rounded-xl font-mono text-xs font-bold border"
                    style={{
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    {pendingReview.length} Pending Review
                  </span>
                )}
              </div>
            </div>

            {/* High Level Macro Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60">
                <span className="text-[10px] font-mono uppercase text-text-tertiary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                  <span>Delivery Rescues</span>
                </span>
                <div className="text-xl font-extrabold font-mono text-text-primary mt-1">
                  {deliveryCount}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono mt-0.5">Critical saves &amp; deliveries</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60">
                <span className="text-[10px] font-mono uppercase text-text-tertiary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                  <span>Client Impact</span>
                </span>
                <div className="text-xl font-extrabold font-mono text-text-primary mt-1">
                  {clientCount}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono mt-0.5">SLA &amp; trust preserved</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60">
                <span className="text-[10px] font-mono uppercase text-text-tertiary flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-text-secondary" />
                  <span>Collaboration</span>
                </span>
                <div className="text-xl font-extrabold font-mono text-text-primary mt-1">
                  {collabCount}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono mt-0.5">Cross-team unblockers</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60">
                <span className="text-[10px] font-mono uppercase text-text-tertiary flex items-center gap-1">
                  <Award className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                  <span>Craft &amp; Quality</span>
                </span>
                <div className="text-xl font-extrabold font-mono text-text-primary mt-1">
                  {craftCount}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono mt-0.5">Agency bar raised</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60">
                <span className="text-[10px] font-mono uppercase text-text-tertiary flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-text-secondary" />
                  <span>Process Innovation</span>
                </span>
                <div className="text-xl font-extrabold font-mono text-text-primary mt-1">
                  {processCount}
                </div>
                <div className="text-[10px] text-text-tertiary font-mono mt-0.5">Automations &amp; tooling</div>
              </div>
            </div>

            {/* Contributions Ledger Feed */}
            {(() => {
              const pendingCount = contributions.filter((c) => c.status === 'SUBMITTED' || c.status === 'DRAFT').length;
              const verifiedEndorsedCount = contributions.filter((c) => c.status === 'VERIFIED' || c.status === 'RECOGNISED').length;
              const clarificationCount = contributions.filter((c) => c.status === 'CLARIFICATION_REQUIRED').length;
              const declinedCount = contributions.filter((c) => c.status === 'DECLINED').length;

              const filteredContributions = contributions.filter((c) => {
                if (contributionTab === 'pending') return c.status === 'SUBMITTED' || c.status === 'DRAFT';
                if (contributionTab === 'verified') return c.status === 'VERIFIED' || c.status === 'RECOGNISED';
                if (contributionTab === 'clarification') return c.status === 'CLARIFICATION_REQUIRED';
                if (contributionTab === 'declined') return c.status === 'DECLINED';
                return true;
              });

              return (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="text-xs font-mono uppercase font-bold text-text-tertiary">
                      Agency Contributions &amp; Executive Endorsements ({contributions.length})
                    </div>

                    {/* Filter Status Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs font-mono">
                      {[
                        { id: 'all', label: `All (${contributions.length})` },
                        { id: 'pending', label: `Pending (${pendingCount})` },
                        { id: 'verified', label: `Verified (${verifiedEndorsedCount})` },
                        { id: 'clarification', label: `Clarify (${clarificationCount})` },
                        { id: 'declined', label: `Declined (${declinedCount})` }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setContributionTab(tab.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                            contributionTab === tab.id
                              ? 'bg-surface-elevated text-text-primary border-border shadow-xs'
                              : 'text-text-tertiary hover:text-text-secondary border-transparent'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredContributions.length === 0 ? (
                    <div className="p-8 rounded-xl border border-border bg-surface text-center space-y-1.5">
                      <Award className="w-6 h-6 text-text-tertiary mx-auto opacity-50" />
                      <div className="text-xs font-semibold text-text-secondary">
                        No contributions in this filter view.
                      </div>
                      <p className="text-[11px] text-text-tertiary">
                        Switch filters or view all entries to audit recorded contributions.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1">
                      {filteredContributions.map((c) => {
                        const employee = users.find((u) => u.id === c.employeeId);
                        const team = teams.find((t) => t.id === employee?.teamId);

                        return (
                          <SpotlightCard key={c.id} className="p-4 space-y-3 flex flex-col justify-between">
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-text-primary">
                                      {c.employeeName}
                                    </span>
                                    <span className="text-[10px] font-mono text-text-tertiary">
                                      · {team?.name || 'Tibule Agency'}
                                    </span>
                                    {c.relatedJobId && (
                                      <span className="text-[10px] font-mono text-text-tertiary">
                                        [{c.relatedJobId}]
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-text-primary mt-1">
                                    {c.title}
                                  </h4>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {(() => {
                                    const catBadge = getContributionCategoryBadge(c.category);
                                    return (
                                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${catBadge.badgeClass}`}>
                                        {catBadge.label}
                                      </span>
                                    );
                                  })()}

                                  {/* Status Indicator Chip */}
                                  {c.status === 'RECOGNISED' && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <Award className="w-3 h-3" /> Endorsed
                                    </span>
                                  )}
                                  {c.status === 'VERIFIED' && (
                                    <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Verified
                                    </span>
                                  )}
                                  {c.status === 'CLARIFICATION_REQUIRED' && (
                                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                      <HelpCircle className="w-3 h-3" /> Clarify Pending
                                    </span>
                                  )}
                                  {c.status === 'DECLINED' && (
                                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Declined
                                    </span>
                                  )}
                                  {(c.status === 'SUBMITTED' || c.status === 'DRAFT') && (
                                    <span className="text-[10px] font-mono text-text-tertiary">
                                      Pending Review
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] text-text-secondary leading-relaxed">
                                {c.description}
                              </p>

                              {/* Verified Impact Note */}
                              <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-1">
                                <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                                  Verified Impact:
                                </span>
                                <p className="text-text-primary leading-relaxed font-medium text-[11px]">
                                  {c.impactStatement}
                                </p>
                              </div>

                              {/* Executive Endorsement Note */}
                              {c.recognitionNote && (
                                <div
                                  className="p-2 rounded border text-[11px] italic"
                                  style={{
                                    backgroundColor: 'var(--color-success-muted)',
                                    borderColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)',
                                    color: 'var(--color-success)'
                                  }}
                                >
                                  Executive Endorsement: &ldquo;{c.recognitionNote}&rdquo; - {c.recognisedByName || 'GM'}
                                </div>
                              )}

                              {/* Clarification Request Details */}
                              {c.status === 'CLARIFICATION_REQUIRED' && c.clarifications && c.clarifications.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold font-mono text-[10px] uppercase">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>Clarification Requested:</span>
                                  </div>
                                  <p className="text-[11px] text-text-primary leading-relaxed italic">
                                    &ldquo;{c.clarifications[0].question}&rdquo;
                                  </p>
                                  {c.clarifications[0].response && (
                                    <div className="p-2 rounded bg-surface/80 border border-amber-500/20 text-[11px] mt-1">
                                      <span className="font-bold text-text-primary block text-[10px] font-mono">Contributor Reply:</span>
                                      <span className="text-text-secondary">{c.clarifications[0].response}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Prominent Declined Banner */}
                              {c.status === 'DECLINED' && (
                                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold font-mono text-[10px] uppercase">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Declined Entry:</span>
                                  </div>
                                  <p className="text-[11px] text-text-primary leading-relaxed font-medium">
                                    &ldquo;{c.declineReason || 'Declined during executive review.'}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs gap-2 flex-wrap">
                              <div className="text-[10px] font-mono text-text-tertiary">
                                {c.contributionDate} · {c.status}
                              </div>

                              {c.status === 'DECLINED' ? (
                                <div className="flex items-center gap-2 ml-auto">
                                  <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                                    Declined
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => reopenContribution(c.id)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                                    title="Re-open this entry for review"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Re-evaluate</span>
                                  </button>
                                </div>
                              ) : c.status === 'CLARIFICATION_REQUIRED' ? (
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => verifyContribution(c.id)}
                                    className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    style={{
                                      backgroundColor: 'var(--color-brand-muted)',
                                      borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                                      color: 'var(--color-brand)'
                                    }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verify</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeclineModalId(c.id);
                                      setDeclineReason('');
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 ml-auto">
                                  {c.status !== 'RECOGNISED' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRecognitionModalId(c.id);
                                        setRecognitionNote('');
                                      }}
                                      className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                      style={{
                                        backgroundColor: 'var(--color-success-muted)',
                                        borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
                                        color: 'var(--color-success)'
                                      }}
                                    >
                                      <Award className="w-3.5 h-3.5" />
                                      <span>Recognise</span>
                                    </button>
                                  )}

                                  {c.status !== 'VERIFIED' && c.status !== 'RECOGNISED' && (
                                    <button
                                      type="button"
                                      onClick={() => verifyContribution(c.id)}
                                      className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                      style={{
                                        backgroundColor: 'var(--color-brand-muted)',
                                        borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                                        color: 'var(--color-brand)'
                                      }}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Verify</span>
                                    </button>
                                  )}

                                  {c.status !== 'CLARIFICATION_REQUIRED' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClarificationModalId(c.id);
                                        setClarificationQuestion('');
                                      }}
                                      className="px-2 py-1 rounded-lg border border-border hover:bg-surface-elevated text-text-tertiary hover:text-text-primary text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <HelpCircle className="w-3 h-3" />
                                      <span>Clarify</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeclineModalId(c.id);
                                      setDeclineReason('');
                                    }}
                                    className="px-2 py-1 text-xs text-text-tertiary hover:text-status-danger cursor-pointer transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </SpotlightCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Recognition Modal */}
            {recognitionModalId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-success)' }}>
                      <Award className="w-4 h-4" />
                      <span>Confer Executive Recognition</span>
                    </div>
                    <button onClick={() => setRecognitionModalId(null)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Add a permanent executive commendation to this employee's career progression dossier:
                  </p>
                  <textarea
                    rows={3}
                    value={recognitionNote}
                    onChange={(e) => setRecognitionNote(e.target.value)}
                    placeholder="e.g. Endorsed by General Manager for exceptional client save and dedication."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRecognitionModalId(null)}
                      className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        recogniseContribution(recognitionModalId, recognitionNote.trim() || undefined);
                        setRecognitionModalId(null);
                      }}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-opacity hover:opacity-90 shadow-xs"
                      style={{
                        backgroundColor: 'var(--color-brand)',
                        color: 'var(--color-brand-contrast)'
                      }}
                    >
                      Confer Endorsement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Clarification Modal */}
            {clarificationModalId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-warning)' }}>
                      <HelpCircle className="w-4 h-4" />
                      <span>Request Impact Clarification</span>
                    </div>
                    <button onClick={() => setClarificationModalId(null)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Ask for additional context or evidence before recording verification:
                  </p>
                  <textarea
                    rows={3}
                    value={clarificationQuestion}
                    onChange={(e) => setClarificationQuestion(e.target.value)}
                    placeholder="e.g. Can you clarify how this automation impacted team throughput?"
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                  />
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = clarificationModalId;
                        setClarificationModalId(null);
                        setDeclineModalId(targetId);
                        setDeclineReason('');
                      }}
                      className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer font-medium"
                    >
                      Decline Instead
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setClarificationModalId(null)}
                        className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (clarificationQuestion.trim()) {
                            requestClarification(clarificationModalId, clarificationQuestion.trim());
                            setClarificationModalId(null);
                          }
                        }}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-opacity hover:opacity-90 shadow-xs"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Decline Contribution Modal */}
            {declineModalId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-status-danger">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Decline Contribution Entry</span>
                    </div>
                    <button onClick={() => setDeclineModalId(null)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Provide a transparent reason for declining this contribution entry so the contributor has clarity:
                  </p>
                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g. Activity falls within regular sprint responsibilities or requires verifiable client metric..."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-status-danger"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setDeclineModalId(null)}
                      className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const finalReason = declineReason.trim() || 'Entry declined during executive review.';
                        declineContribution(declineModalId, finalReason);
                        setDeclineModalId(null);
                      }}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-opacity hover:opacity-90 shadow-xs bg-rose-600 text-white"
                    >
                      Confirm Decline
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}
        </div>
      )}

      {/* 6. ORGANIZATIONAL ASSURANCE FUNNEL (Section 35) */}
      {(activePerspective === 'assurance' || activePerspective === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <section className="p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Organizational Assurance Funnel
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border text-xs">
            <button
              type="button"
              onClick={() => setFunnelScope('period')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                funnelScope === 'period'
                  ? 'bg-surface border border-border shadow-xs text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Selected Period: {activePeriodConfig.shortLabel} ({funnelJobsCreated})
            </button>
            <button
              type="button"
              onClick={() => setFunnelScope('cumulative')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                funnelScope === 'cumulative'
                  ? 'bg-surface border border-border shadow-xs text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Records ({allLiveTotal + allArchiveCount})
            </button>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
          Tibule measures work by concrete deliverable milestones, review signoffs, and auditable client receipts. All funnel figures are dynamically derived from active deliverable logs and historical records for the selected period.
        </p>

        {/* 5-Step Continuous Funnel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center pt-2">
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-text-primary">{funnelJobsCreated}</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Jobs Catalogued</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">100% indexed in registry</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono" style={{ color: 'var(--color-brand)' }}>
              {funnelAssigned}
            </span>
            <div className="text-xs font-bold text-text-secondary mt-1">Assigned</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">{funnelAssignedPercent}% allocated</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono" style={{ color: 'var(--color-warning)' }}>
              {funnelInExecution}
            </span>
            <div className="text-xs font-bold text-text-secondary mt-1">In Execution</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">{funnelExecutionPercent}% active in execution</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono" style={{ color: 'var(--color-success)' }}>
              {funnelDelivered}
            </span>
            <div className="text-xs font-bold text-text-secondary mt-1">Delivered</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">{funnelDeliveredPercent}% fulfillment rate</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-text-primary">{funnelVerifiedAudit}</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Verified Audit</div>
            <div className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--color-success)' }}>
              {funnelAuditPercent}% zero client reverts
            </div>
          </div>
        </div>
      </section>
        </div>
      )}

      {/* Affected Deliverables Deep-Dive Modal */}
      {showAffectedDeliverablesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/70 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="p-1.5 rounded-lg border text-xs font-mono font-bold"
                    style={{
                      backgroundColor: 'var(--color-warning-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                      color: 'var(--color-warning)'
                    }}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-text-primary">
                    Impacted Deliverables Deep-Dive ({frictionNodeCount})
                  </h3>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Real deliverable log audit for <strong className="text-text-primary">{activePeriodConfig.label}</strong>. These deliverables have active SLA variances, pending client reverts, or blocking dependencies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAffectedDeliverablesModal(false)}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Deliverables List */}
            <div className="p-5 overflow-y-auto space-y-4 divide-y divide-border/40">
              {frictionDeliverables.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-text-primary">No Constrictions in Selected Period</p>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    All active deliverables in {activePeriodConfig.label} are tracking cleanly within scoped SLA windows.
                  </p>
                </div>
              ) : (
                frictionDeliverables.map((deliv) => {
                  const assignee = users.find((u) => u.id === deliv.assigneeId);
                  const team = teams.find((t) => t.id === deliv.teamId);
                  const variance = deliv.actualHours - deliv.estimatedHours;
                  const isBlocked = deliv.status === 'blocked';
                  const isRevert = deliv.clientRevertInfo && deliv.clientRevertInfo.revertCount > 0;

                  return (
                    <div key={deliv.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-text-primary">
                              {deliv.id}
                            </span>
                            <span className="text-xs font-bold text-text-primary">
                              {deliv.title}
                            </span>
                            {deliv.isAtRisk && (
                              <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                                · At Risk
                              </span>
                            )}
                            {isBlocked && (
                              <span className="text-[10px] font-mono font-bold uppercase text-rose-500">
                                · Blocked
                              </span>
                            )}
                            {isRevert && (
                              <span className="text-[10px] font-mono font-bold uppercase text-purple-400">
                                · Revert ({deliv.clientRevertInfo?.revertCount}x)
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-text-secondary flex items-center gap-3">
                            <span>Client: <strong className="text-text-primary">{deliv.clientProject}</strong></span>
                            <span>•</span>
                            <span>Team: <strong className="text-text-primary">{team?.name || 'Studio'}</strong></span>
                            <span>•</span>
                            <span>Assignee: <strong className="text-text-primary">{assignee?.name || 'Unassigned'}</strong></span>
                          </div>
                        </div>

                        {/* Latency & Variance Metric */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-500 block">
                            {variance > 0 ? `+${variance}h Over Estimate` : `${deliv.actualHours}h logged / ${deliv.estimatedHours}h est`}
                          </span>
                          <span className="text-[10px] font-mono text-text-tertiary">
                            Stage: {deliv.workflowStage.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Specific Blocker / Revert Cause Callout */}
                      {(deliv.blockerReason || deliv.clientRevertInfo?.rootCauseReason) && (
                        <div className="p-2.5 rounded-lg bg-surface border border-border/80 text-xs space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
                            Friction Root Cause:
                          </span>
                          <p className="text-text-secondary leading-relaxed">
                            {deliv.blockerReason || deliv.clientRevertInfo?.rootCauseReason}
                          </p>
                        </div>
                      )}

                      {/* Direct Action Buttons to Inspect Deliverable */}
                      <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobId(deliv.id);
                            setActiveView('agency_workflow');
                            setShowAffectedDeliverablesModal(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Workflow Engine</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobId(deliv.id);
                            setActiveView('master_table');
                            setShowAffectedDeliverablesModal(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Master Schedule</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobId(deliv.id);
                            setShowAffectedDeliverablesModal(false);
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer flex items-center gap-1.5"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Deliverable Dossier</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface/50 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-tertiary font-mono">
                Clicking "Inspect Deliverable Dossier" loads the live audit logs into the side inspector.
              </span>
              <button
                type="button"
                onClick={() => setShowAffectedDeliverablesModal(false)}
                className="px-4 py-1.5 rounded-lg border border-border bg-surface text-text-primary font-bold hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
