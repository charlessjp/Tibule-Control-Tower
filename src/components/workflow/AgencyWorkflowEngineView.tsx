import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, WorkflowStage, StandardTaskType, SeniorityLevel } from '../../types';
import { STANDARD_TASK_DEFINITIONS, SENIORITY_LABELS } from '../../data/standardTasks';
import { NewBriefModal } from './NewBriefModal';
import { TrafficDispatchModal } from './TrafficDispatchModal';
import { SeniorityAssignmentModal } from './SeniorityAssignmentModal';
import { DeliverableSubmissionModal } from './DeliverableSubmissionModal';
import { ManagerReviewModal } from './ManagerReviewModal';
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
  History
} from 'lucide-react';

export const AgencyWorkflowEngineView: React.FC = () => {
  const {
    jobs,
    users,
    brands,
    currentUser,
    clientServiceSendToClient,
    clientApproveDeliverable,
    callDebriefMeeting,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  // Sub-tab view: Deliverables board vs Operational Events stream
  const [engineSubView, setEngineSubView] = useState<'board' | 'events'>('board');

  // Filter state for workflow stages
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedTaskTypeFilter, setSelectedTaskTypeFilter] = useState<string>('all');

  // Modal states
  const [isNewBriefOpen, setIsNewBriefOpen] = useState(false);
  const [debriefPrepModalJob, setDebriefPrepModalJob] = useState<Job | null>(null);
  const [debriefMeetingModalJob, setDebriefMeetingModalJob] = useState<Job | null>(null);
  const [trafficModalJob, setTrafficModalJob] = useState<Job | null>(null);
  const [assignmentModalJob, setAssignmentModalJob] = useState<Job | null>(null);
  const [submissionModalJob, setSubmissionModalJob] = useState<Job | null>(null);
  const [reviewModalJob, setReviewModalJob] = useState<Job | null>(null);
  const [clientRevertModalJob, setClientRevertModalJob] = useState<Job | null>(null);
  const [conflictModalJob, setConflictModalJob] = useState<Job | null>(null);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);

  // Workflow Stages definitions for filter tabs - Updated Ghanaian Creative Agency Lifecycle
  const STAGE_STEPS: { id: string; label: string; stage?: WorkflowStage; icon: any }[] = [
    { id: 'all', label: 'All Lifecycle', icon: Workflow },
    { id: 'debrief_prep', label: '1. Debrief Prep', stage: 'debrief_prep', icon: FileText },
    { id: 'debrief_ready', label: '2. Debrief Pack Ready', stage: 'debrief_ready', icon: Layers },
    { id: 'debrief_meeting', label: '3. Team Debrief', stage: 'debrief_meeting', icon: Users },
    { id: 'traffic_assignment', label: '4. Traffic Assignment', stage: 'traffic_assignment', icon: Send },
    { id: 'in_production', label: '5. In Production', stage: 'in_production', icon: Clock },
    { id: 'internal_review', label: '6. Manager Review', stage: 'internal_review', icon: UserCheck },
    { id: 'client_service_handoff', label: '7. Client Service', stage: 'client_service_handoff', icon: ArrowRight },
    { id: 'client_review', label: '8. Client Review', stage: 'client_review', icon: ExternalLink },
    { id: 'client_revert', label: '9. Reverts & Loops', stage: 'client_revert', icon: RotateCcw },
    { id: 'completed', label: '10. Completed', stage: 'completed', icon: CheckCircle2 }
  ];

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (selectedStageFilter !== 'all') {
      if (job.workflowStage !== selectedStageFilter) return false;
    }
    if (selectedTaskTypeFilter !== 'all') {
      if (job.standardTaskType !== selectedTaskTypeFilter) return false;
    }
    return true;
  });

  // Calculate high-level pipeline counts
  const countInBrief = jobs.filter((j) => j.workflowStage === 'brief_intake').length;
  const countInTraffic = jobs.filter((j) => j.workflowStage === 'manager_assignment').length;
  const countInProd = jobs.filter((j) => j.workflowStage === 'in_production').length;
  const countInReview = jobs.filter((j) => j.workflowStage === 'internal_review').length;
  const countInClient = jobs.filter((j) => j.workflowStage === 'client_review' || j.workflowStage === 'client_service_handoff').length;
  const countInRevert = jobs.filter((j) => j.workflowStage === 'client_revert').length;
  const countConflicts = jobs.filter((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected).length;

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
              Agency Deliverables & Briefs Workflow Engine
            </h1>
          </div>
          <p className={`text-xs max-w-3xl ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
            End-to-end agency operational lifecycle: 
            Client Service brief intake → Traffic Manager routing → Manager seniority timeline prescription → Production → Internal Sign-off → Client dispatch → Revert loops & concurrency conflict resolution.
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
            onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#0c1322] border-[#18243c] hover:border-[#233557] text-[#8b9bb4] hover:text-white'
                : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] text-[#475569]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Seniority Matrix</span>
          </button>

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
        </div>
      </div>

      {/* Concurrency Conflict Alert Banner if conflicts active */}
      {countConflicts > 0 && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 animate-pulse ${
            isDark ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {countConflicts} Assignee Concurrency Conflict{countConflicts > 1 ? 's' : ''} Detected!
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                Client revert has cycled back while the original assignee is actively working on another job. Use the Conflict Resolution Protocol to prevent thrashing.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const conflictJob = jobs.find((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected);
              if (conflictJob) setConflictModalJob(conflictJob);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            Resolve Conflict Now
          </button>
        </div>
      )}

      {/* Pipeline Summary Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        <div
          onClick={() => setSelectedStageFilter('brief_intake')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'brief_intake'
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">1. Intake</div>
          <div className="text-xl font-black mt-1" style={{ color: 'var(--color-brand)' }}>{countInBrief}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Client Service Briefs</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('manager_assignment')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'manager_assignment'
              ? 'bg-[var(--color-warning)]/15 border-[var(--color-warning)] shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">2. Traffic Route</div>
          <div className="text-xl font-black mt-1 text-[var(--color-warning)]">{countInTraffic}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Traffic Dispatch</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('in_production')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'in_production'
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">3. Production</div>
          <div className="text-xl font-black mt-1" style={{ color: 'var(--color-brand)' }}>{countInProd}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Staff Seniority Benchmarks</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('internal_review')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'internal_review'
              ? 'bg-[var(--color-strategic)]/15 border-[var(--color-strategic)] shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">4. Mgr Review</div>
          <div className="text-xl font-black mt-1 text-[var(--color-strategic)]">{countInReview}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Approval / Feedback</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('client_service_handoff')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'client_service_handoff'
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">5. CS Dispatch</div>
          <div className="text-xl font-black mt-1" style={{ color: 'var(--color-brand)' }}>{countInClient}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Sent to Client</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('client_revert')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'client_revert'
              ? 'bg-[var(--color-critical)]/15 border-[var(--color-critical)] shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">6. Reverts</div>
          <div className="text-xl font-black mt-1 text-[var(--color-critical)]">{countInRevert}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Corrections Loop</div>
        </div>

        <div
          onClick={() => setSelectedStageFilter('all')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedStageFilter === 'all'
              ? 'bg-[var(--color-success)]/15 border-[var(--color-success)] shadow-sm'
              : 'bg-surface border-border hover:border-border-subtle'
          }`}
        >
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Total Pipeline</div>
          <div className="text-xl font-black mt-1 text-[var(--color-success)]">{jobs.length}</div>
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">Active Deliverables</div>
        </div>
      </div>

      {/* Expandable Seniority Benchmark Velocity Matrix */}
      {isMatrixExpanded && (
        <div
          className="p-5 rounded-2xl border space-y-3 animate-in fade-in bg-surface border-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <span>Agency Standard Deliverables & Seniority Benchmark Table</span>
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-elevated border border-border font-bold text-text-secondary">
                        {job.standardTaskType || job.category}
                      </span>
                      {seniority && (
                        <SeniorityBadge level={seniority} size="xs" />
                      )}
                      <PriorityBadge priority={job.priority} size="xs" />

                      {/* Current Workflow Stage Badge */}
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
                        Manager: <strong className="text-text-primary">{manager?.name || 'Elena Rostova'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Prescribed Time: <strong style={{ color: 'var(--color-brand)' }}>{job.estimatedHours}h</strong> (Logged: {job.actualHours}h)
                      </span>
                      <span>•</span>
                      <span>
                        Due: <strong className="text-text-primary">{new Date(job.dueDate).toLocaleDateString()}</strong>
                      </span>
                    </div>

                    {/* Submission / Feedback Callout if present */}
                    {job.deliverableSubmission && (
                      <div className="p-2.5 rounded-lg border text-xs mt-1 bg-surface-elevated border-border">
                        <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
                          Delivered by {job.deliverableSubmission.submitterName} for Manager Review
                        </div>
                        <div className="text-[11px] text-text-secondary truncate mt-0.5">
                          "{job.deliverableSubmission.summary}"
                        </div>
                      </div>
                    )}

                    {/* V2 WorkCycle Sequence & Rework Audit Strip */}
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
                                ? 'bg-[var(--color-brand)]/15 border-[var(--color-brand)] font-bold text-text-primary'
                                : 'bg-surface-elevated border-border text-text-tertiary'
                            }`}
                          >
                            <span>#{cycle.cycleNumber}</span>
                            <span className="opacity-70">
                              {cycle.cycleType === 'initial_production' ? 'Initial' : cycle.cycleType === 'client_revert_revision' ? 'Client Revert' : 'Revision'}
                            </span>
                            {cycle.managerOverrideReason && (
                              <span className="text-amber-400 font-bold" title={cycle.managerOverrideReason}>★</span>
                            )}
                            {cycle.reworkEffort > 0 && (
                              <span className="text-rose-400 font-semibold">+{cycle.reworkEffort}h</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Client Revert Conflict Callout if present */}
                    {hasConflict && (
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>
                            <strong>Concurrency Conflict:</strong> {assignee?.name} is actively working on [{job.clientRevertInfo?.conflictingJobId}].
                          </span>
                        </div>
                        <button
                          onClick={() => setConflictModalJob(job)}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          Resolve Conflict
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Stage-Specific Action Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 shrink-0">
                    {/* Updated Stage 1: Brief Intake / Debrief Prep */}
                    {(job.workflowStage === 'brief_intake' || job.workflowStage === 'debrief_prep') && (
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
                        <button
                          onClick={() => setTrafficModalJob(job)}
                          className="px-2.5 py-2 rounded-xl border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                          title="Direct Traffic Handoff"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Updated Stage 2: Debrief Pack Ready -> Traffic calls Team Debrief */}
                    {job.workflowStage === 'debrief_ready' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDebriefMeetingModalJob(job)}
                          className="px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-contrast)'
                          }}
                        >
                          <Users className="w-3.5 h-3.5" /> Call Team Debrief
                        </button>
                        <button
                          onClick={() => setDebriefPrepModalJob(job)}
                          className="px-2.5 py-2 rounded-xl border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                          title="Inspect Debrief Material"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Updated Stage 3: Debrief Meeting -> Conduct Meeting & Prescribe Hours */}
                    {job.workflowStage === 'debrief_meeting' && (
                      <button
                        onClick={() => setDebriefMeetingModalJob(job)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Conduct Debrief & Prescribe Hours
                      </button>
                    )}

                    {/* Updated Stage 4: Traffic Assignment -> Allocate Staff or Direct to Manager */}
                    {(job.workflowStage === 'traffic_assignment' || job.workflowStage === 'manager_assignment') && (
                      <button
                        onClick={() => setAssignmentModalJob(job)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Traffic: Allocate Task
                      </button>
                    )}

                    {/* Stage 5: In Production -> Submit Deliverable */}
                    {job.workflowStage === 'in_production' && (
                      <button
                        onClick={() => setSubmissionModalJob(job)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submit Work to Manager
                      </button>
                    )}

                    {/* Stage 4: Internal Review -> Manager Review & Feedback */}
                    {job.workflowStage === 'internal_review' && (
                      <button
                        onClick={() => setReviewModalJob(job)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Manager Review & Decision
                      </button>
                    )}

                    {/* Stage 5: Client Service Handoff -> Dispatch to Client */}
                    {job.workflowStage === 'client_service_handoff' && (
                      <button
                        onClick={() => clientServiceSendToClient(job.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch to Client
                      </button>
                    )}

                    {/* Stage 6: Client Review -> Client Reverts or Client Signoff */}
                    {job.workflowStage === 'client_review' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setClientRevertModalJob(job)}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Client Reverts
                        </button>
                        <button
                          onClick={() => clientApproveDeliverable(job.id)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Client Signoff
                        </button>
                      </div>
                    )}

                    {/* Stage 7: Client Revert -> Conflict resolution or Re-production */}
                    {job.workflowStage === 'client_revert' && (
                      <div className="flex items-center gap-2">
                        {hasConflict && (
                          <button
                            onClick={() => setConflictModalJob(job)}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Resolve Conflict
                          </button>
                        )}
                        <button
                          onClick={() => setAssignmentModalJob(job)}
                          className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-surface-elevated transition-colors cursor-pointer"
                        >
                          Reassign
                        </button>
                      </div>
                    )}

                    {/* Stage 8: Completed */}
                    {job.workflowStage === 'completed' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Final Approved
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
      <NewBriefModal
        isOpen={isNewBriefOpen}
        onClose={() => setIsNewBriefOpen(false)}
      />

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
