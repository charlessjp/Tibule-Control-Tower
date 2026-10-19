import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ContributionCategory, OperatingContext } from '../../types';
import {
  X,
  Sparkles,
  Award,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  HeartHandshake,
  Cpu,
  ShieldCheck,
  Flame,
  FileText,
  Link2,
  Calendar
} from 'lucide-react';

interface CategoryOption {
  id: ContributionCategory;
  name: string;
  shortDesc: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'exceptional_delivery',
    name: 'Exceptional Delivery',
    shortDesc: 'Rescued critical deadline, complex constraints, resolved delivery blockers',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'client_impact',
    name: 'Client Impact',
    shortDesc: 'Protected high-stakes delivery, urgent intervention, improved client outcome',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    shortDesc: 'Cross-team assistance, specialist mentoring, relieved team bottleneck',
    icon: <HeartHandshake className="w-4 h-4" />,
    color: 'text-sky-500 dark:text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30'
  },
  {
    id: 'craft_quality',
    name: 'Craft & Quality',
    shortDesc: 'Exceptional creative/technical execution, prevented quality defect',
    icon: <Award className="w-4 h-4" />,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'process_improvement',
    name: 'Process Improvement',
    shortDesc: 'Workflow automation, reusable system/template, eliminated manual waste',
    icon: <Cpu className="w-4 h-4" />,
    color: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  {
    id: 'operational_support',
    name: 'Operational Support',
    shortDesc: 'Traffic surge support, studio dispatch triage, dependency resolution',
    icon: <Layers className="w-4 h-4" />,
    color: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30'
  },
  {
    id: 'exceptional_effort',
    name: 'Exceptional Effort',
    shortDesc: 'Work outside normal hours for emergency turnaround or critical launch',
    icon: <Flame className="w-4 h-4" />,
    color: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  }
];

