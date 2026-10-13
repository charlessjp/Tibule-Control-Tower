import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIRMED_CS_DISCIPLINES } from '../../data/clientServicesOperatingModel';
import { CSDisciplineId, CSTimesheetEntry } from '../../types';
import {
  Clock,
  X,
  Briefcase,
  Layers,
  Calendar,
  FileText,
  DollarSign,
  Plus
} from 'lucide-react';

interface CSLogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultUserId?: string;
}

export const CSLogTimeModal: React.FC<CSLogTimeModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultUserId
}) => {
  const {
    jobs,
    brands,
    users,
    currentUser,
    logTimesheetEntry
  } = useApp();

  const csUsers = users.filter(
    (u) =>
      u.department === 'client_services' ||
      u.role === 'client_service' ||
      u.role === 'director' ||
      u.teamId === 'team-client-service'
  );

  const [selectedUserId, setSelectedUserId] = useState<string>(
    defaultUserId || (csUsers.find((u) => u.id === currentUser.id)?.id || csUsers[0]?.id || currentUser.id)
  );

  const clientJobs = jobs.filter(
    (j) =>
      j.teamId === 'team-client-service' ||
      j.discipline === 'Client Services' ||
      brands.some((b) => b.id === j.brandId) ||
      j.status !== 'completed'
  );

  const [jobId, setJobId] = useState<string>(clientJobs[0]?.id || 'CT-1850');
  const [disciplineId, setDisciplineId] = useState<CSDisciplineId | 'account_management' | 'general_operations'>('digital_media');
  const [date, setDate] = useState<string>(defaultDate || new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState<number>(2.0);
  const [description, setDescription] = useState<string>('');
  const [isBillable, setIsBillable] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = users.find((u) => u.id === selectedUserId) || currentUser;
    const selectedJob = jobs.find((j) => j.id === jobId);
    const discDef = CONFIRMED_CS_DISCIPLINES.find((d) => d.id === disciplineId);

    logTimesheetEntry({
      userId: selectedUser.id,
      userName: selectedUser.name,
      userRole: selectedUser.seniority || selectedUser.jobTitle,
      department: 'client_services',
      jobId: jobId,
      jobTitle: selectedJob?.title || 'Account Management & Coordination',
      clientName: selectedJob?.clientProject || 'Client Portfolio',
      disciplineId: disciplineId,
      disciplineName: discDef ? discDef.name : disciplineId === 'account_management' ? 'Account Management' : 'General Operations',
      date,
      hours: Number(hours),
      description: description || 'Routine discipline execution and deliverable progress',
      isBillable,
      source: 'manual_entry'
    });

    onClose();
  };

  const quickHours = [0.5, 1.0, 2.0, 4.0, 7.5, 8.0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-text-primary">
            <Clock className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
            <span>Log Daily Activity Hours</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary cursor-pointer p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Log actual time committed against client briefs or functional disciplines.
          Entries calculate against the universal <strong>40-hour weekly capacity baseline</strong> to detect overtime and brief variances.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Member Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Practitioner (Client Services)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              required
            >
              {csUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.jobTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Client Brief / Deliverable */}
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Client Brief / Deliverable
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              required
            >
              <option value="CT-1850">CT-1850: Account Management &amp; Client Coordination (Non-brief specific)</option>
              {clientJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id} — {j.clientProject ? `[${j.clientProject}] ` : ''}{j.title} ({j.estimatedHours ? `${j.estimatedHours}h est` : 'No est'})
                </option>
              ))}
            </select>
          </div>

          {/* Discipline Selection (7 Confirmed Disciplines) */}
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Execution Discipline (7 Confirmed Disciplines)
            </label>
            <select
              value={disciplineId}
              onChange={(e) => setDisciplineId(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
              required
            >
              <option value="account_management">Account Management &amp; Client Coordination</option>
              {CONFIRMED_CS_DISCIPLINES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.scopeLabel ? d.scopeLabel : ''}
                </option>
              ))}
              <option value="general_operations">General Operations &amp; Admin</option>
            </select>
          </div>

          {/* Date & Hours Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Activity Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                Hours Dedicated
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                required
              />
            </div>
          </div>

          {/* Quick Hours Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-text-tertiary">Quick add:</span>
            {quickHours.map((qh) => (
              <button
                key={qh}
                type="button"
                onClick={() => setHours(qh)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                  hours === qh
                    ? 'bg-brand/20 text-brand border-brand font-bold'
                    : 'bg-surface-elevated text-text-secondary border-border hover:text-text-primary'
                }`}
              >
                {qh}h
              </button>
            ))}
          </div>

          {/* Activity Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
              Activity Notes &amp; Progress Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Programmatic ad bid optimization and client WIP debrief alignment..."
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand resize-none"
              required
            />
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isBillable"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="rounded border-border text-brand focus:ring-0 cursor-pointer w-4 h-4"
            />
            <label htmlFor="isBillable" className="text-xs text-text-secondary cursor-pointer select-none">
              Billable Client Activity (Track against client contractual fee scope)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Commit Timesheet Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
