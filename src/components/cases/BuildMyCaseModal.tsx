import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseType } from '../../types';
import {
  X,
  FileCheck,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface BuildMyCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildMyCaseModal: React.FC<BuildMyCaseModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createCase, jobs, theme } = useApp();
  const isDark = theme === 'dark';

  const [caseType, setCaseType] = useState<CaseType>('role_review');
  const [title, setTitle] = useState('Role Review & Progression to Lead / Compensation Review');
  const [narrative, setNarrative] = useState(
    'Over the last 9 months, my contributions have expanded significantly from individual delivery to governing our core design tokens, coordinating cross-team handoffs with Client Service, and mentoring team members.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCase({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeTitle: currentUser.jobTitle,
      teamId: currentUser.teamId,
      type: caseType,
      status: 'submitted',
      reviewerId: currentUser.managerId,
      reviewerName: 'Manager Review Board',
      title,
      narrative,
      evidenceData: {
        responsibilityGrowth: {
          originalCount: 4,
          currentCount: 8,
          items: [
            'Design Token & Typography System Architecture',
            'Cross-Team Coordination with Client Service',
            'Junior Designer Mentorship and Peer Review',
            'Client Executive Stakeholder Presentations'
          ]
        },
        workVolume: {
          previousPeriodCount: 22,
          currentPeriodCount: 38,
          totalHours: 460
        },
        complexityIncreasePercent: 34,
        additionalContributions: [
          'Saved 34% frontend rework via tokenized design system',
          'Supported emergency recovery for high-priority sprints',
          'Conducted cross-team alignment workshops'
        ],
        outcomes: [
          '96.8% on-time delivery across complex deliverables',
          'Zero trademark defects on international campaigns',
          'Consistently rated exceptional in peer and lead commendations'
        ],
        linkedJobIds: ['CT-1842', 'CT-1848', 'CT-1855', 'CT-1857']
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="build-my-case-modal"
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Evidence-Backed Career Progression
              </div>
              <h2 className="text-base font-bold text-text-primary">
                Build My Case • Progression &amp; Role Review
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Case Type Selector */}
          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              Review Objective / Case Category
            </label>
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as CaseType)}
              className="w-full p-2.5 rounded-xl border font-medium focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="role_review">Role Review &amp; Responsibility Expansion</option>
              <option value="salary_review">Compensation / Salary Calibration</option>
              <option value="promotion">Formal Promotion Nomination</option>
              <option value="workload_concern">Workload Balancing &amp; Capacity Correction</option>
              <option value="resource_request">Dedicated Team Resource Request</option>
              <option value="process_improvement">Organisational Process Innovation</option>
            </select>
          </div>

          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              Case Subject &amp; Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border font-semibold text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {/* System-Generated Evidence Summary (Section 28) */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-text-secondary">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                Verified Longitudinal Metrics (Auto-Compiled from Audit Logs)
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">100% Traceable</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-brand)' }}>4 → 8</div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">Responsibility Scope</div>
              </div>
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono text-purple-400">+34%</div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">Complexity Shift</div>
              </div>
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono text-emerald-400">96.8%</div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">Delivery Reliability</div>
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t text-text-secondary" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-semibold text-[11px] text-text-primary">
                Key Demonstrated Outcomes:
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Instituted reusable design token specification across Tibule web &amp; mobile</li>
                <li>Zero design defects on Zenith Global international relaunch</li>
                <li>38 completed high-impact assignments in current performance review cycle</li>
              </ul>
            </div>
          </div>

          {/* Employee Narrative */}
          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              Employee Context &amp; Personal Statement
            </label>
            <textarea
              rows={4}
              required
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describe how your day-to-day responsibilities, accountability, and leadership have evolved..."
              className="w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div
            className="p-3 rounded-xl text-[11px] flex items-center gap-2 border text-text-secondary"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
            <span>
              Your case will enter formal governance: <strong>Submitted → Manager Review → Evidence Verification → Leadership Decision</strong>.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              Submit Evidence Case
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
