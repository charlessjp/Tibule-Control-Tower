import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryImpactCategory, DeliveryImpactSeverity } from '../../types';
import { SeniorityBadge } from '../common/SeniorityBadge';
import {
  X,
  AlertTriangle,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  FileQuestion,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Send,
  Sparkles,
  Link2,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

const CATEGORY_OPTIONS: Array<{
  id: DeliveryImpactCategory;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'missing_assets',
    label: 'Missing Brief Assets & Specs',
    description: 'Raw footage, brand guidelines, fonts, vector logos, or copy not supplied.',
    icon: '📦'
  },
  {
    id: 'scope_creep',
    label: 'Scope Creep & Unscheduled Additions',
    description: 'New formats, extra screens, or deliverables added outside approved debrief.',
    icon: '📈'
  },
  {
    id: 'client_delay',
    label: 'Client Approval / Feedback Lag',
    description: 'Client missed review SLA or has not provided consolidated feedback.',
    icon: '⏳'
  },
  {
    id: 'technical_issue',
    label: 'Software, Tooling & Render Outage',
    description: 'Server crash, render engine failure, corrupted project files, or license issue.',
    icon: '💻'
  },
  {
    id: 'cross_dependency',
    label: 'Inter-Department Dependency',
    description: 'Waiting on Client Services brief, Strategy debrief pack, or QA review.',
    icon: '🔗'
  },
  {
    id: 'workload_overload',
    label: 'Workload Concurrency & Crunch',
    description: 'Pulled onto simultaneous urgent pitch or conflicting top-priority brief.',
    icon: '🔥'
  },
  {
    id: 'stakeholder_conflict',
    label: 'Conflicting Stakeholder Direction',
    description: 'Contradictory feedback between directors or account leads requiring alignment.',
    icon: '🧭'
  },
  {
    id: 'production_spec',
    label: 'Production / Print Dieline Rejection',
    description: 'Printer dieline mismatch, color profile conflict, or vendor delay.',
    icon: '📐'
  },
  {
    id: 'health_emergency',
    label: 'Personal / Health Emergency',
    description: 'Team member unexpected illness or urgent unavoidable personal absence.',
    icon: '🏥'
  },
  {
    id: 'other',
    label: 'Other Delivery Impediment',
    description: 'Any external or unforeseen constraint threatening timely milestone sign-off.',
    icon: '⚠️'
  }
];

const SEVERITY_CONFIG: Record<
  DeliveryImpactSeverity,
  { label: string; description: string; badgeClass: string; borderClass: string }
> = {
  low: {
    label: 'Low Risk',
    description: 'Minor impediment (~4-8h lag). Recoverable with small schedule tweaks.',
    badgeClass: 'text-[var(--color-success)] bg-[var(--color-success)]/10',
    borderClass: 'border-[var(--color-success)]/30'
  },
  medium: {
    label: 'Medium Risk',
    description: 'Manageable delay (1-2 days). Requires lead awareness and task rescheduling.',
    badgeClass: 'text-[var(--color-brand)] bg-[var(--color-brand)]/10',
    borderClass: 'border-[var(--color-brand)]/30'
  },
  high: {
    label: 'High Risk',
    description: 'Direct deadline threat (2-3 days). Client or internal milestone will be missed.',
    badgeClass: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10',
    borderClass: 'border-[var(--color-warning)]/30'
  },
  critical: {
    label: 'Critical Blocker',
    description: 'Total workstream stop. Cannot proceed without immediate lead or CS intervention.',
    badgeClass: 'text-[var(--color-critical)] bg-[var(--color-critical)]/10',
    borderClass: 'border-[var(--color-critical)]/40'
  }
};

