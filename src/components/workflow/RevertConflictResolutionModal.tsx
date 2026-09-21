import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { formatRole } from '../../utils/formatters';
import { SeniorityBadge } from '../common/SeniorityBadge';
import {
  X,
  AlertTriangle,
  PauseCircle,
  Clock,
  UserCheck,
  Split,
  ShieldCheck,
  CheckCircle2
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
  >('paused_current');

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

  if (!isOpen || !job || !job.clientRevertInfo) return null;

  const revertInfo = job.clientRevertInfo;
  const originalAssignee = users.find((u) => u.id === job.assigneeId);
  const conflictingJob = jobs.find((j) => j.id === revertInfo.conflictingJobId);

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    resolveRevertConflict(
      job.id,
      selectedResolution,
      selectedResolution === 'reassigned' ? targetAssigneeId : undefined
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
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
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
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-500">
                <span>INCOMING CLIENT REVERT</span>
                <span className="font-mono">#{revertInfo.revertCount}</span>
              </div>
              <div className="font-bold text-xs leading-tight text-text-primary">[{job.id}] {job.title}</div>
              <p className="text-[11px] text-text-secondary leading-tight line-clamp-2">
                &quot;{revertInfo.feedbackNotes}&quot;
              </p>
              <div className="text-[10px] font-mono pt-1 text-rose-400 font-semibold">
                +{revertInfo.additionalHoursNeeded}h required • Urgency: {job.priority.toUpperCase()}
              </div>
            </div>

            {/* Existing Active Deliverable */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                <span>CURRENT IN-PROGRESS JOB</span>
                <span className="font-mono">ACTIVE</span>
              </div>
              <div className="font-bold text-xs leading-tight text-text-primary">
                {conflictingJob ? `[${conflictingJob.id}] ${conflictingJob.title}` : 'Active deliverable in progress'}
              </div>
              <p className="text-[11px] leading-tight line-clamp-2 text-text-secondary">
                Assignee: <strong className="text-text-primary">{originalAssignee?.name}</strong> ({originalAssignee?.jobTitle})
              </p>
              <div className="text-[10px] font-mono pt-1 text-text-tertiary">
                Status: {conflictingJob?.status || 'in_progress'} • Due: {conflictingJob ? new Date(conflictingJob.dueDate).toLocaleDateString() : 'Active'}
              </div>
            </div>
          </div>

          {/* Conflict Strategies Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-text-secondary">
              Select Strategic Engine Resolution Protocol:
            </label>
            <div className="space-y-2">
              {/* Option 1: Pause Current Job (Emergency Hotfix) */}
              <button
                type="button"
                onClick={() => setSelectedResolution('paused_current')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'paused_current'
                    ? 'bg-rose-500/15 border-rose-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <PauseCircle className="w-4 h-4 text-rose-500" />
                    <span>Pause Current Job &amp; Expedite Revert (Emergency Hotfix)</span>
                  </div>
                  {selectedResolution === 'paused_current' && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
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
                    ? 'shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
                style={
                  selectedResolution === 'queued'
                    ? {
                        backgroundColor: 'var(--color-brand-muted)',
                        borderColor: 'var(--color-brand)'
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <Clock className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
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
                    ? 'border-purple-500 bg-purple-500/15 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>Reassign Revert to Available Peer (Bandwidth Offload)</span>
                  </div>
                  {selectedResolution === 'reassigned' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Leaves {originalAssignee?.name} on their job and routes the revert deliverable to a peer with capacity.
                </p>
              </button>

              {/* Option 4: Split Timeline */}
              <button
                type="button"
                onClick={() => setSelectedResolution('split_timeline')}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedResolution === 'split_timeline'
                    ? 'bg-amber-500/15 border-amber-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-text-primary">
                    <Split className="w-4 h-4 text-amber-500" />
                    <span>Split Timeline &amp; Time-share Production (Dual Track)</span>
                  </div>
                  {selectedResolution === 'split_timeline' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs mt-1 pl-6.5 text-text-secondary">
                  Allows {originalAssignee?.name} to juggle both deliverables by extending the timeline and splitting daily hours.
                </p>
              </button>
            </div>
          </div>

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
              Execute Resolution Strategy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