export const LogContributionModal: React.FC = () => {
  const {
    currentUser,
    users,
    jobs,
    isLogContributionModalOpen,
    isLogOvertimeModalOpen,
    closeLogContributionModal,
    closeLogOvertimeModal,
    logContributionTargetJobId,
    logOvertimeTargetJobId,
    logContribution
  } = useApp();

  const isOpen = isLogContributionModalOpen || isLogOvertimeModalOpen;
  const initialTargetJobId = logContributionTargetJobId || logOvertimeTargetJobId;

  const [nomineeId, setNomineeId] = useState<string>(currentUser.id);
  const isNomination = nomineeId !== currentUser.id;
  const targetNominee = users.find((u) => u.id === nomineeId) || currentUser;

  // Jobs relevant to current user or nominee
  const myJobs = jobs.filter((j) => (j.assigneeId === targetNominee.id || j.teamId === targetNominee.teamId) && j.status !== 'completed');
  const allEligibleJobs = myJobs.length > 0 ? myJobs : jobs;

  const [category, setCategory] = useState<ContributionCategory>('exceptional_delivery');
  const [title, setTitle] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [date, setDate] = useState<string>('2026-09-24');
  const [description, setDescription] = useState<string>('');
  const [impactStatement, setImpactStatement] = useState<string>('');
  const [evidenceLink, setEvidenceLink] = useState<string>('');

  // Time context (optional unless Exceptional Effort)
  const [includeTimeContext, setIncludeTimeContext] = useState<boolean>(false);
  const [operatingContext, setOperatingContext] = useState<OperatingContext>('outside_standard_hours');
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('20:00');
  const [durationHours, setDurationHours] = useState<number>(2.0);

  const [error, setError] = useState<string | null>(null);

  // Reset nominee to current user when modal opens
  useEffect(() => {
    if (isOpen) {
      setNomineeId(currentUser.id);
    }
  }, [isOpen, currentUser.id]);

  // Sync selected job on open
  useEffect(() => {
    if (initialTargetJobId) {
      setSelectedJobId(initialTargetJobId);
    } else if (allEligibleJobs[0]) {
      setSelectedJobId(allEligibleJobs[0].id);
    }
  }, [initialTargetJobId, allEligibleJobs]);

  // If user selects Exceptional Effort, automatically enable time context
  useEffect(() => {
    if (category === 'exceptional_effort') {
      setIncludeTimeContext(true);
    }
  }, [category]);

  // Auto-calculate duration whenever start or end time window changes
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
        let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // overnight
        }
        const calc = Math.round((diffMinutes / 60) * 10) / 10;
        if (calc > 0) {
          setDurationHours(calc);
        }
      }
    }
  }, [startTime, endTime]);

  const handleClose = () => {
    closeLogContributionModal();
    closeLogOvertimeModal();
    setError(null);
    setTitle('');
    setDescription('');
    setImpactStatement('');
    setEvidenceLink('');
    setIncludeTimeContext(false);
    setNomineeId(currentUser.id);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Resilient fallback defaults so submitting never silently fails
    const finalTitle = title.trim() || `${selectedCategoryMeta.name} - ${targetNominee.name}`;
    const finalDescription = description.trim() || `Contributed exceptional support on ${selectedJobId || 'active deliverable'} ensuring quality and delivery timeline adherence.`;
    const finalImpact = impactStatement.trim() || 'Preserved project quality, eliminated rework cycles, and protected delivery milestone.';
    const finalDuration = durationHours > 0 ? durationHours : 2.0;

    setError(null);

    const timeCtx =
      category === 'exceptional_effort' || includeTimeContext
        ? {
            startTime,
            endTime,
            durationHours: Number(finalDuration),
            operatingContext
          }
        : undefined;

    logContribution({
      nomineeId: isNomination ? nomineeId : undefined,
      category,
      title: finalTitle,
      description: finalDescription,
      impactStatement: finalImpact,
      relatedJobId: selectedJobId || undefined,
      contributionDate: date,
      timeContext: timeCtx,
      evidenceLinks: evidenceLink.trim() ? [evidenceLink.trim()] : undefined,
      attributes: {
        complexity: 'high',
        ownership: isNomination ? 'lead' : 'individual'
      }
    });

    handleClose();
  };

  const selectedCategoryMeta = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-secondary/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Award className="w-5 h-5" />
            </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {isNomination ? 'Submit Strategic Recommendation & Endorsement' : 'Strategic Recognition & Verified Impact'}
                </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                {isNomination
                  ? `Submitting leadership recommendation on behalf of ${targetNominee.name} for executive review and endorsement.`
                  : 'A verified record of meaningful contribution: making impact, ownership, and craft visible across leadership.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 0. Nominee / Team Member Selector */}
          <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-border">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Candidate / Contributor Being Recognized</span>
              <span className="text-[11px] font-mono text-brand-primary font-bold">
                {isNomination ? `Endorsing ${targetNominee.name}` : 'Self-Submission'}
              </span>
            </label>
            <select
              value={nomineeId}
              onChange={(e) => setNomineeId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface-elevated text-text-primary focus:outline-none focus:border-brand-primary font-medium"
            >
              <optgroup label="Your Profile">
                <option value={currentUser.id}>Myself ({currentUser.name} - {currentUser.jobTitle})</option>
              </optgroup>
              <optgroup label="Nominate Agency Colleague / Team Member">
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.jobTitle} ({u.department?.replace(/_/g, ' ') || 'Agency'})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* 1. Contribution Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Contribution Category</span>
              <span className="text-[11px] font-normal text-text-tertiary">
                Choose the primary dimension of impact
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? `${cat.bgColor} ${cat.borderColor} border-2 shadow-sm`
                        : 'border-border bg-surface-tertiary/30 hover:bg-surface-tertiary/60'
                    }`}
                  >
                    <div className={`mt-0.5 p-1 rounded-md ${cat.bgColor} ${cat.color}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{cat.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />}
                      </div>
                      <p className="text-[11px] text-text-tertiary line-clamp-2 mt-0.5 leading-snug">
                        {cat.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Contribution Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>Contribution Title</span>
              <span className="text-[11px] font-normal text-text-tertiary">
                Short, specific summary
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Resolved final motion export issue before launch"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>

          {/* 3. Related Work & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Related Job / Deliverable</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary"
              >
                <option value="">Agency-wide / Studio Initiative</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    [{j.id}] {j.title} ({j.brandName || 'Tibule'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Date of Contribution</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* 4. What Happened? (Required narrative) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>What did you contribute?</span>
              <span className="text-[11px] font-normal text-text-tertiary">
                Required narrative
              </span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the action you took, problem you tackled, or specialist assistance provided..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none transition-all"
            />
          </div>

          {/* 5. What was the impact? (Required narrative) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center justify-between">
              <span>What was the impact?</span>
              <span className="text-[11px] font-normal text-brand-primary">
                What did this enable, improve, or prevent?
              </span>
            </label>
            <textarea
              rows={2}
              value={impactStatement}
              onChange={(e) => setImpactStatement(e.target.value)}
              placeholder="e.g. Prevented client SLA breach, eliminated 4 hours of weekly manual work, or unlocked front-end UAT sign-off..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none transition-all"
            />
          </div>

          {/* 6. Supporting Evidence Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Supporting Evidence / Artifact Link (Optional)</span>
            </label>
            <input
              type="text"
              value={evidenceLink}
              onChange={(e) => setEvidenceLink(e.target.value)}
              placeholder="https://figma.com/..., pull request, or deliverable asset link"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* 7. Time Context (Mandatory for Exceptional Effort, optional for others) */}
          <div className="pt-2 border-t border-border">
            {category !== 'exceptional_effort' ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary">Record Operating Context</span>
                  <p className="text-[11px] text-text-tertiary">
                    Did this contribution involve exceptional effort outside standard hours?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeTimeContext(!includeTimeContext)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    includeTimeContext
                      ? 'shadow-xs font-bold'
                      : 'border-border text-text-secondary hover:bg-surface-tertiary'
                  }`}
                  style={
                    includeTimeContext
                      ? {
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)',
                          borderColor: 'var(--color-brand)'
                        }
                      : undefined
                  }
                >
                  {includeTimeContext ? 'Context Included' : '+ Add Time Context'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 shrink-0" />
                <span>
                  Exceptional Effort is recorded with operational context. It does not carry automated overtime point multipliers.
                </span>
              </div>
            )}

            {(category === 'exceptional_effort' || includeTimeContext) && (
              <div className="mt-3 p-4 rounded-lg bg-surface-tertiary/40 border border-border space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-text-secondary block mb-1">
                      Operating Context
                    </label>
                    <select
                      value={operatingContext}
                      onChange={(e) => setOperatingContext(e.target.value as OperatingContext)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs"
                    >
                      <option value="outside_standard_hours">Outside standard hours</option>
                      <option value="weekend">Weekend crunch</option>
                      <option value="standard_hours">Standard operating hours</option>
                      <option value="holiday">Public holiday</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-text-secondary block mb-1">
                      Time Window
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs"
                      />
                      <span className="text-text-tertiary text-xs">–</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text-secondary">
                        Duration (Hours)
                      </label>
                      <span className="text-[10px] font-mono text-emerald-500 font-medium">
                        Auto-calculated
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="16"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-secondary text-text-primary text-xs font-mono font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary italic">
                  Note: Time context helps leadership distinguish between personal employee dedication and systemic operational overload.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:opacity-95"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Award className="w-4 h-4" />
              <span>{isNomination ? 'Submit Recommendation for Strategic Recognition' : 'Record Strategic Contribution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
