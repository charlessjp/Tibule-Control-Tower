import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, AlertTriangle, Clock, HelpCircle, ArrowRight } from 'lucide-react';

export const ExplainableMetricModal: React.FC = () => {
  const { metricTraceModal, setMetricTraceModal, setSelectedJobId, theme } = useApp();
  const isDark = theme === 'dark';

  if (!metricTraceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="explainable-metric-modal"
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all bg-surface border-border text-text-primary"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                color: 'var(--color-brand)'
              }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
                Traceable Metric Audit
              </div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-text-primary">
                {metricTraceModal.name}:{' '}
                <span style={{ color: 'var(--color-brand)' }}>{metricTraceModal.value}</span>
              </h3>
            </div>
          </div>
          <button
            id="close-metric-modal-btn"
            onClick={() => setMetricTraceModal(null)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-text-secondary">
              Methodology &amp; Foundation
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              {metricTraceModal.methodology}
            </p>
          </div>

          {/* Trace Breakdown */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
              Evidence Breakdown &amp; Source Records
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {metricTraceModal.datapoints.map((dp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{dp.label}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{dp.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-sm font-bold border border-border bg-surface text-text-primary">
                      {dp.count}
                    </span>
                    {dp.detailJobs && dp.detailJobs.length > 0 && (
                      <div className="flex gap-1">
                        {dp.detailJobs.map((jobId) => (
                          <button
                            key={jobId}
                            onClick={() => {
                              setSelectedJobId(jobId);
                              setMetricTraceModal(null);
                            }}
                            className="text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                              color: 'var(--color-brand)'
                            }}
                          >
                            {jobId}
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Guarantee Note */}
          <div className="text-xs flex items-start gap-2 pt-2 border-t border-border text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Tibule Evidence Guarantee: This metric is calculated dynamically from recorded task completion events and verified milestones. It contains zero simulated heuristics or unexplainable scores.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-surface-elevated flex justify-end">
          <button
            onClick={() => setMetricTraceModal(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-border bg-surface text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
