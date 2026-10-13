import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  User,
  Team,
  Job,
  JobStatus,
  JobComment,
  ProgressionCase,
  Recognition,
  AuditEvent,
  ExceptionItem,
  EmployeeCapacityCalculation,
  TrafficState,
  MetricTraceInfo,
  StandardTaskType,
  SeniorityLevel,
  WorkflowStage,
  Priority,
  Complexity,
  ClientRevertInfo,
  SplitTimelineConfig,
  Brand,
  DebriefMaterial,
  DebriefMeetingInfo,
  StrategyMeetingInfo,
  ClientEmailDispatchInfo,
  CreativeAlignmentSessionInfo,
  EmailAlertItem,
  EmailAlertType,
  DeliverableEscalationStage,
  WebNotificationItem,
  EfficiencyReward,
  EfficiencyLeaderboardEntry,
  OvertimeLog,
  OvertimePeriod,
  StrategicContribution,
  ContributionCategory,
  ContributionStatus,
  ContributionClarification,
  OperationalEvent,
  WorkCycle,
  ReworkClassification,
  RevertCategory,
  BlockerType,
  ArchivedTaskRecord,
  OneDriveSyncConfig,
  OneDriveSyncBatch,
  DeliveryImpactLog,
  DeliveryImpactCategory,
  DeliveryImpactSeverity,
  EmployeeDisciplineAssignment,
  CSDisciplineId,
  CSAccountCommitment,
  NSSProgressionDossier,
  CSTimesheetEntry,
  CSActiveTimer,
  CSDiscrepancyAlert,
  DiscrepancyStatus
} from '../types';
import {
  INITIAL_DISCIPLINE_ASSIGNMENTS,
  INITIAL_ACCOUNT_COMMITMENTS,
  INITIAL_NSS_PROGRESSION_DOSSIERS
} from '../data/clientServicesOperatingModel';
import {
  INITIAL_CS_TIMESHEET_ENTRIES,
  INITIAL_CS_DISCREPANCY_ALERTS,
  evaluateCSDiscrepancies
} from '../data/clientServicesTimesheets';
import { calculateUserCapacity } from '../utils/capacityEngine';
import {
  evaluateDeliverableEscalation,
  generateInitialWebNotifications,
  getLeadershipChain
} from '../utils/escalationEngine';
import {
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_JOBS,
  INITIAL_COMMENTS,
  INITIAL_EXCEPTIONS,
  INITIAL_CASES,
  INITIAL_RECOGNITIONS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_OVERTIME_LOGS,
  INITIAL_STRATEGIC_CONTRIBUTIONS,
  INITIAL_DELIVERY_IMPACT_LOGS
} from '../mockData';
import { INITIAL_BRANDS } from '../data/brands';
import { CalendarPeriodKey } from '../utils/calendarPeriodFilter';
import {
  INITIAL_ARCHIVED_TASKS,
  INITIAL_ONEDRIVE_CONFIG,
  INITIAL_SYNC_BATCHES
} from '../data/historicTasksData';
import {
  INITIAL_LEADERBOARD,
  INITIAL_REWARDS,
  INITIAL_EMAIL_ALERTS
} from '../data/competitionData';
import { PALETTES, DEFAULT_PALETTE_ID, PaletteScheme } from '../theme/palettes';
import { getActiveOperationalLoadColors } from '../utils/chartColorUtils';
import { buildClientRevertRecord } from '../utils/revertConflictEngine';
import { getStandardTaskBenchmarkHours } from '../data/standardTasks';
import {
  loadStoredUsers,
  saveStoredUsers,
  getStoredAuthSession,
  logoutUserSession
} from '../utils/authStorage';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => void;
  teams: Team[];
  jobs: Job[];
  brands: Brand[];
  emailAlerts: EmailAlertItem[];
  webNotifications: WebNotificationItem[];
  nearlyDueWarningHours: number;
  setNearlyDueWarningHours: (hours: number) => void;
  efficiencyLeaderboard: EfficiencyLeaderboardEntry[];
  efficiencyRewards: EfficiencyReward[];
  isDeadlineRadarOpen: boolean;
  setIsDeadlineRadarOpen: (open: boolean) => void;
  comments: JobComment[];
  exceptions: ExceptionItem[];
  cases: ProgressionCase[];
  recognitions: Recognition[];
  auditEvents: AuditEvent[];
  appearancePreference: 'light' | 'dark' | 'system';
  setAppearancePreference: (pref: 'light' | 'dark' | 'system') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activePaletteId: string;
  setActivePaletteId: (id: string) => void;
  currentPalette: PaletteScheme;
  isPaletteModalOpen: boolean;
  setIsPaletteModalOpen: (open: boolean) => void;
  isAnalystTipsOpen: boolean;
  setIsAnalystTipsOpen: (open: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isCloudSyncOpen: boolean;
  setIsCloudSyncOpen: (open: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  metricTraceModal: MetricTraceInfo | null;
  setMetricTraceModal: (trace: MetricTraceInfo | null) => void;
  isCommandBarOpen: boolean;
  setIsCommandBarOpen: (open: boolean) => void;
  isAuditDrawerOpen: boolean;
  setIsAuditDrawerOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  showBuildCaseModal: boolean;
  setShowBuildCaseModal: (show: boolean) => void;
  showCorrectionModal: boolean;
  setShowCorrectionModal: (show: boolean) => void;
  operationalEvents: OperationalEvent[];
  logOperationalEvent: (event: Omit<OperationalEvent, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorRole'>) => void;
  // Actions
  createJob: (job: Omit<Job, 'id' | 'createdDate' | 'commentsCount' | 'attachmentsCount'>) => void;
  updateJobStatus: (jobId: string, status: JobStatus, reason?: string) => void;
  assignJob: (jobId: string, assigneeId: string) => void;
  reassignJob: (jobId: string, newAssigneeId: string, reason: string) => void;
  unassignJob: (jobId: string) => void;
  indicateBlocker: (jobId: string, blockerReason: string, dependency?: string, blockerType?: BlockerType) => void;
  resolveBlocker: (jobId: string) => void;
  addComment: (jobId: string, content: string) => void;
  createCase: (caseItem: Omit<ProgressionCase, 'id' | 'submissionDate'>) => void;
  updateCaseStatus: (
    caseId: string,
    status: ProgressionCase['status'],
    decision?: ProgressionCase['decision'],
    notes?: string,
    extraUpdates?: Partial<ProgressionCase>
  ) => void;
  grantRecognition: (rec: Omit<Recognition, 'id' | 'date'>) => void;
  createTeam: (name: string, description: string, managerId: string, color?: string) => void;
  inviteUser: (name: string, email: string, role: User['role'], teamId: string, jobTitle: string) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  resolveException: (exceptionId: string) => void;
  rebalanceWorkload: (fromUserId: string, toUserId: string, jobId: string) => void;
  employeeCapacities: Record<string, EmployeeCapacityCalculation>;
  logAuditEvent: (action: string, objectId: string, objectTitle: string, prevVal?: string, newVal?: string, details?: string) => void;
  // Agency Deliverables Workflow Engine
  submitBrief: (brief: {
    title: string;
    description: string;
    requestor: string;
    clientProject: string;
    standardTaskType: StandardTaskType;
    teamId?: string;
    priority?: Priority;
    dueDate: string;
    estimatedHours?: number;
  }) => void;
  trafficRouteBrief: (jobId: string, targetManagerId: string, notes?: string) => void;
  managerAssignStaff: (
    jobId: string,
    assigneeId: string,
    seniority: SeniorityLevel,
    prescribedHours: number,
    dueDate?: string,
    overrideReason?: string
  ) => void;
  staffSubmitDeliverable: (
    jobId: string,
    summary: string,
    fileLinks?: string[],
    notes?: string
  ) => void;
  managerReviewDecision: (
    jobId: string,
    decision: 'approved' | 'feedback',
    feedbackNotes: string,
    revisedHours?: number,
    alignmentSession?: Partial<CreativeAlignmentSessionInfo>
  ) => void;
  clientServiceSendToClient: (jobId: string, clientContactEmail?: string) => void;
  clientSubmitRevert: (
    jobId: string,
    feedbackNotes: string,
    requestedChanges: string[],
    additionalHours?: number,
    urgency?: Priority,
    reworkClassification?: ReworkClassification,
    revertCategory?: RevertCategory
  ) => void;
  resolveRevertConflict: (
    jobId: string,
    resolution: 'queued' | 'paused_current' | 'reassigned' | 'split_timeline',
    targetAssigneeId?: string,
    splitConfig?: SplitTimelineConfig
  ) => void;
  clientApproveDeliverable: (jobId: string) => void;
  // Ghanaian Agency Updated Workflow & Debrief Engine
  markDebriefReady: (jobId: string, material: DebriefMaterial) => void;
  callDebriefMeeting: (
    jobId: string,
    scheduledDate?: string,
    invitedAttendeeIds?: string[],
    discussionNotes?: string
  ) => void;
  completeDebriefMeeting: (
    jobId: string,
    discussionNotes: string,
    prescribedHours: number,
    rationale: string,
    meetingInfo?: Partial<DebriefMeetingInfo>
  ) => void;
  completeStrategyMeeting: (
    jobId: string,
    strategyInfo: {
      agreedCreativeAngle: string;
      strategyNotes: string;
      complexity: Complexity;
      estimatedHours: number;
      deliverablesBreakdownNotes?: string;
    }
  ) => void;
  clientServiceDispatchViaEmail: (
    jobId: string,
    dispatchInfo: ClientEmailDispatchInfo
  ) => void;
  completeDebriefAndAssign: (
    jobId: string,
    meetingInfo: DebriefMeetingInfo,
    assigneeId: string,
    seniority: SeniorityLevel,
    prescribedHours: number
  ) => void;
  trafficAssignJob: (
    jobId: string,
    assigneeId: string,
    assignedToManagerDirectly?: boolean,
    managerDirectAssignReason?: string,
    dueDate?: string
  ) => void;
  sendEmailAlert: (
    jobId: string,
    type: EmailAlertType,
    recipientId?: string,
    customSubject?: string,
    customBody?: string,
    escalationTier?: DeliverableEscalationStage,
    hoursOverdue?: number
  ) => void;
  promptAssignee: (jobId: string, customNote?: string) => void;
  pushDeliverableToSuperior: (jobId: string, note?: string) => void;
  triggerEscalationScan: () => { dispatchedEmails: number; dispatchedWebNotifs: number };
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  awardReward: (rewardData: Omit<EfficiencyReward, 'id'>) => void;
  // Strategic Recognition & Verified Impact System
  contributions: StrategicContribution[];
  isLogContributionModalOpen: boolean;
  setIsLogContributionModalOpen: (open: boolean) => void;
  logContributionTargetJobId: string | null;
  setLogContributionTargetJobId: (jobId: string | null) => void;
  openLogContributionModal: (jobId?: string) => void;
  closeLogContributionModal: () => void;
  logContribution: (data: {
    nomineeId?: string;
    category: ContributionCategory;
    title: string;
    description: string;
    impactStatement: string;
    relatedJobId?: string;
    taskId?: string;
    workCycleId?: string;
    contributionDate?: string;
    timeContext?: StrategicContribution['timeContext'];
    evidenceLinks?: string[];
    evidenceAttachments?: string[];
    attributes?: StrategicContribution['attributes'];
  }) => void;
  verifyContribution: (id: string, note?: string) => void;
  requestClarification: (id: string, question: string) => void;
  respondToClarification: (id: string, response: string) => void;
  recogniseContribution: (id: string, recognitionNote?: string) => void;
  declineContribution: (id: string, reason: string) => void;
  reopenContribution: (id: string) => void;
  getUserContributionSummary: (userId: string) => {
    totalContributions: number;
    byCategory: Record<ContributionCategory, number>;
    verifiedCount: number;
    recognisedCount: number;
    clarificationCount: number;
    exceptionalEffortHours: number;
    contributions: StrategicContribution[];
  };
  // Overtime & Recognition Logging
  overtimeLogs: OvertimeLog[];
  isLogOvertimeModalOpen: boolean;
  setIsLogOvertimeModalOpen: (open: boolean) => void;
  logOvertimeTargetJobId: string | null;
  setLogOvertimeTargetJobId: (jobId: string | null) => void;
  openLogOvertimeModal: (jobId?: string) => void;
  closeLogOvertimeModal: () => void;
  logOvertime: (entry: {
    jobId: string;
    period: OvertimePeriod;
    date: string;
    startTime: string;
    endTime: string;
    hoursLogged: number;
    materialNote: string;
  }) => void;
  acknowledgeOvertime: (logId: string, note?: string) => void;
  getUserOvertimeSummary: (userId: string) => {
    totalHours: number;
    pre9amHours: number;
    post5pmHours: number;
    weekendHours: number;
    count: number;
    recognitionPoints: number;
    acknowledgedCount: number;
    logs: OvertimeLog[];
  };
  // Performance PDF Report Modal
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportTargetUserId: string | null;
  setReportTargetUserId: (id: string | null) => void;
  openReportModal: (targetUserId?: string) => void;
  closeReportModal: () => void;
  // Traffic Year-Long Task Archive & OneDrive Backup
  archivedTasks: ArchivedTaskRecord[];
  oneDriveConfig: OneDriveSyncConfig;
  oneDriveSyncBatches: OneDriveSyncBatch[];
  syncTaskToOneDrive: (taskId: string) => void;
  syncQuarterToOneDrive: (quarter: string) => void;
  updateOneDriveConfig: (config: Partial<OneDriveSyncConfig>) => void;
  triggerFullOneDriveBackup: () => void;
  // Home & Operational Calendar Period Filter across all levels & profiles
  homeCalendarPeriod: CalendarPeriodKey;
  setHomeCalendarPeriod: (period: CalendarPeriodKey) => void;
  homeCustomDateRange: { startDate: string; endDate: string };
  setHomeCustomDateRange: (range: { startDate: string; endDate: string }) => void;
  // Staff & Lead Deadline Delivery Impact Logging
  deliveryImpactLogs: DeliveryImpactLog[];
  isLogDeliveryImpactModalOpen: boolean;
  setIsLogDeliveryImpactModalOpen: (open: boolean) => void;
  logDeliveryImpactTargetJobId: string | null;
  setLogDeliveryImpactTargetJobId: (jobId: string | null) => void;
  openLogDeliveryImpactModal: (jobId?: string) => void;
  closeLogDeliveryImpactModal: () => void;
  logDeliveryImpact: (log: Omit<DeliveryImpactLog, 'id' | 'createdAt' | 'status'>) => void;
  acknowledgeDeliveryImpact: (logId: string, notes?: string) => void;
  resolveDeliveryImpact: (logId: string, resolutionNotes?: string) => void;
  grantDeadlineExtension: (logId: string, revisedDueDate: string) => void;
  // Client Services Operating Model (The Two Dimensions & 9 Confirmed Disciplines)
  disciplineAssignments: EmployeeDisciplineAssignment[];
  assignEmployeeDiscipline: (assignment: Omit<EmployeeDisciplineAssignment, 'id'>) => void;
  removeEmployeeDiscipline: (assignmentId: string) => void;
  updateEmployeeDiscipline: (assignment: EmployeeDisciplineAssignment) => void;
  accountCommitments: CSAccountCommitment[];
  updateAccountCommitment: (commitment: CSAccountCommitment) => void;
  nssProgressionDossiers: NSSProgressionDossier[];
  updateNSSProgressionDossier: (dossier: NSSProgressionDossier) => void;
  endorseNSSForPromotion: (employeeId: string, notes: string) => void;
  // Client Services 40-Hour Capacity Baseline, Timesheets & Discrepancies
  timesheetEntries: CSTimesheetEntry[];
  activeTimer: CSActiveTimer | null;
  discrepancyAlerts: CSDiscrepancyAlert[];
  startTimer: (config: {
    jobId: string;
    jobTitle: string;
    clientName: string;
    disciplineId: CSDisciplineId | 'account_management' | 'general_operations';
    description?: string;
  }) => void;
  stopTimer: (notes?: string) => CSTimesheetEntry | null;
  cancelTimer: () => void;
  updateActiveTimerElapsed: (seconds: number) => void;
  logTimesheetEntry: (entry: Omit<CSTimesheetEntry, 'id' | 'loggedAt'>) => void;
  updateTimesheetEntry: (entry: CSTimesheetEntry) => void;
  deleteTimesheetEntry: (entryId: string) => void;
  adjustTimesheetHours: (entryId: string, deltaHours: number) => void;
  reconcileDiscrepancy: (alertId: string, auditNotes: string, newStatus?: DiscrepancyStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsersState] = useState<User[]>(() => loadStoredUsers());
  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = useCallback((action) => {
    setUsersState((prev) => {
      const next = typeof action === 'function' ? (action as (prev: User[]) => User[])(prev) : action;
      saveStoredUsers(next);
      return next;
    });
  }, []);

  const storedSession = getStoredAuthSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return storedSession !== null ? storedSession.isAuthenticated : true;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [comments, setComments] = useState<JobComment[]>(INITIAL_COMMENTS);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [cases, setCases] = useState<ProgressionCase[]>(INITIAL_CASES);
  const [recognitions, setRecognitions] = useState<Recognition[]>(INITIAL_RECOGNITIONS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlertItem[]>(INITIAL_EMAIL_ALERTS);
  const [nearlyDueWarningHours, setNearlyDueWarningHours] = useState<number>(24);
  const [webNotifications, setWebNotifications] = useState<WebNotificationItem[]>(() => {
    return generateInitialWebNotifications(INITIAL_JOBS, INITIAL_USERS, 24);
  });
  const [efficiencyLeaderboard, setEfficiencyLeaderboard] = useState<EfficiencyLeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [efficiencyRewards, setEfficiencyRewards] = useState<EfficiencyReward[]>(INITIAL_REWARDS);
  const [isDeadlineRadarOpen, setIsDeadlineRadarOpen] = useState<boolean>(false);

  // V2 Operational Event Stream
  const [operationalEvents, setOperationalEvents] = useState<OperationalEvent[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_operational_events');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_operational_events', JSON.stringify(operationalEvents));
    } catch {}
  }, [operationalEvents]);

  // Strategic Recognition: Contributions State
  const [contributions, setContributions] = useState<StrategicContribution[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_strategic_contributions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STRATEGIC_CONTRIBUTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_strategic_contributions', JSON.stringify(contributions));
    } catch {}
  }, [contributions]);

  const [isLogContributionModalOpen, setIsLogContributionModalOpen] = useState<boolean>(false);
  const [logContributionTargetJobId, setLogContributionTargetJobId] = useState<string | null>(null);

  // Home Views & Profiles Global Date Filter
  const [homeCalendarPeriod, setHomeCalendarPeriod] = useState<CalendarPeriodKey>(() => {
    try {
      const saved = localStorage.getItem('tibule_home_calendar_period');
      if (saved) return saved as CalendarPeriodKey;
    } catch {}
    return 'q4_2026';
  });

  const [homeCustomDateRange, setHomeCustomDateRange] = useState<{ startDate: string; endDate: string }>(() => {
    try {
      const saved = localStorage.getItem('tibule_home_custom_date_range');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { startDate: '2026-10-01', endDate: '2026-10-31' };
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_home_calendar_period', homeCalendarPeriod);
    } catch {}
  }, [homeCalendarPeriod]);

  useEffect(() => {
    try {
      localStorage.setItem('tibule_home_custom_date_range', JSON.stringify(homeCustomDateRange));
    } catch {}
  }, [homeCustomDateRange]);

  // Overtime & Recognition State (Sync)
  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_overtime_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_OVERTIME_LOGS;
  });

  const [isLogOvertimeModalOpen, setIsLogOvertimeModalOpen] = useState<boolean>(false);
  const [logOvertimeTargetJobId, setLogOvertimeTargetJobId] = useState<string | null>(null);

  // Traffic Year-Long Task Archive & OneDrive Backup State
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTaskRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_archived_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ARCHIVED_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_archived_tasks', JSON.stringify(archivedTasks));
    } catch {}
  }, [archivedTasks]);

  const [oneDriveConfig, setOneDriveConfig] = useState<OneDriveSyncConfig>(() => {
    try {
      const saved = localStorage.getItem('tibule_onedrive_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ONEDRIVE_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_onedrive_config', JSON.stringify(oneDriveConfig));
    } catch {}
  }, [oneDriveConfig]);

  const [oneDriveSyncBatches, setOneDriveSyncBatches] = useState<OneDriveSyncBatch[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_onedrive_batches');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SYNC_BATCHES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_onedrive_batches', JSON.stringify(oneDriveSyncBatches));
    } catch {}
  }, [oneDriveSyncBatches]);

  const syncTaskToOneDrive = useCallback((taskId: string) => {
    const nowIso = new Date().toISOString();
    setArchivedTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            oneDriveBackup: {
              ...t.oneDriveBackup,
              status: 'verified',
              syncedAt: nowIso
            }
          };
        }
        return t;
      })
    );
  }, []);

  const syncQuarterToOneDrive = useCallback((quarter: string) => {
    const nowIso = new Date().toISOString();
    let updatedCount = 0;
    setArchivedTasks((prev) =>
      prev.map((t) => {
        if (t.quarter === quarter || quarter === 'all') {
          updatedCount++;
          return {
            ...t,
            oneDriveBackup: {
              ...t.oneDriveBackup,
              status: 'verified',
              syncedAt: nowIso
            }
          };
        }
        return t;
      })
    );
    const newBatch: OneDriveSyncBatch = {
      id: `BATCH-${Date.now().toString(36).toUpperCase()}`,
      timestamp: nowIso,
      recordsCount: updatedCount,
      totalSizeMb: Math.round(updatedCount * 280),
      targetFolder: `Historical_Archives/Manual_Sync_${quarter}`,
      initiatedBy: 'Kwame Mensah (Traffic Lead)',
      status: 'completed',
      checksumStatus: 'verified',
      manifestFilename: `manifest_${quarter.toLowerCase()}_${Date.now()}.json`
    };
    setOneDriveSyncBatches((prev) => [newBatch, ...prev]);
    setOneDriveConfig((prev) => ({
      ...prev,
      lastSuccessfulSync: nowIso,
      totalRecordsBackedUp: prev.totalRecordsBackedUp + updatedCount
    }));
  }, []);

  const updateOneDriveConfig = useCallback((config: Partial<OneDriveSyncConfig>) => {
    setOneDriveConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const triggerFullOneDriveBackup = useCallback(() => {
    syncQuarterToOneDrive('all');
  }, [syncQuarterToOneDrive]);

  // Performance PDF Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTargetUserId, setReportTargetUserId] = useState<string | null>(null);

  const openReportModal = useCallback((targetUserId?: string) => {
    setReportTargetUserId(targetUserId || null);
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportTargetUserId(null);
  }, []);

  // Staff & Lead Deadline Delivery Impact Logging State
  const [deliveryImpactLogs, setDeliveryImpactLogs] = useState<DeliveryImpactLog[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_delivery_impact_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DELIVERY_IMPACT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_delivery_impact_logs', JSON.stringify(deliveryImpactLogs));
    } catch {}
  }, [deliveryImpactLogs]);

  const [isLogDeliveryImpactModalOpen, setIsLogDeliveryImpactModalOpen] = useState<boolean>(false);
  const [logDeliveryImpactTargetJobId, setLogDeliveryImpactTargetJobId] = useState<string | null>(null);

  const openLogDeliveryImpactModal = useCallback((jobId?: string) => {
    setLogDeliveryImpactTargetJobId(jobId || null);
    setIsLogDeliveryImpactModalOpen(true);
  }, []);

  const closeLogDeliveryImpactModal = useCallback(() => {
    setIsLogDeliveryImpactModalOpen(false);
    setLogDeliveryImpactTargetJobId(null);
  }, []);

  // Client Services Operating Model State (The Two Dimensions & 9 Confirmed Disciplines)
  const [disciplineAssignments, setDisciplineAssignments] = useState<EmployeeDisciplineAssignment[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_discipline_assignments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DISCIPLINE_ASSIGNMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_cs_discipline_assignments', JSON.stringify(disciplineAssignments));
    } catch {}
  }, [disciplineAssignments]);

  const [accountCommitments, setAccountCommitments] = useState<CSAccountCommitment[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_account_commitments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACCOUNT_COMMITMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_cs_account_commitments', JSON.stringify(accountCommitments));
    } catch {}
  }, [accountCommitments]);

  const [nssProgressionDossiers, setNssProgressionDossiers] = useState<NSSProgressionDossier[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_nss_dossiers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NSS_PROGRESSION_DOSSIERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_cs_nss_dossiers', JSON.stringify(nssProgressionDossiers));
    } catch {}
  }, [nssProgressionDossiers]);

  // Client Services Timesheets & Discrepancies State
  const [timesheetEntries, setTimesheetEntries] = useState<CSTimesheetEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_timesheets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CS_TIMESHEET_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_cs_timesheets', JSON.stringify(timesheetEntries));
    } catch {}
  }, [timesheetEntries]);

  const [activeTimer, setActiveTimer] = useState<CSActiveTimer | null>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_active_timer');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    try {
      if (activeTimer) {
        localStorage.setItem('tibule_cs_active_timer', JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem('tibule_cs_active_timer');
      }
    } catch {}
  }, [activeTimer]);

  // Active stopwatch ticker
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning || !activeTimer.startTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (activeTimer.startTime || now)) / 1000);
      setActiveTimer((prev) => (prev && prev.isRunning ? { ...prev, elapsedSeconds: elapsed } : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, activeTimer?.startTime]);

  const [discrepancyAlerts, setDiscrepancyAlerts] = useState<CSDiscrepancyAlert[]>(() => {
    try {
      const saved = localStorage.getItem('tibule_cs_discrepancy_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CS_DISCREPANCY_ALERTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tibule_cs_discrepancy_alerts', JSON.stringify(discrepancyAlerts));
    } catch {}
  }, [discrepancyAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem('tibule_overtime_logs', JSON.stringify(overtimeLogs));
    } catch {}
  }, [overtimeLogs]);

  // Active persona: restore from active session if exists, otherwise Kwame Mensah (Traffic Manager)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (storedSession && storedSession.userId) {
      const found = users.find((u) => u.id === storedSession.userId);
      if (found) return found;
    }
    const trafficLead = users.find((u) => u.role === 'traffic_manager');
    return trafficLead || users[0];
  });

  const logout = () => {
    logoutUserSession();
    setIsAuthenticated(false);
  };
  // Appearance preference state with local persistence: 'light' | 'dark' | 'system'
  const [appearancePreference, setAppearancePreferenceState] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('tibule_appearance');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      const oldTheme = localStorage.getItem('tibule_theme');
      if (oldTheme === 'light') return 'light';
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme: 'dark' | 'light' = useMemo(() => {
    if (appearancePreference === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return appearancePreference;
  }, [appearancePreference, systemIsDark]);

  const setAppearancePreference = useCallback((pref: 'light' | 'dark' | 'system') => {
    setAppearancePreferenceState(pref);
    try {
      localStorage.setItem('tibule_appearance', pref);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setAppearancePreferenceState((prev) => {
      const currentResolved = prev === 'system' ? (systemIsDark ? 'dark' : 'light') : prev;
      const next = currentResolved === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('tibule_appearance', next);
        localStorage.setItem('tibule_theme', next);
      } catch {}
      return next;
    });
  }, [systemIsDark]);

  const [activeView, setActiveView] = useState<string>('overview');

  // Drawers and Modals
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [metricTraceModal, setMetricTraceModal] = useState<MetricTraceInfo | null>(null);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tibule_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tibule_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showBuildCaseModal, setShowBuildCaseModal] = useState<boolean>(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);

  // Control Tower Theme Palette State
  const [activePaletteId, setActivePaletteId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('tibule_palette');
      if (stored && PALETTES.some((p) => p.id === stored)) {
        return stored;
      }
      return DEFAULT_PALETTE_ID;
    } catch {
      return DEFAULT_PALETTE_ID;
    }
  });
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false);
  const [isAnalystTipsOpen, setIsAnalystTipsOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);

  const currentPalette = useMemo(() => {
    return PALETTES.find((p) => p.id === activePaletteId) || PALETTES[0];
  }, [activePaletteId]);

  // Synchronize HTML element theme class & attribute & dynamic CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-palette', activePaletteId);
    root.style.colorScheme = theme;
    root.dataset.palette = activePaletteId;

    // Apply Control Tower palette variables dynamically
    const pMode = currentPalette[theme];

    // Background & Surfaces
    root.style.setProperty('--background', pMode.bgBase);
    root.style.setProperty('--color-canvas', pMode.bgBase);
    root.style.setProperty('--surface', pMode.bgSurface);
    root.style.setProperty('--color-surface', pMode.bgSurface);
    root.style.setProperty('--surface-elevated', pMode.bgSurfaceElevated);
    root.style.setProperty('--color-surface-elevated', pMode.bgSurfaceElevated);
    root.style.setProperty('--surface-muted', pMode.bgSurfaceMuted || pMode.bgBase);
    root.style.setProperty('--color-surface-muted', pMode.bgSurfaceMuted || pMode.bgBase);
    root.style.setProperty('--color-surface-tertiary', pMode.bgSurfaceMuted || pMode.bgBase);
    root.style.setProperty('--surface-hover', pMode.bgSurfaceHover || pMode.bgSurfaceElevated);
    root.style.setProperty('--color-surface-hover', pMode.bgSurfaceHover || pMode.bgSurfaceElevated);

    // Borders
    root.style.setProperty('--border', pMode.border);
    root.style.setProperty('--color-border', pMode.border);
    root.style.setProperty('--border-subtle', pMode.borderSubtle);
    root.style.setProperty('--color-border-subtle', pMode.borderSubtle);

    // Typography
    root.style.setProperty('--text-primary', pMode.textPrimary);
    root.style.setProperty('--color-text-primary', pMode.textPrimary);
    root.style.setProperty('--text-secondary', pMode.textSecondary);
    root.style.setProperty('--color-text-secondary', pMode.textSecondary);
    root.style.setProperty('--text-muted', pMode.textTertiary);
    root.style.setProperty('--color-text-tertiary', pMode.textTertiary);

    // Accent
    root.style.setProperty('--accent', pMode.accentPrimary);
    root.style.setProperty('--color-brand', pMode.accentPrimary);
    root.style.setProperty('--color-brand-primary', pMode.accentPrimary);
    
    // Set --color-brand-rgb for any rgba calculations
    const cleanHex = pMode.accentPrimary.replace('#', '');
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      root.style.setProperty('--color-brand-rgb', `${r}, ${g}, ${b}`);
    }

    root.style.setProperty('--accent-contrast', pMode.accentContrast);
    root.style.setProperty('--color-brand-contrast', pMode.accentContrast);
    root.style.setProperty('--accent-hover', pMode.accentSecondary);
    root.style.setProperty('--color-brand-hover', pMode.accentSecondary);
    root.style.setProperty('--accent-soft', pMode.glowPrimary);
    root.style.setProperty('--color-brand-muted', pMode.glowPrimary);
    root.style.setProperty('--color-brand-glow', pMode.glowPrimary);

    // Semantics
    root.style.setProperty('--success', pMode.semantic.success);
    root.style.setProperty('--color-success', pMode.semantic.success);
    root.style.setProperty('--warning', pMode.semantic.warning);
    root.style.setProperty('--color-warning', pMode.semantic.warning);
    root.style.setProperty('--critical', pMode.semantic.critical);
    root.style.setProperty('--color-critical', pMode.semantic.critical);
    root.style.setProperty('--info', pMode.semantic.info);
    root.style.setProperty('--color-info', pMode.semantic.info);
    root.style.setProperty('--strategic', pMode.semantic.strategic);
    root.style.setProperty('--color-strategic', pMode.semantic.strategic);

    // Charts
    root.style.setProperty('--chart-1', pMode.charts[0]);
    root.style.setProperty('--color-chart-1', pMode.charts[0]);
    root.style.setProperty('--chart-2', pMode.charts[1]);
    root.style.setProperty('--color-chart-2', pMode.charts[1]);
    root.style.setProperty('--chart-3', pMode.charts[2]);
    root.style.setProperty('--color-chart-3', pMode.charts[2]);
    root.style.setProperty('--chart-4', pMode.charts[3]);
    root.style.setProperty('--color-chart-4', pMode.charts[3]);
    root.style.setProperty('--chart-5', pMode.charts[4]);
    root.style.setProperty('--color-chart-5', pMode.charts[4]);

    // Active Operational Load Metric Variables (distinct & anti-collision)
    const opColors = getActiveOperationalLoadColors(activePaletteId, theme === 'dark');
    root.style.setProperty('--color-load-conflicts', opColors.conflicts);
    root.style.setProperty('--color-load-assignments', opColors.assignments);
    root.style.setProperty('--color-load-debriefs', opColors.debriefs);
    root.style.setProperty('--color-load-brief-intake', opColors.brief_intake);
    root.style.setProperty('--color-load-production', opColors.production);
    root.style.setProperty('--color-load-review', opColors.review);

    // Halo Lighting Rings
    root.style.setProperty('--color-halo-border', pMode.accentPrimary);
    root.style.setProperty('--color-halo-glow', pMode.glowPrimary);
    root.style.setProperty('--color-halo-secondary', pMode.glowSecondary);

    // Sync browser tab favicon dynamically with current theme mode & active brand palette
    try {
      const isDarkMode = theme === 'dark';
      const bgColor = isDarkMode ? pMode.bgSurfaceElevated : pMode.accentPrimary;
      const borderColor = isDarkMode ? pMode.accentPrimary : 'transparent';
      const strokeColor = isDarkMode ? pMode.accentPrimary : pMode.accentContrast;
      
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="8" fill="${bgColor}" stroke="${borderColor}" stroke-width="${isDarkMode ? '1.5' : '0'}" /><g fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(4, 4)"><path d="M4 6h16" /><path d="M12 6v14" /><path d="M7 11h10" /></g></svg>`;
      const iconUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

      const faviconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (faviconLink) {
        faviconLink.href = iconUrl;
      }
      const appleTouchLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (appleTouchLink) {
        appleTouchLink.href = iconUrl;
      }
    } catch {
      // ignore
    }

    try {
      localStorage.setItem('tibule_appearance', appearancePreference);
      localStorage.setItem('tibule_theme', theme);
      localStorage.setItem('tibule_palette', activePaletteId);
    } catch {
      // ignore
    }
  }, [theme, appearancePreference, activePaletteId, currentPalette]);

  // Keep currentUserRef updated for keyboard shortcuts
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Tibule Control Tower Reference & Guidelines keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandBarOpen(false);
        setIsPaletteModalOpen(false);
        setIsAnalystTipsOpen(false);
        setIsCopilotOpen(false);
        setIsCloudSyncOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsPaletteModalOpen((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsAnalystTipsOpen((prev) => !prev);
      } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
        const currentRole = currentUserRef.current.role;
        let viewMap: Record<string, string> = {};

        if (currentRole === 'general_manager' || currentRole === 'admin') {
          viewMap = {
            '1': 'overview',
            '2': 'cases',
            '3': 'agency_workflow',
            '4': 'master_table',
            '5': 'summary_matrix',
            '6': 'visual_analytics',
            '7': 'manager_tower'
          };
        } else if (currentRole === 'traffic_manager') {
          viewMap = {
            '1': 'overview',
            '2': 'agency_workflow',
            '3': 'master_table',
            '4': 'team_traffic',
            '5': 'all_work',
            '6': 'visual_analytics',
            '7': 'manager_tower'
          };
        } else if (currentRole === 'client_service') {
          viewMap = {
            '1': 'overview',
            '2': 'agency_workflow',
            '3': 'master_table',
            '4': 'all_work',
            '5': 'visual_analytics',
            '6': 'manager_tower'
          };
        } else if (currentRole === 'manager' || currentRole === 'director' || currentRole === 'team_lead') {
          viewMap = {
            '1': 'overview',
            '2': 'agency_workflow',
            '3': 'cases',
            '4': 'master_table',
            '5': 'team_traffic',
            '6': 'all_work',
            '7': 'visual_analytics',
            '8': 'manager_tower'
          };
        } else {
          // Specialist / Production Employee
          viewMap = {
            '1': 'overview',
            '2': 'my_work',
            '3': 'evidence',
            '4': 'cases',
            '5': 'all_work',
            '6': 'visual_analytics'
          };
        }

        if (viewMap[e.key]) {
          setActiveView(viewMap[e.key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const logAuditEvent = useCallback((
    action: string,
    objectId: string,
    objectTitle: string,
    previousValue?: string,
    newValue?: string,
    details?: string
  ) => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.jobTitle,
      action,
      objectId,
      objectTitle,
      previousValue,
      newValue,
      details
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  }, [currentUser]);

  // V2 Structured Operational Event Logger
  const logOperationalEvent = useCallback((
    event: Omit<OperationalEvent, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorRole'>
  ) => {
    const newOpEvent: OperationalEvent = {
      ...event,
      id: `ope-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.jobTitle
    };
    setOperationalEvents((prev) => [newOpEvent, ...prev]);
  }, [currentUser]);

  // Calculate capacity engine metrics with V2 availability & explainability model
  const employeeCapacities = useMemo(() => {
    const calc: Record<string, EmployeeCapacityCalculation> = {};
    users.forEach((user) => {
      calc[user.id] = calculateUserCapacity(user, jobs);
    });
    return calc;
  }, [users, jobs]);

  // Actions
  const createJob = useCallback((jobData: Omit<Job, 'id' | 'createdDate' | 'commentsCount' | 'attachmentsCount'>) => {
    const newId = `CT-${Math.floor(1860 + Math.random() * 800)}`;
    const newJob: Job = {
      ...jobData,
      id: newId,
      createdDate: new Date().toISOString(),
      commentsCount: 0,
      attachmentsCount: 0
    };
    setJobs((prev) => [newJob, ...prev]);
    logAuditEvent('JOB_CREATED', newId, newJob.title, undefined, newJob.status, `Created for team ${newJob.teamId}`);
  }, [logAuditEvent]);

  const updateJobStatus = useCallback((jobId: string, newStatus: JobStatus, reason?: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const prevStatus = job.status;
          logAuditEvent('JOB_STATUS_UPDATED', jobId, job.title, prevStatus, newStatus, reason || `Status transitioned to ${newStatus}`);
          return {
            ...job,
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : job.completedDate,
            blockerReason: newStatus === 'blocked' ? (reason || job.blockerReason) : undefined,
            blockedSince: newStatus === 'blocked' ? new Date().toISOString() : undefined
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

  const assignJob = useCallback((jobId: string, assigneeId: string) => {
    const assignee = users.find((u) => u.id === assigneeId);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_ASSIGNED', jobId, job.title, job.assigneeId || 'UNASSIGNED', assignee?.name || assigneeId, `Assigned to ${assignee?.name}`);
          return {
            ...job,
            assigneeId,
            status: job.status === 'unassigned' ? 'assigned' : job.status,
            assignedDate: new Date().toISOString()
          };
        }
        return job;
      })
    );
  }, [users, logAuditEvent]);

  const reassignJob = useCallback((jobId: string, newAssigneeId: string, reason: string) => {
    const targetUser = users.find((u) => u.id === newAssigneeId);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const oldAssignee = users.find((u) => u.id === job.assigneeId);
          const historyEntry = {
            fromUserId: job.assigneeId,
            toUserId: newAssigneeId,
            timestamp: new Date().toISOString(),
            reason,
            actorName: currentUser.name
          };
          logAuditEvent(
            'JOB_REASSIGNED',
            jobId,
            job.title,
            oldAssignee?.name || 'Unassigned',
            targetUser?.name || 'Assigned',
            `Rebalanced work: ${reason}`
          );
          return {
            ...job,
            assigneeId: newAssigneeId,
            reassignmentHistory: [...(job.reassignmentHistory || []), historyEntry]
          };
        }
        return job;
      })
    );
  }, [users, currentUser, logAuditEvent]);

  const unassignJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_UNASSIGNED', jobId, job.title, job.assigneeId, 'UNASSIGNED', 'Returned job to team queue');
          return {
            ...job,
            assigneeId: undefined,
            status: 'unassigned'
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

  const indicateBlocker = useCallback((
    jobId: string,
    blockerReason: string,
    dependency?: string,
    blockerType: BlockerType = 'scope_clarification'
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_BLOCKED', jobId, job.title, job.status, 'BLOCKED', `[${blockerType}] ${blockerReason}`);
          
          logOperationalEvent({
            eventType: 'blocker_logged',
            jobId,
            jobTitle: job.title,
            cycleNumber: job.activeCycleNumber || 1,
            summary: `Blocker indicated (${blockerType}): ${blockerReason}`,
            impact: 'blocked'
          });

          return {
            ...job,
            status: 'blocked',
            blockerReason,
            blockedSince: new Date().toISOString(),
            dependencies: dependency ? [...(job.dependencies || []), dependency] : job.dependencies,
            blockerDetail: {
              type: blockerType,
              description: blockerReason,
              loggedAt: new Date().toISOString(),
              loggedBy: currentUser.name,
              dependency
            }
          };
        }
        return job;
      })
    );
  }, [currentUser, logAuditEvent, logOperationalEvent]);

  const resolveBlocker = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_UNBLOCKED', jobId, job.title, 'BLOCKED', 'IN_PROGRESS', 'Dependency resolved by team');
          
          logOperationalEvent({
            eventType: 'blocker_resolved',
            jobId,
            jobTitle: job.title,
            cycleNumber: job.activeCycleNumber || 1,
            summary: `Blocker cleared: Work resumed`,
            impact: 'neutral'
          });

          return {
            ...job,
            status: 'in_progress',
            blockerReason: undefined,
            blockedSince: undefined,
            blockerDetail: undefined
          };
        }
        return job;
      })
    );
  }, [logAuditEvent, logOperationalEvent]);

  const addComment = useCallback((jobId: string, content: string) => {
    const newComment: JobComment = {
      id: `cmt-${Date.now()}`,
      jobId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.jobTitle,
      content,
      timestamp: new Date().toISOString()
    };
    setComments((prev) => [...prev, newComment]);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, commentsCount: j.commentsCount + 1 } : j))
    );
    logAuditEvent('COMMENT_ADDED', jobId, `Job ${jobId}`, undefined, undefined, `Comment by ${currentUser.name}`);
  }, [currentUser, logAuditEvent]);

  const createCase = useCallback((caseData: Omit<ProgressionCase, 'id' | 'submissionDate'>) => {
    const newCaseId = `CASE-00${cases.length + 43}`;
    const newCase: ProgressionCase = {
      ...caseData,
      id: newCaseId,
      submissionDate: new Date().toISOString()
    };
    setCases((prev) => [newCase, ...prev]);
    logAuditEvent('CASE_SUBMITTED', newCaseId, newCase.title, 'DRAFT', newCase.status, `Submitted by ${newCase.employeeName}`);
  }, [cases.length, logAuditEvent]);

  const updateCaseStatus = useCallback((
    caseId: string,
    status: ProgressionCase['status'],
    decision?: ProgressionCase['decision'],
    notes?: string,
    extraUpdates?: Partial<ProgressionCase>
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          logAuditEvent('CASE_STATUS_UPDATED', caseId, c.title, c.status, status, notes || `Decision: ${decision || 'Progressed'}`);
          return {
            ...c,
            status,
            decision: decision || c.decision,
            decisionNotes: notes || c.decisionNotes,
            decisionDate: decision ? new Date().toISOString() : c.decisionDate,
            ...(extraUpdates || {})
          };
        }
        return c;
      })
    );
  }, [logAuditEvent]);

  const grantRecognition = useCallback((recData: Omit<Recognition, 'id' | 'date'>) => {
    const newRec: Recognition = {
      ...recData,
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setRecognitions((prev) => [newRec, ...prev]);
    logAuditEvent('RECOGNITION_GRANTED', newRec.id, `Recognition for ${recData.employeeName}`, undefined, recData.category, recData.reason);
  }, [logAuditEvent]);

  const createTeam = useCallback((name: string, description: string, managerId: string, color: string = '#0284c7') => {
    const newId = `team-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const newTeam: Team = {
      id: newId,
      name,
      description,
      managerId,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      color,
      memberIds: [managerId]
    };
    setTeams((prev) => [...prev, newTeam]);
    logAuditEvent('TEAM_CREATED', newId, name, undefined, 'ACTIVE', `Created by ${currentUser.name}`);
  }, [currentUser, logAuditEvent]);

  const inviteUser = useCallback((name: string, email: string, role: User['role'], teamId: string, jobTitle: string) => {
    const newId = `usr-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const newUser: User = {
      id: newId,
      name,
      email,
      role,
      jobTitle,
      teamId,
      status: 'pending_setup',
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      skillProfile: ['General Operations', 'Tibule Core Standards'],
      capacityHoursPerWeek: 38
    };
    setUsers((prev) => [...prev, newUser]);
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, memberIds: [...t.memberIds, newId] } : t))
    );
    logAuditEvent('USER_INVITED', newId, name, 'NONE', 'PENDING_SETUP', `Invitation email sent to ${email}`);
  }, [logAuditEvent]);

  const updateUserStatus = useCallback((userId: string, status: User['status']) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          logAuditEvent('USER_STATUS_CHANGED', userId, u.name, u.status, status, `Account status changed to ${status}`);
          return { ...u, status };
        }
        return u;
      })
    );
  }, [logAuditEvent]);

  const resolveException = useCallback((exceptionId: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
    logAuditEvent('EXCEPTION_RESOLVED', exceptionId, 'Exception dismissed/resolved', 'ACTIVE', 'RESOLVED');
  }, [logAuditEvent]);

  const rebalanceWorkload = useCallback((fromUserId: string, toUserId: string, jobId: string) => {
    reassignJob(jobId, toUserId, 'Capacity rebalancing optimization');
    // Also dismiss any related capacity exception if present
    setExceptions((prev) =>
      prev.filter((e) => !(e.relatedJobId === jobId || (e.relatedEmployeeId === fromUserId && e.type === 'capacity_exceeded')))
    );
  }, [reassignJob]);

  // Agency Deliverables Workflow Engine Callbacks
  const submitBrief = useCallback((brief: {
    title: string;
    description: string;
    requestor: string;
    clientProject: string;
    standardTaskType: StandardTaskType;
    teamId?: string;
    priority?: Priority;
    dueDate: string;
    estimatedHours?: number;
  }) => {
    if (currentUser.role !== 'client_service') {
      console.warn('Brief submission rejected: strictly restricted to Client Services role.');
      return;
    }

    const newId = `CT-${Math.floor(1865 + Math.random() * 800)}`;
    const baseHours = brief.estimatedHours || getStandardTaskBenchmarkHours(brief.standardTaskType, 'mid');
    
    // V2 Initialize WorkCycle 1
    const initialCycle: WorkCycle = {
      id: `cyc-${newId.toLowerCase()}-1`,
      jobId: newId,
      cycleNumber: 1,
      title: `Cycle 1: ${brief.title}`,
      cycleType: 'initial_production',
      standardAllocation: baseHours,
      managerAllocation: baseHours,
      actualEffort: 0,
      reworkEffort: 0,
      startedAt: new Date().toISOString(),
      status: 'active'
    };

    const newJob: Job = {
      id: newId,
      title: brief.title,
      description: brief.description,
      requestor: brief.requestor,
      clientProject: brief.clientProject,
      teamId: brief.teamId || 'team-creative',
      managerId: 'usr-elena-rostova', // Default creative manager
      priority: brief.priority || 'high',
      category: brief.standardTaskType,
      complexity: 'high',
      standardTaskType: brief.standardTaskType,
      workflowStage: 'brief_intake',
      benchmarkBaseHours: baseHours,
      standardAllocationHours: baseHours,
      managerAllocationHours: baseHours,
      actualEffortHours: 0,
      reworkEffortHours: 0,
      estimatedHours: baseHours,
      actualHours: 0,
      createdDate: new Date().toISOString(),
      dueDate: brief.dueDate,
      status: 'unassigned',
      commentsCount: 0,
      attachmentsCount: 1,
      isAtRisk: false,
      activeCycleNumber: 1,
      workCycles: [initialCycle]
    };

    setJobs((prev) => [newJob, ...prev]);
    logAuditEvent('BRIEF_SUBMITTED', newId, newJob.title, undefined, 'brief_intake', `Client Service submitted standard brief (${brief.standardTaskType})`);
    logOperationalEvent({
      eventType: 'cycle_started',
      jobId: newId,
      jobTitle: newJob.title,
      cycleNumber: 1,
      summary: `Initial work cycle opened with ${baseHours}h standard benchmark`,
      impact: 'neutral'
    });
  }, [currentUser, logAuditEvent]);

  const trafficRouteBrief = useCallback((jobId: string, targetManagerId: string, notes?: string) => {
    const targetManager = users.find((u) => u.id === targetManagerId);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('TRAFFIC_ROUTED', jobId, job.title, job.managerId, targetManager?.name || targetManagerId, notes || 'Brief routed to discipline manager');
          return {
            ...job,
            managerId: targetManagerId,
            trafficManagerId: currentUser.id,
            trafficHandoffNotes: notes || `Dispatched by Traffic Manager ${currentUser.name}`,
            workflowStage: 'manager_assignment',
            status: 'unassigned'
          };
        }
        return job;
      })
    );
  }, [users, currentUser, logAuditEvent]);

  const managerAssignStaff = useCallback((
    jobId: string,
    assigneeId: string,
    seniority: SeniorityLevel,
    prescribedHours: number,
    dueDate?: string,
    overrideReason?: string
  ) => {
    const staff = users.find((u) => u.id === assigneeId);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const standardBench = getStandardTaskBenchmarkHours(job.standardTaskType, seniority);
          const isOverridden = prescribedHours !== standardBench;

          logAuditEvent(
            'STAFF_ASSIGNED_WITH_BENCHMARK',
            jobId,
            job.title,
            'unassigned',
            staff?.name || assigneeId,
            `Assigned to ${staff?.name} (${seniority.toUpperCase()}) with ${prescribedHours}h allocation${isOverridden ? ` (Standard: ${standardBench}h, Reason: ${overrideReason || 'Manager adjustment'})` : ''}`
          );

          logOperationalEvent({
            eventType: isOverridden ? 'allocation_overridden' : 'assignment_changed',
            jobId,
            jobTitle: job.title,
            summary: `Staff assigned: ${staff?.name}. Manager allocation: ${prescribedHours}h (Standard: ${standardBench}h)${isOverridden && overrideReason ? ` - Note: ${overrideReason}` : ''}`,
            impact: isOverridden ? 'congested' : 'neutral'
          });

          // Update active workCycle allocation
          const updatedCycles = (job.workCycles || []).map((c) => {
            if (c.cycleNumber === (job.activeCycleNumber || 1)) {
              return {
                ...c,
                standardAllocation: standardBench,
                managerAllocation: prescribedHours,
                managerOverrideReason: overrideReason
              };
            }
            return c;
          });

          return {
            ...job,
            assigneeId,
            assignedSeniority: seniority,
            standardAllocationHours: standardBench,
            managerAllocationHours: prescribedHours,
            managerAllocationReason: overrideReason,
            estimatedHours: prescribedHours,
            dueDate: dueDate || job.dueDate,
            workflowStage: 'in_production',
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            startDate: new Date().toISOString(),
            workCycles: updatedCycles.length > 0 ? updatedCycles : [
              {
                id: `cyc-${job.id.toLowerCase()}-1`,
                jobId: job.id,
                cycleNumber: 1,
                title: `Cycle 1: ${job.title}`,
                cycleType: 'initial_production',
                standardAllocation: standardBench,
                managerAllocation: prescribedHours,
                actualEffort: 0,
                reworkEffort: 0,
                startedAt: new Date().toISOString(),
                status: 'active',
                managerOverrideReason: overrideReason
              }
            ]
          };
        }
        return job;
      })
    );
  }, [users, logAuditEvent, logOperationalEvent]);

  const staffSubmitDeliverable = useCallback((
    jobId: string,
    summary: string,
    fileLinks?: string[],
    notes?: string
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const submission = {
            submittedDate: new Date().toISOString(),
            submittedBy: currentUser.id,
            submitterName: currentUser.name,
            summary,
            fileLinks: fileLinks || [],
            notes
          };
          logAuditEvent('DELIVERABLE_SUBMITTED', jobId, job.title, 'in_production', 'internal_review', `Submitted by ${currentUser.name} for Manager Review`);
          return {
            ...job,
            deliverableSubmission: submission,
            workflowStage: 'internal_review',
            status: 'in_review'
          };
        }
        return job;
      })
    );
  }, [currentUser, logAuditEvent]);

  const managerReviewDecision = useCallback((
    jobId: string,
    decision: 'approved' | 'feedback',
    feedbackNotes: string,
    revisedHours?: number,
    alignmentSession?: Partial<CreativeAlignmentSessionInfo>
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const currentCycleNum = job.activeCycleNumber || 1;
          const targetAssignee = users.find((u) => u.id === job.assigneeId);

          const fullAlignmentRecord: CreativeAlignmentSessionInfo = {
            conductedAt: new Date().toISOString(),
            leadReviewerId: currentUser.id,
            leadReviewerName: currentUser.name,
            leadReviewerRole: currentUser.jobTitle || 'Discipline Lead',
            assigneeId: job.assigneeId || '',
            assigneeName: targetAssignee?.name || 'Assigned Creative',
            bouncedIdeas: alignmentSession?.bouncedIdeas || [],
            verbalDiscussionSummary: alignmentSession?.verbalDiscussionSummary || feedbackNotes,
            codifiedChanges: alignmentSession?.codifiedChanges || [],
            additionalHours: decision === 'feedback' ? (revisedHours || 4) : undefined,
            outcome: decision === 'approved' ? 'approved_to_client_services' : 'codified_revision_needed'
          };

          if (decision === 'feedback') {
            const extraHours = revisedHours || 4;
            const feedbackItem = {
              id: `fb-${Date.now()}`,
              reviewerId: currentUser.id,
              reviewerName: currentUser.name,
              reviewerRole: currentUser.jobTitle,
              notes: feedbackNotes,
              revisedHours: extraHours,
              timestamp: new Date().toISOString()
            };

            const nextCycleNum = currentCycleNum + 1;
            const newCycle: WorkCycle = {
              id: `cyc-${job.id.toLowerCase()}-${nextCycleNum}`,
              jobId: job.id,
              cycleNumber: nextCycleNum,
              title: `Internal Revision: ${feedbackNotes.slice(0, 40)}...`,
              cycleType: 'internal_revision',
              reworkClassification: 'rework',
              standardAllocation: extraHours,
              managerAllocation: extraHours,
              actualEffort: 0,
              reworkEffort: extraHours,
              startedAt: new Date().toISOString(),
              status: 'active',
              feedbackNotes
            };

            const updatedCycles = (job.workCycles || []).map((c) =>
              c.cycleNumber === currentCycleNum
                ? { ...c, status: 'superseded' as const, completedAt: new Date().toISOString() }
                : c
            );

            logAuditEvent('MANAGER_FEEDBACK_GIVEN', jobId, job.title, 'internal_review', 'in_production', `Lead & IC alignment session held. Codified revisions agreed (+${extraHours}h rework added)`);
            logOperationalEvent({
              eventType: 'cycle_started',
              jobId,
              jobTitle: job.title,
              cycleNumber: nextCycleNum,
              summary: `Creative alignment revision cycle #${nextCycleNum} initiated (+${extraHours}h rework codified)`,
              impact: 'congested'
            });

            return {
              ...job,
              workflowStage: 'in_production',
              status: 'in_progress',
              estimatedHours: job.estimatedHours + extraHours,
              reworkEffortHours: (job.reworkEffortHours || 0) + extraHours,
              activeCycleNumber: nextCycleNum,
              workCycles: [...updatedCycles, newCycle],
              feedbackHistory: [...(job.feedbackHistory || []), feedbackItem],
              creativeAlignmentSession: fullAlignmentRecord,
              critiqueMeetingNotes: fullAlignmentRecord.verbalDiscussionSummary
            };
          } else {
            // Manager Approved -> Hand off to Client Service
            logAuditEvent('MANAGER_APPROVED', jobId, job.title, 'internal_review', 'client_service_handoff', `Lead & IC alignment session completed. Creative work approved for client dispatch`);
            logOperationalEvent({
              eventType: 'quality_review_completed',
              jobId,
              jobTitle: job.title,
              cycleNumber: currentCycleNum,
              summary: `Creative alignment review passed; ready for Client Services work email dispatch`,
              impact: 'neutral'
            });

            return {
              ...job,
              workflowStage: 'client_service_handoff',
              status: 'in_review',
              creativeAlignmentSession: fullAlignmentRecord,
              critiqueMeetingNotes: fullAlignmentRecord.verbalDiscussionSummary
            };
          }
        }
        return job;
      })
    );
  }, [currentUser, users, logAuditEvent, logOperationalEvent]);

  const clientServiceSendToClient = useCallback((jobId: string, clientContactEmail?: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('SENT_TO_CLIENT', jobId, job.title, 'client_service_handoff', 'client_review', `Dispatched to client (${clientContactEmail || job.requestor})`);
          logOperationalEvent({
            eventType: 'client_submitted',
            jobId,
            jobTitle: job.title,
            cycleNumber: job.activeCycleNumber || 1,
            summary: `Deliverable delivered to client for formal review`,
            impact: 'neutral'
          });
          return {
            ...job,
            workflowStage: 'client_review',
            status: 'in_review'
          };
        }
        return job;
      })
    );
  }, [logAuditEvent, logOperationalEvent]);

  const clientSubmitRevert = useCallback((
    jobId: string,
    feedbackNotes: string,
    requestedChanges: string[],
    additionalHours: number = 4,
    urgency: Priority = 'urgent',
    reworkClassification: ReworkClassification = 'correction',
    revertCategory: RevertCategory = 'stakeholder_subjective_preference'
  ) => {
    setJobs((prev) => {
      const targetJob = prev.find((j) => j.id === jobId);
      if (!targetJob) return prev;

      const revertRecord = buildClientRevertRecord(
        targetJob,
        prev,
        feedbackNotes,
        requestedChanges,
        additionalHours,
        urgency
      );

      const currentCycleNum = targetJob.activeCycleNumber || 1;
      const nextCycleNum = currentCycleNum + 1;

      // V2 Structured Revert Cycle
      const revertCycle: WorkCycle = {
        id: `cyc-${targetJob.id.toLowerCase()}-${nextCycleNum}`,
        jobId: targetJob.id,
        cycleNumber: nextCycleNum,
        title: `Client Revert #${revertRecord.revertCount}: ${revertCategory.replace(/_/g, ' ')}`,
        cycleType: 'client_revert_revision',
        reworkClassification,
        revertCategory,
        standardAllocation: additionalHours,
        managerAllocation: additionalHours,
        actualEffort: 0,
        reworkEffort: additionalHours,
        startedAt: new Date().toISOString(),
        status: 'active',
        feedbackNotes
      };

      const updatedCycles = (targetJob.workCycles || []).map((c) =>
        c.cycleNumber === currentCycleNum
          ? { ...c, status: 'superseded' as const, completedAt: new Date().toISOString() }
          : c
      );

      logAuditEvent(
        'CLIENT_REVERT_RECEIVED',
        jobId,
        targetJob.title,
        'client_review',
        'client_revert',
        `Client revert #${revertRecord.revertCount} [Class: ${reworkClassification}, Category: ${revertCategory}]. Conflict: ${revertRecord.conflictDetected ? 'YES' : 'NO'}`
      );

      logOperationalEvent({
        eventType: 'client_revert_received',
        jobId,
        jobTitle: targetJob.title,
        cycleNumber: nextCycleNum,
        summary: `Client Revert cycle #${nextCycleNum} registered (${reworkClassification} / ${revertCategory}). +${additionalHours}h allocated. Conflict: ${revertRecord.conflictDetected ? 'YES' : 'NO'}`,
        impact: 'blocked'
      });

      return prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            workflowStage: 'client_revert',
            status: 'reopened',
            priority: urgency,
            estimatedHours: j.estimatedHours + additionalHours,
            reworkEffortHours: (j.reworkEffortHours || 0) + additionalHours,
            activeCycleNumber: nextCycleNum,
            workCycles: [...updatedCycles, revertCycle],
            clientRevertInfo: revertRecord
          };
        }
        return j;
      });
    });
  }, [logAuditEvent, logOperationalEvent]);

  const resolveRevertConflict = useCallback((
    jobId: string,
    resolution: 'queued' | 'paused_current' | 'reassigned' | 'split_timeline',
    targetAssigneeId?: string,
    splitConfig?: SplitTimelineConfig
  ) => {
    setJobs((prev) => {
      const targetJob = prev.find((j) => j.id === jobId);
      if (!targetJob || !targetJob.clientRevertInfo) return prev;

      const conflictingJobId = targetJob.clientRevertInfo.conflictingJobId;

      const auditSummary = resolution === 'split_timeline'
        ? `Traffic ${currentUser.name} resolved conflict via Dual-Track Time-Share: Extended Revert deadline by +${splitConfig?.revertDaysExtended || 2}d and Active Job [${conflictingJobId || 'current'}] by +${splitConfig?.activeJobDaysExtended || 2}d. Daily split: ${splitConfig?.revertDailyHours || 4}h revert / ${splitConfig?.activeJobDailyHours || 4}h active.`
        : `Resolved using strategy: ${resolution}`;

      logAuditEvent(
        'REVERT_CONFLICT_RESOLVED',
        jobId,
        targetJob.title,
        'CONFLICT_DETECTED',
        resolution.toUpperCase(),
        auditSummary
      );

      return prev.map((j) => {
        // Update conflicting other job if we chose 'paused_current'
        if (resolution === 'paused_current' && j.id === conflictingJobId) {
          return {
            ...j,
            status: 'awaiting_input',
            blockerReason: `Paused temporarily to process emergency client revert on [${targetJob.id}] "${targetJob.title}"`
          };
        }

        // Update conflicting active job if we chose 'split_timeline' (extend its timeline)
        if (resolution === 'split_timeline' && j.id === conflictingJobId) {
          const extensionDays = splitConfig?.activeJobDaysExtended || 2;
          const currentDueDate = new Date(j.dueDate);
          const newDueDate = splitConfig?.newActiveDueDate || new Date(currentDueDate.getTime() + extensionDays * 86400000).toISOString();
          return {
            ...j,
            dueDate: newDueDate,
            timelineShiftReason: `Timeline extended by +${extensionDays}d (due ${new Date(newDueDate).toLocaleDateString()}) due to dual-track time-share on revert [${targetJob.id}]`
          };
        }

        // Update target reverting job
        if (j.id === jobId) {
          const updatedRevert: ClientRevertInfo = {
            ...j.clientRevertInfo!,
            conflictDetected: false,
            conflictResolution: resolution,
            splitTimelineConfig: resolution === 'split_timeline' ? splitConfig : undefined,
            resolvedBy: currentUser.name,
            resolvedAt: new Date().toISOString()
          };

          if (resolution === 'reassigned' && targetAssigneeId) {
            return {
              ...j,
              assigneeId: targetAssigneeId,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'in_progress',
              isAtRisk: false
            };
          }

          if (resolution === 'paused_current') {
            return {
              ...j,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'in_progress',
              isAtRisk: false
            };
          }

          if (resolution === 'queued') {
            return {
              ...j,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'assigned',
              isAtRisk: false
            };
          }

          if (resolution === 'split_timeline') {
            const extensionDays = splitConfig?.revertDaysExtended || 2;
            const currentDueDate = new Date(j.dueDate);
            const newDueDate = splitConfig?.newRevertDueDate || new Date(currentDueDate.getTime() + extensionDays * 86400000).toISOString();
            return {
              ...j,
              dueDate: newDueDate,
              timelineShiftReason: `Timeline extended by +${extensionDays}d (due ${new Date(newDueDate).toLocaleDateString()}) for dual-track time-share`,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'in_progress',
              isAtRisk: false
            };
          }

          return {
            ...j,
            clientRevertInfo: updatedRevert,
            workflowStage: 'in_production',
            status: 'in_progress',
            isAtRisk: false
          };
        }

        return j;
      });
    });
  }, [currentUser, logAuditEvent]);

  const clientApproveDeliverable = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('CLIENT_FINAL_APPROVAL', jobId, job.title, job.workflowStage, 'completed', 'Client signed off on final deliverable');
          return {
            ...job,
            workflowStage: 'completed',
            status: 'completed',
            completedDate: new Date().toISOString(),
            clientApprovedDate: new Date().toISOString()
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

  // Ghanaian Agency Updated Workflow & Debrief Engine Methods
  const sendEmailAlert = useCallback((
    jobId: string,
    type: EmailAlertType,
    recipientId?: string,
    customSubject?: string,
    customBody?: string,
    escalationTier?: DeliverableEscalationStage,
    hoursOverdue?: number
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    const recipient = users.find((u) => u.id === recipientId) ||
      (job?.assigneeId ? users.find((u) => u.id === job.assigneeId) : users.find((u) => u.id === 'usr-kwame-mensah')) ||
      users[0];

    const brandName = job?.requestor || 'Client Brand';
    const nowIso = new Date().toISOString();

    let subject = customSubject;
    let previewBody = customBody;

    if (!subject) {
      if (type === 'nearly_due') {
        subject = `⏰ [Nearly Due] ${job?.id}: ${job?.title} (Due soon)`;
      } else if (type === 'due_now') {
        subject = `🔔 [Deliverable Due] ${job?.id}: Time to push work to superior for review`;
      } else if (type === 'traffic_prompt') {
        subject = `⚠️ [1h Overdue Alert] Traffic prompt required for ${job?.id}`;
      } else if (type === 'escalation_lead') {
        subject = `🚨 [3h Overdue Escalation] Superior intervention required for ${job?.id}`;
      } else if (type === 'escalation_director') {
        subject = `🔴 [24h Overdue Escalation] Studio Director intervention required for ${job?.id}`;
      } else if (type === 'escalation_gm') {
        subject = `⛔ [72h Critical GM Escalation] Deliverable 3 Days Overdue: GM Executive Intervention for ${job?.id}`;
      } else if (type === 'overdue') {
        subject = `🚨 [URGENT OVERDUE] ${job?.id}: ${job?.title} has passed delivery deadline`;
      } else if (type === 'debrief_ready') {
        subject = `📋 [Debrief Ready] ${job?.id} (${brandName}) material prepared for squad debrief`;
      } else if (type === 'assignment') {
        subject = `🎯 [Task Assignment] You have been allocated to ${job?.id} (${brandName})`;
      } else {
        subject = `🏆 [Agency Honor] Efficiency & Craft Award conferred by Management`;
      }
    }

    if (!previewBody) {
      if (type === 'nearly_due') {
        previewBody = `Deliverable [${job?.id}] for ${brandName} is scheduled for delivery on ${job?.dueDate ? new Date(job.dueDate).toLocaleString() : 'soon'}. Please finalize work files and submit for internal review to maintain on-time rating.`;
      } else if (type === 'due_now') {
        previewBody = `Deliverable [${job?.id}] for ${brandName} has reached its scheduled deadline. Please push your work files to your direct superior for review.`;
      } else if (type === 'traffic_prompt') {
        previewBody = `Kwame, Deliverable [${job?.id}] for ${brandName} is 1 hour overdue. Please prompt the assignee immediately to confirm submission timeline.`;
      } else if (type === 'escalation_lead') {
        previewBody = `Deliverable [${job?.id}] for ${brandName} is 3 hours overdue. Immediate team lead check-in required.`;
      } else if (type === 'escalation_director') {
        previewBody = `Elena, Deliverable [${job?.id}] for ${brandName} is 24 hours overdue. Studio Director bottleneck intervention required.`;
      } else if (type === 'escalation_gm') {
        previewBody = `Marcus, Deliverable [${job?.id}] for ${brandName} is 3 DAYS overdue. General Manager executive escalation triggered.`;
      } else if (type === 'overdue') {
        previewBody = `Deliverable [${job?.id}] for ${brandName} is past its due date. Traffic Manager Kwame Mensah and your Team Manager have been alerted to assist with resolution or deadline calibration.`;
      } else if (type === 'debrief_ready') {
        previewBody = `Client Service has finalized the debrief pack and asset specs for [${job?.id}] (${brandName}). Traffic Lead Kwame Mensah has been notified to schedule the brand squad debrief meeting.`;
      } else if (type === 'assignment') {
        previewBody = `You have been allocated to deliver [${job?.id}] for ${brandName}. Prescribed effort is ${job?.estimatedHours || 16} hours. Review specifications and proceed.`;
      } else {
        previewBody = `Congratulations on your efficiency and dedication to studio craft. Management has recorded this honor in your formal record.`;
      }
    }

    const newAlert: EmailAlertItem = {
      id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: job?.id || jobId,
      jobTitle: job?.title || 'Agency Deliverable',
      brandName,
      recipientEmail: recipient.email || `${recipient.id}@tibule.com`,
      recipientName: recipient.name,
      recipientRole: recipient.jobTitle,
      subject,
      type,
      sentAt: nowIso,
      previewBody,
      status: 'delivered',
      escalationTier,
      hoursOverdue
    };

    setEmailAlerts((prev) => [newAlert, ...prev]);

    // Also record in job's email history
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            emailAlertHistory: [newAlert, ...(j.emailAlertHistory || [])]
          };
        }
        return j;
      })
    );

    logAuditEvent(
      'EMAIL_ALERT_DISPATCHED',
      jobId,
      job?.title || 'Deliverable',
      undefined,
      type,
      `Dispatched email to ${recipient.name} (${recipient.email}) with subject: "${subject}"`
    );
  }, [jobs, users, logAuditEvent]);

  const markNotificationRead = useCallback((id: string) => {
    setWebNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setWebNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setWebNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const promptAssignee = useCallback((jobId: string, customNote?: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const assignee = users.find((u) => u.id === targetJob.assigneeId);
    const assigneeName = assignee?.name || 'Assignee';
    const note = customNote || `Kwame Mensah (Traffic Lead) has prompted for an immediate deliverable status check and submission ETA on ${targetJob.id}.`;

    // Update job with prompt notes
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            lastPromptedAt: new Date().toISOString(),
            promptNotes: note
          };
        }
        return j;
      })
    );

    // Push web notification to assignee
    if (assignee) {
      const newNotif: WebNotificationItem = {
        id: `web-prompt-${Date.now()}`,
        recipientId: assignee.id,
        recipientRole: assignee.role,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        brandName: targetJob.requestor || 'Client Brand',
        title: `⚠️ Traffic Lead Prompt: ${targetJob.id} Status Check`,
        message: note,
        type: 'traffic_nudge_received',
        escalationStage: 'overdue_1h_traffic',
        createdAt: new Date().toISOString(),
        read: false,
        actionLabel: 'Push to Superior for Review',
        actionType: 'push_to_review',
        severity: 'warning'
      };
      setWebNotifications((prev) => [newNotif, ...prev]);
    }

    // Send email alert to assignee
    sendEmailAlert(
      targetJob.id,
      'traffic_prompt',
      targetJob.assigneeId,
      `⚠️ [TRAFFIC PROMPT] Kwame Mensah requested submission status on ${targetJob.id}`,
      `Chale ${assigneeName}, Kwame Mensah (Traffic Lead) has prompted you regarding ${targetJob.id} (${targetJob.title}). ${note} Please submit for review immediately or declare dependencies to prevent higher-tier escalation.`,
      'overdue_1h_traffic',
      1.5
    );

    logAuditEvent(
      'TRAFFIC_PROMPT_SENT',
      targetJob.id,
      targetJob.title,
      undefined,
      'prompt_sent',
      `Traffic prompt dispatched to ${assigneeName} by ${currentUser.name}: "${note}"`
    );
  }, [jobs, users, currentUser, sendEmailAlert, logAuditEvent]);

  const pushDeliverableToSuperior = useCallback((jobId: string, note?: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const assignee = users.find((u) => u.id === targetJob.assigneeId);
    const { directSuperior, director } = getLeadershipChain(assignee, users);
    const superiorToAlert = directSuperior || director;

    // Update job workflow stage to internal review
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'in_progress',
            workflowStage: 'internal_review',
            deliverableSubmission: {
              submittedDate: new Date().toISOString(),
              submittedBy: currentUser.id,
              submitterName: currentUser.name,
              summary: note || `Deliverable pushed to superior review by ${currentUser.name}.`,
              fileLinks: ['https://drive.agency.tibule/deliverables/' + j.id + '_review_v1.zip']
            }
          };
        }
        return j;
      })
    );

    // Create web notification for superior
    if (superiorToAlert) {
      const newNotif: WebNotificationItem = {
        id: `web-review-${Date.now()}`,
        recipientId: superiorToAlert.id,
        recipientRole: superiorToAlert.role,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        brandName: targetJob.requestor || 'Client Brand',
        title: `🔔 Review Required: ${targetJob.id} Submitted`,
        message: `${currentUser.name} has pushed deliverable ${targetJob.id} (${targetJob.title}) to you for superior review.`,
        type: 'pushed_to_review',
        escalationStage: 'due_now',
        createdAt: new Date().toISOString(),
        read: false,
        actionLabel: 'Review Deliverable',
        actionType: 'open_job',
        severity: 'info'
      };
      setWebNotifications((prev) => [newNotif, ...prev]);

      // Send email alert to superior
      sendEmailAlert(
        targetJob.id,
        'due_now',
        superiorToAlert.id,
        `🔔 [Review Required] ${targetJob.id}: Work submitted for superior review by ${currentUser.name}`,
        `${superiorToAlert.name}, deliverable [${targetJob.id}] (${targetJob.title}) for ${targetJob.requestor} has been pushed to you for superior review by ${currentUser.name}. Please review files and approve or provide revert notes.`,
        'due_now',
        0
      );
    }

    logAuditEvent(
      'PUSHED_TO_SUPERIOR_REVIEW',
      targetJob.id,
      targetJob.title,
      targetJob.workflowStage,
      'internal_review',
      `Pushed to superior (${superiorToAlert?.name || 'Management'}) for review by ${currentUser.name}`
    );
  }, [jobs, users, currentUser, sendEmailAlert, logAuditEvent]);

  const triggerEscalationScan = useCallback(() => {
    let dispatchedEmails = 0;
    let dispatchedWebNotifs = 0;

    jobs.forEach((job) => {
      const evalResult = evaluateDeliverableEscalation(job, users, nearlyDueWarningHours);
      if (evalResult.stage !== 'on_track') {
        evalResult.webNotificationPayloads.forEach((p) => {
          const exists = webNotifications.some(
            (n) => n.jobId === job.id && n.recipientId === p.recipientId && n.escalationStage === evalResult.stage
          );
          if (!exists) {
            const newNotif: WebNotificationItem = {
              id: `web-scan-${job.id}-${p.recipientId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              recipientId: p.recipientId,
              recipientRole: p.recipientRole,
              jobId: job.id,
              jobTitle: job.title,
              brandName: job.requestor || 'Client Brand',
              title: p.title,
              message: p.message,
              type:
                evalResult.stage === 'nearly_due'
                  ? 'nearly_due'
                  : evalResult.stage === 'due_now'
                  ? 'due_now'
                  : evalResult.stage === 'overdue_1h_traffic'
                  ? 'traffic_prompt'
                  : evalResult.stage === 'overdue_3h_lead'
                  ? 'escalation_lead'
                  : evalResult.stage === 'overdue_24h_director'
                  ? 'escalation_director'
                  : 'escalation_gm',
              escalationStage: evalResult.stage,
              createdAt: new Date().toISOString(),
              read: false,
              hoursOverdue: Math.max(0, Math.round(evalResult.overdueHours)),
              actionLabel: p.actionLabel,
              actionType: p.actionType,
              severity: p.severity
            };
            setWebNotifications((prev) => [newNotif, ...prev]);
            dispatchedWebNotifs++;
          }
        });

        evalResult.emailNotificationPayloads.forEach((eml) => {
          const exists = emailAlerts.some(
            (e) => e.jobId === job.id && e.recipientEmail === eml.recipient.email && e.type === eml.type
          );
          if (!exists) {
            sendEmailAlert(
              job.id,
              eml.type,
              eml.recipient.id,
              eml.subject,
              eml.previewBody,
              evalResult.stage,
              Math.round(evalResult.overdueHours)
            );
            dispatchedEmails++;
          }
        });
      }
    });

    return { dispatchedEmails, dispatchedWebNotifs };
  }, [jobs, users, nearlyDueWarningHours, webNotifications, emailAlerts, sendEmailAlert]);

  const markDebriefReady = useCallback((jobId: string, material: DebriefMaterial) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updatedJob: Job = {
            ...job,
            debriefMaterial: material,
            workflowStage: 'debrief_ready',
            status: 'unassigned'
          };
          return updatedJob;
        }
        return job;
      })
    );

    logAuditEvent(
      'DEBRIEF_MATERIAL_READY',
      jobId,
      'Deliverable Debrief',
      'debrief_prep',
      'debrief_ready',
      `Client Service completed debrief pack "${material.deckTitle}". Traffic Manager Kwame Mensah alerted to call squad debrief.`
    );

    // Automated notification to Traffic Manager
    sendEmailAlert(jobId, 'debrief_ready', 'usr-kwame-mensah');
  }, [logAuditEvent, sendEmailAlert]);

  const callDebriefMeeting = useCallback((
    jobId: string,
    scheduledDate?: string,
    invitedAttendeeIds?: string[],
    discussionNotes?: string
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          // Identify compulsory CS submitter
          const csSubmitter = users.find((u) => u.name === job.debriefMaterial?.preparedByName || u.id === job.debriefMaterial?.preparedBy) ||
            users.find((u) => u.role === 'client_service') ||
            users[0];

          // Creative Director / Lead
          const cdLead = users.find((u) => u.role === 'director' || u.role === 'manager') || users[0];

          // Creative staff invited
          const staffIds = invitedAttendeeIds && invitedAttendeeIds.length > 0
            ? invitedAttendeeIds
            : ['usr-amara-okafor', 'usr-kofi-mensah'];

          const attendeesList = [
            {
              userId: csSubmitter.id,
              name: csSubmitter.name,
              role: 'Client Services (Debrief Submitter)',
              isCompulsory: true,
              isPresent: true
            },
            {
              userId: cdLead.id,
              name: cdLead.name,
              role: 'Creative Director / Lead',
              isCompulsory: true,
              isPresent: true
            },
            ...staffIds.filter((id) => id !== csSubmitter.id && id !== cdLead.id).map((id) => {
              const u = users.find((user) => user.id === id);
              return {
                userId: id,
                name: u?.name || 'Creative Specialist',
                role: u?.jobTitle || 'Creative Specialist',
                isCompulsory: false,
                isPresent: true
              };
            })
          ];

          const meetingInfo: DebriefMeetingInfo = {
            scheduledDate: scheduledDate || new Date(Date.now() + 3600000 * 2).toISOString(),
            status: 'scheduled',
            calledByRole: (currentUser.role === 'director' || currentUser.role === 'manager') ? 'creative_director' : 'traffic_manager',
            calledByUserId: currentUser.id,
            calledByName: currentUser.name,
            compulsoryCsSubmitterId: csSubmitter.id,
            compulsoryCsSubmitterName: csSubmitter.name,
            calendarEventScheduled: true,
            calendarEventTitle: `Team Debrief: ${job.title}`,
            calendarEventTime: scheduledDate || 'Today at 2:00 PM',
            attendees: attendeesList,
            discussionNotes: discussionNotes || `Debrief convened with Client Service (${csSubmitter.name}) and called creative staff.`,
            creativeDirectorOrManagerId: cdLead.id,
            prescribedHours: job.estimatedHours || 16,
            prescribedHoursRationale: 'Prescribed during debrief alignment.',
            teamUnderstandsTask: true
          };

          return {
            ...job,
            debriefMeeting: meetingInfo,
            workflowStage: 'debrief_meeting'
          };
        }
        return job;
      })
    );

    logAuditEvent(
      'DEBRIEF_MEETING_CALLED',
      jobId,
      'Debrief Meeting',
      'debrief_ready',
      'debrief_meeting',
      `${currentUser.name} called debrief meeting. Added compulsory Client Services submitter and invited creative staff. Calendar event dispatched.`
    );
  }, [users, currentUser, logAuditEvent]);

  const completeDebriefMeeting = useCallback((
    jobId: string,
    discussionNotes: string,
    prescribedHours: number,
    rationale: string,
    meetingInfoPartial?: Partial<DebriefMeetingInfo>
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const currentMeeting = job.debriefMeeting || {
            scheduledDate: new Date().toISOString(),
            status: 'completed',
            calledByRole: 'traffic_manager',
            attendees: [],
            discussionNotes,
            creativeDirectorOrManagerId: currentUser.id,
            prescribedHours,
            prescribedHoursRationale: rationale,
            teamUnderstandsTask: true
          };

          const updatedMeeting: DebriefMeetingInfo = {
            ...currentMeeting,
            ...meetingInfoPartial,
            discussionNotes,
            prescribedHours,
            prescribedHoursRationale: rationale,
            status: 'completed',
            completedAt: new Date().toISOString()
          };

          return {
            ...job,
            debriefMeeting: updatedMeeting,
            estimatedHours: prescribedHours,
            workflowStage: 'creative_brainstorm' // Transitions to Strategy & Brainstorming stage!
          };
        }
        return job;
      })
    );

    logAuditEvent(
      'DEBRIEF_COMPLETED_ADVANCED_TO_BRAINSTORM',
      jobId,
      'Debrief Alignment',
      'debrief_meeting',
      'creative_brainstorm',
      `Debrief complete. Scope codified (${prescribedHours}h). Advancing to Strategy & Brainstorming session.`
    );
  }, [currentUser, logAuditEvent]);

  const completeStrategyMeeting = useCallback((
    jobId: string,
    strategyInfo: {
      agreedCreativeAngle: string;
      strategyNotes: string;
      complexity: Complexity;
      estimatedHours: number;
      deliverablesBreakdownNotes?: string;
    }
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const strategyRecord: StrategyMeetingInfo = {
            scheduledDate: new Date().toISOString(),
            status: 'completed',
            facilitatorId: currentUser.id,
            facilitatorName: currentUser.name,
            compulsoryCsSubmitterId: job.debriefMeeting?.compulsoryCsSubmitterId,
            compulsoryCsSubmitterName: job.debriefMeeting?.compulsoryCsSubmitterName,
            calendarEventScheduled: true,
            calendarEventTime: 'Completed Today',
            attendees: job.debriefMeeting?.attendees || [],
            strategyNotes: strategyInfo.strategyNotes,
            agreedCreativeAngle: strategyInfo.agreedCreativeAngle,
            deliverablesBreakdownNotes: strategyInfo.deliverablesBreakdownNotes,
            taskComplexityConfirmed: strategyInfo.complexity,
            estimatedEffortHours: strategyInfo.estimatedHours,
            completedAt: new Date().toISOString(),
            completedBy: currentUser.name
          };

          return {
            ...job,
            strategyMeeting: strategyRecord,
            complexity: strategyInfo.complexity,
            estimatedHours: strategyInfo.estimatedHours,
            workflowStage: 'traffic_assignment' // Transitions to Traffic Staff Allocation!
          };
        }
        return job;
      })
    );

    logAuditEvent(
      'CREATIVE_STRATEGY_COMPLETED',
      jobId,
      'Strategy & Brainstorm',
      'creative_brainstorm',
      'traffic_assignment',
      `Strategy & Brainstorm session completed. Angle: "${strategyInfo.agreedCreativeAngle.slice(0, 50)}...". Advancing to Staff Allocation.`
    );
  }, [currentUser, logAuditEvent]);

  const clientServiceDispatchViaEmail = useCallback((
    jobId: string,
    dispatchInfo: ClientEmailDispatchInfo
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent(
            'SENT_TO_CLIENT_VIA_WORK_EMAIL',
            jobId,
            job.title,
            'client_service_handoff',
            'client_review',
            `Client Service (${dispatchInfo.senderName}) dispatched deliverable to client (${dispatchInfo.recipientEmail}) via work email. Subject: "${dispatchInfo.subject}". Materials: ${dispatchInfo.materialsIncluded.join(', ')}`
          );

          logOperationalEvent({
            eventType: 'client_submitted',
            jobId,
            jobTitle: job.title,
            cycleNumber: job.activeCycleNumber || 1,
            summary: `Dispatched to client via work email (${dispatchInfo.recipientEmail})`,
            impact: 'neutral'
          });

          return {
            ...job,
            clientEmailDispatch: dispatchInfo,
            workflowStage: 'client_review',
            status: 'in_review'
          };
        }
        return job;
      })
    );
  }, [logAuditEvent, logOperationalEvent]);

  const completeDebriefAndAssign = useCallback((
    jobId: string,
    meetingInfo: DebriefMeetingInfo,
    assigneeId: string,
    seniority: SeniorityLevel,
    prescribedHours: number
  ) => {
    const targetStaff = users.find((u) => u.id === assigneeId);

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updatedJob: Job = {
            ...job,
            debriefMeeting: meetingInfo,
            assigneeId,
            assignedSeniority: seniority,
            estimatedHours: prescribedHours,
            workflowStage: 'in_production',
            status: 'assigned',
            assignedDate: new Date().toISOString()
          };
          return updatedJob;
        }
        return job;
      })
    );

    logAuditEvent(
      'DEBRIEF_COMPLETED_AND_ASSIGNED',
      jobId,
      'Debrief Execution',
      'debrief_meeting',
      'in_production',
      `Debrief complete. Manager prescribed ${prescribedHours}h. Traffic assigned to ${targetStaff?.name || assigneeId} ${meetingInfo.assignedToManagerDirectly ? '(Direct Manager Handling)' : ''}`
    );

    // Send assignment notification email to staff
    sendEmailAlert(jobId, 'assignment', assigneeId);
  }, [users, logAuditEvent, sendEmailAlert]);

  const trafficAssignJob = useCallback((
    jobId: string,
    assigneeId: string,
    assignedToManagerDirectly?: boolean,
    managerDirectAssignReason?: string,
    dueDate?: string
  ) => {
    const targetStaff = users.find((u) => u.id === assigneeId);

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            assigneeId,
            workflowStage: 'in_production',
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            dueDate: dueDate || job.dueDate
          };
        }
        return job;
      })
    );

    logAuditEvent(
      'TRAFFIC_ALLOCATED_JOB',
      jobId,
      'Task Allocation',
      'traffic_assignment',
      'in_production',
      `Traffic assigned task to ${targetStaff?.name || assigneeId}${assignedToManagerDirectly ? ` (Team Manager: ${managerDirectAssignReason})` : ''}`
    );

    sendEmailAlert(jobId, 'assignment', assigneeId);
  }, [users, logAuditEvent, sendEmailAlert]);

  const awardReward = useCallback((rewardData: Omit<EfficiencyReward, 'id'>) => {
    const newReward: EfficiencyReward = {
      ...rewardData,
      id: `rew-${Date.now()}`
    };

    setEfficiencyRewards((prev) => [newReward, ...prev]);

    // Boost points in leaderboard
    setEfficiencyLeaderboard((prev) =>
      prev.map((entry) => {
        if (entry.employeeId === rewardData.employeeId) {
          return {
            ...entry,
            points: entry.points + 250,
            activeStreak: entry.activeStreak + 1
          };
        }
        return entry;
      })
    );

    logAuditEvent(
      'EFFICIENCY_REWARD_CONFERRED',
      rewardData.employeeId,
      rewardData.rewardTitle,
      undefined,
      rewardData.prize,
      `Management awarded ${rewardData.rewardTitle} to ${rewardData.employeeName}. Commendation: "${rewardData.rewardDescription}"`
    );
  }, [logAuditEvent]);

  // Strategic Recognition & Verified Impact Methods
  const openLogContributionModal = useCallback((jobId?: string) => {
    setLogContributionTargetJobId(jobId || null);
    setIsLogContributionModalOpen(true);
  }, []);

  const closeLogContributionModal = useCallback(() => {
    setIsLogContributionModalOpen(false);
    setLogContributionTargetJobId(null);
  }, []);

  const logContribution = useCallback((data: {
    nomineeId?: string;
    category: ContributionCategory;
    title: string;
    description: string;
    impactStatement: string;
    relatedJobId?: string;
    taskId?: string;
    workCycleId?: string;
    contributionDate?: string;
    timeContext?: StrategicContribution['timeContext'];
    evidenceLinks?: string[];
    evidenceAttachments?: string[];
    attributes?: StrategicContribution['attributes'];
  }) => {
    const targetJob = jobs.find((j) => j.id === data.relatedJobId);
    const dateStr = data.contributionDate || new Date().toISOString().split('T')[0];

    const nominee = data.nomineeId ? users.find((u) => u.id === data.nomineeId) || currentUser : currentUser;
    const isNomination = nominee.id !== currentUser.id;
    const isManagerOrLead =
      currentUser.role === 'manager' ||
      currentUser.role === 'director' ||
      currentUser.role === 'team_lead' ||
      currentUser.role === 'general_manager' ||
      currentUser.role === 'admin';

    const newContrib: StrategicContribution = {
      id: `contrib-${Date.now()}`,
      employeeId: nominee.id,
      employeeName: nominee.name,
      employeeRole: nominee.role,
      department: nominee.department,
      category: data.category,
      title: data.title,
      description: data.description,
      impactStatement: data.impactStatement,
      relatedJobId: data.relatedJobId,
      relatedJobTitle: targetJob?.title,
      brandName: targetJob?.brandName || targetJob?.requestor,
      taskId: data.taskId,
      workCycleId: data.workCycleId,
      contributionDate: dateStr,
      timeContext: data.timeContext,
      evidenceLinks: data.evidenceLinks,
      evidenceAttachments: data.evidenceAttachments,
      status: isManagerOrLead && isNomination ? 'VERIFIED' : 'SUBMITTED',
      verifiedAt: isManagerOrLead && isNomination ? new Date().toISOString() : undefined,
      verifiedBy: isManagerOrLead && isNomination ? currentUser.id : undefined,
      verifiedByName: isManagerOrLead && isNomination ? currentUser.name : undefined,
      submittedAt: new Date().toISOString(),
      attributes: {
        ...data.attributes,
        urgencyContext: isNomination
          ? `Endorsed/Nominated by ${currentUser.name} (${currentUser.jobTitle})`
          : data.attributes?.urgencyContext
      }
    };

    setContributions((prev) => [newContrib, ...prev]);

    // If Exceptional Effort with hours, synchronize actual hours on the job if applicable
    if (data.category === 'exceptional_effort' && data.timeContext?.durationHours && targetJob) {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === data.relatedJobId) {
            return {
              ...j,
              actualHours: (j.actualHours || 0) + (data.timeContext?.durationHours || 0)
            };
          }
          return j;
        })
      );
    }

    logAuditEvent(
      'CONTRIBUTION_LOGGED',
      data.relatedJobId || nominee.id,
      data.title,
      undefined,
      data.category.replace('_', ' ').toUpperCase(),
      isNomination
        ? `${currentUser.name} submitted strategic recognition nomination for ${nominee.name} [${data.category.replace('_', ' ')}]: "${data.title}". Impact: "${data.impactStatement}"`
        : `${currentUser.name} recorded verified contribution [${data.category.replace('_', ' ')}]: "${data.title}". Impact: "${data.impactStatement}"`
    );

    if (data.category === 'exceptional_effort' && data.timeContext?.durationHours) {
      logAuditEvent(
        'EXCEPTIONAL_EFFORT_RECORDED',
        data.relatedJobId || nominee.id,
        targetJob?.title || 'Operational Work',
        undefined,
        `${data.timeContext.durationHours} hrs`,
        `Exceptional effort noted for ${nominee.name} (${data.timeContext.durationHours}h, ${data.timeContext.operatingContext.replace(/_/g, ' ')}). Context registered without overtime points.`
      );
    }

    closeLogContributionModal();
  }, [jobs, users, currentUser, logAuditEvent, closeLogContributionModal]);

  const verifyContribution = useCallback((id: string, note?: string) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'VERIFIED',
            verifiedAt: new Date().toISOString(),
            verifiedBy: currentUser.id,
            verifiedByName: currentUser.name,
            recognitionNote: note || c.recognitionNote
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_VERIFIED',
        target.relatedJobId || target.employeeId,
        target.title,
        target.status,
        'VERIFIED',
        `${currentUser.name} (${currentUser.jobTitle}) verified ${target.employeeName}'s contribution [${target.category}]. ${note ? `Note: "${note}"` : ''}`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const requestClarification = useCallback((id: string, question: string) => {
    const newClarification: ContributionClarification = {
      id: `clr-${Date.now()}`,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      requestedByRole: currentUser.jobTitle,
      question,
      requestedAt: new Date().toISOString()
    };

    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'CLARIFICATION_REQUIRED',
            clarifications: [newClarification, ...(c.clarifications || [])]
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_CLARIFICATION_REQUESTED',
        target.relatedJobId || target.employeeId,
        target.title,
        target.status,
        'CLARIFICATION_REQUIRED',
        `${currentUser.name} requested clarification on ${target.employeeName}'s contribution: "${question}"`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const respondToClarification = useCallback((id: string, response: string) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedClarifications = (c.clarifications || []).map((clr, idx) =>
            idx === 0 ? { ...clr, response, respondedAt: new Date().toISOString() } : clr
          );
          return {
            ...c,
            status: 'SUBMITTED',
            clarifications: updatedClarifications
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_UPDATED',
        target.relatedJobId || target.employeeId,
        target.title,
        'CLARIFICATION_REQUIRED',
        'SUBMITTED',
        `${currentUser.name} responded to contribution clarification: "${response}"`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const recogniseContribution = useCallback((id: string, recognitionNote?: string) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'RECOGNISED',
            recognisedAt: new Date().toISOString(),
            recognisedBy: currentUser.id,
            recognisedByName: currentUser.name,
            recognitionNote: recognitionNote || c.recognitionNote
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_RECOGNISED',
        target.relatedJobId || target.employeeId,
        target.title,
        target.status,
        'RECOGNISED',
        `${currentUser.name} formally recognised ${target.employeeName}'s contribution [${target.category}]. Commendation: "${recognitionNote || 'Excellence in agency contribution'}"`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const declineContribution = useCallback((id: string, reason: string) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'DECLINED',
            declineReason: reason
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_DECLINED',
        target.relatedJobId || target.employeeId,
        target.title,
        target.status,
        'DECLINED',
        `${currentUser.name} declined contribution for ${target.employeeName}. Reason: "${reason}"`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const reopenContribution = useCallback((id: string) => {
    setContributions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'SUBMITTED',
            declineReason: undefined
          };
        }
        return c;
      })
    );

    const target = contributions.find((c) => c.id === id);
    if (target) {
      logAuditEvent(
        'CONTRIBUTION_UPDATED',
        target.relatedJobId || target.employeeId,
        target.title,
        target.status,
        'SUBMITTED',
        `${currentUser.name} reopened contribution for ${target.employeeName} for further executive review.`
      );
    }
  }, [currentUser, contributions, logAuditEvent]);

  const getUserContributionSummary = useCallback((userId: string) => {
    const userContribs = contributions.filter((c) => c.employeeId === userId);
    const byCategory: Record<ContributionCategory, number> = {
      exceptional_delivery: 0,
      client_impact: 0,
      collaboration: 0,
      craft_quality: 0,
      process_improvement: 0,
      operational_support: 0,
      exceptional_effort: 0
    };

    let exceptionalEffortHours = 0;
    let verifiedCount = 0;
    let recognisedCount = 0;
    let clarificationCount = 0;

    userContribs.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (c.status === 'VERIFIED') verifiedCount++;
      if (c.status === 'RECOGNISED') {
        verifiedCount++;
        recognisedCount++;
      }
      if (c.status === 'CLARIFICATION_REQUIRED') clarificationCount++;
      if (c.category === 'exceptional_effort' && c.timeContext?.durationHours) {
        exceptionalEffortHours += c.timeContext.durationHours;
      }
    });

    return {
      totalContributions: userContribs.length,
      byCategory,
      verifiedCount,
      recognisedCount,
      clarificationCount,
      exceptionalEffortHours: Math.round(exceptionalEffortHours * 10) / 10,
      contributions: userContribs
    };
  }, [contributions]);

  // Backward-compatible Overtime & Strategic Recognition Methods (Aliased to contribution modal)
  const openLogOvertimeModal = useCallback((jobId?: string) => {
    openLogContributionModal(jobId);
  }, [openLogContributionModal]);

  const closeLogOvertimeModal = useCallback(() => {
    closeLogContributionModal();
  }, [closeLogContributionModal]);

  const logOvertime = useCallback((entry: {
    jobId: string;
    period: OvertimePeriod;
    date: string;
    startTime: string;
    endTime: string;
    hoursLogged: number;
    materialNote: string;
  }) => {
    logContribution({
      category: 'exceptional_effort',
      title: entry.materialNote.slice(0, 60),
      description: entry.materialNote,
      impactStatement: 'Contributed focused effort under operational urgency.',
      relatedJobId: entry.jobId,
      contributionDate: entry.date,
      timeContext: {
        startTime: entry.startTime,
        endTime: entry.endTime,
        durationHours: entry.hoursLogged,
        operatingContext: entry.period === 'weekend_crunch' ? 'weekend' : 'outside_standard_hours'
      }
    });
  }, [logContribution]);

  const acknowledgeOvertime = useCallback((logId: string, note?: string) => {
    const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
    if (isGM) {
      recogniseContribution(logId, note || 'Endorsed by General Manager into permanent recognition dossier.');
    } else {
      verifyContribution(logId, note || 'Verified by Studio Manager.');
    }
  }, [currentUser, verifyContribution, recogniseContribution]);

  const getUserOvertimeSummary = useCallback((userId: string) => {
    const summary = getUserContributionSummary(userId);
    const pts = summary.verifiedCount * 10;
    return {
      totalHours: summary.exceptionalEffortHours,
      pre9amHours: 0,
      post5pmHours: summary.exceptionalEffortHours,
      weekendHours: 0,
      count: summary.totalContributions,
      recognitionPoints: pts,
      acknowledgedCount: summary.verifiedCount,
      logs: overtimeLogs.filter(l => l.userId === userId)
    };
  }, [getUserContributionSummary, overtimeLogs]);

  const logDeliveryImpact = useCallback((data: Omit<DeliveryImpactLog, 'id' | 'createdAt' | 'status'>) => {
    const newId = `impact-${Date.now().toString().slice(-5)}`;
    const newLog: DeliveryImpactLog = {
      ...data,
      id: newId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setDeliveryImpactLogs((prev) => [newLog, ...prev]);

    // Update affected job if specified
    if (data.jobId) {
      setJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.id === data.jobId) {
            return {
              ...j,
              isAtRisk: true,
              timelineShiftReason: data.impactDescription,
              latestDeliveryImpact: newLog,
              deliveryImpactLogs: [newLog, ...(j.deliveryImpactLogs || [])]
            };
          }
          return j;
        })
      );
    }

    const delayHours = data.estimatedDelayHours || data.estimatedDelayDays * 8;

    logAuditEvent(
      'DELIVERY_IMPACT_LOGGED',
      data.jobId || 'GENERAL',
      data.jobTitle || 'Delivery Risk',
      'ON_TRACK',
      'AT_RISK',
      `[${data.category.toUpperCase()}] +${delayHours}h extension requested (${data.estimatedDelayDays}d): ${data.impactDescription}`
    );

    logOperationalEvent({
      eventType: 'delivery_impact_logged',
      jobId: data.jobId || 'GENERAL',
      jobTitle: data.jobTitle,
      summary: `Delivery extension requested by ${currentUser.name} (+${delayHours}h / ${data.estimatedDelayDays}d): ${data.impactDescription}`,
      impact: 'congested',
      hoursImpact: delayHours
    });
  }, [currentUser, logAuditEvent, logOperationalEvent]);

  const acknowledgeDeliveryImpact = useCallback((logId: string, notes?: string) => {
    setDeliveryImpactLogs((prev) =>
      prev.map((item) => {
        if (item.id === logId) {
          return {
            ...item,
            status: 'acknowledged',
            acknowledgedBy: currentUser.name,
            acknowledgedAt: new Date().toISOString(),
            resolutionNotes: notes || item.resolutionNotes
          };
        }
        return item;
      })
    );

    logOperationalEvent({
      eventType: 'delivery_impact_acknowledged',
      jobId: 'GENERAL',
      summary: `Delivery impediment risk acknowledged by ${currentUser.name}`,
      impact: 'neutral'
    });
  }, [currentUser, logOperationalEvent]);

  const resolveDeliveryImpact = useCallback((logId: string, resolutionNotes?: string) => {
    setDeliveryImpactLogs((prev) =>
      prev.map((item) => {
        if (item.id === logId) {
          return {
            ...item,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolutionNotes: resolutionNotes || 'Resolved by lead/staff'
          };
        }
        return item;
      })
    );

    logOperationalEvent({
      eventType: 'delivery_impact_resolved',
      jobId: 'GENERAL',
      summary: `Delivery impediment resolved by ${currentUser.name}: ${resolutionNotes || 'Cleared'}`,
      impact: 'neutral'
    });
  }, [currentUser, logOperationalEvent]);

  const grantDeadlineExtension = useCallback((logId: string, revisedDueDate: string) => {
    const targetLog = deliveryImpactLogs.find((l) => l.id === logId);
    if (!targetLog) return;

    setDeliveryImpactLogs((prev) =>
      prev.map((item) => {
        if (item.id === logId) {
          return {
            ...item,
            status: 'mitigated',
            acknowledgedBy: currentUser.name,
            acknowledgedAt: new Date().toISOString(),
            resolutionNotes: `Deadline extended to ${new Date(revisedDueDate).toLocaleDateString()}`
          };
        }
        return item;
      })
    );

    if (targetLog.jobId) {
      setJobs((prevJobs) =>
        prevJobs.map((j) => {
          if (j.id === targetLog.jobId) {
            return {
              ...j,
              dueDate: revisedDueDate,
              isAtRisk: false,
              timelineShiftReason: `Approved extension: ${targetLog.impactDescription}`
            };
          }
          return j;
        })
      );
    }

    logOperationalEvent({
      eventType: 'deadline_changed',
      jobId: targetLog.jobId || 'GENERAL',
      jobTitle: targetLog.jobTitle,
      summary: `Deadline officially extended to ${new Date(revisedDueDate).toLocaleDateString()} following impediment review`,
      impact: 'neutral'
    });
  }, [deliveryImpactLogs, currentUser, logOperationalEvent]);

  // Client Services Operating Model Actions
  const assignEmployeeDiscipline = useCallback((assignment: Omit<EmployeeDisciplineAssignment, 'id'>) => {
    const newAssignment: EmployeeDisciplineAssignment = {
      ...assignment,
      id: `cda-${Date.now()}`
    };
    setDisciplineAssignments((prev) => [...prev, newAssignment]);
    logAuditEvent(
      'DISCIPLINE_ASSIGNED',
      assignment.employeeId,
      `Assigned to ${assignment.disciplineId}`,
      'NONE',
      assignment.proficiency,
      `${currentUser.name} assigned functional discipline [${assignment.disciplineId}] to ${assignment.employeeName} (${assignment.weeklyExecutionHours}h/wk planned effort).`
    );
  }, [currentUser, logAuditEvent]);

  const removeEmployeeDiscipline = useCallback((assignmentId: string) => {
    setDisciplineAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  }, []);

  const updateEmployeeDiscipline = useCallback((assignment: EmployeeDisciplineAssignment) => {
    setDisciplineAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? assignment : a))
    );
  }, []);

  const updateAccountCommitment = useCallback((commitment: CSAccountCommitment) => {
    setAccountCommitments((prev) => {
      const exists = prev.some((c) => c.id === commitment.id);
      if (exists) {
        return prev.map((c) => (c.id === commitment.id ? commitment : c));
      }
      return [...prev, commitment];
    });
  }, []);

  const updateNSSProgressionDossier = useCallback((dossier: NSSProgressionDossier) => {
    setNssProgressionDossiers((prev) =>
      prev.map((d) => (d.employeeId === dossier.employeeId ? dossier : d))
    );
  }, []);

  const endorseNSSForPromotion = useCallback((employeeId: string, notes: string) => {
    setNssProgressionDossiers((prev) =>
      prev.map((d) => {
        if (d.employeeId === employeeId) {
          return {
            ...d,
            status: 'endorsed_for_ae',
            recommendation: 'ready_for_ae_promotion',
            executiveSponsorNote: notes
          };
        }
        return d;
      })
    );
    const target = users.find((u) => u.id === employeeId);
    if (target) {
      logAuditEvent(
        'NSS_PROMOTION_ENDORSED',
        employeeId,
        `Endorsement for AE: ${target.name}`,
        'nss_intern',
        'account_executive',
        `${currentUser.name} endorsed ${target.name} for promotion to Account Executive based on verified readiness dossier: "${notes}"`
      );
    }
  }, [users, currentUser, logAuditEvent]);

  // Client Services Timesheet & Stopwatch Handlers
  const startTimer = useCallback((config: {
    jobId: string;
    jobTitle: string;
    clientName: string;
    disciplineId: CSDisciplineId | 'account_management' | 'general_operations';
    description?: string;
  }) => {
    setActiveTimer({
      isRunning: true,
      startTime: Date.now(),
      jobId: config.jobId,
      jobTitle: config.jobTitle,
      clientName: config.clientName,
      disciplineId: config.disciplineId,
      description: config.description || '',
      elapsedSeconds: 0,
      userId: currentUser.id
    });
  }, [currentUser]);

  const stopTimer = useCallback((notes?: string): CSTimesheetEntry | null => {
    if (!activeTimer || !activeTimer.startTime) return null;
    const now = Date.now();
    const elapsedSeconds = Math.max(1, Math.floor((now - activeTimer.startTime) / 1000));
    const hours = Math.max(0.1, Math.round((elapsedSeconds / 3600) * 10) / 10);
    const today = new Date().toISOString().slice(0, 10);

    const newEntry: CSTimesheetEntry = {
      id: `cst-${Date.now()}`,
      userId: activeTimer.userId || currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.seniority || currentUser.jobTitle,
      department: 'client_services',
      jobId: activeTimer.jobId,
      jobTitle: activeTimer.jobTitle,
      clientName: activeTimer.clientName,
      disciplineId: activeTimer.disciplineId,
      date: today,
      hours,
      description: notes || activeTimer.description || 'Logged from live activity stopwatch',
      isBillable: true,
      loggedAt: new Date().toISOString(),
      source: 'live_timer'
    };

    setTimesheetEntries((prev) => [newEntry, ...prev]);
    setActiveTimer(null);

    // Recheck discrepancies
    setDiscrepancyAlerts((prevAlerts) => {
      const generated = evaluateCSDiscrepancies(
        [newEntry, ...timesheetEntries],
        jobs,
        users,
        disciplineAssignments
      );
      const existingIds = new Set(prevAlerts.map((a) => a.id));
      const newOnly = generated.filter((g) => !existingIds.has(g.id));
      return [...prevAlerts, ...newOnly];
    });

    logAuditEvent(
      'TIMESHEET_LOGGED_TIMER',
      newEntry.id,
      `${newEntry.jobTitle} (${hours}h)`,
      'ACTIVE',
      'COMMITTED',
      `${currentUser.name} stopped active timer and logged ${hours}h for ${newEntry.jobTitle}.`
    );

    return newEntry;
  }, [activeTimer, currentUser, timesheetEntries, jobs, users, disciplineAssignments, logAuditEvent]);

  const cancelTimer = useCallback(() => {
    setActiveTimer(null);
  }, []);

  const updateActiveTimerElapsed = useCallback((seconds: number) => {
    setActiveTimer((prev) => (prev ? { ...prev, elapsedSeconds: seconds } : null));
  }, []);

  const logTimesheetEntry = useCallback((entry: Omit<CSTimesheetEntry, 'id' | 'loggedAt'>) => {
    const newEntry: CSTimesheetEntry = {
      ...entry,
      id: `cst-${Date.now()}`,
      loggedAt: new Date().toISOString()
    };
    setTimesheetEntries((prev) => [newEntry, ...prev]);

    setDiscrepancyAlerts((prevAlerts) => {
      const generated = evaluateCSDiscrepancies(
        [newEntry, ...timesheetEntries],
        jobs,
        users,
        disciplineAssignments
      );
      const existingIds = new Set(prevAlerts.map((a) => a.id));
      const newOnly = generated.filter((g) => !existingIds.has(g.id));
      return [...prevAlerts, ...newOnly];
    });

    logAuditEvent(
      'TIMESHEET_LOGGED_MANUAL',
      newEntry.id,
      `${newEntry.jobTitle} (${newEntry.hours}h)`,
      'NONE',
      'LOGGED',
      `${currentUser.name} manually logged ${newEntry.hours}h on ${newEntry.date} for ${newEntry.jobTitle}.`
    );
  }, [currentUser, timesheetEntries, jobs, users, disciplineAssignments, logAuditEvent]);

  const updateTimesheetEntry = useCallback((entry: CSTimesheetEntry) => {
    setTimesheetEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? entry : e))
    );
  }, []);

  const deleteTimesheetEntry = useCallback((entryId: string) => {
    setTimesheetEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  const adjustTimesheetHours = useCallback((entryId: string, deltaHours: number) => {
    setTimesheetEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          const newHours = Math.max(0.25, Math.round((e.hours + deltaHours) * 10) / 10);
          return { ...e, hours: newHours };
        }
        return e;
      })
    );
  }, []);

  const reconcileDiscrepancy = useCallback((alertId: string, auditNotes: string, newStatus: DiscrepancyStatus = 'reconciled') => {
    setDiscrepancyAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: newStatus,
            auditNotes,
            reconciledBy: currentUser.id,
            reconciledByName: currentUser.name,
            reconciledAt: new Date().toISOString()
          };
        }
        return a;
      })
    );
    logAuditEvent(
      'DISCREPANCY_RECONCILED',
      alertId,
      'Discrepancy Audit',
      'flagged',
      newStatus,
      `${currentUser.name} audited and transitioned discrepancy status to [${newStatus}]: "${auditNotes}"`
    );
  }, [currentUser, logAuditEvent]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        isAuthenticated,
        setIsAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        teams,
        jobs,
        brands,
        emailAlerts,
        efficiencyLeaderboard,
        efficiencyRewards,
        isDeadlineRadarOpen,
        setIsDeadlineRadarOpen,
        comments,
        exceptions,
        cases,
        recognitions,
        auditEvents,
        appearancePreference,
        setAppearancePreference,
        theme,
        toggleTheme,
        activePaletteId,
        setActivePaletteId,
        currentPalette,
        isPaletteModalOpen,
        setIsPaletteModalOpen,
        isAnalystTipsOpen,
        setIsAnalystTipsOpen,
        isCopilotOpen,
        setIsCopilotOpen,
        isCloudSyncOpen,
        setIsCloudSyncOpen,
        activeView,
        setActiveView,
        selectedJobId,
        setSelectedJobId,
        selectedEmployeeId,
        setSelectedEmployeeId,
        metricTraceModal,
        setMetricTraceModal,
        isCommandBarOpen,
        setIsCommandBarOpen,
        isAuditDrawerOpen,
        setIsAuditDrawerOpen,
        isSidebarCollapsed,
        toggleSidebar,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        showOnboardingModal,
        setShowOnboardingModal,
        showBuildCaseModal,
        setShowBuildCaseModal,
        showCorrectionModal,
        setShowCorrectionModal,
        operationalEvents,
        logOperationalEvent,
        createJob,
        updateJobStatus,
        assignJob,
        reassignJob,
        unassignJob,
        indicateBlocker,
        resolveBlocker,
        addComment,
        createCase,
        updateCaseStatus,
        grantRecognition,
        createTeam,
        inviteUser,
        updateUserStatus,
        resolveException,
        rebalanceWorkload,
        employeeCapacities,
        logAuditEvent,
        submitBrief,
        trafficRouteBrief,
        managerAssignStaff,
        staffSubmitDeliverable,
        managerReviewDecision,
        clientServiceSendToClient,
        clientSubmitRevert,
        resolveRevertConflict,
        clientApproveDeliverable,
        markDebriefReady,
        callDebriefMeeting,
        completeDebriefMeeting,
        completeStrategyMeeting,
        clientServiceDispatchViaEmail,
        completeDebriefAndAssign,
        trafficAssignJob,
        sendEmailAlert,
        webNotifications,
        nearlyDueWarningHours,
        setNearlyDueWarningHours,
        promptAssignee,
        pushDeliverableToSuperior,
        triggerEscalationScan,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        awardReward,
        // Strategic Recognition & Verified Impact System
        contributions,
        isLogContributionModalOpen,
        setIsLogContributionModalOpen,
        logContributionTargetJobId,
        setLogContributionTargetJobId,
        openLogContributionModal,
        closeLogContributionModal,
        logContribution,
        verifyContribution,
        requestClarification,
        respondToClarification,
        recogniseContribution,
        declineContribution,
        reopenContribution,
        getUserContributionSummary,
        // Overtime & Recognition Logging
        overtimeLogs,
        isLogOvertimeModalOpen,
        setIsLogOvertimeModalOpen,
        logOvertimeTargetJobId,
        setLogOvertimeTargetJobId,
        openLogOvertimeModal,
        closeLogOvertimeModal,
        logOvertime,
        acknowledgeOvertime,
        getUserOvertimeSummary,
        isReportModalOpen,
        setIsReportModalOpen,
        reportTargetUserId,
        setReportTargetUserId,
        openReportModal,
        closeReportModal,
        // Traffic Year-Long Task Archive & OneDrive Backup
        archivedTasks,
        oneDriveConfig,
        oneDriveSyncBatches,
        syncTaskToOneDrive,
        syncQuarterToOneDrive,
        updateOneDriveConfig,
        triggerFullOneDriveBackup,
        // Home Date Filter across all profiles
        homeCalendarPeriod,
        setHomeCalendarPeriod,
        homeCustomDateRange,
        setHomeCustomDateRange,
        // Staff & Lead Deadline Delivery Impact Logging
        deliveryImpactLogs,
        isLogDeliveryImpactModalOpen,
        setIsLogDeliveryImpactModalOpen,
        logDeliveryImpactTargetJobId,
        setLogDeliveryImpactTargetJobId,
        openLogDeliveryImpactModal,
        closeLogDeliveryImpactModal,
        logDeliveryImpact,
        acknowledgeDeliveryImpact,
        resolveDeliveryImpact,
        grantDeadlineExtension,
        // Client Services Operating Model (The Two Dimensions & 9 Confirmed Disciplines)
        disciplineAssignments,
        assignEmployeeDiscipline,
        removeEmployeeDiscipline,
        updateEmployeeDiscipline,
        accountCommitments,
        updateAccountCommitment,
        nssProgressionDossiers,
        updateNSSProgressionDossier,
        endorseNSSForPromotion,
        // Client Services 40-Hour Capacity Baseline, Timesheets & Discrepancies
        timesheetEntries,
        activeTimer,
        discrepancyAlerts,
        startTimer,
        stopTimer,
        cancelTimer,
        updateActiveTimerElapsed,
        logTimesheetEntry,
        updateTimesheetEntry,
        deleteTimesheetEntry,
        adjustTimesheetHours,
        reconcileDiscrepancy
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
