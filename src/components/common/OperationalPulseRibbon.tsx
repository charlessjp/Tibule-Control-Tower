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
  const { setMetricTraceModal, jobs, users, employeeCapacities } = useApp();

  // 1. Intake Rate: Real deliverable allocation tracking
  const totalJobsCount = jobs.length || 1;
  const assignedJobsCount = jobs.filter(j => j.status !== 'unassigned' && !!j.assigneeId).length;
  const triageQueueCount = jobs.filter(j => j.status === 'unassigned' || !j.assigneeId).length;
  const allocationRatePercent = Math.round((assignedJobsCount / totalJobsCount) * 100);

  // 2. Active Runway: Real committed hours against baseline contracted capacity
  const committedEffortHours: number = (
    Object.values(employeeCapacities) as Array<{ assignedHours?: number } | undefined>
  ).reduce((acc: number, c) => acc + (c?.assignedHours || 0), 0);
  const totalCapacityThreshold: number = users.reduce(
    (acc: number, u) => acc + (u.capacityHoursPerWeek || 38),
    0
  );
  const runwaySaturationPercent = Math.min(
    100,
    Math.round((committedEffortHours / (totalCapacityThreshold || 1)) * 100)
  );
  const reserveCushionPercent = Math.max(0, 100 - runwaySaturationPercent);
  const reserveCushionHours = Math.max(0, totalCapacityThreshold - committedEffortHours);

  // 3. Dependency Friction: Actual blocked deliverables in workflow
  const blockedJobs = jobs.filter(j => j.status === 'blocked' || !!j.blockedSince);
  const blockedCount = blockedJobs.length;

  // 4. Delivery Integrity: Actual milestone SLA fulfillment
  const onScheduleJobs = jobs.filter(
    j => !j.isAtRisk && (j.status === 'completed' || new Date(j.dueDate).getTime() >= Date.now())
  );
  const deliveryIntegrityPercent = Math.round((onScheduleJobs.length / totalJobsCount) * 100);
  const completedJobsCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <div
      className="rounded-2xl p-5 border transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Header metrics tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-text-primary">{contextTitle}</span>
          <span>·</span>
          <span>{scopeSubtitle}</span>
        </div>

        <div className="text-[11px] font-mono text-text-tertiary">
          Cadence: <span className="font-medium text-text-secondary">Live Metrics</span>
        </div>
      </div>

      {/* The Throughput Stream: Continuous Spatial Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Stage 1: Intake Horizon */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Intake Velocity & Allocation Integrity',
              value: `${allocationRatePercent}% Allocated`,
              summary: 'Jobs entering Tibule workflow that have assigned owners and bounded effort envelopes.',
              methodology: 'Total created jobs against active assignments. Extracted from live deliverable status logs.',
              datapoints: [
                { label: 'Total Ingested Jobs', count: totalJobsCount, description: 'Client & internal deliverables' },
                { label: 'Directly Allocated', count: assignedJobsCount, description: 'Assigned to qualified creative staff' },
                { label: 'Awaiting Triage', count: triageQueueCount, description: 'In Traffic intake queue' }
              ]
            });
          }}
          className="pr-4 py-2 cursor-pointer group hover:bg-surface-elevated/60 rounded-xl p-2.5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="text-[11px] font-semibold text-text-secondary">Intake Rate</span>
            <span
              className="text-[11px] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-brand"
            >
              Trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              {totalJobsCount}
            </span>
            <span className="text-xs text-text-secondary font-mono">deliverables</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
            <span className="text-emerald-500 font-medium">● {allocationRatePercent}% assigned</span>
            <span className="text-text-tertiary">· {triageQueueCount} queued</span>
          </div>
        </div>

        {/* Stage 2: Execution Runway & Saturation */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Workforce Runway Saturation',
              value: `${runwaySaturationPercent}% Optimal`,
              summary: 'Ratio of committed deliverable hours to baseline contracted studio capacity.',
              methodology: 'Computed by summing active assigned hours across all staff against contracted capacity.',
              datapoints: [
                { label: 'Committed Deliverable Effort', count: `${committedEffortHours} hrs`, description: 'Assigned active job backlog' },
                { label: 'Total Team Capacity Threshold', count: `${totalCapacityThreshold} hrs`, description: 'Across all active team members' },
                { label: 'Buffer Reserve Cushion', count: `${reserveCushionHours} hrs (${reserveCushionPercent}%)`, description: 'Absorbs rush revisions and scope spikes' }
              ]
            });
          }}
          className="px-0 md:px-4 py-2 cursor-pointer group hover:bg-surface-elevated/60 rounded-xl p-2.5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="text-[11px] font-semibold text-text-secondary">Active Runway</span>
            <span
              className="text-[11px] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-brand"
            >
              Trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span
              className="text-2xl font-bold font-mono tracking-tight text-brand"
            >
              {runwaySaturationPercent}%
            </span>
            <span className="text-xs text-text-secondary font-mono">saturation</span>
          </div>
          {/* Subtle horizontal micro-bar */}
          <div
            className="w-full h-1.5 rounded-full mt-2 overflow-hidden bg-surface-elevated border border-border"
          >
            <div
              className="h-full rounded-full transition-all duration-300 bg-brand"
              style={{ width: `${runwaySaturationPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-text-tertiary mt-1.5 font-mono">
            {reserveCushionPercent}% cushion ({reserveCushionHours}h)
          </div>
        </div>

        {/* Stage 3: Dependency Friction & Buffer Gate */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Inter-Team Dependency Friction',
              value: `${blockedCount} Blocked Items`,
              summary: 'Deliverables awaiting third-party signoff, client assets, or legal clearance.',
              methodology: 'The system protects worker performance by pausing SLA clock during external blocks.',
              datapoints: [
                { label: 'Active Blocked Deliverables', count: blockedCount, description: 'Marked blocked awaiting dependencies' },
                { label: 'Clear Flow Rate', count: `${Math.round(((totalJobsCount - blockedCount) / totalJobsCount) * 100)}%`, description: 'Deliverables progressing without impediment' }
              ]
            });
          }}
          className="px-0 md:px-4 py-2 cursor-pointer group hover:bg-surface-elevated/60 rounded-xl p-2.5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="text-[11px] font-semibold text-text-secondary">External Friction</span>
            <span
              className="text-[11px] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-brand"
            >
              Trace <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              {blockedCount}
            </span>
            <span className="text-xs text-text-secondary font-mono">held in buffer</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1 font-medium">
            <span>SLA clock paused</span>
            <span className="text-text-tertiary font-normal">· protected</span>
          </div>
        </div>

        {/* Stage 4: Verified Delivery Integrity */}
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Delivery Integrity & Non-Surveillance Assurance',
              value: `${deliveryIntegrityPercent}% On-Time`,
              summary: 'Objective completion without rework, measured strictly by deliverable handoffs.',
              methodology: 'Calculated directly from deliverable milestone deadlines and completed signoff logs.',
              datapoints: [
                { label: 'On-Schedule Deliverables', count: `${onScheduleJobs.length} deliverables`, description: 'Tracking within deadline' },
                { label: 'Completed Deliverables', count: `${completedJobsCount} deliverables`, description: 'Fully delivered and signed off' },
                { label: 'SLA Adherence Index', count: `${deliveryIntegrityPercent}%`, description: 'On-time milestone yield' }
              ]
            });
          }}
          className="pl-0 md:pl-4 py-2 cursor-pointer group hover:bg-surface-elevated/60 rounded-xl p-2.5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
            <span className="text-[11px] font-semibold text-text-secondary">Delivery Integrity</span>
            <span
              className="text-[11px] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-brand"
            >
              Audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-text-primary">
              {deliveryIntegrityPercent}%
            </span>
            <span className="text-xs text-text-secondary font-mono">on-schedule</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Milestone verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
