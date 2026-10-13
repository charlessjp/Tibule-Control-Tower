import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CONFIRMED_CS_DISCIPLINES,
  computeEmployeeCapacityProfile
} from '../../data/clientServicesOperatingModel';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  GitCommit,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  HelpCircle,
  Briefcase,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const CSTwoDimensionsView: React.FC = () => {
  const {
    users,
    jobs,
    disciplineAssignments,
    accountCommitments,
    brands
  } = useApp();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>('usr-michael-chen');

  // Client Services members
  const csMembers = useMemo(() => {
    return users.filter(
      (u) =>
        u.department === 'client_services' ||
        u.role === 'client_service' ||
        u.role === 'director' ||
        u.teamId === 'team-client-service'
    );
  }, [users]);

  // Compute capacity profiles for all members
  const memberProfiles = useMemo(() => {
    return csMembers.map((member) => {
      const profile = computeEmployeeCapacityProfile(
        member,
        disciplineAssignments,
        accountCommitments,
        jobs
      );
      const manager = users.find((u) => u.id === member.managerId);
      const subordinates = csMembers.filter((u) => u.managerId === member.id);
      const accounts = accountCommitments.filter((c) => c.employeeId === member.id);
      const assignedDisciplines = disciplineAssignments.filter((a) => a.employeeId === member.id);

      return {
        member,
        manager,
        subordinates,
        accounts,
        assignedDisciplines,
        profile
      };
    });
  }, [csMembers, users, disciplineAssignments, accountCommitments, jobs]);

  const selectedProfile = useMemo(() => {
    return memberProfiles.find((p) => p.member.id === selectedEmployeeId) || memberProfiles[0];
  }, [memberProfiles, selectedEmployeeId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
          <GitCommit className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
          <span>General Manager Operational Model Directive</span>
        </div>
        <h2 className="text-xl font-extrabold text-text-primary">
          The Two Dimensions: Hierarchy vs. Functional Work Allocation
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed max-w-4xl">
          The central operating principle of Control Tower is that <strong>organisational hierarchy</strong> and the <strong>allocation of functional work</strong> are two different things.
          The hierarchy determines reporting and accountability. Functional discipline assignments determine the additional work an employee is responsible for executing.
          Both dimensions coexist without duplicating employees or double-counting working hours.
        </p>
      </div>

      {/* Two Dimensions Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dimension A Card */}
        <div className="p-5 rounded-2xl border bg-surface/70 border-brand/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-muted text-brand flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-text-primary">
                Dimension A: Reporting &amp; Accountability
              </h3>
              <p className="text-[10px] font-mono text-text-tertiary uppercase">Governance &amp; Oversight Layer</p>
            </div>
          </div>
          <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong>Who does the employee report to?</strong> Single unambiguous supervisor in Client Services.</li>
            <li><strong>Who oversees their work?</strong> Mentorship, quality checks, and performance feedback.</li>
            <li><strong>Who owns the client relationship?</strong> Primary commercial accountability for the account.</li>
            <li><strong>Who is accountable for department performance?</strong> Director of Client Services.</li>
            <li><strong>Rule:</strong> An employee appears <em>only once</em> in the organisational hierarchy.</li>
          </ul>
        </div>

        {/* Dimension B Card */}
        <div className="p-5 rounded-2xl border bg-surface/70 border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-xs">
              B
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-text-primary">
                Dimension B: Functional Capability &amp; Execution
              </h3>
              <p className="text-[10px] font-mono text-text-tertiary uppercase">Specialist Execution &amp; Capacity</p>
            </div>
          </div>
          <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong>Which disciplines can this employee execute?</strong> Configurable across the 9 confirmed capabilities.</li>
            <li><strong>Which specialist deliverables are assigned to them?</strong> Direct production tasks and campaigns.</li>
            <li><strong>How much capacity do these consume?</strong> Balanced against 2-3h/day client obligations.</li>
            <li><strong>Seniority independence:</strong> Being a Senior Account Manager does <em>not</em> exclude someone from specialist execution.</li>
            <li><strong>Rule:</strong> Discipline assignments do not alter formal title or create new reporting lines.</li>
          </ul>
        </div>
      </div>

      {/* Main Interactive Split: Hierarchy Tree on Left, Capacity Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Dimension A Hierarchy (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                Client Services Reporting Line (Dimension A)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-text-tertiary">
              {csMembers.length} Staff Total
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2.5">
            <p className="text-[11px] text-text-tertiary font-mono pb-2 border-b border-border/60">
              Director of CS → Senior AMs → Account Managers → Account Executives → Interns/NSS
            </p>

            {/* Tree nodes */}
            {memberProfiles.map(({ member, manager, subordinates, assignedDisciplines, profile }) => {
              const isSelected = member.id === selectedProfile?.member.id;
              
              // Indent level based on seniority hierarchy
              let indentClass = 'ml-0';
              let levelBadge = 'Director';
              if (member.seniority === 'director' || member.jobTitle.includes('Director')) {
                indentClass = 'ml-0 border-l-4 border-brand';
                levelBadge = 'Director of CS';
              } else if (member.jobTitle.includes('Senior Account Manager') || member.seniority === 'senior') {
                indentClass = 'ml-3 border-l-2 border-border';
                levelBadge = 'Senior AM';
              } else if (member.jobTitle.includes('Account Manager')) {
                indentClass = 'ml-6 border-l-2 border-border';
                levelBadge = 'Account Manager';
              } else if (member.jobTitle.includes('Account Executive')) {
                indentClass = 'ml-9 border-l-2 border-border';
                levelBadge = 'Account Exec';
              } else {
                indentClass = 'ml-12 border-l-2 border-border';
                levelBadge = 'Intern / NSS';
              }

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedEmployeeId(member.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${indentClass} ${
                    isSelected
                      ? 'bg-brand/10 border-brand shadow-xs'
                      : 'bg-surface hover:bg-surface-elevated border border-border/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text-primary truncate">
                          {member.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-elevated text-text-secondary border border-border">
                          {levelBadge}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-tertiary truncate mt-0.5">
                        {member.jobTitle}
                        {manager && ` · Reports to ${manager.name.split(' ')[0]}`}
                      </div>
                    </div>

                    {/* Utilization pill */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        profile.capacityBand === 'overloaded'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : profile.capacityBand === 'approaching'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : profile.capacityBand === 'optimal'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                      }`}
                    >
                      {profile.utilisationPercentage}% Load
                    </span>
                  </div>

                  {/* Dimension B chips preview */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-border/40">
                    <span className="text-[9px] font-mono text-text-tertiary">Disciplines:</span>
                    {assignedDisciplines.map((a) => {
                      const def = CONFIRMED_CS_DISCIPLINES.find((d) => d.id === a.disciplineId);
                      return (
                        <span
                          key={a.id}
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-text-primary bg-surface-elevated border border-border"
                        >
                          {def?.name || a.disciplineId} {def?.scopeLabel ? def.scopeLabel : ''}
                        </span>
                      );
                    })}
                    {assignedDisciplines.length === 0 && (
                      <span className="text-[9px] text-text-tertiary italic">General Account Mgt</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dimension B Capacity Calculation & Real-Time Split (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedProfile && (
            <SpotlightCard className="p-6 space-y-5 border-t-4" style={{ borderTopColor: 'var(--color-brand)' }}>
              {/* Employee Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-text-primary">
                      {selectedProfile.member.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-muted text-brand uppercase">
                      {selectedProfile.member.seniority}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {selectedProfile.member.jobTitle} · Single Reporting Line to{' '}
                    <strong>{selectedProfile.manager?.name || 'General Manager'}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-text-primary">
                    {selectedProfile.profile.contractedHours}h Weekly Capacity
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary">
                    {selectedProfile.profile.availableCapacityHours}h Remaining Available
                  </div>
                </div>
              </div>

              {/* Realistic Capacity Split Visualization (Section 3.2 of brief) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary font-mono uppercase text-[11px]">
                    Realistic Weekly Capacity Split
                  </span>
                  <span className="font-mono font-bold" style={{ color: selectedProfile.profile.utilisationPercentage > 100 ? 'var(--color-critical)' : 'var(--color-brand)' }}>
                    {selectedProfile.profile.totalCommittedHours}h Committed / {selectedProfile.profile.contractedHours}h ({selectedProfile.profile.utilisationPercentage}%)
                  </span>
                </div>

                {/* Progress bar split */}
                <div className="h-3 w-full rounded-full bg-surface-elevated overflow-hidden flex border border-border">
                  <div
                    style={{ width: `${Math.min(100, (selectedProfile.profile.accountManagementHours / selectedProfile.profile.contractedHours) * 100)}%` }}
                    className="bg-sky-500 h-full"
                    title={`Account Management: ${selectedProfile.profile.accountManagementHours}h`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (selectedProfile.profile.specialistExecutionHours / selectedProfile.profile.contractedHours) * 100)}%` }}
                    className="bg-indigo-500 h-full"
                    title={`Specialist Execution: ${selectedProfile.profile.specialistExecutionHours}h`}
                  />
                  <div
                    style={{ width: `${Math.min(100, (selectedProfile.profile.meetingsAndAdminHours / selectedProfile.profile.contractedHours) * 100)}%` }}
                    className="bg-slate-400 h-full"
                    title={`Meetings & Reviews: ${selectedProfile.profile.meetingsAndAdminHours}h`}
                  />
                  {selectedProfile.profile.reworkHours > 0 && (
                    <div
                      style={{ width: `${Math.min(100, (selectedProfile.profile.reworkHours / selectedProfile.profile.contractedHours) * 100)}%` }}
                      className="bg-rose-500 h-full"
                      title={`Rework & Reverts: ${selectedProfile.profile.reworkHours}h`}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-1.5 text-sky-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>Client Mgt</span>
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-1">
                      {selectedProfile.profile.accountManagementHours}h
                    </div>
                    <div className="text-[9px] text-text-tertiary">2-3h/day client contact</div>
                  </div>

                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-1.5 text-indigo-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Disciplines</span>
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-1">
                      {selectedProfile.profile.specialistExecutionHours}h
                    </div>
                    <div className="text-[9px] text-text-tertiary">Specialist execution</div>
                  </div>

                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Sync &amp; Admin</span>
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-1">
                      {selectedProfile.profile.meetingsAndAdminHours}h
                    </div>
                    <div className="text-[9px] text-text-tertiary">Coordination &amp; reviews</div>
                  </div>

                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Rework/Reverts</span>
                    </div>
                    <div className="text-sm font-bold text-text-primary mt-1">
                      {selectedProfile.profile.reworkHours}h
                    </div>
                    <div className="text-[9px] text-text-tertiary">Revision effort</div>
                  </div>
                </div>
              </div>

              {/* Account Commitments (Dimension A) */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-text-secondary flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>Client Account Commitments ({selectedProfile.accounts.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {selectedProfile.profile.accountManagementHours}h weekly allocated
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedProfile.accounts.map((ac) => (
                    <div key={ac.id} className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-text-primary">{ac.brandName}</div>
                        <div className="text-[10px] font-mono text-text-tertiary capitalize">
                          {ac.role.replace('_', ' ')} · {ac.activeJobsCount} active briefs
                        </div>
                      </div>
                      <span className="font-mono font-bold text-text-secondary">
                        ~{ac.weeklyHours}h/wk
                      </span>
                    </div>
                  ))}
                  {selectedProfile.accounts.length === 0 && (
                    <p className="text-xs text-text-tertiary italic p-2 bg-surface rounded-xl border border-dashed border-border text-center">
                      No primary brand accounts currently assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* Functional Disciplines Executed (Dimension B) */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-text-secondary flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Assigned Functional Disciplines ({selectedProfile.assignedDisciplines.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {selectedProfile.profile.specialistExecutionHours}h planned execution
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProfile.assignedDisciplines.map((ad) => {
                    const disciplineDef = CONFIRMED_CS_DISCIPLINES.find((d) => d.id === ad.disciplineId);
                    return (
                      <div
                        key={ad.id}
                        className="p-3 rounded-xl border bg-surface/70 space-y-1.5 text-xs"
                        style={{ borderLeftWidth: '3px', borderLeftColor: disciplineDef?.badgeColor || 'var(--color-brand)' }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-text-primary truncate">
                            {disciplineDef?.name} {disciplineDef?.scopeLabel && <span className="font-normal text-text-tertiary text-[10px]">{disciplineDef.scopeLabel}</span>}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-surface-elevated text-text-secondary capitalize">
                            {ad.proficiency.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary line-clamp-2">
                          {ad.notes || disciplineDef?.description}
                        </p>
                        <div className="text-[10px] font-mono font-bold text-text-secondary pt-1 border-t border-border/40">
                          {ad.weeklyExecutionHours}h weekly capacity allocated
                        </div>
                      </div>
                    );
                  })}
                  {selectedProfile.assignedDisciplines.length === 0 && (
                    <div className="col-span-2 p-3 rounded-xl border border-dashed border-border bg-surface text-center text-xs text-text-tertiary italic">
                      No functional specialist disciplines currently assigned. Employee focuses purely on client service coordination.
                    </div>
                  )}
                </div>
              </div>
            </SpotlightCard>
          )}
        </div>
      </div>
    </div>
  );
};
