import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, EmailAlertItem, WebNotificationItem, DeliverableEscalationStage } from '../../types';
import { formatReadable, formatRole } from '../../utils/formatters';
import { evaluateDeliverableEscalation } from '../../utils/escalationEngine';
import {
  X,
  Bell,
  Mail,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Flame,
  CheckCheck,
  RefreshCw,
  MessageSquare,
  Filter,
  UserCheck
} from 'lucide-react';

interface DeadlineRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeadlineRadarModal: React.FC<DeadlineRadarModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    jobs,
    users,
    currentUser,
    emailAlerts,
    webNotifications,
    sendEmailAlert,
    nearlyDueWarningHours,
    setNearlyDueWarningHours,
    promptAssignee,
    pushDeliverableToSuperior,
    triggerEscalationScan,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setSelectedJobId,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'web_notifs' | 'email_outbox'>('radar');
  const [selectedEmail, setSelectedEmail] = useState<EmailAlertItem | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sentToast, setSentToast] = useState<string | null>(null);
  const [promptJobId, setPromptJobId] = useState<string | null>(null);
  const [customPromptNote, setCustomPromptNote] = useState<string>('');
  const [filterOnlyMine, setFilterOnlyMine] = useState<boolean>(false);

  // Evaluate all active jobs against the escalation ladder
  const evaluatedJobs = useMemo(() => {
    return jobs
      .filter((j) => j.workflowStage !== 'completed' && j.status !== 'completed')
      .map((job) => {
        const evalResult = evaluateDeliverableEscalation(job, users, nearlyDueWarningHours);
        return {
          job,
          evalResult
        };
      })
      .filter((item) => item.evalResult.stage !== 'on_track')
      .sort((a, b) => b.evalResult.overdueHours - a.evalResult.overdueHours);
  }, [jobs, users, nearlyDueWarningHours]);

  const filteredEvaluatedJobs = useMemo(() => {
    return evaluatedJobs.filter((item) => {
      if (stageFilter !== 'all' && item.evalResult.stage !== stageFilter) return false;
      if (filterOnlyMine) {
        return (
          item.job.assigneeId === currentUser.id ||
          item.job.managerId === currentUser.id ||
          (currentUser.role === 'traffic_manager' && item.evalResult.stage === 'overdue_1h_traffic') ||
          (currentUser.role === 'general_manager' && item.evalResult.stage === 'overdue_72h_gm')
        );
      }
      return true;
    });
  }, [evaluatedJobs, stageFilter, filterOnlyMine, currentUser]);

  // Web notifications filtered
  const filteredWebNotifs = useMemo(() => {
    return webNotifications.filter((n) => {
      if (filterOnlyMine) {
        return (
          n.recipientId === currentUser.id ||
          (currentUser.role === 'general_manager' && n.escalationStage === 'overdue_72h_gm') ||
          (currentUser.role === 'traffic_manager' && n.escalationStage === 'overdue_1h_traffic')
        );
      }
      return true;
    });
  }, [webNotifications, filterOnlyMine, currentUser]);

  if (!isOpen) return null;

  const handleRunScan = () => {
    const { dispatchedEmails, dispatchedWebNotifs } = triggerEscalationScan();
    setSentToast(
      `Escalation scan executed: ${dispatchedWebNotifs} in-app alert(s) and ${dispatchedEmails} email dispatch(es) synced across studio.`
    );
    setTimeout(() => setSentToast(null), 5000);
  };

  const handlePromptSubmit = (jobId: string) => {
    promptAssignee(jobId, customPromptNote.trim() || undefined);
    setPromptJobId(null);
    setCustomPromptNote('');
    setSentToast(`Traffic status check prompted to assignee with email & web notification.`);
    setTimeout(() => setSentToast(null), 4000);
  };

  const handlePushReview = (jobId: string) => {
    pushDeliverableToSuperior(jobId);
    setSentToast(`Deliverable pushed to superior for review. Superior alerted via email & web notification.`);
    setTimeout(() => setSentToast(null), 4000);
  };

  const handleViewJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveView('jobs');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="deadline-radar-modal"
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Tiered Deliverable Escalation Engine
              </span>
              <span className="text-xs text-text-tertiary">
                • 6-Tier SLA Alert Protocol
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              Studio Deliverable Escalation &amp; Dispatch Radar
            </h2>
            <p className="text-xs text-text-tertiary">
              Automatic alert triggers: Nearly Due (staff email/web) → Due Now (push to review) → 1h Overdue (traffic prompt) → 3h (team lead) → 24h (director) → 72h (general manager).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunScan}
              title="Execute live scan across all open deliverables"
              className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors text-text-primary"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              <span className="hidden sm:inline">Run Escalation Scan</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-b border-border bg-surface shrink-0 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'radar'
                  ? 'shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={activeTab === 'radar' ? { backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' } : undefined}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalation Radar ({evaluatedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('web_notifs')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'web_notifs'
                  ? 'shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={activeTab === 'web_notifs' ? { backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' } : undefined}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Web Notifications ({webNotifications.filter((n) => !n.read).length} unread)</span>
            </button>

            <button
              onClick={() => setActiveTab('email_outbox')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'email_outbox'
                  ? 'shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={activeTab === 'email_outbox' ? { backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' } : undefined}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Dispatch Log ({emailAlerts.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOnlyMine(!filterOnlyMine)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterOnlyMine
                  ? 'bg-[var(--color-brand)]/15 border-[var(--color-brand)] text-[var(--color-brand)] font-bold'
                  : 'border-border bg-surface-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Filter: My Relevant ({currentUser.name.split(' ')[0]})</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
              <span>Warn Window:</span>
              <select
                value={nearlyDueWarningHours}
                onChange={(e) => setNearlyDueWarningHours(Number(e.target.value))}
                className="px-2 py-0.5 rounded border border-border bg-surface text-text-primary text-[11px] font-mono cursor-pointer"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={36}>36 Hours</option>
                <option value={48}>48 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toast confirmation */}
        {sentToast && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sentToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'radar' && (
            <div className="space-y-4">
              {/* Escalation Stage Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-[11px] font-mono uppercase text-text-tertiary mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Tier:
                </span>
                {[
                  { key: 'all', label: `All Active (${evaluatedJobs.length})` },
                  { key: 'nearly_due', label: 'Nearly Due (<24h)' },
                  { key: 'due_now', label: 'Due Now (0h Push)' },
                  { key: 'overdue_1h_traffic', label: '1h Traffic Prompt' },
                  { key: 'overdue_3h_lead', label: '3h Team Lead' },
                  { key: 'overdue_24h_director', label: '24h Studio Director' },
                  { key: 'overdue_72h_gm', label: '72h (3d) General Manager' }
                ].map((pill) => {
                  const count =
                    pill.key === 'all'
                      ? evaluatedJobs.length
                      : evaluatedJobs.filter((e) => e.evalResult.stage === pill.key).length;
                  return (
                    <button
                      key={pill.key}
                      onClick={() => setStageFilter(pill.key)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        stageFilter === pill.key
                          ? 'bg-surface-elevated border-text-primary text-text-primary font-bold shadow-xs'
                          : 'border-border bg-surface text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      {pill.label} {count > 0 && <span className="opacity-75">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Jobs List */}
              {filteredEvaluatedJobs.length === 0 ? (
                <div className="p-8 rounded-2xl border border-border bg-surface-elevated text-center text-text-tertiary space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-80" />
                  <div className="font-bold text-sm text-text-primary">No Deliverables in this Escalation Tier</div>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    All agency assignments under this filter are either completed, within on-track delivery windows, or no deliverables match your filter criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvaluatedJobs.map(({ job, evalResult }) => {
                    const assignee = users.find((u) => u.id === job.assigneeId);
                    const manager = users.find((u) => u.id === job.managerId);
                    const isPromptOpen = promptJobId === job.id;

                    const tierColor =
                      evalResult.stage === 'overdue_72h_gm'
                        ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                        : evalResult.stage === 'overdue_24h_director'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                        : evalResult.stage === 'overdue_3h_lead'
                        ? 'border-red-500/40 bg-red-500/10 text-red-400'
                        : evalResult.stage === 'overdue_1h_traffic'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        : evalResult.stage === 'due_now'
                        ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                        : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';

                    return (
                      <div
                        key={job.id}
                        className={`p-4 rounded-xl border transition-all ${tierColor.split(' ')[0]} ${tierColor.split(' ')[1]}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-sm text-text-primary">{job.id}</span>
                              <span className="font-bold text-sm text-text-primary truncate">{job.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${tierColor}`}>
                                {evalResult.stageLabel}
                              </span>
                              {evalResult.overdueHours > 0 ? (
                                <span className="text-[11px] font-mono font-bold text-rose-400">
                                  {evalResult.overdueHours >= 24
                                    ? `${(evalResult.overdueHours / 24).toFixed(1)} Days Overdue`
                                    : `${Math.round(evalResult.overdueHours)}h Overdue`}
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono font-bold text-yellow-400">
                                  Due in {Math.abs(Math.round(evalResult.overdueHours))}h
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>Brand: <strong className="text-text-primary">{job.requestor}</strong></span>
                              <span>Assignee: <strong className="text-text-primary">{assignee?.name || 'Unassigned'}</strong> ({assignee?.jobTitle || 'Staff'})</span>
                              <span>Manager: <strong className="text-text-primary">{manager?.name || 'Elena Rostova'}</strong></span>
                              <span>Due: <strong className="text-text-primary">{new Date(job.dueDate).toLocaleString()}</strong></span>
                            </div>

                            {/* Escalation details and alert targets */}
                            <div className="p-2 rounded-lg bg-surface border border-border text-[11px] space-y-1">
                              <div className="text-text-secondary">
                                <strong>Alert Targets:</strong> {evalResult.alertRecipientsSummary}
                              </div>
                              <div className="text-text-tertiary">
                                <strong>Required Next Action:</strong> {evalResult.recommendedAction}
                              </div>
                              {job.lastPromptedAt && (
                                <div className="text-amber-400 font-mono text-[10px] pt-0.5">
                                  ⚠️ Last Traffic Prompt: {new Date(job.lastPromptedAt).toLocaleTimeString()} — "{job.promptNotes}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Controls */}
                          <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                            {/* Push to superior CTA */}
                            <button
                              onClick={() => handlePushReview(job.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Push to Superior</span>
                            </button>

                            {/* Prompt Assignee (Traffic or Lead) */}
                            {evalResult.stage !== 'nearly_due' && (
                              <button
                                onClick={() => {
                                  setPromptJobId(isPromptOpen ? null : job.id);
                                  setCustomPromptNote(`Kwame Mensah (Traffic Lead) prompted for immediate submission ETA on ${job.id}.`);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-text-primary"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isPromptOpen ? 'Cancel Prompt' : 'Prompt Assignee'}</span>
                              </button>
                            )}

                            {/* View Job Link */}
                            <button
                              onClick={() => handleViewJob(job.id)}
                              className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-[11px] text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>View Task</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Traffic Prompt Composer */}
                        {isPromptOpen && (
                          <div className="mt-3 p-3 rounded-xl border border-amber-500/40 bg-surface space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                                Prompt Assignee ({assignee?.name || 'Staff'})
                              </span>
                              <span className="text-[10px] text-text-tertiary">
                                Sends in-app web nudge + official email notice
                              </span>
                            </div>
                            <input
                              type="text"
                              value={customPromptNote}
                              onChange={(e) => setCustomPromptNote(e.target.value)}
                              placeholder="Add custom prompt notes or instructions..."
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs text-text-primary focus:outline-none focus:border-[var(--color-brand)]"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setPromptJobId(null)}
                                className="px-2.5 py-1 rounded-lg border border-border text-xs text-text-tertiary hover:text-text-primary cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handlePromptSubmit(job.id)}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Dispatch Prompt Alert</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'web_notifs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="font-bold text-xs text-text-secondary">
                  Web In-App Notification Feed ({filteredWebNotifs.length})
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-[11px] font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All as Read</span>
                </button>
              </div>

              {filteredWebNotifs.length === 0 ? (
                <div className="p-8 rounded-xl border border-border bg-surface-elevated text-center text-text-tertiary">
                  No web notifications available.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredWebNotifs.map((notif) => {
                    const recipient = users.find((u) => u.id === notif.recipientId);
                    return (
                      <div
                        key={notif.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          notif.read
                            ? 'border-border bg-surface text-text-secondary opacity-75'
                            : 'border-[var(--color-brand)]/40 bg-[var(--color-brand)]/5 text-text-primary shadow-xs'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-text-primary">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-surface-elevated border border-border text-text-tertiary">
                              {formatRole(notif.recipientRole)}
                            </span>
                            <span className="text-[10px] text-text-tertiary">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="text-[10px] text-text-tertiary">
                            Recipient: <strong>{recipient?.name || notif.recipientId}</strong> • Task: <strong>{notif.jobId}</strong> ({notif.brandName})
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {notif.actionType === 'push_to_review' && notif.jobId && (
                            <button
                              onClick={() => {
                                handlePushReview(notif.jobId!);
                                markNotificationRead(notif.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <span>{notif.actionLabel || 'Push to Review'}</span>
                            </button>
                          )}

                          {notif.jobId && (
                            <button
                              onClick={() => handleViewJob(notif.jobId!)}
                              className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-elevated text-[11px] text-text-secondary hover:text-text-primary cursor-pointer"
                            >
                              View Task
                            </button>
                          )}

                          {!notif.read ? (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              className="p-1 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary cursor-pointer"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-rose-400 cursor-pointer"
                              title="Delete notification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'email_outbox' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <div className="font-bold text-xs text-text-secondary mb-1">
                  Dispatched Email History ({emailAlerts.length})
                </div>
                {emailAlerts.map((eml) => {
                  const isSelected = selectedEmail?.id === eml.id;
                  return (
                    <div
                      key={eml.id}
                      onClick={() => setSelectedEmail(eml)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 shadow-sm'
                          : 'border-border bg-surface hover:border-[var(--color-brand)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                          style={
                            eml.type === 'escalation_gm'
                              ? { backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }
                              : eml.type === 'escalation_director'
                              ? { backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fb7185' }
                              : eml.type === 'escalation_lead'
                              ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                              : eml.type === 'traffic_prompt'
                              ? { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
                              : eml.type === 'due_now'
                              ? { backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' }
                              : eml.type === 'nearly_due'
                              ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#facc15' }
                              : { backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }
                          }
                        >
                          {formatReadable(eml.type)}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(eml.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-bold text-text-primary text-xs truncate">
                        {eml.subject}
                      </div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5">
                        To: {eml.recipientName} ({eml.recipientRole || eml.recipientEmail})
                      </div>
                      {eml.escalationTier && (
                        <div className="text-[10px] font-mono text-text-tertiary mt-1">
                          Escalation Tier: <strong>{eml.escalationTier}</strong>
                          {eml.hoursOverdue !== undefined && ` • ${eml.hoursOverdue}h Overdue`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Email Preview Pane */}
              <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
                {selectedEmail ? (
                  <>
                    <div className="border-b border-border pb-3 space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                        Email Preview (Ghana Creative Agency Notification Engine)
                      </div>
                      <h4 className="font-bold text-sm text-text-primary">
                        {selectedEmail.subject}
                      </h4>
                      <div className="text-[11px] text-text-secondary">
                        <strong>Recipient:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt; ({selectedEmail.recipientRole || 'Team Member'})
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        <strong>Sender:</strong> Tibule Traffic &amp; Escalation Engine &lt;traffic@tibule.com&gt;
                      </div>
                      {selectedEmail.escalationTier && (
                        <div className="text-[11px] text-rose-400 font-mono">
                          <strong>Escalation Tier:</strong> {formatReadable(selectedEmail.escalationTier)}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-surface text-xs leading-relaxed font-sans space-y-3 text-text-secondary">
                      <div className="font-bold text-text-primary text-sm flex items-center justify-between">
                        <span>🇬🇭 Tibule Creative Agency • Studio Alert</span>
                        <span className="text-[10px] font-mono text-text-tertiary">
                          {new Date(selectedEmail.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">
                        {selectedEmail.previewBody}
                      </p>
                      <div className="p-3 rounded-lg border border-border bg-surface-elevated text-[11px] space-y-1 font-mono text-text-primary">
                        <div>Deliverable ID: <strong>{selectedEmail.jobId}</strong></div>
                        <div>Deliverable: <strong>{selectedEmail.jobTitle}</strong></div>
                        <div>Brand: <strong>{selectedEmail.brandName}</strong></div>
                        <div>Traffic Contact: Kwame Mensah (055-TIBULE-OPS)</div>
                      </div>
                      <p className="text-[11px] text-text-tertiary italic">
                        This automated notification protects studio turnaround efficiency and keeps our Accra client promises on schedule.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-tertiary min-h-[250px]">
                    <Mail className="w-8 h-8 mb-2 opacity-40" />
                    <p>Select an email from the log on the left to preview its content and recipient layout.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