export const LogDeliveryImpactModal: React.FC = () => {
  const {
    currentUser,
    jobs,
    isLogDeliveryImpactModalOpen,
    closeLogDeliveryImpactModal,
    logDeliveryImpactTargetJobId,
    logDeliveryImpact
  } = useApp();

  // Selected deliverable & delay in hours (working agency standard: 8h = 1 business day)
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [category, setCategory] = useState<DeliveryImpactCategory>('missing_assets');
  const [severity, setSeverity] = useState<DeliveryImpactSeverity>('medium');
  const [delayHours, setDelayHours] = useState<number>(16);
  const [impactDescription, setImpactDescription] = useState<string>('');
  const [mitigationRequested, setMitigationRequested] = useState<string>('');
  const [evidenceLink, setEvidenceLink] = useState<string>('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Filter available jobs
  const availableJobs = useMemo(() => {
    // Show user's assigned jobs first, then team jobs
    const myJobs = jobs.filter((j) => j.assigneeId === currentUser.id && j.status !== 'completed');
    const teamJobs = jobs.filter(
      (j) => j.teamId === currentUser.teamId && j.assigneeId !== currentUser.id && j.status !== 'completed'
    );
    const otherJobs = jobs.filter((j) => j.teamId !== currentUser.teamId && j.status !== 'completed');
    return { myJobs, teamJobs, otherJobs };
  }, [jobs, currentUser]);

  // Sync target job when opened
  useEffect(() => {
    if (isLogDeliveryImpactModalOpen) {
      if (logDeliveryImpactTargetJobId) {
        setSelectedJobId(logDeliveryImpactTargetJobId);
      } else if (availableJobs.myJobs.length > 0) {
        setSelectedJobId(availableJobs.myJobs[0].id);
      } else if (availableJobs.teamJobs.length > 0) {
        setSelectedJobId(availableJobs.teamJobs[0].id);
      } else if (jobs.length > 0) {
        setSelectedJobId(jobs[0].id);
      }
      setIsSubmittedSuccess(false);
    }
  }, [isLogDeliveryImpactModalOpen, logDeliveryImpactTargetJobId, availableJobs, jobs]);

  const currentJob = jobs.find((j) => j.id === selectedJobId);

  // Derived days (8h standard working day)
  const delayDays = useMemo(() => {
    const rawDays = delayHours / 8;
    return rawDays % 1 === 0 ? rawDays : Number(rawDays.toFixed(1));
  }, [delayHours]);

  // Calculate proposed revised due date based on delay hours (called before any early return to obey Rules of Hooks)
  const originalDueDate = currentJob?.dueDate || new Date().toISOString();
  const proposedDueDate = useMemo(() => {
    try {
      const orig = new Date(originalDueDate);
      // Milliseconds calculation for exact hours delay
      const revised = new Date(orig.getTime() + delayHours * 60 * 60 * 1000);
      return revised.toISOString();
    } catch {
      return originalDueDate;
    }
  }, [originalDueDate, delayHours]);

  if (!isLogDeliveryImpactModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impactDescription.trim()) return;

    logDeliveryImpact({
      jobId: selectedJobId || undefined,
      jobTitle: currentJob?.title || 'General Delivery Impediment',
      clientProject: currentJob?.clientProject || 'Cross-Studio Delivery',
      loggedByUserId: currentUser.id,
      loggedByName: currentUser.name,
      loggedByRole: currentUser.jobTitle,
      loggedBySeniority: currentUser.seniority,
      loggedByDepartment: currentUser.department,
      category,
      severity,
      estimatedDelayDays: delayDays,
      estimatedDelayHours: Number(delayHours),
      impactDescription: impactDescription.trim(),
      mitigationRequested: mitigationRequested.trim() || undefined,
      evidenceLink: evidenceLink.trim() || undefined,
      originalDueDate,
      proposedRevisedDueDate: proposedDueDate
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      closeLogDeliveryImpactModal();
      setIsSubmittedSuccess(false);
      setImpactDescription('');
      setMitigationRequested('');
      setEvidenceLink('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="log-delivery-impact-modal"
        className="w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Modal Header */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'var(--color-warning-muted)',
                borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                color: 'var(--color-warning)'
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">
                  Log Delivery Impediment &amp; Deadline Risk
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Staff &amp; Lead Governance
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">
                Log external blockers, scope increases, asset delays, or crunch hours directly threatening deliveries.
              </p>
            </div>
          </div>

          <button
            onClick={closeLogDeliveryImpactModal}
            className="p-1.5 rounded-lg border border-border/80 hover:bg-surface text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        {isSubmittedSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Delivery Risk Logged Successfully</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-md">
                Discipline Leads, Traffic Dispatch, and Client Services have been alerted in the Operational Event Stream.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
            {/* Submitter Strip */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-contrast)'
                  }}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{currentUser.name}</span>
                    <SeniorityBadge seniority={currentUser.seniority || 'mid'} size="xs" />
                  </div>
                  <div className="text-[11px] text-text-tertiary">
                    {currentUser.jobTitle} • {currentUser.department?.toUpperCase() || 'STUDIO'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-text-tertiary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Step 1: Target Deliverable / Job Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary">
                1. Affected Deliverable / Workstream
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border text-text-primary text-xs focus:outline-none focus:border-brand-primary"
              >
                <optgroup label="My Assigned Deliverables">
                  {availableJobs.myJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} - {j.title} ({j.clientProject}) [Due {new Date(j.dueDate).toLocaleDateString()}]
                    </option>
                  ))}
                </optgroup>
                <optgroup label="My Squad / Team Queue">
                  {availableJobs.teamJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} - {j.title} ({j.clientProject}) [Due {new Date(j.dueDate).toLocaleDateString()}]
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Studio Deliverables">
                  {availableJobs.otherJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} - {j.title} ({j.clientProject})
                    </option>
                  ))}
                </optgroup>
                <option value="">General Team / Studio Process Bottleneck (Not single deliverable)</option>
              </select>
            </div>

            {/* Step 2: Impediment Classification */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary">
                2. Impediment Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-brand)] bg-brand-primary/10 shadow-xs'
                          : 'border-border/70 bg-surface-elevated/60 hover:border-border'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-xs leading-snug ${isSelected ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-text-tertiary mt-0.5 line-clamp-2">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Severity Tier */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary">
                3. Delivery Risk Severity
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(SEVERITY_CONFIG) as DeliveryImpactSeverity[]).map((sevKey) => {
                  const isSelected = severity === sevKey;
                  const cfg = SEVERITY_CONFIG[sevKey];
                  return (
                    <button
                      key={sevKey}
                      type="button"
                      onClick={() => setSeverity(sevKey)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${cfg.borderClass} ${cfg.badgeClass} shadow-xs font-bold`
                          : 'border-border/70 bg-surface-elevated/60 text-text-secondary hover:border-border'
                      }`}
                    >
                      <div className="font-bold text-[11px] uppercase tracking-wider">{cfg.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5 line-clamp-2 leading-tight">
                        {cfg.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Estimated Delivery Delay in Hours (Working Hours Conversation) */}
            <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                    4. Estimated Delivery Delay
                  </label>
                  <span className="text-[10px] text-text-tertiary">
                    Agency conversations measure delivery extension in operational hours (8h = 1 business day)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[2, 4, 8, 16, 24, 40].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDelayHours(hours)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                        delayHours === hours
                          ? 'bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-xs'
                          : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      +{hours}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Hours Input & Days Context */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-border/70">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Custom Hours:</span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={delayHours}
                      onChange={(e) => setDelayHours(Math.max(1, Number(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-border bg-surface-elevated text-text-primary text-center focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <span className="ml-1.5 text-xs font-mono text-text-tertiary">hours</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  Equivalent to: <strong className="text-text-primary font-bold">{delayDays} {delayDays === 1 ? 'day' : 'days'}</strong> ({delayHours}h production time)
                </div>
              </div>

              {/* Timeline comparison strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-surface border border-border/70">
                  <div className="text-[10px] text-text-tertiary uppercase font-mono">Current Agreed Due Date</div>
                  <div className="font-semibold text-text-primary mt-0.5">
                    {new Date(originalDueDate).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-warning-muted)',
                    borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                  }}
                >
                  <div className="text-[10px] font-mono uppercase font-bold" style={{ color: 'var(--color-warning)' }}>
                    Proposed Realistic Delivery
                  </div>
                  <div className="font-bold text-text-primary mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>
                      {new Date(proposedDueDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                      (+{delayHours}h / {delayDays}d)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Concrete Description & Blocker Detail */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary">
                5. Detail What is Affecting Delivery *
              </label>
              <textarea
                required
                rows={3}
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                placeholder="Explain the impediment: e.g. Client has not provided high-res 3D packshot files; font license missing; debrief missing key dimensions; or team lead requested 4 unplanned responsive banners..."
                className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border text-text-primary text-xs focus:outline-none focus:border-brand-primary leading-relaxed"
              />
            </div>

            {/* Step 6: Requested Lead / Traffic Mitigation */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary">
                6. Requested Mitigation / Management Relief (Optional)
              </label>
              <input
                type="text"
                value={mitigationRequested}
                onChange={(e) => setMitigationRequested(e.target.value)}
                placeholder="e.g. Request Client Services to negotiate deadline extension to Friday; or Traffic to assign junior designer..."
                className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border text-text-primary text-xs focus:outline-none focus:border-brand-primary"
              />
              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Request client deadline relief by 2 days',
                  'Assign junior/intern to handle resizes',
                  'Escalate to CS for missing assets',
                  'Call emergency strategy alignment sync'
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setMitigationRequested(sugg)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border/80 text-text-tertiary hover:text-text-primary hover:border-brand-primary/40 transition-colors cursor-pointer"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 7: Reference / Proof Link */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase font-mono tracking-wider text-text-secondary flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />
                7. Evidence or Discussion Reference (Optional)
              </label>
              <input
                type="text"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="e.g. Email subject thread, Figma link, Client WhatsApp screenshot, or ticket URL"
                className="w-full p-2 rounded-xl bg-surface-elevated border border-border text-text-primary text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Modal Footer / Action Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
              <button
                type="button"
                onClick={closeLogDeliveryImpactModal}
                className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:text-text-primary text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!impactDescription.trim()}
                className="px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-95 transition-opacity disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Delivery Risk Log</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
