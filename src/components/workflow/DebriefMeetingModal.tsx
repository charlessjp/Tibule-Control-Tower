import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, SeniorityLevel } from '../../types';
import { INITIAL_BRANDS } from '../../data/brands';
import { STANDARD_TASK_DEFINITIONS, getStandardTaskBenchmarkHours } from '../../data/standardTasks';
import {
  X,
  Users,
  CheckSquare,
  Clock,
  UserCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  MessageSquareQuote,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Info,
  Send,
  ExternalLink
} from 'lucide-react';

interface DebriefMeetingModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'schedule' | 'conduct';
}

export const DebriefMeetingModal: React.FC<DebriefMeetingModalProps> = ({
  job,
  isOpen,
  onClose,
  initialTab
}) => {
  const {
    users,
    currentUser,
    employeeCapacities,
    callDebriefMeeting,
    completeDebriefMeeting,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  const brand = (job && INITIAL_BRANDS.find((b) => b.id === job.brandId)) ||
    (job && INITIAL_BRANDS.find((b) => b.name === job.requestor)) ||
    INITIAL_BRANDS[0];

  const csSubmitter = users.find((u) => u.name === job?.debriefMaterial?.preparedByName || u.id === job?.debriefMaterial?.preparedBy) ||
    users.find((u) => u.id === brand?.clientServiceRepId) ||
    users.find((u) => u.role === 'client_service') ||
    users[0];

  const leadManager = users.find((u) => u.id === brand?.managerId) ||
    users.find((u) => u.id === 'usr-elena-rostova') ||
    users.find((u) => u.role === 'manager' || u.role === 'director') ||
    users[0];

  // Brand Team members / creative staff
  const brandSquadMembers = users.filter((u) =>
    brand?.assignedMemberIds?.includes(u.id)
  );

  const candidateStaff = brandSquadMembers.length > 0
    ? brandSquadMembers
    : users.filter((u) => u.role === 'employee' || u.role === 'team_lead');

  // Benchmark calculation based on standard task
  const standardTask = job?.standardTaskType || 'TVC';
  const defaultBenchmark = getStandardTaskBenchmarkHours(standardTask, 'mid');

  // State
  const [activeTab, setActiveTab] = useState<'schedule' | 'conduct'>('schedule');
  const [scheduledSlot, setScheduledSlot] = useState('Today at 2:00 PM');
  const [customSlotTime, setCustomSlotTime] = useState('');
  const [agendaNotes, setAgendaNotes] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [teamUnderstandsTask, setTeamUnderstandsTask] = useState(true);
  const [prescribedHours, setPrescribedHours] = useState<number>(defaultBenchmark);
  const [prescribedHoursRationale, setPrescribedHoursRationale] = useState('');
  const [invitedStaffIds, setInvitedStaffIds] = useState<string[]>(candidateStaff.map((s) => s.id));
  const [showFullMaterial, setShowFullMaterial] = useState(false);

  // Synchronize initial state whenever job changes or opens
  useEffect(() => {
    if (job && isOpen) {
      const isReadyStage = job.workflowStage === 'debrief_ready';
      setActiveTab(initialTab || (isReadyStage ? 'schedule' : 'conduct'));

      setScheduledSlot(job.debriefMeeting?.calendarEventTime || 'Today at 2:00 PM');
      setAgendaNotes(
        job.debriefMeeting?.discussionNotes ||
          `Team Debrief called with ${brand.name} brand squad. Client Services (${csSubmitter.name}) walking through client brief requirements and deliverables specs.`
      );
      setDiscussionNotes(
        job.debriefMeeting?.discussionNotes ||
          `Debrief held with ${brand.name} brand squad. Client Services submitter (${csSubmitter.name}) walked through client requirements. Creative Director aligned on creative direction. Team confirmed scope clarity.`
      );
      setPrescribedHours(
        job.debriefMeeting?.prescribedHours || job.estimatedHours || defaultBenchmark
      );
      setPrescribedHoursRationale(
        job.debriefMeeting?.prescribedHoursRationale ||
          `Prescribed by ${leadManager?.name || 'Creative Director'} (${leadManager?.jobTitle || 'Lead'}) based on ${standardTask} complexity and asset variations.`
      );
      setTeamUnderstandsTask(true);
      if (job.debriefMeeting?.attendees && job.debriefMeeting.attendees.length > 0) {
        setInvitedStaffIds(
          job.debriefMeeting.attendees
            .filter((a) => a.userId !== csSubmitter.id && a.userId !== leadManager.id)
            .map((a) => a.userId)
        );
      } else {
        setInvitedStaffIds(candidateStaff.map((s) => s.id));
      }
    }
  }, [job?.id, isOpen, initialTab]);

  if (!isOpen || !job) return null;

  const toggleStaffInvite = (staffId: string) => {
    if (invitedStaffIds.includes(staffId)) {
      if (invitedStaffIds.length > 1) {
        setInvitedStaffIds(invitedStaffIds.filter((id) => id !== staffId));
      }
    } else {
      setInvitedStaffIds([...invitedStaffIds, staffId]);
    }
  };

  // Stage 2 Action: Call/Schedule Debrief Meeting
  const handleScheduleDebrief = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlot = scheduledSlot === 'Custom' ? (customSlotTime || 'Upcoming Session') : scheduledSlot;
    callDebriefMeeting(job.id, finalSlot, invitedStaffIds, agendaNotes);
    setActiveTab('conduct');
  };

  // Stage 3 Action: Conduct Debrief & Prescribe Hours -> Advance to Strategy Brainstorm
  const handleCompleteDebrief = (e: React.FormEvent) => {
    e.preventDefault();

    const attendeesList = [
      {
        userId: csSubmitter.id,
        name: csSubmitter.name,
        role: 'Client Services (Debrief Submitter)',
        isCompulsory: true,
        isPresent: true
      },
      {
        userId: leadManager.id,
        name: leadManager.name,
        role: leadManager.jobTitle,
        isCompulsory: true,
        isPresent: true
      },
      ...invitedStaffIds.map((id) => {
        const staff = users.find((u) => u.id === id);
        return {
          userId: id,
          name: staff?.name || 'Creative Specialist',
          role: staff?.jobTitle || 'Creative Specialist',
          isCompulsory: false,
          isPresent: true
        };
      })
    ];

    completeDebriefMeeting(
      job.id,
      discussionNotes,
      Number(prescribedHours),
      prescribedHoursRationale,
      {
        scheduledDate: new Date().toISOString(),
        status: 'completed',
        calledByRole: (currentUser.role === 'director' || currentUser.role === 'manager') ? 'creative_director' : 'traffic_manager',
        calledByUserId: currentUser.id,
        calledByName: currentUser.name,
        compulsoryCsSubmitterId: csSubmitter.id,
        compulsoryCsSubmitterName: csSubmitter.name,
        calendarEventScheduled: true,
        calendarEventTitle: `Team Debrief: ${job.title}`,
        calendarEventTime: scheduledSlot,
        attendees: attendeesList,
        creativeDirectorOrManagerId: leadManager.id,
        teamUnderstandsTask
      }
    );

    onClose();
  };

  const isDebriefReady = job.workflowStage === 'debrief_ready';
  const isDebriefMeeting = job.workflowStage === 'debrief_meeting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="debrief-meeting-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-surface-elevated shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                style={{
                  backgroundColor: 'var(--color-brand-muted)',
                  borderColor: 'var(--color-brand)',
                  color: 'var(--color-brand)'
                }}
              >
                {activeTab === 'schedule' ? 'Stage 2: Convene & Schedule Debrief' : 'Stage 3: Conduct Debrief & Prescribe Hours'}
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id} • {brand.name}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold mt-1 text-text-primary">
            {activeTab === 'schedule' ? 'Convene Brand Team Debrief Meeting' : 'Team Debrief Session & Scope Prescription'}
          </h2>
          <p className="text-xs mt-0.5 text-text-tertiary">
            {activeTab === 'schedule'
              ? 'Client Services debrief pack is ready. Traffic Manager or Creative Director schedules the squad session and notifies creative staff via app & Teams calendar.'
              : `Debrief meeting in session with ${brand.name} squad, Client Services submitter (${csSubmitter.name}), and ${leadManager.jobTitle} (${leadManager.name}).`}
          </p>

          {/* Workflow Stage Tabs */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-xs'
                  : 'bg-surface hover:bg-surface-elevated text-text-secondary border border-border'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1. Schedule &amp; Attendees</span>
              {isDebriefReady && (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand-contrast)' }} />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('conduct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'conduct'
                  ? 'bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-xs'
                  : 'bg-surface hover:bg-surface-elevated text-text-secondary border border-border'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Conduct Debrief &amp; Prescribe Hours</span>
              {isDebriefMeeting && (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand-contrast)' }} />
              )}
            </button>

            {job.debriefMeeting?.calendarEventScheduled && (
              <span className="ml-auto text-[11px] font-mono flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calendar Synced ({job.debriefMeeting.calendarEventTime})</span>
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: SCHEDULE & CONVENE DEBRIEF (STAGE 2) */}
        {activeTab === 'schedule' && (
          <form onSubmit={handleScheduleDebrief} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Stage Explainer Banner */}
            <div className="p-3 rounded-xl border border-border bg-surface-elevated flex items-start gap-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-brand)' }} />
              <div className="space-y-1 text-text-secondary">
                <div className="font-bold text-text-primary text-xs">
                  Why this stage exists: "Debrief Ready" vs "Team Debrief"
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong>Stage 2 (Debrief Ready):</strong> Client Services has assembled the debrief pack. Traffic Manager (Kwame Mensah) or Creative Director convenes the meeting slot and calls upon creative specialists.
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>Stage 3 (Team Debrief):</strong> The meeting actually takes place. The team walks through the requirements together, verifies clarity, and the Creative Director prescribes production hours.
                </p>
              </div>
            </div>

            {/* Client Service Debrief Material Summary */}
            {job.debriefMaterial && (
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                    <span>CS Debrief Pack: {job.debriefMaterial.deckTitle}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullMaterial(!showFullMaterial)}
                    className="text-[11px] text-[var(--color-brand)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{showFullMaterial ? 'Hide Details' : 'Inspect Full Pack'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Deliverable Specs:</strong> {job.debriefMaterial.deliverableSpecs}
                </div>

                {showFullMaterial && (
                  <div className="pt-2 border-t border-border/50 space-y-2 text-[11px] text-text-secondary animate-in fade-in">
                    <div>
                      <strong className="text-text-primary">Prepared By:</strong> {job.debriefMaterial.preparedByName} ({new Date(job.debriefMaterial.preparedDate).toLocaleDateString()})
                    </div>
                    {job.debriefMaterial.brandToneNotes && (
                      <div>
                        <strong className="text-text-primary">Brand / Cultural Tone:</strong> {job.debriefMaterial.brandToneNotes}
                      </div>
                    )}
                    {job.debriefMaterial.keyObjectives && job.debriefMaterial.keyObjectives.length > 0 && (
                      <div>
                        <strong className="text-text-primary">Key Objectives:</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          {job.debriefMaterial.keyObjectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Meeting Slot Selector */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-2">
              <label className="block font-bold text-text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Debrief Meeting Time &amp; Calendar Slot</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Today at 2:00 PM', 'Today at 4:30 PM', 'Tomorrow at 10:00 AM', 'Custom'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setScheduledSlot(slot)}
                    className={`p-2 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                      scheduledSlot === slot
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)] font-bold text-text-primary shadow-xs'
                        : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {scheduledSlot === 'Custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customSlotTime}
                    onChange={(e) => setCustomSlotTime(e.target.value)}
                    placeholder="e.g. Wednesday 28th Sep at 11:30 AM (Tibule Boardroom)"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
                    required
                  />
                </div>
              )}
            </div>

            {/* Stakeholder Attendees Section */}
            <div>
              <label className="block font-bold text-text-secondary mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                  <span>Squad Attendees (Synced to App Radar &amp; Calendar)</span>
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-success)' }}>
                  ✓ Compulsory CS + CD Included
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Compulsory CS Submitter */}
                <div className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{
                      backgroundColor: 'var(--color-brand-muted)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    CS
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-text-primary truncate">{csSubmitter.name}</span>
                      <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-surface border border-border text-text-secondary">Compulsory</span>
                    </div>
                    <div className="text-[10px] text-text-tertiary truncate">CS Debrief Pack Submitter</div>
                  </div>
                </div>

                {/* Creative Director / Team Manager */}
                <div className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-strategic) 15%, transparent)',
                      color: 'var(--color-strategic)'
                    }}
                  >
                    CD
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-text-primary truncate">{leadManager.name}</span>
                      <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-surface border border-border text-text-secondary">Lead</span>
                    </div>
                    <div className="text-[10px] text-text-tertiary truncate">{leadManager.jobTitle}</div>
                  </div>
                </div>

                {/* Traffic Coordinator */}
                <div className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{
                      backgroundColor: 'var(--color-brand-muted)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    TM
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-text-primary truncate">Kwame Mensah</div>
                    <div className="text-[10px] text-text-tertiary truncate">Traffic Manager (Host)</div>
                  </div>
                </div>
              </div>

              {/* Called Creative Specialists */}
              <div className="mt-2.5 p-3 rounded-xl border border-border bg-surface-elevated space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary">
                  <span>Called Upon Creative Staff (Select to invite to meeting):</span>
                  <span className="text-[10px] font-mono text-text-tertiary">{invitedStaffIds.length} staff invited</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {candidateStaff.map((staff) => {
                    const isCalled = invitedStaffIds.includes(staff.id);
                    const cap = employeeCapacities[staff.id];
                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => toggleStaffInvite(staff.id)}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isCalled
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand-muted)]/50 shadow-xs'
                            : 'border-border bg-surface opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                          {isCalled ? '✓' : '+'}
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-bold text-text-primary text-[11px] truncate">{staff.name}</div>
                          <div className="text-[9px] text-text-tertiary truncate flex items-center justify-between">
                            <span>{staff.jobTitle}</span>
                            {cap && <span className="font-mono">{cap.activeJobsCount} active</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Agenda Notes */}
            <div>
              <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Debrief Meeting Agenda / Orientation Notes</span>
              </label>
              <textarea
                rows={2}
                value={agendaNotes}
                onChange={(e) => setAgendaNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
                placeholder="Brief agenda items or topics to cover during the squad debrief..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2.5 shrink-0">
              <span className="text-[11px] text-text-tertiary">
                Dispatching will notify staff and advance stage to <strong>Team Debrief (Stage 3)</strong>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
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
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dispatch Calendar Invites &amp; Advance to Team Debrief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: CONDUCT TEAM DEBRIEF & PRESCRIBE HOURS (STAGE 3) */}
        {activeTab === 'conduct' && (
          <form onSubmit={handleCompleteDebrief} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Session Status Banner */}
            <div
              className="p-3 rounded-xl border flex items-center justify-between gap-2 flex-wrap"
              style={{
                backgroundColor: 'var(--color-success-muted)',
                borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)'
              }}
            >
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--color-success)' }} />
                <span>
                  <strong>Debrief Meeting Convened:</strong> {job.debriefMeeting?.calendarEventTime || scheduledSlot}
                </span>
                <span className="text-text-tertiary">•</span>
                <span className="text-[11px]" style={{ color: 'var(--color-success)' }}>Synced to Microsoft Teams Calendar &amp; App</span>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                In Session
              </span>
            </div>

            {/* Attendees Attendance Summary */}
            <div className="p-3 rounded-xl border border-border bg-surface-elevated space-y-2">
              <div className="text-[11px] font-bold text-text-secondary flex items-center justify-between">
                <span>Convened Debrief Squad Present:</span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-success)' }}>All Present</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--color-brand-muted)',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-brand)'
                  }}
                >
                  <UserCheck className="w-3 h-3" />
                  {csSubmitter.name} (CS Submitter - Compulsory)
                </span>
                <span
                  className="px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-strategic) 12%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--color-strategic) 30%, transparent)',
                    color: 'var(--color-strategic)'
                  }}
                >
                  <UserCheck className="w-3 h-3" />
                  {leadManager.name} ({leadManager.jobTitle})
                </span>
                {invitedStaffIds.map((id) => {
                  const staff = users.find((u) => u.id === id);
                  return (
                    <span
                      key={id}
                      className="px-2.5 py-1 rounded-lg border border-border bg-surface text-text-secondary text-[11px] flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3 text-text-tertiary" />
                      {staff?.name || 'Creative Staff'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Scope Understood Checkbox */}
            <div
              onClick={() => setTeamUnderstandsTask(!teamUnderstandsTask)}
              className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors"
              style={{
                backgroundColor: teamUnderstandsTask ? 'var(--color-success-muted)' : 'var(--color-surface-elevated)',
                borderColor: teamUnderstandsTask ? 'var(--color-success)' : 'var(--color-border)'
              }}
            >
              <input
                type="checkbox"
                checked={teamUnderstandsTask}
                onChange={(e) => setTeamUnderstandsTask(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--color-brand)' }}
              />
              <div>
                <div className="font-bold text-text-primary">
                  Brand Team Confirms Clear Scope &amp; Deliverable Understanding
                </div>
                <div className="text-[11px] text-text-tertiary">
                  Client deliverables, dimensions, aspect ratios, and deadline milestones are understood without ambiguity.
                </div>
              </div>
            </div>

            {/* Prescribe Task Hours & Craft Baseline */}
            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-strategic) 12%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-strategic) 30%, transparent)',
                      color: 'var(--color-strategic)'
                    }}
                  >
                    Lead Prescription
                  </span>
                  <h3 className="font-bold text-sm mt-1 text-text-primary">
                    Creative Director / Manager Prescribes Baseline Hours
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    {leadManager.name} ({leadManager.jobTitle}) determines the baseline craft hours based on task archetype benchmark.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-tertiary font-mono">Standard Benchmark</div>
                  <div className="text-base font-bold text-text-primary">{defaultBenchmark}h ({standardTask})</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Prescribed Hours Required
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={prescribedHours}
                      onChange={(e) => setPrescribedHours(Number(e.target.value))}
                      required
                      className="w-28 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-bold text-text-primary focus:border-[var(--color-brand)]"
                    />
                    <span className="text-text-tertiary text-xs font-medium">Estimated Working Hours</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Prescription Rationale &amp; Scope Complexity
                  </label>
                  <input
                    type="text"
                    value={prescribedHoursRationale}
                    onChange={(e) => setPrescribedHoursRationale(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
                    placeholder="e.g. Standard TVC pass + 2 revisions window..."
                  />
                </div>
              </div>
            </div>

            {/* Discussion Notes */}
            <div>
              <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Debrief Meeting Notes &amp; Creative Clarifications</span>
              </label>
              <textarea
                rows={3}
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
                placeholder="Record questions asked, creative angles discussed, client nuances clarified..."
              />
            </div>

            {/* Stage 4 Preview */}
            <div
              className="p-3.5 rounded-xl border space-y-1"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <h4 className="font-bold text-xs text-text-primary">
                  Advancing to Stage 4: Creative Strategy &amp; Brainstorming Session
                </h4>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Confirming completion of the debrief meeting will move the squad into the <strong>Creative Strategy &amp; Brainstorming Room</strong> to lock in creative execution angles before Traffic assigns artists.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!teamUnderstandsTask}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Debrief &amp; Advance to Strategy Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
