import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobStatus } from '../../types';
import { formatStatus } from '../../utils/formatters';
import { TrafficPulseBadge } from './TrafficPulseBadge';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import {
  X,
  Briefcase,
  User,
  Clock,
  Calendar,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FileCheck,
  Sunrise,
  Sunset,
  Sparkles,
  Award,
  ThumbsUp
} from 'lucide-react';

export const OperationalInspector: React.FC = () => {
  const {
    currentUser,
    theme,
    selectedJobId,
    setSelectedJobId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    jobs,
    users,
    teams,
    comments,
    employeeCapacities,
    updateJobStatus,
    reassignJob,
    indicateBlocker,
    resolveBlocker,
    addComment,
    rebalanceWorkload,
    setShowBuildCaseModal,
    setShowCorrectionModal,
    overtimeLogs,
    acknowledgeOvertime,
    openLogOvertimeModal,
    getUserOvertimeSummary
  } = useApp();

  const isDark = theme === 'dark';

  const [commentInput, setCommentInput] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');
  const [blockerDep, setBlockerDep] = useState('');

  // Priority to Job inspection if a job is selected, else Employee
  const activeJob = jobs.find((j) => j.id === selectedJobId);
  const activeEmployee = users.find((u) => u.id === selectedEmployeeId);

  if (!activeJob && !activeEmployee) return null;

  const handleClose = () => {
    setSelectedJobId(null);
    setSelectedEmployeeId(null);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeJob) return;
    addComment(activeJob.id, commentInput.trim());
    setCommentInput('');
  };

  const handleConfirmBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim() || !activeJob) return;
    indicateBlocker(activeJob.id, blockerReason.trim(), blockerDep.trim() || undefined);
    setBlockerReason('');
    setBlockerDep('');
    setShowBlockerInput(false);
  };

  return (
    <aside
      id="operational-inspector-panel"
      className="w-full lg:w-96 shrink-0 border-l h-full flex flex-col z-30 transition-all duration-200 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Inspector Top Bar */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-surface-muted)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-text-tertiary">
            Deliverable Details
          </span>
          <span className="text-text-tertiary">•</span>
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
            {activeJob ? activeJob.id : activeEmployee?.name}
          </span>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-md transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* If Job selected */}
        {activeJob && (
          <div className="space-y-5">
            {/* Title & Client */}
            <div>
              <div className="text-[10px] uppercase font-mono text-text-tertiary tracking-wider">
                {activeJob.clientProject} · {activeJob.category}
              </div>
              <h3 className="text-base font-bold text-text-primary mt-1 leading-snug">
                {activeJob.title}
              </h3>
              <p className="text-text-secondary mt-1.5 leading-relaxed">
                {activeJob.description}
              </p>
            </div>

            {/* Operational State Controller */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                  Flow Lifecycle
                </span>
                <select
                  value={activeJob.status}
                  onChange={(e) => {
                    const next = e.target.value as JobStatus;
                    if (next === 'blocked') {
                      setShowBlockerInput(true);
                    } else {
                      updateJobStatus(activeJob.id, next);
                    }
                  }}
                  className="font-mono text-[11px] font-bold uppercase bg-surface border border-border rounded px-2 py-1 text-text-primary focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="awaiting_input">Awaiting Input</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Blocker alert if active */}
              {activeJob.status === 'blocked' && (
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-700 dark:text-purple-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <ShieldAlert className="w-3.5 h-3.5" /> Dependency Hold
                    </span>
                    <button
                      onClick={() => resolveBlocker(activeJob.id)}
                      className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[10px] transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {activeJob.blockerReason || 'Third-party input delay. Worker SLA paused.'}
                  </p>
                </div>
              )}

              {/* Inline Blocker Form */}
              {showBlockerInput && (
                <form onSubmit={handleConfirmBlocker} className="p-3 rounded-lg bg-surface border border-rose-500/30 space-y-2">
                  <span className="font-bold text-rose-500 text-[10px] uppercase">
                    Declare External Dependency Blocker
                  </span>
                  <input
                    type="text"
                    required
                    value={blockerReason}
                    onChange={(e) => setBlockerReason(e.target.value)}
                    placeholder="Reason for block (e.g. Legal signoff required)..."
                    className="w-full p-1.5 rounded bg-surface-elevated border border-border text-text-primary text-xs"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowBlockerInput(false)}
                      className="px-2 py-1 text-[11px] text-text-tertiary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold"
                    >
                      Apply Hold
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Agency Workflow Stage & Revert Traceability */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                  Agency Workflow Stage
                </span>
                <WorkflowStatusBadge
                  stage={activeJob.workflowStage || 'in_production'}
                  size="sm"
                />
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Task Archetype:</span>
                  <strong className="font-mono">{activeJob.standardTaskType || activeJob.category}</strong>
                </div>
                {activeJob.assignedSeniority && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-tertiary">Prescribed Seniority:</span>
                    <strong className="font-mono text-text-primary uppercase">{activeJob.assignedSeniority}</strong>
                  </div>
                )}
                {activeJob.trafficHandoffNotes && (
                  <div className="text-[10px] text-text-tertiary italic pt-1 border-t border-border/40">
                    Traffic Note: "{activeJob.trafficHandoffNotes}"
                  </div>
                )}
              </div>

              {/* Client Revert Alert in Inspector */}
              {activeJob.clientRevertInfo && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-500">
                    <span>CLIENT REVERT #{activeJob.clientRevertInfo.revertCount}</span>
                    {activeJob.clientRevertInfo.conflictDetected && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] uppercase font-bold">
                        Conflict
                      </span>
                    )}
                  </div>
                  <p className="leading-snug">"{activeJob.clientRevertInfo.feedbackNotes}"</p>
                  <div className="text-[10px] font-mono opacity-80 pt-0.5">
                    +{activeJob.clientRevertInfo.additionalHoursNeeded}h added · Strategy: {activeJob.clientRevertInfo.conflictResolution || 'Pending resolution'}
                  </div>
                </div>
              )}

              {/* Deliverable Submission Summary */}
              {activeJob.deliverableSubmission && (
                <div
                  className="p-2.5 rounded-lg border text-[11px] space-y-1"
                  style={{
                    backgroundColor: 'var(--color-brand-muted)',
                    borderColor: 'var(--color-brand)'
                  }}
                >
                  <div className="font-bold" style={{ color: 'var(--color-brand)' }}>
                    Submitted by {activeJob.deliverableSubmission.submitterName}
                  </div>
                  <p className="text-text-secondary leading-snug">
                    {activeJob.deliverableSubmission.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Effort & Allocation Horizon */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-surface-elevated/50 border border-border/60">
                <span className="text-text-tertiary uppercase text-[9px] block">Effort Envelope</span>
                <span className="text-sm font-bold text-text-primary mt-0.5 block">
                  {activeJob.estimatedHours} hrs
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-elevated/50 border border-border/60">
                <span className="text-text-tertiary uppercase text-[9px] block">Target Gate</span>
                <span className="text-sm font-bold text-text-primary mt-0.5 block">
                  {new Date(activeJob.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Assignee Card */}
            <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center border border-brand-primary/20">
                  {activeJob.assigneeName ? activeJob.assigneeName.charAt(0) : '?'}
                </div>
                <div>
                  <div className="font-semibold text-text-primary">
                    {activeJob.assigneeName || 'Unallocated in Team Queue'}
                  </div>
                  <div className="text-[10px] text-text-tertiary">
                    {activeJob.priority} priority · {activeJob.complexity} complexity
                  </div>
                </div>
              </div>
            </div>

            {/* Workstream Communication */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-text-tertiary">
                <span>Context Stream ({comments.filter((c) => c.jobId === activeJob.id).length})</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comments
                  .filter((c) => c.jobId === activeJob.id)
                  .map((cmt) => (
                    <div key={cmt.id} className="p-2.5 rounded-lg bg-surface-elevated/60 border border-border/50 text-[11px]">
                      <div className="flex justify-between font-semibold text-text-primary">
                        <span>{cmt.authorName}</span>
                        <span className="text-[9px] font-mono text-text-tertiary">
                          {new Date(cmt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-secondary mt-1 leading-relaxed">{cmt.content}</p>
                    </div>
                  ))}
              </div>

              <form onSubmit={handlePostComment} className="flex gap-1.5">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add clarification or progress note..."
                  className="flex-1 p-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-40 text-white font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Overtime & Good Books on this Task */}
            <div className="p-3 rounded-xl bg-surface-elevated/70 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-text-primary">Task Overtime &amp; Good Books</span>
                </div>
                <button
                  type="button"
                  onClick={() => openLogOvertimeModal(activeJob.id)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  + Log Overtime
                </button>
              </div>

              {overtimeLogs.filter((l) => l.jobId === activeJob.id).length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-0.5">
                  {overtimeLogs
                    .filter((l) => l.jobId === activeJob.id)
                    .map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-surface border border-border text-[11px] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{log.userName}</span>
                          <span className="font-mono text-[10px] font-bold text-amber-500">
                            +{log.hoursLogged}h ({log.period === 'pre_9am' ? 'Pre-9 AM' : log.period === 'post_5pm' ? 'Post-5 PM' : 'Weekend'})
                          </span>
                        </div>
                        <p className="text-text-secondary italic text-[10px] leading-snug">
                          &ldquo;{log.materialNote}&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <span className="text-[9px] font-mono text-emerald-500 font-bold">
                            +{log.goodBooksPoints} Good Books pts
                          </span>
                          {log.status === 'pending_acknowledgment' ? (
                            (currentUser.role === 'general_manager' || currentUser.role.includes('manager') || currentUser.role === 'admin') ? (
                              <button
                                type="button"
                                onClick={() => acknowledgeOvertime(log.id)}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Endorse to Good Books</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-text-tertiary font-mono">Pending Endorsement</span>
                            )
                          ) : (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{log.status === 'acknowledged_by_gm' ? 'GM Endorsed' : 'Manager Endorsed'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-tertiary">
                  Standard hours (9–5). No early or late overtime logged yet for this deliverable.
                </p>
              )}
            </div>
          </div>
        )}

        {/* If Employee selected */}
        {activeEmployee && !activeJob && (
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase font-mono text-text-tertiary tracking-wider">
                Workforce Capability Profile
              </div>
              <h3 className="text-base font-bold text-text-primary mt-1">
                {activeEmployee.name}
              </h3>
              <p className="text-text-secondary font-mono text-[11px]">
                {activeEmployee.jobTitle} · {teams.find((t) => t.id === activeEmployee.teamId)?.name}
              </p>
            </div>

            {/* Capacity Status */}
            <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                  Current Density
                </span>
                <TrafficPulseBadge
                  state={employeeCapacities[activeEmployee.id]?.trafficState || 'clear'}
                  size="sm"
                />
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-text-secondary">Assigned Commitments:</span>
                <span className="font-mono font-bold text-text-primary text-sm">
                  {employeeCapacities[activeEmployee.id]?.assignedHours || 0} / {activeEmployee.capacityHoursPerWeek} hrs
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (employeeCapacities[activeEmployee.id]?.capacityPercent || 0) > 100
                      ? 'bg-rose-500'
                      : (employeeCapacities[activeEmployee.id]?.capacityPercent || 0) >= 85
                      ? 'bg-amber-500'
                      : 'bg-brand-primary'
                  }`}
                  style={{
                    width: `${Math.min(
                      employeeCapacities[activeEmployee.id]?.capacityPercent || 0,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Skills & Capability Radar */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                Core Capabilities & Focus
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeEmployee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded bg-surface-elevated border border-border text-[11px] font-medium text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Active In-Progress Jobs */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-text-tertiary">
                Active In-Progress Jobs ({jobs.filter((j) => j.assigneeId === activeEmployee.id && j.status !== 'completed').length})
              </span>
              <div className="space-y-1.5">
                {jobs
                  .filter((j) => j.assigneeId === activeEmployee.id && j.status !== 'completed')
                  .map((j) => (
                    <div
                      key={j.id}
                      onClick={() => setSelectedJobId(j.id)}
                      className="p-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border/70 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-[10px] font-bold text-brand-primary">{j.id}</span>
                        <div className="font-medium text-text-primary truncate">{j.title}</div>
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary shrink-0">
                        {formatStatus(j.status)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Overtime & Good Books Career Material */}
            {(() => {
              const otSummary = getUserOvertimeSummary(activeEmployee.id);
              const isManagerOrGM =
                currentUser.role === 'general_manager' ||
                currentUser.role === 'admin' ||
                currentUser.role.includes('manager') ||
                currentUser.role.includes('lead') ||
                currentUser.role.includes('director');

              return (
                <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="text-xs font-bold text-text-primary">Good Books · Overtime Material</div>
                        <div className="text-[10px] text-text-tertiary font-mono">
                          Standard Workday: 9:00 AM – 5:00 PM
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      +{otSummary.goodBooksPoints} pts
                    </span>
                  </div>

                  {/* Stat breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <div className="text-[9px] font-mono uppercase text-text-tertiary flex items-center justify-center gap-1">
                        <Sunrise className="w-3 h-3 text-amber-500" />
                        <span>Pre-9 AM</span>
                      </div>
                      <div className="text-xs font-bold font-mono text-text-primary mt-0.5">
                        {otSummary.pre9amHours}h
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <div className="text-[9px] font-mono uppercase text-text-tertiary flex items-center justify-center gap-1">
                        <Sunset className="w-3 h-3 text-indigo-500" />
                        <span>Post-5 PM</span>
                      </div>
                      <div className="text-xs font-bold font-mono text-text-primary mt-0.5">
                        {otSummary.post5pmHours}h
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <div className="text-[9px] font-mono uppercase text-text-tertiary">
                        Total OT
                      </div>
                      <div className="text-xs font-bold font-mono text-amber-500 mt-0.5">
                        {otSummary.totalHours}h
                      </div>
                    </div>
                  </div>

                  {/* Overtime log items */}
                  {otSummary.logs.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-mono font-bold text-text-tertiary">
                        Verified Task Contributions ({otSummary.logs.length})
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                        {otSummary.logs.map((log) => (
                          <div
                            key={log.id}
                            className="p-2.5 rounded-lg bg-surface border border-border text-[11px] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text-primary">
                                [{log.jobId}] {log.jobTitle}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-amber-500">
                                {log.hoursLogged}h ({log.period === 'pre_9am' ? 'Pre-9 AM' : log.period === 'post_5pm' ? 'Post-5 PM' : 'Weekend'})
                              </span>
                            </div>
                            <div className="text-[10px] text-text-tertiary font-mono">
                              {log.date} · {log.startTime} – {log.endTime}
                            </div>
                            <p className="text-text-secondary italic text-[11px] leading-snug">
                              &ldquo;{log.materialNote}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                              <span className="text-[9px] font-mono text-emerald-500 font-bold">
                                +{log.goodBooksPoints} Good Books pts
                              </span>

                              {log.status === 'pending_acknowledgment' ? (
                                isManagerOrGM ? (
                                  <button
                                    type="button"
                                    onClick={() => acknowledgeOvertime(log.id)}
                                    className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>Endorse into Good Books</span>
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-text-tertiary font-mono">
                                    Pending Manager / GM Endorsement
                                  </span>
                                )
                              ) : (
                                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>
                                    {log.status === 'acknowledged_by_gm' ? 'GM Endorsed' : 'Manager Endorsed'}
                                    {log.acknowledgedByName ? ` (${log.acknowledgedByName})` : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-tertiary text-center py-2">
                      No overtime logged yet for this employee.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Inspector Footer Actions */}
      <div className="p-3.5 border-t border-border/70 bg-surface-elevated/40 flex items-center justify-between">
        {activeJob && (
          <button
            onClick={() => {
              updateJobStatus(activeJob.id, 'completed');
            }}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Deliverable Completed
          </button>
        )}
        {activeEmployee && !activeJob && (
          <button
            onClick={() => setShowBuildCaseModal(true)}
            className="w-full py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-brand)'
            }}
          >
            <FileCheck className="w-4 h-4" />
            View Career Evidence
          </button>
        )}
      </div>
    </aside>
  );
};
