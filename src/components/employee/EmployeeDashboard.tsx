import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import { SpotlightCard } from '../common/SpotlightCard';
import { CapacityMeter } from '../common/CapacityMeter';
import {
  Calendar,
  Clock,
  Target,
  ArrowRight,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  AlertCircle,
  UserCheck,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { DebriefMeetingModal } from '../workflow/DebriefMeetingModal';
import { CreativeStrategyModal } from '../workflow/CreativeStrategyModal';
import { ManagerReviewModal } from '../workflow/ManagerReviewModal';
import { DeliverableSubmissionModal } from '../workflow/DeliverableSubmissionModal';
import { Job } from '../../types';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';
import {
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod
} from '../../utils/calendarPeriodFilter';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    jobs,
    selectedJobId,
    setSelectedJobId,
    setActiveView,
    openLogContributionModal,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange,
    archivedTasks,
    openLogDeliveryImpactModal,
    deliveryImpactLogs
  } = useApp();

  const firstName = currentUser.name.split(' ')[0] || 'Sarah';

  // Modal inspection states
  const [selectedDebriefJob, setSelectedDebriefJob] = React.useState<Job | null>(null);
  const [selectedBrainstormJob, setSelectedBrainstormJob] = React.useState<Job | null>(null);
  const [selectedReviewJob, setSelectedReviewJob] = React.useState<Job | null>(null);
  const [selectedSubmitJob, setSelectedSubmitJob] = React.useState<Job | null>(null);

  // My deliverables across live and archives filtered by selected period
  const myJobs = jobs.filter((j) => j.assigneeId === currentUser.id);

  const periodMyJobs = React.useMemo(() => {
    return myJobs.filter((j) => isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange));
  }, [myJobs, homeCalendarPeriod, homeCustomDateRange]);

  const periodMyArchived = React.useMemo(() => {
    return (archivedTasks || []).filter(
      (t) => (t.assigneeId === currentUser.id || t.assigneeName === currentUser.name) &&
        isArchivedInCalendarPeriod(t, homeCalendarPeriod, homeCustomDateRange)
    );
  }, [archivedTasks, currentUser, homeCalendarPeriod, homeCustomDateRange]);

  const myActiveJobs = periodMyJobs.filter((j) => j.status !== 'completed');

  // Called Upon Meetings where currentUser is invited as creative specialist
  const calledDebriefJobs = jobs.filter(
    (j) =>
      (j.workflowStage === 'debrief_ready' || j.workflowStage === 'debrief_meeting') &&
      j.debriefMeeting?.attendees?.some((a) => a.userId === currentUser.id) &&
      isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange)
  );

  const calledBrainstormJobs = jobs.filter(
    (j) =>
      j.workflowStage === 'creative_brainstorm' &&
      (j.assigneeId === currentUser.id || j.debriefMeeting?.attendees?.some((a) => a.userId === currentUser.id)) &&
      isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange)
  );

  const alignmentReviewJobs = jobs.filter(
    (j) => j.workflowStage === 'internal_review' && j.assigneeId === currentUser.id &&
      isJobInCalendarPeriod(j, homeCalendarPeriod, homeCustomDateRange)
  );

  // Counts scoped to selected period
  const inProgressCount = periodMyJobs.filter((j) => j.status === 'in_progress').length;
  const blockedCount = periodMyJobs.filter((j) => j.status === 'blocked').length;
  const completedCount = periodMyJobs.filter((j) => j.status === 'completed').length + periodMyArchived.length;
  const activePeriodCount = myActiveJobs.length;

  // Personal Workload Hours
  const totalCommittedHours = periodMyJobs
    .filter((j) => j.status !== 'completed')
    .reduce((acc, j) => acc + (j.estimatedHours || 8), 0);
  const standardHours = 40;
  const capacityPercent = Math.min(150, Math.round((totalCommittedHours / standardHours) * 100));

  return (
    <div id="employee-dashboard-container" className="space-y-6 pb-12">
      {/* Friendly Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Good morning, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm mt-1 text-text-tertiary">
            Your daily workspace: track active deliverables, log work evidence, and monitor your personal capacity.
          </p>
        </div>

        {/* Clean Header Action: Record Contribution only */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openLogContributionModal()}
            className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Record Contribution</span>
          </button>
        </div>
      </div>

      {/* Operating Period & Unified Calendar Filter */}
      <HomeDateFilterBar
        period={homeCalendarPeriod}
        onPeriodChange={setHomeCalendarPeriod}
        customRange={homeCustomDateRange}
        onCustomRangeChange={setHomeCustomDateRange}
        matchedCount={periodMyJobs.length}
        archivedCount={periodMyArchived.length}
        totalCount={myJobs.length}
        label="Operating Period"
      />

      {/* Personal Workload Balance (Clean, Tab-Free Minimalist Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-text-primary">
                  Personal Workload Balance
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                Your current active deliverable allocation is scheduled at <strong className="text-text-primary font-semibold">{totalCommittedHours} hours</strong>.
                {totalCommittedHours <= 40 ? ' Operating within healthy capacity buffer.' : ' Over scheduled capacity threshold.'}
              </p>
            </div>
            <button
              onClick={() => setActiveView('team_traffic')}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-brand" />
              <span>Team Bandwidth</span>
            </button>
          </div>

          <div className="pt-3 border-t border-border/60 mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-secondary font-medium">Weekly Capacity Ratio</span>
              <span className="font-mono font-bold" style={{ color: capacityPercent > 100 ? 'var(--color-critical)' : 'var(--color-success)' }}>
                {totalCommittedHours}h / {standardHours}h ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-surface-muted border border-border/40">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, capacityPercent)}%`,
                  backgroundColor: capacityPercent > 100 ? 'var(--color-critical)' : 'var(--color-brand)'
                }}
              />
            </div>
          </div>
        </SpotlightCard>

        {/* 4 Clean Quick Status Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Deliverables in Scope */}
          <SpotlightCard className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-text-primary">
                {activePeriodCount}
              </span>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Active in Period
              </div>
              <div className="text-[10px] mt-0.5 text-text-tertiary">
                {activePeriodCount} tasks
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: In Progress */}
          <SpotlightCard className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                {inProgressCount}
              </span>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                In Progress
              </div>
              <div className="text-[10px] mt-0.5 text-text-tertiary">
                Active production
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Awaiting Input / Blocked */}
          <SpotlightCard className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-amber-500">
                {blockedCount}
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Waiting / Blocked
              </div>
              <div className="text-[10px] mt-0.5 text-text-tertiary">
                Impediment flagged
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Completed */}
          <SpotlightCard className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-emerald-500">
                {completedCount}
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Completed
              </div>
              <div className="text-[10px] mt-0.5 text-text-tertiary">
                Delivered & verified
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Called Sessions & Cross-Discipline Sync Alerts */}
      {(calledDebriefJobs.length > 0 || calledBrainstormJobs.length > 0 || alignmentReviewJobs.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand" />
              <span>Called Collaboration Sessions ({calledDebriefJobs.length + calledBrainstormJobs.length + alignmentReviewJobs.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {calledDebriefJobs.map((job) => (
              <div key={`debrief-${job.id}`} className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-brand">Debrief Meeting</span>
                  <span className="text-[10px] font-mono text-text-tertiary">{job.id}</span>
                </div>
                <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                <p className="text-[11px] text-text-secondary">Client: {job.requestor}</p>
                <button
                  onClick={() => setSelectedDebriefJob(job)}
                  className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-brand text-brand-contrast flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Debrief Pack</span>
                </button>
              </div>
            ))}

            {calledBrainstormJobs.map((job) => (
              <div key={`brainstorm-${job.id}`} className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Creative Strategy</span>
                  <span className="text-[10px] font-mono text-text-tertiary">{job.id}</span>
                </div>
                <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                <p className="text-[11px] text-text-secondary">Scope: {job.estimatedHours}h</p>
                <button
                  onClick={() => setSelectedBrainstormJob(job)}
                  className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-brand text-brand-contrast flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Strategy Session</span>
                </button>
              </div>
            ))}

            {alignmentReviewJobs.map((job) => (
              <div key={`align-${job.id}`} className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-text-secondary">Internal Review</span>
                  <span className="text-[10px] font-mono text-text-tertiary">{job.id}</span>
                </div>
                <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                <p className="text-[11px] text-text-secondary">Director & Senior review</p>
                <button
                  onClick={() => setSelectedReviewJob(job)}
                  className="w-full py-1.5 px-3 rounded-lg border border-border bg-surface-elevated text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-brand" />
                  <span>View Review Notes</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Logged Delivery Impediments */}
      {(() => {
        const myDeliveryImpacts = deliveryImpactLogs.filter(
          (l) => l.loggedByUserId === currentUser.id || myJobs.some((j) => j.id === l.jobId)
        );
        if (myDeliveryImpacts.length === 0) return null;
        return (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-text-primary">
                  Logged Delivery Impediments ({myDeliveryImpacts.length})
                </span>
              </div>
              <button
                onClick={() => openLogDeliveryImpactModal()}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                + Log Impediment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {myDeliveryImpacts.map((imp) => (
                <div key={imp.id} className="p-3 rounded-lg bg-surface border border-border/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-text-primary truncate">
                      {imp.jobId ? `${imp.jobId} · ` : ''}{imp.jobTitle || 'Impediment'}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                      {imp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                    {imp.impactDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Active Deliverables Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-text-primary">
              Active Deliverables
            </h2>
          </div>
          <button
            onClick={() => setActiveView('my_work')}
            className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer text-brand"
          >
            <span>Open in My Work Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {myActiveJobs.length > 0 ? (
            myActiveJobs.map((job) => (
              <SpotlightTaskRow
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                onClick={() => setSelectedJobId(job.id)}
              />
            ))
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-1.5 bg-surface/50">
              <Calendar className="w-5 h-5 mx-auto text-text-tertiary" />
              <p className="text-xs font-semibold text-text-primary">
                No active deliverables in this calendar period
              </p>
              <p className="text-[11px] text-text-secondary">
                {periodMyArchived.length > 0
                  ? `${periodMyArchived.length} archived deliverable(s) recorded for this period.`
                  : 'Tasks will be dispatched to your desk by Traffic.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Inspecting Called Sessions */}
      <DebriefMeetingModal
        job={selectedDebriefJob}
        isOpen={!!selectedDebriefJob}
        onClose={() => setSelectedDebriefJob(null)}
      />

      <CreativeStrategyModal
        job={selectedBrainstormJob}
        isOpen={!!selectedBrainstormJob}
        onClose={() => setSelectedBrainstormJob(null)}
      />

      <ManagerReviewModal
        job={selectedReviewJob}
        isOpen={!!selectedReviewJob}
        onClose={() => setSelectedReviewJob(null)}
      />

      <DeliverableSubmissionModal
        job={selectedSubmitJob}
        isOpen={!!selectedSubmitJob}
        onClose={() => setSelectedSubmitJob(null)}
      />
    </div>
  );
};
