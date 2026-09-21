export type UserRole = 
  | 'employee' 
  | 'team_lead' 
  | 'manager' 
  | 'director' 
  | 'general_manager' 
  | 'traffic_manager' 
  | 'client_service' 
  | 'admin';

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'nss_intern';

export type AgencyDepartment = 'creative' | 'traffic' | 'client_services';

export type AccountState = 'invited' | 'pending_setup' | 'active' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: AgencyDepartment;
  seniority?: SeniorityLevel;
  jobTitle: string;
  teamId: string;
  secondaryTeamIds?: string[];
  avatarUrl?: string;
  status: AccountState;
  managerId?: string;
  createdDate: string;
  lastLogin: string;
  skillProfile: string[];
  capacityHoursPerWeek: number;
}

export interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  department: AgencyDepartment;
  role: UserRole;
  seniority: SeniorityLevel;
  jobTitle: string;
  teamId: string;
  managerId?: string;
  capacityHoursPerWeek: number;
  avatarUrl?: string;
  createdDate: string;
  rememberMe?: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  managerId: string;
  status: 'active' | 'archived';
  createdDate: string;
  color: string;
  memberIds: string[];
}

export type StandardTaskType = 
  | 'TVC'
  | 'Content Ideation'
  | 'Logo Work'
  | 'Brand Identity'
  | 'Social Media Campaign'
  | 'OOH Billboard'
  | 'Packaging Design'
  | 'UI/UX Prototype'
  | 'Custom Deliverable';

export type WorkflowStage = 
  | 'brief_intake'            // Brief received by Client Service
  | 'debrief_prep'            // Client Service preparing debrief material
  | 'debrief_ready'           // Debrief material ready -> Traffic alerted
  | 'debrief_meeting'         // Traffic called meeting with Brand Team, CS Rep & CD/Manager
  | 'traffic_assignment'      // Manager prescribed hours; Traffic assigns to staff (or manager if swamped)
  | 'manager_assignment'      // Backward compatibility alias for traffic_assignment
  | 'traffic_routing'         // Backward compatibility alias for debrief_ready
  | 'in_production'           // Assignee producing deliverable
  | 'internal_review'         // Staff submitted, CD/Manager reviewing
  | 'client_service_handoff'  // CD/Manager approved, CS packaging for client
  | 'client_review'           // Sent to client for review
  | 'client_revert'           // Client requested revisions/reverts
  | 'completed';              // Client signed off

export type JobStatus = 
  | 'unassigned'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'blocked'
  | 'awaiting_input'
  | 'in_review'
  | 'completed'
  | 'reopened';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Complexity = 'low' | 'medium' | 'high' | 'extreme';

export type TrafficState = 'clear' | 'building' | 'congested' | 'critical' | 'blocked';

export interface JobReassignment {
  fromUserId?: string;
  toUserId: string;
  timestamp: string;
  reason: string;
  actorName: string;
}

export interface FeedbackHistoryItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  notes: string;
  revisedHours: number;
  timestamp: string;
}

export interface DeliverableSubmission {
  submittedDate: string;
  submittedBy: string;
  submitterName: string;
  summary: string;
  fileLinks?: string[];
  notes?: string;
}

