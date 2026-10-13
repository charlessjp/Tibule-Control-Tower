import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  FileCheck,
  Send,
  Layers,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const CSDeliveryWorkbenchView: React.FC = () => {
  const { jobs, currentUser, setSelectedJobId, setActiveView } = useApp();

  // Tasks assigned to current user or Account Executive delivery queue
  const aeJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (j.assigneeId === currentUser.id) return true;
      // Also show account executive deliverables
      return (
        j.teamId === 'team-client-service' &&
        (j.workflowStage === 'debrief_prep' ||
          j.workflowStage === 'in_production' ||
          j.workflowStage === 'internal_review')
      );
    });
  }, [jobs, currentUser]);

  const inProduction = aeJobs.filter((j) => j.workflowStage === 'in_production' && j.status !== 'completed');
  const debriefPrep = aeJobs.filter((j) => j.workflowStage === 'debrief_prep');
  const inReview = aeJobs.filter((j) => j.workflowStage === 'internal_review');
  const completed = aeJobs.filter((j) => j.status === 'completed');

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
          <CheckSquare className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
          <span>Core Client Delivery &amp; Operational Coordination</span>
        </div>
        <h2 className="text-xl font-extrabold text-text-primary">
          Account Executive Delivery Workbench
        </h2>
        <p className="text-xs text-text-secondary max-w-3xl">
          Control Tower tracks actual assignments, deadlines, dependencies, and capacity for Account Executives rather than treating them only as administrative support.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Debrief Material Prep</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">{debriefPrep.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Dockets &amp; intake checklists</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Active Execution Tasks</div>
          <div className="text-2xl font-bold font-mono text-brand mt-1">{inProduction.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Assigned delivery deliverables</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Awaiting Quality Review</div>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">{inReview.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Senior AM review loops</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Completed Deliverables</div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">{completed.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Client signed-off</div>
        </div>
      </div>

      {/* Task Queue Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Active Assigned Delivery Tasks ({aeJobs.length})
          </h3>
          <span className="text-xs font-mono text-text-tertiary">
            Direct tracking of dependencies &amp; hours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {aeJobs.map((job) => {
            const actual = job.actualHours || job.actualEffortHours || 0;
            const estimated = job.estimatedHours || 0;
            const variance = actual - estimated;

            return (
              <SpotlightCard key={job.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-text-tertiary">{job.id}</span>
                    <h4 className="font-bold text-xs text-text-primary line-clamp-1 mt-0.5">{job.title}</h4>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      Client: <strong className="text-text-secondary">{job.clientProject}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-surface-elevated text-text-secondary">
                    {job.workflowStage.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-border/60 text-center font-mono text-[10px]">
                  <div className="p-1 rounded bg-surface">
                    <div className="font-bold text-text-secondary">{estimated}h</div>
                    <div className="text-[9px] text-text-tertiary">Quoted</div>
                  </div>
                  <div className="p-1 rounded bg-surface">
                    <div className="font-bold text-text-primary">{actual}h</div>
                    <div className="text-[9px] text-text-tertiary">Actual</div>
                  </div>
                  <div className="p-1 rounded bg-surface">
                    <div className="font-bold" style={{ color: variance > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {variance >= 0 ? `+${variance}h` : `${variance}h`}
                    </div>
                    <div className="text-[9px] text-text-tertiary">Variance</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-[10px] font-mono text-text-tertiary">
                    Due: <strong>{job.dueDate}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedJobId(job.id)}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:bg-surface text-text-primary cursor-pointer"
                  >
                    Open Task
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
