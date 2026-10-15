import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import { SpotlightCard } from '../common/SpotlightCard';
import { CapacityMeter } from '../common/CapacityMeter';
import {
  Calendar,
  Clock,
  Hourglass,
  CheckCircle2,
  BarChart3,
  Target,
  Zap,
  ArrowRight,
  Plus,
  Award,
  Users,
  MessageSquare,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Sunrise,
  Sunset,
  FileDown,
  ShieldCheck,
  HeartHandshake,
  Cpu,
  Layers,
  Flame,
  HelpCircle,
  Send,
  Lightbulb,
  UserCheck,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { DebriefMeetingModal } from '../workflow/DebriefMeetingModal';
import { CreativeStrategyModal } from '../workflow/CreativeStrategyModal';
import { ManagerReviewModal } from '../workflow/ManagerReviewModal';
import { DeliverableSubmissionModal } from '../workflow/DeliverableSubmissionModal';
import { Job } from '../../types';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import { HomeDateFilterBar } from '../common/HomeDateFilterBar';
import {
  isJobInCalendarPeriod,
  isArchivedInCalendarPeriod,
  convertArchivedTaskToJob
} from '../../utils/calendarPeriodFilter';
import controlTowerBannerImg from '../../assets/images/control_tower_banner_1789471153509.jpg';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    jobs,
    selectedJobId,
    setSelectedJobId,
    setActiveView,
    setShowBuildCaseModal,
    openLogContributionModal,
    getUserContributionSummary,
    respondToClarification,
    openReportModal,
    homeCalendarPeriod,
    setHomeCalendarPeriod,
    homeCustomDateRange,
    setHomeCustomDateRange,
    archivedTasks,
    openLogDeliveryImpactModal,
    deliveryImpactLogs
  } = useApp();

  const firstName = currentUser.name.split(' ')[0] || 'Sarah';
  const contribSummary = getUserContributionSummary(currentUser.id);
  const [activeTab, setActiveTab] = React.useState<'deliverables' | 'capacity_schedule' | 'impact_recognition' | 'analytics' | 'all'>('deliverables');
  const [clarificationReplies, setClarificationReplies] = React.useState<Record<string, string>>({});

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

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => openReportModal(currentUser.id)}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-border bg-surface-elevated text-text-primary hover:bg-surface-hover hover:border-brand-primary/40 cursor-pointer shadow-xs"
            title="Generate your personal PDF performance dossier"
          >
            <FileDown className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>My PDF Report</span>
          </button>
          <button
            onClick={() => openLogDeliveryImpactModal()}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer shadow-xs"
            title="Log delivery impediment or deadline delay factor"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Delivery Risk</span>
          </button>
          <button
            onClick={() => openLogContributionModal()}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-border bg-surface-elevated hover:bg-surface text-text-primary cursor-pointer shadow-xs"
          >
            <Award className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Record Contribution</span>
          </button>
          <button
            onClick={() => setActiveView('my_work')}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Operating Date Horizon Filter */}
      <HomeDateFilterBar
        period={homeCalendarPeriod}
        onPeriodChange={setHomeCalendarPeriod}
        customRange={homeCustomDateRange}
        onCustomRangeChange={setHomeCustomDateRange}
        matchedCount={periodMyJobs.length}
        archivedCount={periodMyArchived.length}
        totalCount={myJobs.length}
        label="My Operating Period"
      />

      {/* Workspace Lens Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border overflow-x-auto text-xs">
        {[
          { id: 'deliverables', label: 'My Deliverables', icon: Target, badge: `${myActiveJobs.length} Active` },
          { id: 'capacity_schedule', label: 'Capacity & Schedule', icon: BarChart3, badge: '40h Universal' },
          { id: 'impact_recognition', label: 'Impact & Recognition', icon: Award, badge: `${contribSummary.verifiedCount} Verified` },
          { id: 'analytics', label: 'Personal Analytics', icon: Activity },
          { id: 'all', label: 'All Sections', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                isActive
                  ? 'bg-surface-elevated text-text-primary border border-border shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand' : 'text-text-tertiary'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-brand/10 text-brand' : 'bg-surface text-text-tertiary'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY DELIVERABLES */}
      {(activeTab === 'deliverables' || activeTab === 'all') && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Clean Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Deliverables in Scope */}
          <SpotlightCard className="p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-text-primary">
                {activePeriodCount}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Active in Period
              </div>
              <div className="text-[11px] mt-0.5 text-text-tertiary">
                {activePeriodCount === 0 ? 'All clear in this period' : `${activePeriodCount} active task${activePeriodCount > 1 ? 's' : ''}`}
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: In Progress */}
          <SpotlightCard className="p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                {inProgressCount}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                In Progress
              </div>
              <div className="text-[11px] mt-0.5 text-text-tertiary">
                Active project deliverables
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Awaiting Input / Blocked */}
          <SpotlightCard className="p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
                {blockedCount}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}
              >
                <Hourglass className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Waiting on Feedback
              </div>
              <div className="text-[11px] mt-0.5 text-text-tertiary">
                Pending client or peer review
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Completed */}
          <SpotlightCard className="p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-success)' }}>
                {completedCount}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Completed
              </div>
              <div className="text-[11px] mt-0.5 text-text-tertiary">
                Finished this cycle
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Called Upon Sessions: Debriefs, Brainstorms & Creative Alignment */}
        {(calledDebriefJobs.length > 0 || calledBrainstormJobs.length > 0 || alignmentReviewJobs.length > 0) && (
          <div className="space-y-3.5 p-5 rounded-2xl border border-border bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-text-primary">
                  Called Stakeholder Sessions &amp; Calendar Invites
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-medium">
                Synced with Calendar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Debrief Meetings */}
              {calledDebriefJobs.map((job) => (
                <div
                  key={`debrief-${job.id}`}
                  className="p-3.5 rounded-xl border border-border bg-surface space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Called to Debrief Meeting
                    </span>
                    <span className="text-[11px] font-mono text-text-tertiary">{job.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Client: <strong>{job.requestor}</strong> • Time: <strong>{job.debriefMeeting?.calendarEventTime || 'Today at 2:00 PM'}</strong>
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-elevated border border-border text-[11px] space-y-0.5">
                    <div className="text-text-tertiary">
                      Called by: <strong className="text-text-primary">{job.debriefMeeting?.calledByName || 'Traffic Lead Kwame Mensah'}</strong>
                    </div>
                    <div className="font-semibold" style={{ color: 'var(--color-brand)' }}>
                      Compulsory CS Submitter: {job.debriefMeeting?.compulsoryCsSubmitterName || 'Client Services Lead'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDebriefJob(job)}
                    className="w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-brand-contrast)'
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Debrief Pack &amp; Agenda</span>
                  </button>
                </div>
              ))}

              {/* Creative Brainstorm & Strategy Sessions */}
              {calledBrainstormJobs.map((job) => (
                <div
                  key={`brainstorm-${job.id}`}
                  className="p-3.5 rounded-xl border border-border bg-surface space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-strategic)' }}
                    >
                      Creative Strategy &amp; Brainstorm
                    </span>
                    <span className="text-[11px] font-mono text-text-tertiary">{job.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Scope: <strong>{job.estimatedHours}h</strong> • Figure out creative approach with squad
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-surface-elevated border border-border text-[11px] text-text-secondary">
                    Same debrief squad (Compulsory CS + CD + Creative ICs) aligning on creative angle before production starts.
                  </div>

                  <button
                    onClick={() => setSelectedBrainstormJob(job)}
                    className="w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-brand-contrast)'
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Join Strategy Brainstorm</span>
                  </button>
                </div>
              ))}

              {/* Internal Creative Alignment Sessions */}
              {alignmentReviewJobs.map((job) => (
                <div
                  key={`align-${job.id}`}
                  className="p-3.5 rounded-xl border border-border bg-surface space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary"
                    >
                      Creative Alignment Review (Live Sync)
                    </span>
                    <span className="text-[11px] font-mono text-text-tertiary">{job.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary leading-snug">{job.title}</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Director/Senior review: Live meeting to bounce ideas and codify revisions together.
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReviewJob(job)}
                    className="w-full py-1.5 px-3 rounded-lg border border-border bg-surface-elevated hover:bg-surface text-text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                    <span>View Alignment Session Notes</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Active Logged Delivery Impediments & Deadline Risks */}
        {(() => {
          const myDeliveryImpacts = deliveryImpactLogs.filter(
            (l) => l.loggedByUserId === currentUser.id || myJobs.some((j) => j.id === l.jobId)
          );
          if (myDeliveryImpacts.length === 0) return null;
          const activeCount = myDeliveryImpacts.filter((l) => l.status === 'active' || l.status === 'acknowledged').length;
          return (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-text-primary">
                    My Logged Delivery Impediments ({myDeliveryImpacts.length})
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[11px] font-mono font-bold text-amber-500">
                      · {activeCount} Active
                    </span>
                  )}
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
                  <div
                    key={imp.id}
                    className="p-3 rounded-lg bg-surface border border-border/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-text-primary flex items-center gap-1.5 truncate">
                        <span>{imp.jobId ? `${imp.jobId} · ` : ''}{imp.jobTitle || 'Impediment'}</span>
                      </span>
                      <span
                        className={`text-[11px] font-mono uppercase font-bold tracking-wider ${
                          imp.status === 'resolved' || imp.status === 'mitigated'
                            ? 'text-emerald-500'
                            : imp.status === 'acknowledged'
                            ? 'text-blue-400'
                            : 'text-amber-500'
                        }`}
                      >
                        {imp.status === 'acknowledged' ? 'Acknowledged' : imp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                      {imp.impactDescription}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        +{imp.estimatedDelayHours || imp.estimatedDelayDays * 8}h extension ({imp.estimatedDelayDays}d)
                      </span>
                      {imp.proposedRevisedDueDate && (
                        <span>Proposed: {new Date(imp.proposedRevisedDueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {imp.acknowledgedBy && (
                      <div className="text-[10px] text-text-tertiary italic">
                        Lead Review: {imp.acknowledgedBy} {imp.resolutionNotes ? `("${imp.resolutionNotes}")` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Section: Today's Focus & Active Deliverables */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h2 className="text-sm font-bold text-text-primary">
                My Active Deliverables
              </h2>
            </div>
            <button
              onClick={() => setActiveView('my_work')}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--color-brand)' }}
            >
              <span>View all in My Work</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Tasks using the Spotlight Highlight */}
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
                    : 'Switch operating period or create a new task to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* TAB 2: CAPACITY & SCHEDULE */}
    {(activeTab === 'capacity_schedule' || activeTab === 'all') && (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Supportive Workload Balance Card */}
          <SpotlightCard className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand" />
                  <h2 className="text-sm font-bold text-text-primary">
                    Universal 40h Baseline & Workload Balance
                  </h2>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Your deliverable allocation is scheduled at <strong className="text-text-primary font-semibold">36 hours</strong> against the universal <strong className="text-text-primary font-semibold">40.0-hour</strong> weekly baseline. All hours beyond 40.0 are tracked as overtime with compensatory recognition.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveView('team_traffic')}
                  className="px-3.5 py-1.5 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-brand" />
                  <span>Team Bandwidth</span>
                </button>
              </div>
            </div>
          </SpotlightCard>

          {/* Operational Capacity & Pressure */}
          <SpotlightCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <h2 className="text-xs font-bold text-text-primary">
                  Personal 40-Hour Capacity Ratio
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-500">
                Healthy Buffer (4h reserve)
              </span>
            </div>

            <CapacityMeter
              percent={90}
              hoursCommitted={36}
              hoursContracted={40}
              label="Standard 40-Hour Capacity"
              showLegend
            />
          </SpotlightCard>
        </div>
      </div>
    )}

    {/* TAB 3: IMPACT & RECOGNITION */}
    {(activeTab === 'impact_recognition' || activeTab === 'all') && (
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Strategic Recognition & Verified Impact */}
        <SpotlightCard className="p-5 space-y-4 border-brand-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-primary/15 text-brand-primary flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>Strategic Recognition</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-[11px] font-mono text-brand-primary font-bold uppercase tracking-wider">
                      Verified Impact
                    </span>
                  </h2>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Your contribution is visible: a verified record of impact, ownership, collaboration, and craft excellence across Tibule.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => openLogContributionModal()}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:opacity-95"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)',
                  borderColor: 'var(--color-brand)'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Contribution</span>
              </button>
              <button
                onClick={() => setActiveView('evidence')}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-tertiary/50 hover:bg-surface-tertiary text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>My Evidence</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Clarification Alert Banner (if manager requested details) */}
          {contribSummary.clarificationCount > 0 && (
            <div
              className="p-3.5 rounded-xl border text-xs space-y-2 animate-fade-in"
              style={{
                backgroundColor: 'var(--color-warning-muted)',
                borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
              }}
            >
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-warning)' }}>
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Clarification Requested on {contribSummary.clarificationCount} Contribution(s)</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Your manager asked for specific details on your submitted evidence before finalizing verification.
              </p>
              {contribSummary.contributions
                .filter((c) => c.status === 'CLARIFICATION_REQUIRED')
                .map((c) => {
                  const latestClarification = c.clarifications?.[0];
                  return (
                    <div key={c.id} className="p-3 rounded-lg bg-surface border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary text-xs">"{c.title}"</span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-warning)' }}>
                          Question from {latestClarification?.requestedByName}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary italic bg-surface-elevated p-2 rounded border border-border">
                        &ldquo;{latestClarification?.question}&rdquo;
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={clarificationReplies[c.id] || ''}
                          onChange={(e) => setClarificationReplies((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder="Provide the requested impact details..."
                          className="flex-1 px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                        />
                        <button
                          onClick={() => {
                            const reply = clarificationReplies[c.id];
                            if (reply?.trim()) {
                              respondToClarification(c.id, reply.trim());
                              setClarificationReplies((prev) => ({ ...prev, [c.id]: '' }));
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }}
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit Reply</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Contribution Portfolio Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary">Verified</div>
              <div className="text-lg font-bold font-mono mt-0.5" style={{ color: 'var(--color-success)' }}>
                {contribSummary.verifiedCount}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">of {contribSummary.totalContributions} logged</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5" style={{ color: 'var(--color-brand)' }} />
                <span>Delivery</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
                {contribSummary.byCategory.exceptional_delivery}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Milestone rescue</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" style={{ color: 'var(--color-success)' }} />
                <span>Client</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
                {contribSummary.byCategory.client_impact}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Protected SLA</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <HeartHandshake className="w-2.5 h-2.5 text-text-secondary" />
                <span>Collab</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
                {contribSummary.byCategory.collaboration}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Cross-team help</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <Award className="w-2.5 h-2.5" style={{ color: 'var(--color-brand)' }} />
                <span>Craft</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
                {contribSummary.byCategory.craft_quality}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Quality bar</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-text-secondary" />
                <span>Process</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-primary mt-0.5">
                {contribSummary.byCategory.process_improvement}
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Automations</div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                <Flame className="w-2.5 h-2.5" style={{ color: 'var(--color-critical)' }} />
                <span>Effort Context</span>
              </div>
              <div className="text-lg font-bold font-mono text-text-secondary mt-0.5">
                {contribSummary.exceptionalEffortHours} <span className="text-[10px]">hrs</span>
              </div>
              <div className="text-[9px] text-text-tertiary mt-0.5">Extra crunch effort</div>
            </div>
          </div>

          {/* Recent Contributions List */}
          {contribSummary.contributions.length > 0 ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                <span>Recent Contribution Evidence</span>
                <span className="text-[10px] text-text-tertiary lowercase font-normal">
                  {contribSummary.recognisedCount} recognised with commendations
                </span>
              </div>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {contribSummary.contributions.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-surface border border-border hover:border-brand-primary/30 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-text-primary">
                          {c.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-tertiary text-text-secondary border border-border capitalize">
                          {c.category.replace('_', ' ')}
                        </span>
                        {c.relatedJobTitle && (
                          <span className="text-[10px] text-text-tertiary truncate max-w-xs font-mono">
                            [{c.relatedJobId}] {c.relatedJobTitle}
                          </span>
                        )}
                        <span className="text-[10px] text-text-tertiary font-mono">
                          {c.contributionDate}
                        </span>
                      </div>

                      <p className="text-[11px] text-text-secondary leading-snug">
                        {c.description}
                      </p>

                      <div className="text-[11px] text-text-primary bg-surface-tertiary/40 px-2.5 py-1 rounded-md border border-border/50">
                        <strong className="text-brand-primary font-semibold">Impact: </strong>
                        <span>{c.impactStatement}</span>
                      </div>

                      {c.recognitionNote && (
                        <div
                          className="text-[11px] p-2 rounded-md border italic"
                          style={{
                            backgroundColor: 'var(--color-success-muted)',
                            borderColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)',
                            color: 'var(--color-success)'
                          }}
                        >
                          &ldquo;{c.recognitionNote}&rdquo; - {c.recognisedByName || c.verifiedByName || 'Leadership'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start shrink-0 pt-0.5">
                      {c.status === 'RECOGNISED' && (
                        <span
                          className="text-[11px] font-mono font-bold flex items-center gap-1"
                          style={{ color: 'var(--color-success)' }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recognised</span>
                        </span>
                      )}
                      {c.status === 'VERIFIED' && (
                        <span
                          className="text-[11px] font-mono font-medium flex items-center gap-1"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                      {c.status === 'SUBMITTED' && (
                        <span className="text-[11px] font-mono font-medium text-text-tertiary">
                          In Review
                        </span>
                      )}
                      {c.status === 'CLARIFICATION_REQUIRED' && (
                        <span
                          className="text-[11px] font-mono font-medium flex items-center gap-1"
                          style={{ color: 'var(--color-warning)' }}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Clarification Needed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-text-tertiary bg-surface-elevated/40 rounded-xl border border-dashed border-border">
              <Award className="w-6 h-6 text-text-tertiary mx-auto mb-1.5 opacity-60" />
              <p className="font-medium text-text-secondary">No contributions recorded yet</p>
              <p className="text-[11px] mt-0.5">Solved a delivery problem, assisted a peer, or automated a workflow? Record your verified contribution.</p>
            </div>
          )}
        </SpotlightCard>
      </div>
    )}

    {/* TAB 4: VISUAL ANALYTICS */}
    {(activeTab === 'analytics' || activeTab === 'all') && (
      <div className="space-y-6 animate-in fade-in duration-150">
        <VisualAnalyticsWidget
          scope="employee"
          employeeId={currentUser.id}
          title={`My Workload & Delivery Visual Analytics: ${firstName}`}
          subtitle="Your personal deliverable hours distribution, quoting accuracy, and audited operational performance pillars."
        />
      </div>
    )}

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
