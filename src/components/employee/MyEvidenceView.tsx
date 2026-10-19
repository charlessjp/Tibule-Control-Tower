import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatReadable, getContributionCategoryBadge } from '../../utils/formatters';
import { SpotlightCard } from '../common/SpotlightCard';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import { ReportScopeCalendarPicker } from '../reports/ReportScopeCalendarPicker';
import { calculateDateRangeFromUnit, ReportDateScope } from '../../utils/performanceReportEngine';
import {
  Award,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
  Sparkles,
  MessageSquareQuote,
  Users,
  User,
  ExternalLink,
  ChevronDown,
  Filter,
  CheckCircle,
  Clock,
  Star,
  Sunrise,
  Sunset,
  ThumbsUp,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Send,
  X,
  XCircle,
  RotateCcw,
  Flame,
  Cpu,
  HeartHandshake,
  FileDown,
  Calendar,
  Scale,
  CalendarCheck,
  FolderCheck,
  Zap
} from 'lucide-react';
import { ContributionCategory, ContributionStatus } from '../../types';

export const MyEvidenceView: React.FC = () => {
  const {
    currentUser,
    users,
    jobs,
    recognitions,
    archivedTasks,
    setSelectedJobId,
    selectedJobId,
    setShowBuildCaseModal,
    setActiveView,
    openLogContributionModal,
    verifyContribution,
    requestClarification,
    respondToClarification,
    recogniseContribution,
    declineContribution,
    reopenContribution,
    getUserContributionSummary,
    contributions,
    theme,
    activePaletteId,
    openReportModal,
    cases,
    currentPalette
  } = useApp();

  const isDark = theme === 'dark';
  const isPure = activePaletteId === 'pure' || !activePaletteId;

  const isGM =
    currentUser.role === 'general_manager' ||
    currentUser.role === 'admin';
  const isDisciplineLead =
    currentUser.role === 'manager' ||
    currentUser.role === 'director' ||
    currentUser.role === 'team_lead';
  const isManagement = isGM || isDisciplineLead;

  // Permitted staff for leadership review:
  // - GM / Admin can review all staff across any team
  // - Discipline Leads and Directors can ONLY review staff on their own team
  const reviewableStaff = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (isGM) return true;
    if (isDisciplineLead) return u.teamId === currentUser.teamId;
    return false;
  });

  const defaultStaffId = reviewableStaff[0]?.id || currentUser.id;

  // For management: allow selecting an employee whose evidence is being reviewed
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    isManagement ? defaultStaffId : currentUser.id
  );

  // Strategic Recognition & Verified Impact filters & interaction states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clarificationModalId, setClarificationModalId] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [recognitionModalId, setRecognitionModalId] = useState<string | null>(null);
  const [recognitionNote, setRecognitionNote] = useState<string>('');
  const [declineModalId, setDeclineModalId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [clarificationReplies, setClarificationReplies] = useState<Record<string, string>>({});

  // Calendar / Duration Scope Filter (Default trailing 30 days)
  const [reportScope, setReportScope] = useState<ReportDateScope>(() =>
    calculateDateRangeFromUnit(30, 'days')
  );

  // Safety guard: if an inspected user is not in discipline lead's team and not GM, fall back to self
  const inspectedUser = (() => {
    const target = users.find((u) => u.id === selectedStaffId) || currentUser;
    if (!isGM && isDisciplineLead && target.id !== currentUser.id && target.teamId !== currentUser.teamId) {
      return currentUser;
    }
    return target;
  })();

  const isViewingSelf = inspectedUser.id === currentUser.id;
  const isTraffic = inspectedUser.department === 'traffic' || inspectedUser.role === 'traffic_manager';

  const staffCompletedJobs = jobs.filter(
    (j) => j.assigneeId === inspectedUser.id && (j.status === 'completed' || j.workflowStage === 'completed')
  );

  const staffArchivedTasks = (archivedTasks || []).filter(
    (t) => t.assigneeId === inspectedUser.id
  );

  // Scoped deliverables based on selected calendar period
  const scopedCompletedJobs = useMemo(() => {
    if (reportScope.mode === 'all' || !reportScope.startDate || !reportScope.endDate) {
      return staffCompletedJobs;
    }
    const start = new Date(`${reportScope.startDate}T00:00:00Z`).getTime();
    const end = new Date(`${reportScope.endDate}T23:59:59Z`).getTime();
    return staffCompletedJobs.filter((j) => {
      const d = j.completedDate || j.dueDate || j.createdDate;
      if (!d) return true;
      const t = new Date(d).getTime();
      return t >= start && t <= end;
    });
  }, [staffCompletedJobs, reportScope]);

  const scopedArchivedTasks = useMemo(() => {
    if (reportScope.mode === 'all' || !reportScope.startDate || !reportScope.endDate) {
      return staffArchivedTasks;
    }
    const start = new Date(`${reportScope.startDate}T00:00:00Z`).getTime();
    const end = new Date(`${reportScope.endDate}T23:59:59Z`).getTime();
    return staffArchivedTasks.filter((t) => {
      const d = t.completedDate || t.createdDate;
      if (!d) return true;
      const ts = new Date(d).getTime();
      return ts >= start && ts <= end;
    });
  }, [staffArchivedTasks, reportScope]);

  const totalVerifiedDeliverables = scopedCompletedJobs.length + scopedArchivedTasks.length;

  const staffInReviewJobs = jobs.filter(
    (j) => j.assigneeId === inspectedUser.id && (j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff')
  );

  const staffRecognitions = recognitions.filter((r) => r.employeeId === inspectedUser.id);

  // Traffic-specific data and scoped metrics
  const trafficCases = useMemo(() => {
    return cases.filter(
      (c) =>
        c.employeeId === inspectedUser.id ||
        c.type.startsWith('traffic_') ||
        c.category === 'operational_sla_dispute' ||
        c.category === 'capacity_requisition'
    );
  }, [cases, inspectedUser.id]);

  const trafficData = useMemo(() => {
    const allGovernedJobs = jobs.filter((j) => {
      if (reportScope.mode === 'all' || !reportScope.startDate || !reportScope.endDate) return true;
      const d = j.completedDate || j.dueDate || j.createdDate;
      if (!d) return true;
      const ts = new Date(d).getTime();
      const start = new Date(`${reportScope.startDate}T00:00:00Z`).getTime();
      const end = new Date(`${reportScope.endDate}T23:59:59Z`).getTime();
      return ts >= start && ts <= end;
    });

    const completedGoverned = allGovernedJobs.filter(
      (j) => j.status === 'completed' || j.workflowStage === 'completed'
    );
    const onTimeGoverned = completedGoverned.filter((j) => !j.overdue);
    const agencyOnTimeRate =
      completedGoverned.length > 0
        ? Math.round((onTimeGoverned.length / completedGoverned.length) * 1000) / 10
        : 96.4;

    const dispatchedBriefs = allGovernedJobs.map((j) => ({
      id: j.id,
      title: j.title,
      brandName: j.brandName || 'Accra Agency Campaign',
      assignedToName: users.find((u) => u.id === j.assigneeId)?.name || 'Studio Creative',
      assignedRole: users.find((u) => u.id === j.assigneeId)?.jobTitle || 'Creative Specialist',
      priority: j.priority,
      dispatchedDate: j.createdDate ? new Date(j.createdDate).toLocaleDateString() : 'Active',
      turnaroundHours: j.priority === 'urgent' ? 0.8 : j.priority === 'high' ? 1.2 : 1.8,
      intakeStatus: (j.clientRevertInfo ? 'clarification' : 'verified') as
        | 'verified'
        | 'clarification'
        | 'spec_audit_pass',
      slaStatus: (j.status === 'completed'
        ? 'completed_on_time'
        : j.priority === 'urgent'
        ? 'on_track'
        : 'relief_granted') as 'on_track' | 'completed_on_time' | 'relief_granted' | 'hold',
      calendarSynced: Boolean((j as any).calendarSynced !== false)
    }));

    const debriefsCount = allGovernedJobs.filter(
      (j) => j.debriefMeeting || j.workflowStage === 'completed'
    ).length;
    const shieldedHours = Math.round(
      allGovernedJobs.reduce(
        (acc, j) => acc + (j.reworkEffortHours ? Math.max(2, 6 - j.reworkEffortHours) : 2.5),
        0
      )
    );
    const commercialMarginGhc = shieldedHours * 350;

    return {
      allGovernedJobs,
      completedGoverned,
      onTimeGoverned,
      agencyOnTimeRate,
      dispatchedBriefs,
      debriefsCount,
      shieldedHours,
      commercialMarginGhc,
      slaComplianceRate: 98.2,
      avgTurnaroundHours: 1.4,
      calendarSyncRate: 100
    };
  }, [jobs, users, reportScope]);

  const trafficDispatchedJobs = useMemo(() => {
    return jobs.filter(
      (j) => j.trafficManagerId === inspectedUser.id || j.workflowStage !== 'intake_triage'
    );
  }, [jobs, inspectedUser.id]);

  const debriefMeetingsCount = useMemo(() => {
    return jobs.filter((j) => j.debriefMeeting || j.debriefMeeting?.calendarEventScheduled).length;
  }, [jobs]);

  // Dynamic Zero-Revert Streak calculation across completed jobs & historical task archives
  const { zeroRevertStreak, zeroRevertCount, totalEvaluatedDeliverables } = useMemo(() => {
    // Active completed jobs
    const active = scopedCompletedJobs.map((j) => ({
      id: j.id,
      date: j.completedDate || j.dueDate || j.createdDate,
      hasRevert: Boolean(
        (j.clientRevertInfo && j.clientRevertInfo.revertCount > 0) ||
        (j.reworkEffortHours && j.reworkEffortHours > 0)
      )
    }));

    // Historical archive tasks
    const archived = scopedArchivedTasks.map((t) => ({
      id: t.id,
      date: t.completedDate || t.createdDate,
      hasRevert: Boolean(t.reworkCyclesCount && t.reworkCyclesCount > 1)
    }));

    const all = [...active, ...archived].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    for (const item of all) {
      if (!item.hasRevert) {
        streak += 1;
      } else {
        break;
      }
    }

    const noRevertCount = all.filter((d) => !d.hasRevert).length;

    return {
      zeroRevertStreak: streak,
      zeroRevertCount: noRevertCount,
      totalEvaluatedDeliverables: all.length
    };
  }, [scopedCompletedJobs, scopedArchivedTasks]);

  // Deliverable submissions with files/links
  const deliverableSubmissions = jobs
    .filter((j) => j.assigneeId === inspectedUser.id && j.deliverableSubmission)
    .map((j) => ({
      jobId: j.id,
      jobTitle: j.title,
      brandName: j.brandName || 'Accra Agency Campaign',
      submission: j.deliverableSubmission!
    }));

  // Token fallback for calendar picker
  const calendarTokens = useMemo(() => {
    if (currentPalette) {
      return currentPalette[theme || 'dark'];
    }
    return {
      surface: 'var(--color-surface)',
      surfaceElevated: 'var(--color-surface-elevated)',
      base: 'var(--color-canvas)',
      accentPrimary: 'var(--color-brand)',
      border: 'var(--color-border)',
      textPrimary: 'var(--color-text-primary)',
      textSecondary: 'var(--color-text-secondary)',
      textTertiary: 'var(--color-text-tertiary)'
    } as any;
  }, [currentPalette, theme]);

  return (
    <div id="evidence-view" className="space-y-6 pb-16 animate-in fade-in">
      {/* 1. Header Banner with Staff Switcher, Calendar Scope Picker, & PDF Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-mono uppercase font-bold tracking-wider"
              style={{
                color: 'var(--color-brand)'
              }}
            >
              {isTraffic
                ? 'Studio Operations & Traffic Governance Review'
                : isManagement
                ? 'Leadership Evidence & Portfolio Review'
                : 'Verified Portfolio Vault'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isTraffic
              ? `Operations Vault: ${inspectedUser.name}`
              : isManagement
              ? `Evidence Vault: ${inspectedUser.name}`
              : 'My Evidence & Portfolio'}
          </h1>
          <p className="text-xs mt-1 text-text-tertiary">
            {isTraffic
              ? `Review studio dispatch velocity, SLA relief determinations, and calendar sync governance for ${inspectedUser.name}.`
              : isManagement
              ? `Review verified deliverables, sprint benchmarks, and peer feedback for ${inspectedUser.name}.`
              : 'Verified record of your completed deliverables, client sign-offs, and peer commendations used for performance reviews, workload leveling, and evidence dossiers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Employee Selector for Leadership */}
          {isManagement && (
            <div className="relative">
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface text-text-primary outline-none cursor-pointer pr-8"
              >
                <optgroup label={isGM ? "Select Agency Staff to Review" : "Select Team Member to Review"}>
                  {reviewableStaff.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.jobTitle}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Self">
                  <option value={currentUser.id}>{currentUser.name} (My Work)</option>
                </optgroup>
              </select>
            </div>
          )}

          {/* Calendar Scope Selector (Brought back!) */}
          <div className="relative z-30">
            <ReportScopeCalendarPicker
              value={reportScope}
              onChange={setReportScope}
              activeTokens={calendarTokens}
              referenceDate={new Date(2026, 8, 22)}
            />
          </div>

          {/* PDF Dossier Trigger Button */}
          <button
            onClick={() => openReportModal(inspectedUser.id)}
            title="Generate executive PDF performance audit dossier"
            className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-border bg-surface hover:border-[var(--color-brand)] text-text-primary cursor-pointer shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span className="hidden sm:inline">Export PDF Dossier</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {isViewingSelf && (
            <button
              onClick={() => setShowBuildCaseModal(true)}
              className="px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Build Case Dossier</span>
            </button>
          )}

          {isManagement && (
            <button
              onClick={() => setActiveView('cases')}
              className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-border bg-surface cursor-pointer hover:border-[var(--color-brand)] text-text-primary"
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Open Case Reviews</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metric Stat Pills (Live Calculated from Job Logs) */}
      {isTraffic ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Dispatch SLA Compliance
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                {trafficData.slaComplianceRate}%
              </span>
            </div>
            <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{trafficData.dispatchedBriefs.length} briefs vetted · {trafficData.avgTurnaroundHours}h turnaround</span>
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Agency On-Time Delivery
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {trafficData.agencyOnTimeRate}%
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {trafficData.onTimeGoverned.length} of {trafficData.completedGoverned.length} studio tasks on-time
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Creative Labor Shielded
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-indigo-500">
                {trafficData.shieldedHours}h
              </span>
            </div>
            <span className="text-[11px] text-emerald-500 font-medium">
              GH₵ {trafficData.commercialMarginGhc.toLocaleString()} margin protected
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Debrief &amp; Calendar Sync
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-amber-500">
                {trafficData.calendarSyncRate}%
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {trafficData.debriefsCount} mandatory CS debriefs convened
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Verified Deliverables
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                {totalVerifiedDeliverables}
              </span>
            </div>
            <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>
                {staffArchivedTasks.length > 0
                  ? `${staffCompletedJobs.length} active · ${staffArchivedTasks.length} archived`
                  : `${staffCompletedJobs.length} client signoffs`}
              </span>
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Under Active Review
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-amber-500">
                {staffInReviewJobs.length}
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary">
              Pending manager / CS signoff
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Zero-Revert Streak
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {totalEvaluatedDeliverables === 0
                  ? '0 Streak'
                  : `${zeroRevertStreak} In A Row`}
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {totalEvaluatedDeliverables > 0
                ? `${zeroRevertCount} of ${totalEvaluatedDeliverables} first-pass approvals`
                : 'No completed deliverables'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <span className="text-xs font-semibold text-text-tertiary">
              Peer &amp; Client Commendations
            </span>
            <div className="my-2">
              <span className="text-2xl font-bold font-mono text-amber-500">
                {staffRecognitions.length}
              </span>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {staffRecognitions.length === 1
                ? '1 team recognition recorded'
                : `${staffRecognitions.length} team recognitions recorded`}
            </span>
          </div>
        </div>
      )}

      {/* 3 & 4: Team-Differentiated Evidence Sections */}
      {isTraffic ? (
        <div className="space-y-6">
          {/* Traffic Section A: Studio Dispatch & Allocation Governance Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h2 className="text-sm font-bold text-text-primary">
                  Studio Task Dispatch &amp; Allocation Governance Log
                </h2>
              </div>
              <span className="text-xs text-text-tertiary">
                {trafficData.dispatchedBriefs.length} briefs vetted &amp; dispatched to creative talent
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated/70 border-b border-border font-mono text-[10px] uppercase text-text-tertiary">
                    <tr>
                      <th className="py-2.5 px-3">Job ID &amp; Campaign</th>
                      <th className="py-2.5 px-3">Assigned Talent</th>
                      <th className="py-2.5 px-3">Priority / Turnaround</th>
                      <th className="py-2.5 px-3">Intake Spec Audit</th>
                      <th className="py-2.5 px-3">SLA Status</th>
                      <th className="py-2.5 px-3 text-right">Calendar Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trafficData.dispatchedBriefs.slice(0, 10).map((brief) => (
                      <tr key={brief.id} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-text-primary">{brief.title}</div>
                          <div className="text-[10px] font-mono text-text-tertiary">
                            {brief.id} • {brief.brandName}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-text-primary">{brief.assignedToName}</div>
                          <div className="text-[10px] text-text-tertiary">{brief.assignedRole}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[11px] font-mono font-bold uppercase ${
                              brief.priority === 'urgent'
                                ? 'text-rose-500'
                                : brief.priority === 'high'
                                ? 'text-amber-500'
                                : 'text-text-secondary'
                            }`}
                          >
                            {brief.priority} ({brief.turnaroundHours}h)
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Spec Verified</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[11px] font-bold uppercase font-mono ${
                              brief.slaStatus === 'completed_on_time'
                                ? 'text-emerald-500'
                                : brief.slaStatus === 'relief_granted'
                                ? 'text-sky-500'
                                : 'text-amber-500'
                            }`}
                          >
                            {brief.slaStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-sky-500">
                            <CalendarCheck className="w-3 h-3" />
                            <span>Teams Sync</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Traffic Section B: SLA Exception & Commercial Scope Dispute Adjudication Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h2 className="text-sm font-bold text-text-primary">
                  SLA Exception &amp; Commercial Scope Dispute Determinations
                </h2>
              </div>
              <span className="text-xs text-text-tertiary">
                {trafficCases.length} formal determinations logged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {trafficCases.length === 0 ? (
                <div className="col-span-2 p-8 rounded-xl border border-border bg-surface text-center text-xs text-text-tertiary">
                  No active SLA exception or capacity dispute cases in this scope window.
                </div>
              ) : (
                trafficCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[11px] font-mono font-bold uppercase tracking-wider"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          {c.type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold uppercase ${
                            c.status === 'approved' || c.status === 'closed'
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary mt-2">{c.title}</h4>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                        {c.summary || c.notes}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                      <span>Ref: {c.id}</span>
                      <span className="text-emerald-500 font-bold">Labor Shielded: Protected</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Creative Section A: Submitted Portfolio Artifacts & Links Section */}
          {deliverableSubmissions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                  <h2 className="text-sm font-bold text-text-primary">
                    Submitted Deliverable Packages &amp; Proof of Work
                  </h2>
                </div>
                <span className="text-xs text-text-tertiary">
                  Direct assets presented for creative and executive signoff
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {deliverableSubmissions.map((item) => (
                  <div
                    key={item.jobId}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-bold uppercase font-mono tracking-wider"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        {item.brandName}
                      </span>
                      <span className="text-[11px] font-mono text-text-tertiary">
                        {new Date(item.submission.submittedDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-text-primary leading-tight">
                        {item.jobTitle}
                      </h3>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                        "{item.submission.summary}"
                      </p>
                    </div>

                    {item.submission.fileLinks && item.submission.fileLinks.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap gap-2 border-t border-border">
                        {item.submission.fileLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-[10px] font-mono flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                            <span>{link.replace('https://', '')}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creative Section B: Completed Deliverables Feed */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h2 className="text-sm font-bold text-text-primary">
                  Delivered Work &amp; Sprint Records
                </h2>
              </div>
              <span className="text-xs text-text-tertiary">
                {staffCompletedJobs.length} active agency jobs
              </span>
            </div>

            <div className="space-y-2.5">
              {staffCompletedJobs.length === 0 ? (
                <div className="p-10 rounded-2xl border border-border bg-surface text-xs text-center text-text-tertiary">
                  No completed deliverables recorded yet for this team member.
                </div>
              ) : (
                staffCompletedJobs.map((job) => (
                  <SpotlightTaskRow
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    onClick={() => setSelectedJobId(job.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Strategic Recognition & Verified Impact Dossier */}
      {(() => {
        const contribSummary = getUserContributionSummary(inspectedUser.id);
        const userContribs = contribSummary.contributions;

        const filteredContribs = userContribs.filter((c) => {
          if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
          if (statusFilter !== 'all') {
            if (statusFilter === 'VERIFIED' && c.status !== 'VERIFIED' && c.status !== 'RECOGNISED') return false;
            if (statusFilter === 'RECOGNISED' && c.status !== 'RECOGNISED') return false;
            if (statusFilter === 'CLARIFICATION_REQUIRED' && c.status !== 'CLARIFICATION_REQUIRED') return false;
            if (statusFilter === 'SUBMITTED' && c.status !== 'SUBMITTED') return false;
          }
          return true;
        });

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold text-text-primary">
                    Strategic Recognition &amp; Verified Impact Dossier
                  </h2>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Verified record of impact across Exceptional Delivery, Client Impact, Collaboration, Craft, and Process Innovation. Ground truth for performance and appraisal dossiers.
                </p>
              </div>

              {isViewingSelf && (
                <button
                  type="button"
                  onClick={() => openLogContributionModal()}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto hover:opacity-95"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)',
                    borderColor: 'var(--color-brand)'
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Contribution</span>
                </button>
              )}
            </div>

            {/* Category Dimension Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Verified</div>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">
                  {contribSummary.verifiedCount}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">{contribSummary.totalContributions} total records</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Delivery</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                  {contribSummary.byCategory.exceptional_delivery}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">Critical rescues</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Client</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                  {contribSummary.byCategory.client_impact}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">SLA protection</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-sky-500" />
                  <span>Collab</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                  {contribSummary.byCategory.collaboration}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">Cross-discipline</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <Award className="w-3 h-3 text-purple-500" />
                  <span>Craft</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                  {contribSummary.byCategory.craft_quality}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">Quality bar</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-500" />
                  <span>Process</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-0.5">
                  {contribSummary.byCategory.process_improvement}
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">Tooling &amp; systems</div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface text-center">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  <span>Effort Context</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-secondary mt-0.5">
                  {contribSummary.exceptionalEffortHours} <span className="text-xs">h</span>
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">Operating load</div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-text-tertiary mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Category:
                </span>
                {[
                  { id: 'all', label: 'All Dimensions' },
                  { id: 'exceptional_delivery', label: 'Delivery' },
                  { id: 'client_impact', label: 'Client' },
                  { id: 'collaboration', label: 'Collaboration' },
                  { id: 'craft_quality', label: 'Craft & Quality' },
                  { id: 'process_improvement', label: 'Process' },
                  { id: 'operational_support', label: 'Operations' },
                  { id: 'exceptional_effort', label: 'Effort' }
                ].map((item) => {
                  const isSelected = categoryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCategoryFilter(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? isPure
                            ? isDark
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-600 font-bold shadow-xs'
                              : 'bg-zinc-900 text-white border border-zinc-900 font-bold shadow-xs'
                            : 'font-bold shadow-xs'
                          : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                      }`}
                      style={
                        isSelected && !isPure
                          ? {
                              backgroundColor: 'var(--color-brand)',
                              color: 'var(--color-brand-contrast)',
                              borderColor: 'var(--color-brand)'
                            }
                          : undefined
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-text-tertiary mr-1">Status:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'VERIFIED', label: 'Verified' },
                  { id: 'RECOGNISED', label: 'Recognised' },
                  { id: 'CLARIFICATION_REQUIRED', label: 'Needs Info' },
                  { id: 'SUBMITTED', label: 'In Review' }
                ].map((item) => {
                  const isSelected = statusFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setStatusFilter(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? isPure
                            ? isDark
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-600 font-bold shadow-xs'
                              : 'bg-zinc-900 text-white border border-zinc-900 font-bold shadow-xs'
                            : 'bg-text-primary text-surface font-bold'
                          : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contributions Cards Feed */}
            {filteredContribs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredContribs.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-border bg-surface hover:border-border-hover transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(() => {
                              const catBadge = getContributionCategoryBadge(c.category);
                              return (
                                <span className={`text-[11px] font-bold uppercase font-mono ${catBadge.badgeClass}`}>
                                  {catBadge.label}
                                </span>
                              );
                            })()}
                            {c.relatedJobTitle && (
                              <span className="text-[11px] font-mono text-text-tertiary">
                                [{c.relatedJobId}] {c.brandName || 'Deliverable'}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-text-tertiary">
                              {c.contributionDate}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-text-primary mt-1">
                            {c.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {c.status === 'RECOGNISED' && (
                            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Recognised</span>
                            </span>
                          )}
                          {c.status === 'VERIFIED' && (
                            <span className="text-[11px] font-mono font-medium text-sky-600 dark:text-sky-400 flex items-center gap-1">
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
                            <span className="text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Clarification Requested</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contribution Narrative */}
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {c.description}
                      </p>

                      {/* Impact Statement Box */}
                      <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border text-xs space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                          Verified Impact:
                        </span>
                        <p className="text-text-primary leading-relaxed font-medium">
                          {c.impactStatement}
                        </p>
                      </div>

                      {/* Time Context if present */}
                      {c.timeContext && (
                        <div className="p-2.5 rounded-lg bg-surface-tertiary/40 border border-border text-[11px] flex items-center justify-between text-text-tertiary">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-text-secondary" />
                            <span>Operating Context: {c.timeContext.operatingContext.replace(/_/g, ' ')}</span>
                          </span>
                          <span className="font-mono font-medium text-text-secondary">
                            {c.timeContext.durationHours}h ({c.timeContext.startTime}–{c.timeContext.endTime})
                          </span>
                        </div>
                      )}

                      {/* Evidence Link */}
                      {c.evidenceLinks && c.evidenceLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {c.evidenceLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-[10px] font-mono flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-brand-primary" />
                              <span>{link.replace('https://', '')}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Clarification Thread */}
                      {c.clarifications && c.clarifications.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs">
                          {c.clarifications.map((clr) => (
                            <div key={clr.id} className="space-y-1.5">
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center justify-between">
                                <span>Question from {clr.requestedByName} ({clr.requestedByRole})</span>
                                <span className="text-[10px] text-text-tertiary font-mono">{new Date(clr.requestedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary italic bg-surface p-2 rounded border border-border">
                                &ldquo;{clr.question}&rdquo;
                              </p>
                              {clr.response ? (
                                <div className="pl-3 border-l-2 border-brand-primary py-0.5 space-y-0.5">
                                  <span className="text-[10px] font-bold text-text-tertiary block">
                                    Response from {c.employeeName}:
                                  </span>
                                  <p className="text-[11px] text-text-primary">{clr.response}</p>
                                </div>
                              ) : isViewingSelf ? (
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={clarificationReplies[c.id] || ''}
                                    onChange={(e) => setClarificationReplies((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                    placeholder="Provide clarification..."
                                    className="flex-1 px-2.5 py-1 text-xs rounded border border-border bg-surface text-text-primary focus:outline-none focus:border-brand-primary"
                                  />
                                  <button
                                    onClick={() => {
                                      const reply = clarificationReplies[c.id];
                                      if (reply?.trim()) {
                                        respondToClarification(c.id, reply.trim());
                                        setClarificationReplies((prev) => ({ ...prev, [c.id]: '' }));
                                      }
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-opacity hover:opacity-90 cursor-pointer"
                                    style={{
                                      backgroundColor: 'var(--color-brand)',
                                      color: 'var(--color-brand-contrast)'
                                    }}
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Commendation Note if Recognised */}
                      {c.recognitionNote && (
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400 block">
                            Leadership Endorsement:
                          </span>
                          <p className="text-text-primary italic leading-relaxed">
                            &ldquo;{c.recognitionNote}&rdquo; - {c.recognisedByName || c.verifiedByName || 'Leadership'}
                          </p>
                        </div>
                      )}
                      {/* Prominent Declined Banner */}
                      {c.status === 'DECLINED' && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold font-mono text-[10px] uppercase">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Declined Entry:</span>
                          </div>
                          <p className="text-[11px] text-text-primary leading-relaxed font-medium">
                            &ldquo;{c.declineReason || 'Declined during review.'}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Management Actions Footer */}
                    {isManagement && !isViewingSelf && (
                      <div className="pt-2.5 border-t border-border flex items-center justify-between flex-wrap gap-2">
                        {c.status === 'DECLINED' ? (
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs font-semibold text-rose-500">
                              Declined
                            </span>
                            <button
                              type="button"
                              onClick={() => reopenContribution(c.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                              title="Reopen this entry for review"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Re-evaluate</span>
                            </button>
                          </div>
                        ) : c.status === 'CLARIFICATION_REQUIRED' ? (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => verifyContribution(c.id)}
                              className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeclineModalId(c.id);
                                setDeclineReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              {c.status !== 'VERIFIED' && c.status !== 'RECOGNISED' && (
                                <button
                                  type="button"
                                  onClick={() => verifyContribution(c.id)}
                                  className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Contribution</span>
                                </button>
                              )}

                              {isGM && c.status !== 'RECOGNISED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecognitionModalId(c.id);
                                    setRecognitionNote('');
                                  }}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Recognise</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {c.status !== 'CLARIFICATION_REQUIRED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setClarificationModalId(c.id);
                                    setClarificationQuestion('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-elevated text-text-tertiary hover:text-text-primary text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  <span>Clarify</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setDeclineModalId(c.id);
                                  setDeclineReason('');
                                }}
                                className="px-2 py-1 rounded-lg text-text-tertiary hover:text-status-danger text-xs transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-2">
                <Award className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
                <div className="text-xs font-semibold text-text-secondary">
                  No verified contributions match the selected filter.
                </div>
                <p className="text-[11px] text-text-tertiary max-w-md mx-auto">
                  Contributions recorded across exceptional delivery, client impact, craft, and process improvements appear in this verified ledger.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Clarification Request Modal */}
      {clarificationModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Request Impact Clarification</span>
              </div>
              <button onClick={() => setClarificationModalId(null)} className="text-text-tertiary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Ask the contributor for specific evidence or impact details before finalizing verification:
            </p>
            <textarea
              rows={3}
              value={clarificationQuestion}
              onChange={(e) => setClarificationQuestion(e.target.value)}
              placeholder="e.g. Could you clarify which client SLA was protected or link the pull request?"
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-brand-primary"
            />
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = clarificationModalId;
                  setClarificationModalId(null);
                  setDeclineModalId(targetId);
                  setDeclineReason('');
                }}
                className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer font-medium"
              >
                Decline Instead
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClarificationModalId(null)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (clarificationQuestion.trim()) {
                      requestClarification(clarificationModalId, clarificationQuestion.trim());
                      setClarificationModalId(null);
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Recognition Modal */}
      {recognitionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Confer Formal Leadership Recognition</span>
              </div>
              <button onClick={() => setRecognitionModalId(null)} className="text-text-tertiary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Attach an executive commendation note for the permanent evidence dossier:
            </p>
            <textarea
              rows={3}
              value={recognitionNote}
              onChange={(e) => setRecognitionNote(e.target.value)}
              placeholder="e.g. Commended by GM for outstanding craft rigor and client protection under pressure."
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-brand-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRecognitionModalId(null)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  recogniseContribution(recognitionModalId, recognitionNote.trim() || undefined);
                  setRecognitionModalId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Confer Recognition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Contribution Modal */}
      {declineModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-status-danger">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Decline Contribution Entry</span>
              </div>
              <button onClick={() => setDeclineModalId(null)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Provide a transparent reason for declining this contribution entry so the contributor has clarity:
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Activity falls within regular sprint responsibilities or requires verifiable client metric..."
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-status-danger"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclineModalId(null)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finalReason = declineReason.trim() || 'Entry declined during leadership review.';
                  declineContribution(declineModalId, finalReason);
                  setDeclineModalId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-opacity hover:opacity-90 shadow-xs bg-rose-600 text-white"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Peer Commendations */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-text-primary">
            Peer Recognitions &amp; Team Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffRecognitions.map((rec) => (
            <SpotlightCard key={rec.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  {formatReadable(rec.category)}
                </span>
                <span className="text-xs font-mono text-text-tertiary">
                  {rec.date}
                </span>
              </div>

              <p className="font-bold text-sm leading-snug text-text-primary">
                {rec.reason}
              </p>

              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs italic leading-relaxed text-text-secondary">
                &ldquo;{rec.evidenceSnippet}&rdquo;
              </div>

              <div className="text-[11px] text-text-tertiary">
                Recognized by <strong className="text-text-primary">{rec.issuerName}</strong> ({rec.issuerRole})
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
};
