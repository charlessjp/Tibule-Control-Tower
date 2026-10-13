import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, StandardTaskType, SeniorityLevel } from '../../types';
import { STANDARD_TASK_DEFINITIONS, SENIORITY_LABELS } from '../../data/standardTasks';
import { calculateTrafficWorkload } from '../../utils/trafficEngine';
import { TrafficDispatchModal } from './TrafficDispatchModal';
import { SeniorityAssignmentModal } from './SeniorityAssignmentModal';
import { RevertConflictResolutionModal } from './RevertConflictResolutionModal';
import { DebriefPreparationModal } from './DebriefPreparationModal';
import { DebriefMeetingModal } from './DebriefMeetingModal';
import { SpotlightCard } from '../common/SpotlightCard';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';
import {
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod
} from '../../utils/calendarPeriodFilter';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { WorkflowStatusBadge } from '../common/WorkflowStatusBadge';
import { formatSeniority } from '../../utils/formatters';
import { getActiveOperationalLoadColors } from '../../utils/chartColorUtils';
import {
  Send,
  ArrowRight,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  FolderGit2,
  Users,
  Briefcase,
  AlertCircle,
  Activity,
  Workflow,
  Gauge,
  Zap,
  Target,
  Scale,
  ShieldCheck,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  FolderArchive,
  FileCheck,
  Cloud,
  BarChart3
} from 'lucide-react';

