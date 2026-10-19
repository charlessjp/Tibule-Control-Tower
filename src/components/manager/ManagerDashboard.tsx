import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficPulseBadge } from '../common/TrafficPulseBadge';
import { OperationalPulseRibbon } from '../common/OperationalPulseRibbon';
import { CapacityMeter } from '../common/CapacityMeter';
import { SpotlightCard } from '../common/SpotlightCard';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';
import {
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod
} from '../../utils/calendarPeriodFilter';
import { getContributionCategoryBadge } from '../../utils/formatters';
import {
  Radio,
  AlertTriangle,
  RefreshCw,
  Users,
  Briefcase,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Inbox,
  Filter,
  ArrowUpDown,
  Zap,
  Sliders,
  ChevronRight,
  Lock,
  Clock,
  Award,
  Sunrise,
  Sunset,
  ThumbsUp,
  HelpCircle,
  Send,
  X,
  XCircle,
  RotateCcw,
  HeartHandshake,
  Cpu,
  Flame,
  BarChart3
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    currentUser,
    teams,
    users,
    jobs,
    employeeCapacities,
    exceptions,
    setSelectedEmployeeId,
    setSelectedJobId,
    setActiveView,
    rebalanceWorkload,
    resolveException,
    resolveBlocker,
    setMetricTraceModal,
    getUserOvertimeSummary,
    contributions,
    verifyContribution,
    requestClarification,
    declineContribution,
    reopenContribution,
    openLogContributionModal,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange,
    archivedTasks,
    deliveryImpactLogs,
    openLogDeliveryImpactModal,
    acknowledgeDeliveryImpact,
    resolveDeliveryImpact,
    grantDeadlineExtension
  } = useApp();

  const [clarificationModalId, setClarificationModalId] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [declineModalId, setDeclineModalId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');

  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';

  // Managers are strictly locked to their own team; General Managers have agency-wide switching
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    currentUser.teamId || 'team-creative'
  );

  useEffect(() => {
    if (!isGM && currentUser.teamId) {
      setSelectedTeamId(currentUser.teamId);
    }
  }, [currentUser.teamId, isGM]);

  const effectiveTeamId = isGM ? selectedTeamId : (currentUser.teamId || teams[0]?.id);
  const currentTeam = teams.find((t) => t.id === effectiveTeamId) || teams[0];
  const teamMembers = users.filter((u) => u.teamId === currentTeam.id);
  const teamJobs = jobs.filter((j) => j.teamId === currentTeam.id);

  // Deliverables scoped to calendar period
  const periodTeamJobs = React.useMemo(() => {
    return teamJobs.filter((j) => isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange));
  }, [teamJobs, homeCalendarPeriod, homeCustomDateRange]);

  const periodArchivedTeam = React.useMemo(() => {
    return (archivedTasks || []).filter(
      (t) => (t.teamId === currentTeam.id || teamMembers.some((m) => m.id === t.assigneeId)) &&
        isArchivedInCalendarPeriod(t, homeCalendarPeriod, homeCustomDateRange)
    );
  }, [archivedTasks, currentTeam.id, teamMembers, homeCalendarPeriod, homeCustomDateRange]);

  const activeJobs = periodTeamJobs.filter((j) => j.status !== 'completed');

  // Operational metrics scoped to selected calendar period
  const atRiskCount = activeJobs.filter((j) => j.isAtRisk || j.priority === 'urgent').length;
  const blockedCount = activeJobs.filter((j) => j.status === 'blocked').length;
  const unassignedJobs = periodTeamJobs.filter((j) => j.status === 'unassigned' || !j.assigneeId);

  const totalAssignedHours = teamMembers.reduce(
    (sum, m) => sum + (employeeCapacities[m.id]?.assignedHours || 0),
    0
  );
  const totalCapacityHours = teamMembers.reduce(
    (sum, m) => sum + (m.capacityHoursPerWeek || 38),
    0
  );
  const projectedCapacityPercent = Math.round((totalAssignedHours / (totalCapacityHours || 1)) * 100);

  // Overloaded member identification for Rebalancing
  const overloadedMember = teamMembers.find(
    (m) => (employeeCapacities[m.id]?.capacityPercent || 0) >= 95
  );
  const availableMember = teamMembers.find(
    (m) => (employeeCapacities[m.id]?.capacityPercent || 0) < 70 && m.id !== overloadedMember?.id
  );
  const rebalanceJob = jobs.find(
    (j) => j.assigneeId === overloadedMember?.id && j.status !== 'completed'
  );

  // Dynamic Rebalance Capacity Projections
  const rebalanceHours = rebalanceJob?.estimatedHours || 6;
  const donorCurrentHours = overloadedMember ? (employeeCapacities[overloadedMember.id]?.committedHours || 44) : 44;
  const donorProjectedPct = Math.max(0, Math.round(((donorCurrentHours - rebalanceHours) / 40.0) * 100));

  const recipientCurrentHours = availableMember ? (employeeCapacities[availableMember.id]?.committedHours || 24) : 24;
  const recipientProjectedPct = Math.min(150, Math.round(((recipientCurrentHours + rebalanceHours) / 40.0) * 100));

  return (
    <div id="manager-command-centre" className="space-y-8 pb-16">
      {/* 1. Team Management Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
              <span>Studio Operations &amp; Team Horizons</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
                {currentTeam.name}
              </h1>

              {isGM ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                    GM Team View:
                  </span>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="text-xs font-mono font-bold bg-surface-elevated border border-border rounded-xl px-3 py-1.5 text-text-secondary focus:outline-none focus:border-brand-primary cursor-pointer"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        Team: {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold bg-surface-elevated border-border text-text-secondary select-none"
                  title="Your manager view is strictly locked to your assigned team. Cross-team filtering belongs strictly to the General Manager."
                >
                  <Lock className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>Studio: {currentTeam.name}</span>
                  <span className="text-[10px] text-text-tertiary font-mono font-normal">
                    · Locked
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-tertiary mt-1">
              Monitor your team&apos;s live bandwidth, balance task allocations, and unblock deliverables before deadlines slip.
            </p>
          </div>

          {/* Quick Intervention Counters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">Intake Queue:</span>
              <span
                className="font-bold"
                style={{ color: unassignedJobs.length > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}
              >
                {unassignedJobs.length} Unallocated
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">Active Blocks:</span>
              <span
                className="font-bold"
                style={{ color: blockedCount > 0 ? 'var(--color-brand)' : 'var(--color-text-primary)' }}
              >
                {blockedCount} Held
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">SLA Risk:</span>
              <span
                className="font-bold"
                style={{ color: atRiskCount > 0 ? 'var(--color-critical)' : 'var(--color-success)' }}
              >
                {atRiskCount} Critical
              </span>
            </div>
          </div>
        </div>

        {/* Operating Date Horizon Filter */}
        <HomeDateFilterBar
          period={homeCalendarPeriod}
          onPeriodChange={setHomeCalendarPeriod}
          customRange={homeCustomDateRange}
          onCustomRangeChange={setHomeCustomDateRange}
          matchedCount={periodTeamJobs.length}
          archivedCount={periodArchivedTeam.length}
          totalCount={teamJobs.length}
          label="Team Period"
        />
      </section>

      {/* 2. Operational Pulse Ribbon */}
      <OperationalPulseRibbon
        contextTitle={`${currentTeam.name} Live Metrics`}
        scopeSubtitle="Active deliverable throughput & buffer resistance"
      />

      {/* 3. SIGNATURE INTERFACE: LIVE TEAM TRAFFIC & CAPACITY HORIZONS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-primary animate-pulse" />
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                Live Team Traffic & Capacity Horizons
              </h2>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">
              Horizontal workload lanes with real-time saturation depth. Click any team member to inspect their lane.
            </p>
          </div>

          <div className="text-xs font-mono text-text-tertiary flex items-center gap-2">
            <span>Overall Team Saturation:</span>
            <span className="font-bold text-text-primary text-sm">{projectedCapacityPercent}%</span>
          </div>
        </div>

        {/* Spatial Lane Visualization (Not spreadsheet grid!) */}
        <div className="space-y-3">
          {teamMembers.map((member) => {
            const cap = employeeCapacities[member.id] || {
              capacityPercent: 50,
              assignedHours: 19,
              capacityHoursPerWeek: 38,
              activeJobsCount: 2,
              dueSoonCount: 0,
              blockedCount: 0,
              trafficState: 'clear'
            };

            const ot = getUserOvertimeSummary(member.id);
            const isOver = cap.capacityPercent >= 95;
            const isNear = cap.capacityPercent >= 80;

            return (
              <SpotlightCard
                key={member.id}
                onClick={() => setSelectedEmployeeId(member.id)}
                className="p-4 cursor-pointer"
                style={isOver ? {
                  borderColor: 'rgba(244,63,94,0.4)',
                  boxShadow: '0 0 16px rgba(244,63,94,0.1)'
                } : isNear ? {
                  borderColor: 'rgba(245,158,11,0.35)',
                  boxShadow: '0 0 16px rgba(245,158,11,0.08)'
                } : undefined}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Identity & Role */}
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center font-bold text-sm text-text-primary group-hover:border-brand-primary transition-colors">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                          {member.name}
                        </div>
                        {ot.recognitionPoints > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-0.5"
                            style={{
                              backgroundColor: 'var(--color-brand-muted)',
                              borderColor: 'var(--color-brand)',
                              color: 'var(--color-brand)'
                            }}
                          >
                            <Award className="w-3 h-3" />
                            +{ot.recognitionPoints} pts
                          </span>
                        )}
                        {ot.pendingCount > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border"
                            style={{
                              backgroundColor: 'var(--color-warning-muted)',
                              borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                              color: 'var(--color-warning)'
                            }}
                          >
                            {ot.pendingCount} pending endorsement
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-text-tertiary">
                        {member.jobTitle}
                        {ot.totalHours > 0 && (
                          <span className="ml-2 font-bold" style={{ color: 'var(--color-warning)' }}>
                            · {ot.totalHours}h OT (Pre-9: {ot.pre9amHours}h, Post-5: {ot.post5pmHours}h)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Capacity Meter */}
                  <div className="flex-1 max-w-xl">
                    <CapacityMeter
                      percent={cap.capacityPercent}
                      hoursCommitted={cap.assignedHours}
                      hoursContracted={cap.capacityHoursPerWeek}
                      label="Capacity Load"
                      size="sm"
                    />
                  </div>

                  {/* Right: Flow State Pulse & Inspect */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <TrafficPulseBadge state={cap.trafficState} size="sm" />
                    <button className="text-xs font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 cursor-pointer" style={{ color: 'var(--color-brand)' }}>
                      Inspect Lane <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* 4. WORKLOAD REBALANCING & LOAD LEVELING (Section 21) */}
      {overloadedMember && availableMember && rebalanceJob && (
        <section
          className="p-6 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--color-brand-muted)',
            borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--color-brand)' }}>
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Dynamic Workload Leveling Simulation
            </div>
            <span className="text-xs font-mono text-text-tertiary">
              Algorithmic capacity protection
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            The rebalancing engine has flagged a high-density bottleneck. Transferring deliverable{' '}
            <strong className="font-mono text-text-primary">{rebalanceJob.id} ({rebalanceJob.title})</strong>{' '}
            will normalize team runways without disrupting client SLAs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Overloaded Team Lane</span>
              <div className="font-bold text-sm" style={{ color: 'var(--color-critical)' }}>{overloadedMember.name}</div>
              <div className="text-xs font-mono text-text-secondary">
                Current: {employeeCapacities[overloadedMember.id]?.capacityPercent}% ➔ Projected: {donorProjectedPct}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Available Capacity Lane</span>
              <div className="font-bold text-sm" style={{ color: 'var(--color-success)' }}>{availableMember.name}</div>
              <div className="text-xs font-mono text-text-secondary">
                Current: {employeeCapacities[availableMember.id]?.capacityPercent}% ➔ Projected: {recipientProjectedPct}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col justify-center">
              <button
                onClick={() => {
                  rebalanceWorkload(overloadedMember.id, availableMember.id, rebalanceJob.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Execute Rebalance Transfer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4.5. STUDIO & TEAM VISUAL ANALYTICS TELEMETRY */}
      <VisualAnalyticsWidget
        scope="team"
        teamId={currentTeam.id}
        title={`Studio Visual Analytics: ${currentTeam.name}`}
        subtitle={`Live operational telemetry for ${currentTeam.name}. Evaluates deliverable hours variance, quoting accuracy, and six performance radar pillars.`}
      />

      {/* 4.8. STAFF & LEAD DELIVERY IMPEDIMENTS & DEADLINE RISKS */}
      {(() => {
        const teamUserIds = new Set(teamMembers.map((m) => m.id));
        const relevantImpacts = isGM
          ? deliveryImpactLogs
          : deliveryImpactLogs.filter(
              (l) =>
                (l.loggedByUserId && teamUserIds.has(l.loggedByUserId)) ||
                (l.jobId && teamJobs.some((j) => j.id === l.jobId)) ||
                l.loggedByDepartment === currentUser.department
            );
        const activeCount = relevantImpacts.filter((l) => l.status === 'active' || l.status === 'acknowledged').length;

        return (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-text-primary tracking-tight">
                    Delivery Impediments &amp; Deadline Risks ({relevantImpacts.length})
                  </h2>
                  {activeCount > 0 && (
                    <span className="text-[11px] font-mono font-bold text-amber-500">
                      · {activeCount} Actionable Risks
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Things logged by staff and leads affecting deadline deliveries: asset delays, scope creep, client feedback lag, and tooling outages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openLogDeliveryImpactModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Log Delivery Risk</span>
                </button>
              </div>
            </div>

            {relevantImpacts.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-surface text-center space-y-1.5">
                <AlertTriangle className="w-6 h-6 text-text-tertiary mx-auto opacity-40" />
                <div className="text-xs font-semibold text-text-secondary">
                  No delivery impediments currently logged for this team.
                </div>
                <p className="text-[11px] text-text-tertiary max-w-md mx-auto">
                  When team members or leads report issues like missing client assets, scope shifts, or rendering outages, they will be listed here with options to acknowledge and grant deadline relief.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantImpacts.map((imp) => {
                  const isAwaitingAction = imp.status === 'active';
                  const isAcknowledged = imp.status === 'acknowledged';
                  const isResolved = imp.status === 'resolved' || imp.status === 'mitigated';

                  return (
                    <SpotlightCard key={imp.id} className="p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-text-primary">
                                {imp.jobId ? `${imp.jobId} · ` : ''}{imp.jobTitle || 'General Deliverable Risk'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-text-secondary">Logged by {imp.loggedByName}</span>
                              <SeniorityBadge seniority={imp.loggedBySeniority || 'specialist'} size="xs" />
                            </div>
                          </div>

                          <span
                            className={`text-[11px] font-mono uppercase font-bold tracking-wider shrink-0 ${
                              isResolved
                                ? 'text-emerald-500'
                                : isAcknowledged
                                ? 'text-blue-400'
                                : 'text-amber-500'
                            }`}
                          >
                            {isAcknowledged ? 'Acknowledged' : imp.status}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated/60 p-2.5 rounded-lg border border-border/70">
                          {imp.impactDescription}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-surface border border-border/70">
                            <span className="text-[10px] text-text-tertiary uppercase block">Requested Extension</span>
                            <strong className="text-amber-600 dark:text-amber-400 font-mono">
                              +{imp.estimatedDelayHours || imp.estimatedDelayDays * 8}h ({imp.estimatedDelayDays}d)
                            </strong>
                          </div>
                          <div className="p-2 rounded bg-surface border border-border/70">
                            <span className="text-[10px] text-text-tertiary uppercase block">Proposed Revised Due</span>
                            <strong className="text-text-primary font-mono">
                              {imp.proposedRevisedDueDate ? new Date(imp.proposedRevisedDueDate).toLocaleDateString() : 'TBD'}
                            </strong>
                          </div>
                        </div>

                        {imp.mitigationRequested && (
                          <div className="text-[11px] text-text-tertiary">
                            <strong className="text-text-secondary">Requested Action:</strong> {imp.mitigationRequested}
                          </div>
                        )}

                        {imp.resolutionNotes && (
                          <div className="text-[11px] italic text-text-tertiary bg-surface-elevated p-2 rounded border border-border/60">
                            Status Note: {imp.resolutionNotes}
                          </div>
                        )}
                      </div>

                      {/* Lead Action Controls */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                        {imp.jobId && (
                          <button
                            type="button"
                            onClick={() => setSelectedJobId(imp.jobId!)}
                            className="text-xs font-mono font-bold hover:underline cursor-pointer"
                            style={{ color: 'var(--color-brand)' }}
                          >
                            Inspect Task ➔
                          </button>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                          {isAwaitingAction && (
                            <button
                              type="button"
                              onClick={() => acknowledgeDeliveryImpact(imp.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer transition-colors"
                            >
                              Acknowledge Risk
                            </button>
                          )}

                          {imp.proposedRevisedDueDate && !isResolved && (
                            <button
                              type="button"
                              onClick={() => grantDeadlineExtension(imp.id, imp.proposedRevisedDueDate!)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors"
                            >
                              Approve +{imp.estimatedDelayHours || imp.estimatedDelayDays * 8}h Extension
                            </button>
                          )}

                          {!isResolved ? (
                            <button
                              type="button"
                              onClick={() => resolveDeliveryImpact(imp.id, 'Mitigated and cleared by Lead')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {/* 5. INTERVENTION RADAR & ACTIVE BLOCKERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              Dependency Intervention Radar ({exceptions.length} Active Items)
            </h2>
          </div>
          <span className="text-xs font-mono text-text-tertiary">Direct operational levers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exceptions.map((exc) => (
            <SpotlightCard
              key={exc.id}
              className="p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      exc.severity === 'critical'
                        ? 'animate-ping'
                        : ''
                    }`}
                    style={{
                      backgroundColor: exc.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'
                    }}
                  />
                  <h3 className="font-bold text-sm text-text-primary">{exc.title}</h3>
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                  · {exc.severity}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {exc.description}
              </p>

              <div className="p-3 rounded-xl bg-surface-elevated/70 text-[11px] space-y-1">
                <span className="font-bold text-text-primary uppercase text-[9px] block">
                  Recommended Command Action:
                </span>
                <div className="text-text-secondary">{exc.recommendedAction}</div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                {exc.relatedJobId && (
                  <button
                    onClick={() => setSelectedJobId(exc.relatedJobId!)}
                    className="font-mono font-bold hover:underline cursor-pointer"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    Inspect {exc.relatedJobId} ➔
                  </button>
                )}
                <button
                  onClick={() => resolveException(exc.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors ml-auto cursor-pointer"
                >
                  Resolve & Clear Intervention
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 6. STRATEGIC RECOGNITION & VERIFIED IMPACT */}
      {(() => {
        const teamUserIds = new Set(teamMembers.map((m) => m.id));
        const teamContribs = contributions.filter((c) => teamUserIds.has(c.employeeId));
        const verifiedCount = teamContribs.filter((c) => c.status === 'VERIFIED' || c.status === 'RECOGNISED').length;
        const pendingReviewCount = teamContribs.filter((c) => c.status === 'SUBMITTED').length;
        const needsInfoCount = teamContribs.filter((c) => c.status === 'CLARIFICATION_REQUIRED').length;

        return (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                  <h2 className="text-base font-bold text-text-primary tracking-tight">
                    Strategic Recognition &amp; Verified Impact
                  </h2>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Review and verify team contributions across Exceptional Delivery, Client Impact, Collaboration, Craft, and Process Innovation. Ground truth evidence for appraisals and executive endorsements.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => openLogContributionModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Nominate Team Member</span>
                </button>

                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-mono">
                  Verified: <strong style={{ color: 'var(--color-success)' }}>{verifiedCount}</strong>
                </span>
                {pendingReviewCount > 0 && (
                  <span
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold font-mono"
                    style={{
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    {pendingReviewCount} In Review
                  </span>
                )}
                {needsInfoCount > 0 && (
                  <span
                    className="px-2.5 py-1 rounded-lg border text-xs font-bold font-mono"
                    style={{
                      backgroundColor: 'var(--color-warning-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                      color: 'var(--color-warning)'
                    }}
                  >
                    {needsInfoCount} Awaiting Clarification
                  </span>
                )}
              </div>
            </div>

            {teamContribs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-2">
                <Award className="w-7 h-7 text-text-tertiary mx-auto opacity-50" />
                <div className="text-xs font-semibold text-text-secondary">
                  No contributions logged yet by team members.
                </div>
                <p className="text-[11px] text-text-tertiary max-w-md mx-auto">
                  When team members record contributions across exceptional delivery, client impact, craft excellence, or process innovations, their evidence will appear here for manager verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {teamContribs.map((c) => {
                  const member = users.find((u) => u.id === c.employeeId);
                  return (
                    <SpotlightCard key={c.id} className="p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                              {member?.name.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-text-primary">
                                {c.employeeName}
                              </div>
                              <div className="text-[10px] font-mono text-text-tertiary">
                                {c.employeeRole} {c.relatedJobId ? `· [${c.relatedJobId}]` : ''}
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const catBadge = getContributionCategoryBadge(c.category);
                            return (
                              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 ${catBadge.badgeClass}`}>
                                {catBadge.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-text-primary">
                            {c.title}
                          </h4>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                            {c.description}
                          </p>
                        </div>

                        {/* Impact Statement Box */}
                        <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-1">
                          <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            Verified Impact:
                          </span>
                          <p className="text-text-primary leading-relaxed font-medium text-[11px]">
                            {c.impactStatement}
                          </p>
                        </div>

                        {/* Operating Context if present */}
                        {c.timeContext && (
                          <div className="p-2 rounded bg-surface-tertiary/40 border border-border text-[10px] font-mono text-text-tertiary flex items-center justify-between">
                            <span>Context: {c.timeContext.operatingContext.replace(/_/g, ' ')}</span>
                            <span>{c.timeContext.durationHours}h ({c.timeContext.startTime}–{c.timeContext.endTime})</span>
                          </div>
                        )}

                        {/* Clarifications Thread */}
                        {c.clarifications && c.clarifications.length > 0 && (
                          <div
                            className="p-2.5 rounded-lg border text-[11px] space-y-1"
                            style={{
                              backgroundColor: 'var(--color-warning-muted)',
                              borderColor: 'color-mix(in srgb, var(--color-warning) 25%, transparent)'
                            }}
                          >
                            {c.clarifications.map((clr) => (
                              <div key={clr.id} className="space-y-0.5">
                                <span className="font-bold" style={{ color: 'var(--color-warning)' }}>
                                  Q ({clr.requestedByName}): {clr.question}
                                </span>
                                {clr.response && (
                                  <p
                                    className="text-text-primary italic pl-2 border-l"
                                    style={{ borderColor: 'var(--color-warning)' }}
                                  >
                                    A: {clr.response}
                                  </p>
                                )}
                              </div>
                            ))}
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
                              &ldquo;{c.declineReason || 'Declined during review.'}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs gap-2 flex-wrap">
                        <div className="text-[10px] font-mono text-text-tertiary">
                          {c.contributionDate} · {c.status}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {c.status === 'VERIFIED' || c.status === 'RECOGNISED' ? (
                            <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--color-success)' }}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{c.status === 'RECOGNISED' ? 'Leadership Recognised' : 'Verified'}</span>
                            </div>
                          ) : c.status === 'DECLINED' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-rose-500">
                                Declined
                              </span>
                              <button
                                type="button"
                                onClick={() => reopenContribution(c.id)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                                title="Reopen this entry for review"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Re-evaluate</span>
                              </button>
                            </div>
                          ) : c.status === 'CLARIFICATION_REQUIRED' ? (
                            <>
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
                            </>
                          ) : (
                            <>
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
                                  setClarificationModalId(c.id);
                                  setClarificationQuestion('');
                                }}
                                className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-elevated text-text-tertiary hover:text-text-primary text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Clarify</span>
                              </button>

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
                            </>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}

            {/* Clarification Request Modal */}
            {clarificationModalId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-warning)' }}>
                      <HelpCircle className="w-4 h-4" />
                      <span>Request Impact Clarification</span>
                    </div>
                    <button onClick={() => setClarificationModalId(null)} className="text-text-tertiary hover:text-text-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Ask the team member for additional evidence or context before verification:
                  </p>
                  <textarea
                    rows={3}
                    value={clarificationQuestion}
                    onChange={(e) => setClarificationQuestion(e.target.value)}
                    placeholder="e.g. Could you describe which client deliverable was safeguarded?"
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-brand-primary"
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
                        className="px-4 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
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
                    Provide a transparent reason for declining this contribution entry:
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
                        const finalReason = declineReason.trim() || 'Entry declined during manager review.';
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
  );
};
