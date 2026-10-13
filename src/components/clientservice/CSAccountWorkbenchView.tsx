import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  Building2,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Plus,
  ChevronRight,
  RotateCcw,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare
} from 'lucide-react';

interface CSAccountWorkbenchViewProps {
  onOpenBriefModal: () => void;
  onOpenRevertModal: (job: any) => void;
}

export const CSAccountWorkbenchView: React.FC<CSAccountWorkbenchViewProps> = ({
  onOpenBriefModal,
  onOpenRevertModal
}) => {
  const {
    jobs,
    brands,
    users,
    currentUser,
    setSelectedJobId,
    setActiveView,
    accountCommitments
  } = useApp();

  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all_account_jobs' | 'awaiting_action' | 'my_specialist_execution'>('all_account_jobs');

  // Filter accounts where current user is lead or all accounts if manager
  const userAccounts = useMemo(() => {
    return accountCommitments.filter((c) => c.employeeId === currentUser.id);
  }, [accountCommitments, currentUser]);

  // Client jobs filtered by brand
  const scopedJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (selectedBrandId !== 'all' && j.brandId !== selectedBrandId) return false;
      return true;
    });
  }, [jobs, selectedBrandId]);

  // Jobs where current user is assigned specialist execution work personally
  const myPersonalSpecialistJobs = useMemo(() => {
    return jobs.filter((j) => j.assigneeId === currentUser.id && j.status !== 'completed');
  }, [jobs, currentUser]);

  const briefIntakeJobs = scopedJobs.filter((j) => j.workflowStage === 'brief_intake' || j.workflowStage === 'debrief_prep');
  const readyForSendJobs = scopedJobs.filter((j) => j.workflowStage === 'client_service_handoff');
  const underClientReviewJobs = scopedJobs.filter((j) => j.workflowStage === 'client_review');
  const clientRevertJobs = scopedJobs.filter((j) => j.workflowStage === 'client_revert');

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-surface-elevated border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
            <Building2 className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <span>Account Leadership &amp; Brief Ownership</span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary mt-1">
            Client Services Account Workbench
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Governing assigned brand portfolios, client debrief velocity, deliverable dispatch schedules, and personal specialist execution.
          </p>
        </div>

        <button
          onClick={onOpenBriefModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 self-start sm:self-center shrink-0"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-brand-contrast)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Client Brief</span>
        </button>
      </div>

      {/* Brand Accounts Filter Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-mono text-text-tertiary mr-1 shrink-0">Brand Filter:</span>
        <button
          onClick={() => setSelectedBrandId('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
            selectedBrandId === 'all'
              ? 'bg-brand text-brand-contrast font-bold shadow-xs'
              : 'border border-border bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          All Brands ({brands.length})
        </button>
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBrandId(b.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer border ${
              selectedBrandId === b.id
                ? 'border-brand bg-brand-muted text-brand font-bold shadow-xs'
                : 'border-border bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Briefs in Intake</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">{briefIntakeJobs.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Debrief prep required</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Ready for Client Send</div>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">{readyForSendJobs.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Approved deliverables</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">Under Client Review</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">{underClientReviewJobs.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Awaiting feedback</div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
          <div className="text-[10px] font-mono uppercase text-text-tertiary">My Execution Tasks</div>
          <div className="text-2xl font-bold font-mono text-brand mt-1">{myPersonalSpecialistJobs.length}</div>
          <div className="text-[10px] text-text-secondary mt-0.5">Specialist assignments</div>
        </div>
      </div>

      {/* Sub-Tabs: Account Jobs vs My Specialist Execution Work */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab('all_account_jobs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'all_account_jobs'
              ? 'bg-brand text-brand-contrast font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Account Deliverables ({scopedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('awaiting_action')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'awaiting_action'
              ? 'bg-brand text-brand-contrast font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Awaiting Action / Dispatch ({readyForSendJobs.length + clientRevertJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('my_specialist_execution')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'my_specialist_execution'
              ? 'bg-brand text-brand-contrast font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          My Specialist Execution Work ({myPersonalSpecialistJobs.length})
        </button>
      </div>

      {/* Tab 1 & 2: Deliverable Cards */}
      {activeTab !== 'my_specialist_execution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(activeTab === 'awaiting_action'
            ? [...readyForSendJobs, ...clientRevertJobs]
            : scopedJobs
          ).map((job) => {
            const isRevert = job.workflowStage === 'client_revert';
            const isReadySend = job.workflowStage === 'client_service_handoff';

            return (
              <SpotlightCard
                key={job.id}
                className={`p-4 space-y-3 border-l-4 ${
                  isRevert
                    ? 'border-l-rose-500'
                    : isReadySend
                    ? 'border-l-amber-500'
                    : 'border-l-brand'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-tertiary">{job.id}</span>
                      <span className="text-[10px] font-mono font-bold uppercase text-brand">
                        {job.discipline || 'Client Services'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-text-primary mt-0.5 line-clamp-1">{job.title}</h4>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      Brand: <strong className="text-text-secondary">{job.clientProject}</strong>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-elevated text-text-secondary uppercase">
                    {job.workflowStage.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2">
                  {job.briefSummary || 'Campaign deliverable advancing through client service governance.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="text-[10px] font-mono text-text-tertiary">
                    Assignee: <strong>{job.assigneeName || 'Traffic Queue'}</strong> · Due: <strong>{job.dueDate}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isRevert && (
                      <button
                        onClick={() => onOpenRevertModal(job)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert Action</span>
                      </button>
                    )}
                    {isReadySend && (
                      <button
                        onClick={() => setActiveView('agency_workflow')}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-900 hover:bg-amber-600 cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send to Client</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="px-2 py-1 rounded-lg border border-border text-text-tertiary hover:text-text-primary text-xs cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Tab 3: Personal Specialist Execution (Demonstrating Senior AM Execution) */}
      {activeTab === 'my_specialist_execution' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-muted/20 border border-brand/30 text-xs text-text-secondary space-y-1">
            <strong className="text-brand block font-bold uppercase font-mono text-[10px]">
              Seniority Independence Principle (Section 2.1)
            </strong>
            <p>
              Being a Senior Account Manager or Account Manager does not exclude someone from being assigned execution work.
              These deliverables represent specialist tasks assigned directly to you in your functional discipline capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myPersonalSpecialistJobs.map((job) => (
              <SpotlightCard key={job.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand">{job.id}</span>
                    <h4 className="font-bold text-sm text-text-primary">{job.title}</h4>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      Client: {job.clientProject} · Discipline: <strong>{job.discipline}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-elevated text-text-secondary uppercase">
                    {job.workflowStage.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="text-[10px] font-mono text-text-tertiary">
                    Planned Effort: <strong>{job.estimatedHours}h</strong> · Due: <strong>{job.dueDate}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedJobId(job.id)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-brand text-brand-contrast hover:opacity-90 cursor-pointer"
                  >
                    Open Workspace
                  </button>
                </div>
              </SpotlightCard>
            ))}
            {myPersonalSpecialistJobs.length === 0 && (
              <p className="col-span-2 text-center p-6 text-text-tertiary italic bg-surface rounded-2xl border border-dashed border-border">
                No direct specialist execution tasks currently assigned to your profile.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
