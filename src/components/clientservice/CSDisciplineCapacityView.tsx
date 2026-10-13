import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CONFIRMED_CS_DISCIPLINES
} from '../../data/clientServicesOperatingModel';
import {
  CSDisciplineId,
  DisciplineProficiencyLevel,
  EmployeeDisciplineAssignment
} from '../../types';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  Layers,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  X
} from 'lucide-react';

export const CSDisciplineCapacityView: React.FC = () => {
  const {
    disciplineAssignments,
    assignEmployeeDiscipline,
    removeEmployeeDiscipline,
    updateEmployeeDiscipline,
    users,
    jobs,
    currentUser
  } = useApp();

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<CSDisciplineId | 'all'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeDisciplineAssignment | null>(null);

  // Form state for assignment modal
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDisciplineId, setFormDisciplineId] = useState<CSDisciplineId>('digital_media');
  const [formProficiency, setFormProficiency] = useState<DisciplineProficiencyLevel>('practitioner');
  const [formWeeklyHours, setFormWeeklyHours] = useState(10);
  const [formEffectiveDate, setFormEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);

  // Filter client services team members
  const csMembers = useMemo(() => {
    return users.filter(
      (u) =>
        u.department === 'client_services' ||
        u.role === 'client_service' ||
        u.role === 'director' ||
        u.teamId === 'team-client-service'
    );
  }, [users]);

  // Compute demand and capacity metrics for all 9 confirmed disciplines
  const disciplineStats = useMemo(() => {
    return CONFIRMED_CS_DISCIPLINES.map((discipline) => {
      // Find practitioners assigned to this discipline
      const assigned = disciplineAssignments.filter((a) => a.disciplineId === discipline.id);
      const totalAvailableHours = assigned.reduce((sum, a) => sum + (a.weeklyExecutionHours || 0), 0);

      // Find active deliverables in jobs that require this discipline
      const activeDeliverables = jobs.filter(
        (j) =>
          j.status !== 'completed' &&
          (j.discipline === discipline.name ||
            (j.tags && j.tags.some((t) => t.toLowerCase() === discipline.name.toLowerCase() || t.toLowerCase() === discipline.id)))
      );

      const totalCommittedHours = activeDeliverables.reduce((sum, j) => sum + (j.estimatedHours || 8), 0);
      const deficit = totalCommittedHours - totalAvailableHours;
      const isDeficit = deficit > 0;
      const isSinglePoint = assigned.length === 1;
      const isUnassigned = assigned.length === 0;

      let status: 'optimal' | 'approaching' | 'deficit' | 'unassigned' = 'optimal';
      if (isUnassigned) status = 'unassigned';
      else if (isDeficit) status = 'deficit';
      else if (totalAvailableHours > 0 && totalCommittedHours / totalAvailableHours >= 0.85) status = 'approaching';

      return {
        discipline,
        assigned,
        totalAvailableHours,
        activeDeliverablesCount: activeDeliverables.length,
        totalCommittedHours,
        deficit: Math.max(0, deficit),
        isDeficit,
        isSinglePoint,
        isUnassigned,
        status
      };
    });
  }, [disciplineAssignments, jobs]);

  const openAddModal = (disciplineId?: CSDisciplineId) => {
    setEditingAssignment(null);
    setFormEmployeeId(csMembers[0]?.id || '');
    setFormDisciplineId(disciplineId || 'digital_media');
    setFormProficiency('practitioner');
    setFormWeeklyHours(10);
    setFormEffectiveDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setFormIsPrimary(false);
    setIsAssignModalOpen(true);
  };

  const openEditModal = (assignment: EmployeeDisciplineAssignment) => {
    setEditingAssignment(assignment);
    setFormEmployeeId(assignment.employeeId);
    setFormDisciplineId(assignment.disciplineId);
    setFormProficiency(assignment.proficiency);
    setFormWeeklyHours(assignment.weeklyExecutionHours);
    setFormEffectiveDate(assignment.effectiveDate || new Date().toISOString().slice(0, 10));
    setFormNotes(assignment.notes || '');
    setFormIsPrimary(assignment.isPrimary || false);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = users.find((u) => u.id === formEmployeeId);
    if (!emp) return;

    if (editingAssignment) {
      updateEmployeeDiscipline({
        ...editingAssignment,
        employeeId: formEmployeeId,
        employeeName: emp.name,
        disciplineId: formDisciplineId,
        proficiency: formProficiency,
        effectiveDate: formEffectiveDate,
        weeklyExecutionHours: Number(formWeeklyHours),
        notes: formNotes,
        isPrimary: formIsPrimary
      });
    } else {
      assignEmployeeDiscipline({
        employeeId: formEmployeeId,
        employeeName: emp.name,
        disciplineId: formDisciplineId,
        proficiency: formProficiency,
        effectiveDate: formEffectiveDate,
        weeklyExecutionHours: Number(formWeeklyHours),
        notes: formNotes,
        isPrimary: formIsPrimary
      });
    }
    setIsAssignModalOpen(false);
  };

  const filteredStats = useMemo(() => {
    if (selectedDisciplineId === 'all') return disciplineStats;
    return disciplineStats.filter((s) => s.discipline.id === selectedDisciplineId);
  }, [disciplineStats, selectedDisciplineId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-elevated border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
            <Layers className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <span>Dimension B: Functional Capability &amp; Execution</span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary mt-1">
            Confirmed 7 Functional Disciplines &amp; Capacity Intelligence
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-3xl">
            Comparing incoming brief demand across the 7 confirmed disciplines against employees assigned to execute them.
            Functional assignments are configurable per employee without altering formal reporting lines.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 self-start md:self-center shrink-0"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-brand-contrast)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Assign Functional Discipline</span>
        </button>
      </div>

      {/* Operational Structure Clarification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border bg-surface/80 border-sky-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-sky-600 dark:text-sky-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Digital Media: Full Lifecycle</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Unifies <strong>Strategy, Buying, &amp; Reporting</strong> across online channels (PPC, programmatic, social ads, digital performance).
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-surface/80 border-purple-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-purple-600 dark:text-purple-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Traditional Media: Full Lifecycle</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Unifies <strong>Strategy, Buying, &amp; Reporting</strong> across offline channels (Television, Radio, Print, OOH Billboards).
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-surface/80 border-blue-500/30 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-600 dark:text-blue-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Strategy: Integrated Truth</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Integrates both <strong>Media Strategy</strong> and <strong>Content Strategy</strong> for cohesive brand narrative and distribution architecture.
          </p>
        </div>
      </div>

      {/* Discipline Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-mono text-text-tertiary mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Filter Discipline:
        </span>
        <button
          onClick={() => setSelectedDisciplineId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            selectedDisciplineId === 'all'
              ? 'bg-brand text-brand-contrast font-bold shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-border'
          }`}
        >
          All 7 Disciplines ({CONFIRMED_CS_DISCIPLINES.length})
        </button>
        {CONFIRMED_CS_DISCIPLINES.map((d) => {
          const isSelected = selectedDisciplineId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDisciplineId(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'border-brand bg-brand-muted text-brand font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface border-border'
              }`}
            >
              {d.name} {d.scopeLabel ? <span className="opacity-75 font-normal text-[10px]">{d.scopeLabel}</span> : null}
            </button>
          );
        })}
      </div>

      {/* 9 Disciplines Demand & Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filteredStats.map(({ discipline, assigned, totalAvailableHours, activeDeliverablesCount, totalCommittedHours, deficit, isDeficit, isSinglePoint, isUnassigned, status }) => {
          return (
            <SpotlightCard key={discipline.id} className="p-5 space-y-4 border-t-4 flex flex-col justify-between" style={{ borderTopColor: discipline.badgeColor }}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider inline-block mb-1"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${discipline.badgeColor} 15%, transparent)`,
                        color: discipline.badgeColor
                      }}
                    >
                      {discipline.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-extrabold text-base text-text-primary flex items-center gap-1.5 flex-wrap">
                      <span>{discipline.name}</span>
                      {discipline.scopeLabel && (
                        <span className="text-xs font-semibold text-text-secondary">
                          {discipline.scopeLabel}
                        </span>
                      )}
                    </h3>
                    {discipline.subCompetencies && discipline.subCompetencies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {discipline.subCompetencies.map((sc, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-surface-elevated border border-border/80 text-text-secondary"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                      status === 'unassigned'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : status === 'deficit'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : status === 'approaching'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}
                  >
                    {status === 'unassigned'
                      ? 'No Practitioners'
                      : status === 'deficit'
                      ? `Deficit (-${deficit}h)`
                      : status === 'approaching'
                      ? 'Near Capacity'
                      : 'Capacity Optimal'}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {discipline.description}
                </p>

                {/* Distinction Rule Banner */}
                <div className="p-2.5 rounded-lg bg-surface/70 border border-border/80 text-[11px] text-text-tertiary">
                  <strong className="text-text-primary block mb-0.5 font-mono text-[10px] uppercase">Operational Rule:</strong>
                  {discipline.distinctionRule}
                </div>

                {/* Demand vs Capacity Stats */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60 text-center font-mono">
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <div className="text-xs font-bold text-text-primary">{activeDeliverablesCount}</div>
                    <div className="text-[9px] text-text-tertiary">Deliverables</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <div className="text-xs font-bold" style={{ color: isDeficit ? 'var(--color-critical)' : 'var(--color-brand)' }}>
                      {totalCommittedHours}h
                    </div>
                    <div className="text-[9px] text-text-tertiary">Demand</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <div className="text-xs font-bold text-emerald-500">{totalAvailableHours}h</div>
                    <div className="text-[9px] text-text-tertiary">Available</div>
                  </div>
                </div>

                {/* Warnings */}
                {isSinglePoint && !isUnassigned && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Single point of failure: Only 1 practitioner assigned.</span>
                  </div>
                )}
                {isUnassigned && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Staffing gap: Discipline has zero assigned practitioners.</span>
                  </div>
                )}

                {/* Assigned Practitioners List */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                    <span>Assigned Staff ({assigned.length})</span>
                    <button
                      onClick={() => openAddModal(discipline.id)}
                      className="text-brand hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {assigned.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/70 border border-border/60 text-xs"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-text-primary truncate flex items-center gap-1.5">
                            <span>{a.employeeName}</span>
                            {a.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-brand-muted text-brand">
                                Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-text-tertiary font-mono capitalize">
                            {a.proficiency.replace('_', ' ')} · {a.weeklyExecutionHours}h/wk planned
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface cursor-pointer"
                            title="Edit assignment"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeEmployeeDiscipline(a.id)}
                            className="p-1 rounded text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Remove discipline assignment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {assigned.length === 0 && (
                      <p className="text-[11px] text-text-tertiary italic p-2 text-center">
                        No employees currently assigned to this capability.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-text-primary">
                <Layers className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                <span>{editingAssignment ? 'Edit Discipline Assignment' : 'Assign Functional Discipline'}</span>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Assign or update an employee's specialist execution capability without changing their formal organizational position or reporting hierarchy.
            </p>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Employee (From Client Services Squad)
                </label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                  required
                >
                  {csMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                    Confirmed Discipline
                  </label>
                  <select
                    value={formDisciplineId}
                    onChange={(e) => setFormDisciplineId(e.target.value as CSDisciplineId)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                    required
                  >
                    {CONFIRMED_CS_DISCIPLINES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.scopeLabel ? ` ${d.scopeLabel}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                    Proficiency / Level
                  </label>
                  <select
                    value={formProficiency}
                    onChange={(e) => setFormProficiency(e.target.value as DisciplineProficiencyLevel)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                    required
                  >
                    <option value="lead">Lead Practitioner</option>
                    <option value="senior_practitioner">Senior Practitioner</option>
                    <option value="practitioner">Practitioner</option>
                    <option value="developing">Developing / Apprentice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                    Planned Weekly Effort (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={formWeeklyHours}
                    onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                    Effective Assignment Date
                  </label>
                  <input
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsPrimary"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand cursor-pointer"
                />
                <label htmlFor="formIsPrimary" className="text-xs text-text-primary font-medium cursor-pointer">
                  Set as employee's primary execution discipline
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Assignment Notes &amp; Scope Context
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Assigned to execute programmatic media buying and campaign pacing for key Q4 brand accounts."
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
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
                  {editingAssignment ? 'Save Changes' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
