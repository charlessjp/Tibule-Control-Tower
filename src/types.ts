export type UserRole = 
  | 'employee' 
  | 'team_lead' 
  | 'manager' 
  | 'director' 
  | 'general_manager' 
  | 'traffic_manager' 
  | 'client_service' 
  | 'admin';

export type SeniorityLevel = 
  // Creative Department special structure
  | 'director' 
  | 'associate_director' 
  | 'art_director' 
  | 'specialist' 
  | 'junior' 
  | 'nsp_intern'
  // Other departments (Traffic, Client Services) hierarchical structure
  | 'lead' 
  | 'senior' 
  | 'mid' 
  | 'nss_intern';

export type DeliveryImpactCategory =
  | 'missing_assets'
  | 'scope_creep'
  | 'client_delay'
  | 'technical_issue'
  | 'cross_dependency'
  | 'workload_overload'
  | 'stakeholder_conflict'
  | 'production_spec'
  | 'health_emergency'
  | 'other';

export type DeliveryImpactSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DeliveryImpactStatus = 'active' | 'acknowledged' | 'mitigated' | 'resolved';

export interface DeliveryImpactLog {
  id: string;
  jobId?: string;
  jobTitle?: string;
  clientProject?: string;
  loggedByUserId: string;
  loggedByName: string;
  loggedByRole: string;
  loggedBySeniority?: SeniorityLevel;
  loggedByDepartment?: AgencyDepartment;
  category: DeliveryImpactCategory;
  severity: DeliveryImpactSeverity;
  estimatedDelayDays: number;
  estimatedDelayHours?: number;
  impactDescription: string;
  mitigationRequested?: string;
  evidenceLink?: string;
  originalDueDate?: string;
  proposedRevisedDueDate?: string;
  status: DeliveryImpactStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AgencyDepartment = 'creative' | 'traffic' | 'client_services';

export type ReworkClassification = 'correction' | 'rework' | 'scope_change';

export type RevertCategory = 
  | 'client_scope_shift'
  | 'creative_misinterpretation'
  | 'technical_dieline_adjustment'
  | 'stakeholder_subjective_preference'
  | 'other';

export type BlockerType =
  | 'awaiting_client_input'
  | 'awaiting_internal_input'
  | 'awaiting_asset'
  | 'awaiting_approval'
  | 'technical_blocker'
  | 'resource_conflict'
  | 'scope_clarification'
  | 'dependency'
  | 'other';

export interface BlockerRecord {
  type: BlockerType;
  description: string;
  blockedSince?: string;
  blockedByUserId?: string;
  blockedByUserName?: string;
  resolvedAt?: string;
  loggedAt?: string;
  loggedBy?: string;
  dependency?: string;
}

export type OperationalEventType =
  | 'assigned'
  | 'started'
  | 'paused'
  | 'blocked'
  | 'unblocked'
  | 'submitted_for_review'
  | 'manager_feedback'
  | 'resubmitted'
  | 'approved_internal'
  | 'sent_to_client'
  | 'client_revert'
  | 'reassigned'
  | 'scope_changed'
  | 'deadline_changed'
  | 'completed'
  | 'cycle_started'
  | 'allocation_overridden'
  | 'assignment_changed'
  | 'quality_review_completed'
  | 'client_submitted'
  | 'blocker_logged'
  | 'blocker_resolved'
  | 'delivery_impact_logged'
  | 'delivery_impact_acknowledged'
  | 'delivery_impact_resolved';

export interface OperationalEvent {
  id: string;
  jobId: string;
  jobTitle?: string;
  taskId?: string;
  cycleNumber?: number;
  eventType: OperationalEventType;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  summary: string;
  details?: string;
  impact?: 'neutral' | 'congested' | 'blocked';
  reworkClassification?: ReworkClassification;
  revertCategory?: RevertCategory;
  hoursImpact?: number;
}

export interface WorkCycle {
  id: string;
  jobId: string;
  taskId?: string;
  cycleNumber: number;
  title: string;
  cycleType: 'initial_production' | 'internal_revision' | 'client_revert_revision';
  reworkClassification?: ReworkClassification;
  revertCategory?: RevertCategory;
  standardAllocation: number; // Benchmark effort
  managerAllocation: number;  // Manager planned effort
  actualEffort: number;       // Direct work logged
  reworkEffort: number;       // Extra effort from revisions
  startedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  feedbackNotes?: string;
  reviewerId?: string;
  reviewerName?: string;
  assigneeId?: string;
  status: 'active' | 'in_review' | 'approved' | 'superseded';
}

export interface RevertEscalationConfig {
  maxRevertThreshold: number; // Default 3
  maxReworkHoursThreshold: number; // e.g. 15h
  deadlineImpactDaysThreshold: number; // e.g. 2 days
}

export interface UserAvailability {
  contractedHoursPerWeek: number; // Default 40
  leaveHours: number;             // e.g. Vacation / sick
  trainingHours: number;          // e.g. Workshops
  meetingsHours: number;          // Non-production meetings
  nonProductionHours: number;     // Admin / mentoring
  availableProductionHours: number; // Contracted - Deductions
  // Manager specific review capacity
  reviewCommitmentHours?: number;
  managementMeetingsHours?: number;
  availableReviewHours?: number;
}

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
  availability?: UserAvailability;
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
  | 'debrief_meeting'         // Traffic or CD called meeting with called creatives & compulsory CS submitter
  | 'creative_brainstorm'     // Creative Strategy & Brainstorming session before staff allocation
  | 'traffic_assignment'      // Manager prescribed hours; Traffic assigns to staff (or manager if swamped)
  | 'manager_assignment'      // Backward compatibility alias for traffic_assignment
  | 'traffic_routing'         // Backward compatibility alias for debrief_ready
  | 'in_production'           // Assignee producing deliverable
  | 'internal_review'         // Creative Critique Session (Director/Senior + IC meeting)
  | 'client_service_handoff'  // CS dispatches to client via work email
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

export interface SplitTimelineConfig {
  revertDaysExtended: number;
  activeJobDaysExtended: number;
  revertDailyHours: number;
  activeJobDailyHours: number;
  timeBlockSchedule: string;
  originalRevertDueDate?: string;
  originalActiveDueDate?: string;
  newRevertDueDate?: string;
  newActiveDueDate?: string;
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
  splitTimelineConfig?: SplitTimelineConfig;
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
  timelineShiftReason?: string;
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

