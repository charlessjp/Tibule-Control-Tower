import React from 'react';
import { OrganogramNode, getUpwardReportingChain } from '../../utils/organogramTreeEngine';
import { useApp } from '../../context/AppContext';
import { CONFIRMED_CS_DISCIPLINES } from '../../data/clientServicesOperatingModel';
import {
  X,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Mail,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface OrganogramDetailDrawerProps {
  selectedNode: OrganogramNode | null;
  rootNode: OrganogramNode | null;
  onClose: () => void;
  onSelectNode: (node: OrganogramNode) => void;
}

export const OrganogramDetailDrawer: React.FC<OrganogramDetailDrawerProps> = ({
  selectedNode,
  rootNode,
  onClose,
  onSelectNode
}) => {
  const { jobs, discrepancyAlerts, disciplineAssignments, timesheetEntries } = useApp();

  if (!selectedNode) return null;

  // Compute upward reporting chain up to GM
  const upwardChain = rootNode
    ? getUpwardReportingChain(selectedNode.id, rootNode)
    : [selectedNode];

  // Active deliverables assigned to this practitioner
  const userJobs = jobs.filter(
    (j) => j.assigneeId === selectedNode.id && j.status !== 'completed'
  );

  // Active discrepancy alerts for this practitioner
  const userAlerts = discrepancyAlerts.filter(
    (a) => a.userId === selectedNode.id && a.status !== 'reconciled'
  );

  // Timesheets entries for this practitioner
  const userEntries = timesheetEntries.filter((e) => e.userId === selectedNode.id);
  const accountMgmtHours = userEntries
    .filter((e) => e.disciplineId === 'account_management')
    .reduce((sum, e) => sum + e.hours, 0);
  const disciplineHours = selectedNode.weeklyLoggedHours - accountMgmtHours;

  // Department theme badge: Creative=Yellow, Traffic=Signal Pink, Client Services=Sky Blue, Executive=Royal Violet
  const deptStyle = {
    executive: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    client_services: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    creative: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    traffic: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  }[selectedNode.department] || 'bg-brand/10 text-brand border-brand/30';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface border-l border-border z-50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border/80 flex items-start justify-between gap-3 bg-surface-elevated/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand border border-brand/30 flex items-center justify-center font-bold text-sm shrink-0">
              {selectedNode.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${deptStyle}`}>
                  {selectedNode.department.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary uppercase">
                  {selectedNode.seniority.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary mt-0.5">
                {selectedNode.name}
              </h3>
              <p className="text-xs text-text-secondary">
                {selectedNode.jobTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Email / Contact pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary bg-surface-elevated p-2.5 rounded-xl border border-border">
            <Mail className="w-4 h-4 text-text-tertiary shrink-0" />
            <span className="truncate">{selectedNode.email}</span>
          </div>

          {/* 1. Chain of Command (Upward Breadcrumbs) */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Reporting Chain to General Manager
            </h4>
            <div className="bg-surface-elevated border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                {upwardChain.map((step, idx) => {
                  const isCurrent = step.id === selectedNode.id;
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => !isCurrent && onSelectNode(step)}
                        disabled={isCurrent}
                        className={`text-left rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-brand/20 text-brand font-bold cursor-default'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                        }`}
                      >
                        {step.name}
                      </button>
                      {idx < upwardChain.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Direct Reports Subtree List */}
          {selectedNode.children.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                  Direct Reports ({selectedNode.directReportsCount})
                </h4>
                <span className="text-[11px] font-mono text-text-tertiary">
                  Total Subtree: {selectedNode.totalSubtreeHeadcount - 1} members
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedNode.children.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSelectNode(sub)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border hover:border-brand/40 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center font-mono text-[11px] font-bold text-text-secondary shrink-0">
                        {sub.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-text-primary block truncate">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-text-tertiary truncate block">
                          {sub.jobTitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-text-secondary shrink-0">
                      {sub.weeklyLoggedHours}h / 40h
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Universal 40-Hour Capacity Baseline Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              40-Hour Weekly Capacity Baseline
            </h4>
            <div className="bg-surface-elevated border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-secondary">
                  Logged This Week:
                </span>
                <span className={`text-base font-black font-mono ${selectedNode.hasOvertime ? 'text-red-400' : 'text-text-primary'}`}>
                  {selectedNode.weeklyLoggedHours}h / 40.0h
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border flex">
                <div
                  className={`h-full transition-all ${
                    selectedNode.hasOvertime ? 'bg-red-500' : 'bg-brand'
                  }`}
                  style={{ width: `${Math.min(100, selectedNode.utilizationPercentage)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs font-mono">
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <span className="text-[10px] text-text-tertiary block">Account Mgmt</span>
                  <span className="font-bold text-text-primary">{Math.round(accountMgmtHours * 10) / 10}h</span>
                </div>
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <span className="text-[10px] text-text-tertiary block">Specialist Output</span>
                  <span className="font-bold text-text-primary">{Math.round(disciplineHours * 10) / 10}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Functional Disciplines: ONLY for Client Services */}
          {selectedNode.department === 'client_services' && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                Client Services Discipline Profile
              </h4>
              <div className="bg-surface-elevated border border-border rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedNode.primaryDiscipline ? (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold">
                      {selectedNode.primaryDiscipline.replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-xs text-text-tertiary font-mono">
                      Account Leadership
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. Active Deliverables & Brief Commitments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                Active Client Deliverables ({userJobs.length})
              </h4>
            </div>
            {userJobs.length === 0 ? (
              <p className="text-xs text-text-tertiary italic bg-surface-elevated p-3 rounded-xl border border-border">
                No active delivery briefs currently assigned to this practitioner.
              </p>
            ) : (
              <div className="space-y-2">
                {userJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded-xl bg-surface-elevated border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-text-primary">
                        {job.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary">
                        {job.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-semibold text-text-primary truncate">
                      {job.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-0.5">
                      <span>{job.clientProject || 'Client Portfolio'}</span>
                      <span>{job.estimatedHours ? `${job.estimatedHours}h est` : 'Active'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Active Variance Alerts (if any) */}
          {userAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Active Operational Alerts ({userAlerts.length})</span>
              </h4>
              <div className="space-y-2">
                {userAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1"
                  >
                    <span className="font-mono text-[10px] uppercase font-bold text-red-400 block">
                      {alert.type.replace('_', ' ')}
                    </span>
                    <h5 className="font-bold text-text-primary">
                      {alert.title}
                    </h5>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
