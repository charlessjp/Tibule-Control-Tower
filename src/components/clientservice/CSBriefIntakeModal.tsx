import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIRMED_CS_DISCIPLINES } from '../../data/clientServicesOperatingModel';
import { CSDisciplineId, Priority, Complexity } from '../../types';
import {
  FilePlus,
  Layers,
  X,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CSBriefIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSBriefIntakeModal: React.FC<CSBriefIntakeModalProps> = ({ isOpen, onClose }) => {
  const { brands, users, jobs, setJobs, currentUser, logAuditEvent, logOperationalEvent } = useApp();

  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [accountOwnerId, setAccountOwnerId] = useState(currentUser.id);
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [complexity, setComplexity] = useState<Complexity>('high');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  // Selected disciplines from the 7 confirmed disciplines
  const [selectedDisciplines, setSelectedDisciplines] = useState<CSDisciplineId[]>([
    'digital_media',
    'strategy'
  ]);

  // Estimated hours per selected discipline
  const [disciplineHours, setDisciplineHours] = useState<Record<string, number>>({
    digital_media: 16,
    strategy: 12
  });

  const csAccountLeads = users.filter(
    (u) =>
      u.department === 'client_services' ||
      u.role === 'client_service' ||
      u.role === 'director' ||
      u.teamId === 'team-client-service'
  );

  const toggleDiscipline = (id: CSDisciplineId) => {
    setSelectedDisciplines((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((d) => d !== id);
        return next;
      } else {
        const next = [...prev, id];
        if (!disciplineHours[id]) {
          setDisciplineHours((h) => ({ ...h, [id]: 12 }));
        }
        return next;
      }
    });
  };

  const handleHoursChange = (id: string, hours: number) => {
    setDisciplineHours((prev) => ({ ...prev, [id]: hours }));
  };

  const totalEstimatedHours = selectedDisciplines.reduce(
    (sum, d) => sum + (disciplineHours[d] || 10),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDisciplines.length === 0) return;

    const brand = brands.find((b) => b.id === brandId);
    const owner = users.find((u) => u.id === accountOwnerId) || currentUser;
    const newJobId = `CT-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedDisciplineNames = selectedDisciplines.map((dId) => {
      const def = CONFIRMED_CS_DISCIPLINES.find((d) => d.id === dId);
      return def?.name || dId;
    });

    const newJob = {
      id: newJobId,
      title: title.trim(),
      clientProject: brand?.name || 'Enterprise Client',
      brandId: brandId,
      briefSummary: summary.trim() || 'Integrated campaign brief requiring multi-discipline client service execution.',
      debriefSquadSummary: `Intake managed by ${owner.name}. Confirmed execution disciplines: ${selectedDisciplineNames.join(', ')}.`,
      debriefPrescription: `Deliverables structured across ${selectedDisciplines.length} functional disciplines.`,
      discipline: selectedDisciplineNames[0] || 'Client Services',
      tags: [...selectedDisciplines, 'Integrated Brief', brand?.name || 'Brand'],
      workflowStage: 'brief_intake' as const,
      status: 'unassigned' as const,
      priority: priority,
      complexity: complexity,
      dueDate: dueDate,
      estimatedHours: totalEstimatedHours,
      actualHours: 0,
      actualEffortHours: 0,
      assigneeId: owner.id,
      assigneeName: owner.name,
      requestor: owner.name,
      teamId: 'team-client-service',
      createdDate: new Date().toISOString().slice(0, 10),
      isAtRisk: false,
      reworkHours: 0,
      revisionCount: 0
    };

    setJobs((prev) => [newJob as any, ...prev]);

    logAuditEvent(
      'BRIEF_INTAKE_SUBMITTED',
      newJobId,
      title.trim(),
      'NONE',
      'brief_intake',
      `${owner.name} initialized integrated brief [${newJobId}] for ${brand?.name} spanning ${selectedDisciplines.length} disciplines: ${selectedDisciplineNames.join(', ')}.`
    );

    logOperationalEvent({
      eventType: 'assigned',
      jobId: newJobId,
      jobTitle: title.trim(),
      summary: `Integrated Brief created by ${owner.name} with ${totalEstimatedHours}h across ${selectedDisciplines.length} disciplines.`,
      impact: 'neutral'
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-text-primary">
            <FilePlus className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
            <span>Integrated Marketing Brief Intake (Client Services)</span>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          When an integrated brief enters the business, the assigned account owner prepares the debrief information and selects only the 
          specific functional disciplines required from the <strong>7 confirmed capabilities</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Client Brand Account
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Account Owner (SAM / AM)
              </label>
              <select
                value={accountOwnerId}
                onChange={(e) => setAccountOwnerId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                required
              >
                {csAccountLeads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Campaign / Brief Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stanbic Private Wealth Q4 Omnichannel Acquisition"
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Brief Scope &amp; Client Objectives Summary
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline the client goals, deliverables required, target audience, and key commercial outcomes..."
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
            />
          </div>

          {/* Section 5.1: Required Disciplines Selection from the 9 confirmed */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase text-text-primary font-bold">
                Required Functional Disciplines ({selectedDisciplines.length} selected)
              </label>
              <span className="text-[10px] font-mono text-text-tertiary">
                Total Benchmark Effort: <strong>{totalEstimatedHours}h</strong>
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              A brief may require one discipline or several. Do not force every campaign through every discipline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {CONFIRMED_CS_DISCIPLINES.map((d) => {
                const isSelected = selectedDisciplines.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDiscipline(d.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'border-brand bg-brand-muted/40 shadow-xs'
                        : 'border-border/70 bg-surface hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs text-text-primary leading-tight">
                        {d.name}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand bg-brand text-brand-contrast' : 'border-border'
                        }`}
                      >
                        {isSelected && <span className="text-[9px] font-bold leading-none">✓</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-text-tertiary">Est. Hours:</span>
                        <input
                          type="number"
                          min={2}
                          max={80}
                          value={disciplineHours[d.id] || 12}
                          onChange={(e) => handleHoursChange(d.id, Number(e.target.value))}
                          className="w-14 p-1 rounded border border-border bg-surface text-right font-bold text-text-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">Complexity</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as Complexity)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">Client Delivery Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                required
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold rounded-xl transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Create Brief &amp; Workstreams
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
