import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, Priority, ReworkClassification, RevertCategory } from '../../types';
import { checkAssigneeWorkloadConflict } from '../../utils/revertConflictEngine';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { X, AlertOctagon, RotateCcw, Tag } from 'lucide-react';

interface ClientRevertModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConflictDetected?: (jobId: string) => void;
}

export const ClientRevertModal: React.FC<ClientRevertModalProps> = ({
  job,
  isOpen,
  onClose,
  onConflictDetected
}) => {
  const { clientSubmitRevert, jobs, users } = useApp();

  const [feedbackNotes, setFeedbackNotes] = useState(
    'Client stakeholders reviewed V1 presentation. Requested emergency adjustments to typographic hierarchies and chart figures before launch.'
  );
  const [requestedChangesText, setRequestedChangesText] = useState(
    'Update quarterly delta chart figures\nRe-align logo lockup with minimum clearspace\nExport print-ready CMYK assets'
  );
  const [additionalHours, setAdditionalHours] = useState<number>(4);
  const [urgency, setUrgency] = useState<Priority>('urgent');
  const [reworkClassification, setReworkClassification] = useState<ReworkClassification>('correction');
  const [revertCategory, setRevertCategory] = useState<RevertCategory>('client_scope_shift');

  if (!isOpen || !job) return null;

  const originalAssignee = users.find((u) => u.id === job.assigneeId);
  const conflictCheck = checkAssigneeWorkloadConflict(jobs, job.id, job.assigneeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const changes = requestedChangesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    clientSubmitRevert(
      job.id,
      feedbackNotes,
      changes,
      Number(additionalHours),
      urgency,
      reworkClassification,
      revertCategory
    );

    onClose();

    if (conflictCheck.hasConflict && onConflictDetected) {
      onConflictDetected(job.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="client-revert-modal"
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Client Reverts &amp; Corrections Loop
              </span>
              <h2 className="text-base font-bold text-text-primary">Record Client Reverts</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Client feedback restarts the production cycle for deliverable [{job.id}].
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Deliverable info */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold" style={{ color: 'var(--color-brand)' }}>{job.id} • {job.standardTaskType || job.category}</span>
              <span className="font-mono text-[11px] text-text-tertiary">Client: {job.requestor}</span>
            </div>
            <h3 className="font-bold text-sm leading-snug text-text-primary">{job.title}</h3>
            <div className="flex items-center gap-3 text-xs font-mono text-text-tertiary">
              <span>Original Assignee: <strong className="text-text-primary">{originalAssignee?.name || 'Unassigned'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">Seniority: <SeniorityBadge seniority={originalAssignee?.seniority || 'mid'} size="xs" /></span>
            </div>
          </div>

          {/* Concurrency Conflict Pre-warning */}
          {conflictCheck.hasConflict && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-400">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                CONCURRENCY CONFLICT DETECTED IN ENGINE
              </div>
              <p className="text-xs leading-relaxed text-rose-200">
                <strong>{originalAssignee?.name}</strong> is currently actively busy on{' '}
                <strong>[{conflictCheck.conflictingJob?.id}] &quot;{conflictCheck.conflictingJob?.title}&quot;</strong>!
                When this revert cycles back, the engine will prompt you with resolution strategies (Queue, Pause Current Task, Reassign, or Split Timeline).
              </p>
            </div>
          )}

          {/* Client Feedback Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-text-secondary">Client Feedback Summary &amp; Stakeholder Remarks</label>
            <textarea
              rows={3}
              required
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Specific Requested Corrections List */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-text-secondary">
              Specific Corrections Required (One line per item)
            </label>
            <textarea
              rows={3}
              value={requestedChangesText}
              onChange={(e) => setRequestedChangesText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono outline-hidden focus:border-rose-500"
            />
          </div>

          {/* V2 Classification & Taxonomy */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-surface-elevated">
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand" />
                Rework Classification
              </label>
              <select
                value={reworkClassification}
                onChange={(e) => setReworkClassification(e.target.value as ReworkClassification)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-brand"
              >
                <option value="correction">Correction (Defect / Typo / Spec)</option>
                <option value="rework">Rework (Directional Revision)</option>
                <option value="scope_change">Scope Change (New Deliverable Additions)</option>
              </select>
              <p className="text-[10px] text-text-tertiary mt-1">Classifies effort for agency efficiency metrics.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Root Revert Category</label>
              <select
                value={revertCategory}
                onChange={(e) => setRevertCategory(e.target.value as RevertCategory)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-brand"
              >
                <option value="client_scope_shift">Client Scope Shift</option>
                <option value="creative_misinterpretation">Brief Misinterpretation</option>
                <option value="technical_dieline_adjustment">Technical / Print Dieline Fix</option>
                <option value="stakeholder_subjective_preference">Subjective Preference</option>
                <option value="other">Other / General Feedback</option>
              </select>
              <p className="text-[10px] text-text-tertiary mt-1">Root cause taxonomy for Revision Profile analytics.</p>
            </div>
          </div>

          {/* Additional Hours & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center justify-between text-text-secondary">
                <span>Additional Hours Allocated</span>
                <span className="text-[10px] font-mono text-text-tertiary">Re-assigned time</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={additionalHours}
                  onChange={(e) => setAdditionalHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono font-bold outline-hidden"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-text-tertiary">hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Revert Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
              >
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Turnaround</option>
              </select>
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
              <RotateCcw className="w-3.5 h-3.5" /> Submit Reverts &amp; Run Cycle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
