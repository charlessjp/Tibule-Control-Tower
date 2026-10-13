import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import {
  X,
  CheckCircle,
  RotateCcw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
  Lightbulb,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

interface ManagerReviewModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerReviewModal: React.FC<ManagerReviewModalProps> = ({ job, isOpen, onClose }) => {
  const { managerReviewDecision, users, currentUser } = useApp();

  const [decisionMode, setDecisionMode] = useState<'approved' | 'feedback'>('approved');
  const [bouncedIdeas, setBouncedIdeas] = useState<string[]>([
    'Enhance typography hierarchy and lead contrast',
    'Tighten opening 3-second hook for social video cutdowns',
    'Ensure color palette matches revised brand hex codes'
  ]);
  const [newIdeaInput, setNewIdeaInput] = useState('');

  const [discussionSummary, setDiscussionSummary] = useState(
    'Met with individual contributor to bounce creative ideas. Walked through the visual proof together, tested contrast variations, and codified precise aesthetic tweaks into our minds.'
  );

  const [codifiedChanges, setCodifiedChanges] = useState<string[]>([
    'Increase bold weight on primary headline by 15%',
    'Recalibrate background gradient from dark cobalt to royal blue',
    'Export responsive 9:16 and 1:1 cutdown variants'
  ]);
  const [newCodifiedInput, setNewCodifiedInput] = useState('');

  const [revisedHours, setRevisedHours] = useState<number>(4);

  if (!isOpen || !job) return null;

  const assignee = users.find((u) => u.id === job.assigneeId);
  const leadReviewer = currentUser;
  const submission = job.deliverableSubmission;

  const handleAddBouncedIdea = () => {
    if (newIdeaInput.trim()) {
      setBouncedIdeas([...bouncedIdeas, newIdeaInput.trim()]);
      setNewIdeaInput('');
    }
  };

  const handleRemoveBouncedIdea = (index: number) => {
    setBouncedIdeas(bouncedIdeas.filter((_, i) => i !== index));
  };

  const handleAddCodifiedChange = () => {
    if (newCodifiedInput.trim()) {
      setCodifiedChanges([...codifiedChanges, newCodifiedInput.trim()]);
      setNewCodifiedInput('');
    }
  };

  const handleRemoveCodifiedChange = (index: number) => {
    setCodifiedChanges(codifiedChanges.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedFeedbackNotes = decisionMode === 'approved'
      ? `Creative Alignment Session Approved. ${discussionSummary}\n\nCodified Sign-off Notes:\n${codifiedChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : `Creative Alignment Session Revisions Codified (+${revisedHours}h allocated).\n\nDiscussion Notes: ${discussionSummary}\n\nAgreed Codified Changes:\n${codifiedChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

    managerReviewDecision(
      job.id,
      decisionMode,
      formattedFeedbackNotes,
      decisionMode === 'feedback' ? Number(revisedHours) : undefined,
      {
        bouncedIdeas,
        verbalDiscussionSummary: discussionSummary,
        codifiedChanges,
        additionalHours: decisionMode === 'feedback' ? Number(revisedHours) : undefined,
        outcome: decisionMode === 'approved' ? 'approved_to_client_services' : 'codified_revision_needed'
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="manager-review-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
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
                Internal Review &amp; Creative Alignment
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5 text-text-primary">
              Creative Alignment Session (Lead/Director + IC)
            </h2>
            <p className="text-xs mt-0.5 text-text-tertiary">
              Creative work cannot be expressed through cold text descriptions alone. Hold a sync meeting to bounce ideas and codify changes together.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Alignment Session Participants Banner */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-text-primary flex items-center gap-2">
                  <span>Alignment Sync:</span>
                  <span className="text-emerald-500 font-mono text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Live Session Active
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary mt-0.5">
                  <strong>Reviewer (Lead/Director):</strong> {leadReviewer.name} ({leadReviewer.jobTitle || 'Lead'})
                  <span className="mx-2">•</span>
                  <strong>Creative Staff (IC):</strong> {assignee?.name || 'Assigned Creative'} ({job.assignedSeniority?.toUpperCase() || 'MID'})
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-text-tertiary shrink-0">
              Allocated: <strong className="text-text-primary">{job.estimatedHours}h</strong>
            </div>
          </div>

          {/* Submitted Deliverable Card */}
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">{job.title}</span>
              <span className="text-[10px] font-mono text-text-tertiary">{job.standardTaskType || job.category}</span>
            </div>

            {submission ? (
              <div className="p-3 rounded-lg border border-border/70 bg-surface-elevated text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-text-tertiary">
                  <span>Delivered by: <strong className="text-text-primary">{submission.submitterName}</strong></span>
                  <span>{new Date(submission.submittedDate).toLocaleDateString()}</span>
                </div>
                <p className="text-text-secondary leading-relaxed">{submission.summary}</p>
                {submission.fileLinks && submission.fileLinks.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
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
                    Submitter Note: "{submission.notes}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-text-tertiary">Work completed by creative specialist. Reviewing live in alignment session.</p>
            )}
          </div>

          {/* Section 1: Ideas Bounced in Meeting */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text-secondary flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Ideas Bounced During Alignment Session</span>
              </label>
              <span className="text-[10px] font-mono text-text-tertiary">
                Bounced ideas ({bouncedIdeas.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {bouncedIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
                >
                  <span className="flex items-center gap-2 text-text-primary">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{idea}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBouncedIdea(idx)}
                    className="text-text-tertiary hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newIdeaInput}
                onChange={(e) => setNewIdeaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBouncedIdea();
                  }
                }}
                placeholder="Bounce another idea or observation discussed..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
              />
              <button
                type="button"
                onClick={handleAddBouncedIdea}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Idea
              </button>
            </div>

            {/* Quick Discussion Notes */}
            <div>
              <label className="block text-[11px] font-bold text-text-secondary mb-1">
                Verbal Alignment Discussion Summary
              </label>
              <textarea
                rows={2}
                required
                value={discussionSummary}
                onChange={(e) => setDiscussionSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
                placeholder="Summarize the verbal alignment between lead and IC..."
              />
            </div>
          </div>

          {/* Section 2: Codified Changes in Minds of Lead & IC */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text-secondary flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Codified Changes (Mutually Understood by Director &amp; IC)</span>
              </label>
              <span className="text-[10px] font-mono text-text-tertiary">
                Codified directives ({codifiedChanges.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {codifiedChanges.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
                >
                  <span className="flex items-center gap-2 text-text-primary">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{change}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCodifiedChange(idx)}
                    className="text-text-tertiary hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCodifiedInput}
                onChange={(e) => setNewCodifiedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCodifiedChange();
                  }
                }}
                placeholder="Codify an agreed revision directly into the deliverable spec..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
              />
              <button
                type="button"
                onClick={handleAddCodifiedChange}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Codified Change
              </button>
            </div>
          </div>

          {/* Section 3: Alignment Determination */}
          <div>
            <label className="block text-xs font-semibold mb-2">Alignment Outcome &amp; Determination</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Approve */}
              <button
                type="button"
                onClick={() => setDecisionMode('approved')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'approved'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Align &amp; Approve to Client Services</span>
                </div>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Creative direction is fully satisfied. Work advances to Client Services for work email dispatch to client.
                </p>
              </button>

              {/* Feedback Loop */}
              <button
                type="button"
                onClick={() => setDecisionMode('feedback')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'feedback'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-xs'
                    : 'bg-surface border-border hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Codify Revisions &amp; Iterate (+Hours)</span>
                </div>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Ideas bounced and changes codified. Staff receives additional hours budget to execute revisions.
                </p>
              </button>
            </div>
          </div>

          {/* Feedback & Revised Hours Inputs if Feedback Mode */}
          {decisionMode === 'feedback' && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Allocated Revision Hours for Codified Changes
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  Current Total: {job.estimatedHours}h
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-amber-500">Additional Hours Budget</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={revisedHours}
                      onChange={(e) => setRevisedHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono font-bold outline-hidden focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-text-tertiary">hrs</span>
                  </div>
                </div>
                <div className="flex flex-col justify-end text-[11px] font-mono text-text-tertiary">
                  <div>New Deliverable Total:</div>
                  <strong className="text-sm font-bold text-amber-500">
                    {job.estimatedHours + Number(revisedHours)} hours total
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40 shrink-0">
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
                  <CheckCircle className="w-3.5 h-3.5" /> Approve &amp; Send to Client Services
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" /> Confirm Codified Revisions &amp; Return to IC
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
