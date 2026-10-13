import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StandardTaskType, Priority } from '../../types';
import { STANDARD_TASK_DEFINITIONS, getStandardTaskBenchmarkHours } from '../../data/standardTasks';
import { X, Sparkles, Clock, ShieldAlert } from 'lucide-react';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ isOpen, onClose }) => {
  const { submitBrief, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [requestor, setRequestor] = useState('Zenith Global Group');
  const [clientProject, setClientProject] = useState('Zenith Refresh 2026');
  const [standardTaskType, setStandardTaskType] = useState<StandardTaskType>('TVC');
  const [priority, setPriority] = useState<Priority>('high');
  const [dueDate, setDueDate] = useState('2026-09-28T17:00:00Z');
  const [description, setDescription] = useState(
    'Comprehensive creative deliverable per client quarterly campaign brief requirements.'
  );

  if (!isOpen) return null;

  if (currentUser.role !== 'client_service') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface text-text-primary shadow-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-bold text-base">Restricted Action</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Brief creation is restricted exclusively to <strong>Client Services</strong> representatives. Please coordinate with an Account Manager in Client Services to ingest new campaign briefs.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-surface-elevated text-text-primary hover:bg-surface cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDef = STANDARD_TASK_DEFINITIONS[standardTaskType];
  const defaultBenchmarkHours = getStandardTaskBenchmarkHours(standardTaskType, 'mid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    submitBrief({
      title,
      description,
      requestor,
      clientProject,
      standardTaskType,
      priority,
      dueDate,
      estimatedHours: defaultBenchmarkHours
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="new-brief-modal"
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)'
                }}
              >
                Client Service Intake
              </span>
              <h2 className="text-base font-bold text-text-primary">Submit Standard Client Brief</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Logged by Client Service Lead {currentUser.name}. Ingested brief routes to Traffic Manager Kwame Mensah for debrief coordination and studio dispatch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Standard Task Type Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center justify-between text-text-secondary">
              <span>Standard Task Archetype</span>
              <span className="text-[11px] font-normal flex items-center gap-1" style={{ color: 'var(--color-brand)' }}>
                <Sparkles className="w-3 h-3" /> Seniority benchmark applied automatically
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STANDARD_TASK_DEFINITIONS) as StandardTaskType[]).map((type) => {
                const isSelected = standardTaskType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setStandardTaskType(type);
                      if (!title || title.startsWith('Campaign Deliverable:')) {
                        setTitle(`${type} Master Deliverable`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-xs font-bold'
                        : 'bg-surface border-border text-text-secondary hover:border-border-subtle'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--color-brand-muted)',
                            borderColor: 'var(--color-brand)',
                            color: 'var(--color-brand)'
                          }
                        : undefined
                    }
                  >
                    <div className="font-semibold text-xs truncate text-text-primary">{type}</div>
                    <div className="text-[10px] font-mono mt-0.5 opacity-80 text-text-tertiary">
                      Mid: {STANDARD_TASK_DEFINITIONS[type].benchmarks.mid}h • Sen: {STANDARD_TASK_DEFINITIONS[type].benchmarks.senior}h
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Task Benchmark Preview Box */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-brand)' }}>
                <Clock className="w-3.5 h-3.5" /> Seniority Benchmark Table ({currentDef.type})
              </span>
              <span className="text-[10px] font-mono text-text-tertiary">
                Complexity: <strong className="uppercase text-text-secondary">{currentDef.complexityHint}</strong>
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center pt-1 font-mono text-[11px]">
              <div className="p-1.5 rounded-lg border border-border bg-surface">
                <div className="text-[9px] text-text-tertiary uppercase">Junior</div>
                <div className="font-bold text-text-primary">{currentDef.benchmarks.junior}h</div>
              </div>
              <div className="p-1.5 rounded-lg border border-border bg-surface">
                <div className="text-[9px] text-text-tertiary uppercase">Mid-Weight</div>
                <div className="font-bold text-text-primary">{currentDef.benchmarks.mid}h</div>
              </div>
              <div
                className="p-1.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)'
                }}
              >
                <div className="text-[9px] uppercase font-bold">Senior</div>
                <div className="font-bold">{currentDef.benchmarks.senior}h</div>
              </div>
              <div className="p-1.5 rounded-lg border border-border bg-surface">
                <div className="text-[9px] text-text-tertiary uppercase">Lead</div>
                <div className="font-bold text-text-primary">{currentDef.benchmarks.lead}h</div>
              </div>
              <div className="p-1.5 rounded-lg border border-border bg-surface">
                <div className="text-[9px] text-text-tertiary uppercase">Director</div>
                <div className="font-bold text-text-primary">{currentDef.benchmarks.director}h</div>
              </div>
            </div>
          </div>

          {/* Title & Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Deliverable Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Verve TVC Summer Spot"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden transition-all focus:border-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Client Account &amp; Project</label>
              <input
                type="text"
                required
                value={clientProject}
                onChange={(e) => setClientProject(e.target.value)}
                placeholder="e.g. Verve Summer 2027"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden transition-all focus:border-[var(--color-brand)]"
              />
            </div>
          </div>

          {/* Requestor & Priority & Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Client Organization</label>
              <input
                type="text"
                required
                value={requestor}
                onChange={(e) => setRequestor(e.target.value)}
                placeholder="Client name"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Escalation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">Client Due Date</label>
              <input
                type="date"
                required
                value={dueDate.split('T')[0]}
                onChange={(e) => setDueDate(`${e.target.value}T17:00:00Z`)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-text-secondary">Deliverable Scope &amp; Brief Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Submit Brief to Traffic Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
