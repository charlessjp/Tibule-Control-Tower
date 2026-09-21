import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { X, Send, Link } from 'lucide-react';

interface DeliverableSubmissionModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverableSubmissionModal: React.FC<DeliverableSubmissionModalProps> = ({ job, isOpen, onClose }) => {
  const { staffSubmitDeliverable, currentUser } = useApp();

  const [summary, setSummary] = useState(
    'Deliverable execution completed per standard creative specifications. Master assets and responsive package rendered.'
  );
  const [fileLink, setFileLink] = useState('https://agency-tibule.storage/deliverables/master_export_v1.zip');
  const [notes, setNotes] = useState(
    'Ready for manager review. Checked contrast ratios, typography rules, and asset export guidelines.'
  );

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    staffSubmitDeliverable(
      job.id,
      summary,
      fileLink ? [fileLink] : [],
      notes
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
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
                Deliverable Completion
              </span>
              <h2 className="text-base font-bold text-text-primary">Submit Work for Manager Review</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Submitting deliverable [{job.id}] for Creative Director / Manager sign-off.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Deliverable Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold" style={{ color: 'var(--color-brand)' }}>{job.id} • {job.standardTaskType || job.category}</span>
              <span className="text-[11px] font-mono text-text-tertiary">Allocated: {job.estimatedHours}h</span>
            </div>
            <h3 className="font-bold text-sm leading-tight text-text-primary">{job.title}</h3>
            <div className="flex items-center gap-3 text-xs font-mono text-text-tertiary">
              <span>Submitter: <strong className="text-text-primary">{currentUser.name}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                Seniority: <SeniorityBadge seniority={currentUser.seniority || 'mid'} size="xs" />
              </span>
            </div>
          </div>

          {/* Submission Summary */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-text-secondary">Deliverable Completion Summary</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
            />
          </div>

          {/* Asset & Preview Link */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1 text-text-secondary">
              <Link className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> Master Deliverable Asset Link / Figma / Drive
            </label>
            <input
              type="text"
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
            />
          </div>

          {/* Hand-off Notes to Manager */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-text-secondary">Notes for Reviewing Manager</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
            />
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Send className="w-3.5 h-3.5" /> Submit to Manager for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