export const TrafficDispatchHubView: React.FC = () => {
  const {
    jobs,
    users,
    brands,
    currentUser,
    employeeCapacities,
    setActiveView,
    setSelectedJobId,
    setSelectedEmployeeId,
    archivedTasks,
    oneDriveConfig,
    theme,
    activePaletteId,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange
  } = useApp();

  const isDark = theme === 'dark';

  // Distinct, calibrated theme-responsive colors for Active Operational Load
  // Resolves the collision in the 'signal' theme where conflicts clashed with the crimson brand
  const operationalColors = React.useMemo(() => {
    return getActiveOperationalLoadColors(activePaletteId, isDark);
  }, [activePaletteId, isDark]);

  // Modal triggers
  const [trafficModalJob, setTrafficModalJob] = useState<Job | null>(null);
  const [assignmentModalJob, setAssignmentModalJob] = useState<Job | null>(null);
  const [revertConflictJob, setRevertConflictJob] = useState<Job | null>(null);
  const [debriefPrepJob, setDebriefPrepJob] = useState<Job | null>(null);
  const [debriefMeetingJob, setDebriefMeetingJob] = useState<Job | null>(null);

  // Tab filter for dispatch triage
  type TriageFilterType = 'all_unassigned' | 'brief_intake' | 'debriefs' | 'conflicts' | 'assignments' | 'urgent' | 'production' | 'review';
  const [triageFilter, setTriageFilter] = useState<TriageFilterType>('all_unassigned');

  // Toggle for points model explainer
  const [showPointsGuide, setShowPointsGuide] = useState(false);

  // Deliverables scoped to calendar period
  const periodJobs = React.useMemo(() => {
    return jobs.filter((j) => isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange));
  }, [jobs, homeCalendarPeriod, homeCustomDateRange]);

  const periodArchived = React.useMemo(() => {
    return (archivedTasks || []).filter((t) => isArchivedInCalendarPeriod(t, homeCalendarPeriod, homeCustomDateRange));
  }, [archivedTasks, homeCalendarPeriod, homeCustomDateRange]);

  // Traffic workload and success statistics scoped to period
  const trafficStats = calculateTrafficWorkload(periodJobs, users, employeeCapacities);
  const trafficMembers = users.filter((u) => u.department === 'traffic' || u.role === 'traffic_manager');

  // Point breakdowns & contributions
  const conflictPoints = Number((trafficStats.breakdown.clientRevertConflicts * 3.5).toFixed(1));
  const dispatchPoints = Number((trafficStats.breakdown.pendingDispatchCount * 2.5).toFixed(1));
  const debriefPoints = Number((trafficStats.breakdown.debriefMeetingCount * 2.0).toFixed(1));
  const briefIntakePoints = Number((trafficStats.breakdown.briefIntakeCount * 1.5).toFixed(1));
  const productionPoints = Number((trafficStats.breakdown.activeProductionRuns * 0.5).toFixed(1));
  const reviewPoints = Number((trafficStats.breakdown.reviewHandoffCount * 0.5).toFixed(1));

  const totalPoints = trafficStats.workloadPoints;
  const maxPoints = trafficStats.maxWorkloadPoints; // 40.0 pts standard
  const availableRunway = Math.max(0, Number((maxPoints - totalPoints).toFixed(1)));

  // Proportions of 40 pt limit for stacked bar
  const conflictPct = Math.min(100, (conflictPoints / maxPoints) * 100);
  const dispatchPct = Math.min(100, (dispatchPoints / maxPoints) * 100);
  const debriefPct = Math.min(100, (debriefPoints / maxPoints) * 100);
  const briefIntakePct = Math.min(100, (briefIntakePoints / maxPoints) * 100);
  const productionPct = Math.min(100, (productionPoints / maxPoints) * 100);
  const reviewPct = Math.min(100, (reviewPoints / maxPoints) * 100);

  // Handler to filter triage list and smoothly scroll to the backlog
  const handleDriverClick = (filter: TriageFilterType) => {
    setTriageFilter(filter);
    const element = document.getElementById('dispatch-triage-backlog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Creative team members for capacity radar
  const creativeMembers = users.filter((u) => u.teamId === 'team-creative' && u.role === 'employee');

  // Deliverables needing traffic action (scoped to calendar period)
  const unassignedJobs = periodJobs.filter(
    (j) => j.status === 'unassigned' || !j.assigneeId || j.workflowStage === 'brief_intake' || j.workflowStage === 'manager_assignment' || j.workflowStage === 'traffic_assignment'
  );

  const activeInProd = periodJobs.filter((j) => j.workflowStage === 'in_production');
  const debriefJobs = periodJobs.filter((j) => j.workflowStage === 'debrief_ready' || j.workflowStage === 'debrief_meeting');
  const revertConflictJobs = periodJobs.filter((j) => j.workflowStage === 'client_revert' && (j.clientRevertInfo?.conflictDetected || j.isAtRisk));
  const urgentJobs = periodJobs.filter((j) => (j.priority === 'urgent' || j.isAtRisk) && j.status !== 'completed');

  // Filtered triage list
  const filteredTriageJobs = periodJobs.filter((j) => {
    if (j.status === 'completed') return false;
    if (triageFilter === 'all_unassigned') {
      return j.status === 'unassigned' || !j.assigneeId || j.workflowStage === 'brief_intake' || j.workflowStage === 'manager_assignment' || j.workflowStage === 'traffic_assignment';
    }
    if (triageFilter === 'brief_intake') {
      return j.workflowStage === 'brief_intake' || j.workflowStage === 'debrief_prep';
    }
    if (triageFilter === 'debriefs') {
      return j.workflowStage === 'debrief_ready' || j.workflowStage === 'debrief_meeting';
    }
    if (triageFilter === 'conflicts') {
      return j.workflowStage === 'client_revert' && (j.clientRevertInfo?.conflictDetected || j.isAtRisk);
    }
    if (triageFilter === 'assignments') {
      return j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment' || (!j.assigneeId && j.status === 'unassigned');
    }
    if (triageFilter === 'production') {
      return j.workflowStage === 'in_production';
    }
    if (triageFilter === 'review') {
      return j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff' || j.workflowStage === 'client_review';
    }
    if (triageFilter === 'urgent') {
      return j.priority === 'urgent' || j.isAtRisk;
    }
    return true;
  });

  return (
    <div className="space-y-7 pb-16 animate-in fade-in">
      {/* 1. Header & Quick Traffic Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span>Traffic Management &amp; Resource Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Traffic Dispatch Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-tertiary mt-1 max-w-2xl">
            Operations center governing creative dispatch velocity, debrief scheduling, staff workload leveling, and timeline conflict mediation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveView('agency_workflow')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface-elevated text-text-primary hover:bg-surface transition-all cursor-pointer shadow-xs"
          >
            <Workflow className="w-4 h-4 text-text-tertiary" />
            <span>Workflow Engine</span>
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </button>

          <button
            onClick={() => setActiveView('cases')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface-elevated text-text-primary hover:bg-surface transition-all cursor-pointer shadow-xs"
          >
            <FileCheck className="w-4 h-4 text-text-tertiary" />
            <span>Traffic Cases &amp; Rulings</span>
          </button>

          <button
            onClick={() => setActiveView('traffic_archive')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)',
              borderColor: 'var(--color-brand)'
            }}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Year Archive &amp; OneDrive</span>
          </button>
        </div>
      </div>

      {/* Operating Date Horizon Filter */}
      <HomeDateFilterBar
        period={homeCalendarPeriod}
        onPeriodChange={setHomeCalendarPeriod}
        customRange={homeCustomDateRange}
        onCustomRangeChange={setHomeCustomDateRange}
        matchedCount={periodJobs.length}
        archivedCount={periodArchived.length}
        totalCount={jobs.length}
        label="Dispatch Period"
      />

      {/* OneDrive Archival & Ledger Ribbon */}
      <div
        className="p-3.5 sm:p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--color-brand-muted)',
              borderColor: 'var(--color-brand)',
              color: 'var(--color-brand)'
            }}
          >
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">1-Year Task Archive &amp; OneDrive Cloud Backup</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5">
              <strong>{archivedTasks.length}</strong> historical tasks preserved across 5 quarters (2025 Q3 - 2026 Q3) · Cloud backup linked to <strong>{oneDriveConfig.connectedAccount}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveView('cases')}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-surface text-text-primary transition-colors cursor-pointer"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            Traffic Cases
          </button>
          <button
            onClick={() => setActiveView('traffic_archive')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            style={{ backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }}
          >
            <span>Open 1-Year Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Traffic Department Operational Workload Panel */}
      <SpotlightCard className="p-5 sm:p-6 space-y-4 rounded-2xl border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Gauge className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h2 className="text-base font-bold text-text-primary">
                Traffic Operations Workload (Desk Bandwidth)
              </h2>
              <button
                onClick={() => setShowPointsGuide(!showPointsGuide)}
                className="flex items-center gap-1 text-[11px] font-medium text-text-tertiary hover:text-text-primary cursor-pointer px-2 py-0.5 rounded border border-border bg-surface-elevated transition-colors"
                title="Click to learn how Traffic workload points are calculated"
              >
                <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>{showPointsGuide ? 'Hide Model Guide' : 'How Points Work'}</span>
                {showPointsGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-xs text-text-tertiary">
              Measures active coordination and dispatch volume on the Traffic desk in <strong>Operational Points</strong> (benchmarked against a <strong>40.0 pt weekly desk capacity</strong>). Unlike creative staff who log billable artwork hours, Traffic is measured on coordination tasks, dispatching, and conflict resolution.
            </p>
          </div>

          {/* Traffic Team Members */}
          <div className="flex items-center gap-3 bg-surface-elevated px-3 py-2 rounded-xl border border-border text-xs shrink-0">
            <span className="text-[11px] font-mono text-text-tertiary uppercase">Traffic Ops Team:</span>
            <div className="flex items-center gap-2">
              {trafficMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-1.5 font-medium text-text-primary">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-brand-contrast)'
                    }}
                  >
                    {member.name[0]}
                  </div>
                  <span className="text-xs font-semibold">{member.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">({member.seniority === 'lead' ? 'Lead' : 'Coord'})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Model Guide / Help Drawer */}
        {showPointsGuide && (
          <div className="p-4 rounded-xl bg-surface-elevated border border-border/80 space-y-3 animate-in fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h4 className="font-bold text-text-primary text-sm">How Traffic Operational Workload Works</h4>
              </div>
              <button
                onClick={() => setShowPointsGuide(false)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer text-xs font-mono"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <h5 className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
                  1. Creative Hours vs. Traffic Points
                </h5>
                <p className="text-text-secondary text-[11px] leading-relaxed">
                  Designers and animators log <strong>billable production hours</strong> against a 38h/wk capacity. Traffic coordinators do not build assets; their job is <strong>triage, debriefs, staffing, and dispute resolution</strong>. We quantify this cognitive coordination overhead in Operational Points.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <h5 className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-critical)' }} />
                  2. Why Tasks Have Different Weights
                </h5>
                <p className="text-text-secondary text-[11px] leading-relaxed">
                  A schedule conflict requires <strong>3.5 pts</strong> because mediating client revisions and re-allocating staff takes high friction. Dispatching queued deliverables requires <strong>2.5 pts</strong>. Routine active deliverable tracking requires only <strong>0.5 pts</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <h5 className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                  3. The 40-Point Weekly Desk Limit
                </h5>
                <p className="text-text-secondary text-[11px] leading-relaxed">
                  <strong>40.0 pts</strong> represents standard full weekly coordination capacity for the Traffic desk. Below 50% is <strong>Optimal</strong> (fast dispatch), 50-79% is <strong>Moderate</strong>, 80-94% is <strong>Heavy</strong>, and ≥95% is <strong>Overloaded</strong> (agency bottleneck).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workload Points Meter & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          {/* Main Meter Card (Left Column) */}
          <div className="lg:col-span-4 p-4 rounded-xl border border-border bg-surface-elevated space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Active Operational Load</span>
                <span
                  className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{
                    color:
                      trafficStats.status === 'overloaded'
                        ? 'var(--color-critical)'
                        : trafficStats.status === 'heavy'
                        ? 'var(--color-warning)'
                        : 'var(--color-success)'
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        trafficStats.status === 'overloaded'
                          ? 'var(--color-critical)'
                          : trafficStats.status === 'heavy'
                          ? 'var(--color-warning)'
                          : 'var(--color-success)'
                    }}
                  />
                  {trafficStats.status === 'overloaded'
                    ? 'Overloaded Desk'
                    : trafficStats.status === 'heavy'
                    ? 'Heavy Backlog'
                    : trafficStats.status === 'moderate'
                    ? 'Moderate Flow'
                    : 'Optimal Runway'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-text-primary tabular-nums">{totalPoints}</span>
                <span className="text-xs text-text-tertiary font-mono">/ {maxPoints} pts capacity</span>
                <span className="text-xs font-bold text-text-secondary ml-auto font-mono tabular-nums">{trafficStats.capacityPercent}%</span>
              </div>

              {/* Status context message */}
              <p className="text-[11px] text-text-secondary leading-snug">
                {trafficStats.status === 'overloaded'
                  ? 'Traffic desk is at capacity. Triage queue and dispatch delays likely without leadership intervention.'
                  : trafficStats.status === 'heavy'
                  ? 'Elevated coordination volume. Brief intake and artist allocations are building up.'
                  : trafficStats.status === 'moderate'
                  ? 'Healthy operational cadence across active client projects and debriefs.'
                  : 'Clear runway. Traffic has ample bandwidth to review and dispatch new briefs immediately.'}
              </p>
            </div>

            {/* Segmented Stacked Capacity Bar */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                <span>Desk Load Breakdown</span>
                <span className="font-semibold text-text-secondary tabular-nums">{availableRunway} pts free runway</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden border border-border/60 flex">
                {conflictPct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${conflictPct}%`, backgroundColor: operationalColors.conflicts }}
                    title={`Timeline Conflicts: ${conflictPoints} pts (${Math.round(conflictPct)}%)`}
                    onClick={() => handleDriverClick('conflicts')}
                  />
                )}
                {dispatchPct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${dispatchPct}%`, backgroundColor: operationalColors.assignments }}
                    title={`Staff Allocations: ${dispatchPoints} pts (${Math.round(dispatchPct)}%)`}
                    onClick={() => handleDriverClick('assignments')}
                  />
                )}
                {debriefPct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${debriefPct}%`, backgroundColor: operationalColors.debriefs }}
                    title={`Debrief Meetings: ${debriefPoints} pts (${Math.round(debriefPct)}%)`}
                    onClick={() => handleDriverClick('debriefs')}
                  />
                )}
                {briefIntakePct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${briefIntakePct}%`, backgroundColor: operationalColors.brief_intake }}
                    title={`Brief Triage: ${briefIntakePoints} pts (${Math.round(briefIntakePct)}%)`}
                    onClick={() => handleDriverClick('brief_intake')}
                  />
                )}
                {productionPct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${productionPct}%`, backgroundColor: operationalColors.production }}
                    title={`Active Production: ${productionPoints} pts (${Math.round(productionPct)}%)`}
                    onClick={() => handleDriverClick('production')}
                  />
                )}
                {reviewPct > 0 && (
                  <div
                    className="h-full hover:opacity-85 transition-all cursor-pointer"
                    style={{ width: `${reviewPct}%`, backgroundColor: operationalColors.review }}
                    title={`Review & Sign-Offs: ${reviewPoints} pts (${Math.round(reviewPct)}%)`}
                    onClick={() => handleDriverClick('review')}
                  />
                )}
              </div>

              {/* Bar Legend */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-text-tertiary pt-1">
                <button
                  onClick={() => handleDriverClick('conflicts')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.conflicts }} />
                  <span className="truncate">Conflicts: {conflictPoints}p</span>
                </button>
                <button
                  onClick={() => handleDriverClick('assignments')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.assignments }} />
                  <span className="truncate">Dispatch: {dispatchPoints}p</span>
                </button>
                <button
                  onClick={() => handleDriverClick('debriefs')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.debriefs }} />
                  <span className="truncate">Debriefs: {debriefPoints}p</span>
                </button>
                <button
                  onClick={() => handleDriverClick('brief_intake')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.brief_intake }} />
                  <span className="truncate">Intake: {briefIntakePoints}p</span>
                </button>
                <button
                  onClick={() => handleDriverClick('production')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.production }} />
                  <span className="truncate">Production: {productionPoints}p</span>
                </button>
                <button
                  onClick={() => handleDriverClick('review')}
                  className="flex items-center gap-1.5 hover:text-text-primary text-left cursor-pointer truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: operationalColors.review }} />
                  <span className="truncate">Review: {reviewPoints}p</span>
                </button>
              </div>
            </div>
          </div>

          {/* Operational Breakdown Items (Right Grid: 6 Interactive Driver Cards) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {/* 1. Schedule Conflicts */}
            <button
              onClick={() => handleDriverClick('conflicts')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'conflicts'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : trafficStats.breakdown.clientRevertConflicts > 0
                  ? 'border-border bg-surface hover:bg-surface-elevated'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
              style={{
                borderColor: triageFilter === 'conflicts'
                  ? undefined
                  : trafficStats.breakdown.clientRevertConflicts > 0
                  ? `color-mix(in srgb, ${operationalColors.conflicts} 40%, var(--color-border))`
                  : undefined
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span
                    className="flex items-center gap-1"
                    style={{
                      color:
                        trafficStats.breakdown.clientRevertConflicts > 0
                          ? operationalColors.conflicts
                          : 'var(--color-text-secondary)'
                    }}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Timeline Conflicts
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.conflicts }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span
                    className="font-black text-lg tabular-nums"
                    style={{
                      color:
                        trafficStats.breakdown.clientRevertConflicts > 0
                          ? operationalColors.conflicts
                          : 'var(--color-text-primary)'
                    }}
                  >
                    {trafficStats.breakdown.clientRevertConflicts} clashes
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {conflictPoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Resolving client revert disputes and deadline clashes.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(conflictPct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>

            {/* 2. Staff Allocations */}
            <button
              onClick={() => handleDriverClick('assignments')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'assignments'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span className="flex items-center gap-1 group-hover:text-text-primary">
                    <UserCheck className="w-3 h-3 shrink-0" style={{ color: triageFilter === 'assignments' ? 'var(--color-brand)' : operationalColors.assignments }} />
                    Staff Allocations
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.assignments }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-black text-text-primary text-lg tabular-nums">
                    {trafficStats.breakdown.pendingDispatchCount} queued
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {dispatchPoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Matching task complexity to available creative bandwidth.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(dispatchPct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>

            {/* 3. Debrief Sessions */}
            <button
              onClick={() => handleDriverClick('debriefs')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'debriefs'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span className="flex items-center gap-1 group-hover:text-text-primary">
                    <Users className="w-3 h-3 shrink-0" style={{ color: triageFilter === 'debriefs' ? 'var(--color-brand)' : operationalColors.debriefs }} />
                    Debrief Sessions
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.debriefs }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-black text-text-primary text-lg tabular-nums">
                    {trafficStats.breakdown.debriefMeetingCount} sessions
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {debriefPoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Convening CS, CD &amp; discipline leads for brief alignment.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(debriefPct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>

            {/* 4. Brief Triage & Prep */}
            <button
              onClick={() => handleDriverClick('brief_intake')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'brief_intake'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span className="flex items-center gap-1 group-hover:text-text-primary">
                    <Send className="w-3 h-3 shrink-0" style={{ color: triageFilter === 'brief_intake' ? 'var(--color-brand)' : operationalColors.brief_intake }} />
                    Brief Triage
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.brief_intake }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-black text-text-primary text-lg tabular-nums">
                    {trafficStats.breakdown.briefIntakeCount} briefs
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {briefIntakePoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Vetting Client Service submissions and preparing debrief packs.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(briefIntakePct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>

            {/* 5. Active Production */}
            <button
              onClick={() => handleDriverClick('production')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'production'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span className="flex items-center gap-1 group-hover:text-text-primary">
                    <Activity className="w-3 h-3 shrink-0" style={{ color: triageFilter === 'production' ? 'var(--color-brand)' : operationalColors.production }} />
                    Live Production
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.production }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-black text-text-primary text-lg tabular-nums">
                    {trafficStats.breakdown.activeProductionRuns} active
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {productionPoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Low-friction milestone tracking on in-flight deliverables.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(productionPct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>

            {/* 6. Review & Sign-Off Gates */}
            <button
              onClick={() => handleDriverClick('review')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                triageFilter === 'review'
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs ring-1 ring-[var(--color-brand)]'
                  : 'border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] uppercase font-mono font-bold text-text-tertiary">
                  <span className="flex items-center gap-1 group-hover:text-text-primary">
                    <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: triageFilter === 'review' ? 'var(--color-brand)' : operationalColors.review }} />
                    Review &amp; Gates
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: operationalColors.review }}
                    title="Load category identifier"
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-black text-text-primary text-lg tabular-nums">
                    {trafficStats.breakdown.reviewHandoffCount} in QA
                  </span>
                  <span className="text-xs font-mono font-bold text-text-secondary tabular-nums">
                    {reviewPoints} pts
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 leading-snug">
                  Facilitating internal QA approvals &amp; CS client delivery.
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-tertiary group-hover:text-text-primary">
                <span className="tabular-nums">{Math.round(reviewPct)}% of desk</span>
                <span className="underline group-hover:translate-x-0.5 transition-transform">Filter list ↓</span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Calculation Formula Strip */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Sliders className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span className="font-semibold text-text-secondary">Live Operational Formula:</span>
            <span className="font-mono text-text-tertiary text-[11px]">
              ({trafficStats.breakdown.clientRevertConflicts} × 3.5) + ({trafficStats.breakdown.pendingDispatchCount} × 2.5) + ({trafficStats.breakdown.debriefMeetingCount} × 2.0) + ({trafficStats.breakdown.briefIntakeCount} × 1.5) + ({trafficStats.breakdown.activeProductionRuns} × 0.5) + ({trafficStats.breakdown.reviewHandoffCount} × 0.5)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold shrink-0">
            <span className="text-text-tertiary">=</span>
            <span className="text-sm font-black text-text-primary" style={{ color: 'var(--color-brand)' }}>{totalPoints} pts</span>
            <span className="text-text-tertiary">/ {maxPoints} max ({trafficStats.capacityPercent}%)</span>
          </div>
        </div>
      </SpotlightCard>

      {/* Traffic Operations & Delivery Visual Analytics (Live Telemetry) */}
      <VisualAnalyticsWidget
        scope="traffic"
        title="Traffic Operations & Delivery Visual Analytics"
        subtitle="Real-time agency delivery health, hours distribution across creative systems, and six dispatch radar pillars."
      />

      {/* 3. Traffic Success Metrics (What Success Looks Like for Traffic) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-base font-bold text-text-primary">
              Traffic Operational Success &amp; Performance KPIs
            </h2>
          </div>
          <span className="text-xs text-text-tertiary">
            Measured against agency SLA benchmarks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <SpotlightCard className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-mono text-[11px] uppercase tracking-wider">Dispatch Velocity</span>
              <Clock className="w-4 h-4 text-text-tertiary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-text-primary tabular-nums">{trafficStats.dispatchVelocityHours}h</span>
              <span className="text-[11px] text-text-tertiary font-mono">median</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
              <span className="text-text-tertiary">SLA Target: &lt; 24h</span>
              <span className="font-bold font-mono" style={{ color: 'var(--color-success)' }}>On Target</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-mono text-[11px] uppercase tracking-wider">Studio Balance Index</span>
              <Scale className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-text-primary tabular-nums">{trafficStats.studioBalanceIndex}%</span>
              <span className="text-[11px] text-text-tertiary font-mono">leveling</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
              <span className="text-text-tertiary">{trafficStats.optimalCreativesCount} optimal • {trafficStats.overloadedCreativesCount} heavy</span>
              <span className="font-bold font-mono" style={{ color: 'var(--color-success)' }}>Balanced</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-mono text-[11px] uppercase tracking-wider">Conflict Resolution</span>
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--color-success)' }}>{trafficStats.conflictResolutionRate}%</span>
              <span className="text-[11px] text-text-tertiary font-mono">rate</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
              <span className="text-text-tertiary">SLA: Mediate in &lt; 4h</span>
              <span className="font-bold font-mono" style={{ color: 'var(--color-success)' }}>100% SLA</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-mono text-[11px] uppercase tracking-wider">Unassigned Queue</span>
              <Send className="w-4 h-4 text-text-tertiary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-text-primary tabular-nums">{unassignedJobs.length}</span>
              <span className="text-[11px] text-text-tertiary font-mono">({trafficStats.unassignedBacklogHours}h effort)</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
              <span className="text-text-tertiary">Target: &lt; 5 waiting</span>
              <span className="font-bold font-mono" style={{ color: unassignedJobs.length > 5 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                {unassignedJobs.length > 5 ? 'Triage Active' : 'Optimal'}
              </span>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* 4. Revert Conflict Banner (if any) */}
      {revertConflictJobs.length > 0 && (
        <div
          className="p-4 sm:p-5 rounded-2xl border space-y-3"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-critical) 35%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-critical) 8%, transparent)'
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-critical) 18%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--color-critical) 35%, transparent)',
                  color: 'var(--color-critical)'
                }}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {revertConflictJobs.length} Client Revert Conflict(s) Require Traffic Intervention
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Client requested changes on an in-progress deliverable that clashes with scheduled production or creative bandwidth.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRevertConflictJob(revertConflictJobs[0])}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
              style={{ backgroundColor: 'var(--color-critical)' }}
            >
              Resolve Conflict Now
            </button>
          </div>
        </div>
      )}

      {/* 5. Creative Studio Bandwidth & Availability Heatmap (Resource Leveling Radar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-base font-bold text-text-primary">
              Creative Studio Bandwidth &amp; Resource Leveling Radar
            </h2>
          </div>
          <span className="text-xs text-text-tertiary">
            Real-time allocation across 38h standard weekly capacity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {creativeMembers.map((member) => {
            const capacity = employeeCapacities[member.id] || {
              assignedHours: 0,
              capacityPercent: 0,
              status: 'healthy'
            };

            const assignedJobs = jobs.filter((j) => j.assigneeId === member.id && j.status !== 'completed');

            const isOverloaded = capacity.capacityPercent >= 90;
            const isHeavy = capacity.capacityPercent >= 75 && capacity.capacityPercent < 90;
            const isOptimal = capacity.capacityPercent >= 50 && capacity.capacityPercent < 75;

            const badgeColorVar = isOverloaded
              ? 'var(--color-critical)'
              : isHeavy
              ? 'var(--color-warning)'
              : 'var(--color-brand)';

            return (
              <SpotlightCard
                key={member.id}
                onClick={() => setSelectedEmployeeId(member.id)}
                className="p-4 space-y-3 cursor-pointer group hover:border-[var(--color-brand)]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-text-primary transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-text-tertiary">
                      {member.jobTitle}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border tabular-nums"
                    style={{
                      color: badgeColorVar,
                      borderColor: `color-mix(in srgb, ${badgeColorVar} 40%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${badgeColorVar} 12%, transparent)`
                    }}
                  >
                    {capacity.capacityPercent}%
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-tertiary font-mono">
                    <span className="tabular-nums">{capacity.assignedHours}h assigned</span>
                    <span>38h limit</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden border border-border/40">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(capacity.capacityPercent, 100)}%`,
                        backgroundColor: badgeColorVar
                      }}
                    />
                  </div>
                </div>

                {/* Active Deliverable Count & Seniority Badge */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-text-tertiary">
                  <span>{assignedJobs.length} active deliverable(s)</span>
                  <SeniorityBadge seniority={member.seniority} />
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* 6. Dispatch Triage & Intake Backlog */}
      <div id="dispatch-triage-backlog" className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Send className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-base font-bold text-text-primary">
              Dispatch Triage &amp; Intake Backlog
            </h2>
            <span className="text-xs font-mono text-text-tertiary">
              ({filteredTriageJobs.length} deliverable{filteredTriageJobs.length === 1 ? '' : 's'})
            </span>
            {triageFilter !== 'all_unassigned' && (
              <button
                onClick={() => setTriageFilter('all_unassigned')}
                className="text-[11px] font-mono hover:underline cursor-pointer ml-1"
                style={{ color: 'var(--color-brand)' }}
              >
                Reset to All Unassigned
              </button>
            )}
          </div>

          {/* Sub-filters matching the Operational Drivers */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-elevated p-1 rounded-xl border border-border text-xs">
            {[
              { id: 'all_unassigned', label: 'All Backlog', count: unassignedJobs.length },
              { id: 'conflicts', label: 'Conflicts', count: revertConflictJobs.length, isRisk: revertConflictJobs.length > 0 },
              { id: 'assignments', label: 'Assign', count: jobs.filter((j) => j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment' || (!j.assigneeId && j.status === 'unassigned')).length },
              { id: 'debriefs', label: 'Debriefs', count: debriefJobs.length },
              { id: 'brief_intake', label: 'Intake', count: jobs.filter((j) => j.workflowStage === 'brief_intake' || j.workflowStage === 'debrief_prep').length },
              { id: 'production', label: 'Live', count: activeInProd.length },
              { id: 'review', label: 'Review', count: jobs.filter((j) => j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff' || j.workflowStage === 'client_review').length },
              { id: 'urgent', label: 'Urgent', count: urgentJobs.length, isRisk: urgentJobs.length > 0 }
            ].map((tab) => {
              const isSelected = triageFilter === tab.id;
              const tabColor =
                tab.id === 'conflicts'
                  ? operationalColors.conflicts
                  : tab.id === 'assignments'
                  ? operationalColors.assignments
                  : tab.id === 'debriefs'
                  ? operationalColors.debriefs
                  : tab.id === 'brief_intake'
                  ? operationalColors.brief_intake
                  : tab.id === 'production'
                  ? operationalColors.production
                  : tab.id === 'review'
                  ? operationalColors.review
                  : tab.isRisk
                  ? 'var(--color-critical)'
                  : undefined;

              return (
                <button
                  key={tab.id}
                  onClick={() => setTriageFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-surface text-text-primary font-bold shadow-xs border border-border'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                  style={{
                    color: isSelected
                      ? undefined
                      : tab.id === 'conflicts' && tab.count > 0
                      ? operationalColors.conflicts
                      : tab.isRisk
                      ? 'var(--color-critical)'
                      : undefined
                  }}
                >
                  {tabColor && tab.id !== 'all_unassigned' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tabColor }}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span className="font-mono text-[10px] opacity-75 tabular-nums">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredTriageJobs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface/50 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: 'var(--color-success)' }} />
            <h4 className="text-sm font-bold text-text-primary">Traffic Backlog Clear</h4>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto">
              No deliverables currently waiting for traffic routing or dispatch under this filter. All jobs have assigned creatives and clear timelines.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTriageJobs.map((job) => {
              const brand = brands.find((b) => b.id === job.brandId);
              const assignee = users.find((u) => u.id === job.assigneeId);
              const isConflict = job.workflowStage === 'client_revert' && job.clientRevertInfo?.conflictDetected;

              return (
                <SpotlightCard
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                    isConflict
                      ? 'border-[color-mix(in_srgb,var(--color-critical)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-critical)_4%,transparent)]'
                      : 'border-border hover:border-[var(--color-brand)]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-text-tertiary">
                        <span className="font-bold text-text-primary">{job.id}</span>
                        {brand && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{
                              borderColor: `${brand.primaryColor}40`,
                              backgroundColor: `${brand.primaryColor}15`,
                              color: isDark ? '#fff' : brand.primaryColor
                            }}
                          >
                            {brand.name}
                          </span>
                        )}
                        <WorkflowStatusBadge stage={job.workflowStage} />
                      </div>
                      <h3 className="text-sm font-bold text-text-primary leading-snug">
                        {job.title}
                      </h3>
                    </div>
                    <PriorityBadge priority={job.priority} />
                  </div>

                  {/* Standard Task & Complexity Info */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-surface-elevated/70 border border-border/50 text-[11px] font-mono">
                    <div>
                      <span className="text-text-tertiary block text-[9px] uppercase">Benchmark</span>
                      <span className="font-bold text-text-secondary tabular-nums">{job.managerAllocationHours || job.estimatedHours} hrs</span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block text-[9px] uppercase">Target Seniority</span>
                      <span className="font-bold text-text-secondary">{formatSeniority(job.assignedSeniority || 'mid')}</span>
                    </div>
                    <div>
                      <span className="text-text-tertiary block text-[9px] uppercase">Deadline</span>
                      <span className="font-bold text-text-secondary tabular-nums">{job.dueDate.split('T')[0]}</span>
                    </div>
                  </div>

                  {/* Conflict alert text if present */}
                  {isConflict && (
                    <div
                      className="p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-critical) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-critical) 25%, transparent)',
                        color: 'var(--color-critical)'
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Client requested revert conflicting with downstream commitments.</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
                    <div className="text-xs text-text-tertiary">
                      {assignee ? (
                        <span className="flex items-center gap-1.5">
                          <img src={assignee.avatar} className="w-4 h-4 rounded-full" alt="" />
                          <span className="text-text-secondary">{assignee.name}</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-[11px] flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                          <UserCheck className="w-3.5 h-3.5" />
                          Unassigned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {isConflict ? (
                        <button
                          onClick={() => setRevertConflictJob(job)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                          style={{ backgroundColor: 'var(--color-critical)' }}
                        >
                          Resolve Conflict
                        </button>
                      ) : (job.workflowStage === 'brief_intake' || job.workflowStage === 'debrief_prep') ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-text-tertiary border border-border/70 bg-surface">
                          CS Preparing Debrief
                        </span>
                      ) : (job.workflowStage === 'debrief_ready') ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDebriefMeetingJob(job)}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                            style={{
                              backgroundColor: 'var(--color-brand)',
                              color: 'var(--color-brand-contrast)'
                            }}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Schedule Debrief</span>
                          </button>
                          <button
                            onClick={() => setDebriefPrepJob(job)}
                            className="p-1 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                            title="Inspect CS Debrief Pack"
                          >
                            <Layers className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (job.workflowStage === 'debrief_meeting') ? (
                        <button
                          onClick={() => setDebriefMeetingJob(job)}
                          className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }}
                        >
                          <Users className="w-3 h-3" />
                          <span>Conduct Debrief</span>
                        </button>
                      ) : job.workflowStage === 'creative_brainstorm' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-text-secondary border border-border/70 bg-surface">
                          In Strategy Brainstorm
                        </span>
                      ) : !job.assigneeId || job.workflowStage === 'traffic_assignment' || job.workflowStage === 'manager_assignment' ? (
                        <button
                          onClick={() => setAssignmentModalJob(job)}
                          className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }}
                        >
                          Assign Creative
                        </button>
                      ) : job.workflowStage === 'internal_review' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-text-secondary border border-border/70 bg-surface">
                          Creative Alignment Review
                        </span>
                      ) : job.workflowStage === 'client_service_handoff' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-text-secondary border border-border/70 bg-surface">
                          CS Email Dispatch
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedJobId(job.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-elevated text-text-primary transition-colors cursor-pointer"
                        >
                          Inspect Deliverable
                        </button>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {trafficModalJob && (
        <TrafficDispatchModal
          job={trafficModalJob}
          isOpen={Boolean(trafficModalJob)}
          onClose={() => setTrafficModalJob(null)}
        />
      )}

      {assignmentModalJob && (
        <SeniorityAssignmentModal
          job={assignmentModalJob}
          isOpen={Boolean(assignmentModalJob)}
          onClose={() => setAssignmentModalJob(null)}
        />
      )}

      {revertConflictJob && (
        <RevertConflictResolutionModal
          job={revertConflictJob}
          isOpen={Boolean(revertConflictJob)}
          onClose={() => setRevertConflictJob(null)}
        />
      )}

      {debriefPrepJob && (
        <DebriefPreparationModal
          job={debriefPrepJob}
          isOpen={Boolean(debriefPrepJob)}
          onClose={() => setDebriefPrepJob(null)}
          onProceedToMeeting={() => {
            const target = debriefPrepJob;
            setDebriefPrepJob(null);
            setDebriefMeetingJob(target);
          }}
        />
      )}

      {debriefMeetingJob && (
        <DebriefMeetingModal
          job={debriefMeetingJob}
          isOpen={Boolean(debriefMeetingJob)}
          onClose={() => setDebriefMeetingJob(null)}
        />
      )}
    </div>
  );
};