  // V2 Hierarchy & Effort Breakdown
  parentJobId?: string;
  tasksCount?: number;
  workCycles?: WorkCycle[];
  activeCycleNumber?: number;
  standardAllocationHours?: number;
  managerAllocationHours?: number;
  managerAllocationReason?: string;
  actualEffortHours?: number;
  reworkEffortHours?: number;
  blockerDetail?: BlockerRecord;
  revertEscalationConfig?: RevertEscalationConfig;

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
  strategyMeeting?: StrategyMeetingInfo;
  clientEmailDispatch?: ClientEmailDispatchInfo;
  creativeAlignmentSession?: CreativeAlignmentSessionInfo;
  critiqueMeetingNotes?: string;
  emailAlertHistory?: EmailAlertItem[];
  lastEscalationStage?: DeliverableEscalationStage;
  lastPromptedAt?: string;
  promptNotes?: string;

  // Deadline Delivery Impact Logs
  deliveryImpactLogs?: DeliveryImpactLog[];
  latestDeliveryImpact?: DeliveryImpactLog;
  reworkHours?: number;
  revisionCount?: number;
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
  | 'correction'
  // Traffic Operational & Governance Case Types
  | 'traffic_sla_exception'
  | 'traffic_scope_dispute'
  | 'traffic_capacity_requisition'
  | 'traffic_process_waiver'
  | 'traffic_governance'
  | 'performance_review'
  | 'sla_exception_ruling'
  | 'scope_dispute'
  | 'capacity_requisition'
  | 'turnaround_conflict';

export type CaseStatus = 'draft' | 'submitted' | 'manager_review' | 'evidence_review' | 'decision' | 'closed';

export type CaseDecision = 'approved' | 'partially_approved' | 'deferred' | 'declined' | 'requires_further_evidence';

export type LeadEndorsementStatus = 'pending' | 'endorsed' | 'disendorsed' | 'revision_requested' | 'overturned';

export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'flagged';

export interface CasePromptLog {
  id: string;
  timestamp: string;
  senderName: string;
  recipientName: string;
  recipientRole?: string;
  actionType: 'prompt_review' | 'prompt_submission' | 'request_evidence' | 'sync_request' | 'overturn_notification' | 'clarification';
  message: string;
}

export interface StudioCase {
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
  category?: 'performance_review' | 'operational_sla_dispute' | 'capacity_requisition' | 'process_waiver' | 'workload_appeal';
  leadEndorsementStatus?: LeadEndorsementStatus;
  leadEndorsementNotes?: string;
  leadEndorsementDate?: string;
  leadEndorsedBy?: string;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  verificationDate?: string;
  promptLogs?: CasePromptLog[];
  trafficImpact?: {
    slaExtensionDays: number;
    riskTier: 'low' | 'moderate' | 'critical' | 'severe';
    affectedClient: string;
    affectedProject: string;
    disputeDetails: string;
    mitigationActions: string[];
  };
  trafficMeta?: {
    clientProject?: string;
    urgency?: Priority;
    requestedHours?: number;
    impactedJobIds?: string[];
    resolutionAction?: string;
    trafficRuling?: string;
  };
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

export type ProgressionCase = StudioCase;

// ----------------------------------------------------
// ANNUAL TASK ARCHIVE BACKUP TYPES
// ----------------------------------------------------
export type ArchiveQuarter = '2025-Q3' | '2025-Q4' | '2026-Q1' | '2026-Q2' | '2026-Q3' | '2026-Q4';

export type SlaOutcome = 'on_time' | 'early' | 'sla_saved' | 'delayed';

export interface OneDriveBackupRecord {
  status: 'synced' | 'pending' | 'verified';
  path: string;
  syncedAt: string;
  checksum: string;
  fileSizeBytes: number;
  manifestId: string;
  syncAccount: string;
}

export interface ArchivedTaskRecord {
  id: string; // e.g. "CT-1420"
  title: string;
  client: string;
  clientProject: string;
  discipline: string; // e.g. "Creative", "Motion", "Packaging", "Design Systems", "Strategy", "Client Services"
  taskType: StandardTaskType;
  seniority: SeniorityLevel;
  assigneeName: string;
  assigneeId: string;
  managerName: string;
  managerId: string;
  quarter: ArchiveQuarter;
  completedDate: string;
  createdDate: string;
  estimatedHours: number;
  actualHours: number;
  slaStatus: SlaOutcome;
  reworkCyclesCount: number;
  clientSignOffRating: number; // 1-5 stars
  briefSummary: string;
  debriefSquadSummary: string;
  debriefPrescription: string;
  tags: string[];
  oneDriveBackup: OneDriveBackupRecord;
  auditCertificateId: string;
}

export interface OneDriveSyncBatch {
  id: string;
  timestamp: string;
  recordsCount: number;
  totalSizeMb: number;
  targetFolder: string;
  initiatedBy: string;
  status: 'completed' | 'in_progress' | 'failed';
  checksumStatus: 'verified' | 'unverified';
  manifestFilename: string;
}

export interface OneDriveSyncConfig {
  connectedAccount: string;
  tenantName: string;
  rootFolderPath: string;
  autoSyncSchedule: 'realtime' | 'weekly_sunday' | 'monthly_close';
  retentionPeriodYears: number;
  lastSuccessfulSync: string;
  totalBackedUpSizeMb: number;
  totalRecordsBackedUp: number;
  backupHealth: 'optimal' | 'syncing' | 'action_needed';
  oneDriveStorageTier: string;
  autoManifestGeneration: boolean;
  ndaDataSegregation: boolean;
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

export interface CapacityBreakdownItem {
  jobId: string;
  jobTitle: string;
  type: 'base_production' | 'rework' | 'client_revert' | 'review_commitment';
  hours: number;
}

export interface EmployeeCapacityCalculation {
  userId: string;
  name: string;
  jobTitle: string;
  teamId: string;
  // Availability Model
  contractedHours: number;
  availableHours: number; // Contracted - (leave + training + meetings + admin)
  leaveHours: number;
  trainingHours: number;
  meetingsHours: number;
  nonProductionHours: number;

