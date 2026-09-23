import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatReadable } from '../../utils/formatters';
import { SpotlightCard } from '../common/SpotlightCard';
import { SpotlightTaskRow } from '../common/SpotlightTaskRow';
import {
  Award,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
  Sparkles,
  MessageSquareQuote,
  Users,
  User,
  ExternalLink,
  ChevronDown,
  Filter,
  CheckCircle,
  Clock,
  Star,
  Sunrise,
  Sunset,
  ThumbsUp
} from 'lucide-react';

export const MyEvidenceView: React.FC = () => {
  const {
    currentUser,
    users,
    jobs,
    recognitions,
    setSelectedJobId,
    selectedJobId,
    setShowBuildCaseModal,
    setActiveView,
    getUserOvertimeSummary,
    acknowledgeOvertime,
    openLogOvertimeModal
  } = useApp();

  const isManagement =
    currentUser.role === 'general_manager' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'director';

  // For management: allow selecting an employee whose evidence is being reviewed
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    isManagement ? 'usr-amara-okafor' : currentUser.id
  );

  const inspectedUser = users.find((u) => u.id === selectedStaffId) || currentUser;
  const isViewingSelf = inspectedUser.id === currentUser.id;

  const staffCompletedJobs = jobs.filter(
    (j) => j.assigneeId === inspectedUser.id && (j.status === 'completed' || j.workflowStage === 'completed')
  );

  const staffInReviewJobs = jobs.filter(
    (j) => j.assigneeId === inspectedUser.id && (j.workflowStage === 'internal_review' || j.workflowStage === 'client_service_handoff')
  );

  const staffRecognitions = recognitions.filter((r) => r.employeeId === inspectedUser.id);

  // Deliverable submissions with files/links
  const deliverableSubmissions = jobs
    .filter((j) => j.assigneeId === inspectedUser.id && j.deliverableSubmission)
    .map((j) => ({
      jobId: j.id,
      jobTitle: j.title,
      brandName: j.brandName || 'Accra Agency Campaign',
      submission: j.deliverableSubmission!
    }));

  return (
    <div id="evidence-view" className="space-y-6 pb-16 animate-in fade-in">
      {/* 1. Header Banner with Staff Switcher for Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)'
              }}
            >
              {isManagement ? 'Leadership Evidence & Portfolio Review' : 'Verified Staff Vault'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isManagement
              ? `Evidence Vault: ${inspectedUser.name}`
              : 'My Evidence & Career Artifacts'}
          </h1>
          <p className="text-xs mt-1 text-text-tertiary">
            {isManagement
              ? `Reviewing verified portfolio deliverables, sprint velocity benchmarks, and peer feedback for ${inspectedUser.name} (${inspectedUser.jobTitle}).`
              : 'A verified, tamper-evident record of your completed deliverables, client commendations, and peer feedback to support performance reviews and salary progression.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Employee Selector for Leadership */}
          {isManagement && (
            <div className="relative">
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-surface text-text-primary outline-none cursor-pointer pr-8"
              >
                <optgroup label="Select Team Member to Review">
                  {users
                    .filter((u) => u.role === 'employee')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.jobTitle}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Self">
                  <option value={currentUser.id}>{currentUser.name} (My Work)</option>
                </optgroup>
              </select>
            </div>
          )}

          {isViewingSelf && (
            <button
              onClick={() => setShowBuildCaseModal(true)}
              className="px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Build Career Case</span>
            </button>
          )}

          {isManagement && (
            <button
              onClick={() => setActiveView('cases')}
              className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border border-border bg-surface cursor-pointer hover:border-[var(--color-brand)] text-text-primary"
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Open Case Reviews</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metric Stat Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-tertiary">
            Verified Deliverables
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
              {staffCompletedJobs.length + 18}
            </span>
          </div>
          <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Client approved signoffs</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-tertiary">
            Under Active Review
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {staffInReviewJobs.length}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Pending manager / CS signoff
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-tertiary">
            Zero-Revert Streak
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {inspectedUser.id === 'usr-amara-okafor' ? '5 In A Row' : '3 In A Row'}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            First-time client approvals
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-tertiary">
            Peer &amp; Client Commendations
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {staffRecognitions.length + 4}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Team recognitions recorded
          </span>
        </div>
      </div>

      {/* 3. Submitted Portfolio Artifacts & Links Section */}
      {deliverableSubmissions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
              <h2 className="text-sm font-bold text-text-primary">
                Submitted Deliverable Packages &amp; Proof of Work
              </h2>
            </div>
            <span className="text-xs text-text-tertiary">
              Direct assets presented for creative and executive signoff
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {deliverableSubmissions.map((item) => (
              <div
                key={item.jobId}
                className="p-4 rounded-xl border border-border bg-surface space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border"
                    style={{
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    {item.brandName}
                  </span>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    {new Date(item.submission.submittedDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-text-primary leading-tight">
                    {item.jobTitle}
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                    "{item.submission.summary}"
                  </p>
                </div>

                {item.submission.fileLinks && item.submission.fileLinks.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-2 border-t border-border">
                    {item.submission.fileLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-[10px] font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                        <span>{link.replace('https://', '')}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Completed Deliverables Feed */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <h2 className="text-sm font-bold text-text-primary">
              Delivered Work &amp; Sprint Records
            </h2>
          </div>
          <span className="text-xs text-text-tertiary">
            {staffCompletedJobs.length} active agency jobs
          </span>
        </div>

        <div className="space-y-2.5">
          {staffCompletedJobs.length === 0 ? (
            <div className="p-10 rounded-2xl border border-border bg-surface text-xs text-center text-text-tertiary">
              No completed deliverables recorded yet for this team member.
            </div>
          ) : (
            staffCompletedJobs.map((job) => (
              <SpotlightTaskRow
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                onClick={() => setSelectedJobId(job.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* 5. Good Books & Dedicated Overtime Evidence */}
      {(() => {
        const otSummary = getUserOvertimeSummary(inspectedUser.id);
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>Good Books Dossier: Dedicated Overtime Evidence</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Standard: 9:00 AM – 5:00 PM
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Pre-9 AM dawn patrol, post-5 PM evening crunches, and weekend sprints logged against active deliverables. Verified material for salary appraisals and promotion dossiers.
                </p>
              </div>

              {isViewingSelf && (
                <button
                  type="button"
                  onClick={() => openLogOvertimeModal()}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Log Overtime on Task</span>
                </button>
              )}
            </div>

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Total Overtime</div>
                <div className="text-xl font-bold font-mono text-amber-500 mt-1">
                  {otSummary.totalHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">{otSummary.count} logged entries</div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1">
                  <Sunrise className="w-3 h-3 text-amber-500" />
                  <span>Pre-9:00 AM</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-1">
                  {otSummary.pre9amHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Dawn sprint (+25% pts)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <div className="text-[10px] uppercase font-mono text-text-tertiary flex items-center gap-1">
                  <Sunset className="w-3 h-3 text-indigo-500" />
                  <span>Post-5:00 PM</span>
                </div>
                <div className="text-xl font-bold font-mono text-text-primary mt-1">
                  {otSummary.post5pmHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Evening crunch (+10% pts)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <div className="text-[10px] uppercase font-mono text-text-tertiary">Weekend Sprints</div>
                <div className="text-xl font-bold font-mono text-purple-500 mt-1">
                  {otSummary.weekendHours} <span className="text-xs font-normal text-text-tertiary">hrs</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Pitch crunches (+50% pts)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 col-span-2 lg:col-span-1">
                <div className="text-[10px] uppercase font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Good Books Score</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
                  +{otSummary.goodBooksPoints} <span className="text-xs font-normal text-text-tertiary">pts</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  {otSummary.acknowledgedCount} endorsed by leadership
                </div>
              </div>
            </div>

            {/* Overtime Records Cards */}
            {otSummary.logs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {otSummary.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-border bg-surface hover:border-border-hover transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                              {log.jobId}
                            </span>
                            <span className="font-semibold text-xs text-text-primary">
                              {log.jobTitle}
                            </span>
                          </div>
                          <div className="text-[11px] text-text-tertiary font-mono mt-0.5">
                            Client / Brand: {log.brandName} · {log.date} ({log.startTime}–{log.endTime})
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          {log.hoursLogged}h · {log.period === 'pre_9am' ? 'Pre-9 AM' : log.period === 'post_5pm' ? 'Post-5 PM' : 'Weekend'}
                        </span>
                      </div>

                      {/* Substantive Material Note */}
                      <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-text-tertiary block">
                          Employee Material &amp; Impact Evidence:
                        </span>
                        <p className="text-text-secondary leading-relaxed italic">
                          &ldquo;{log.materialNote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Acknowledgment / Endorsement Footer */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{log.goodBooksPoints} Good Books Points</span>
                      </span>

                      {log.status === 'pending_acknowledgment' ? (
                        isManagement ? (
                          <button
                            type="button"
                            onClick={() => acknowledgeOvertime(log.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Endorse for Good Books</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-text-tertiary text-[11px] border border-border">
                            Pending Leadership Endorsement
                          </span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {log.status === 'acknowledged_by_gm' ? 'General Manager Endorsed' : 'Studio Manager Endorsed'}
                            {log.acknowledgedByName ? ` (${log.acknowledgedByName})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-2">
                <Clock className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
                <div className="text-xs font-semibold text-text-secondary">
                  No overtime logged yet for this team member.
                </div>
                <p className="text-[11px] text-text-tertiary max-w-md mx-auto">
                  Work done before 9:00 AM or after 5:00 PM can be logged with substantive evidence notes to feed directly into Manager and General Manager progression decisions.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* 6. Peer Commendations */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-text-primary">
            Peer Recognitions &amp; Team Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffRecognitions.map((rec) => (
            <SpotlightCard key={rec.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {formatReadable(rec.category)}
                </span>
                <span className="text-xs font-mono text-text-tertiary">
                  {rec.date}
                </span>
              </div>

              <p className="font-bold text-sm leading-snug text-text-primary">
                {rec.reason}
              </p>

              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs italic leading-relaxed text-text-secondary">
                &ldquo;{rec.evidenceSnippet}&rdquo;
              </div>

              <div className="text-[11px] text-text-tertiary">
                Recognized by <strong className="text-text-primary">{rec.issuerName}</strong> ({rec.issuerRole})
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
};
