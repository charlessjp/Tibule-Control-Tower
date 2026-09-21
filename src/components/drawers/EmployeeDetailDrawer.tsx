import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficBadge } from '../common/TrafficBadge';
import { formatStatus } from '../../utils/formatters';
import {
  X,
  User,
  Briefcase,
  AlertOctagon,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Mail,
  Shield,
  FileCheck
} from 'lucide-react';

export const EmployeeDetailDrawer: React.FC = () => {
  const {
    selectedEmployeeId,
    setSelectedEmployeeId,
    users,
    teams,
    jobs,
    employeeCapacities,
    setSelectedJobId,
    rebalanceWorkload,
    currentUser,
    setMetricTraceModal,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  if (!selectedEmployeeId) return null;

  const employee = users.find((u) => u.id === selectedEmployeeId);
  if (!employee) return null;

  const team = teams.find((t) => t.id === employee.teamId);
  const capacity = employeeCapacities[employee.id] || {
    capacityPercent: 0,
    assignedHours: 0,
    capacityHoursPerWeek: 38,
    activeJobsCount: 0,
    dueSoonCount: 0,
    blockedCount: 0,
    trafficState: 'clear'
  };

  const employeeJobs = jobs.filter((j) => j.assigneeId === employee.id && j.status !== 'completed');
  const completedCount = jobs.filter((j) => j.assigneeId === employee.id && j.status === 'completed').length;

  // Potential candidate to rebalance to if employee is critical
  const otherTeamMembers = users.filter(
    (u) => u.teamId === employee.teamId && u.id !== employee.id && (employeeCapacities[u.id]?.capacityPercent || 0) < 80
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="employee-detail-drawer"
        className="w-full max-w-lg h-full border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full font-bold text-base flex items-center justify-center border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)'
              }}
            >
              {employee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-text-primary">
                {employee.name}
              </h2>
              <div className="text-xs text-text-tertiary">
                {employee.jobTitle} • {team?.name}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedEmployeeId(null)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status & Capacity Summary (Section 55) */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Live Traffic Condition
              </span>
              <TrafficBadge state={capacity.trafficState} size="md" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Workload Saturation</span>
                <span
                  className={`font-mono text-sm ${
                    capacity.capacityPercent > 100
                      ? 'text-rose-500 font-bold'
                      : capacity.capacityPercent > 80
                      ? 'text-amber-500 font-bold'
                      : 'text-text-primary'
                  }`}
                >
                  {capacity.capacityPercent}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    capacity.capacityPercent > 100
                      ? 'bg-rose-500'
                      : capacity.capacityPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-brand-primary'
                  }`}
                  style={{ width: `${Math.min(capacity.capacityPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
              <div className="p-2 rounded bg-surface border border-border/50">
                <div className="text-lg font-bold text-text-primary font-mono">{capacity.activeJobsCount}</div>
                <div className="text-[10px] text-text-tertiary uppercase">Active Jobs</div>
              </div>
              <div className="p-2 rounded bg-surface border border-border/50">
                <div className="text-lg font-bold text-amber-500 font-mono">{capacity.dueSoonCount}</div>
                <div className="text-[10px] text-text-tertiary uppercase">Due &lt;48h</div>
              </div>
              <div className="p-2 rounded bg-surface border border-border/50">
                <div className="text-lg font-bold text-purple-500 font-mono">{capacity.blockedCount}</div>
                <div className="text-[10px] text-text-tertiary uppercase">Blocked</div>
              </div>
            </div>
          </div>

          {/* Rebalance Work Recommendation (Section 21 & 55) */}
          {capacity.capacityPercent >= 95 && employeeJobs.length > 1 && otherTeamMembers.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <RefreshCw className="w-4 h-4" />
                Suggested Workload Rebalance
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {employee.name} is operating at {capacity.capacityPercent}% committed effort. Redistribute secondary assignment{' '}
                <strong className="text-text-primary">{employeeJobs[employeeJobs.length - 1].id}</strong> to{' '}
                <strong className="text-text-primary">{otherTeamMembers[0].name}</strong> ({employeeCapacities[otherTeamMembers[0].id]?.capacityPercent || 50}% capacity).
              </p>
              <button
                onClick={() => {
                  rebalanceWorkload(employee.id, otherTeamMembers[0].id, employeeJobs[employeeJobs.length - 1].id);
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Apply Rebalance to {otherTeamMembers[0].name.split(' ')[0]}
              </button>
            </div>
          )}

          {/* Current Active Work (Section 55) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Current Active Assignments ({employeeJobs.length})
              </span>
            </div>

            {employeeJobs.length === 0 ? (
              <div className="p-4 rounded-lg bg-surface-elevated text-xs text-text-tertiary text-center">
                Runway clear. No active work assigned.
              </div>
            ) : (
              <div className="space-y-2">
                {employeeJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="p-3 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border/70 hover:border-brand-primary/40 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-primary">
                            {job.id}
                          </span>
                          <span className="text-xs font-medium text-text-primary truncate">
                            {job.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-tertiary mt-0.5">
                          {job.clientProject} • Due: {new Date(job.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border text-text-secondary font-semibold shrink-0">
                        {formatStatus(job.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border/40">
                      <span>{job.estimatedHours} hrs committed</span>
                      <span className="capitalize">{job.complexity} complexity</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Profile & Competencies */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Operational Skill Profile
            </div>
            <div className="flex flex-wrap gap-1.5">
              {employee.skillProfile.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs bg-surface-elevated border border-border text-text-secondary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Longitudinal Evidence Link (Section 27) */}
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-border flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-text-primary flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-brand-primary" />
                Verified Contribution Record
              </div>
              <div className="text-text-tertiary mt-0.5">
                {completedCount} historical assignments completed with auditable evidence
              </div>
            </div>
            <button
              onClick={() => {
                setMetricTraceModal({
                  name: `Contribution Audit for ${employee.name}`,
                  value: `${completedCount} Completed`,
                  summary: 'Longitudinal record of completed deliverables and evidence milestones.',
                  methodology: 'Directly verified from delivery audits and client handoff signatures.',
                  datapoints: [
                    { label: 'Completed Deliverables', count: completedCount, description: 'Finished on or ahead of milestone SLA' },
                    { label: 'Weekly Capacity Baseline', count: `${employee.capacityHoursPerWeek}h`, description: 'Contracted operational workload target' },
                    { label: 'Account Health', count: '100%', description: 'Zero unaddressed compliance or quality incidents' }
                  ]
                });
              }}
              className="px-2.5 py-1 rounded bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 font-medium transition-colors"
            >
              Inspect
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated/40 flex justify-between items-center text-xs text-text-tertiary">
          <span>Employee ID: {employee.id}</span>
          <span className="font-mono">{employee.email}</span>
        </div>
      </div>
    </div>
  );
};
