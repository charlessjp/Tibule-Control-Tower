import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CorrectionAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CorrectionAppealModal: React.FC<CorrectionAppealModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createCase, jobs, theme } = useApp();
  const isDark = theme === 'dark';

  const [reasonCategory, setReasonCategory] = useState('Incorrect effort estimate');
  const [targetJobId, setTargetJobId] = useState(jobs[0]?.id || '');
  const [explanation, setExplanation] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    createCase({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeTitle: currentUser.jobTitle,
      teamId: currentUser.teamId,
      type: 'correction',
      status: 'submitted',
      reviewerId: currentUser.managerId,
      reviewerName: 'Lead Reviewer',
      title: `Appeal / Record Correction: ${reasonCategory} (${targetJobId || 'General Workload'})`,
      narrative: `Context submitted by ${currentUser.name}: ${explanation}`,
      evidenceData: {
        responsibilityGrowth: { originalCount: 0, currentCount: 0, items: [] },
        workVolume: { previousPeriodCount: 0, currentPeriodCount: 0, totalHours: 0 },
        complexityIncreasePercent: 0,
        additionalContributions: [`Disputed work attribution for ${targetJobId}`],
        outcomes: ['Awaiting manager factual audit'],
        linkedJobIds: targetJobId ? [targetJobId] : []
      }
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="appeal-correction-modal"
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Organisational Trust &amp; Transparency
              </div>
              <h2 className="text-base font-bold text-text-primary">
                Something Doesn&apos;t Look Right?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <div className="text-base font-bold text-text-primary">Correction Submitted</div>
            <p className="text-xs text-text-secondary">
              Your context has been logged to the audit queue for manager verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <p className="leading-relaxed text-text-secondary">
              At Tibule, work metrics must reflect ground truth. If an assignment effort was misjudged, external dependencies caused delays, or off-system contributions weren&apos;t captured, submit context below for formal review.
            </p>

            <div>
              <label className="block uppercase font-bold mb-1 text-text-secondary">
                Reason for Appeal / Correction (Section 30)
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border font-medium focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="Incorrect effort estimate">Incorrect effort estimate</option>
                <option value="Incorrect assignment attribution">Incorrect assignment attribution</option>
                <option value="External dependency caused delay">External dependency caused delay</option>
                <option value="Critical work not recorded in queue">Critical work not recorded in queue</option>
                <option value="Quality outcome disputed">Quality outcome disputed</option>
                <option value="Work completed outside normal workflow">Work completed outside normal workflow</option>
                <option value="Other factual discrepancy">Other factual discrepancy</option>
              </select>
            </div>

            <div>
              <label className="block uppercase font-bold mb-1 text-text-secondary">
                Related Job / Deliverable ID (Optional)
              </label>
              <input
                type="text"
                value={targetJobId}
                onChange={(e) => setTargetJobId(e.target.value)}
                placeholder="e.g. CT-1845"
                className="w-full p-2 rounded-xl border font-mono focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block uppercase font-bold mb-1 text-text-secondary">
                Detailed Context &amp; Ground Truth Evidence
              </label>
              <textarea
                required
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain what occurred, why the system record deviates from reality, and what correction is requested..."
                className="w-full p-2.5 rounded-xl border focus:outline-none leading-relaxed"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                Submit for Manager Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
