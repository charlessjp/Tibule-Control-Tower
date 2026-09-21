import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobStatus, Priority, Complexity } from '../../types';
import {
  X,
  Briefcase,
  User,
  Clock,
  Calendar,
  AlertOctagon,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  ShieldAlert,
  Send,
  ArrowRight,
  RefreshCw,
  FileCheck,
  ChevronDown
} from 'lucide-react';

export const JobDetailDrawer: React.FC = () => {
  const {
    selectedJobId,
    setSelectedJobId,
    jobs,
    users,
    teams,
    comments,
    currentUser,
    updateJobStatus,
    reassignJob,
    indicateBlocker,
    resolveBlocker,
    addComment,
    setMetricTraceModal,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  const [commentText, setCommentText] = useState('');
  const [showBlockerForm, setShowBlockerForm] = useState(false);
  const [blockerReasonInput, setBlockerReasonInput] = useState('');
  const [blockerDependencyInput, setBlockerDependencyInput] = useState('');
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);

  if (!selectedJobId) return null;

  const job = jobs.find((j) => j.id === selectedJobId);
  if (!job) return null;

  const assignee = users.find((u) => u.id === job.assigneeId);
  const team = teams.find((t) => t.id === job.teamId);
  const jobComments = comments.filter((c) => c.jobId === job.id);

  const teamUsers = users.filter((u) => u.teamId === job.teamId);

  const handleStatusChange = (newStatus: JobStatus) => {
    if (newStatus === 'blocked') {
      setShowBlockerForm(true);
    } else {
      updateJobStatus(job.id, newStatus);
    }
  };

  const handleBlockerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReasonInput.trim()) return;
    indicateBlocker(job.id, blockerReasonInput, blockerDependencyInput || undefined);
    setBlockerReasonInput('');
    setBlockerDependencyInput('');
    setShowBlockerForm(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(job.id, commentText.trim());
    setCommentText('');
  };

  const priorityBadgeClasses = {
    urgent: 'badge-priority-urgent',
    high: 'badge-priority-high',
    medium: 'badge-priority-medium',
    low: 'badge-priority-low'
  }[job.priority] || 'badge-priority-medium';

  const complexityBadgeClasses = {
    extreme: 'bg-[var(--color-critical)]/10 text-[var(--color-critical)] border-[var(--color-critical)]/30',
    high: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30',
    medium: 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] border-[var(--color-brand)]/40',
    low: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30'
  }[job.complexity] || 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] border-[var(--color-brand)]/40';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="job-detail-drawer"
        className="w-full max-w-2xl h-full border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs font-bold px-2.5 py-1 rounded border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                borderColor: 'var(--color-brand)',
                color: 'var(--color-brand)'
              }}
            >
              {job.id}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${priorityBadgeClasses}`}>
                {job.priority} Priority
              </span>
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${complexityBadgeClasses}`}>
                {job.complexity} Complexity
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedJobId(null)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-text-primary leading-tight">{job.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{job.description}</p>
          </div>

          {/* Operational Workflow Controls */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Operational Lifecycle
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary">Current State:</span>
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
                  className="text-xs font-mono font-bold uppercase bg-surface border border-border rounded-md px-3 py-1.5 text-text-primary focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="awaiting_input">Awaiting Input</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="reopened">Reopened</option>
                </select>
              </div>
            </div>

            {/* If Blocked Banner */}
            {job.status === 'blocked' && (
              <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-700 dark:text-purple-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    Dependency Blocker Active
                  </div>
                  <button
                    onClick={() => resolveBlocker(job.id)}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                  >
                    Mark Resolved & Resume
                  </button>
                </div>
                <p className="text-xs text-text-secondary">
                  <strong>Reason:</strong> {job.blockerReason || 'External dependency delay'}
                </p>
                {job.dependencies && job.dependencies.length > 0 && (
                  <div className="text-[11px] text-text-tertiary">
                    Dependencies: {job.dependencies.join(' • ')}
                  </div>
                )}
              </div>
            )}

            {/* Blocker Form Modal inline */}
            {showBlockerForm && (
              <form onSubmit={handleBlockerSubmit} className="p-3.5 rounded-lg bg-surface border border-rose-500/30 space-y-3">
                <div className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> Indicate Dependency Blocker
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase mb-1">
                    What is preventing this work from progressing?
                  </label>
                  <textarea
                    required
                    value={blockerReasonInput}
                    onChange={(e) => setBlockerReasonInput(e.target.value)}
                    placeholder="e.g., Awaiting updated legal copyright verification or client approval"
                    className="w-full text-xs p-2 rounded bg-surface-elevated border border-border text-text-primary focus:outline-none focus:border-rose-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase mb-1">
                    Specific Dependency / External Party
                  </label>
                  <input
                    type="text"
                    value={blockerDependencyInput}
                    onChange={(e) => setBlockerDependencyInput(e.target.value)}
                    placeholder="e.g. Zenith Procurement Legal"
                    className="w-full text-xs p-2 rounded bg-surface-elevated border border-border text-text-primary focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBlockerForm(false)}
                    className="px-3 py-1.5 rounded text-xs text-text-tertiary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                  >
                    Confirm Blocker
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Allocation & Effort Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-elevated border border-border/70">
              <div className="text-text-tertiary uppercase text-[10px]">Client / Project</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate">{job.clientProject}</div>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border/70">
              <div className="text-text-tertiary uppercase text-[10px]">Requestor</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate">{job.requestor}</div>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border/70">
              <div className="text-text-tertiary uppercase text-[10px]">Estimated Effort</div>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                {job.estimatedHours} hrs
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border/70">
              <div className="text-text-tertiary uppercase text-[10px]">Due Date</div>
              <div className="font-semibold text-text-primary mt-0.5">
                {new Date(job.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Assignment Control */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center border border-brand-primary/20">
                {assignee ? assignee.name.charAt(0) : '?'}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-tertiary">
                  Assigned Employee
                </div>
                <div className="text-sm font-semibold text-text-primary">
                  {assignee ? assignee.name : 'Unallocated in Team Queue'}
                </div>
                <div className="text-xs text-text-tertiary">
                  {assignee ? assignee.jobTitle : `Team: ${team?.name}`}
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowReassignDropdown((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border hover:border-brand-primary/40 text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{assignee ? 'Reassign' : 'Allocate Work'}</span>
                <ChevronDown className="w-3 h-3 text-text-tertiary" />
              </button>

              {showReassignDropdown && (
                <div className="absolute right-0 mt-1 w-56 rounded-lg bg-surface border border-border shadow-xl p-1 z-20">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-text-tertiary">
                    Select Team Member
                  </div>
                  {teamUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        reassignJob(job.id, u.id, 'Management operational rebalance');
                        setShowReassignDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded text-xs hover:bg-surface-elevated flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-text-primary">{u.name}</span>
                      <span className="text-[10px] text-text-tertiary font-mono">{u.jobTitle.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reassignment Audit History (Section 14 & 18) */}
          {job.reassignmentHistory && job.reassignmentHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Reassignment History
              </div>
              <div className="space-y-1.5">
                {job.reassignmentHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-elevated/60 border border-border/60 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-text-secondary">{hist.reason}</span>
                      <div className="text-[10px] text-text-tertiary mt-0.5">
                        Authorised by {hist.actorName} • {new Date(hist.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Operational Clarifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Workstream Communication & Clarification ({jobComments.length})
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {jobComments.length === 0 ? (
                <div className="p-3 text-xs text-text-tertiary text-center bg-surface-elevated rounded-lg">
                  No comments yet. Add notes or request clarification below.
                </div>
              ) : (
                jobComments.map((cmt) => (
                  <div key={cmt.id} className="p-3 rounded-lg bg-surface-elevated border border-border/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-text-primary flex items-center gap-1.5">
                        <span>{cmt.authorName}</span>
                        <span className="text-[10px] text-text-tertiary font-normal">({cmt.authorRole})</span>
                      </div>
                      <span className="text-[10px] text-text-tertiary font-mono">
                        {new Date(cmt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{cmt.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post comment, blocker context, or clarification..."
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-surface-elevated border border-border text-text-primary focus:outline-none focus:border-brand-primary"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-2 rounded-lg disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-xs text-text-tertiary">
          <span>Created: {new Date(job.createdDate).toLocaleDateString()}</span>
          {job.status === 'completed' ? (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Delivered
            </span>
          ) : (
            <button
              onClick={() => updateJobStatus(job.id, 'completed', 'Completed deliverable by employee')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
