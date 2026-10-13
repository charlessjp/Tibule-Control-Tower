import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, WorkflowStage, StandardTaskType, SeniorityLevel } from '../../types';
import { STANDARD_TASK_DEFINITIONS, SENIORITY_LABELS } from '../../data/standardTasks';
import { NewBriefModal } from './NewBriefModal';
import { TrafficDispatchModal } from './TrafficDispatchModal';
import { SeniorityAssignmentModal } from './SeniorityAssignmentModal';
import { DeliverableSubmissionModal } from './DeliverableSubmissionModal';
import { ManagerReviewModal } from './ManagerReviewModal';
import { CreativeStrategyModal } from './CreativeStrategyModal';
import { ClientEmailDispatchModal } from './ClientEmailDispatchModal';
import { ClientRevertModal } from './ClientRevertModal';
import { RevertConflictResolutionModal } from './RevertConflictResolutionModal';
import { DebriefPreparationModal } from './DebriefPreparationModal';
import { DebriefMeetingModal } from './DebriefMeetingModal';
import { WorkflowStatusBadge } from '../common/WorkflowStatusBadge';
import { SpotlightCard } from '../common/SpotlightCard';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeniorityBadge } from '../common/SeniorityBadge';
import { formatSeniority } from '../../utils/formatters';
import { OperationalEventStream } from './OperationalEventStream';
import {
  Workflow,
  Plus,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle,
  Filter,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileText,
  Activity,
  History,
  Mail,
  Lightbulb,
  CheckSquare,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AgencyWorkflowEngineView: React.FC = () => {
  const {
    jobs,
    users,
    brands,
    currentUser,
    clientApproveDeliverable,
    theme
  } = useApp();

  const isDark = theme === 'dark';
  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const isTraffic = currentUser.role === 'traffic_manager';
  const isClientService = currentUser.role === 'client_service';
  const isDisciplineLead = currentUser.role === 'manager' || currentUser.role === 'director' || currentUser.role === 'team_lead';
  const isEmployee = currentUser.role === 'employee';

  // Discipline Leads and Creative Director only see their own team's deliverables; GMs and Traffic see studio-wide
  const scopedBaseJobs = (isDisciplineLead && currentUser.teamId)
    ? jobs.filter((j) => j.teamId === currentUser.teamId)
    : jobs;

  // Sub-tab view: Deliverables board vs Operational Events stream
  const [engineSubView, setEngineSubView] = useState<'board' | 'events'>('board');

  // Filter state for workflow stages
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedTaskTypeFilter, setSelectedTaskTypeFilter] = useState<string>('all');

  // Modal states
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [debriefPrepModalJob, setDebriefPrepModalJob] = useState<Job | null>(null);
  const [debriefMeetingModalJob, setDebriefMeetingModalJob] = useState<Job | null>(null);
  const [strategyModalJob, setStrategyModalJob] = useState<Job | null>(null);
  const [trafficModalJob, setTrafficModalJob] = useState<Job | null>(null);
  const [assignmentModalJob, setAssignmentModalJob] = useState<Job | null>(null);
  const [submissionModalJob, setSubmissionModalJob] = useState<Job | null>(null);
  const [reviewModalJob, setReviewModalJob] = useState<Job | null>(null);
  const [clientEmailDispatchJob, setClientEmailDispatchJob] = useState<Job | null>(null);
  const [clientRevertModalJob, setClientRevertModalJob] = useState<Job | null>(null);
  const [conflictModalJob, setConflictModalJob] = useState<Job | null>(null);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);
  const [isPermissionsGuideOpen, setIsPermissionsGuideOpen] = useState(false);

  // Workflow Stages definitions for filter tabs - Complete Agency Lifecycle with Brainstorm Stage
  const STAGE_STEPS: { id: string; label: string; stage?: WorkflowStage; icon: any }[] = [
    { id: 'all', label: 'All Lifecycle', icon: Workflow },
    { id: 'debrief_prep', label: '1. Debrief Prep', stage: 'debrief_prep', icon: FileText },
    { id: 'debrief_ready', label: '2. Debrief Ready', stage: 'debrief_ready', icon: Layers },
    { id: 'debrief_meeting', label: '3. Team Debrief', stage: 'debrief_meeting', icon: Users },
    { id: 'creative_brainstorm', label: '4. Strategy & Brainstorm', stage: 'creative_brainstorm', icon: Sparkles },
    { id: 'traffic_assignment', label: '5. Staff Allocation', stage: 'traffic_assignment', icon: Send },
    { id: 'in_production', label: '6. In Production', stage: 'in_production', icon: Clock },
    { id: 'internal_review', label: '7. Creative Alignment', stage: 'internal_review', icon: UserCheck },
    { id: 'client_service_handoff', label: '8. CS Email Dispatch', stage: 'client_service_handoff', icon: Mail },
    { id: 'client_review', label: '9. Client Review', stage: 'client_review', icon: ExternalLink },
    { id: 'client_revert', label: '10. Reverts & Clashes', stage: 'client_revert', icon: RotateCcw },
    { id: 'completed', label: '11. Completed', stage: 'completed', icon: CheckCircle2 }
  ];

  // Filtered jobs
  const filteredJobs = scopedBaseJobs.filter((job) => {
    if (selectedStageFilter !== 'all') {
      if (job.workflowStage !== selectedStageFilter) return false;
    }
    if (selectedTaskTypeFilter !== 'all') {
      if (job.standardTaskType !== selectedTaskTypeFilter) return false;
    }
    return true;
  });

  // Calculate high-level pipeline counts within permitted scope
  const countInBrief = scopedBaseJobs.filter((j) => j.workflowStage === 'brief_intake' || j.workflowStage === 'debrief_prep').length;
  const countInDebrief = scopedBaseJobs.filter((j) => j.workflowStage === 'debrief_ready' || j.workflowStage === 'debrief_meeting').length;
  const countInBrainstorm = scopedBaseJobs.filter((j) => j.workflowStage === 'creative_brainstorm').length;
  const countInTraffic = scopedBaseJobs.filter((j) => j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment').length;
  const countInProd = scopedBaseJobs.filter((j) => j.workflowStage === 'in_production').length;
  const countInReview = scopedBaseJobs.filter((j) => j.workflowStage === 'internal_review').length;
  const countInHandoff = scopedBaseJobs.filter((j) => j.workflowStage === 'client_service_handoff').length;
  const countInClient = scopedBaseJobs.filter((j) => j.workflowStage === 'client_review').length;
  const countInRevert = scopedBaseJobs.filter((j) => j.workflowStage === 'client_revert').length;
  const countConflicts = scopedBaseJobs.filter((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header & Operational Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)',
                borderColor: 'var(--color-brand)'
              }}
            >
              <Workflow className="w-5 h-5" />
            </div>
            <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              Agency Workflow Engine
            </h1>
            <span
              className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-brand)'
              }}
            >
              Role: {isGM ? 'Executive (Governance)' : isTraffic ? 'Traffic Ops' : isClientService ? 'Client Services' : isDisciplineLead ? 'Creative Director / Lead' : 'Creative Specialist (IC)'}
            </span>
          </div>
          <p className={`text-xs max-w-3xl ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
            Role-governed creative agency lifecycle. Brief intake, debrief packs, strategy brainstorming, traffic dispatch, live creative alignment, work email dispatch, and client revert mediation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-border bg-surface">
            <button
              onClick={() => setEngineSubView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                engineSubView === 'board'
                  ? 'bg-surface-elevated text-text-primary shadow-xs border border-border'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Deliverables Flow</span>
            </button>
            <button
              onClick={() => setEngineSubView('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                engineSubView === 'events'
                  ? 'bg-surface-elevated text-text-primary shadow-xs border border-border'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Operational Event Log</span>
            </button>
          </div>

          <button
            onClick={() => setIsPermissionsGuideOpen(!isPermissionsGuideOpen)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              isPermissionsGuideOpen
                ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] text-[var(--color-brand)]'
                : 'bg-surface border-border hover:bg-surface-elevated text-text-secondary'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Role Ownership Matrix</span>
            {isPermissionsGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#0c1322] border-[#18243c] hover:border-[#233557] text-[#8b9bb4] hover:text-white'
                : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] text-[#475569]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Seniority Benchmarks</span>
          </button>

          {isClientService && (
            <button
              onClick={() => setIsNewBriefOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Client Brief</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Ownership & Workflow Governance Guide (Collapsible) */}
      {isPermissionsGuideOpen && (
        <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h3 className="text-sm font-bold text-text-primary">
                Tibule Workflow Engine • Role Boundaries &amp; Operational Ownership
              </h3>
            </div>
            <span className="text-[11px] font-mono text-text-tertiary">
              Enforces strict access separation: zero button bleed across departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Traffic Desk */}
            <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Send className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span>Traffic Desk</span>
              </div>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Brief intake triage &amp; status radar</li>
                <li>Convenes debrief meetings with CD</li>
                <li>Allocates creative staff against hours</li>
                <li>Mediates revert concurrency clashes</li>
                <li className="text-text-tertiary italic">Never produces artwork or submits to manager</li>
              </ul>
            </div>

            {/* Creative Staff */}
            <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Clock className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span>Creative Staff (IC)</span>
              </div>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Invited to debrief meetings (calendar synced)</li>
                <li>Participates in creative brainstorm sessions</li>
                <li>Builds master deliverable assets</li>
                <li>Submits for Live Alignment Review with Lead</li>
                <li className="text-text-tertiary italic">Never reassigns others or dispatches to client</li>
              </ul>
            </div>

            {/* Creative Director & Leads */}
            <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <UserCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span>Creative Director</span>
              </div>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Convenes debriefs &amp; prescribes hours</li>
                <li>Facilitates Strategy &amp; Brainstorm meetings</li>
                <li>Conducts Live Alignment Reviews with ICs</li>
                <li>Bounces ideas &amp; codifies revisions</li>
                <li className="text-text-tertiary italic">Approves deliverables to Client Services</li>
              </ul>
            </div>

            {/* Client Services */}
            <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Mail className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span>Client Services</span>
              </div>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Ingests client briefs &amp; client mail</li>
                <li>Authors debrief pack (Compulsory Attendee)</li>
                <li>Dispatches to client exclusively via work email</li>
                <li>Packages revert materials &amp; notes</li>
                <li>Logs client sign-offs and revert feedback</li>
              </ul>
            </div>

            {/* General Manager */}
            <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Eye className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span>General Manager</span>
              </div>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Studio-wide health &amp; bottleneck oversight</li>
                <li>Evidence vault &amp; executive audits</li>
                <li>Governance overrides &amp; escalation radar</li>
                <li className="text-text-tertiary italic">No worker operational buttons (pure governance)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Concurrency Conflict Alert Banner if conflicts active */}
      {countConflicts > 0 && (
        <div
          className="p-4 rounded-2xl border flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-critical) 12%, transparent)',
            borderColor: 'color-mix(in srgb, var(--color-critical) 35%, transparent)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs"
              style={{
                backgroundColor: 'var(--color-critical)',
                color: '#FFFFFF'
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-text-primary">
                {countConflicts} Assignee Concurrency Conflict{countConflicts > 1 ? 's' : ''} Detected
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                Client revert has cycled back while the original assignee is actively working on another job. Traffic mediation protocol required.
              </div>
            </div>
          </div>
          {isTraffic || isGM ? (
            <button
              onClick={() => {
                const conflictJob = jobs.find((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected);
                if (conflictJob) setConflictModalJob(conflictJob);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-critical)',
                color: '#FFFFFF'
              }}
            >
              Resolve Conflict
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border border-red-500/30 bg-red-500/10 text-red-500 shrink-0">
              Flagged to Traffic Desk for Mediation
            </div>
          )}
        </div>
      )}

      {/* Pipeline Summary Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { id: 'debrief_prep', altId: 'brief_intake', label: '1. Intake & Prep', count: countInBrief, sub: 'CS Briefs & Packs' },
          { id: 'debrief_meeting', altId: 'debrief_ready', label: '2. Debriefs', count: countInDebrief, sub: 'Calendar & Scope' },
          { id: 'creative_brainstorm', altId: '', label: '3. Brainstorm', count: countInBrainstorm, sub: 'Strategy Session' },
          { id: 'traffic_assignment', altId: '', label: '4. Allocation', count: countInTraffic, sub: 'Traffic Dispatch' },
          { id: 'in_production', altId: '', label: '5. Production', count: countInProd, sub: 'IC Benchmarks' },
          { id: 'internal_review', altId: '', label: '6. Alignment', count: countInReview, sub: 'Lead + IC Sync' },
          { id: 'client_service_handoff', altId: '', label: '7. CS Email', count: countInHandoff, sub: 'Work Email Dispatch' },
          { id: 'client_revert', altId: '', label: '8. Reverts', count: countInRevert, sub: 'Feedback Loops' }
        ].map((item) => {
          const isSelected = selectedStageFilter === item.id || (item.altId && selectedStageFilter === item.altId);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedStageFilter(item.id as WorkflowStage)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] shadow-xs'
                  : 'bg-surface border-border hover:bg-surface-elevated hover:border-border-subtle'
              }`}
            >
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">{item.label}</div>
              <div
                className="text-xl font-black mt-1"
                style={isSelected ? { color: 'var(--color-brand)' } : { color: 'var(--color-text-primary)' }}
              >
                {item.count}
              </div>
              <div className="text-[11px] text-text-tertiary truncate mt-0.5">{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Expandable Seniority Benchmark Velocity Matrix */}
      {isMatrixExpanded && (
        <div className="p-5 rounded-2xl border space-y-3 animate-in fade-in bg-surface border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <span>Agency Standard Deliverables &amp; Seniority Benchmark Table</span>
            </div>
            <span className="text-xs text-text-tertiary">
              Staff seniority mathematically dictates prescribed velocity hours per task archetype
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="py-2.5 px-3 font-semibold">Deliverable Archetype</th>
                  <th className="py-2.5 px-3 font-semibold">Complexity</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Junior</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Mid-Weight</th>
                  <th className="py-2.5 px-3 font-semibold text-center" style={{ color: 'var(--color-brand)' }}>Senior</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Lead</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Director</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(Object.keys(STANDARD_TASK_DEFINITIONS) as StandardTaskType[]).map((taskKey) => {
                  const def = STANDARD_TASK_DEFINITIONS[taskKey];
                  return (
                    <tr key={taskKey} className="hover:bg-surface-elevated/60 transition-colors">
                      <td className="py-2 px-3 font-bold">{def.type}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-elevated border border-border">
                          {def.complexityHint}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{def.benchmarks.junior}h</td>
                      <td className="py-2 px-3 text-center font-mono font-medium">{def.benchmarks.mid}h</td>
                      <td className="py-2 px-3 text-center font-mono font-bold" style={{ color: 'var(--color-brand)' }}>{def.benchmarks.senior}h</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{def.benchmarks.lead}h</td>
                      <td className="py-2 px-3 text-center font-mono font-semibold">{def.benchmarks.director}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view: Operational Event Log */}
      {engineSubView === 'events' ? (
        <OperationalEventStream />
      ) : (
        <>
          {/* Filter Tabs & Task Type Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-border/40">
            {/* Stages Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {STAGE_STEPS.map((step) => {
                const isSelected = selectedStageFilter === step.id;
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStageFilter(step.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'shadow-xs'
                        : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-border/60'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }
                        : undefined
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Task archetype filter dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-text-tertiary" />
              <select
                value={selectedTaskTypeFilter}
                onChange={(e) => setSelectedTaskTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs outline-hidden bg-surface text-text-primary"
              >
                <option value="all">All Task Archetypes</option>
                {(Object.keys(STANDARD_TASK_DEFINITIONS) as StandardTaskType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deliverables Board / Cards */}
          <div className="space-y-3.5">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border bg-surface border-border">
                <Workflow className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-50" />
                <h3 className="font-bold text-sm text-text-primary">No deliverables in this workflow stage</h3>
                <p className="text-xs text-text-tertiary mt-1">
                  Select another filter or submit a new brief to begin the agency lifecycle.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const assignee = users.find((u) => u.id === job.assigneeId);
                const manager = users.find((u) => u.id === job.managerId);
                const seniority = job.assignedSeniority || assignee?.seniority;
                const hasConflict = job.workflowStage === 'client_revert' && job.clientRevertInfo?.conflictDetected;
                const isAssignee = currentUser.id === job.assigneeId;
                const isInvitedDebrief = job.debriefMeeting?.attendees?.some((a) => a.userId === currentUser.id);

                return (
                  <SpotlightCard
                    key={job.id}
                    className="p-4"
                    style={hasConflict ? {
                      borderColor: isDark ? 'rgba(244,63,94,0.6)' : 'rgba(244,63,94,0.4)',
                      boxShadow: '0 0 20px rgba(244,63,94,0.15)'
                    } : undefined}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Column: Job Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs font-mono" style={{ color: 'var(--color-brand)' }}>{job.id}</span>
                          <span className="text-border text-xs">/</span>
                          <span className="text-[11px] font-mono uppercase font-bold text-text-tertiary">
                            {job.standardTaskType || job.category}
                          </span>
                          {seniority && (
                            <>
                              <span className="text-border text-xs">/</span>
                              <SeniorityBadge level={seniority} size="xs" />
                            </>
                          )}
                          <span className="text-border text-xs">/</span>
                          <PriorityBadge priority={job.priority} size="xs" />

                          <span className="text-border text-xs">·</span>
                          {/* Current Workflow Stage Indicator */}
                          <WorkflowStatusBadge
                            stage={job.workflowStage || 'in_production'}
                            size="sm"
                          />
                        </div>

                        <h3 className="text-sm font-bold leading-tight text-text-primary">{job.title}</h3>

                        <p className="text-xs line-clamp-2 text-text-secondary">
                          {job.description}
                        </p>

                        {/* People & Velocity Details */}
                        <div className="flex items-center gap-4 text-[11px] font-mono pt-1 text-text-tertiary flex-wrap">
                          <span>Client: <strong className="text-text-primary">{job.requestor}</strong></span>
                          <span>•</span>
                          <span>
                            Assignee: <strong className="text-text-primary">
                              {assignee ? `${assignee.name} (${assignee.seniority ? formatSeniority(assignee.seniority).toUpperCase() : 'STAFF'})` : 'Unassigned'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Lead / Director: <strong className="text-text-primary">{manager?.name || 'Elena Rostova'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Prescribed Time: <strong style={{ color: 'var(--color-brand)' }}>{job.estimatedHours}h</strong> (Logged: {job.actualHours}h)
                          </span>
                          <span>•</span>
                          <span>
                            Due: <strong className="text-text-primary">{new Date(job.dueDate).toLocaleDateString()}</strong>
                            {job.timelineShiftReason && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold" title={job.timelineShiftReason}>
                                Rescheduled
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Stage Specific Highlights on Card */}
                        {/* Timeline Shift / Dual-Track Time-share Callout */}
                        {job.timelineShiftReason && (
                          <div className="p-2.5 rounded-lg border border-border bg-surface-elevated text-xs mt-1 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              <span className="text-text-primary text-[11px]">
                                <strong>Traffic Schedule Shift:</strong> {job.timelineShiftReason}
                              </span>
                            </div>
                            {job.clientRevertInfo?.splitTimelineConfig && (
                              <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: 'var(--color-brand)' }}>
                                {job.clientRevertInfo.splitTimelineConfig.timeBlockSchedule}
                              </span>
                            )}
                          </div>
                        )}
                        {/* 1. Debrief Meeting Scheduled Callout */}
                        {job.debriefMeeting && (job.workflowStage === 'debrief_ready' || job.workflowStage === 'debrief_meeting') && (
                          <div className="p-2.5 rounded-lg border border-border bg-surface-elevated text-xs mt-1 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              <span className="text-text-primary font-medium">
                                <strong>Debrief Meeting:</strong> {job.debriefMeeting.calendarEventTime || 'Scheduled'}
                              </span>
                              <span className="text-text-tertiary font-mono text-[10px]">
                                • CS Submitter: {job.debriefMeeting.compulsoryCsSubmitterName || 'CS Lead'} (Compulsory)
                              </span>
                            </div>
                            <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: 'var(--color-brand)' }}>
                              ✓ App &amp; Teams Calendar Synced
                            </span>
                          </div>
                        )}

                        {/* 2. Creative Strategy & Brainstorm Callout */}
                        {job.workflowStage === 'creative_brainstorm' && (
                          <div className="p-2.5 rounded-lg border border-border bg-surface-elevated text-xs mt-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-text-primary flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                                <span>Creative Strategy &amp; Brainstorming Session</span>
                              </span>
                              <span className="text-[10px] text-text-tertiary font-mono">
                                Scope: {job.estimatedHours}h prescribed
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary">
                              Debrief squad convenes to figure out the creative approach and agreed angles before traffic allocates production.
                            </p>
                          </div>
                        )}

                        {/* 3. Creative Alignment Review Notes Callout */}
                        {job.creativeAlignmentSession && (
                          <div className="p-2.5 rounded-lg border text-xs mt-1 bg-surface-elevated border-border space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-text-primary flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                                <span>Creative Alignment Session ({job.creativeAlignmentSession.leadReviewerName} + {job.creativeAlignmentSession.assigneeName})</span>
                              </span>
                              <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--color-brand)' }}>
                                {job.creativeAlignmentSession.outcome === 'approved_to_client_services' ? '✓ Aligned & Approved' : 'Revisions Codified'}
                              </span>
                            </div>
                            {job.creativeAlignmentSession.codifiedChanges && job.creativeAlignmentSession.codifiedChanges.length > 0 && (
                              <div className="text-[11px] text-text-secondary pt-0.5">
                                <strong>Codified Changes:</strong> {job.creativeAlignmentSession.codifiedChanges.slice(0, 2).join(' • ')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. Client Email Dispatch Record */}
                        {job.clientEmailDispatch && (
                          <div className="p-2.5 rounded-lg border border-border bg-surface-elevated text-xs mt-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              <span className="text-text-primary">
                                Dispatched to <strong>{job.clientEmailDispatch.recipientEmail}</strong> via work email by {job.clientEmailDispatch.senderName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-text-tertiary">
                              {new Date(job.clientEmailDispatch.dispatchedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Deliverable Submission Callout */}
                        {job.deliverableSubmission && (
                          <div className="p-2.5 rounded-lg border text-xs mt-1 bg-surface-elevated border-border">
                            <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
                              Delivered by {job.deliverableSubmission.submitterName} for Creative Alignment Review
                            </div>
                            <div className="text-[11px] text-text-secondary truncate mt-0.5">
                              "{job.deliverableSubmission.summary}"
                            </div>
                          </div>
                        )}

                        {/* V2 WorkCycle Sequence */}
                        {job.workCycles && job.workCycles.length > 0 && (
                          <div className="pt-2 border-t border-border/50 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono uppercase text-text-tertiary font-semibold">
                              Work Cycles ({job.workCycles.length}):
                            </span>
                            {job.workCycles.map((cycle) => (
                              <div
                                key={cycle.id}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                                  cycle.cycleNumber === (job.activeCycleNumber || 1)
                                    ? 'bg-[var(--color-brand-muted)] border-[var(--color-brand)] font-bold text-text-primary'
                                    : 'bg-surface-elevated border-border text-text-tertiary'
                                }`}
                              >
                                <span>#{cycle.cycleNumber}</span>
                                <span className="opacity-70">
                                  {cycle.cycleType === 'initial_production' ? 'Initial' : cycle.cycleType === 'client_revert_revision' ? 'Client Revert' : 'Revision'}
                                </span>
                                {cycle.reworkEffort > 0 && (
                                  <span className="font-semibold" style={{ color: 'var(--color-critical)' }}>+{cycle.reworkEffort}h</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Client Revert Conflict Callout if present */}
                        {hasConflict && (
                          <div
                            className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-critical) 12%, transparent)',
                              borderColor: 'color-mix(in srgb, var(--color-critical) 35%, transparent)'
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-critical)' }} />
                              <span className="text-text-primary">
                                <strong>Concurrency Conflict:</strong> {assignee?.name} is actively working on [{job.clientRevertInfo?.conflictingJobId}].
                              </span>
                            </div>
                            {isTraffic || isGM ? (
                              <button
                                onClick={() => setConflictModalJob(job)}
                                className="px-3 py-1 rounded-lg text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--color-critical)',
                                  color: '#FFFFFF'
                                }}
                              >
                                Resolve Conflict
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-red-500 shrink-0">
                                Traffic Mediation Pending
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Stage-Specific Action Buttons with Strict Role Gating */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 shrink-0">
                        {/* STAGE 1: Brief Intake / Debrief Prep */}
                        {(job.workflowStage === 'brief_intake' || job.workflowStage === 'debrief_prep') && (
                          isClientService ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setDebriefPrepModalJob(job)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--color-brand)',
                                  color: 'var(--color-brand-contrast)'
                                }}
                              >
                                <FileText className="w-3.5 h-3.5" /> Prepare Debrief Pack
                              </button>
                            </div>
                          ) : isGM ? (
                            <button
                              onClick={() => setDebriefPrepModalJob(job)}
                              className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-text-secondary flex items-center gap-1 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" /> Inspect Brief &amp; Scope
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> CS Preparing Debrief Pack
                            </span>
                          )
                        )}

                        {/* STAGE 2: Debrief Ready (CS Pack Prepared, Traffic/CD to Schedule Session) */}
                        {job.workflowStage === 'debrief_ready' && (
                          (isTraffic || isDisciplineLead || isGM) ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setDebriefMeetingModalJob(job)}
                                className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--color-brand)',
                                  color: 'var(--color-brand-contrast)'
                                }}
                              >
                                <Calendar className="w-3.5 h-3.5" /> Schedule &amp; Convene Debrief
                              </button>
                              <button
                                onClick={() => setDebriefPrepModalJob(job)}
                                className="px-3 py-2 rounded-xl border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Inspect CS Debrief Pack"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Inspect CS Pack</span>
                              </button>
                            </div>
                          ) : isClientService ? (
                            <button
                              onClick={() => setDebriefPrepModalJob(job)}
                              className="px-3 py-1.5 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> CS Pack Ready (Awaiting Traffic Schedule)
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" /> Debrief Pack Ready (Awaiting Schedule)
                            </span>
                          )
                        )}

                        {/* STAGE 3: Team Debrief (Meeting Called & In Session) */}
                        {job.workflowStage === 'debrief_meeting' && (
                          (isTraffic || isDisciplineLead || isGM) ? (
                            <button
                              onClick={() => setDebriefMeetingModalJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <Users className="w-3.5 h-3.5" /> Conduct Debrief &amp; Prescribe Hours
                            </button>
                          ) : isClientService ? (
                            <button
                              onClick={() => setDebriefMeetingModalJob(job)}
                              className="px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> Attend Debrief (CS Submitter)
                            </button>
                          ) : isInvitedDebrief ? (
                            <button
                              onClick={() => setDebriefMeetingModalJob(job)}
                              className="px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              <span>Attend Debrief (Calendar Synced)</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono">
                              Debrief In Session
                            </span>
                          )
                        )}

                        {/* STAGE 4: Creative Strategy & Brainstorming Session */}
                        {job.workflowStage === 'creative_brainstorm' && (
                          (isDisciplineLead || isGM) ? (
                            <button
                              onClick={() => setStrategyModalJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Facilitate Strategy &amp; Brainstorm
                            </button>
                          ) : (isEmployee && isInvitedDebrief) ? (
                            <button
                              onClick={() => setStrategyModalJob(job)}
                              className="px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              <span>Join Brainstorm Session</span>
                            </button>
                          ) : isClientService ? (
                            <button
                              onClick={() => setStrategyModalJob(job)}
                              className="px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> Attend Strategy Sync
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Strategy &amp; Brainstorm Sync
                            </span>
                          )
                        )}

                        {/* STAGE 5: Traffic Staff Allocation */}
                        {(job.workflowStage === 'traffic_assignment' || job.workflowStage === 'manager_assignment') && (
                          (isTraffic || isDisciplineLead || isGM) ? (
                            <button
                              onClick={() => setAssignmentModalJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Traffic: Allocate Specialist
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5" /> Traffic Allocating Creative Specialist
                            </span>
                          )
                        )}

                        {/* STAGE 6: In Production */}
                        {job.workflowStage === 'in_production' && (
                          isAssignee ? (
                            <button
                              onClick={() => setSubmissionModalJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Submit Work for Creative Alignment
                            </button>
                          ) : isDisciplineLead ? (
                            <button
                              onClick={() => setSubmissionModalJob(job)}
                              className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" /> In Production (Lead Oversight)
                            </button>
                          ) : isGM ? (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-secondary text-xs font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> In Production • {assignee?.name || 'Assigned'}
                            </span>
                          ) : isTraffic ? (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Production Active • {job.estimatedHours}h
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Studio In Production
                            </span>
                          )
                        )}

                        {/* STAGE 7: Internal Review & Creative Alignment Session */}
                        {job.workflowStage === 'internal_review' && (
                          (isDisciplineLead || isGM) ? (
                            <button
                              onClick={() => setReviewModalJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Creative Alignment Session (Lead + IC)
                            </button>
                          ) : isAssignee ? (
                            <button
                              onClick={() => setReviewModalJob(job)}
                              className="px-3 py-2 rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-[var(--color-brand)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> In Alignment Review with Lead
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5" /> Creative Alignment Active
                            </span>
                          )
                        )}

                        {/* STAGE 8: Client Services Handoff & Work Email Dispatch */}
                        {job.workflowStage === 'client_service_handoff' && (
                          (isClientService || isGM) ? (
                            <button
                              onClick={() => setClientEmailDispatchJob(job)}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-contrast)'
                              }}
                            >
                              <Mail className="w-3.5 h-3.5" /> Dispatch via Work Email
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} /> CS Packaging Work Email
                            </span>
                          )
                        )}

                        {/* STAGE 9: Client Review */}
                        {job.workflowStage === 'client_review' && (
                          (isClientService || isGM) ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setClientRevertModalJob(job)}
                                className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-primary hover:border-[var(--color-critical)] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--color-critical)' }} /> Log Client Revert
                              </button>
                              <button
                                onClick={() => clientApproveDeliverable(job.id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--color-brand)',
                                  color: 'var(--color-brand-contrast)'
                                }}
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Client Signoff
                              </button>
                            </div>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-tertiary text-xs font-mono flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" /> Under Client Review
                            </span>
                          )
                        )}

                        {/* STAGE 10: Client Revert */}
                        {job.workflowStage === 'client_revert' && (
                          <div className="flex items-center gap-2">
                            {hasConflict && (isTraffic || isGM) && (
                              <button
                                onClick={() => setConflictModalJob(job)}
                                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--color-critical)',
                                  color: '#FFFFFF'
                                }}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" /> Resolve Conflict
                              </button>
                            )}
                            {(isTraffic || isGM) ? (
                              <button
                                onClick={() => setAssignmentModalJob(job)}
                                className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-surface-elevated transition-colors cursor-pointer"
                              >
                                Reassign / Re-route
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg border border-border bg-surface-elevated text-text-secondary text-xs font-mono">
                                In Traffic Triage
                              </span>
                            )}
                          </div>
                        )}

                        {/* STAGE 11: Completed */}
                        {job.workflowStage === 'completed' && (
                          <span className="px-3 py-1.5 rounded-xl border border-border bg-surface-elevated text-text-primary text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} /> Final Approved
                          </span>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Modals Mounted */}
      {isClientService && (
        <NewBriefModal
          isOpen={isNewBriefOpen}
          onClose={() => setIsNewBriefOpen(false)}
        />
      )}

      <DebriefPreparationModal
        job={debriefPrepModalJob}
        isOpen={!!debriefPrepModalJob}
        onClose={() => setDebriefPrepModalJob(null)}
      />

      <DebriefMeetingModal
        job={debriefMeetingModalJob}
        isOpen={!!debriefMeetingModalJob}
        onClose={() => setDebriefMeetingModalJob(null)}
      />

      <CreativeStrategyModal
        job={strategyModalJob}
        isOpen={!!strategyModalJob}
        onClose={() => setStrategyModalJob(null)}
      />

      <TrafficDispatchModal
        job={trafficModalJob}
        isOpen={!!trafficModalJob}
        onClose={() => setTrafficModalJob(null)}
      />

      <SeniorityAssignmentModal
        job={assignmentModalJob}
        isOpen={!!assignmentModalJob}
        onClose={() => setAssignmentModalJob(null)}
      />

      <DeliverableSubmissionModal
        job={submissionModalJob}
        isOpen={!!submissionModalJob}
        onClose={() => setSubmissionModalJob(null)}
      />

      <ManagerReviewModal
        job={reviewModalJob}
        isOpen={!!reviewModalJob}
        onClose={() => setReviewModalJob(null)}
      />

      <ClientEmailDispatchModal
        job={clientEmailDispatchJob}
        isOpen={!!clientEmailDispatchJob}
        onClose={() => setClientEmailDispatchJob(null)}
      />

      <ClientRevertModal
        job={clientRevertModalJob}
        isOpen={!!clientRevertModalJob}
        onClose={() => setClientRevertModalJob(null)}
        onConflictDetected={(jobId) => {
          const target = jobs.find((j) => j.id === jobId);
          if (target) setConflictModalJob(target);
        }}
      />

      <RevertConflictResolutionModal
        job={conflictModalJob}
        isOpen={!!conflictModalJob}
        onClose={() => setConflictModalJob(null)}
      />
    </div>
  );
};
