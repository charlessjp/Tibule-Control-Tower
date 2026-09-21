import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { X, CheckCircle, RotateCcw, Clock, ExternalLink, ShieldCheck, MessageSquare } from 'lucide-react';

interface ManagerReviewModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerReviewModal: React.FC<ManagerReviewModalProps> = ({ job, isOpen, onClose }) => {
  const { managerReviewDecision, users } = useApp();

  const [decisionMode, setDecisionMode] = useState<'approved' | 'feedback'>('approved');
  const [feedbackNotes, setFeedbackNotes] = useState(
    'Quality meets high agency standards. Typography hierarchy, contrast, and layout align with client guidelines.'
  );
  const [revisedHours, setRevisedHours] = useState<number>(4);

  if (!isOpen || !job) return null;

  const assignee = users.find((u) => u.id === job.assigneeId);
  const submission = job.deliverableSubmission;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    managerReviewDecision(
      job.id,
      decisionMode,
      feedbackNotes,
      decisionMode === 'feedback' ? Number(revisedHours) : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="manager-review-modal"
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)'
                }}
              >
                Discipline Review &amp; Signoff
              </span>
              <h2 className="text-base font-bold">Manager Review &amp; Signoff</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Evaluating submission by {assignee?.name || 'Staff'} ({job.assignedSeniority ? job.assignedSeniority.toUpperCase() : 'MID'}).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Submission Details Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold" style={{ color: 'var(--color-brand)' }}>{job.id} • {job.standardTaskType || job.category}</span>
              <span className="font-mono text-[11px] text-text-tertiary">Allocated Hours: {job.estimatedHours}h</span>
            </div>
            <h3 className="font-bold text-sm leading-snug">{job.title}</h3>
            
            {submission ? (
              <div className="p-3 rounded-lg border border-border bg-surface text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-text-tertiary">
                  <span>Submitted by: <strong className="text-text-primary">{submission.submitterName}</strong></span>
                  <span>{new Date(submission.submittedDate).toLocaleDateString()}</span>
                </div>
                <p className="text-text-secondary">{submission.summary}</p>
                {submission.fileLinks && submission.fileLinks.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {submission.fileLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold hover:underline"
                        style={{
                          backgroundColor: 'var(--color-brand-muted)',
                          borderColor: 'var(--color-brand)',
                          color: 'var(--color-brand)'
                        }}
                      >
                        <ExternalLink className="w-3 h-3" /> View Asset #{idx + 1}
                      </a>
                    ))}
                  </div>
                )}
                {submission.notes && (
                  <p className="text-[11px] text-text-tertiary italic pt-1 border-t border-border/40">
                    Note: "{submission.notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary">Work completed by team. Ready for formal manager review.</p>
            )}
          </div>

          {/* Decision Mode Selection */}
          <div>
            <label className="block text-xs font-semibold mb-2">Manager Determination</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Approve */}
              <button
                type="button"
                onClick={() => {
                  setDecisionMode('approved');
                  setFeedbackNotes('Deliverable approved. Work is sent to Client Service for client dispatch.');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'approved'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Approve Deliverable</span>
                </div>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Sent to Client Services to package and dispatch to the client.
                </p>
              </button>

              {/* Feedback Loop */}
              <button
                type="button"
                onClick={() => {
                  setDecisionMode('feedback');
                  setFeedbackNotes('Please refine the secondary color contrasts and adjust endframe timing +4 hours.');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'feedback'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Request Feedback / Changes</span>
                </div>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Cycles back to staff with newly assigned time budget.
                </p>
              </button>
            </div>
          </div>

          {/* Feedback & Revised Hours Inputs if Feedback Mode */}
          {decisionMode === 'feedback' && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Assign New Times for Feedback Iteration
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  Current Total: {job.estimatedHours}h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-amber-500">Additional Hours Assigned</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={revisedHours}
                      onChange={(e) => setRevisedHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono font-bold outline-hidden focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-text-tertiary">hrs added</span>
                  </div>
                </div>
                <div className="flex flex-col justify-end text-[11px] font-mono text-text-tertiary">
                  <div>New Deliverable Budget:</div>
                  <strong className="text-sm font-bold text-amber-500">
                    {job.estimatedHours + Number(revisedHours)} hours total
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Notes / Feedback Field */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              {decisionMode === 'approved' ? 'Manager Approval Notes' : 'Specific Feedback & Revision Directives'}
            </label>
            <textarea
              rows={3}
              required
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
            />
          </div>

          {/* Informational Callout */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            decisionMode === 'approved'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              {decisionMode === 'approved'
                ? 'Approval automatically pushes the deliverable to the Client Service queue. Client Service will do final packaging and dispatch directly to the client.'
                : 'Feedback returns the deliverable to the staff member in production. New times are logged to their capacity ledger.'}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer ${
                decisionMode === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {decisionMode === 'approved' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Approve &amp; Send to Client Service
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" /> Assign New Times &amp; Return to Staff
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
