import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  NSSProgressionDossier,
  NSSCompetencyEvaluation
} from '../../types';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Star,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';

export const CSNSSProgressionView: React.FC = () => {
  const {
    nssProgressionDossiers,
    updateNSSProgressionDossier,
    endorseNSSForPromotion,
    users,
    jobs,
    contributions,
    currentUser
  } = useApp();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('usr-abena-mensah');
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
  const [endorsementNote, setEndorsementNote] = useState('');
  const [isAddEvaluationModalOpen, setIsAddEvaluationModalOpen] = useState(false);

  // New competency evaluation form state
  const [evalArea, setEvalArea] = useState<NSSCompetencyEvaluation['competencyArea']>('client_communication');
  const [evalTitle, setEvalTitle] = useState('');
  const [evalScore, setEvalScore] = useState(4);
  const [evalNotes, setEvalNotes] = useState('');

  const activeDossier = useMemo(() => {
    return (
      nssProgressionDossiers.find((d) => d.employeeId === selectedEmployeeId) ||
      nssProgressionDossiers[0]
    );
  }, [nssProgressionDossiers, selectedEmployeeId]);

  // Tasks assigned to this NSS/Intern
  const employeeTasks = useMemo(() => {
    return jobs.filter((j) => j.assigneeId === selectedEmployeeId);
  }, [jobs, selectedEmployeeId]);

  // Strategic contributions recorded for this person
  const employeeContributions = useMemo(() => {
    return contributions.filter((c) => c.contributorId === selectedEmployeeId);
  }, [contributions, selectedEmployeeId]);

  const handleEndorse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossier || !endorsementNote.trim()) return;
    endorseNSSForPromotion(activeDossier.employeeId, endorsementNote.trim());
    setIsEndorseModalOpen(false);
    setEndorsementNote('');
  };

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossier || !evalTitle.trim() || !evalNotes.trim()) return;

    const newEval: NSSCompetencyEvaluation = {
      id: `eval-${Date.now()}`,
      competencyArea: evalArea,
      title: evalTitle.trim(),
      score: Number(evalScore),
      evidenceNotes: evalNotes.trim()
    };

    const updatedEvaluations = [...activeDossier.evaluations, newEval];
    const avgScore = updatedEvaluations.reduce((sum, ev) => sum + ev.score, 0) / updatedEvaluations.length;
    const newReadiness = Math.min(100, Math.round((avgScore / 5) * 100));

    updateNSSProgressionDossier({
      ...activeDossier,
      evaluations: updatedEvaluations,
      overallReadinessScore: newReadiness,
      recommendation: newReadiness >= 85 ? 'ready_for_ae_promotion' : 'in_development'
    });

    setIsAddEvaluationModalOpen(false);
    setEvalTitle('');
    setEvalNotes('');
    setEvalScore(4);
  };

  const isSupervisorOrDirector =
    currentUser.role === 'director' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'general_manager' ||
    currentUser.role === 'admin' ||
    currentUser.id === activeDossier?.supervisorId;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-elevated border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-tertiary">
            <GraduationCap className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <span>National Service &amp; Staff Development Pathway</span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary mt-1">
            Intern &amp; NSS Development Pathway → Account Executive (AE)
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-3xl">
            Control Tower tracks actual assignments, deadlines, learning evidence, and verifiable craft maturity.
            <strong> Completion of National Service does not automatically trigger promotion;</strong> readiness remains an evidence-backed management decision.
          </p>
        </div>

        {activeDossier && isSupervisorOrDirector && activeDossier.status !== 'endorsed_for_ae' && (
          <button
            onClick={() => setIsEndorseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 self-start md:self-center shrink-0 bg-emerald-600 text-white"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Endorse for AE Promotion</span>
          </button>
        )}
      </div>

      {/* Cohort Selector Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-text-tertiary">Select Dossier:</span>
        {nssProgressionDossiers.map((dossier) => {
          const isSelected = dossier.employeeId === selectedEmployeeId;
          return (
            <button
              key={dossier.employeeId}
              onClick={() => setSelectedEmployeeId(dossier.employeeId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'border-brand bg-brand-muted text-brand font-bold shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--color-text-tertiary)' }} />
              <span>{dossier.employeeName}</span>
              <span className="text-[10px] font-mono text-text-tertiary">({dossier.cohort})</span>
            </button>
          );
        })}
      </div>

      {activeDossier && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Readiness Metrics, Pathway Stepper, & Sponsor Note (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SpotlightCard className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-text-primary">
                    {activeDossier.employeeName}
                  </h3>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {activeDossier.cohort} · Supervisor: <strong>{activeDossier.supervisorName}</strong>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    activeDossier.status === 'endorsed_for_ae'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeDossier.status === 'endorsed_for_ae' ? 'Endorsed for AE' : 'Active Development'}
                </span>
              </div>

              {/* Overall Readiness Gauge */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-tertiary uppercase text-[10px]">Account Executive Readiness Score</span>
                  <span className="text-base font-extrabold" style={{ color: activeDossier.overallReadinessScore >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {activeDossier.overallReadinessScore}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeDossier.overallReadinessScore}%`,
                      backgroundColor: activeDossier.overallReadinessScore >= 80 ? 'var(--color-success)' : 'var(--color-brand)'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-1">
                  <span>Cycle: {activeDossier.nssStartDate}</span>
                  <span>Target: {activeDossier.nssCompletionDate}</span>
                </div>
              </div>

              {/* Key Objective Evidence Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <div className="text-lg font-extrabold text-text-primary">
                    {activeDossier.completedTasksCount || employeeTasks.length}
                  </div>
                  <div className="text-[10px] text-text-tertiary">Tasks Completed</div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border">
                  <div className="text-lg font-extrabold text-emerald-500">
                    {activeDossier.verifiedContributionsCount || employeeContributions.length}
                  </div>
                  <div className="text-[10px] text-text-tertiary">Verified Contributions</div>
                </div>
              </div>

              {/* Structured Pathway Milestones */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <h4 className="text-xs font-bold font-mono uppercase text-text-secondary">
                  AE Development Milestones
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-border/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-text-primary">Phase 1: Foundation &amp; Brief Hygiene</div>
                      <div className="text-[11px] text-text-tertiary">Meeting minutes, contact reports, deliverable assets sorting.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-border/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-text-primary">Phase 2: Workstream Tracking &amp; Shadowing</div>
                      <div className="text-[11px] text-text-tertiary">Coordinating deadlines with Creative specialists and Traffic Desk.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-brand/40">
                    <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-text-primary">Phase 3: Direct Client Handoff &amp; AE Readiness</div>
                      <div className="text-[11px] text-text-tertiary">Drafting client emails, managing minor revision loops, independent docket logging.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Sponsor Commendation */}
              {activeDossier.executiveSponsorNote && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10px] uppercase">
                    <Award className="w-3.5 h-3.5" />
                    <span>Management Endorsement Record:</span>
                  </div>
                  <p className="text-[11px] text-text-primary italic leading-relaxed">
                    &ldquo;{activeDossier.executiveSponsorNote}&rdquo;
                  </p>
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Right Column: Evaluated Competencies & Evidence Rubric (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <SpotlightCard className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                  <h3 className="font-extrabold text-sm text-text-primary">
                    Competency Evaluations &amp; Observable Evidence ({activeDossier.evaluations.length})
                  </h3>
                </div>

                {isSupervisorOrDirector && (
                  <button
                    onClick={() => setIsAddEvaluationModalOpen(true)}
                    className="text-xs font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Evaluation</span>
                  </button>
                )}
              </div>

              {/* Rubric Cards */}
              <div className="space-y-3">
                {activeDossier.evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border bg-surface/70 border-border space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span>{ev.title}</span>
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-surface-elevated text-text-tertiary capitalize">
                          {ev.competencyArea.replace('_', ' ')}
                        </span>
                      </div>

                      {/* 1-5 Star Score */}
                      <div className="flex items-center gap-1 text-amber-500 font-mono text-xs font-bold">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= ev.score ? 'fill-amber-500 text-amber-500' : 'text-border'
                              }`}
                            />
                          ))}
                        </div>
                        <span>({ev.score}/5)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-border/60">
                      <strong className="text-text-primary block text-[10px] font-mono uppercase mb-0.5">
                        Documented Craft Evidence:
                      </strong>
                      {ev.evidenceNotes}
                    </p>
                  </div>
                ))}
              </div>

              {/* Verified Contributions Snapshot */}
              {employeeContributions.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono uppercase text-text-secondary flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Good Books Contributions ({employeeContributions.length})</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {employeeContributions.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-surface border border-border text-xs space-y-1">
                        <div className="font-bold text-text-primary truncate">{c.title}</div>
                        <div className="text-[10px] text-text-tertiary line-clamp-2">{c.impactMetrics || c.description}</div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Verified Contribution
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* Endorse Modal */}
      {isEndorseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
                <span>Endorse for Account Executive Promotion</span>
              </div>
              <button
                onClick={() => setIsEndorseModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Formally endorse <strong>{activeDossier.employeeName}</strong> for transition from National Service / Intern to full Account Executive responsibilities.
              Record a permanent management justification for leadership review:
            </p>

            <form onSubmit={handleEndorse} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Management Endorsement Justification Note
                </label>
                <textarea
                  rows={4}
                  value={endorsementNote}
                  onChange={(e) => setEndorsementNote(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional rigor in brief completeness auditing, pristine contact reporting, and reliable delivery support. Ready for full client account ownership."
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEndorseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-elevated rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl transition-opacity hover:opacity-90 shadow-xs cursor-pointer bg-emerald-600 text-white"
                >
                  Confirm Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Competency Evaluation Modal */}
      {isAddEvaluationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-elevated border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-text-primary">
                <FileCheck className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                <span>Add Competency Evaluation</span>
              </div>
              <button
                onClick={() => setIsAddEvaluationModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Competency Domain
                </label>
                <select
                  value={evalArea}
                  onChange={(e) => setEvalArea(e.target.value as NSSCompetencyEvaluation['competencyArea'])}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                >
                  <option value="client_communication">Client Communication &amp; Meeting Minutes</option>
                  <option value="brief_intake_rigor">Brief Intake Rigor &amp; Completeness</option>
                  <option value="cross_discipline_coordination">Cross-Discipline Workflow Coordination</option>
                  <option value="reporting_accuracy">Reporting Accuracy &amp; Billing Records</option>
                  <option value="reliability_under_pressure">Reliability Under Pressure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Evaluation Title
                </label>
                <input
                  type="text"
                  value={evalTitle}
                  onChange={(e) => setEvalTitle(e.target.value)}
                  placeholder="e.g. Weekly Status Deck Formulation"
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Demonstrated Proficiency Score (1 to 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs font-mono focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-text-tertiary mb-1">
                  Documented Evidence / Concrete Example
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="e.g. Successfully coordinated with motion team to deliver assets 4 hours ahead of schedule."
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-text-primary text-xs focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEvaluationModalOpen(false)}
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
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
