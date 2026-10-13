import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileDown
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { teams, setMetricTraceModal, openReportModal } = useApp();

  const [dateRange, setDateRange] = useState('q3_2026');

  return (
    <div id="analytics-assurance-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-brand-primary" />
            Performance &amp; Delivery Analytics
          </div>
          <h1 className="text-xl font-bold text-text-primary mt-0.5">
            Delivery Health &amp; SLA Metrics
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track on-time SLA delivery rates, blocker turnaround times, and team capacity health across performance cycles.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => openReportModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Generate PDF Dossier</span>
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 rounded-lg bg-surface-elevated border border-border text-text-primary font-mono text-[11px]"
          >
            <option value="q3_2026">Q3 2026 (Current Performance Cycle)</option>
            <option value="q2_2026">Q2 2026 (Prior Performance Cycle)</option>
            <option value="ytd_2026">2026 Year-to-Date</option>
          </select>
        </div>
      </div>

      {/* 4 Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Enterprise On-Time SLA Delivery',
              value: '94.2%',
              summary: 'Deliverables completed prior to agreed SLA milestone deadline.',
              methodology: 'Excludes delays caused by validated external client blockers.',
              datapoints: [
                { label: 'Standard Deliveries on Schedule', count: 1240, description: 'No schedule variance' },
                { label: 'Authorized Extension', count: 48, description: 'Client confirmed scope change' },
                { label: 'Unmitigated Overdue', count: 12, description: 'Subject to internal retrospective' }
              ]
            });
          }}
          className="p-4 rounded-xl bg-surface border border-border hover:border-brand-primary/40 cursor-pointer transition-colors"
        >
          <div className="text-text-tertiary uppercase text-[10px] font-bold">
            On-Time SLA Delivery
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            94.2%
          </div>
          <div className="text-text-tertiary text-[11px] mt-0.5 flex items-center justify-between">
            <span>+2.4% vs last cycle</span>
            <span className="text-brand-primary font-sans text-[10px]">inspect</span>
          </div>
        </div>

        <div
          onClick={() => {
            setMetricTraceModal({
              name: 'Mean Time to Resolution (MTTR)',
              value: '18.4 hrs',
              summary: 'Average time taken to resolve an active dependency blocker.',
              methodology: 'Measured from blocker flag creation to manager or external resolution.',
              datapoints: [
                { label: 'Legal & Procurement Clearances', count: '24.2h avg', description: 'Cross-functional contracts' },
                { label: 'Client Asset Deliverables', count: '14.8h avg', description: 'Logos, guidelines, brand fonts' },
                { label: 'Internal Creative Review', count: '9.2h avg', description: 'Lead art direction signoff' }
              ]
            });
          }}
          className="p-4 rounded-xl bg-surface border border-border hover:border-brand-primary/40 cursor-pointer transition-colors"
        >
          <div className="text-text-tertiary uppercase text-[10px] font-bold">
            Mean Blocker Resolution
          </div>
          <div className="text-2xl font-bold font-mono text-brand-primary mt-1">
            18.4 hrs
          </div>
          <div className="text-text-tertiary text-[11px] mt-0.5 flex items-center justify-between">
            <span>-5.1h improvement</span>
            <span className="text-brand-primary font-sans text-[10px]">inspect</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-text-tertiary uppercase text-[10px] font-bold">
            Workload Balance Score
          </div>
          <div className="text-2xl font-bold font-mono text-purple-500 mt-1">
            87 / 100
          </div>
          <div className="text-text-tertiary text-[11px] mt-0.5">Low variance across teams</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-text-tertiary uppercase text-[10px] font-bold">
            Formal Case Resolution Rate
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">
            96.1%
          </div>
          <div className="text-text-tertiary text-[11px] mt-0.5">Appeals resolved within 14 days</div>
        </div>
      </div>

      {/* Team Comparison Breakdown */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            Cross-Departmental Delivery Comparison
          </h2>
          <span className="text-xs text-text-tertiary font-mono">Quarterly audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-500">92%+ Reliability</span>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Capacity Saturation:</span>
                  <span className="font-mono font-bold text-text-primary">
                    {t.id === 'team-creative' ? '74%' : t.id === 'team-client-service' ? '91%' : '64%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mean Job Duration:</span>
                  <span className="font-mono text-text-primary">
                    {t.id === 'team-creative' ? '16.2 hrs' : '8.4 hrs'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reassignment Index:</span>
                  <span className="font-mono text-text-primary">2.1% (Healthy)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
