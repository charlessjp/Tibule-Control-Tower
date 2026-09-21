import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import { Layers, TrendingUp, AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const OutputBSummaryMatrix: React.FC = () => {
  const { jobs, theme } = useApp();
  const isDark = theme === 'dark';

  // Group jobs by category
  const categories = Array.from(new Set(jobs.map((j) => j.category)));

  const matrixData = categories.map((cat) => {
    const catJobs = jobs.filter((j) => j.category === cat);
    const plannedHours = catJobs.reduce((acc, j) => acc + j.estimatedHours, 0);
    const actualHours = catJobs.reduce((acc, j) => acc + j.actualHours, 0);
    const blockedCount = catJobs.filter((j) => j.status === 'blocked').length;
    const atRiskCount = catJobs.filter((j) => j.isAtRisk).length;
    const completedCount = catJobs.filter((j) => j.status === 'completed').length;
    const activeCount = catJobs.length - completedCount;

    const divergenceRatio = plannedHours > 0 ? actualHours / plannedHours : 1;
    const isHighDivergence = divergenceRatio > 1.15;
    const healthScore = Math.max(
      50,
      Math.min(100, Math.round(100 - (blockedCount * 15 + atRiskCount * 10)))
    );

    return {
      category: cat,
      totalJobs: catJobs.length,
      activeCount,
      plannedHours,
      actualHours,
      variance: actualHours - plannedHours,
      divergenceRatio: (divergenceRatio * 100).toFixed(1),
      blockedCount,
      atRiskCount,
      completedCount,
      healthScore,
      isHighDivergence
    };
  });

  const totalPlanned = matrixData.reduce((acc, m) => acc + m.plannedHours, 0);
  const totalActual = matrixData.reduce((acc, m) => acc + m.actualHours, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Workload &amp; Capacity Overview
          </h1>
          <p className="text-xs mt-1 text-text-secondary">
            Workload distribution, scheduled vs. logged hours, and health across work streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span className="text-text-secondary">
              Total Logged: <strong className="font-mono text-text-primary">{totalActual}h</strong> / {totalPlanned}h
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <span className="text-xs font-semibold text-text-secondary">
            Work Streams
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
              {categories.length}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Covering {jobs.length} deliverables
          </span>
        </div>

        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <span className="text-xs font-semibold text-text-secondary">
            Estimated Hours
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {totalPlanned}h
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Total baseline allocation
          </span>
        </div>

        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <span className="text-xs font-semibold text-text-secondary">
            Logged Hours
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {totalActual}h
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Variance: {totalActual - totalPlanned > 0 ? `+${totalActual - totalPlanned}` : totalActual - totalPlanned}h
          </span>
        </div>

        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <span className="text-xs font-semibold text-text-secondary">
            Need Feedback / Blocked
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {jobs.filter((j) => j.status === 'blocked').length}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Waiting on team input
          </span>
        </div>
      </div>

      {/* Categories Cards Grid using SpotlightCard */}
      <div className="space-y-3.5">
        <h2 className="text-sm font-bold text-text-primary">
          Work Stream Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matrixData.map((cat) => (
            <SpotlightCard key={cat.category} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-text-primary">
                    {cat.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      cat.healthScore >= 90
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {cat.healthScore}% Healthy
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs mt-2 text-text-tertiary">
                  <span>{cat.totalJobs} tasks total</span>
                  <span>•</span>
                  <span>{cat.completedCount} completed</span>
                  {cat.blockedCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-500 font-medium">
                        {cat.blockedCount} waiting
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Hours Progress */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">
                    <strong className="text-text-primary">{cat.actualHours}h</strong> logged / {cat.plannedHours}h planned
                  </span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {cat.divergenceRatio}%
                  </span>
                </div>

                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.isHighDivergence ? 'bg-amber-500' : ''
                    }`}
                    style={{
                      backgroundColor: cat.isHighDivergence ? undefined : 'var(--color-brand)',
                      width: `${Math.min(
                        cat.plannedHours > 0 ? (cat.actualHours / cat.plannedHours) * 100 : 0,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
};
