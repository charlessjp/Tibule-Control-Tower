import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficPulseBadge } from '../common/TrafficPulseBadge';
import { OperationalPulseRibbon } from '../common/OperationalPulseRibbon';
import { CapacityMeter } from '../common/CapacityMeter';
import { SpotlightCard } from '../common/SpotlightCard';
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
  Lock
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
    rebalanceWorkload,
    resolveException,
    resolveBlocker,
    setMetricTraceModal
  } = useApp();

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
  const activeJobs = teamJobs.filter((j) => j.status !== 'completed');

  // Operational metrics
  const atRiskCount = activeJobs.filter((j) => j.isAtRisk || j.priority === 'urgent').length;
  const blockedCount = activeJobs.filter((j) => j.status === 'blocked').length;
  const unassignedJobs = teamJobs.filter((j) => j.status === 'unassigned' || !j.assigneeId);

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

  return (
    <div id="manager-command-centre" className="space-y-8 pb-16">
      {/* 1. Command Cockpit Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              <span>Team Studio Operations & Dispatch</span>
              <span>·</span>
              <span className="text-brand-primary font-bold">Active Studio Operations</span>
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border/80 text-text-tertiary font-normal">
                    Locked
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Intervention Counters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">Intake Queue:</span>
              <span className={`font-bold ${unassignedJobs.length > 0 ? 'text-amber-500' : 'text-text-primary'}`}>
                {unassignedJobs.length} Unallocated
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">Active Blocks:</span>
              <span className={`font-bold ${blockedCount > 0 ? 'text-purple-500' : 'text-text-primary'}`}>
                {blockedCount} Held
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-surface-elevated/70 border border-border/70 text-xs font-mono flex items-center gap-2">
              <span className="text-text-tertiary">SLA Risk:</span>
              <span className={`font-bold ${atRiskCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {atRiskCount} Critical
              </span>
            </div>
          </div>
        </div>
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
                      <div className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                        {member.name}
                      </div>
                      <div className="text-[11px] font-mono text-text-tertiary">
                        {member.jobTitle}
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
                    <button className="text-xs font-semibold text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Inspect Lane <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* 4. WORKLOAD REBALANCING & LOAD LEVELING COCKPIT (Section 21) */}
      {overloadedMember && availableMember && rebalanceJob && (
        <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm font-mono uppercase tracking-wider">
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
              <div className="font-bold text-rose-500 text-sm">{overloadedMember.name}</div>
              <div className="text-xs font-mono text-text-secondary">
                Current: {employeeCapacities[overloadedMember.id]?.capacityPercent}% ➔ Projected: 82%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Available Capacity Lane</span>
              <div className="font-bold text-emerald-500 text-sm">{availableMember.name}</div>
              <div className="text-xs font-mono text-text-secondary">
                Current: {employeeCapacities[availableMember.id]?.capacityPercent}% ➔ Projected: 68%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col justify-center">
              <button
                onClick={() => {
                  rebalanceWorkload(overloadedMember.id, availableMember.id, rebalanceJob.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Execute Rebalance Transfer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. INTERVENTION RADAR & ACTIVE BLOCKERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-500" />
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
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-amber-500'
                    }`}
                  />
                  <h3 className="font-bold text-sm text-text-primary">{exc.title}</h3>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-elevated font-bold text-text-tertiary">
                  {exc.severity}
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
                    className="font-mono text-brand-primary font-bold hover:underline"
                  >
                    Inspect {exc.relatedJobId} ➔
                  </button>
                )}
                <button
                  onClick={() => resolveException(exc.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors ml-auto"
                >
                  Resolve & Clear Intervention
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </div>
  );
};
