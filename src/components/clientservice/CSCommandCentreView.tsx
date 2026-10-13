import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CONFIRMED_CS_DISCIPLINES,
  computeEmployeeCapacityProfile
} from '../../data/clientServicesOperatingModel';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Layers,
  Clock,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Building2,
  FileText,
  Briefcase,
  ArrowRight,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface CSCommandCentreViewProps {
  onOpenBriefModal: () => void;
  onOpenRevertModal: (job: any) => void;
  onSelectEmployee: (empId: string) => void;
}

export const CSCommandCentreView: React.FC<CSCommandCentreViewProps> = ({
  onOpenBriefModal,
  onOpenRevertModal,
  onSelectEmployee
}) => {
  const {
    jobs,
    users,
    brands,
    disciplineAssignments,
    accountCommitments,
    setSelectedJobId,
    setActiveView
  } = useApp();

  const csMembers = useMemo(() => {
    return users.filter(
      (u) =>
        u.department === 'client_services' ||
        u.role === 'client_service' ||
        u.role === 'director' ||
        u.teamId === 'team-client-service'
    );
  }, [users]);

  // Member capacity profiles
  const profiles = useMemo(() => {
    return csMembers.map((m) => {
      const p = computeEmployeeCapacityProfile(m, disciplineAssignments, accountCommitments, jobs);
      return { member: m, profile: p };
    });
  }, [csMembers, disciplineAssignments, accountCommitments, jobs]);

  // Operational Signals
  const overloadedMembers = profiles.filter((p) => p.profile.capacityBand === 'overloaded');
  const approachingMembers = profiles.filter((p) => p.profile.capacityBand === 'approaching');
  const underutilisedMembers = profiles.filter((p) => p.profile.capacityBand === 'underutilised');
  const optimalMembers = profiles.filter((p) => p.profile.capacityBand === 'optimal');

  // Client jobs in pipeline
  const activeJobs = jobs.filter((j) => j.status !== 'completed');
  const atRiskJobs = activeJobs.filter((j) => j.isAtRisk || new Date(j.dueDate).getTime() < Date.now());
  const clientRevertJobs = activeJobs.filter((j) => j.workflowStage === 'client_revert');
  const approvalBacklog = activeJobs.filter(
    (j) => j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff'
  );

  // Discipline Demand and Deficits
  const disciplineDeficits = useMemo(() => {
    return CONFIRMED_CS_DISCIPLINES.map((d) => {
      const assigned = disciplineAssignments.filter((a) => a.disciplineId === d.id);
      const totalAvailableHours = assigned.reduce((sum, a) => sum + (a.weeklyExecutionHours || 0), 0);
      const matchedJobs = activeJobs.filter(
        (j) => j.discipline === d.name || (j.tags && j.tags.includes(d.id))
      );
      const demandHours = matchedJobs.reduce((sum, j) => sum + (j.estimatedHours || 8), 0);
      const deficit = demandHours - totalAvailableHours;
      return {
        discipline: d,
        assignedCount: assigned.length,
        totalAvailableHours,
        demandHours,
        deficit: Math.max(0, deficit),
        isDeficit: deficit > 0
      };
    }).filter((d) => d.isDeficit || d.assignedCount === 0);
  }, [activeJobs, disciplineAssignments]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Signals & Key Department Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] uppercase font-mono text-text-tertiary">Department Headcount</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">
            {csMembers.length}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">Across 5 hierarchy levels</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] uppercase font-mono text-text-tertiary">Active Deliverables</div>
          <div className="text-2xl font-bold font-mono text-brand mt-1">
            {activeJobs.length}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">{atRiskJobs.length} flagged at risk</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] uppercase font-mono text-text-tertiary">Capacity Sweet Spot</div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            {optimalMembers.length}/{csMembers.length}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">60–85% optimal bandwidth</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] uppercase font-mono text-text-tertiary">Revert Revision Loops</div>
          <div className="text-2xl font-bold font-mono text-rose-500 mt-1">
            {clientRevertJobs.length}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">Active revert cycles</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border border-border col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="text-[10px] uppercase font-mono text-text-tertiary">Discipline Bottlenecks</div>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
            {disciplineDeficits.length}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">Deficits or staffing gaps</div>
        </div>
      </div>

      {/* 2. Management Decision Signals Requiring Director Attention */}
      {(overloadedMembers.length > 0 || clientRevertJobs.length > 0 || disciplineDeficits.length > 0) && (
        <div className="p-4 rounded-2xl border bg-surface/70 border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Decisions Requiring Director Attention (Signal → Context → Action)</span>
            </div>
            <span className="text-[10px] font-mono text-text-tertiary">
              Operational Governance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Overload Alert */}
            {overloadedMembers.length > 0 ? (
              <div className="p-3 rounded-xl bg-surface border border-rose-500/20 text-xs space-y-1">
                <div className="font-bold text-rose-500 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{overloadedMembers.length} Staff Overloaded (&gt;100%)</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  {overloadedMembers.map((p) => `${p.member.name.split(' ')[0]} (${p.profile.utilisationPercentage}%)`).join(', ')}.
                  Consider re-allocating specialist execution tasks.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-tertiary">
                Zero employees in critical overload (&gt;100%).
              </div>
            )}

            {/* Revert Conflict Alert */}
            {clientRevertJobs.length > 0 ? (
              <div className="p-3 rounded-xl bg-surface border border-rose-500/20 text-xs space-y-1">
                <div className="font-bold text-rose-500 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{clientRevertJobs.length} Client Reverts Requiring Action</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Capacity conflicts surfaced. Authorised manager must choose reassignment, return, or scope renegotiation.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-tertiary">
                Zero active client reverts currently pending mediation.
              </div>
            )}

            {/* Discipline Deficit Alert */}
            {disciplineDeficits.length > 0 ? (
              <div className="p-3 rounded-xl bg-surface border border-amber-500/20 text-xs space-y-1">
                <div className="font-bold text-amber-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{disciplineDeficits.length} Capability Gaps Detected</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Demand exceeds assigned capacity in: {disciplineDeficits.map((d) => d.discipline.name).join(', ')}.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-tertiary">
                All 7 confirmed disciplines have adequate practitioner coverage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Department Headcount & Workload Distribution (Director View) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h3 className="text-base font-extrabold text-text-primary">
              Workforce Capacity &amp; Utilization Across Department Hierarchy
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
            <span>Optimal Band: <strong>60–85%</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {profiles.map(({ member, profile }) => {
            const memberJobs = jobs.filter((j) => j.assigneeId === member.id && j.status !== 'completed');
            const atRiskCount = memberJobs.filter((j) => j.isAtRisk).length;

            return (
              <SpotlightCard
                key={member.id}
                onClick={() => onSelectEmployee(member.id)}
                className="p-4 space-y-3 cursor-pointer hover:border-brand/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary truncate">
                        {member.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate">
                      {member.jobTitle}
                    </div>
                  </div>

                  {/* Utilization Band Pill */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                      profile.capacityBand === 'overloaded'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : profile.capacityBand === 'approaching'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : profile.capacityBand === 'optimal'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {profile.utilisationPercentage}% · {profile.capacityBand}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border/40">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, profile.utilisationPercentage)}%`,
                        backgroundColor:
                          profile.capacityBand === 'overloaded'
                            ? 'var(--color-critical)'
                            : profile.capacityBand === 'approaching'
                            ? 'var(--color-warning)'
                            : profile.capacityBand === 'optimal'
                            ? 'var(--color-success)'
                            : 'var(--color-brand)'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                    <span>{profile.totalCommittedHours}h committed</span>
                    <span>{profile.availableCapacityHours}h available</span>
                  </div>
                </div>

                {/* Breakdown summary */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-border/60 text-center font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-surface">
                    <div className="font-bold text-text-primary">{profile.accountManagementHours}h</div>
                    <div className="text-text-tertiary text-[9px]">Account</div>
                  </div>
                  <div className="p-1.5 rounded bg-surface">
                    <div className="font-bold text-brand">{profile.specialistExecutionHours}h</div>
                    <div className="text-text-tertiary text-[9px]">Specialist</div>
                  </div>
                  <div className="p-1.5 rounded bg-surface">
                    <div className="font-bold text-text-secondary">{memberJobs.length}</div>
                    <div className="text-text-tertiary text-[9px]">Deliverables</div>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* 4. Active Client Revert Queue with Direct Resolution Action */}
      {clientRevertJobs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Active Client Reverts Requiring Governance ({clientRevertJobs.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {clientRevertJobs.map((job) => (
              <SpotlightCard key={job.id} className="p-4 space-y-2.5 border-l-4 border-l-rose-500">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-500">{job.id}</span>
                      <h4 className="font-bold text-xs text-text-primary">{job.title}</h4>
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      Client: <strong className="text-text-secondary">{job.clientProject}</strong> · Assignee: <strong>{job.assigneeName}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 uppercase">
                    Cycle #{ (job.revisionCount || 1) + 1}
                  </span>
                </div>

                <p className="text-xs text-text-secondary">
                  {job.clientRevertInfo?.revertNotes || 'Client feedback submitted. Flagged for management capacity conflict resolution.'}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <span className="text-[10px] font-mono text-text-tertiary">Due: {job.dueDate}</span>
                  <button
                    onClick={() => onOpenRevertModal(job)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 flex items-center gap-1.5 cursor-pointer bg-rose-600 text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resolve Capacity Conflict</span>
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
