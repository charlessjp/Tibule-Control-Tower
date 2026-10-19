import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressionCase, CaseStatus, CaseDecision, CasePromptLog } from '../../types';
import { formatStatus, formatCaseType, formatReadable } from '../../utils/formatters';
import { SpotlightCard } from '../common/SpotlightCard';
import { VisualAnalyticsWidget } from '../deliverables/VisualAnalyticsWidget';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Briefcase,
  Plus,
  Scale,
  ExternalLink,
  TrendingUp,
  RotateCcw,
  Check,
  XCircle,
  Layers,
  Sparkles,
  Workflow,
  FolderArchive,
  ShieldAlert,
  AlertTriangle,
  Send,
  Bell,
  UserCheck,
  UserX,
  MessageSquare,
  History,
  CheckCheck,
  Undo2
} from 'lucide-react';

export const CasesManagementView: React.FC = () => {
  const {
    cases,
    currentUser,
    updateCaseStatus,
    setShowBuildCaseModal,
    setShowCorrectionModal,
    setSelectedJobId,
    setActiveView,
    jobs,
    archivedTasks,
    contributions,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService =
    role === 'client_service' ||
    currentUser.department === 'client_services' ||
    currentUser.teamId === 'team-client-service';
  const isDisciplineLead =
    (role === 'manager' || role === 'director' || role === 'team_lead') &&
    !isClientService;
  const isEmployee = role === 'employee' && !isClientService;

  // Filter state based on role
  const [filterMode, setFilterMode] = useState<'pending' | 'adjudication' | 'my_cases' | 'verification' | 'closed' | 'all'>('pending');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isPromptingReviewer, setIsPromptingReviewer] = useState(false);
  const [showConfirmationToast, setShowConfirmationToast] = useState<string | null>(null);

  // Compute filtered cases based on user role and active filter
  const roleCases = cases.filter((c) => {
    if (isGM) {
      if (filterMode === 'pending') return c.status !== 'closed';
      if (filterMode === 'adjudication') return c.status === 'decision';
      if (filterMode === 'verification') return c.status === 'evidence_review';
      if (filterMode === 'closed') return c.status === 'closed';
      return true;
    }
    if (isTraffic) {
      const isMyCase = c.employeeId === currentUser.id;
      const isOperational =
        c.type === 'sla_exception_ruling' ||
        c.type === 'scope_dispute' ||
        c.type === 'capacity_requisition' ||
        c.type === 'turnaround_conflict' ||
        Boolean(c.trafficImpact);

      if (filterMode === 'my_cases') return isMyCase;
      if (filterMode === 'pending') return c.status !== 'closed' && (isOperational || isMyCase);
      if (filterMode === 'verification') return c.status === 'evidence_review';
      if (filterMode === 'closed') return c.status === 'closed';
      if (filterMode === 'all') return true;
      return isMyCase || isOperational;
    }
    if (isClientService) {
      const isLead = currentUser.seniority === 'lead' || currentUser.role === 'manager';
      const isMyCase = c.employeeId === currentUser.id;
      const isAccountCase =
        c.teamId === 'team-client-service' ||
        c.type === 'scope_dispute' ||
        c.type === 'sla_exception_ruling' ||
        Boolean(c.trafficImpact);

      if (filterMode === 'my_cases') return isMyCase;
      if (filterMode === 'pending') {
        return c.status !== 'closed' && (isMyCase || (isLead && isAccountCase));
      }
      if (filterMode === 'verification') return isAccountCase && c.status === 'evidence_review';
      if (filterMode === 'closed') return (isMyCase || isAccountCase) && c.status === 'closed';
      if (filterMode === 'all') return isMyCase || isAccountCase;
      return isMyCase || (isLead && isAccountCase);
    }
    if (isDisciplineLead) {
      const isTeamCase = c.teamId === currentUser.teamId;
      if (filterMode === 'pending') return isTeamCase && (c.status === 'manager_review' || c.status === 'submitted');
      if (filterMode === 'verification') return isTeamCase && (c.status === 'evidence_review' || c.status === 'decision');
      if (filterMode === 'closed') return isTeamCase && c.status === 'closed';
      return isTeamCase;
    }
    if (isEmployee) {
      const isMyCase = c.employeeId === currentUser.id;
      if (filterMode === 'pending') return isMyCase && c.status !== 'closed';
      if (filterMode === 'closed') return isMyCase && c.status === 'closed';
      if (filterMode === 'all') return isMyCase; // Strict confidentiality: employees only ever see their own cases
      return isMyCase;
    }
    return false;
  });

  const activeCase = roleCases.find((c) => c.id === selectedCaseId) || roleCases[0] || null;

  const handleDecision = (decision: CaseDecision, nextStatus: CaseStatus, defaultText?: string) => {
    if (!activeCase) return;
    const finalRationale = decisionRationale || defaultText || `Adjudication rendered by ${currentUser.name} (${currentUser.jobTitle}): ${formatReadable(decision)}`;
    updateCaseStatus(
      activeCase.id,
      nextStatus,
      decision,
      finalRationale
    );
    setShowConfirmationToast(`Case ${activeCase.id} successfully updated: ${formatReadable(decision)}`);
    setDecisionRationale('');
    setTimeout(() => setShowConfirmationToast(null), 4000);
  };

  // Dispatch an executive nudge/prompt to a reviewer or applicant
  const handleDispatchPrompt = (
    recipientName: string,
    recipientRole: string,
    actionType: CasePromptLog['actionType'],
    customMessage?: string
  ) => {
    if (!activeCase) return;
    const msg =
      customMessage ||
      promptInput ||
      `Urgent executive reminder: Please complete pending case evaluation for ${activeCase.employeeName} (${activeCase.title}).`;
    const newPromptLog: CasePromptLog = {
      id: `prompt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      senderName: `${currentUser.name} (${currentUser.jobTitle})`,
      recipientName,
      recipientRole,
      actionType,
      message: msg
    };
    const updatedLogs = [newPromptLog, ...(activeCase.promptLogs || [])];
    updateCaseStatus(
      activeCase.id,
      activeCase.status,
      activeCase.decision,
      activeCase.decisionNotes,
      { promptLogs: updatedLogs }
    );
    setShowConfirmationToast(`Executive prompt dispatched to ${recipientName}: "${msg}"`);
    setPromptInput('');
    setIsPromptingReviewer(false);
    setTimeout(() => setShowConfirmationToast(null), 4500);
  };

  // Overturn a lead's disendorsement
  const handleOverturnDisendorsement = () => {
    if (!activeCase) return;
    const overturnReason =
      overrideNotes ||
      decisionRationale ||
      `Executive Overturn: Verified audit evidence and client delivery metrics substantiate advancement to verification. Lead reservations overruled by GM ${currentUser.name}.`;
    const newPromptLog: CasePromptLog = {
      id: `prompt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      senderName: `${currentUser.name} (General Manager)`,
      recipientName: activeCase.reviewerName || 'Discipline Lead',
      recipientRole: 'Discipline Lead',
      actionType: 'overturn_notification',
      message: `General Manager Marcus Sterling has overturned lead disendorsement on Case ${activeCase.id}: "${overturnReason}"`
    };
    const updatedLogs = [newPromptLog, ...(activeCase.promptLogs || [])];
    updateCaseStatus(
      activeCase.id,
      'evidence_review',
      undefined,
      `Lead disendorsement overturned by GM ${currentUser.name}: ${overturnReason}`,
      {
        leadEndorsementStatus: 'overturned',
        leadEndorsementNotes: `Overturned by GM ${currentUser.name}: ${overturnReason}`,
        promptLogs: updatedLogs
      }
    );
    setShowConfirmationToast(`Disendorsement overturned! Case ${activeCase.id} advanced to Evidence Verification.`);
    setOverrideNotes('');
    setDecisionRationale('');
    setTimeout(() => setShowConfirmationToast(null), 4500);
  };

  // Uphold a lead's disendorsement
  const handleUpholdDisendorsement = () => {
    if (!activeCase) return;
    const reason =
      decisionRationale ||
      overrideNotes ||
      `Lead disendorsement by ${activeCase.reviewerName || 'Lead'} upheld by GM ${currentUser.name}. Request denied at current cycle.`;
    updateCaseStatus(
      activeCase.id,
      'closed',
      'declined',
      reason,
      {
        decisionDate: new Date().toISOString()
      }
    );
    setShowConfirmationToast(`Lead disendorsement upheld. Case ${activeCase.id} sealed as Declined.`);
    setDecisionRationale('');
    setOverrideNotes('');
    setTimeout(() => setShowConfirmationToast(null), 4000);
  };

  // Certify verification and advance to adjudication stage
  const handleCertifyVerification = () => {
    if (!activeCase) return;
    const certNotes =
      decisionRationale ||
      `Deliverable metrics, linked control tower jobs, and timesheet logs certified by GM ${currentUser.name}. Verification cleared for executive adjudication.`;
    updateCaseStatus(
      activeCase.id,
      'decision',
      undefined,
      certNotes,
      {
        verificationStatus: 'verified',
        verificationDate: new Date().toISOString(),
        verificationNotes: certNotes
      }
    );
    setShowConfirmationToast(`Verification Certified! Case ${activeCase.id} unlocked in Adjudication Console for final ruling.`);
    setDecisionRationale('');
    setTimeout(() => setShowConfirmationToast(null), 4500);
  };

  // Grant executive endorsement (bypassing lead review)
  const handleGrantExecutiveEndorsement = () => {
    if (!activeCase) return;
    const notes =
      decisionRationale ||
      `Provisional executive endorsement granted by GM ${currentUser.name} (Discipline Lead review bypassed). Advanced to Evidence Verification.`;
    updateCaseStatus(
      activeCase.id,
      'evidence_review',
      undefined,
      notes,
      {
        leadEndorsementStatus: 'endorsed',
        leadEndorsedBy: `${currentUser.name} (Executive Bypass)`,
        leadEndorsementDate: new Date().toISOString(),
        leadEndorsementNotes: notes
      }
    );
    setShowConfirmationToast(`Executive endorsement granted. Case ${activeCase.id} advanced to Evidence Verification.`);
    setDecisionRationale('');
    setTimeout(() => setShowConfirmationToast(null), 4000);
  };

  // Reopen a closed case for executive appeal
  const handleReopenForAppeal = () => {
    if (!activeCase) return;
    updateCaseStatus(
      activeCase.id,
      'decision',
      undefined,
      `Case reopened for executive appeal review by General Manager ${currentUser.name}.`
    );
    setShowConfirmationToast(`Case ${activeCase.id} reopened for executive appeal adjudication.`);
    setTimeout(() => setShowConfirmationToast(null), 4000);
  };

  const workflowSteps: { id: CaseStatus; label: string }[] = [
    { id: 'draft', label: 'Draft' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'manager_review', label: 'Lead Endorsement' },
    { id: 'evidence_review', label: 'Verification' },
    { id: 'decision', label: 'GM Adjudication' },
    { id: 'closed', label: 'Completed' }
  ];

  // Resolve applicant's live job records & archived delivery logs
  const applicantActiveJobs = activeCase ? jobs.filter((j) => j.assigneeId === activeCase.employeeId) : [];
  const applicantArchivedTasks = activeCase ? archivedTasks.filter((t) => t.assigneeId === activeCase.employeeId) : [];
  const linkedJobs = activeCase?.evidenceData?.linkedJobIds
    ? jobs.filter((j) => activeCase.evidenceData.linkedJobIds.includes(j.id))
    : [];
  const applicantContributions = activeCase
    ? contributions.filter((c) => c.employeeId === activeCase.employeeId && (c.status === 'VERIFIED' || c.status === 'RECOGNISED'))
    : [];

  // 1. Live Audited Timesheet Hours & Deliverables
  const liveActiveHours = applicantActiveJobs.reduce((sum, j) => sum + (j.actualHours || 0), 0);
  const liveArchivedHours = applicantArchivedTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const liveTotalLoggedHours = liveActiveHours + liveArchivedHours;

  const liveActiveEstimated = applicantActiveJobs.reduce((sum, j) => sum + (j.estimatedHours || 0), 0);
  const liveArchivedEstimated = applicantArchivedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const liveTotalEstimated = liveActiveEstimated + liveArchivedEstimated;

  const liveTotalJobCount = applicantActiveJobs.length + applicantArchivedTasks.length;
  
  // Baseline claims from submitted snapshot
  const snapshotCount = activeCase?.evidenceData?.workVolume?.currentPeriodCount || 0;
  const snapshotHours = activeCase?.evidenceData?.workVolume?.totalHours || 0;

  // Effective metrics (live calculated from staff logs with fallback if no logs exist yet)
  const effectiveDeliverableCount = liveTotalJobCount > 0 ? liveTotalJobCount : snapshotCount;
  const effectiveTotalHours = liveTotalLoggedHours > 0 ? liveTotalLoggedHours : snapshotHours;
  const effectiveEstimatedHours = liveTotalEstimated > 0 ? liveTotalEstimated : snapshotHours;
  const liveHoursVariance = effectiveTotalHours - effectiveEstimatedHours;

  // 2. Live Complexity Calculation
  const highTierActive = applicantActiveJobs.filter((j) => j.complexity === 'high' || j.complexity === 'extreme').length;
  const highTierArchived = applicantArchivedTasks.filter((t) => t.seniority === 'senior' || t.seniority === 'lead').length;
  const highTierTotal = highTierActive + highTierArchived;
  const liveComplexityShiftPercent = effectiveDeliverableCount > 0
    ? Math.round((highTierTotal / effectiveDeliverableCount) * 100)
    : (activeCase?.evidenceData?.complexityIncreasePercent || 35);
  const effectiveComplexityShift = highTierTotal > 0
    ? liveComplexityShiftPercent
    : (activeCase?.evidenceData?.complexityIncreasePercent || 35);

  // 3. Live Responsibilities Calculation
  const originalResponsibilities = activeCase?.evidenceData?.responsibilityGrowth?.originalCount || 4;
  const baseCurrentCount = activeCase?.evidenceData?.responsibilityGrowth?.currentCount || 8;
  const liveCurrentResponsibilities = Math.max(baseCurrentCount, originalResponsibilities + applicantContributions.length);
  const liveGrowthPercent = Math.round(((liveCurrentResponsibilities - originalResponsibilities) / (originalResponsibilities || 1)) * 100);

  // Dynamic Adjudication Macro Metrics (Zero Hardcoding)
  const closedTrafficRulings = useMemo(() => {
    return cases.filter(
      (c) =>
        c.status === 'closed' &&
        (c.type === 'sla_exception_ruling' ||
          c.type === 'scope_dispute' ||
          c.type === 'capacity_requisition' ||
          c.type === 'turnaround_conflict')
    );
  }, [cases]);

  const slaReliefApprovalRate = useMemo(() => {
    if (closedTrafficRulings.length === 0) return '100%';
    const approved = closedTrafficRulings.filter(
      (c) => c.decision === 'approved' || c.decision === 'approved_with_conditions'
    ).length;
    return `${Math.round((approved / closedTrafficRulings.length) * 100)}%`;
  }, [closedTrafficRulings]);

  const avgDecisionDays = useMemo(() => {
    const closedWithDates = cases.filter(
      (c) => c.status === 'closed' && c.submissionDate && c.decisionDate
    );
    if (closedWithDates.length === 0) return '2.5 Days';
    const totalDays = closedWithDates.reduce((acc, c) => {
      const sub = new Date(c.submissionDate).getTime();
      const dec = new Date(c.decisionDate!).getTime();
      const diff = Math.max(0.5, (dec - sub) / (1000 * 3600 * 24));
      return acc + diff;
    }, 0);
    return `${(totalDays / closedWithDates.length).toFixed(1)} Days`;
  }, [cases]);

  return (
    <div id="cases-view" className="space-y-6 pb-16">
      {/* Toast Confirmation */}
      {showConfirmationToast && (
        <div
          className="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'var(--color-success-muted)',
            borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
            color: 'var(--color-success)'
          }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-success)' }} />
          <span>{showConfirmationToast}</span>
        </div>
      )}

      {/* Header Banner - Custom Title & Actions per Role */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{currentUser.name}</span>
            <span>•</span>
            <span>{currentUser.jobTitle.split('&')[0]}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mt-1 text-text-primary">
            {isGM
              ? 'Executive Case Reviews'
              : isTraffic
              ? 'Traffic Cases & Operational Adjudication'
              : isClientService
              ? 'Account Cases & Commercial Reviews'
              : isDisciplineLead
              ? 'Team Case Reviews'
              : 'My Cases & Reviews'}
          </h1>
          <p className="text-xs mt-1 max-w-3xl leading-relaxed text-text-secondary">
            {isGM
              ? 'Review and decide on operational submissions, salary adjustments, and workload appeals forwarded by team leads.'
              : isTraffic
              ? 'Submit and track Traffic operational dossiers, adjudicate SLA exception relief requests, resolve scope creep disputes, and manage emergency capacity appeals.'
              : isClientService
              ? 'Submit and monitor client scope disputes, turnaround relief waivers, and professional case dossiers backed by verified account deliverables.'
              : isDisciplineLead
              ? 'Endorse team case dossiers, merit reviews, and workload requests from your team members before sending to executive review.'
              : 'Submit and monitor workload reviews, merit cases, and operational appeals backed by verified deliverable evidence.'}
          </p>
        </div>

        {/* Action Controls for Employee, Traffic & Client Service */}
        {(isEmployee || isTraffic || isClientService) && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowBuildCaseModal(true)}
              className="px-3.5 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isTraffic
                  ? 'New Traffic Case / Ruling'
                  : isClientService
                  ? 'New Account Case / Workload Appeal'
                  : 'New Case Request'}
              </span>
            </button>
            {isTraffic && (
              <button
                onClick={() => setActiveView('traffic_archive')}
                className="px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <FolderArchive className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Task Archive &amp; OneDrive</span>
              </button>
            )}
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              Request Workload Review
            </button>
          </div>
        )}
      </div>

      {/* KPI Stat Cards for GM, Lead, and Traffic */}
      {(isGM || isDisciplineLead || isTraffic) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">
              {isTraffic ? 'Pending Operational Rulings' : isGM ? 'Pending Executive Ruling' : 'Pending Lead Endorsement'}
            </div>
            <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-warning)' }}>
              {cases.filter((c) => c.status !== 'closed' && (isTraffic ? (c.type === 'sla_exception_ruling' || c.type === 'scope_dispute' || c.type === 'capacity_requisition' || c.type === 'turnaround_conflict' || c.employeeId === currentUser.id) : (isGM || c.teamId === currentUser.teamId))).length}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">{isTraffic ? 'SLA exceptions & disputes' : 'Awaiting determination'}</div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">
              {isTraffic ? 'My Personal Cases' : 'In Evidence Verification'}
            </div>
            <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-brand)' }}>
              {isTraffic
                ? cases.filter((c) => c.employeeId === currentUser.id).length
                : cases.filter((c) => c.status === 'evidence_review').length}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">
              {isTraffic ? 'Traffic desk personal dossiers' : 'Audit log confirmation'}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">
              {isTraffic ? 'Past Determinations' : 'Adjudications Sealed (YTD)'}
            </div>
            <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-success)' }}>
              {cases.filter((c) => c.status === 'closed' && (isTraffic ? (c.employeeId === currentUser.id || c.type === 'sla_exception_ruling' || c.type === 'scope_dispute' || c.type === 'capacity_requisition' || c.type === 'turnaround_conflict') : true)).length}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Approved or resolved</div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">
              {isTraffic ? 'SLA Relief Approval Rate' : 'Avg Decision SLA'}
            </div>
            <div className="text-xl font-bold mt-1 text-text-primary">
              {isTraffic ? slaReliefApprovalRate : avgDecisionDays}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">
              {isTraffic ? 'Controlled exception variance' : 'Turnaround velocity'}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        {isTraffic && (
          <>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'pending' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'pending' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Operational Rulings ({cases.filter((c) => c.status !== 'closed' && (c.type === 'sla_exception_ruling' || c.type === 'scope_dispute' || c.type === 'capacity_requisition' || c.type === 'turnaround_conflict')).length})
            </button>
            <button
              onClick={() => setFilterMode('my_cases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'my_cases' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'my_cases' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              My Case Dossiers ({cases.filter((c) => c.employeeId === currentUser.id).length})
            </button>
            <button
              onClick={() => setFilterMode('verification')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'verification' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'verification' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              In Verification ({cases.filter((c) => c.status === 'evidence_review').length})
            </button>
            <button
              onClick={() => setFilterMode('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'closed' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'closed' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Past Determinations ({cases.filter((c) => c.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'all' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              All Agency Cases ({cases.length})
            </button>
          </>
        )}
        {isGM && (
          <>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'pending' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'pending' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              All Open Cases ({cases.filter((c) => c.status !== 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('adjudication')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'adjudication' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'adjudication' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Ready for Adjudication ({cases.filter((c) => c.status === 'decision').length})
            </button>
            <button
              onClick={() => setFilterMode('verification')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'verification' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'verification' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              In Verification ({cases.filter((c) => c.status === 'evidence_review').length})
            </button>
            <button
              onClick={() => setFilterMode('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'closed' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'closed' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Past Determinations ({cases.filter((c) => c.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'all' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              All Agency Cases ({cases.length})
            </button>
          </>
        )}

        {isClientService && (
          <>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'pending' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'pending' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Account Cases &amp; Scope Disputes ({cases.filter((c) => c.status !== 'closed' && (c.teamId === 'team-client-service' || c.type === 'scope_dispute' || c.type === 'sla_exception_ruling' || c.employeeId === currentUser.id)).length})
            </button>
            <button
              onClick={() => setFilterMode('my_cases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'my_cases' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'my_cases' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              My Case Dossier ({cases.filter((c) => c.employeeId === currentUser.id).length})
            </button>
            <button
              onClick={() => setFilterMode('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'closed' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'closed' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Resolved ({cases.filter((c) => (c.teamId === 'team-client-service' || c.employeeId === currentUser.id) && c.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'all' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              All Account Cases ({cases.filter((c) => c.teamId === 'team-client-service' || c.employeeId === currentUser.id || c.type === 'scope_dispute').length})
            </button>
          </>
        )}

        {isDisciplineLead && (
          <>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'pending' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'pending' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Needs Lead Endorsement ({cases.filter((c) => c.teamId === currentUser.teamId && (c.status === 'manager_review' || c.status === 'submitted')).length})
            </button>
            <button
              onClick={() => setFilterMode('verification')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'verification' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'verification' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Forwarded to GM ({cases.filter((c) => c.teamId === currentUser.teamId && (c.status === 'evidence_review' || c.status === 'decision')).length})
            </button>
            <button
              onClick={() => setFilterMode('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'closed' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'closed' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Resolved ({cases.filter((c) => c.teamId === currentUser.teamId && c.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'all' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              All Team Cases ({cases.filter((c) => c.teamId === currentUser.teamId).length})
            </button>
          </>
        )}

        {isEmployee && (
          <>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'pending' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'pending' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              My Active Requests ({cases.filter((c) => c.employeeId === currentUser.id && c.status !== 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'closed' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'closed' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Completed &amp; Decided ({cases.filter((c) => c.employeeId === currentUser.id && c.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === 'all' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: filterMode === 'all' ? 'var(--color-brand)' : 'transparent'
              }}
            >
              Agency Promotion Benchmarks ({cases.length})
            </button>
          </>
        )}
      </div>

      {/* Main 2-Column Split: Case List on Left, Case Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cases List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold px-1 text-[#64748b]">
            <span>{isGM ? 'Dossiers Under Review' : isDisciplineLead ? 'Team Submissions' : 'Your Cases'} ({roleCases.length})</span>
            <span>Case ID</span>
          </div>

          <div className="space-y-2.5">
            {roleCases.length === 0 ? (
              <div
                className="p-6 text-center rounded-xl border text-xs text-text-tertiary"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                No cases found in this category.
              </div>
            ) : (
              roleCases.map((c) => {
                const isSelected = activeCase?.id === c.id;
                return (
                  <SpotlightCard
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className="p-4 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-elevated)' : 'var(--color-surface)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        {c.id}
                      </span>
                      <span
                        className="text-[11px] font-semibold"
                        style={{
                          color:
                            c.status === 'closed'
                              ? 'var(--color-success)'
                              : c.status === 'evidence_review'
                              ? 'var(--color-warning)'
                              : 'var(--color-brand)'
                        }}
                      >
                        {formatStatus(c.status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold mt-1.5 leading-snug line-clamp-2 text-text-primary">
                      {c.title}
                    </h3>

                    {/* Context Indicators on Card */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono font-semibold">
                      {c.status === 'decision' && (
                        <span className="text-emerald-500">
                          · Ready for Ruling
                        </span>
                      )}
                      {c.leadEndorsementStatus === 'disendorsed' && c.status === 'manager_review' && (
                        <span className="text-rose-500">
                          · Lead Disendorsed
                        </span>
                      )}
                      {c.leadEndorsementStatus === 'overturned' && (
                        <span className="text-purple-400">
                          · Disendorsement Overturned
                        </span>
                      )}
                      {c.verificationStatus === 'verified' && (
                        <span className="text-sky-500">
                          · Verified Audit
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t mt-2" style={{ borderColor: 'var(--color-border)' }}>
                      <span className="font-medium truncate max-w-[150px]">{c.employeeName}</span>
                      <span>{formatCaseType(c.type)}</span>
                    </div>
                  </SpotlightCard>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Case Details & Adjudication Workspace */}
        {activeCase ? (
          <div
            className="lg:col-span-8 rounded-2xl border p-6 sm:p-7 space-y-6 shadow-xs"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            {/* Header with Applicant Details */}
            <div className="space-y-3 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-tertiary">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold" style={{ color: 'var(--color-brand)' }}>{activeCase.id}</span>
                  <span>•</span>
                  <span>Submitted {new Date(activeCase.submissionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: 'var(--color-brand)' }}>
                    {formatCaseType(activeCase.type)}
                  </span>
                  {activeCase.decision && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                      • {formatReadable(activeCase.decision)}
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {activeCase.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary pt-1">
                <span>
                  Applicant: <strong className="text-text-primary">{activeCase.employeeName}</strong>
                </span>
                <span>•</span>
                <span>Role: <strong>{activeCase.employeeTitle}</strong></span>
                {activeCase.reviewerName && (
                  <>
                    <span>•</span>
                    <span>Lead Reviewer: <strong>{activeCase.reviewerName}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Workflow Progress Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-secondary">Review &amp; Adjudication Pipeline</span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--color-brand)' }}>
                  Stage: {workflowSteps.find((w) => w.id === activeCase.status)?.label || formatStatus(activeCase.status)}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {workflowSteps.map((step, idx) => {
                  const currentIdx = workflowSteps.findIndex((w) => w.id === activeCase.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  let stepSubBadge = null;
                  if (step.id === 'manager_review') {
                    if (activeCase.leadEndorsementStatus === 'disendorsed') {
                      stepSubBadge = <span className="text-[8px] font-bold text-red-500 block truncate">Disendorsed</span>;
                    } else if (activeCase.leadEndorsementStatus === 'overturned') {
                      stepSubBadge = <span className="text-[8px] font-bold text-purple-600 block truncate">Overturned</span>;
                    } else if (activeCase.leadEndorsementStatus === 'endorsed') {
                      stepSubBadge = <span className="text-[8px] font-medium text-emerald-600 block truncate">Endorsed ✓</span>;
                    } else if (isCurrent) {
                      stepSubBadge = <span className="text-[8px] font-medium text-amber-500 block truncate">Pending</span>;
                    }
                  } else if (step.id === 'evidence_review') {
                    if (activeCase.verificationStatus === 'verified') {
                      stepSubBadge = <span className="text-[8px] font-medium text-emerald-600 block truncate">Certified ✓</span>;
                    } else if (isCurrent) {
                      stepSubBadge = <span className="text-[8px] font-medium text-amber-500 block truncate">Verifying</span>;
                    }
                  } else if (step.id === 'decision') {
                    if (isCurrent) {
                      stepSubBadge = <span className="text-[8px] font-bold text-brand block truncate">Ruling Active</span>;
                    } else if (isDone) {
                      stepSubBadge = <span className="text-[8px] font-medium text-emerald-600 block truncate">Decided ✓</span>;
                    }
                  } else if (step.id === 'closed' && isCurrent) {
                    stepSubBadge = <span className="text-[8px] font-bold text-emerald-600 block truncate">Sealed ✓</span>;
                  }

                  return (
                    <div key={step.id} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all ${isCurrent ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: isDone || isCurrent ? 'var(--color-brand)' : 'var(--color-surface-muted)'
                        }}
                      />
                      <span
                        className="text-[10px] block truncate font-medium"
                        style={{
                          color: isCurrent ? 'var(--color-brand)' : isDone ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                          fontWeight: isCurrent ? 700 : 500
                        }}
                      >
                        {step.label}
                      </span>
                      {stepSubBadge}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Narrative & Context */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Applicant Narrative &amp; Justification
              </h3>
              <p
                className="text-xs leading-relaxed p-4 rounded-xl border text-text-secondary"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {activeCase.narrative}
              </p>
            </div>

            {/* Quantified Evidence Breakdown */}
            {activeCase.evidenceData && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Quantified Audit Evidence
                  </h3>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    Aggregating {effectiveDeliverableCount} Job &amp; Timesheet Records
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Responsibilities Expanded */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-text-tertiary uppercase">Responsibilities Expanded</span>
                    </div>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                      {originalResponsibilities} → {liveCurrentResponsibilities}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
                        +{liveGrowthPercent}% Scope Growth
                      </span>
                      <span className="text-text-tertiary">
                        {applicantContributions.length > 0 ? `+${applicantContributions.length} verified impact logs` : 'Dossier baseline'}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Deliverable Volume & Hours */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-text-tertiary uppercase">Deliverable Volume</span>
                    </div>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
                      {effectiveDeliverableCount} Deliverables
                    </div>
                    <div className="text-[10px] text-text-tertiary flex items-center justify-between">
                      <span>{effectiveTotalHours} hrs logged</span>
                      <span className="font-mono" style={{ color: liveHoursVariance > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {liveHoursVariance >= 0 ? `+${liveHoursVariance}h` : `${liveHoursVariance}h`} variance
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Complexity Shift */}
                  <div
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-text-tertiary uppercase">Complexity Shift</span>
                    </div>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-success)' }}>
                      +{effectiveComplexityShift}% High-Tier
                    </div>
                    <div className="text-[10px] text-text-tertiary flex items-center justify-between">
                      <span>{highTierTotal} high-complexity jobs</span>
                      <span className="text-emerald-500 font-semibold">{liveComplexityShiftPercent}% ratio</span>
                    </div>
                  </div>
                </div>

                {/* Live Timesheet Audit Reconciliation Bar */}
                <div
                  className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-text-secondary">
                      <strong>Timesheet Audit Reconciliation:</strong> {effectiveTotalHours} hrs computed across {effectiveDeliverableCount} staff job records ({applicantActiveJobs.length} active in Control Tower, {applicantArchivedTasks.length} archived historical runs).
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                    <span className="text-text-tertiary">Quoted Baseline: <strong>{effectiveEstimatedHours}h</strong></span>
                    <span>•</span>
                    <span style={{ color: liveHoursVariance > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      Live Variance: <strong>{liveHoursVariance >= 0 ? `+${liveHoursVariance}h` : `${liveHoursVariance}h`}</strong>
                    </span>
                  </div>
                </div>

                {/* Growth Items List */}
                {activeCase.evidenceData.responsibilityGrowth.items.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-text-tertiary">Key Expanded Responsibilities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCase.evidenceData.responsibilityGrowth.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg border font-medium text-text-secondary"
                          style={{
                            backgroundColor: 'var(--color-surface-elevated)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Analytics & Operational Radar Telemetry (Everybody's View) */}
            <VisualAnalyticsWidget
              caseData={activeCase}
              scope="case"
              title={`Visual Evidence & Telemetry Radar: ${activeCase.employeeName}`}
              subtitle={`Audited deliverable telemetry for Case ${activeCase.id}. Evaluates applicant quoting accuracy, SLA performance, and six operational pillars.`}
            />

            {/* Traffic Impact & Operational Governance Summary */}
            {activeCase.trafficImpact && (
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Traffic Impact Assessment &amp; Operational Governance</span>
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold uppercase flex items-center gap-1.5"
                    style={{
                      color:
                        activeCase.trafficImpact?.riskTier === 'severe' || activeCase.trafficImpact?.riskTier === 'critical'
                          ? 'var(--color-critical)'
                          : 'var(--color-warning)'
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          activeCase.trafficImpact?.riskTier === 'severe' || activeCase.trafficImpact?.riskTier === 'critical'
                            ? 'var(--color-critical)'
                            : 'var(--color-warning)'
                      }}
                    />
                    Risk Tier: {(activeCase.trafficImpact?.riskTier || 'Standard').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="text-[10px] uppercase text-text-tertiary block">Affected Client</span>
                    <span className="font-bold text-text-primary">{activeCase.trafficImpact?.affectedClient || 'Client Account'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="text-[10px] uppercase text-text-tertiary block">Target Project</span>
                    <span className="font-semibold text-text-secondary truncate block">{activeCase.trafficImpact?.affectedProject || 'Project Scope'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border">
                    <span className="text-[10px] uppercase text-text-tertiary block">SLA Relief Requested</span>
                    <span className="font-bold font-mono" style={{ color: 'var(--color-warning)' }}>
                      +{activeCase.trafficImpact?.slaExtensionDays || 0} Business Days
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border/80 text-xs space-y-1">
                  <span className="font-semibold text-text-primary">Dispute Summary &amp; Root Cause:</span>
                  <p className="text-text-secondary leading-relaxed">{activeCase.trafficImpact?.disputeDetails || 'No additional dispute details recorded.'}</p>
                </div>

                {(activeCase.trafficImpact?.mitigationActions?.length || 0) > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-text-tertiary">Traffic Mitigation Actions Enacted:</span>
                    <div className="space-y-1">
                      {activeCase.trafficImpact?.mitigationActions?.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attached Deliverables & Linked Jobs */}
            {linkedJobs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Linked Deliverables in Control Tower ({linkedJobs.length})
                </h3>
                <div className="space-y-2">
                  {linkedJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all"
                      style={{
                        backgroundColor: 'var(--color-surface-elevated)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Briefcase className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                        <span className="font-mono font-bold" style={{ color: 'var(--color-brand)' }}>{job.id}</span>
                        <span className="truncate font-medium text-text-primary">
                          {job.title}
                        </span>
                        <span className="text-[11px] capitalize text-text-tertiary">
                          • {job.complexity}
                        </span>
                      </div>
                      <span className="text-[11px] hover:underline shrink-0 flex items-center gap-1" style={{ color: 'var(--color-brand)' }}>
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Notes Recorded If Case Closed */}
            {activeCase.decisionNotes && (
              <div
                className="p-4 rounded-xl border space-y-1.5"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Adjudication Record</span>
                  </span>
                  {activeCase.decisionDate && (
                    <span className="text-[10px] text-text-tertiary">
                      Sealed {new Date(activeCase.decisionDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {activeCase.decisionNotes}
                </p>
              </div>
            )}

            {/* ROLE SPECIFIC ADJUDICATION & REVIEW CONSOLES */}

            {/* 1. GENERAL MANAGER EXECUTIVE ADJUDICATION & GOVERNANCE CONSOLE */}
            {isGM && (
              <div
                className="p-5 rounded-xl border space-y-4 shadow-xs"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {/* Console Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                    <span className="text-xs font-bold text-text-primary">
                      {activeCase.status === 'decision'
                        ? 'Executive Adjudication Ruling Console'
                        : activeCase.status === 'closed'
                        ? 'Executive Adjudication Archive & Appeal Console'
                        : activeCase.status === 'evidence_review'
                        ? 'Evidence Verification & Audit Clearing Console'
                        : activeCase.status === 'manager_review'
                        ? 'Discipline Lead Review & Endorsement Gate'
                        : 'Executive Governance Intake Console'}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    Marcus Sterling • Final Authority
                  </span>
                </div>

                {/* ============================================================== */}
                {/* CASE: DECISION STAGE (VERIFICATION COMPLETE - RULING OPEN) */}
                {/* ============================================================== */}
                {activeCase.status === 'decision' && (
                  <div className="space-y-4">
                    {/* Verification Passed Clearance Banner */}
                    <div
                      className="p-3.5 rounded-xl border flex items-start gap-3"
                      style={{
                        backgroundColor: 'var(--color-success-muted)',
                        borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)'
                      }}
                    >
                      <CheckCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                      <div className="space-y-1">
                        <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                          <span>Prerequisites Cleared: Verification Complete &amp; Audit Certified</span>
                          <span className="text-[10px] text-text-tertiary font-mono font-normal">· Ready for Binding Adjudication</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          All prerequisite pipeline gates have been verified: applicant evidence logged, discipline lead review complete{' '}
                          {activeCase.leadEndorsementStatus === 'overturned' ? (
                            <strong className="text-purple-500 font-semibold">(Disendorsement Overturned by GM)</strong>
                          ) : (
                            <strong className="text-text-primary font-semibold">({formatReadable(activeCase.leadEndorsementStatus || 'endorsed')})</strong>
                          )}
                          , and timesheet &amp; deliverable records audited. As General Manager, you may now render the official agency ruling.
                        </p>
                      </div>
                    </div>

                    {/* Preset Rationale Helper Chips */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-medium text-text-tertiary">Quick Decision Rationale Presets:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Approved: Audit evidence confirms sustained high-complexity deliverables and token system leadership across consecutive quarters.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:border-brand"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Approve: High-Complexity Criteria Met
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Approved with Conditions: Promotion effective immediately with mandatory 90-day progress check on junior designer mentoring program.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:border-brand"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Approve with Conditions
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Deferred to Next Cycle: Recommend demonstrating 2 additional cross-team pitches before formal title recalibration.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:border-brand"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Defer to Next Quarter
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Declined: Quantitative output does not currently meet benchmark requirements for title elevation at this quarterly cycle.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:border-brand"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Decline: Benchmark Unmet
                        </button>
                      </div>
                    </div>

                    {/* Decision Rationale Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-text-tertiary">
                        Executive Adjudication Rationale &amp; Audit Determination
                      </label>
                      <input
                        type="text"
                        value={decisionRationale}
                        onChange={(e) => setDecisionRationale(e.target.value)}
                        placeholder="Enter formal executive ruling notes for the audit registry..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                    </div>

                    {/* The Final Adjudication Ruling Buttons (ONLY at Decision Stage!) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                      <button
                        onClick={() => handleDecision('approved', 'closed')}
                        className="px-4 py-2 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Promotion / Request</span>
                      </button>
                      <button
                        onClick={() => handleDecision('partially_approved', 'closed')}
                        className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--color-warning-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                          color: 'var(--color-warning)'
                        }}
                      >
                        Approve with Conditions
                      </button>
                      <button
                        onClick={() => handleDecision('deferred', 'evidence_review')}
                        className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface text-text-primary border border-border font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Defer to Next Cycle
                      </button>
                      <button
                        onClick={() => handleDecision('declined', 'closed')}
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-critical-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                          color: 'var(--color-critical)'
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline Request</span>
                      </button>
                      <button
                        onClick={() => {
                          updateCaseStatus(
                            activeCase.id,
                            'evidence_review',
                            undefined,
                            decisionRationale || 'GM Marcus Sterling remanded case to evidence verification for supplementary timesheet check'
                          );
                          setShowConfirmationToast(`Case ${activeCase.id} remanded to Verification.`);
                          setTimeout(() => setShowConfirmationToast(null), 4000);
                        }}
                        className="px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-secondary hover:text-text-primary ml-auto"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        Remand to Verification
                      </button>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* CASE: MANAGER REVIEW STAGE (LEAD ENDORSEMENT GATE) */}
                {/* ============================================================== */}
                {activeCase.status === 'manager_review' && (
                  <div className="space-y-4">
                    {/* SCENARIO A: Lead Disendorsement on File */}
                    {activeCase.leadEndorsementStatus === 'disendorsed' ? (
                      <div className="space-y-3.5">
                        <div
                          className="p-3.5 rounded-xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--color-critical-muted)',
                            borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--color-critical)' }}>
                              <ShieldAlert className="w-4 h-4 shrink-0" />
                              <span>Discipline Lead Disendorsement on Record</span>
                            </span>
                            <span className="text-xs text-text-tertiary">
                              Reviewer: {activeCase.reviewerName || 'Discipline Lead'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {activeCase.leadEndorsementNotes || `${activeCase.reviewerName || 'The lead'} declined endorsement, citing reservations on benchmark readiness.`}
                          </p>
                          <div className="text-[11px] font-medium pt-1 border-t border-border/40 text-text-tertiary">
                            Governance Rule: Final adjudication buttons are withheld. As General Manager, you can examine the evidence and either <strong>Overturn the Lead Disendorsement</strong> with executive justification to advance the case to verification, or <strong>Uphold the Disendorsement</strong> to seal the denial.
                          </div>
                        </div>

                        {/* Rationale Input for Overturning or Upholding */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-text-tertiary">
                            Executive Determination / Overturn Rationale
                          </label>
                          <input
                            type="text"
                            value={decisionRationale}
                            onChange={(e) => setDecisionRationale(e.target.value)}
                            placeholder="State rationale to overturn disendorsement or sustain denial..."
                            className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)'
                            }}
                          />
                        </div>

                        {/* Context Aware Actions for Disendorsed State */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                          <button
                            onClick={handleOverturnDisendorsement}
                            className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                            style={{ backgroundColor: '#7c3aed' }}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Overturn Lead Disendorsement &amp; Advance to Verification</span>
                          </button>
                          <button
                            onClick={handleUpholdDisendorsement}
                            className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                            style={{
                              backgroundColor: 'var(--color-critical-muted)',
                              borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                              color: 'var(--color-critical)'
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Uphold Disendorsement &amp; Seal Case</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDispatchPrompt(
                                activeCase.reviewerName || 'Discipline Lead',
                                'Discipline Lead',
                                'sync_request',
                                `GM Marcus Sterling requests an executive alignment sync regarding the disendorsement on Case ${activeCase.id} (${activeCase.employeeName}).`
                              )
                            }
                            className="px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-secondary hover:text-text-primary flex items-center gap-1.5"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)'
                            }}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Request Sync with {activeCase.reviewerName || 'Lead'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* SCENARIO B: Lead Review Pending / Under Review */
                      <div className="space-y-3.5">
                        <div
                          className="p-3.5 rounded-xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--color-warning-muted)',
                            borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
                              <Clock className="w-4 h-4 shrink-0" />
                              <span>Pending Discipline Lead Endorsement</span>
                            </span>
                            <span className="text-xs text-text-tertiary">
                              Reviewer: {activeCase.reviewerName || 'Discipline Lead'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            This dossier is currently with <strong>{activeCase.reviewerName || 'the assigned lead'}</strong> for discipline evaluation. Adjudication ruling buttons are gated until the lead submits an endorsement or you invoke an executive bypass.
                          </p>
                        </div>

                        {/* Inline Prompt Dispatcher */}
                        <div className="p-3 rounded-xl border space-y-2 bg-surface border-border">
                          <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
                            <span className="flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-brand" style={{ color: 'var(--color-brand)' }} />
                              <span>Prompt Reviewer for Expedited Completion</span>
                            </span>
                            <span className="text-[10px] text-text-tertiary">Direct Executive Ping</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={promptInput}
                              onChange={(e) => setPromptInput(e.target.value)}
                              placeholder={`Enter prompt for ${activeCase.reviewerName || 'Lead'} (e.g. "Please complete review ahead of Friday board cycle")...`}
                              className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none text-text-primary placeholder:text-text-tertiary bg-surface-elevated border-border"
                            />
                            <button
                              onClick={() =>
                                handleDispatchPrompt(
                                  activeCase.reviewerName || 'Discipline Lead',
                                  'Discipline Lead',
                                  'prompt_review'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1 transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                              style={{ backgroundColor: 'var(--color-brand)' }}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Nudge</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              onClick={() =>
                                setPromptInput(
                                  `GM Marcus Sterling requests expedited completion of endorsement review for ${activeCase.employeeName} ahead of Friday board cycle.`
                                )
                              }
                              className="text-xs px-2.5 py-1 rounded-lg border text-text-secondary hover:text-text-primary border-border bg-surface-elevated cursor-pointer transition-colors"
                            >
                              + Preset: Friday Board Cycle Deadline
                            </button>
                            <button
                              onClick={() =>
                                setPromptInput(
                                  `Deliverable audit CT-1842 is verified. Please submit your lead recommendation to advance to verification.`
                                )
                              }
                              className="text-xs px-2.5 py-1 rounded-lg border text-text-secondary hover:text-text-primary border-border bg-surface-elevated cursor-pointer transition-colors"
                            >
                              + Preset: Deliverables Ready
                            </button>
                          </div>
                        </div>

                        {/* Context-Aware Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                          <button
                            onClick={handleGrantExecutiveEndorsement}
                            className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                            style={{ backgroundColor: 'var(--color-brand)' }}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Grant Executive Endorsement (Bypass Lead Review)</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDispatchPrompt(
                                activeCase.reviewerName || 'Discipline Lead',
                                'Discipline Lead',
                                'prompt_review',
                                `High Priority: Please finalize endorsement review for ${activeCase.employeeName} within 24 hours.`
                              )
                            }
                            className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            <Send className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                            <span>Quick Ping {activeCase.reviewerName || 'Reviewer'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================== */}
                {/* CASE: EVIDENCE REVIEW STAGE (VERIFICATION GATE) */}
                {/* ============================================================== */}
                {activeCase.status === 'evidence_review' && (
                  <div className="space-y-4">
                    <div
                      className="p-3.5 rounded-xl border space-y-2"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
                          <FileCheck className="w-4 h-4 shrink-0" />
                          <span>Audit Verification Gate Active</span>
                        </span>
                        <span className="text-xs text-text-tertiary">
                          Status: {activeCase.verificationStatus === 'in_progress' ? 'In Progress' : 'Pending Certification'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Lead endorsement is recorded{' '}
                        {activeCase.leadEndorsementStatus === 'overturned' && (
                          <span className="text-purple-500 font-semibold">(Overturned by GM)</span>
                        )}
                        . Deliverable artifacts, timesheet volume ({effectiveTotalHours} hrs), and linked jobs ({linkedJobs.length} deliverables) must be certified before final adjudication buttons unlock.
                      </p>

                      {/* Verification Audit Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="p-2 rounded-lg bg-surface-elevated border border-border flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" style={{ color: 'var(--color-success)' }} />
                          <span className="text-text-secondary truncate">
                            Linked: <strong>{linkedJobs.map(j => j.id).join(', ') || 'None attached'}</strong>
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-elevated border border-border flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" style={{ color: 'var(--color-success)' }} />
                          <span className="text-text-secondary truncate">
                            Volume: <strong>{effectiveTotalHours} Hours Audited</strong>
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-elevated border border-border flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" style={{ color: 'var(--color-success)' }} />
                          <span className="text-text-secondary truncate">
                            Complexity: <strong>+{effectiveComplexityShift}% Shift</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Notes / Certification Rationale */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-text-tertiary">
                        Verification Audit Certification Notes
                      </label>
                      <input
                        type="text"
                        value={decisionRationale}
                        onChange={(e) => setDecisionRationale(e.target.value)}
                        placeholder="Confirm deliverable verification notes to advance case to Adjudication..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                    </div>

                    {/* Context Aware Controls for Verification Stage */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                      <button
                        onClick={handleCertifyVerification}
                        className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                        style={{ backgroundColor: 'var(--color-brand)' }}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Certify Verification &amp; Advance to Adjudication</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDispatchPrompt(
                            activeCase.employeeName,
                            'Applicant',
                            'request_evidence',
                            `GM Marcus Sterling requested supplementary project timesheets and artwork links for Case ${activeCase.id}.`
                          )
                        }
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <FileCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                        <span>Prompt Applicant for Extra Evidence</span>
                      </button>
                      <button
                        onClick={() => {
                          updateCaseStatus(
                            activeCase.id,
                            'manager_review',
                            undefined,
                            decisionRationale || 'Returned to Lead Review due to deliverable audit discrepancy'
                          );
                          setShowConfirmationToast(`Case ${activeCase.id} remanded to Lead Review.`);
                          setTimeout(() => setShowConfirmationToast(null), 4000);
                        }}
                        className="px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-secondary hover:text-text-primary ml-auto"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        Remand to Lead
                      </button>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* CASE: SUBMITTED OR DRAFT STAGE */}
                {/* ============================================================== */}
                {(activeCase.status === 'submitted' || activeCase.status === 'draft') && (
                  <div className="space-y-3.5">
                    <div
                      className="p-3.5 rounded-xl border space-y-1.5"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                        <span>
                          {activeCase.status === 'submitted'
                            ? 'Submitted into Registry — Awaiting Lead Allocation'
                            : 'Draft Dossier In Compilation'}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          Stage: {formatStatus(activeCase.status)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {activeCase.status === 'submitted'
                          ? `This case has been registered by ${activeCase.employeeName} and is awaiting initial lead intake. Prompt the reviewer or use executive authority to fast-track.`
                          : `${activeCase.employeeName} is still editing this draft dossier. Final submission has not yet occurred.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                      {activeCase.status === 'submitted' ? (
                        <>
                          <button
                            onClick={() =>
                              handleDispatchPrompt(
                                activeCase.reviewerName || 'Discipline Lead',
                                'Discipline Lead',
                                'prompt_review',
                                `Please initiate intake review on Case ${activeCase.id} submitted by ${activeCase.employeeName}.`
                              )
                            }
                            className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                            style={{ backgroundColor: 'var(--color-brand)' }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Prompt {activeCase.reviewerName || 'Lead'} to Begin Intake</span>
                          </button>
                          <button
                            onClick={() => {
                              updateCaseStatus(
                                activeCase.id,
                                'evidence_review',
                                undefined,
                                'Fast-tracked directly to Evidence Verification by GM Marcus Sterling'
                              );
                              setShowConfirmationToast(`Case ${activeCase.id} fast-tracked to Verification.`);
                              setTimeout(() => setShowConfirmationToast(null), 4000);
                            }}
                            className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            Bypass to Verification
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleDispatchPrompt(
                              activeCase.employeeName,
                              'Applicant',
                              'prompt_submission',
                              `Executive reminder from GM Marcus Sterling: Please finalize and lodge your case dossier.`
                            )
                          }
                          className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                          style={{ backgroundColor: 'var(--color-brand)' }}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Prompt Applicant ({activeCase.employeeName}) to Finalize Dossier</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* CASE: CLOSED STAGE (SEALED RECORD & APPEAL CONSOLE) */}
                {/* ============================================================== */}
                {activeCase.status === 'closed' && (
                  <div className="space-y-3">
                    <div
                      className="p-3.5 rounded-xl border space-y-2"
                      style={{
                        backgroundColor: 'var(--color-success-muted)',
                        borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)'
                      }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--color-success)' }}>
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Official Adjudication Sealed in Audit Registry</span>
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                          {formatReadable(activeCase.decision || 'approved')}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Determination rendered and archived into the agency governance audit ledger. Final ruling: <strong>{formatReadable(activeCase.decision || 'approved')}</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                      <button
                        onClick={handleReopenForAppeal}
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        <Undo2 className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                        <span>Reopen Case for Executive Appeal Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. DISCIPLINE LEAD / MANAGER ENDORSEMENT CONSOLE */}
            {isDisciplineLead && (
              <div
                className="p-5 rounded-xl border space-y-4 shadow-xs"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                    <span className="text-xs font-bold text-text-primary">
                      Discipline Lead Review &amp; Recommendation
                    </span>
                  </div>
                  <span className="text-[11px] text-text-tertiary">Review as {currentUser.name}</span>
                </div>

                {activeCase.status === 'manager_review' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-text-tertiary">
                        Lead Endorsement / Revision Notes for General Manager
                      </label>
                      <input
                        type="text"
                        value={decisionRationale}
                        onChange={(e) => setDecisionRationale(e.target.value)}
                        placeholder="Provide recommendation or reservations for executive review..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const notes = decisionRationale || 'Discipline lead verified and recommended for audit verification.';
                          updateCaseStatus(activeCase.id, 'evidence_review', undefined, notes, {
                            leadEndorsementStatus: 'endorsed',
                            leadEndorsedBy: currentUser.name,
                            leadEndorsementDate: new Date().toISOString(),
                            leadEndorsementNotes: notes
                          });
                          setShowConfirmationToast(`Case ${activeCase.id} endorsed and forwarded to Verification.`);
                          setDecisionRationale('');
                          setTimeout(() => setShowConfirmationToast(null), 4000);
                        }}
                        className="px-4 py-2 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Endorse &amp; Forward to Verification</span>
                      </button>
                      <button
                        onClick={() => {
                          const notes = decisionRationale || `Lead reservations flagged by ${currentUser.name}: Recommend further quarter at current tier.`;
                          updateCaseStatus(activeCase.id, 'manager_review', undefined, notes, {
                            leadEndorsementStatus: 'disendorsed',
                            leadEndorsedBy: currentUser.name,
                            leadEndorsementDate: new Date().toISOString(),
                            leadEndorsementNotes: notes
                          });
                          setShowConfirmationToast(`Lead disendorsement logged for Case ${activeCase.id}. Sent to GM attention.`);
                          setDecisionRationale('');
                          setTimeout(() => setShowConfirmationToast(null), 4000);
                        }}
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                        style={{
                          backgroundColor: 'var(--color-critical-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                          color: 'var(--color-critical)'
                        }}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Disendorse with Reservations</span>
                      </button>
                      <button
                        onClick={() => {
                          const notes = decisionRationale || 'Lead requested additional project evidence from applicant.';
                          updateCaseStatus(activeCase.id, 'manager_review', undefined, notes, {
                            leadEndorsementStatus: 'revision_requested',
                            leadEndorsementNotes: notes
                          });
                          setShowConfirmationToast(`Revision requested from applicant for Case ${activeCase.id}.`);
                          setDecisionRationale('');
                          setTimeout(() => setShowConfirmationToast(null), 4000);
                        }}
                        className="px-3.5 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-primary"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      >
                        Request Revision
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="p-3.5 rounded-xl border text-xs text-text-secondary leading-relaxed"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    Lead Endorsement Phase Closed. Endorsement status:{' '}
                    <strong className="text-text-primary capitalize">{formatReadable(activeCase.leadEndorsementStatus || 'endorsed')}</strong>. Case is currently in{' '}
                    <strong className="text-text-primary">{formatStatus(activeCase.status)}</strong>.
                  </div>
                )}
              </div>
            )}

            {/* GOVERNANCE COMMUNICATIONS & PROMPT DISPATCH LEDGER */}
            {activeCase.promptLogs && activeCase.promptLogs.length > 0 && (
              <div
                className="p-4 rounded-xl border space-y-2.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
                    <History className="w-4 h-4" />
                    <span>Governance Communications &amp; Prompt Dispatch Ledger ({activeCase.promptLogs.length})</span>
                  </span>
                  <span className="text-[10px] text-text-tertiary">Real-Time Audit Trail</span>
                </div>
                <div className="space-y-2">
                  {activeCase.promptLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border text-xs space-y-1"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-mono font-semibold uppercase"
                            style={{
                              color:
                                log.actionType === 'overturn_notification'
                                  ? 'var(--color-critical)'
                                  : 'var(--color-brand)'
                            }}
                          >
                            {formatReadable(log.actionType)}
                          </span>
                          <span className="font-semibold text-text-primary truncate">
                            {log.senderName} → {log.recipientName}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-secondary leading-relaxed pl-2 border-l-2 text-[11px]" style={{ borderColor: 'var(--color-brand)' }}>
                        "{log.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TRAFFIC DESK OPERATIONAL ADJUDICATION CONSOLE */}
            {isTraffic && activeCase.status !== 'closed' && (
              <div
                className="p-5 rounded-xl border space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                    <span className="text-xs font-bold text-text-primary">
                      Traffic Operations Adjudication &amp; SLA Determination
                    </span>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--color-brand)' }}>
                    Traffic Desk Authority • Kwame Mensah
                  </span>
                </div>

                {activeCase.employeeId === currentUser.id ? (
                  /* Traffic user viewing their own operational case dossier */
                  <div
                    className="p-4 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Your Case Dossier Is Under Review</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Your operational case ({activeCase.id}) has been formally lodged into the agency governance audit ledger. Current stage:{' '}
                      <strong className="text-text-primary">{formatStatus(activeCase.status)}</strong>. Lead endorsement and GM executive adjudication are automatically scheduled.
                    </p>
                  </div>
                ) : (
                  /* Traffic user adjudicating operational disputes, SLA exceptions, or capacity */
                  <>
                    {/* Presets */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-medium text-text-tertiary">Quick Determination Rationale Presets:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Approved: SLA extension granted due to unbudgeted client reverts and dieline technical revisions verified on audit log.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Approve: +48h SLA Relief Granted
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Approved with Conditions: Delivery date extended conditioned on Client Service obtaining written client approval for extra billable hours.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Approve with Conditions
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Escalate to GM: Commercial scope breach exceeds 4 billable hours threshold. Forwarding to GM for commercial adjudication.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Escalate to GM Ruling
                        </button>
                        <button
                          onClick={() =>
                            setDecisionRationale(
                              'Declined: Internal creative hours are within standard buffer; overtime desk absorption will meet current Friday cutoff.'
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          + Enforce Turnaround
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-text-tertiary">
                        Traffic Adjudication Determination Notes
                      </label>
                      <input
                        type="text"
                        value={decisionRationale}
                        onChange={(e) => setDecisionRationale(e.target.value)}
                        placeholder="Enter formal operational ruling notes for the dispatch log..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)'
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          handleDecision('approved', 'closed', 'Traffic Manager granted SLA exception relief and updated delivery schedule')
                        }
                        className="px-4 py-2 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        Grant SLA Relief Ruling
                      </button>
                      <button
                        onClick={() =>
                          handleDecision('partially_approved', 'closed', 'Traffic approved with conditioned scope cap')
                        }
                        className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--color-warning-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                          color: 'var(--color-warning)'
                        }}
                      >
                        Approve with Scope Cap
                      </button>
                      <button
                        onClick={() =>
                          handleDecision('approved', 'decision', 'Traffic escalated dispute to GM Marcus Sterling for executive sign-off')
                        }
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Escalate to GM
                      </button>
                      <button
                        onClick={() =>
                          handleDecision('declined', 'closed', 'Traffic declined SLA waiver to protect master delivery commitment')
                        }
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--color-critical-muted)',
                          borderColor: 'color-mix(in srgb, var(--color-critical) 30%, transparent)',
                          color: 'var(--color-critical)'
                        }}
                      >
                        Decline Waiver Request
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className="lg:col-span-8 p-12 text-center rounded-2xl border text-xs text-text-tertiary"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            Select a case to inspect details and render rulings.
          </div>
        )}
      </div>
    </div>
  );
};
