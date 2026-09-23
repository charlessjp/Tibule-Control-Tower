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
  FileDown
} from 'lucide-react';
import controlTowerBannerImg from '../../assets/images/control_tower_banner_1789471153509.jpg';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    jobs,
    selectedJobId,
    setSelectedJobId,
    setActiveView,
    setShowBuildCaseModal,
    openLogOvertimeModal,
    getUserOvertimeSummary,
    openReportModal
  } = useApp();

  const firstName = currentUser.name.split(' ')[0] || 'Sarah';
  const overtimeSummary = getUserOvertimeSummary(currentUser.id);

  // My active deliverables
  const myJobs = jobs.filter((j) => j.assigneeId === currentUser.id);
  const myActiveJobs = myJobs.filter((j) => j.status !== 'completed');

  // Counts
  const inProgressCount = myJobs.filter((j) => j.status === 'in_progress').length;
  const blockedCount = myJobs.filter((j) => j.status === 'blocked').length;
  const completedCount = myJobs.filter((j) => j.status === 'completed').length;

  return (
    <div id="employee-dashboard-container" className="flex flex-col xl:flex-row gap-6 pb-12">
      {/* ========================================================
          LEFT / MAIN WORKSPACE AREA
      ======================================================== */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Friendly Top Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Good morning, {firstName}.
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-text-tertiary">
              Here is your daily task overview and team workload balance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openReportModal(currentUser.id)}
              className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer shadow-xs"
              title="Generate your personal PDF performance dossier"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-500" />
              <span>My PDF Report</span>
            </button>
            <button
              onClick={() => openLogOvertimeModal()}
              className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Log Overtime</span>
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

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Due Today */}
          <SpotlightCard className="p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-text-primary">
                0
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
                Due Today
              </div>
              <div className="text-[11px] mt-0.5 text-text-tertiary">
                All clear for today
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
              <span className="text-2xl font-bold font-mono text-amber-500">
                {blockedCount}
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
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
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {completedCount}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
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

        {/* Supportive Workload Balance Card */}
        <SpotlightCard className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h2 className="text-sm font-bold text-text-primary">
                  Weekly Schedule &amp; Workload Balance
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                You have <strong className="text-text-primary">44 hours</strong> scheduled
                this week against your <strong className="text-text-primary">38-hour</strong> weekly baseline.
                Your deliverables are in good health. If you feel any strain or need to reassign a task, your team is ready to support you.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveView('team_traffic')}
                className="px-3.5 py-2 rounded-xl border border-border bg-surface-elevated hover:bg-surface text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>View Team Workload</span>
              </button>
            </div>
          </div>
        </SpotlightCard>

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
            {myActiveJobs.map((job) => (
              <SpotlightTaskRow
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                onClick={() => setSelectedJobId(job.id)}
              />
            ))}
          </div>
        </div>

        {/* Dedicated Overtime & Good Books Ledger */}
        <SpotlightCard className="p-5 space-y-4 border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>Good Books Material · Overtime Ledger</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Standard: 9:00 AM – 5:00 PM
                    </span>
                  </h2>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Verified hours logged before 9 AM or after 5 PM count towards your career progression and senior reviews.
              </p>
            </div>
            <button
              onClick={() => openLogOvertimeModal()}
              className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Log Task Overtime</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
              <div className="text-[10px] uppercase font-mono text-text-tertiary">Total Overtime</div>
              <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">
                {overtimeSummary.totalHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
              </div>
              <div className="text-[10px] text-text-tertiary mt-1">{overtimeSummary.count} entries logged</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1">
                <Sunrise className="w-3 h-3 text-amber-500" />
                <span>Pre-9:00 AM</span>
              </div>
              <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                {overtimeSummary.pre9amHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
              </div>
              <div className="text-[10px] text-text-tertiary mt-1">Dawn patrol</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1">
                <Sunset className="w-3 h-3 text-indigo-500" />
                <span>Post-5:00 PM</span>
              </div>
              <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                {overtimeSummary.post5pmHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
              </div>
              <div className="text-[10px] text-text-tertiary mt-1">Evening crunch</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
              <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Good Books Pts</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">
                +{overtimeSummary.goodBooksPoints}
              </div>
              <div className="text-[10px] text-text-tertiary mt-1">
                {overtimeSummary.acknowledgedCount} endorsed by mgmt
              </div>
            </div>
          </div>

          {/* Recent Overtime Logs List */}
          {overtimeSummary.logs.length > 0 ? (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Recent Overtime Evidence
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {overtimeSummary.logs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-text-primary">
                          [{log.jobId}] {log.jobTitle}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {log.period === 'pre_9am' ? 'Pre-9 AM' : log.period === 'post_5pm' ? 'Post-5 PM' : 'Weekend'} ({log.hoursLogged}h)
                        </span>
                        <span className="text-[10px] text-text-tertiary font-mono">
                          {log.date} · {log.startTime}–{log.endTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary italic line-clamp-1">
                        &ldquo;{log.materialNote}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        +{log.goodBooksPoints} pts
                      </span>
                      {log.status === 'pending_acknowledgment' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-surface-elevated text-text-tertiary border border-border">
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Endorsed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-text-tertiary">
              No overtime entries logged yet. Working early or late? Log your material contribution to add to your Good Books.
            </div>
          )}
        </SpotlightCard>

        {/* Quick Actions (Employee Friendly) */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-text-primary">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => openLogOvertimeModal()}
              className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10 text-left flex items-center gap-3 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Log Dedicated Overtime
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Pre-9 AM or Post-5 PM work
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveView('my_work')}
              className="p-4 rounded-xl border border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated text-left flex items-center gap-3 transition-all duration-200 cursor-pointer group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Create Work Request
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Add a new deliverable or subtask
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowBuildCaseModal(true)}
              className="p-4 rounded-xl border border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated text-left flex items-center gap-3 transition-all duration-200 cursor-pointer group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Record Achievement
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Log positive feedback or milestone
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('team_traffic')}
              className="p-4 rounded-xl border border-border bg-surface hover:border-[var(--color-brand)]/50 hover:bg-surface-elevated text-left flex items-center gap-3 transition-all duration-200 cursor-pointer group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Request Workload Review
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Balance hours with your manager
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Atmospheric Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-border h-28 flex items-center justify-between px-8 text-white shadow-md">
          <img
            src={controlTowerBannerImg}
            alt="Tibule Mountain Panorama"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
          <div className="relative z-10 space-y-1">
            <div className="text-xs text-text-tertiary uppercase font-mono tracking-wider">
              Tibule Workplace
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white">
              Clearer work. A stronger tomorrow.
            </div>
          </div>
          <div className="relative z-10 text-right hidden md:block">
            <p className="text-xs font-serif italic text-text-secondary">
              &ldquo;A well managed day creates a well built future.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Team Pulse & Helpful Context
      ======================================================== */}
      <div className="w-full xl:w-80 shrink-0 space-y-6">
        {/* Date & Quote Header */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-text-tertiary">
            Thursday, 10 September 2026
          </div>
          <div className="text-xl font-serif italic leading-tight text-text-primary">
            &ldquo;Progress takes focus.&rdquo;
          </div>
          <div className="w-10 h-0.5 rounded-full mt-2" style={{ backgroundColor: 'var(--color-brand)' }} />
        </div>

        {/* Team Pulse Card */}
        <SpotlightCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h2 className="text-xs font-bold text-text-primary">
                Operational Capacity &amp; Pressure
              </h2>
            </div>
            <button
              onClick={() => setActiveView('team_traffic')}
              className="text-xs flex items-center gap-1 cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
            >
              <span>Creative Team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <CapacityMeter
            percent={72}
            hoursCommitted={152}
            hoursContracted={210}
            label="Team Load Ratio"
            showLegend
          />
        </SpotlightCard>

        {/* Recent Activity / Updates */}
        <div className="p-5 rounded-2xl border border-border bg-surface space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text-primary">
              Recent Updates
            </h2>
            <span className="text-[10px] font-mono text-text-tertiary">
              Live
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-text-secondary">
                  <strong className="text-text-primary">Alex Rivera</strong> submitted Q3 Brand Assets for review.
                </p>
                <span className="text-[10px] text-text-tertiary">
                  15 minutes ago
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
              <div>
                <p className="text-text-secondary">
                  Workload rebalanced on <strong className="text-text-primary">Kalahari Solar</strong>.
                </p>
                <span className="text-[10px] text-text-tertiary">
                  1 hour ago
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
              <div>
                <p className="text-text-secondary">
                  Approval requested on <strong className="text-text-primary">Zenith Brand Guidelines</strong>.
                </p>
                <span className="text-[10px] text-text-tertiary">
                  2 hours ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
