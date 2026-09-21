import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficPulseBadge } from '../common/TrafficPulseBadge';
import { OperationalPulseRibbon } from '../common/OperationalPulseRibbon';
import { SpotlightCard } from '../common/SpotlightCard';
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
  Globe
} from 'lucide-react';

export const GeneralManagerDashboard: React.FC = () => {
  const {
    teams,
    users,
    jobs,
    employeeCapacities,
    setSelectedEmployeeId,
    setSelectedJobId,
    setActiveView,
    setMetricTraceModal
  } = useApp();

  const [drilldownTeamId, setDrilldownTeamId] = useState<string | null>(null);

  // High-level organisation metrics
  const activeJobs = jobs.filter((j) => j.status !== 'completed');
  const atRiskJobs = activeJobs.filter((j) => j.isAtRisk || j.priority === 'urgent');
  const blockedJobs = activeJobs.filter((j) => j.status === 'blocked');

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
      activeCount: jobs.filter((j) => j.teamId === team.id && j.status !== 'completed').length
    };
  });

  return (
    <div id="general-manager-intelligence" className="space-y-8 pb-16">
      {/* 1. High-Altitude Organisational Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary">
              <Globe className="w-3.5 h-3.5 text-brand-primary" />
              <span>Executive Overview & Macro Governance</span>
              <span>·</span>
              <span className="text-emerald-500 font-bold">100% Non-Surveillance Verified</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-1">
              Organizational Intelligence
            </h1>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Macro workforce capacity, inter-team handoff velocity, and empirical outcome verification across the entire Tibule ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-text-secondary">
              Sprint Cycle: <strong className="text-text-primary">Q3 Performance Run</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Macro Operational Pulse Ribbon */}
      <OperationalPulseRibbon
        contextTitle="Enterprise Operational Horizon"
        scopeSubtitle="Active cross-functional capacity and SLA adherence"
      />

      {/* 3. INTERACTIVE CROSS-TEAM PIPELINE & HANDOFF CONSTRICTION (Section 34) */}
      <section className="p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <GitPullRequestDraft className="w-4 h-4 text-purple-500" />
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                Inter-Team Flow Velocity & Handoff Constriction
              </h2>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">
              Identifies where deliverables experience latency between departmental handoffs.
            </p>
          </div>

          <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
            1 Active Friction Node Identified
          </span>
        </div>

        {/* Visual Pipeline Schematic */}
        <div className="p-5 rounded-xl bg-surface-elevated/50 border border-border/70 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Step 1: Creative Team */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1 text-center">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Source Team</span>
              <div className="font-bold text-text-primary text-sm">Creative Design</div>
              <div className="text-xs font-mono text-brand-primary">74% Saturation</div>
            </div>

            {/* Constriction Connector */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="w-full flex items-center justify-center gap-1 text-purple-500">
                <span className="h-0.5 flex-1 bg-purple-500/40" />
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span className="h-0.5 flex-1 bg-purple-500/40" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase mt-1">
                31h Handoff Latency
              </span>
            </div>

            {/* Step 2: Target Team */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1 text-center">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Target Team</span>
              <div className="font-bold text-text-primary text-sm">Client Service</div>
              <div className="text-xs font-mono text-amber-500">91% Saturation</div>
            </div>

            {/* Step 3: Handoff Gate */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="w-full flex items-center justify-center gap-1 text-emerald-500">
                <span className="h-0.5 flex-1 bg-emerald-500/40" />
                <ArrowRight className="w-4 h-4" />
                <span className="h-0.5 flex-1 bg-emerald-500/40" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase mt-1">
                4.2h Gate Review
              </span>
            </div>

            {/* Step 4: Final Verification */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1 text-center">
              <span className="text-[10px] uppercase font-mono text-text-tertiary">Outcome Gate</span>
              <div className="font-bold text-text-primary text-sm">Client Delivery</div>
              <div className="text-xs font-mono text-emerald-500">91.2% On-Time</div>
            </div>
          </div>

          {/* Deep-dive into the constriction */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider text-[10px]">
                Bottleneck Root Cause Analysis:
              </span>
              <p className="text-text-secondary leading-relaxed">
                27 active jobs are experiencing an average 31-hour delay in final font licensing signoffs and pitch graphics handoffs between Creative and Client Service.
              </p>
            </div>

            <button
              onClick={() => setActiveView('all_work')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-xs transition-transform hover:scale-[1.02]"
            >
              Inspect 27 Affected Deliverables
            </button>
          </div>
        </div>
      </section>

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
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedEmployeeId(member.id)}
                      className="p-3.5 rounded-xl bg-surface border border-border/70 hover:border-brand-primary/50 cursor-pointer space-y-2 transition-colors"
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
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* 5. ORGANISATIONAL ASSURANCE FUNNEL (Section 35) */}
      <section className="p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Organisational Assurance Funnel (Non-Surveillance)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Audit Trail Intact
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
          Tibule measures work by concrete deliverable milestones, review signoffs, and auditable client receipts. We prove high productivity to leadership without monitoring personal behavior.
        </p>

        {/* 5-Step Continuous Funnel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center pt-2">
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-text-primary">1,248</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Jobs Created</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">100% catalogued</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-brand-primary">1,231</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Assigned</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">98.6% allocated</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-amber-500">1,187</span>
            <div className="text-xs font-bold text-text-secondary mt-1">In Execution</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Verified active</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-emerald-500">1,102</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Delivered</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">SLA met</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60">
            <span className="text-2xl font-extrabold font-mono text-text-primary">1,047</span>
            <div className="text-xs font-bold text-text-secondary mt-1">Verified Audit</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Zero disputes</div>
          </div>
        </div>
      </section>
    </div>
  );
};