  // Workload Model
  assignedHours: number;
  baseProductionHours: number;
  reworkHours: number;
  reviewCommitmentHours: number;
  capacityPercent: number; // assignedHours / availableHours * 100
  capacityPressureHours: number; // Max(0, assignedHours - availableHours)
  
  // Counts & States
  activeJobsCount: number;
  dueSoonCount: number;
  blockedCount: number;
  trafficState: TrafficState;

  // Detailed Explainability Items
  breakdown: CapacityBreakdownItem[];
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
  calledByRole: 'traffic_manager' | 'creative_director' | 'manager';
  calledByUserId?: string;
  calledByName?: string;
  compulsoryCsSubmitterId?: string;
  compulsoryCsSubmitterName?: string;
  calendarEventScheduled?: boolean;
  calendarEventTitle?: string;
  calendarEventTime?: string;
  attendees: {
    userId: string;
    name: string;
    role: string;
    isCompulsory?: boolean;
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

export interface StrategyMeetingInfo {
  scheduledDate: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  facilitatorId: string;
  facilitatorName: string;
  compulsoryCsSubmitterId?: string;
  compulsoryCsSubmitterName?: string;
  calendarEventScheduled?: boolean;
  calendarEventTime?: string;
  attendees: {
    userId: string;
    name: string;
    role: string;
    isCompulsory?: boolean;
    isPresent: boolean;
  }[];
  strategyNotes: string;
  agreedCreativeAngle: string;
  deliverablesBreakdownNotes?: string;
  taskComplexityConfirmed: Complexity;
  estimatedEffortHours: number;
  completedAt?: string;
  completedBy?: string;
}

export interface ClientEmailDispatchInfo {
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName?: string;
  clientOrganization?: string;
  subject: string;
  dispatchedAt: string;
  dispatchedByUserId: string;
  materialsIncluded: string[];
  dispatchNotes?: string;
  ccEmails?: string[];
}

export interface CreativeAlignmentSessionInfo {
  conductedAt: string;
  leadReviewerId: string;
  leadReviewerName: string;
  leadReviewerRole: string;
  assigneeId: string;
  assigneeName: string;
  bouncedIdeas: string[]; // Ideas discussed verbally in live alignment
  verbalDiscussionSummary: string; // What they aligned on verbally
  codifiedChanges: string[]; // Specific changes codified together in their minds
  additionalHours?: number; // Additional time allocated if iterating
  outcome: 'approved_to_client_services' | 'codified_revision_needed';
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

export type OvertimePeriod = 'pre_9am' | 'post_5pm' | 'weekend_crunch';

// ----------------------------------------------------
// STRATEGIC RECOGNITION & VERIFIED IMPACT MODEL
// ----------------------------------------------------
export type ContributionCategory =
  | 'exceptional_delivery'
  | 'client_impact'
  | 'collaboration'
  | 'craft_quality'
  | 'process_improvement'
  | 'operational_support'
  | 'exceptional_effort';

export type ContributionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CLARIFICATION_REQUIRED'
  | 'VERIFIED'
  | 'RECOGNISED'
  | 'DECLINED';

export type OperatingContext =
  | 'standard_hours'
  | 'outside_standard_hours'
  | 'weekend'
  | 'holiday';

export interface ContributionClarification {
  id: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole?: string;
  question: string;
  requestedAt: string;
  response?: string;
  respondedAt?: string;
}

export interface ContributionTimeContext {
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  operatingContext: OperatingContext;
}

export interface StrategicContribution {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  department?: AgencyDepartment;
  category: ContributionCategory;
  title: string;
  description: string; // What did you contribute?
  impactStatement: string; // What did this contribute, improve, or prevent?
  relatedJobId?: string;
  relatedJobTitle?: string;
  brandName?: string;
  taskId?: string;
  workCycleId?: string;
  contributionDate: string; // YYYY-MM-DD
  timeContext?: ContributionTimeContext;
  evidenceLinks?: string[];
  evidenceAttachments?: string[];
  status: ContributionStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  recognisedAt?: string;
  recognisedBy?: string;
  recognisedByName?: string;
  recognitionNote?: string;
  declineReason?: string;
  clarifications?: ContributionClarification[];
  attributes?: {
    complexity?: 'standard' | 'high' | 'critical';
    ownership?: 'individual' | 'collaborative' | 'lead';
    crossFunctional?: boolean;
    urgencyContext?: string;
  };
}

// Canonical interface for verified strategic contributions (see StrategicContribution above)

export interface OvertimeLog {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  department?: AgencyDepartment;
  jobId: string;
  jobTitle: string;
  brandName?: string;
  period: OvertimePeriod;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "07:00" or "18:00"
  endTime: string; // e.g. "09:00" or "21:00"
  hoursLogged: number; // e.g. 2.0
  materialNote: string; // e.g. "Finalized 4K audio sync and color grading before 10 AM showcase"
  recognitionPoints: number; // Strategic recognition points
  status: 'pending_acknowledgment' | 'acknowledged_by_manager' | 'acknowledged_by_gm';
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  acknowledgmentNote?: string;
  createdAt: string;
}

// Operational Workload Metrics for Traffic Management
export interface TrafficWorkloadBreakdown {
  briefIntakeCount: number;         // Briefs in 'brief_intake' or 'debrief_prep' (1.5 pts each)
  debriefMeetingCount: number;      // Debrief meetings called or ready (2.0 pts each)
  pendingDispatchCount: number;     // Jobs awaiting staff assignment (2.5 pts each)
  activeProductionRuns: number;     // Deliverables in active production (0.5 pts each)
  reviewHandoffCount: number;       // Deliverables in review/CS handoff (0.5 pts each)
  clientRevertConflicts: number;    // Active revert schedule conflicts requiring mediation (3.5 pts each)
}

export interface TrafficWorkloadStats {
  workloadPoints: number;           // Total active operational workload points
  maxWorkloadPoints: number;        // Weekly target capacity threshold (e.g. 40 pts)
  capacityPercent: number;          // Operational capacity utilization percentage
  status: 'optimal' | 'moderate' | 'heavy' | 'overloaded';
  dispatchVelocityHours: number;    // Median hours from brief intake to creative start (Target: < 24h)
  studioBalanceIndex: number;       // Workload distribution health (0 - 100%)
  overloadedCreativesCount: number; // Creatives > 90% load
  underutilizedCreativesCount: number; // Creatives < 50% load
  optimalCreativesCount: number;    // Creatives in sweet spot (50-85% load)
  conflictResolutionRate: number;   // SLA compliance on conflict mediation (%)
  onTimeHandoffRate: number;        // Deliverable on-time handoff rate (%)
  unassignedBacklogHours: number;   // Cumulative benchmark hours awaiting allocation
  breakdown: TrafficWorkloadBreakdown;
}

// ============================================================================
// CLIENT SERVICES CONFIRMED OPERATING MODEL (TIBULE GENERAL MANAGER BRIEF)
// ============================================================================

/**
 * Confirmed Reporting Hierarchy Levels for Client Services:
 * Director of Client Services → Senior Account Managers → Account Managers → Account Executives → Interns/NSS
 */
export type CSReportingLevel = 
  | 'director'                   // Director of Client Services
  | 'senior_account_manager'     // Senior Account Manager
  | 'account_manager'            // Account Manager
  | 'account_executive'          // Account Executive
  | 'nss_intern';                // Intern / National Service Personnel (NSS)

/**
 * The 7 Confirmed Disciplines within Client Services:
 * 1. Digital media (Strategy, Buying, Reporting)
 * 2. Strategy (Media, Content)
 * 3. Community Management
 * 4. Influencer Management
 * 5. Experientials
 * 6. Traditional Media (Strategy, Buying, Reporting)
 * 7. PR
 */
export type CSDisciplineId = 
  | 'digital_media'
  | 'strategy'
  | 'community_management'
  | 'influencer_management'
  | 'experientials'
  | 'traditional_media'
  | 'pr';

export interface CSDisciplineDefinition {
  id: CSDisciplineId;
  name: string;
  scopeLabel?: string; // e.g. "(Strategy, Buying, Reporting)" or "(Media, Content)"
  subCompetencies: string[]; // e.g. ['Strategy', 'Buying', 'Reporting']
  category: 'digital_media' | 'strategy' | 'social_engagement' | 'experientials' | 'traditional_media' | 'pr';
  description: string;
  distinctionRule: string; // Explains distinct nature and scope
  benchmarkHourlyRate?: number;
  badgeColor: string;
}

export type DisciplineProficiencyLevel = 'lead' | 'senior_practitioner' | 'practitioner' | 'developing';

export interface EmployeeDisciplineAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  disciplineId: CSDisciplineId;
  proficiency: DisciplineProficiencyLevel;
  effectiveDate: string; // YYYY-MM-DD
  weeklyExecutionHours: number; // Planned capacity allocation
  notes?: string;
  isPrimary?: boolean;
}

export interface CSAccountCommitment {
  id: string;
  brandId: string;
  brandName: string;
  employeeId: string;
  role: 'account_lead' | 'co_owner' | 'support_executive';
  weeklyHours: number; // typically 2-3 hours/day -> 10-15h/week
  activeJobsCount: number;
}

export interface CSCapacityAnalysis {
  employeeId: string;
  employeeName: string;
  reportingLevel: CSReportingLevel;
  jobTitle: string;
  contractedHours: number; // Default 40h
  accountManagementHours: number; // 2-3h daily client commitments
  specialistExecutionHours: number; // Committed across functional disciplines
  meetingsAndAdminHours: number; // Routine syncs, reviews
  reworkHours: number; // Revisions and client reverts
  totalCommittedHours: number;
  availableCapacityHours: number;
  utilisationPercentage: number;
  capacityBand: 'underutilised' | 'optimal' | 'approaching' | 'overloaded';
  assignedDisciplines: CSDisciplineId[];
  hasIncompleteEstimates: boolean;
}

export interface CSDisciplineDemandStats {
  disciplineId: CSDisciplineId;
  name: string;
  activeJobsCount: number;
  totalCommittedHours: number;
  totalAvailableHours: number;
  assignedPractitionersCount: number;
  capacityDeficitHours: number; // Positive if deficit/bottleneck
  healthStatus: 'optimal' | 'near_capacity' | 'constrained' | 'unassigned_risk';
}

export interface NSSCompetencyEvaluation {
  id: string;
  competencyArea: 'client_communication' | 'brief_intake_rigor' | 'cross_discipline_coordination' | 'reporting_accuracy' | 'reliability_under_pressure';
  title: string;
  score: number; // 1 to 5
  evidenceNotes: string;
}

export interface NSSDevelopmentDossier {
  employeeId: string;
  employeeName: string;
  supervisorId: string;
  supervisorName: string;
  cohort: string;
  nssStartDate: string;
  nssCompletionDate: string;
  overallReadinessScore: number; // 0 - 100%
  recommendation: 'ready_for_ae_promotion' | 'in_development' | 'requires_mentoring';
  evaluations: NSSCompetencyEvaluation[];
  verifiedContributionsCount: number;
  completedTasksCount: number;
  executiveSponsorNote?: string;
  status: 'active_nss' | 'review_pending' | 'endorsed_for_ae';
}

export type NSSProgressionDossier = NSSDevelopmentDossier;

// ============================================================================
// CLIENT SERVICES 40-HOUR CAPACITY, TIMESHEET & DISCREPANCY AUDIT SYSTEM
// ============================================================================

export type CSTimesheetActivityType =
  | 'discipline_execution'
  | 'account_management'
  | 'client_sync'
  | 'strategy_review'
  | 'admin_reporting';

export interface CSTimesheetEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: CSReportingLevel | string;
  department: 'client_services' | 'traffic';
  jobId: string;
  jobTitle: string;
  clientName: string;
  disciplineId: CSDisciplineId | 'account_management' | 'general_operations';
  disciplineName?: string;
  date: string; // YYYY-MM-DD
  hours: number;
  description: string;
  isBillable: boolean;
  loggedAt: string;
  source: 'live_timer' | 'manual_entry';
}

export interface CSActiveTimer {
  isRunning: boolean;
  startTime: number | null; // epoch timestamp in ms
  jobId: string;
  jobTitle: string;
  clientName: string;
  disciplineId: CSDisciplineId | 'account_management' | 'general_operations';
  description: string;
  elapsedSeconds: number;
  userId?: string;
}

export type DiscrepancySeverity = 'low' | 'medium' | 'high';
export type DiscrepancyStatus = 'flagged' | 'under_review' | 'reconciled';
export type DiscrepancyType = 'overtime' | 'job_variance' | 'discipline_drift';

export interface CSDiscrepancyAlert {
  id: string;
  userId: string;
  userName: string;
  userRole: CSReportingLevel | string;
  type: DiscrepancyType;
  title: string;
  description: string;
  jobId?: string;
  jobTitle?: string;
  clientName?: string;
  disciplineId?: CSDisciplineId | string;
  plannedHours: number;
  actualHours: number;
  varianceHours: number;
  variancePercentage: number;
  weeklyTotalHours: number;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  auditNotes?: string;
  reconciledBy?: string;
  reconciledByName?: string;
  reconciledAt?: string;
  createdAt: string;
}

