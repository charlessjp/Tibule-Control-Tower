import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CSDiscrepancyAlert, DiscrepancyStatus } from '../../types';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  UserCheck,
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface CSDiscrepancyReconcileModalProps {
  alert: CSDiscrepancyAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CSDiscrepancyReconcileModal: React.FC<CSDiscrepancyReconcileModalProps> = ({
  alert,
  isOpen,
  onClose
}) => {
  const { reconcileDiscrepancy, currentUser } = useApp();

  const [status, setStatus] = useState<DiscrepancyStatus>(alert?.status || 'reconciled');
  const [auditNotes, setAuditNotes] = useState<string>(alert?.auditNotes || '');

  if (!isOpen || !alert) return null;

  const quickResolutions = [
    'Approved overtime for urgent client campaign pitch delivery.',
    'Brief scope revision requested to client; extra hours billable.',
    'Cross-discipline support sanctioned by Director David Vance.',
    'Variance investigated; workload redistributed to prevent further overburn.',
    'Practitioner hours log verified and confirmed compliant.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reconcileDiscrepancy(alert.id, auditNotes || 'Audited and cleared by management', status);
    onClose();
  };

  const severityColor =
    alert.severity === 'high'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : alert.severity === 'medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-text-primary">
            <ShieldAlert className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
            <span>Management Discrepancy Audit</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary cursor-pointer p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Summary Box */}
        <div className="bg-surface-elevated border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${severityColor}`}>
              {alert.severity} severity
            </span>
            <span className="text-[11px] font-mono text-text-tertiary">
              Trigger: {alert.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <h3 className="text-sm font-bold text-text-primary">
            {alert.title}
          </h3>

          <p className="text-xs text-text-secondary leading-relaxed">
            {alert.description}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center font-mono text-xs">
            <div className="bg-surface p-2 rounded-lg border border-border">
              <span className="text-[10px] text-text-tertiary block">Planned</span>
              <span className="font-bold text-text-primary">{alert.plannedHours}h</span>
            </div>
            <div className="bg-surface p-2 rounded-lg border border-border">
              <span className="text-[10px] text-text-tertiary block">Actual</span>
              <span className="font-bold text-text-primary">{alert.actualHours}h</span>
            </div>
            <div className="bg-surface p-2 rounded-lg border border-border">
              <span className="text-[10px] text-text-tertiary block">Variance</span>
              <span className={`font-bold ${alert.varianceHours > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {alert.varianceHours > 0 ? `+${alert.varianceHours}h` : `${alert.varianceHours}h`} ({alert.variancePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Audit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Audit Resolution Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('flagged')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  status === 'flagged'
                    ? 'bg-red-500/10 text-red-400 border-red-500/40 ring-1 ring-red-500/30'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Flagged
              </button>
              <button
                type="button"
                onClick={() => setStatus('under_review')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  status === 'under_review'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Under Review
              </button>
              <button
                type="button"
                onClick={() => setStatus('reconciled')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  status === 'reconciled'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                Reconciled
              </button>
            </div>
          </div>

          {/* Quick preset notes */}
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1.5">
              Preset Manager Audit Justifications
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {quickResolutions.map((note, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAuditNotes(note)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-surface border border-border/80 hover:border-brand/40 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Audit &amp; Reconciliation Notes
            </label>
            <textarea
              rows={3}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="Record operational reconciliation justification, brief amendments, or action items..."
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand resize-none"
              required
            />
          </div>

          {alert.reconciledBy && (
            <div className="text-[11px] font-mono text-text-tertiary flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Previously audited by {alert.reconciledByName || alert.reconciledBy}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Save Audit Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
