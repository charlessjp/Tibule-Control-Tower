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
  ClientRevertInfo,
  Brand,
  DebriefMaterial,
  DebriefMeetingInfo,
  EmailAlertItem,
  EmailAlertType,
  DeliverableEscalationStage,
  WebNotificationItem,
  EfficiencyReward,
  EfficiencyLeaderboardEntry
} from '../types';
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
  INITIAL_AUDIT_EVENTS
} from '../mockData';
import { INITIAL_BRANDS } from '../data/brands';
import {
  INITIAL_LEADERBOARD,
  INITIAL_REWARDS,
  INITIAL_EMAIL_ALERTS
} from '../data/competitionData';
import { PALETTES, DEFAULT_PALETTE_ID, PaletteScheme } from '../theme/palettes';
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
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  showBuildCaseModal: boolean;
  setShowBuildCaseModal: (show: boolean) => void;
  showCorrectionModal: boolean;
  setShowCorrectionModal: (show: boolean) => void;
  // Actions
  createJob: (job: Omit<Job, 'id' | 'createdDate' | 'commentsCount' | 'attachmentsCount'>) => void;
  updateJobStatus: (jobId: string, status: JobStatus, reason?: string) => void;
  assignJob: (jobId: string, assigneeId: string) => void;
  reassignJob: (jobId: string, newAssigneeId: string, reason: string) => void;
  unassignJob: (jobId: string) => void;
  indicateBlocker: (jobId: string, blockerReason: string, dependency?: string) => void;
  resolveBlocker: (jobId: string) => void;
  addComment: (jobId: string, content: string) => void;
  createCase: (caseItem: Omit<ProgressionCase, 'id' | 'submissionDate'>) => void;
  updateCaseStatus: (caseId: string, status: ProgressionCase['status'], decision?: ProgressionCase['decision'], notes?: string) => void;
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
    dueDate?: string
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
    revisedHours?: number
  ) => void;
  clientServiceSendToClient: (jobId: string, clientContactEmail?: string) => void;
  clientSubmitRevert: (
    jobId: string,
    feedbackNotes: string,
    requestedChanges: string[],
    additionalHours?: number,
    urgency?: Priority
  ) => void;
  resolveRevertConflict: (
    jobId: string,
    resolution: 'queued' | 'paused_current' | 'reassigned' | 'split_timeline',
    targetAssigneeId?: string
  ) => void;
  clientApproveDeliverable: (jobId: string) => void;
  // Ghanaian Agency Updated Workflow & Debrief Engine
  markDebriefReady: (jobId: string, material: DebriefMaterial) => void;
  callDebriefMeeting: (jobId: string) => void;
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tibule_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
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

    // Halo Lighting Rings
    root.style.setProperty('--color-halo-border', pMode.accentPrimary);
    root.style.setProperty('--color-halo-glow', pMode.glowPrimary);
    root.style.setProperty('--color-halo-secondary', pMode.glowSecondary);

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
            '6': 'executive_brief',
            '7': 'visual_analytics',
            '8': 'manager_tower'
          };
        } else if (currentRole === 'traffic_manager') {
          viewMap = {
            '1': 'overview',
            '2': 'agency_workflow',
            '3': 'master_table',
            '4': 'team_traffic',
            '5': 'all_work',
            '6': 'manager_tower'
          };
        } else if (currentRole === 'client_service') {
          viewMap = {
            '1': 'overview',
            '2': 'agency_workflow',
            '3': 'master_table',
            '4': 'executive_brief',
            '5': 'all_work',
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
            '7': 'manager_tower'
          };
        } else {
          // Specialist / Production Employee
          viewMap = {
            '1': 'overview',
            '2': 'my_work',
            '3': 'evidence',
            '4': 'cases',
            '5': 'all_work'
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

  // Calculate capacity engine metrics
  const employeeCapacities = useMemo(() => {
    const calc: Record<string, EmployeeCapacityCalculation> = {};

    users.forEach((user) => {
      const userJobs = jobs.filter((j) => j.assigneeId === user.id && j.status !== 'completed');
      const assignedHours = userJobs.reduce((sum, j) => sum + (j.estimatedHours || 0), 0);
      const capHours = user.capacityHoursPerWeek || 38;
      const capacityPercent = Math.round((assignedHours / capHours) * 100);

      const blockedCount = userJobs.filter((j) => j.status === 'blocked').length;
      const dueSoonCount = userJobs.filter((j) => {
        const due = new Date(j.dueDate).getTime();
        const now = new Date('2026-09-14T09:30:00Z').getTime();
        return due - now < 48 * 3600 * 1000 && due >= now;
      }).length;

      let trafficState: TrafficState = 'clear';
      if (blockedCount > 0 && capacityPercent >= 90) {
        trafficState = 'blocked';
      } else if (capacityPercent >= 105 || (capacityPercent >= 95 && dueSoonCount >= 2)) {
        trafficState = 'critical';
      } else if (capacityPercent >= 85) {
        trafficState = 'congested';
      } else if (capacityPercent >= 65) {
        trafficState = 'building';
      } else {
        trafficState = 'clear';
      }

      calc[user.id] = {
        userId: user.id,
        name: user.name,
        jobTitle: user.jobTitle,
        teamId: user.teamId,
        capacityHoursPerWeek: capHours,
        assignedHours,
        capacityPercent,
        activeJobsCount: userJobs.length,
        dueSoonCount,
        blockedCount,
        trafficState
      };
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

  const indicateBlocker = useCallback((jobId: string, blockerReason: string, dependency?: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_BLOCKED', jobId, job.title, job.status, 'BLOCKED', `Blocker indicated: ${blockerReason}`);
          return {
            ...job,
            status: 'blocked',
            blockerReason,
            blockedSince: new Date().toISOString(),
            dependencies: dependency ? [...(job.dependencies || []), dependency] : job.dependencies
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

  const resolveBlocker = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('JOB_UNBLOCKED', jobId, job.title, 'BLOCKED', 'IN_PROGRESS', 'Dependency resolved by team');
          return {
            ...job,
            status: 'in_progress',
            blockerReason: undefined,
            blockedSince: undefined
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

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
    notes?: string
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
            decisionDate: decision ? new Date().toISOString() : c.decisionDate
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
    const newId = `CT-${Math.floor(1865 + Math.random() * 800)}`;
    const baseHours = brief.estimatedHours || getStandardTaskBenchmarkHours(brief.standardTaskType, 'mid');
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
      estimatedHours: baseHours,
      actualHours: 0,
      createdDate: new Date().toISOString(),
      dueDate: brief.dueDate,
      status: 'unassigned',
      commentsCount: 0,
      attachmentsCount: 1,
      isAtRisk: false
    };

    setJobs((prev) => [newJob, ...prev]);
    logAuditEvent('BRIEF_SUBMITTED', newId, newJob.title, undefined, 'brief_intake', `Client Service submitted standard brief (${brief.standardTaskType})`);
  }, [logAuditEvent]);

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
    dueDate?: string
  ) => {
    const staff = users.find((u) => u.id === assigneeId);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent(
            'STAFF_ASSIGNED_WITH_BENCHMARK',
            jobId,
            job.title,
            'unassigned',
            staff?.name || assigneeId,
            `Assigned to ${staff?.name} (${seniority.toUpperCase()}) with ${prescribedHours}h benchmark`
          );
          return {
            ...job,
            assigneeId,
            assignedSeniority: seniority,
            estimatedHours: prescribedHours,
            dueDate: dueDate || job.dueDate,
            workflowStage: 'in_production',
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            startDate: new Date().toISOString()
          };
        }
        return job;
      })
    );
  }, [users, logAuditEvent]);

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
    revisedHours?: number
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
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
            logAuditEvent('MANAGER_FEEDBACK_GIVEN', jobId, job.title, 'internal_review', 'in_production', `Manager provided feedback: +${extraHours}h added`);
            return {
              ...job,
              workflowStage: 'in_production',
              status: 'in_progress',
              estimatedHours: job.estimatedHours + extraHours,
              feedbackHistory: [...(job.feedbackHistory || []), feedbackItem]
            };
          } else {
            // Manager Approved -> Hand off to Client Service
            logAuditEvent('MANAGER_APPROVED', jobId, job.title, 'internal_review', 'client_service_handoff', `Manager approved deliverable for client dispatch`);
            return {
              ...job,
              workflowStage: 'client_service_handoff',
              status: 'in_review'
            };
          }
        }
        return job;
      })
    );
  }, [currentUser, logAuditEvent]);

  const clientServiceSendToClient = useCallback((jobId: string, clientContactEmail?: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          logAuditEvent('SENT_TO_CLIENT', jobId, job.title, 'client_service_handoff', 'client_review', `Dispatched to client (${clientContactEmail || job.requestor})`);
          return {
            ...job,
            workflowStage: 'client_review',
            status: 'in_review'
          };
        }
        return job;
      })
    );
  }, [logAuditEvent]);

  const clientSubmitRevert = useCallback((
    jobId: string,
    feedbackNotes: string,
    requestedChanges: string[],
    additionalHours: number = 4,
    urgency: Priority = 'urgent'
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

      logAuditEvent(
        'CLIENT_REVERT_RECEIVED',
        jobId,
        targetJob.title,
        'client_review',
        'client_revert',
        `Client revert #${revertRecord.revertCount}. Conflict: ${revertRecord.conflictDetected ? 'YES (Assignee busy on another job)' : 'NO'}`
      );

      return prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            workflowStage: 'client_revert',
            status: 'reopened',
            priority: urgency,
            estimatedHours: j.estimatedHours + additionalHours,
            clientRevertInfo: revertRecord
          };
        }
        return j;
      });
    });
  }, [logAuditEvent]);

  const resolveRevertConflict = useCallback((
    jobId: string,
    resolution: 'queued' | 'paused_current' | 'reassigned' | 'split_timeline',
    targetAssigneeId?: string
  ) => {
    setJobs((prev) => {
      const targetJob = prev.find((j) => j.id === jobId);
      if (!targetJob || !targetJob.clientRevertInfo) return prev;

      const conflictingJobId = targetJob.clientRevertInfo.conflictingJobId;

      logAuditEvent(
        'REVERT_CONFLICT_RESOLVED',
        jobId,
        targetJob.title,
        'CONFLICT_DETECTED',
        resolution.toUpperCase(),
        `Resolved using strategy: ${resolution}`
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

        // Update target reverting job
        if (j.id === jobId) {
          const updatedRevert: ClientRevertInfo = {
            ...j.clientRevertInfo!,
            conflictResolution: resolution,
            resolvedBy: currentUser.name,
            resolvedAt: new Date().toISOString()
          };

          if (resolution === 'reassigned' && targetAssigneeId) {
            return {
              ...j,
              assigneeId: targetAssigneeId,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'in_progress'
            };
          }

          if (resolution === 'paused_current') {
            return {
              ...j,
              clientRevertInfo: updatedRevert,
              workflowStage: 'in_production',
              status: 'in_progress'
            };
          }

          return {
            ...j,
            clientRevertInfo: updatedRevert
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

  const callDebriefMeeting = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
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
      `Traffic Manager convened debrief meeting with brand squad, Client Service, and Creative Director/Manager.`
    );
  }, [logAuditEvent]);

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
        showOnboardingModal,
        setShowOnboardingModal,
        showBuildCaseModal,
        setShowBuildCaseModal,
        showCorrectionModal,
        setShowCorrectionModal,
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
        awardReward
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
