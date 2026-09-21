import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, SeniorityLevel } from '../../types';
import { STANDARD_TASK_DEFINITIONS, getStandardTaskBenchmarkHours } from '../../data/standardTasks';
import { X, UserCheck, Sparkles, ShieldAlert } from 'lucide-react';
import { SeniorityBadge } from '../common/SeniorityBadge';

interface SeniorityAssignmentModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SeniorityAssignmentModal: React.FC<SeniorityAssignmentModalProps> = ({ job, isOpen, onClose }) => {
  const { users, managerAssignStaff, employeeCapacities } = useApp();

  // Find candidate team members (under creative team or eligible assignees)
  const candidateStaff = users.filter(
    (u) => u.role === 'employee' || u.role === 'team_lead' || u.teamId === 'team-creative'
  );

  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    job?.assigneeId || candidateStaff[0]?.id || 'usr-sarah-jenkins'
  );

  const selectedUser = users.find((u) => u.id === selectedStaffId);
  const staffSeniority: SeniorityLevel = selectedUser?.seniority || 'mid';

  const standardTask = job?.standardTaskType || 'TVC';
  const taskDef = STANDARD_TASK_DEFINITIONS[standardTask] || STANDARD_TASK_DEFINITIONS['Custom Deliverable'];

  // Calculate benchmark hours based on task archetype + chosen staff seniority
  const benchmarkHours = getStandardTaskBenchmarkHours(standardTask, staffSeniority);

  const [prescribedHours, setPrescribedHours] = useState<number>(benchmarkHours);
  const [dueDate, setDueDate] = useState<string>(job?.dueDate || '2026-09-25T17:00:00Z');

  // Update prescribed hours automatically when staff selection or seniority changes
  useEffect(() => {
    if (selectedUser) {
      const autoHours = getStandardTaskBenchmarkHours(standardTask, selectedUser.seniority || 'mid');
      setPrescribedHours(autoHours);
    }
  }, [selectedStaffId, standardTask, selectedUser]);

  if (!isOpen || !job) return null;

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    managerAssignStaff(
      job.id,
      selectedStaffId,
      staffSeniority,
      Number(prescribedHours),
      dueDate
    );

    onClose();
  };

  const capacityInfo = selectedStaffId ? employeeCapacities[selectedStaffId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="seniority-assignment-modal"
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
                Discipline Assignment & Timeline Prescribing
              </span>
              <h2 className="text-base font-bold">Assign Staff & Set Seniority Timeline</h2>
            </div>
            <p className="text-xs mt-1 text-text-tertiary">
              Prescribing deliverable hours mapped to standard task archetype [{standardTask}] and staff seniority.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Job Overview */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold" style={{ color: 'var(--color-brand)' }}>{job.id} • {standardTask}</span>
              <span className="text-[11px] font-mono text-text-tertiary">Client: {job.requestor}</span>
            </div>
            <h3 className="font-bold text-sm">{job.title}</h3>
            <p className="text-xs mt-1 text-text-secondary">{job.description}</p>
          </div>

          {/* Seniority Benchmark Guide Box */}
          <div
            className="p-4 rounded-xl border space-y-2.5"
            style={{
              backgroundColor: 'var(--color-brand-muted)',
              borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--color-brand)' }}>
                <Sparkles className="w-3.5 h-3.5" />
                Seniority Benchmark Velocity Engine ({taskDef.type})
              </div>
              <span className="text-[10px] font-mono text-text-tertiary">
                Standard Velocity Multiplier
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-xs">
              {(['junior', 'mid', 'senior', 'lead', 'director'] as SeniorityLevel[]).map((level) => {
                const isCurrentStaffSeniority = level === staffSeniority;
                const hours = taskDef.benchmarks[level];
                return (
                  <div
                    key={level}
                    className={`p-2 rounded-lg border transition-all ${
                      isCurrentStaffSeniority
                        ? 'font-bold shadow-xs'
                        : 'bg-surface/80 border-border text-text-tertiary'
                    }`}
                    style={
                      isCurrentStaffSeniority
                        ? {
                            backgroundColor: 'var(--color-brand-muted)',
                            borderColor: 'var(--color-brand)',
                            color: 'var(--color-brand)'
                          }
                        : undefined
                    }
                  >
                    <div className="text-[9px] uppercase font-bold tracking-wider">{level}</div>
                    <div className="text-sm font-extrabold mt-0.5">{hours}h</div>
                    {isCurrentStaffSeniority && (
                      <div className="text-[9px] font-sans font-semibold mt-0.5" style={{ color: 'var(--color-brand)' }}>Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Select Staff Member */}
          <div>
            <label className="block text-xs font-semibold mb-2">Select Staff Member Under Manager</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {candidateStaff.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                const sen = staff.seniority || 'mid';
                const cap = employeeCapacities[staff.id];
                const targetTaskHours = getStandardTaskBenchmarkHours(standardTask, sen);

                return (
                  <button
                    type="button"
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs truncate">{staff.name}</span>
                      <SeniorityBadge seniority={sen} size="xs" />
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate mb-2">{staff.jobTitle}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-border/40">
                      <span>Benchmark: <strong style={{ color: 'var(--color-brand)' }}>{targetTaskHours}h</strong></span>
                      <span className={cap && cap.capacityPercent >= 90 ? 'text-amber-400 font-bold' : 'text-text-tertiary'}>
                        Load: {cap ? `${cap.assignedHours}h / ${cap.capacityHoursPerWeek}h (${cap.capacityPercent}%)` : '38h'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prescribed Hours and Due Date Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Prescribed Benchmark Hours</span>
                <span className="text-[10px] font-normal" style={{ color: 'var(--color-brand)' }}>
                  {selectedUser?.name} ({staffSeniority.toUpperCase()})
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={prescribedHours}
                  onChange={(e) => setPrescribedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono font-bold outline-hidden focus:border-[var(--color-brand)]"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-text-tertiary">hours</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Prescribed Due Date</label>
              <input
                type="date"
                required
                value={dueDate.split('T')[0]}
                onChange={(e) => setDueDate(`${e.target.value}T17:00:00Z`)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-xs outline-hidden focus:border-[var(--color-brand)]"
              />
            </div>
          </div>

          {/* Capacity warning callout if assignee has existing active workload */}
          {capacityInfo && capacityInfo.activeJobsCount > 0 && (
            <div className="p-3 rounded-xl border flex items-start gap-2.5 text-xs bg-amber-500/10 border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong>Active Workload Note:</strong> {selectedUser?.name} currently has {capacityInfo.activeJobsCount} active deliverable(s). The system tracks concurrency so that if a previous client revert cycles back, conflict protection will alert you automatically.
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              <UserCheck className="w-3.5 h-3.5" /> Assign Staff & Start Production
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
