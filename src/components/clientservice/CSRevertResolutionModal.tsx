import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, ReworkClassification } from '../../types';
import {
  RotateCcw,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  X,
  CheckCircle2,
  FileText,
  Layers
} from 'lucide-react';

interface CSRevertResolutionModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export const CSRevertResolutionModal: React.FC<CSRevertResolutionModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { users, setJobs, currentUser, logAuditEvent, logOperationalEvent } = useApp();

  const [decisionAction, setDecisionAction] = useState<
    'return_to_assignee' | 'reassign' | 'traffic_review' | 'renegotiate_scope'
  >('return_to_assignee');

  const [reworkType, setReworkType] = useState<ReworkClassification>('rework');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [revisedDueDate, setRevisedDueDate] = useState(() => {
    const d = new Date(job.dueDate || Date.now());
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [reworkHours, setReworkHours] = useState(6);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const currentAssignee = users.find((u) => u.id === job.assigneeId);
  const suitableAlternatives = users.filter(
    (u) => u.id !== job.assigneeId && (u.department === 'client_services' || u.department === 'creative')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetAssigneeId = job.assigneeId;
    let targetAssigneeName = job.assigneeName;
    let targetStage = job.workflowStage;
    let stageNote = '';

    if (decisionAction === 'return_to_assignee') {
      targetStage = 'in_production';
      stageNote = `Returned to original assignee ${targetAssigneeName} with +${reworkHours}h rework effort.`;
    } else if (decisionAction === 'reassign') {
      const selected = users.find((u) => u.id === newAssigneeId);
      targetAssigneeId = newAssigneeId;
      targetAssigneeName = selected?.name || 'Reassigned Specialist';
      targetStage = 'in_production';
      stageNote = `Reallocated to ${targetAssigneeName} due to capacity constraint on ${currentAssignee?.name}.`;
    } else if (decisionAction === 'traffic_review') {
      targetStage = 'traffic_assignment';
      stageNote = `Referred to Studio Traffic Desk for agency-wide bandwidth re-routing.`;
    } else if (decisionAction === 'renegotiate_scope') {
      targetStage = 'client_review';
      stageNote = `Scope/timeline renegotiated with brand client; revised due date: ${revisedDueDate}.`;
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          const revCount = (j.revisionCount || 1) + 1;
          const currentActual = j.actualHours || 0;
          return {
            ...j,
            workflowStage: targetStage,
            status: 'in_progress',
            assigneeId: targetAssigneeId,
            assigneeName: targetAssigneeName,
            dueDate: revisedDueDate,
            revisionCount: revCount,
            reworkHours: (j.reworkHours || 0) + reworkHours,
            actualHours: currentActual + reworkHours,
            clientRevertInfo: {
              ...(j.clientRevertInfo || {}),
              conflictDetected: false,
              resolutionAction: decisionAction,
              resolutionNotes: resolutionNotes || stageNote
            }
          };
        }
        return j;
      })
    );

    logAuditEvent(
      'CLIENT_REVERT_RESOLVED',
      job.id,
      job.title,
      'client_revert',
      targetStage,
      `${currentUser.name} resolved client revert conflict on [${job.id}]: ${decisionAction.replace('_', ' ').toUpperCase()}. ${stageNote}`
    );

    logOperationalEvent({
      eventType: decisionAction === 'reassign' ? 'reassigned' : 'client_revert',
      jobId: job.id,
      jobTitle: job.title,
      summary: `Client Revert actioned: ${stageNote}`,
      impact: 'congested'
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-rose-500">
            <RotateCcw className="w-5 h-5" />
            <span>Client Revert Capacity Conflict Resolution</span>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable details banner */}
        <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-text-tertiary">{job.id} · {job.clientProject}</span>
            <span className="font-bold text-rose-500">Revision Cycle #{ (job.revisionCount || 1) + 1}</span>
          </div>
          <h4 className="font-bold text-sm text-text-primary">{job.title}</h4>
          <p className="text-[11px] text-text-secondary">
            Current Assignee: <strong>{job.assigneeName || 'Unassigned'}</strong> · Due: <strong>{job.dueDate}</strong>
          </p>
        </div>

        {/* Revert Cause classification */}
        <div className="space-y-1">
          <label className="block text-xs font-mono uppercase text-text-tertiary">
            Rework Classification (Section 6)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'correction', label: 'Ordinary Correction', desc: 'Minor typography or spec tweak' },
              { id: 'rework', label: 'Substantive Rework', desc: 'Major concept or visual rework' },
              { id: 'scope_change', label: 'Scope Change', desc: 'Brand client modified brief scope' }
            ].map((rc) => (
              <button
                key={rc.id}
                type="button"
                onClick={() => setReworkType(rc.id as ReworkClassification)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  reworkType === rc.id
                    ? 'border-brand bg-brand-muted/30 text-brand font-bold'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                <div className="text-xs">{rc.label}</div>
                <div className="text-[9px] text-text-tertiary mt-0.5 line-clamp-1">{rc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Decision Selector (4 Confirmed Management Decisions) */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase text-text-primary font-bold">
            Authorised Management Action
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDecisionAction('return_to_assignee')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                decisionAction === 'return_to_assignee'
                  ? 'border-brand bg-brand-muted/40 font-bold text-brand shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>1. Return to Original Assignee</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-1 font-normal">
                {currentAssignee?.name} absorbs the extra {reworkHours}h revision cycle.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDecisionAction('reassign')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                decisionAction === 'reassign'
                  ? 'border-brand bg-brand-muted/40 font-bold text-brand shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <UserX className="w-3.5 h-3.5" />
                <span>2. Reassign to Suitable Staff</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-1 font-normal">
                Reallocate to alternative available practitioner with bandwidth.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDecisionAction('traffic_review')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                decisionAction === 'traffic_review'
                  ? 'border-brand bg-brand-muted/40 font-bold text-brand shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>3. Refer to Studio Traffic</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-1 font-normal">
                Ask Traffic Manager Kwame Mensah to re-balance cross-team sprint queues.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDecisionAction('renegotiate_scope')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                decisionAction === 'renegotiate_scope'
                  ? 'border-brand bg-brand-muted/40 font-bold text-brand shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>4. Renegotiate Deadline/Scope</span>
              </div>
              <p className="text-[10px] text-text-tertiary mt-1 font-normal">
                Push client turnaround commitment or adjust deliverable requirements.
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {decisionAction === 'reassign' && (
            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Select Alternative Assignee
              </label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                required
              >
                <option value="">-- Choose available specialist --</option>
                {suitableAlternatives.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Additional Rework Effort (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={reworkHours}
                onChange={(e) => setReworkHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Revised Client Delivery Deadline
              </label>
              <input
                type="date"
                value={revisedDueDate}
                onChange={(e) => setRevisedDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Resolution Audit Notes &amp; Client Feedback Context
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Returned to assignee after negotiating a 48h deadline shift with brand marketing lead."
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-elevated rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl transition-opacity hover:opacity-90 shadow-xs cursor-pointer bg-rose-600 text-white"
            >
              Confirm Revert Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