export interface ClientRevertInfo {
  revertCount: number;
  feedbackNotes: string;
  requestedChanges: string[];
  dateReceived: string;
  urgency: Priority;
  additionalHours: number;
  originalAssigneeId: string;
  conflictDetected: boolean;
  conflictingJobId?: string;
  conflictJobTitle?: string;
  conflictResolution?: 'queued' | 'paused_current' | 'reassigned' | 'split_timeline';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Job {
  id: string; // e.g. CT-1842
  title: string;
  description: string;
  requestor: string;
  clientProject: string;
  teamId: string;
  assigneeId?: string;
  managerId: string;
  priority: Priority;
  category: string;
  complexity: Complexity;
  estimatedHours: number;
  actualHours: number;
  createdDate: string;
  assignedDate?: string;
  startDate?: string;
  dueDate: string;
  completedDate?: string;
  status: JobStatus;
  dependencies?: string[];
  blockerReason?: string;
  blockedSince?: string;
  commentsCount: number;
  attachmentsCount: number;
  reassignmentHistory?: JobReassignment[];
  isAtRisk?: boolean;

  // Agency Workflow Fields
  workflowStage?: WorkflowStage;
  standardTaskType?: StandardTaskType;
  assignedSeniority?: SeniorityLevel;
  benchmarkBaseHours?: number;
  trafficHandoffNotes?: string;
  trafficManagerId?: string;
  deliverableSubmission?: DeliverableSubmission;
  feedbackHistory?: FeedbackHistoryItem[];
  clientRevertInfo?: ClientRevertInfo;
  clientApprovedDate?: string;

  // Updated Brand, Debrief & Notification Fields
  brandId?: string;
  brandName?: string;
  debriefMaterial?: DebriefMaterial;
  debriefMeeting?: DebriefMeetingInfo;
  emailAlertHistory?: EmailAlertItem[];
  lastEscalationStage?: DeliverableEscalationStage;
  lastPromptedAt?: string;
  promptNotes?: string;
}

export interface JobComment {
  id: string;
  jobId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface JobAttachment {
  id: string;
  jobId: string;
  name: string;
  size: string;
  uploaderName: string;
  timestamp: string;
  type: string;
}

export type CaseType =
  | 'salary_review'
  | 'promotion'
  | 'role_review'
  | 'responsibility_expansion'
  | 'recognition'
  | 'workload_concern'
  | 'resource_request'
  | 'process_improvement'
  | 'correction';

export type CaseStatus = 'draft' | 'submitted' | 'manager_review' | 'evidence_review' | 'decision' | 'closed';

export type CaseDecision = 'approved' | 'partially_approved' | 'deferred' | 'declined' | 'requires_further_evidence';

export interface ProgressionCase {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  teamId: string;
  type: CaseType;
  status: CaseStatus;
  submissionDate: string;
  reviewerId?: string;
  reviewerName?: string;
  title: string;
  narrative: string;
  evidenceData: {
    responsibilityGrowth: {
      originalCount: number;
      currentCount: number;
      items: string[];
    };
    workVolume: {
      previousPeriodCount: number;
      currentPeriodCount: number;
      totalHours: number;
    };
    complexityIncreasePercent: number;
    additionalContributions: string[];
    outcomes: string[];
    linkedJobIds: string[];
  };
  decision?: CaseDecision;
  decisionNotes?: string;
  decisionDate?: string;
}

export interface Recognition {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  issuerId: string;
  issuerName: string;
  issuerRole: string;
  reason: string;
  category: 'exceptional_delivery' | 'team_support' | 'process_innovation' | 'complexity_mastery';
  evidenceSnippet: string;
  date: string;
  awardNomination?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  objectId: string;
  objectTitle: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface ExceptionItem {
  id: string;
  type: 'deadline_risk' | 'capacity_exceeded' | 'blocked_long' | 'unassigned_queue' | 'quality_rework' | 'recognition_opportunity';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  teamId: string;
  relatedJobId?: string;
  relatedEmployeeId?: string;
  recommendedAction: string;
  timestamp: string;
}

export interface EmployeeCapacityCalculation {
  userId: string;
  name: string;
  jobTitle: string;
  teamId: string;
  capacityHoursPerWeek: number;
  assignedHours: number;
  capacityPercent: number;
  activeJobsCount: number;
  dueSoonCount: number;
  blockedCount: number;
  trafficState: TrafficState;
}

export interface MetricTraceInfo {
  name: string;
  value: string;
  summary: string;
  methodology: string;
  datapoints: { label: string; count: number | string; description: string; detailJobs?: string[] }[];
}

export interface Brand {
  id: string;
  name: string;
  clientCompany: string;
  industry: string;
  description: string;
  color: string;
  clientServiceRepId: string;
  managerId: string; // Creative Director or Team Manager
  isCreativeJobDefault: boolean;
  assignedMemberIds: string[]; // Pre-assigned brand squad
  activeBriefsCount?: number;
}

export interface DebriefMaterial {
  preparedBy: string;
  preparedByName: string;
  preparedDate: string;
  deckTitle: string;
  keyObjectives: string[];
  deliverableSpecs: string;
  brandToneNotes?: string;
  referenceLinks?: string[];
  isReadyForTraffic: boolean;
  trafficAlertedAt?: string;
}

export interface DebriefMeetingInfo {
  scheduledDate: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  attendees: {
    userId: string;
    name: string;
    role: string;
    isPresent: boolean;
  }[];
  discussionNotes: string;
  creativeDirectorOrManagerId: string;
  prescribedHours: number;
  prescribedHoursRationale: string;
  teamUnderstandsTask: boolean;
  assignedToManagerDirectly?: boolean;
  managerDirectAssignReason?: string;
  completedAt?: string;
}

export type DeliverableEscalationStage =
  | 'on_track'
  | 'nearly_due'           // Set time before due (e.g. <24h): Assigned staff alert (web + email)
  | 'due_now'              // 0h elapsed (due): Staff & Traffic get alert to push to superior
  | 'overdue_1h_traffic'   // 1h elapsed: Traffic alert to prompt assignee
  | 'overdue_3h_lead'      // 3h elapsed: Team Lead / Direct Manager escalation
  | 'overdue_24h_director' // 24h (1 day) elapsed: Studio Director escalation
  | 'overdue_72h_gm';      // 72h (3 days) elapsed: General Manager executive escalation

export type EmailAlertType =
  | 'nearly_due'
  | 'due_now'
  | 'overdue'
  | 'traffic_prompt'
  | 'escalation_lead'
  | 'escalation_director'
  | 'escalation_gm'
  | 'debrief_ready'
  | 'assignment'
  | 'reward';

export interface EmailAlertItem {
  id: string;
  jobId: string;
  jobTitle: string;
  brandName: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  type: EmailAlertType;
  sentAt: string;
  previewBody: string;
  status: 'delivered' | 'sent';
  escalationTier?: DeliverableEscalationStage;
  hoursOverdue?: number;
}

export interface WebNotificationItem {
  id: string;
  recipientId: string; // user ID who receives this notification (or 'all')
  recipientRole?: string;
  jobId: string;
  jobTitle: string;
  brandName: string;
  title: string;
  message: string;
  type:
    | 'nearly_due'
    | 'due_now'
    | 'traffic_prompt'
    | 'escalation_lead'
    | 'escalation_director'
    | 'escalation_gm'
    | 'traffic_nudge_received'
    | 'pushed_to_review';
  escalationStage: DeliverableEscalationStage;
  createdAt: string;
  read: boolean;
  hoursOverdue?: number;
  actionLabel?: string;
  actionType?: 'push_to_review' | 'prompt_assignee' | 'open_job';
  severity: 'info' | 'warning' | 'critical' | 'executive';
}

export interface EfficiencyReward {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  rewardTitle: string;
  rewardDescription: string;
  prize: string;
  awardedBy: string;
  awardedByName: string;
  awardedDate: string;
  badgeIcon: string;
  category: 'mvp_of_the_month' | 'turnaround_titan' | 'sharp_shooter' | 'team_rockstar';
}

export interface EfficiencyLeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  brandNames: string[];
  onTimeRate: number;
  turnaroundScore: number;
  revertFreeRate: number;
  completedCount: number;
  points: number;
  activeStreak: number;
  eligibleRewardTier?: string;
}
