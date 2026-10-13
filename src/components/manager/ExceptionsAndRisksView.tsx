import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Filter,
  ArrowRight,
  Layers,
  Users,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Zap,
  HelpCircle
} from 'lucide-react';
import { ExceptionItem } from '../../types';

export const ExceptionsAndRisksView: React.FC = () => {
  const {
    currentUser,
    jobs,
    users,
    teams,
    exceptions,
    resolveException,
    resolveBlocker,
    setSelectedJobId,
    setActiveView
  } = useApp();

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService =
    role === 'client_service' ||
    currentUser.department === 'client_services' ||
    currentUser.teamId === 'team-client-service';
  const isCreativeLead =
    (role === 'manager' || role === 'director' || role === 'team_lead') &&
    !isClientService;

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);

  // Deliverables with active blocks or SLA risk
  const relevantJobs = jobs.filter((j) => {
    if (j.status === 'completed') return false;
    if (isCreativeLead) return j.teamId === currentUser.teamId;
    return true;
  });

  const blockedJobs = relevantJobs.filter((j) => j.status === 'blocked');
  const atRiskJobs = relevantJobs.filter((j) => j.isAtRisk || j.priority === 'urgent');

  // Filter exceptions based on role and severity
  const activeExceptions = exceptions.filter((exc) => {
    if (resolvedIds.includes(exc.id)) return false;
    if (severityFilter !== 'all' && exc.severity !== severityFilter) return false;
    if (isCreativeLead) {
      if (exc.teamId && exc.teamId !== currentUser.teamId) return false;
    }
    return true;
  });

  const handleResolve = (id: string) => {
    resolveException(id);
    setResolvedIds((prev) => [...prev, id]);
  };

  const getRoleHeader = () => {
    if (isClientService) {
      return {
        tag: 'Client Account Governance',
        title: 'Delivery Risks & Client Escalations',
        desc: 'Active oversight of client turnaround delays, scope boundary disputes, unbudgeted reverts, and campaign SLA risks.'
      };
    }
    if (isTraffic) {
      return {
        tag: 'Traffic Desk Operations',
        title: 'Exceptions, Blockers & Dispatch Risks',
        desc: 'Direct triage of agency-wide capacity bottlenecks, assignee concurrency conflicts, held jobs, and milestone breaches.'
      };
    }
    if (isCreativeLead) {
      return {
        tag: 'Studio Discipline Leadership',
        title: 'Exceptions & Active Blockers',
        desc: 'Intervention radar for creative squad dependencies, missing assets, technical impediments, and deliverable handoffs.'
      };
    }
    return {
      tag: 'Executive Risk Oversight',
      title: 'Agency Exceptions & Escalation Radar',
      desc: 'High-altitude executive radar across all departments monitoring delivery friction, inter-team constrictions, and critical SLA breaches.'
    };
  };

  const headerInfo = getRoleHeader();

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeExceptions.length > 0 ? 'var(--color-critical)' : 'var(--color-success)' }}
            />
            <span>{headerInfo.tag}</span>
            <span>•</span>
            <span>{currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {headerInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            {headerInfo.desc}
          </p>
        </div>

        {/* Severity Metrics */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs font-mono flex items-center gap-2">
            <span className="text-text-tertiary">Active Blockers:</span>
            <span
              className="font-bold"
              style={{ color: blockedJobs.length > 0 ? 'var(--color-critical)' : 'var(--color-text-primary)' }}
            >
              {blockedJobs.length} Held
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs font-mono flex items-center gap-2">
            <span className="text-text-tertiary">SLA Hazards:</span>
            <span
              className="font-bold"
              style={{ color: atRiskJobs.length > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}
            >
              {atRiskJobs.length} At Risk
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-tertiary mr-1">Filter Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-surface-elevated border border-border text-text-primary shadow-xs font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {sev === 'all' ? `All Items (${activeExceptions.length})` : `${sev} (${exceptions.filter(e => e.severity === sev && !resolvedIds.includes(e.id)).length})`}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-text-tertiary">
          Total Interventions: <strong className="text-text-primary">{activeExceptions.length + blockedJobs.length}</strong>
        </div>
      </div>

      {/* Deliverable Blockers Section (Held Jobs) */}
      {blockedJobs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-critical)' }} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Held Deliverables Awaiting Resolution ({blockedJobs.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {blockedJobs.map((job) => {
              const assignee = users.find((u) => u.id === job.assigneeId);
              return (
                <SpotlightCard key={job.id} className="p-4 space-y-3 border-l-4" style={{ borderLeftColor: 'var(--color-critical)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-critical)' }}>
                          {job.id}
                        </span>
                        <span className="text-xs font-bold text-text-primary">{job.title}</span>
                      </div>
                      <div className="text-[11px] text-text-tertiary mt-0.5">
                        Client: <strong className="text-text-secondary">{job.clientProject}</strong> · Assignee: {assignee ? assignee.name : 'Unassigned'}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500">
                      Blocked
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border text-xs text-text-secondary">
                    <span className="font-bold text-text-primary block text-[10px] uppercase font-mono mb-0.5">
                      Blocker Reason:
                    </span>
                    {job.blockerReason || 'Waiting on client signoff or external brief clarification.'}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="font-mono font-bold hover:underline cursor-pointer flex items-center gap-1"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      Inspect Deliverable <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => resolveBlocker(job.id)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-surface hover:bg-surface-elevated text-text-primary transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      Unblock &amp; Resume
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Exceptions Grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Dependency Intervention Radar ({activeExceptions.length})
          </h2>
        </div>

        {activeExceptions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-text-primary">All Exceptions &amp; Blockers Cleared</div>
            <p className="text-xs text-text-tertiary max-w-md mx-auto">
              No outstanding dependency conflicts or delivery exceptions are currently flagged in your scope.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeExceptions.map((exc) => {
              const relatedJob = exc.relatedJobId ? jobs.find((j) => j.id === exc.relatedJobId) : null;
              const isCrit = exc.severity === 'critical';

              return (
                <SpotlightCard key={exc.id} className="p-5 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${isCrit ? 'animate-ping' : ''}`}
                          style={{ backgroundColor: isCrit ? 'var(--color-critical)' : 'var(--color-warning)' }}
                        />
                        <h3 className="font-bold text-sm text-text-primary">{exc.title}</h3>
                      </div>
                      <span
                        className="text-[11px] font-mono uppercase font-bold tracking-wider"
                        style={{
                          color: isCrit ? 'var(--color-critical)' : 'var(--color-warning)'
                        }}
                      >
                        {exc.severity}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {exc.description}
                    </p>

                    <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-[11px] space-y-1">
                      <span className="font-bold text-text-primary uppercase text-[9px] font-mono block">
                        Recommended Command Action:
                      </span>
                      <div className="text-text-secondary leading-normal">{exc.recommendedAction}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    {exc.relatedJobId ? (
                      <button
                        onClick={() => setSelectedJobId(exc.relatedJobId!)}
                        className="font-mono font-bold hover:underline cursor-pointer flex items-center gap-1"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        Inspect {exc.relatedJobId} ➔
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-text-tertiary">Agency Infrastructure</span>
                    )}

                    <button
                      onClick={() => handleResolve(exc.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Resolve &amp; Clear
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
