import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import { Printer, FileText, CheckCircle2, AlertOctagon, ArrowUpRight, Sparkles } from 'lucide-react';

export const OutputCExecutiveBrief: React.FC = () => {
  const { jobs, users, teams, theme } = useApp();
  const isDark = theme === 'dark';

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const blockedJobs = jobs.filter((j) => j.status === 'blocked');
  const atRiskJobs = jobs.filter((j) => j.isAtRisk);
  const slaAdherence = ((completedJobs / Math.max(1, totalJobs)) * 100).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0 pb-16">
      {/* Action Header - Hidden when printing */}
      <SpotlightCard className="p-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Executive Delivery Briefing</h1>
            <p className="text-xs text-text-secondary">
              Print-ready summary of deliverable velocity, team capacity, and key milestones.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </SpotlightCard>

      {/* Print-Ready Executive Memorandum Document */}
      <div
        className="p-8 md:p-12 rounded-2xl border shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Document Header */}
        <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase" style={{ color: 'var(--color-brand)' }}>
              <span>Tibule Operations</span>
              <span>•</span>
              <span>Weekly Delivery Briefing</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1 text-text-primary">Executive Workload &amp; Delivery Report</h2>
            <div className="text-xs mt-1 text-text-tertiary">
              Prepared for Leadership · Generated {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
            </div>
          </div>

          <div
            className="p-3 rounded-xl border text-right font-mono text-xs"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[10px] text-text-tertiary uppercase">Operational Health</div>
            <div className="text-base font-bold text-emerald-500">Healthy (88%)</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="py-6 border-b space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-brand)' }}>
            <FileText className="w-4 h-4" />
            <span>1. Executive Summary</span>
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            During the current cycle, teams maintained steady velocity with an on-time completion rate of <strong>94.2%</strong>.
            Core teams delivered across <strong>{totalJobs} key deliverables</strong>. Current focus is centered on unblocking external dependencies
            and balancing project loads across senior designers and engineers.
          </p>
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div
              className="p-3.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="text-[10px] uppercase font-semibold text-text-tertiary">Total Deliverables</div>
              <div className="text-lg font-bold font-mono mt-1 text-text-primary">{totalJobs} Tasks</div>
            </div>
            <div
              className="p-3.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="text-[10px] uppercase font-semibold text-text-tertiary">Completed Rate</div>
              <div className="text-lg font-bold font-mono text-emerald-500 mt-1">{slaAdherence}%</div>
            </div>
            <div
              className="p-3.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="text-[10px] uppercase font-semibold text-text-tertiary">Awaiting Input</div>
              <div className="text-lg font-bold font-mono text-amber-500 mt-1">{blockedJobs.length} Tasks</div>
            </div>
          </div>
        </div>

        {/* Section 2: Blockers & Items Awaiting Input */}
        <div className="py-6 border-b space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            <span>2. Items Awaiting Team or Client Feedback</span>
          </h3>
          <div className="space-y-2.5">
            {blockedJobs.length > 0 ? (
              blockedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-500 font-mono">{job.id}: {job.title}</span>
                    <span className="text-[10px] font-mono text-text-tertiary">Project: {job.clientProject}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                    <strong>Current status:</strong> {job.blockerReason || 'Waiting on client review and final asset handoff'}.
                  </p>
                </div>
              ))
            ) : (
              <div
                className="p-4 rounded-xl border text-center text-xs text-emerald-500"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                No items are currently waiting on external input.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Recommended Actions */}
        <div className="pt-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Recommended Next Steps</span>
          </h3>
          <div className="space-y-2">
            <div
              className="p-3.5 rounded-xl border flex items-start gap-3"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div className="text-xs">
                <div className="font-bold text-text-primary">Follow up on pending design signoffs</div>
                <div className="mt-0.5 text-text-secondary">
                  Connect with client leads on Kalahari Solar and Zenith Brand Guidelines to finalize requirements.
                </div>
              </div>
            </div>

            <div
              className="p-3.5 rounded-xl border flex items-start gap-3"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                  color: 'var(--color-brand)'
                }}
              >
                2
              </span>
              <div className="text-xs">
                <div className="font-bold text-text-primary">Rebalance weekly hours for overloaded designers</div>
                <div className="mt-0.5 text-text-secondary">
                  Redistribute upcoming collateral subtasks to balance team member schedules evenly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
