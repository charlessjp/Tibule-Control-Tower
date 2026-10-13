import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, SplitTimelineConfig } from '../../types';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { formatRole } from '../../utils/formatters';
import {
  AlertTriangle,
  Clock,
  UserCheck,
  Pause,
  Split,
  CheckCircle2,
  X,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Sun,
  Moon,
  Info
} from 'lucide-react';

interface RevertConflictResolutionModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RevertConflictResolutionModal: React.FC<RevertConflictResolutionModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { resolveRevertConflict, jobs, users, employeeCapacities, currentUser } = useApp();

  const [selectedResolution, setSelectedResolution] = useState<
    'queued' | 'paused_current' | 'reassigned' | 'split_timeline'
  >('split_timeline');

  // Candidate alternative assignees for reassign strategy
  const candidatePeers = users.filter(
    (u) =>
      u.role === 'employee' ||
      u.role === 'team_lead' ||
      u.teamId === 'team-creative'
  );

  const [targetAssigneeId, setTargetAssigneeId] = useState<string>(
    candidatePeers.find((p) => p.id !== job?.assigneeId)?.id || candidatePeers[0]?.id || ''
  );

  // Time-Moving and Timeline Split Controls
  const [revertDaysExtended, setRevertDaysExtended] = useState<number>(2);
  const [activeJobDaysExtended, setActiveJobDaysExtended] = useState<number>(2);
  const [dailySplitPreset, setDailySplitPreset] = useState<'50_50' | '30_70' | '70_30'>('50_50');

  if (!isOpen || !job || !job.clientRevertInfo) return null;

  const revertInfo = job.clientRevertInfo;
  const originalAssignee = users.find((u) => u.id === job.assigneeId);
  const conflictingJob = jobs.find((j) => j.id === revertInfo.conflictingJobId);

  // Calculate projected new dates
  const calculateExtendedDate = (baseDateStr: string, days: number): string => {
    const base = new Date(baseDateStr);
    const result = new Date(base.getTime() + days * 86400000);
    return result.toISOString();
  };

  const currentRevertDueDate = job.dueDate;
  const newRevertDueDate = calculateExtendedDate(currentRevertDueDate, revertDaysExtended);

  const currentActiveDueDate = conflictingJob?.dueDate || new Date().toISOString();
  const newActiveDueDate = calculateExtendedDate(currentActiveDueDate, activeJobDaysExtended);

  const revertDailyHours = dailySplitPreset === '50_50' ? 4 : dailySplitPreset === '30_70' ? 2.5 : 5.5;
  const activeDailyHours = dailySplitPreset === '50_50' ? 4 : dailySplitPreset === '30_70' ? 5.5 : 2.5;

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();

    let splitConfig: SplitTimelineConfig | undefined = undefined;
    if (selectedResolution === 'split_timeline') {
      splitConfig = {
        revertDaysExtended,
        activeJobDaysExtended,
        revertDailyHours,
        activeJobDailyHours: activeDailyHours,
        timeBlockSchedule:
          dailySplitPreset === '50_50'
            ? 'Morning: Revert (9:00 AM – 1:00 PM) | Afternoon: Active Job (2:00 PM – 6:00 PM)'
            : dailySplitPreset === '30_70'
            ? 'Morning: Revert (9:00 AM – 11:30 AM) | Afternoon: Active Job (12:30 PM – 6:00 PM)'
            : 'Morning: Revert (9:00 AM – 2:30 PM) | Afternoon: Active Job (3:00 PM – 6:00 PM)',
        originalRevertDueDate: currentRevertDueDate,
        originalActiveDueDate: currentActiveDueDate,
        newRevertDueDate,
        newActiveDueDate
      };
    }

    resolveRevertConflict(
      job.id,
      selectedResolution,
      selectedResolution === 'reassigned' ? targetAssigneeId : undefined,
      splitConfig
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="revert-conflict-resolution-modal"
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1"
                style={{
                  color: 'var(--color-critical)',
                  borderColor: 'color-mix(in srgb, var(--color-critical) 35%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-critical) 12%, transparent)'
                }}
              >
                <AlertTriangle className="w-3 h-3" /> Concurrency Conflict Handler
              </span>
              <h2 className="text-base font-bold text-text-primary">Assignee Workload Thrash Protection</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Deliverable [{job.id}] cycled back with client reverts while {originalAssignee?.name} is on another job.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleResolve} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Detailed Conflict Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Reverting Deliverable */}
            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-critical) 6%, transparent)'
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--color-critical)' }}>
                <span>INCOMING CLIENT REVERT</span>
                <span className="font-mono">#{revertInfo.revertCount}</span>
              </div>
              <div className="font-bold text-xs leading-tight text-text-primary">[{job.id}] {job.title}</div>
              <p className="text-[11px] text-text-secondary leading-tight line-clamp-2">
                &quot;{revertInfo.feedbackNotes}&quot;
              </p>
              <div className="text-[10px] font-mono text-text-tertiary pt-1 flex items-center justify-between">
                <span>Rework Required: <strong style={{ color: 'var(--color-critical)' }}>+{revertInfo.additionalHours}h</strong></span>
                <span className="tabular-nums">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Conflicting Active Deliverable */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-text-tertiary">
                <span>CURRENTLY ASSIGNED IN PRODUCTION</span>
                <span className="font-mono">{originalAssignee?.name}</span>
              </div>
              {conflictingJob ? (
                <>
                  <div className="font-bold text-xs leading-tight text-text-primary">
                    [{conflictingJob.id}] {conflictingJob.title}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-tight line-clamp-2">
                    {conflictingJob.description}
                  </p>
                  <div className="text-[10px] font-mono text-text-tertiary pt-1 flex items-center justify-between">
                    <span>Est: {conflictingJob.estimatedHours}h ({conflictingJob.actualHours}h logged)</span>
                    <span>Due: {new Date(conflictingJob.dueDate).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-text-tertiary">No conflicting deliverable detected.</div>
              )}
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
              Select Traffic Mitigation Strategy:
            </label>

            <div className="space-y-2">
              {/* Option 1: Pause Current Job */}
              <button
                type="button"
                onClick={() => setSelectedResolution('paused_current')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'paused_current'
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                    : 'bg-surface border-border hover:border-[var(--color-brand)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <Pause className="w-4 h-4 shrink-0" style={{ color: selectedResolution === 'paused_current' ? 'var(--color-brand)' : 'var(--color-critical)' }} />
                    <span>Pause Current Job &amp; Prioritize Client Revert (Emergency Hotfix)</span>
                  </div>
                  {selectedResolution === 'paused_current' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Temporarily puts {conflictingJob ? `[${conflictingJob.id}]` : 'current job'} on hold (<code className="text-[10px] text-text-tertiary">awaiting_input</code>) and clears {originalAssignee?.name}&apos;s schedule to fix the client revert immediately.
                </p>
              </button>

              {/* Option 2: Queue Revert */}
              <button
                type="button"
                onClick={() => setSelectedResolution('queued')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'queued'
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                    : 'bg-surface border-border hover:border-[var(--color-brand)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                    <span>Queue Revert Behind Active Job (Sequential Production)</span>
                  </div>
                  {selectedResolution === 'queued' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Protects {originalAssignee?.name}&apos;s focus. The revert will be queued next in line once the current deliverable is delivered.
                </p>
              </button>

              {/* Option 3: Reassign to Available Peer */}
              <button
                type="button"
                onClick={() => setSelectedResolution('reassigned')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'reassigned'
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                    : 'bg-surface border-border hover:border-[var(--color-brand)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <UserCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                    <span>Reassign Revert to Available Peer (Bandwidth Offload)</span>
                  </div>
                  {selectedResolution === 'reassigned' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Leaves {originalAssignee?.name} on their job and routes the revert deliverable to a peer with capacity.
                </p>
              </button>

              {/* Option 4: Split Timeline & Time-share */}
              <button
                type="button"
                onClick={() => setSelectedResolution('split_timeline')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'split_timeline'
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                    : 'bg-surface border-border hover:border-[var(--color-brand)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <Split className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                    <span>Split Timeline &amp; Time-share Production (Dual Track)</span>
                  </div>
                  {selectedResolution === 'split_timeline' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Allows {originalAssignee?.name} to juggle both deliverables by moving deadlines forward and configuring daily time-sharing blocks.
                </p>
              </button>
            </div>
          </div>

          {/* DEDICATED TIME-MOVING & SPLIT CONFIGURATION PANEL (Option 4) */}
          {selectedResolution === 'split_timeline' && (
            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                  <span>Traffic Desk: Timeline Moving &amp; Time-Share Configuration</span>
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  Reschedules both client commitments
                </span>
              </div>

              {/* Due Date Moving Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Revert Deliverable Timeline Extension */}
                <div className="p-3 rounded-lg border border-border bg-surface space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-text-primary">
                      Extend Revert [{job.id}] Deadline:
                    </span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
                      +{revertDaysExtended} Days
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRevertDaysExtended(days)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          revertDaysExtended === days
                            ? 'shadow-xs'
                            : 'bg-surface-elevated hover:bg-surface border border-border text-text-secondary'
                        }`}
                        style={
                          revertDaysExtended === days
                            ? {
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }
                            : undefined
                        }
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-text-tertiary pt-1 flex items-center justify-between">
                    <span>Current: {new Date(currentRevertDueDate).toLocaleDateString()}</span>
                    <span className="font-bold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                      ➔ {new Date(newRevertDueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* 2. Active Deliverable Timeline Extension */}
                <div className="p-3 rounded-lg border border-border bg-surface space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-text-primary truncate">
                      Extend Active [{conflictingJob?.id || 'Active'}] Deadline:
                    </span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
                      +{activeJobDaysExtended} Days
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setActiveJobDaysExtended(days)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          activeJobDaysExtended === days
                            ? 'shadow-xs'
                            : 'bg-surface-elevated hover:bg-surface border border-border text-text-secondary'
                        }`}
                        style={
                          activeJobDaysExtended === days
                            ? {
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }
                            : undefined
                        }
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-text-tertiary pt-1 flex items-center justify-between">
                    <span>Current: {new Date(currentActiveDueDate).toLocaleDateString()}</span>
                    <span className="font-bold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                      ➔ {new Date(newActiveDueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Daily Capacity Allocation (Time-Share Split) */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-text-primary">
                  Daily 8-Hour Workload Split for {originalAssignee?.name}:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '50_50', label: '50% / 50% (4h / 4h)', sub: 'Balanced Half-Day Focus' },
                    { id: '30_70', label: '30% / 70% (2.5h / 5.5h)', sub: 'Active Job Priority' },
                    { id: '70_30', label: '70% / 30% (5.5h / 2.5h)', sub: 'Revert Sprint Priority' }
                  ].map((preset) => {
                    const isPreset = dailySplitPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setDailySplitPreset(preset.id as any)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isPreset
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                            : 'border-border bg-surface text-text-secondary hover:border-border-subtle'
                        }`}
                      >
                        <div className="font-bold text-xs text-text-primary">{preset.label}</div>
                        <div className="text-[9px] text-text-tertiary mt-0.5">{preset.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time-Block Schedule Card */}
              <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between text-[11px] gap-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  <span className="text-text-secondary">
                    <strong>Morning Block:</strong> [{job.id}] Revert ({revertDailyHours}h)
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  <span className="text-text-secondary">
                    <strong>Afternoon Block:</strong> [{conflictingJob?.id || 'Active'}] ({activeDailyHours}h)
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-text-secondary leading-relaxed flex items-start gap-1.5 p-2 rounded-lg bg-surface border border-border">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-tertiary" />
                <span>
                  Confirming will formally shift the due dates for both deliverables in the system and log the schedule alteration in the live Governance Audit trail.
                </span>
              </div>
            </div>
          )}

          {/* If Reassigned, show peer picker */}
          {selectedResolution === 'reassigned' && (
            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2.5 animate-in fade-in">
              <label className="block text-xs font-semibold text-text-secondary">Select Available Creative Peer:</label>
              <div className="grid grid-cols-2 gap-2">
                {candidatePeers.map((peer) => {
                  const isPeerSelected = targetAssigneeId === peer.id;
                  const cap = employeeCapacities[peer.id];

                  return (
                    <button
                      type="button"
                      key={peer.id}
                      onClick={() => setTargetAssigneeId(peer.id)}
                      className="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                      style={
                        isPeerSelected
                          ? {
                              backgroundColor: 'var(--color-brand-muted)',
                              borderColor: 'var(--color-brand)'
                            }
                          : {
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)'
                            }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-text-primary">{peer.name}</span>
                        <SeniorityBadge seniority={peer.seniority || 'mid'} size="xs" />
                      </div>
                      <div className="text-[10px] font-mono text-text-tertiary mt-1">
                        Load: {cap ? `${cap.capacityPercent}% (${cap.assignedHours}h)` : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Informational Callout */}
          <div
            className="p-3 rounded-xl border flex items-start gap-2.5 text-xs"
            style={{
              backgroundColor: 'var(--color-brand-muted)',
              borderColor: 'var(--color-brand)'
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-brand)' }} />
            <div className="text-text-primary">
              Acting as Authority <strong>{currentUser.name} ({formatRole(currentUser.role)})</strong>. Resolving this conflict logs directly to the live Governance Audit trail and unblocks deliverable execution.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Execute Resolution Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
