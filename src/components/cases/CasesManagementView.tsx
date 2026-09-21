import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressionCase, CaseStatus, CaseDecision } from '../../types';
import { formatStatus, formatCaseType, formatReadable } from '../../utils/formatters';
import { SpotlightCard } from '../common/SpotlightCard';
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
  Workflow
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
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService = role === 'client_service';
  const isDisciplineLead = role === 'manager' || role === 'director' || role === 'team_lead';
  const isEmployee = role === 'employee';

  // Filter state based on role
  const [filterMode, setFilterMode] = useState<'pending' | 'verification' | 'closed' | 'all'>('pending');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [showConfirmationToast, setShowConfirmationToast] = useState<string | null>(null);

  // Compute filtered cases based on user role and active filter
  const roleCases = cases.filter((c) => {
    if (isGM) {
      if (filterMode === 'pending') return c.status !== 'closed';
      if (filterMode === 'verification') return c.status === 'evidence_review';
      if (filterMode === 'closed') return c.status === 'closed';
      return true;
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
      if (filterMode === 'all') return true; // Allows inspecting company benchmarks
      return isMyCase;
    }
    return true;
  });

  const activeCase = cases.find((c) => c.id === selectedCaseId) || roleCases[0] || cases[0];

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

  const workflowSteps: { id: CaseStatus; label: string }[] = [
    { id: 'draft', label: 'Draft' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'manager_review', label: 'Lead Endorsement' },
    { id: 'evidence_review', label: 'Verification' },
    { id: 'decision', label: 'GM Adjudication' },
    { id: 'closed', label: 'Completed' }
  ];

  // Resolve linked jobs for the active case
  const linkedJobs = activeCase?.evidenceData?.linkedJobIds
    ? jobs.filter((j) => activeCase.evidenceData.linkedJobIds.includes(j.id))
    : [];

  // IF TRAFFIC MANAGER OR CLIENT SERVICE: Informational Role Separation Cockpit
  if (isTraffic || isClientService) {
    return (
      <div id="cases-view" className="space-y-6 pb-16">
        <div className="p-6 sm:p-8 rounded-2xl border space-y-5 bg-surface border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                color: 'var(--color-brand)'
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {isTraffic ? 'Studio Traffic & Operations Domain' : 'Client Service & Accounts Domain'}
              </h1>
              <p className="text-xs mt-0.5 text-text-tertiary">
                Role Boundary Notice • Case Progression &amp; Salary Reviews
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border text-xs leading-relaxed bg-surface-elevated border-border text-text-secondary">
            <p>
              Individual progression dossiers, title promotions, and salary recalibrations are strictly handled by{' '}
              <strong className="text-text-primary">Individual Specialists</strong>,{' '}
              <strong className="text-text-primary">Discipline Heads</strong>, and the{' '}
              <strong className="text-text-primary">General Manager</strong>.
            </p>
            <p className="mt-2">
              As a <strong>{currentUser.jobTitle}</strong>, your operations center is the{' '}
              <strong>Studio Workflow Engine</strong> (brief intake, conflict resolution, deliverable stages) and the{' '}
              <strong>Master Delivery Schedule</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('agency_workflow')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Workflow className="w-4 h-4" />
              <span>Go to Workflow Engine</span>
            </button>
            <button
              onClick={() => setActiveView('master_table')}
              className="px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <Briefcase className="w-4 h-4" />
              <span>View Master Delivery Schedule</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cases-view" className="space-y-6 pb-16">
      {/* Toast Confirmation */}
      {showConfirmationToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{showConfirmationToast}</span>
        </div>
      )}

      {/* Header Banner - Custom Title & Actions per Role */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isGM
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : isDisciplineLead
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : ''
              }`}
              style={
                !isGM && !isDisciplineLead
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'var(--color-brand)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
            >
              {isGM
                ? 'Executive Adjudication Chamber'
                : isDisciplineLead
                ? 'Discipline Case Reviews'
                : 'Career Mobility & Progression'}
            </span>
            <span className="text-xs text-text-tertiary">
              • {currentUser.name} ({currentUser.jobTitle.split('&')[0]})
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mt-1 text-text-primary">
            {isGM
              ? 'Executive Case Adjudications & Governance'
              : isDisciplineLead
              ? 'Team Progression Cases & Reviews'
              : 'My Progression Cases & Requests'}
          </h1>
          <p className="text-xs mt-1 max-w-3xl leading-relaxed text-text-secondary">
            {isGM
              ? 'Review employee progression cases, salary recalibrations, and workload concerns submitted across all agency teams. Decisions recorded here render official binding determinations.'
              : isDisciplineLead
              ? 'Review career progression dossiers, responsibility expansions, and workload appeals submitted by your team members before forwarding to GM adjudication.'
              : 'Submit and track career progression dossiers, salary reviews, workload rebalance requests, and milestone approvals backed by automatic work evidence.'}
          </p>
        </div>

        {/* Action Controls for Employee Only */}
        {isEmployee && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowBuildCaseModal(true)}
              className="px-3.5 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case Request</span>
            </button>
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

      {/* KPI Stat Cards for GM and Lead */}
      {(isGM || isDisciplineLead) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">
              {isGM ? 'Pending Executive Ruling' : 'Pending Lead Endorsement'}
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {cases.filter((c) => c.status !== 'closed' && (isGM || c.teamId === currentUser.teamId)).length}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Awaiting determination</div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">In Evidence Verification</div>
            <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-brand)' }}>
              {cases.filter((c) => c.status === 'evidence_review').length}
            </div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Audit log confirmation</div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-[11px] font-medium text-text-tertiary">Adjudications Sealed (YTD)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {cases.filter((c) => c.status === 'closed').length}
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
            <div className="text-[11px] font-medium text-text-tertiary">Avg Decision SLA</div>
            <div className="text-xl font-bold mt-1 text-text-primary">3.4 Days</div>
            <div className="text-[10px] text-text-tertiary mt-0.5">Turnaround velocity</div>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
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
              Pending My Ruling ({cases.filter((c) => c.status !== 'closed').length})
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
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          c.status === 'closed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : c.status === 'manager_review'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : c.status === 'evidence_review'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-surface text-text-secondary border border-border-subtle'
                        }`}
                      >
                        {formatStatus(c.status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold mt-1.5 leading-snug line-clamp-2 text-text-primary">
                      {c.title}
                    </h3>

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
                  <span className="font-medium text-amber-400">
                    {formatCaseType(activeCase.type)}
                  </span>
                  {activeCase.decision && (
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {formatReadable(activeCase.decision)}
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
                <span className="text-amber-400 font-mono text-[11px]">
                  Stage: {workflowSteps.find((w) => w.id === activeCase.status)?.label || formatStatus(activeCase.status)}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {workflowSteps.map((step, idx) => {
                  const currentIdx = workflowSteps.findIndex((w) => w.id === activeCase.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

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
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Quantified Audit Evidence
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase">Responsibilities Expanded</div>
                    <div className="text-lg font-bold mt-1" style={{ color: 'var(--color-brand)' }}>
                      {activeCase.evidenceData.responsibilityGrowth.originalCount} → {activeCase.evidenceData.responsibilityGrowth.currentCount}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      +{Math.round(((activeCase.evidenceData.responsibilityGrowth.currentCount - activeCase.evidenceData.responsibilityGrowth.originalCount) / (activeCase.evidenceData.responsibilityGrowth.originalCount || 1)) * 100)}% Growth
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase">Deliverable Volume</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {activeCase.evidenceData.workVolume.currentPeriodCount} jobs
                    </div>
                    <div className="text-[10px] text-text-tertiary mt-0.5">
                      {activeCase.evidenceData.workVolume.totalHours} total logged hours
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase">Complexity Shift</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      +{activeCase.evidenceData.complexityIncreasePercent}%
                    </div>
                    <div className="text-[10px] text-text-tertiary mt-0.5">High-tier assignments</div>
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 capitalize">
                          {job.complexity}
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

            {/* 1. GENERAL MANAGER EXECUTIVE ADJUDICATION CONSOLE */}
            {isGM && (
              <div
                className="p-5 rounded-xl border space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-text-primary">
                      Executive Adjudication Ruling Console
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400">Marcus Sterling • Final Authority</span>
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
                      className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
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
                          'Deferred to Next Cycle: Recommend demonstrating 2 additional cross-team pitches before formal title recalibration.'
                        )
                      }
                      className="text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      + Defer to Next Quarter
                    </button>
                  </div>
                </div>

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

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDecision('approved', 'closed')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Approve Promotion / Request
                  </button>
                  <button
                    onClick={() => handleDecision('partially_approved', 'closed')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
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
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => handleDecision('requires_further_evidence', 'evidence_review')}
                    className="px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-primary"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    Request Evidence
                  </button>
                </div>
              </div>
            )}

            {/* 2. DISCIPLINE LEAD / MANAGER ENDORSEMENT CONSOLE */}
            {isDisciplineLead && (
              <div
                className="p-5 rounded-xl border space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-text-primary">
                      Discipline Lead Review &amp; Recommendation
                    </span>
                  </div>
                  <span className="text-[11px] text-text-tertiary">Review as {currentUser.name}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-text-tertiary">
                    Lead Endorsement / Revision Notes for General Manager
                  </label>
                  <input
                    type="text"
                    value={decisionRationale}
                    onChange={(e) => setDecisionRationale(e.target.value)}
                    placeholder="Provide recommendation notes for executive review..."
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none text-text-primary placeholder:text-text-tertiary"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDecision('approved', 'decision', 'Discipline lead verified and recommended for GM adjudication')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Endorse &amp; Forward to GM
                  </button>
                  <button
                    onClick={() => handleDecision('requires_further_evidence', 'evidence_review', 'Lead requested additional project evidence')}
                    className="px-3.5 py-2 rounded-xl border text-xs font-medium cursor-pointer text-text-primary"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    Request Revision
                  </button>
                </div>
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
