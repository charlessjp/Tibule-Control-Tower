import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface DebriefMeetingModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DebriefMeetingModal: React.FC<DebriefMeetingModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const {
    users,
    currentUser,
    employeeCapacities,
    completeDebriefAndAssign,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  const brand = (job && INITIAL_BRANDS.find((b) => b.id === job.brandId)) ||
    (job && INITIAL_BRANDS.find((b) => b.name === job.requestor)) ||
    INITIAL_BRANDS[0];

  const leadManager = users.find((u) => u.id === brand?.managerId) ||
    users.find((u) => u.id === 'usr-elena-rostova') ||
    users.find((u) => u.role === 'manager') ||
    users[0];
  const csRep = users.find((u) => u.id === brand?.clientServiceRepId) ||
    users.find((u) => u.role === 'client_service') ||
    users[0];

  // Brand Team members
  const brandSquadMembers = users.filter((u) =>
    brand?.assignedMemberIds?.includes(u.id)
  );

  // Fallback to creative team members if empty
  const candidateStaff = brandSquadMembers.length > 0
    ? brandSquadMembers
    : users.filter((u) => u.role === 'employee' || u.role === 'team_lead');

  // Benchmark calculation based on standard task
  const standardTask = job?.standardTaskType || 'TVC';
  const defaultBenchmark = getStandardTaskBenchmarkHours(standardTask, 'mid');

  // State
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [teamUnderstandsTask, setTeamUnderstandsTask] = useState(true);
  const [prescribedHours, setPrescribedHours] = useState<number>(defaultBenchmark);
  const [prescribedHoursRationale, setPrescribedHoursRationale] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [assignToManagerDirectly, setAssignToManagerDirectly] = useState<boolean>(false);
  const [managerDirectReason, setManagerDirectReason] = useState<string>(
    'All brand team members are currently running over 85% capacity with urgent deliveries. Team Manager / CD taking direct helm to avoid delay.'
  );

  // Synchronize initial state whenever job changes or opens
  React.useEffect(() => {
    if (job && isOpen) {
      setDiscussionNotes(
        job.debriefMeeting?.discussionNotes ||
          `Debrief held with ${brand.name} brand team. Client Service walked through campaign goals and deliverable specs. Creative Director aligned on Ghanaian cultural nuances and visual tone. Team confirmed delivery timeline.`
      );
      setPrescribedHours(
        job.debriefMeeting?.prescribedHours || job.estimatedHours || defaultBenchmark
      );
      setPrescribedHoursRationale(
        job.debriefMeeting?.prescribedHoursRationale ||
          `Prescribed by ${leadManager?.name || 'Creative Director'} (${leadManager?.jobTitle || 'Lead'}) based on ${standardTask} complexity and asset variations.`
      );
      setSelectedAssigneeId(
        job.assigneeId || candidateStaff[0]?.id || 'usr-amara-okafor'
      );
      setAssignToManagerDirectly(false);
      setTeamUnderstandsTask(true);
    }
  }, [job?.id, isOpen]);

  if (!isOpen || !job) return null;

  // Check if brand team members are mostly swamped (>80% capacity)
  // employeeCapacities is a Record<string, EmployeeCapacityCalculation>
  const squadCapacityStats = candidateStaff.map((staff) => {
    const cap = employeeCapacities?.[staff.id];
    const percent = cap ? cap.capacityPercent : 75;
    const isSwamped = percent >= 85;
    return { staff, percent, isSwamped, assignedHours: cap?.assignedHours || 32 };
  });

  const areAllSwamped = squadCapacityStats.length > 0 && squadCapacityStats.every((s) => s.isSwamped);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAssigneeId = assignToManagerDirectly ? leadManager.id : selectedAssigneeId;
    const finalAssigneeUser = users.find((u) => u.id === finalAssigneeId);

    completeDebriefAndAssign(
      job.id,
      {
        scheduledDate: new Date().toISOString(),
        status: 'completed',
        attendees: [
          { userId: csRep.id, name: csRep.name, role: csRep.jobTitle, isPresent: true },
          { userId: leadManager.id, name: leadManager.name, role: leadManager.jobTitle, isPresent: true },
          ...candidateStaff.map((s) => ({
            userId: s.id,
            name: s.name,
            role: s.jobTitle,
            isPresent: true
          }))
        ],
        discussionNotes,
        creativeDirectorOrManagerId: leadManager.id,
        prescribedHours: Number(prescribedHours),
        prescribedHoursRationale,
        teamUnderstandsTask,
        assignedToManagerDirectly: assignToManagerDirectly,
        managerDirectAssignReason: assignToManagerDirectly ? managerDirectReason : undefined,
        completedAt: new Date().toISOString()
      },
      finalAssigneeId,
      finalAssigneeUser?.seniority || 'senior',
      Number(prescribedHours)
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="debrief-meeting-modal"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-surface text-text-primary shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                Team Debrief &amp; Time Prescription
              </span>
              <span className="text-xs font-mono font-bold text-text-tertiary">
                {job.id} • {brand.name}
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5 text-text-primary">
              Brand Team Debrief Meeting &amp; Task Allocation
            </h2>
            <p className="text-xs mt-0.5 text-text-tertiary">
              Convened by Traffic Lead Kwame Mensah with {brand.name} brand team, Client Service rep ({csRep.name}), and {leadManager.jobTitle} ({leadManager.name}).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Attendees Grid */}
          <div>
            <label className="block font-bold text-text-secondary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                <span>Debrief Meeting Participants ({brand.name} Team)</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-normal">
                ✓ All required stakeholders present
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* CS Rep */}
              <div className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                    color: 'var(--color-brand)'
                  }}
                >
                  CS
                </div>
                <div className="truncate">
                  <div className="font-bold text-text-primary truncate">{csRep.name}</div>
                  <div className="text-[10px] text-text-tertiary truncate">Client Service Lead</div>
                </div>
              </div>

              {/* Creative Director / Team Manager */}
              <div className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  CD
                </div>
                <div className="truncate">
                  <div className="font-bold text-text-primary truncate">{leadManager.name}</div>
                  <div className="text-[10px] text-text-tertiary truncate">{leadManager.jobTitle}</div>
                </div>
              </div>

              {/* Brand Squad Members */}
              {candidateStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-2.5 rounded-xl border border-border bg-surface-elevated flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {staff.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-text-primary truncate">{staff.name}</div>
                    <div className="text-[10px] text-text-tertiary truncate">Brand Team Specialist</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Service Debrief Material Summary */}
          {job.debriefMaterial && (
            <div className="p-3.5 rounded-xl border border-border bg-surface-elevated space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Debrief Material Pack: {job.debriefMaterial.deckTitle}</span>
                </span>
                <span className="text-[10px] text-text-tertiary">
                  Prepared by {job.debriefMaterial.preparedByName}
                </span>
              </div>
              <div className="text-[11px] text-text-secondary leading-relaxed">
                <strong className="text-text-primary">Deliverable Specs:</strong> {job.debriefMaterial.deliverableSpecs}
              </div>
              {job.debriefMaterial.brandToneNotes && (
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Cultural / Brand Tone:</strong> {job.debriefMaterial.brandToneNotes}
                </div>
              )}
            </div>
          )}

          {/* Discussion Notes */}
          <div>
            <label className="block font-bold text-text-secondary mb-1 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
              <span>Debrief Conversation Notes &amp; Clarifications</span>
            </label>
            <textarea
              rows={3}
              value={discussionNotes}
              onChange={(e) => setDiscussionNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-hidden focus:border-[var(--color-brand)]"
              placeholder="Record questions asked, creative angles discussed, client nuances clarified..."
            />
          </div>

          {/* Team Understood Confirmation */}
          <div
            onClick={() => setTeamUnderstandsTask(!teamUnderstandsTask)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
              teamUnderstandsTask
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-border bg-surface-elevated'
            }`}
          >
            <input
              type="checkbox"
              checked={teamUnderstandsTask}
              onChange={(e) => setTeamUnderstandsTask(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <div>
              <div className="font-bold text-text-primary">
                Brand Team Confirms Clear Understanding of the Task
              </div>
              <div className="text-[11px] text-text-tertiary">
                Scope, deliverables, asset dimensions, and campaign goals are understood without ambiguity.
              </div>
            </div>
          </div>

          {/* SECTION 2: TEAM MANAGER / CD PRESCRIBES APPROXIMATE TIME */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Manager Prescription
                </span>
                <h3 className="font-bold text-sm mt-1 text-text-primary">
                  Team Manager / Creative Director Prescribes Task Hours
                </h3>
                <p className="text-[11px] text-text-tertiary">
                  {leadManager.name} ({leadManager.jobTitle}) determines the realistic hours required based on craft benchmarks.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary font-mono">Benchmark Guideline</div>
                <div className="text-base font-bold text-text-primary">{defaultBenchmark} hrs ({standardTask})</div>
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

          {/* SECTION 3: TRAFFIC MANAGER ALLOCATION */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-brand) 15%, transparent)',
                    color: 'var(--color-brand)',
                    borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
                  }}
                >
                  Traffic Manager Allocation
                </span>
                <h3 className="font-bold text-sm mt-1 text-text-primary">
                  Assign Task to Brand Team Member or Team Manager
                </h3>
                <p className="text-[11px] text-text-tertiary">
                  Review brand team capacity. If all team members are swamped, assign directly to Team Manager / CD.
                </p>
              </div>
              {areAllSwamped && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                  <Flame className="w-3 h-3" />
                  <span>Brand Team Swamped</span>
                </div>
              )}
            </div>

            {/* Toggle: Assign to Manager Directly */}
            <div
              onClick={() => setAssignToManagerDirectly(!assignToManagerDirectly)}
              className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                assignToManagerDirectly
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border bg-surface-elevated'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={assignToManagerDirectly}
                    onChange={(e) => setAssignToManagerDirectly(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-text-primary">
                      Assign directly to Team Manager / CD ({leadManager.name})
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      Use this option when team members are all swamped, or for critical senior-led jobs.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  Direct Manager Handling
                </span>
              </div>

              {assignToManagerDirectly && (
                <div className="mt-3 pt-2.5 border-t border-purple-500/20">
                  <label className="block text-[11px] font-bold text-text-secondary mb-1">
                    Direct Manager Assignment Reason:
                  </label>
                  <input
                    type="text"
                    value={managerDirectReason}
                    onChange={(e) => setManagerDirectReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:border-[var(--color-brand)]"
                  />
                </div>
              )}
            </div>

            {/* If NOT assigning to manager, select from brand squad */}
            {!assignToManagerDirectly && (
              <div className="space-y-2">
                <label className="block font-bold text-text-secondary">
                  Select Brand Team Member:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {squadCapacityStats.map(({ staff, percent, isSwamped, assignedHours }) => {
                    const isSelected = selectedAssigneeId === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => setSelectedAssigneeId(staff.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'shadow-xs'
                            : 'border-border bg-surface hover:border-border-subtle'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: 'var(--color-brand)',
                                backgroundColor: 'var(--color-brand-muted)'
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                              style={{
                                backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--color-surface-elevated)',
                                color: isSelected ? 'var(--color-brand-contrast)' : 'var(--color-text-secondary)'
                              }}
                            >
                              {staff.name.charAt(0)}
                            </div>
                            <span className="font-bold text-text-primary text-xs">{staff.name}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isSwamped
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {percent}% {isSwamped ? 'Swamped' : 'Available'}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {staff.jobTitle} • {assignedHours}h committed this week
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
              <UserCheck className="w-4 h-4" />
              <span>Confirm Debrief &amp; Assign to Production</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
