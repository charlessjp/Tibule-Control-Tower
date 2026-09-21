import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Radio
} from 'lucide-react';

interface OperationalPulseRibbonProps {
  contextTitle?: string;
  scopeSubtitle?: string;
}

export const OperationalPulseRibbon: React.FC<OperationalPulseRibbonProps> = ({
  contextTitle = 'Systemic Operational Pulse',
  scopeSubtitle = 'Real-time throughput metrics across Tibule teams'
}) => {
  const { setMetricTraceModal } = useApp();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Subtle Top Ambient Theme Line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
        style={{ backgroundColor: 'var(--color-brand)' }}
      />

      {/* Header metrics tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-text-primary">{contextTitle}</span>
          <span>•</span>
          <span>{scopeSubtitle}</span>
        </div>

        <div className="text-[11px] font-mono text-text-tertiary">
          Cadence: <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>Live Metrics</span> (Audit Verified)
        </div>
      </div>

      {/* The Throughput Stream: Continuous Spatial Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Stage 1: Intake Horizon */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Intake Velocity & Allocation Integrity',
              value: '98.6% Allocated',
              summary: 'Jobs entering Tibule workflow that have assigned owners and bounded effort envelopes.',
              methodology: 'Total created jobs against active assignments. Zero jobs remain orphaned beyond 4 hours.',
              datapoints: [
                { label: 'Total Ingested Jobs', count: 248, description: 'Client & internal deliverables' },
                { label: 'Directly Allocated', count: 242, description: 'Matched with team capability' },
                { label: 'Awaiting Triage', count: 6, description: 'In manager staging queue' }
              ]
            });
          }}
          className="pr-4 py-2 cursor-pointer group hover:bg-surface-elevated/40 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Stage 01: Intake Rate</span>
            <span
              className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
              style={{ color: 'var(--color-brand)' }}
            >
              trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              248
            </span>
            <span className="text-xs text-text-secondary font-mono">work units</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-500">● 98.6% assigned</span>
            <span className="text-text-tertiary font-normal">· &lt;4h triage SLA</span>
          </div>
        </div>

        {/* Stage 2: Execution Runway & Saturation */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Workforce Runway Saturation',
              value: '74% Optimal',
              summary: 'Ratio of committed deliverable hours to baseline contracted sprint capacity.',
              methodology: 'Measured continuously. Teams operating between 65% and 82% provide sufficient creative cushion.',
              datapoints: [
                { label: 'Committed Deliverable Effort', count: '1,420 hrs', description: 'Assigned active job backlog' },
                { label: 'Total Team Capacity Threshold', count: '1,918 hrs', description: 'Across active operational teams' },
                { label: 'Buffer Reserve Cushion', count: '498 hrs (26%)', description: 'Prevents burnout and absorbs spikes' }
              ]
            });
          }}
          className="px-0 md:px-4 py-2 cursor-pointer group hover:bg-surface-elevated/40 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Stage 02: Active Runway</span>
            <span
              className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
              style={{ color: 'var(--color-brand)' }}
            >
              trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: 'var(--color-brand)' }}
            >
              74%
            </span>
            <span className="text-xs text-text-secondary font-mono">saturation</span>
          </div>
          {/* Subtle horizontal micro-bar */}
          <div
            className="w-full h-1.5 rounded-full mt-2 overflow-hidden border"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: '74%', backgroundColor: 'var(--color-brand)' }}
            />
          </div>
          <div className="text-[10px] text-text-tertiary mt-1 font-mono">
            26% reserve cushion available
          </div>
        </div>

        {/* Stage 3: Dependency Friction & Buffer Gate */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Inter-Team Dependency Friction',
              value: '19 Blocked Items',
              summary: 'Deliverables awaiting third-party signoff, client assets, or legal clearance.',
              methodology: 'The system protects worker performance by pausing SLA clock during external blocks.',
              datapoints: [
                { label: 'Client Asset Deliverables', count: 9, description: 'Logos, guidelines, brand fonts' },
                { label: 'Legal / Trademark Clearances', count: 6, description: 'Third-party copyright validation' },
                { label: 'Technical API Integration', count: 4, description: 'Awaiting client backend access' }
              ]
            });
          }}
          className="px-0 md:px-4 py-2 cursor-pointer group hover:bg-surface-elevated/40 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Stage 03: External Friction</span>
            <span
              className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
              style={{ color: 'var(--color-brand)' }}
            >
              trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              19
            </span>
            <span className="text-xs text-text-secondary font-mono">held in buffer</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1 flex items-center gap-1 font-medium">
            <span>🛡️ SLA clock paused</span>
            <span className="text-text-tertiary font-normal">· worker protected</span>
          </div>
        </div>

        {/* Stage 4: Verified Delivery Integrity */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Delivery Integrity & Non-Surveillance Assurance',
              value: '91.2% On-Time',
              summary: 'Objective completion without rework, measured strictly by deliverable handoffs.',
              methodology: 'No surveillance or keystroke tracking is used. Measured strictly by verified state transitions.',
              datapoints: [
                { label: 'Completed Within Sprint Window', count: '1,102 deliverables', description: 'Empirically verified' },
                { label: 'Authorized Schedule Extensions', count: '82 deliverables', description: 'Agreed scope change' },
                { label: 'Quality Disputes / Defect Rate', count: '0.4% total', description: 'Industry benchmark: 3.8%' }
              ]
            });
          }}
          className="pl-0 md:pl-4 py-2 cursor-pointer group hover:bg-surface-elevated/40 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Stage 04: Delivery Integrity</span>
            <span
              className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
              style={{ color: 'var(--color-brand)' }}
            >
              audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              91.2%
            </span>
            <span className="text-xs text-text-secondary font-mono">verified</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Zero surveillance tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
