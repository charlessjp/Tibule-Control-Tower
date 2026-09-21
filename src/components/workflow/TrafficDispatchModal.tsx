import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import { X, Send, ArrowRight, ShieldCheck } from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';

interface TrafficDispatchModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrafficDispatchModal: React.FC<TrafficDispatchModalProps> = ({ job, isOpen, onClose }) => {
  const { users, trafficRouteBrief, currentUser } = useApp();

  // Managers who lead teams (Elena Rostova for Creative, David Vance for Client Service)
  const managers = users.filter((u) => u.role === 'manager' || u.role === 'director');

  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    job?.managerId || managers[0]?.id || 'usr-elena-rostova'
  );
  const [dispatchNotes, setDispatchNotes] = useState(
    'Brief verified by Studio Operations. Scope approved; assign to discipline team.'
  );

  if (!isOpen || !job) return null;

  const targetManager = users.find((u) => u.id === selectedManagerId);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    trafficRouteBrief(job.id, selectedManagerId, dispatchNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="traffic-dispatch-modal"
        className="w-full max-w-xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Traffic Dispatch
              </span>
              <h2 className="text-base font-bold">Hand Deliverable to Manager</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Traffic Manager ({currentUser.name}) dispatching deliverable [{job.id}] to Discipline Head.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleDispatch} className="p-6 space-y-4">
          {/* Brief Overview Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs" style={{ color: 'var(--color-brand)' }}>{job.id} • {job.standardTaskType || job.category}</span>
              <PriorityBadge priority={job.priority} size="xs" />
            </div>
            <h3 className="font-bold text-sm leading-snug">{job.title}</h3>
            <p className="text-xs text-text-secondary">{job.description}</p>
            <div className="flex items-center gap-4 text-[11px] font-mono pt-1 text-text-tertiary">
              <span>Client: <strong className="text-text-primary">{job.requestor}</strong></span>
              <span>•</span>
              <span>Benchmark: <strong style={{ color: 'var(--color-brand)' }}>{job.estimatedHours}h</strong></span>
              <span>•</span>
              <span>Due: <strong className="text-text-primary">{new Date(job.dueDate).toLocaleDateString()}</strong></span>
            </div>
          </div>

          {/* Manager Destination Selection */}
          <div>
            <label className="block text-xs font-semibold mb-2 flex items-center justify-between">
              <span>Select Discipline Head / Creative Director</span>
              <span className="text-[11px] text-text-tertiary font-normal">Will assign staff & prescribe seniority timeline</span>
            </label>
            <div className="space-y-2">
              {managers.map((mgr) => {
                const isSelected = selectedManagerId === mgr.id;
                return (
                  <button
                    type="button"
                    key={mgr.id}
                    onClick={() => setSelectedManagerId(mgr.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-xs'
                        : 'bg-surface border-border hover:border-border-subtle'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--color-brand-muted)',
                            borderColor: 'var(--color-brand)'
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        {mgr.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{mgr.name}</div>
                        <div className="text-[11px] text-text-tertiary">{mgr.jobTitle} • {mgr.seniority ? mgr.seniority.toUpperCase() : 'DIRECTOR'}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                        Assigned Destination <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Traffic Handoff Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1">Traffic Instructions & Dispatch Notes</label>
            <textarea
              rows={3}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
            />
          </div>

          {/* Verification Callout */}
          <div
            className="p-3 rounded-xl border flex items-start gap-2.5 text-xs"
            style={{
              backgroundColor: 'var(--color-brand-muted)',
              borderColor: 'var(--color-brand)'
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-brand)' }} />
            <div>
              Deliverable will transfer to <strong>{targetManager?.name}</strong>'s manager inbox. The manager will evaluate team seniorities and prescribe benchmark allocation hours before execution begins.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-text-secondary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Send className="w-3.5 h-3.5" /> Hand to Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
