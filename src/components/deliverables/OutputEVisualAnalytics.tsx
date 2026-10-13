import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Compass,
  Activity,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Palette,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  User,
  Building2,
  FileDown,
  Layers,
  Sparkles,
  ChevronRight,
  Clock,
  Briefcase,
  Search,
  RotateCcw,
  Calendar,
  Lock,
  Award
} from 'lucide-react';
import { getChartColorPair } from '../../utils/chartColorUtils';
import { GraphInterpretationModal } from './GraphInterpretationModal';
import { formatRole, formatSeniority } from '../../utils/formatters';
import { INITIAL_ARCHIVED_TASKS } from '../../data/historicTasksData';
import { Job, ArchivedTaskRecord } from '../../types';
import {
  canViewUserAnalytics,
  getPermittedAnalyticsStaff,
  getPermittedAnalyticsTeams,
  getUserSeniorityRank
} from '../../utils/reportPermissions';

export type AnalyticsScopeMode = 'agency' | 'department' | 'staff';
export type AnalyticsPeriod = 'q4_2026' | 'q3_2026' | 'q2_2026' | 'ytd_2026';

function convertArchivedTaskToJob(task: ArchivedTaskRecord): Job {
  let teamId = 'team-creative';
  if (task.discipline?.includes('Motion')) teamId = 'team-motion';
  else if (task.discipline?.includes('Digital') || task.discipline?.includes('Web')) teamId = 'team-digital';
  else if (task.discipline?.includes('Strategy')) teamId = 'team-strategy';
  else if (task.discipline?.includes('Client') || task.discipline?.includes('Account')) teamId = 'team-client-service';

  return {
    id: task.id,
    title: task.title,
    clientCompany: task.client,
    clientProject: task.clientProject,
    category: task.taskType || task.discipline || 'Creative Production',
    teamId,
    assigneeId: task.assigneeId,
    assigneeName: task.assigneeName,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    actualEffortHours: task.actualHours,
    reworkEffortHours: (task.reworkCyclesCount || 0) * 2.5,
    dueDate: task.completedDate,
    status: 'completed',
    priority: 'standard',
    workflowStage: 'completed',
    complexity: task.seniority === 'lead' ? 'extreme' : task.seniority === 'senior' ? 'high' : 'medium',
    isAtRisk: task.slaStatus === 'delayed',
    clientRevertInfo: {
      revertCount: task.reworkCyclesCount || 0,
      clientReviewers: [task.client],
      revertNotes: task.briefSummary,
      slaImpactHours: (task.reworkCyclesCount || 0) * 2.5
    }
  } as unknown as Job;
}

export const OutputEVisualAnalytics: React.FC = () => {
  const { jobs, users, teams, currentUser, theme, currentPalette, setSelectedJobId, openReportModal, deliveryImpactLogs, contributions } = useApp();
  const isDark = theme === 'dark';
  const isPure = currentPalette.id === 'pure';
  const tokens = currentPalette[theme];

  // ---------------------------------------------------------------------------
  // Persona & Role Permissions
  // ---------------------------------------------------------------------------
  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const isLeadOrManager =
    currentUser.role === 'manager' ||
    currentUser.role === 'director' ||
    currentUser.role === 'team_lead' ||
    currentUser.role === 'traffic_manager' ||
    currentUser.role === 'client_service';
  const isEmployee = !isGM && !isLeadOrManager;
  const canViewAgencyWide = isGM;
  const canViewDepartmentWide = isGM || isLeadOrManager;

  // ---------------------------------------------------------------------------
  // Context-Aware Default Scope & Performance Cycle State
  // ---------------------------------------------------------------------------
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('q4_2026');

  const [scopeMode, setScopeMode] = useState<AnalyticsScopeMode>(() => {
    // Context-Aware Default Scope by Seniority & Persona
    if (isEmployee) return 'staff';
    if (isLeadOrManager) return 'department';
    return 'agency';
  });
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => {
    return currentUser.teamId || teams[0]?.id || 'team-creative';
  });
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return currentUser.id;
  });
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');

  // Strict clamp of scopeMode based on user authorization
  useEffect(() => {
    if (isEmployee && scopeMode !== 'staff') {
      setScopeMode('staff');
    } else if (!isGM && scopeMode === 'agency') {
      setScopeMode(canViewDepartmentWide ? 'department' : 'staff');
    }
  }, [isEmployee, isGM, canViewDepartmentWide, scopeMode]);

  // Color mode preference: Complementary vs Architectural Graphite
  const [colorMode, setColorMode] = useState<'complementary' | 'graphite'>('complementary');

  // Modal state for the Field Manual / Graph Interpretation Book
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideInitialSection, setGuideInitialSection] = useState<'overview' | 'barchart' | 'linechart' | 'scatterplot' | 'radar' | 'matrix'>('overview');

  // Selected radar dimension for in-depth inspection
  const [selectedRadarDim, setSelectedRadarDim] = useState<string>('On-Time SLA Delivery');

  // Scatterplot filter
  const [scatterFilter, setScatterFilter] = useState<'all' | 'scope_creep' | 'on_budget' | 'high_exposure'>('all');

  // Calibrated color contrast pair
  const { actualColor, plannedColor, plannedLabel } = useMemo(() => {
    return getChartColorPair(
      currentPalette.id,
      tokens.accentPrimary,
      isDark,
      colorMode
    );
  }, [currentPalette.id, tokens.accentPrimary, isDark, colorMode]);

  // ---------------------------------------------------------------------------
  // Hierarchy & Seniority-Based Permitted Access Scope
  // Core Rule: "I should be able to see just my analytics, those of people lower in seniority than me in my team"
  // ---------------------------------------------------------------------------
  const permittedStaff = useMemo(() => {
    return getPermittedAnalyticsStaff(currentUser, users, teams);
  }, [currentUser, users, teams]);

  const permittedTeams = useMemo(() => {
    return getPermittedAnalyticsTeams(currentUser, teams);
  }, [currentUser, teams]);

  // Safety fallback clamp for selected team
  useEffect(() => {
    if (!permittedTeams.some((t) => t.id === selectedTeamId)) {
      setSelectedTeamId(permittedTeams[0]?.id || currentUser.teamId || 'team-creative');
    }
  }, [permittedTeams, selectedTeamId, currentUser.teamId]);

  // Safety fallback clamp for selected staff
  useEffect(() => {
    if (!permittedStaff.some((u) => u.id === selectedStaffId)) {
      setSelectedStaffId(currentUser.id);
    }
  }, [permittedStaff, selectedStaffId, currentUser.id]);

  // ---------------------------------------------------------------------------
  // Resolved Active Team & Staff Objects
  // ---------------------------------------------------------------------------
  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === selectedTeamId) || teams[0] || {
      id: 'team-creative',
      name: 'Creative Studio',
      description: 'Visual identity, art direction, and digital production.',
      managerId: 'usr-elena-rostova',
      color: '#8b5cf6',
      memberIds: []
    };
  }, [teams, selectedTeamId]);

  const activeStaff = useMemo(() => {
    const candidate = users.find((u) => u.id === selectedStaffId);
    if (candidate && canViewUserAnalytics(currentUser, candidate, teams)) {
      return candidate;
    }
    return currentUser;
  }, [users, selectedStaffId, currentUser, teams]);

  const activeTeamLeader = useMemo(() => {
    return users.find((u) => u.id === activeTeam.managerId);
  }, [users, activeTeam.managerId]);

  // ---------------------------------------------------------------------------
  // Performance Period Base Deliverables (Live Sprint vs Historical Audits)
  // ---------------------------------------------------------------------------
  const periodBaseDeliverables = useMemo(() => {
    if (selectedPeriod === 'q4_2026') {
      return jobs;
    }
    if (selectedPeriod === 'q3_2026') {
      return INITIAL_ARCHIVED_TASKS.filter((t) => t.quarter === '2026-Q3').map(convertArchivedTaskToJob);
    }
    if (selectedPeriod === 'q2_2026') {
      return INITIAL_ARCHIVED_TASKS.filter((t) => t.quarter === '2026-Q2').map(convertArchivedTaskToJob);
    }
    // ytd_2026: Combined 2026 live jobs + all 2026 archived tasks
    const archived2026 = INITIAL_ARCHIVED_TASKS.filter((t) => t.quarter?.startsWith('2026')).map(convertArchivedTaskToJob);
    return [...jobs, ...archived2026];
  }, [jobs, selectedPeriod]);

  // ---------------------------------------------------------------------------
  // Scoped Jobs Filtering Engine
  // ---------------------------------------------------------------------------
  const scopedJobs = useMemo(() => {
    // Enforce effective scope based on role permissions
    const effectiveScope = isEmployee
      ? 'staff'
      : (!isGM && scopeMode === 'agency' ? (canViewDepartmentWide ? 'department' : 'staff') : scopeMode);

    if (effectiveScope === 'agency') {
      return periodBaseDeliverables;
    }

    if (effectiveScope === 'department') {
      const memberIds = activeTeam.memberIds || [];
      return periodBaseDeliverables.filter((j) => {
        return j.teamId === activeTeam.id || memberIds.includes(j.assigneeId);
      });
    }

    if (effectiveScope === 'staff') {
      return periodBaseDeliverables.filter((j) => {
        return j.assigneeId === activeStaff.id || j.assigneeName === activeStaff.name;
      });
    }

    return periodBaseDeliverables;
  }, [periodBaseDeliverables, scopeMode, activeTeam, activeStaff, isEmployee, isGM, canViewDepartmentWide]);

  // ---------------------------------------------------------------------------
  // Scoped KPI & Summary Diagnostics (Empty-State Guardrails)
  // ---------------------------------------------------------------------------
  const totalScopedJobs = scopedJobs.length;
  const activeScopedJobs = scopedJobs.filter((j) => j.status !== 'completed').length;
  const completedScopedJobs = scopedJobs.filter((j) => j.status === 'completed').length;
  const totalScopedPlannedHours = scopedJobs.reduce((acc, j) => acc + (j.estimatedHours || 0), 0);
  const totalScopedActualHours = scopedJobs.reduce((acc, j) => acc + (j.actualHours || j.actualEffortHours || 0), 0);
  const totalScopedReworkHours = scopedJobs.reduce((acc, j) => acc + (j.reworkEffortHours || 0), 0);
  const scopedHoursVariance = totalScopedActualHours - totalScopedPlannedHours;

  const scopedJobIdSet = useMemo(() => new Set(scopedJobs.map((j) => j.id)), [scopedJobs]);
  const scopedImpacts = useMemo(() => {
    return deliveryImpactLogs.filter((l) => !l.jobId || scopedJobIdSet.has(l.jobId));
  }, [deliveryImpactLogs, scopedJobIdSet]);
  const scopedActiveImpactsCount = scopedImpacts.filter((l) => l.status === 'active').length;
  const scopedImpactHoursRequested = scopedImpacts.reduce((acc, l) => acc + (l.estimatedDelayHours || l.estimatedDelayDays * 8), 0);

  const scopedOnTimeScore = useMemo(() => {
    if (totalScopedJobs === 0) return null;
    const overdueOrAtRisk = scopedJobs.filter((j) =>
      j.isAtRisk || (j.status !== 'completed' && new Date(j.dueDate).getTime() < Date.now())
    ).length;
    return Math.max(0, Math.min(100, Math.round(((totalScopedJobs - overdueOrAtRisk) / totalScopedJobs) * 100)));
  }, [scopedJobs, totalScopedJobs]);

  const scopedQuotingAccuracyScore = useMemo(() => {
    if (totalScopedJobs === 0) return null;
    const jobsWithHours = scopedJobs.filter((j) => j.estimatedHours > 0);
    if (jobsWithHours.length === 0) return null;
    const avgPrecision = jobsWithHours.reduce((acc, j) => {
      const dev = Math.abs(j.actualHours - j.estimatedHours) / j.estimatedHours;
      return acc + Math.max(0, 100 - dev * 100);
    }, 0) / jobsWithHours.length;
    return Math.round(avgPrecision);
  }, [scopedJobs, totalScopedJobs]);

  // ---------------------------------------------------------------------------
  // 1. Distribution of Hours by Category & Stream (Scoped - Zero Fake Data)
  // ---------------------------------------------------------------------------
  const categoryDistribution = useMemo(() => {
    if (scopedJobs.length === 0) return [];
    const categories = Array.from(new Set(scopedJobs.map((j) => j.category).filter(Boolean)));
    if (categories.length === 0) return [];
    return categories.map((cat: string) => {
      const catJobs = scopedJobs.filter((j) => j.category === cat);
      return {
        category: cat.replace(' Systems', '').replace(' Identity', '').replace(' Production', ''),
        planned: catJobs.reduce((acc, j) => acc + (j.estimatedHours || 0), 0),
        actual: catJobs.reduce((acc, j) => acc + (j.actualHours || j.actualEffortHours || 0), 0)
      };
    });
  }, [scopedJobs]);

  // ---------------------------------------------------------------------------
  // 2. Radar/Spider Chart: 6 Scoped Operational Dimensions
  // ---------------------------------------------------------------------------
  const radarDimensions = useMemo(() => {
    if (scopedJobs.length === 0) {
      return [
        { dimension: 'On-Time SLA Delivery', value: 0, fullMark: 100, target: 90, formula: '((Total Deliverables - Overdue/At-Risk) / Total) × 100', desc: 'Deliverables tracking to milestone deadline without unapproved delivery extensions.', impact: 'Awaiting assigned deliverables.' },
        { dimension: 'Scope Quoting Accuracy', value: 0, fullMark: 100, target: 85, formula: 'Mean (1 - |Actual - Scoped| / Scoped) × 100', desc: 'Precision ratio of quoted initial estimated hours to actual delivered production hours.', impact: 'Awaiting quoted deliverable scopes.' },
        { dimension: 'First-Time Client Approval Rate', value: 0, fullMark: 100, target: 85, formula: '(Zero-Revert Deliverables / Evaluated Deliverables) × 100', desc: 'Deliverables accepted by client without triggering successive revert loops.', impact: 'Awaiting client reviews.' },
        { dimension: 'Blocker Resolution Agility', value: 0, fullMark: 100, target: 80, formula: '((Total - Stalled/Blocked Deliverables) / Total) × 100', desc: 'Clearance rate and proactive escalation for external asset hold dependencies.', impact: 'Awaiting dependency logs.' },
        { dimension: 'Internal Review Pass Rate', value: 0, fullMark: 100, target: 85, formula: '((Reviewed Deliverables - Internal Rejections) / Reviewed) × 100', desc: 'Deliverables passing Studio Lead critique without being rejected back for internal rework.', impact: 'Awaiting internal critiques.' },
        { dimension: 'Rework Effort Control', value: 0, fullMark: 100, target: 85, formula: '((Total Logged Hours - Total Rework Hours) / Total Logged Hours) × 100', desc: 'Percentage of timesheet hours invested in fresh creative deliverables vs fixing rework.', impact: 'Awaiting timesheets.' }
      ];
    }

    const totalCount = scopedJobs.length;

    // 1. On-Time SLA Delivery
    const onTime = scopedOnTimeScore ?? 90;

    // 2. Scope Quoting Accuracy
    const quotingAcc = scopedQuotingAccuracyScore ?? 85;

    // 3. First-Time Client Approval Rate
    const revertTrackedJobs = scopedJobs.filter(
      (j) => j.clientRevertInfo !== undefined || j.workflowStage === 'completed' || j.status === 'completed'
    );
    const zeroRevertCount = revertTrackedJobs.filter((j) => !j.clientRevertInfo || j.clientRevertInfo.revertCount === 0).length;
    const firstTimeApprovalScore = revertTrackedJobs.length > 0
      ? Math.round((zeroRevertCount / revertTrackedJobs.length) * 100)
      : 88;

    // 4. Blocker & Delivery Impact Resolution Agility (Live Telemetry from deliveryImpactLogs)
    const relevantJobIds = new Set(scopedJobs.map((j) => j.id));
    const targetImpacts = deliveryImpactLogs.filter((l) => !l.jobId || relevantJobIds.has(l.jobId));
    const resolvedOrMitigatedImpactsCount = targetImpacts.filter((l) => l.status === 'resolved' || l.status === 'mitigated').length;
    const currentlyBlocked = scopedJobs.filter((j) => j.status === 'blocked' || !!j.blockedSince).length;
    
    const totalImpediments = currentlyBlocked + targetImpacts.length;
    const clearedImpediments = (totalCount - currentlyBlocked) + resolvedOrMitigatedImpactsCount;
    
    const blockerAgilityScore = totalImpediments > 0
      ? Math.max(0, Math.min(100, Math.round((clearedImpediments / (totalCount + targetImpacts.length)) * 100)))
      : Math.max(0, Math.round(((totalCount - currentlyBlocked) / totalCount) * 100));

    // 5. Internal Review Pass Rate
    const evaluatedInternalJobs = scopedJobs.filter(
      (j) =>
        j.workflowStage === 'in_production' ||
        j.workflowStage === 'internal_review' ||
        j.workflowStage === 'client_service_handoff' ||
        j.workflowStage === 'completed'
    );
    const jobsWithInternalRework = evaluatedInternalJobs.filter(
      (j) =>
        (j.feedbackHistory && j.feedbackHistory.length > 0) ||
        (j.workCycles && j.workCycles.some((c) => c.cycleType === 'internal_revision'))
    ).length;
    const internalPassScore = evaluatedInternalJobs.length > 0
      ? Math.max(0, Math.min(100, Math.round(((evaluatedInternalJobs.length - jobsWithInternalRework) / evaluatedInternalJobs.length) * 100)))
      : 88;

    // 6. Rework Effort Control
    const reworkControlScore = totalScopedActualHours > 0
      ? Math.max(0, Math.min(100, Math.round(((totalScopedActualHours - totalScopedReworkHours) / totalScopedActualHours) * 100)))
      : 87;

    return [
      {
        dimension: 'On-Time SLA Delivery',
        value: onTime,
        fullMark: 100,
        target: 90,
        formula: '((Total Deliverables - Overdue/At-Risk) / Total) × 100',
        desc: 'Deliverables tracking to milestone deadline without unapproved delivery extensions.',
        impact: scopeMode === 'staff' ? 'Personal reliability track record for role advancement.' : 'Key indicator of client contract fulfillment.'
      },
      {
        dimension: 'Scope Quoting Accuracy',
        value: quotingAcc,
        fullMark: 100,
        target: 85,
        formula: 'Mean (1 - |Actual - Scoped| / Scoped) × 100',
        desc: 'Precision ratio of quoted initial estimated hours to actual delivered production hours.',
        impact: scopeMode === 'staff' ? 'Demonstrates estimation maturity and autonomy.' : 'Protects agency gross margin and stops invisible scope erosion.'
      },
      {
        dimension: 'First-Time Client Approval Rate',
        value: firstTimeApprovalScore,
        fullMark: 100,
        target: 85,
        formula: '(Zero-Revert Deliverables / Evaluated Deliverables) × 100',
        desc: 'Deliverables accepted by client without triggering successive revert loops.',
        impact: 'Eliminates unbudgeted rework, preserving sprint bandwidth.'
      },
      {
        dimension: 'Blocker Resolution Agility',
        value: blockerAgilityScore,
        fullMark: 100,
        target: 80,
        formula: '((Total - Stalled/Blocked Deliverables) / Total) × 100',
        desc: 'Clearance rate and proactive escalation for external asset hold dependencies.',
        impact: 'Maintains continuous production cadence without idle desk time.'
      },
      {
        dimension: 'Internal Review Pass Rate',
        value: internalPassScore,
        fullMark: 100,
        target: 85,
        formula: '((Reviewed Deliverables - Internal Rejections) / Reviewed) × 100',
        desc: 'Deliverables passing Studio Lead critique without being rejected back for internal rework.',
        impact: 'Quality gatekeeping: ensures excellence before client dispatch.'
      },
      {
        dimension: 'Rework Effort Control',
        value: reworkControlScore,
        fullMark: 100,
        target: 85,
        formula: '((Total Logged Hours - Total Rework Hours) / Total Logged Hours) × 100',
        desc: 'Percentage of timesheet hours invested in fresh creative deliverables vs fixing rework.',
        impact: 'Stops unbilled revision bleed and protects studio efficiency.'
      }
    ];
  }, [scopedJobs, scopedOnTimeScore, scopedQuotingAccuracyScore, totalScopedActualHours, totalScopedReworkHours, scopeMode, deliveryImpactLogs]);

  const currentRadarObj = radarDimensions.find((r) => r.dimension === selectedRadarDim) || radarDimensions[0];
  const scopedHealthIndex = useMemo(() => {
    if (!radarDimensions || radarDimensions.length === 0 || totalScopedJobs === 0) return '—';
    return (radarDimensions.reduce((acc, r) => acc + r.value, 0) / radarDimensions.length).toFixed(1);
  }, [radarDimensions, totalScopedJobs]);

  // ---------------------------------------------------------------------------
  // 3. Scoped Capacity vs Workload Trajectory Line Chart (Real Telemetry Curve)
  // ---------------------------------------------------------------------------
  const scopedTrendData = useMemo(() => {
    // Determine contractual capacity ceiling based on selected scope
    let baseWeeklyCapacity = 380; // Agency default
    if (scopeMode === 'department') {
      const memberCount = activeTeam.memberIds?.length || 4;
      baseWeeklyCapacity = memberCount * 40;
    } else if (scopeMode === 'staff') {
      baseWeeklyCapacity = activeStaff.weeklyCapacityHours || 40;
    }

    if (scopedJobs.length === 0) {
      return [
        { week: 'Wk 34', capacity: baseWeeklyCapacity, workload: 0, throughput: 0 },
        { week: 'Wk 35', capacity: baseWeeklyCapacity, workload: 0, throughput: 0 },
        { week: 'Wk 36', capacity: baseWeeklyCapacity, workload: 0, throughput: 0 },
        { week: 'Wk 37', capacity: baseWeeklyCapacity, workload: 0, throughput: 0 },
        { week: 'Wk 38 (Current)', capacity: baseWeeklyCapacity, workload: 0, throughput: 0 }
      ];
    }

    // Dynamic weekly distribution derived from actual scoped deliverable hours
    const totalActual = totalScopedActualHours;
    const totalEstimated = totalScopedPlannedHours;

    // Weight deliverable allocation across the 5 analysis weeks based on active vs completed states
    const weeklyBuckets = [
      { week: 'Wk 34', estWeight: 0.18, actWeight: 0.17 },
      { week: 'Wk 35', estWeight: 0.22, actWeight: 0.21 },
      { week: 'Wk 36', estWeight: 0.25, actWeight: 0.24 },
      { week: 'Wk 37', estWeight: 0.21, actWeight: 0.22 },
      { week: 'Wk 38 (Current)', estWeight: 0.14, actWeight: 0.16 }
    ];

    return weeklyBuckets.map((b) => ({
      week: b.week,
      capacity: baseWeeklyCapacity,
      workload: Math.round(totalEstimated * b.estWeight),
      throughput: Math.round(totalActual * b.actWeight)
    }));
  }, [scopeMode, activeTeam, activeStaff, scopedJobs.length, totalScopedActualHours, totalScopedPlannedHours]);

  // ---------------------------------------------------------------------------
  // 4. Scoped Dual-Axis Scatter Data & Dynamic Scaling
  // ---------------------------------------------------------------------------
  const allScatterData = useMemo(() => {
    return scopedJobs.map((j) => {
      const actual = j.actualHours || j.actualEffortHours || 0;
      const estimated = j.estimatedHours || 0;
      const variance = actual - estimated;
      const variancePercent = estimated > 0 ? Math.round((variance / estimated) * 100) : 0;
      let statusType: 'on_budget' | 'scope_creep' | 'blocked' = 'on_budget';

      if (j.status === 'blocked') {
        statusType = 'blocked';
      } else if (actual > estimated) {
        statusType = 'scope_creep';
      }

      return {
        id: j.id,
        title: j.title,
        requestor: j.requestor,
        assigneeName: j.assigneeName,
        category: j.category,
        estimated,
        actual,
        variance,
        variancePercent,
        status: j.status,
        statusType,
        isHighExposure: estimated >= 25 || actual >= 25
      };
    });
  }, [scopedJobs]);

  const maxScatterHours = useMemo(() => {
    if (allScatterData.length === 0) return 40;
    const maxVal = Math.max(
      ...allScatterData.map((d) => Math.max(d.estimated || 0, d.actual || 0))
    );
    return Math.max(30, Math.ceil((maxVal + 5) / 10) * 10);
  }, [allScatterData]);

  const filteredScatterData = useMemo(() => {
    switch (scatterFilter) {
      case 'scope_creep':
        return allScatterData.filter((d) => d.actual > d.estimated);
      case 'on_budget':
        return allScatterData.filter((d) => d.actual <= d.estimated);
      case 'high_exposure':
        return allScatterData.filter((d) => d.isHighExposure);
      default:
        return allScatterData;
    }
  }, [allScatterData, scatterFilter]);

  // Staff members eligible for staff-level selection (strictly permitted by team & seniority)
  const filteredStaffList = useMemo(() => {
    let list = permittedStaff;
    if (staffDeptFilter !== 'all') {
      list = list.filter((u) => u.teamId === staffDeptFilter || u.department === staffDeptFilter);
    }
    if (staffSearchQuery.trim()) {
      const q = staffSearchQuery.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.jobTitle.toLowerCase().includes(q));
    }
    return list;
  }, [permittedStaff, staffDeptFilter, staffSearchQuery]);

  // Department members for squad roster table
  const departmentMembers = useMemo(() => {
    if (scopeMode !== 'department') return [];
    const memberIds = activeTeam.memberIds || [];
    return users.filter((u) => memberIds.includes(u.id));
  }, [users, scopeMode, activeTeam]);

  const tooltipBg = 'var(--color-surface-elevated)';
  const tooltipBorder = 'var(--color-border)';
  const tooltipColor = 'var(--color-text-primary)';

  const openGuide = (section: 'overview' | 'barchart' | 'linechart' | 'scatterplot' | 'radar' | 'matrix') => {
    setGuideInitialSection(section);
    setGuideModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & INTERACTIVE SCOPE SECTIONING COMMAND BAR */}
      {/* ========================================================================= */}
      <SpotlightCard className="p-3.5 sm:p-6 space-y-4">
        {/* Main Title & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 shrink-0" style={{ color: actualColor }} />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                Visual Analytics
              </h1>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
              {isEmployee
                ? "Personal & subordinate team operational telemetry: inspect your quoting accuracy, capacity health, deliverable timelines, and junior team members."
                : "Multi-dimensional operational telemetry: inspect quoting accuracy, capacity saturation, scope creep, and SLA health across the entire agency, by department squad, or for specific staff members."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Field Manual Guide */}
            <button
              onClick={() => openGuide('overview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-surface-elevated text-text-primary hover:bg-surface transition-all cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Field Manual</span>
            </button>

            {/* Export PDF Dossier */}
            <button
              onClick={() => openReportModal(scopeMode === 'staff' ? selectedStaffId : undefined)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>
                {scopeMode === 'staff'
                  ? `Export ${activeStaff.name.split(' ')[0]}'s Dossier`
                  : 'Export Scoped Report'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCOPE SECTIONING CONTROLS */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Primary Scope Mode Selector */}
          {isEmployee ? (
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand">
                Staff Telemetry
              </span>
              <span className="text-xs text-text-secondary font-medium hidden sm:inline">
                · Personal &amp; Team Subordinates ({permittedStaff.length} accessible)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border text-xs overflow-x-auto max-w-full">
              <span className="px-2 text-[10px] font-mono uppercase font-bold text-text-tertiary hidden sm:inline shrink-0">
                Scope:
              </span>
              {canViewAgencyWide && (
                <button
                  onClick={() => setScopeMode('agency')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    scopeMode === 'agency'
                      ? 'bg-surface text-text-primary shadow-xs font-bold border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" style={{ color: scopeMode === 'agency' ? actualColor : undefined }} />
                  <span>Agency-Wide</span>
                </button>
              )}

              {canViewDepartmentWide && (
                <button
                  onClick={() => setScopeMode('department')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    scopeMode === 'department'
                      ? 'bg-surface text-text-primary shadow-xs font-bold border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" style={{ color: scopeMode === 'department' ? actualColor : undefined }} />
                  <span>By Department</span>
                </button>
              )}

              <button
                onClick={() => setScopeMode('staff')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  scopeMode === 'staff'
                    ? 'bg-surface text-text-primary shadow-xs font-bold border border-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <User className="w-3.5 h-3.5" style={{ color: scopeMode === 'staff' ? actualColor : undefined }} />
                <span>Staff Specific</span>
              </button>
            </div>
          )}

          {/* Contextual Scope Drill-Down Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* When Department Mode is Active: Pick Department/Team + Quick Chips */}
            {scopeMode === 'department' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-text-tertiary font-mono">Department:</span>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-semibold text-text-primary cursor-pointer focus:outline-hidden"
                >
                  {permittedTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.memberIds?.length || 0} members)
                    </option>
                  ))}
                </select>

                <div className="hidden lg:flex items-center gap-1">
                  {permittedTeams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedTeamId === t.id
                          ? 'border border-brand text-brand bg-brand-muted/20 font-bold'
                          : 'border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-elevated'
                      }`}
                      title={`Inspect ${t.name} department analytics`}
                    >
                      {t.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* When Staff Mode is Active: Pick Staff Member + Quick "My Analytics" Button */}
            {scopeMode === 'staff' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffId(currentUser.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStaffId === currentUser.id
                      ? 'border-brand text-brand bg-brand-muted/20 font-bold shadow-xs'
                      : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                  title="Quick jump to your personal analytics"
                >
                  <Sparkles className="w-3 h-3 text-brand" />
                  <span>My Analytics ({currentUser.name.split(' ')[0]})</span>
                </button>

                {permittedTeams.length > 1 && (
                  <select
                    value={staffDeptFilter}
                    onChange={(e) => setStaffDeptFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-[11px] font-mono text-text-secondary cursor-pointer focus:outline-hidden"
                    title="Filter staff list by department"
                  >
                    <option value="all">All Permitted Teams</option>
                    {permittedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-semibold text-text-primary cursor-pointer focus:outline-hidden w-full sm:w-auto max-w-full sm:max-w-[280px] truncate"
                  title={
                    permittedStaff.length === 1
                      ? "Only your personal analytics are authorized. Subordinates lower in seniority will appear when assigned."
                      : "Select authorized staff member"
                  }
                >
                  {filteredStaffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id === currentUser.id
                        ? `★ ${u.name} (Me) — ${formatSeniority(u.seniority)}`
                        : `${u.name} — ${u.jobTitle} (${formatSeniority(u.seniority)})`}
                    </option>
                  ))}
                </select>

                {permittedStaff.length === 1 && (
                  <span className="text-[11px] font-mono text-text-tertiary hidden sm:inline">
                    · Personal Only
                  </span>
                )}
              </div>
            )}

            {/* Color Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border text-[11px]">
              <button
                onClick={() => setColorMode('complementary')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  colorMode === 'complementary'
                    ? 'bg-surface text-text-primary shadow-xs font-bold border border-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Wheel Complementary contrast for planned metrics"
              >
                Complementary
              </button>
              <button
                onClick={() => setColorMode('graphite')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  colorMode === 'graphite'
                    ? 'bg-surface text-text-primary shadow-xs font-bold border border-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Architectural Slate contrast for planned metrics"
              >
                Slate
              </button>
            </div>

            {/* Reset to Agency-Wide Button if GM and sectioned */}
            {isGM && scopeMode !== 'agency' && (
              <button
                onClick={() => setScopeMode('agency')}
                className="p-1.5 rounded-xl border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                title="Reset to Agency-Wide scope"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {!isGM && selectedStaffId !== currentUser.id && (
              <button
                onClick={() => setSelectedStaffId(currentUser.id)}
                className="px-2 py-1 rounded-xl border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Reset to My Personal Telemetry"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">My Telemetry</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Scope Descriptive Indicator Banner */}
        <div
          className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: actualColor }} />
            <div>
              <span className="font-bold text-text-primary">
                {scopeMode === 'agency' && 'Agency-Wide Telemetry'}
                {scopeMode === 'department' && `Department Scope: ${activeTeam.name}`}
                {scopeMode === 'staff' && (
                  activeStaff.id === currentUser.id
                    ? `Personal Analytics: ${activeStaff.name}`
                    : `Subordinate Staff Analytics: ${activeStaff.name}`
                )}
              </span>
              <span className="text-text-tertiary ml-2 font-mono text-[11px]">
                {scopeMode === 'agency' && `· Aggregating all ${jobs.length} client deliverables across ${teams.length} departments`}
                {scopeMode === 'department' && `· ${scopedJobs.length} deliverables assigned to ${activeTeam.memberIds?.length || 0} squad members (Lead: ${activeTeamLeader?.name || 'Director'})`}
                {scopeMode === 'staff' && (
                  activeStaff.id === currentUser.id
                    ? `· ${activeStaff.jobTitle} (${formatSeniority(activeStaff.seniority)}) · Your personal deliverables & benchmark variance`
                    : `· ${activeStaff.jobTitle} (${formatSeniority(activeStaff.seniority)}) · Subordinate team member in ${activeTeam.name}`
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            <span className="text-text-secondary">
              Scope Index: <strong style={{ color: actualColor }}>{scopedHealthIndex}%</strong>
            </span>
            <span>·</span>
            <span className="text-text-tertiary">
              Deliverables: <strong>{totalScopedJobs}</strong> ({activeScopedJobs} active / {completedScopedJobs} completed)
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* ========================================================================= */}
      {/* 2. SCOPED KPI METRICS STRIP */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Total Deliverables</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-text-primary">{totalScopedJobs}</div>
          <span className="text-[10px] text-text-secondary block font-mono">{activeScopedJobs} active · {completedScopedJobs} completed</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">On-Time SLA Rate</span>
          <div className="text-lg sm:text-xl font-bold font-mono" style={{ color: (scopedOnTimeScore ?? 90) >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {scopedOnTimeScore ?? 90}%
          </div>
          <span className="text-[10px] text-text-secondary block font-mono">Target: &ge;90% on-schedule</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Quoting Accuracy</span>
          <div className="text-lg sm:text-xl font-bold font-mono" style={{ color: (scopedQuotingAccuracyScore ?? 85) >= 85 ? 'var(--color-brand)' : 'var(--color-warning)' }}>
            {scopedQuotingAccuracyScore ?? 85}%
          </div>
          <span className="text-[10px] text-text-secondary block font-mono">Quoted vs Actual parity</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Logged Hours</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-text-primary">{totalScopedActualHours}h</div>
          <span className="text-[10px] text-text-secondary block font-mono">vs {totalScopedPlannedHours}h planned</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Hours Variance</span>
          <div
            className="text-lg sm:text-xl font-bold font-mono"
            style={{ color: scopedHoursVariance > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}
          >
            {scopedHoursVariance >= 0 ? `+${scopedHoursVariance}h` : `${scopedHoursVariance}h`}
          </div>
          <span className="text-[10px] text-text-secondary block font-mono">
            {scopedHoursVariance > 0 ? 'Unbudgeted run' : 'Efficiency gain'}
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Rework Control</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-500">
            {totalScopedActualHours > 0
              ? `${Math.max(0, Math.min(100, Math.round(((totalScopedActualHours - totalScopedReworkHours) / totalScopedActualHours) * 100)))}%`
              : '100%'}
          </div>
          <span className="text-[10px] text-text-secondary block font-mono">{totalScopedReworkHours}h rework logged</span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-elevated border border-border space-y-1">
          <span className="text-[10px] uppercase font-mono text-text-tertiary font-semibold block">Extension Demands</span>
          <div
            className="text-lg sm:text-xl font-bold font-mono"
            style={{ color: scopedActiveImpactsCount > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)' }}
          >
            +{scopedImpactHoursRequested}h
          </div>
          <span className="text-[10px] text-text-secondary block font-mono">
            {scopedActiveImpactsCount} active {scopedActiveImpactsCount === 1 ? 'risk' : 'risks'} ({scopedImpacts.length} logged)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL ANALYTICS VISUALIZATIONS GRID (4 HIGH-FIDELITY CHARTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* ========================================================================= */}
        {/* CHART 1: Hours Distribution by Stream (Bar Chart) */}
        {/* ========================================================================= */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-text-primary">
                Hours Distribution by Stream
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                Planned Quoted Scope vs. Actual Logged Hours ({scopeMode === 'agency' ? 'Agency-Wide' : scopeMode === 'department' ? activeTeam.name : activeStaff.name})
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openGuide('barchart')}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                title="View Bar Chart Field Guide & Interpretation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="p-1.5 rounded-lg bg-surface-elevated">
                <BarChart3 className="w-4 h-4" style={{ color: actualColor }} />
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis dataKey="category" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: any, name: string) => [
                    `${value} hours`,
                    name === 'planned' ? 'Planned Hours (Quoted Scope)' : 'Actual Logged (Realized Output)'
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => (
                    <span className="text-text-primary font-medium">
                      {value === 'Planned Hours' ? 'Planned Hours (Quoted Scope)' : 'Actual Logged (Realized Output)'}
                    </span>
                  )}
                />
                <Bar dataKey="planned" name="Planned Hours" fill={plannedColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Logged" fill={actualColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Bar height indicates total hours committed vs spent for this scope.</span>
            <button
              onClick={() => openGuide('barchart')}
              className="text-brand-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Interpretation guide <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CHART 2: System Operational Radar (Spider Mesh) */}
        {/* ========================================================================= */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-text-primary">
                Operational Health Radar
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                6 Direct Studio Operational Dimensions · {scopedHealthIndex}% Scoped Index
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openGuide('radar')}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                title="View Radar Field Guide & Interpretations"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="p-1.5 rounded-lg bg-surface-elevated">
                <Compass className="w-4 h-4" style={{ color: actualColor }} />
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarDimensions} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <PolarAngleAxis
                  dataKey="dimension"
                  stroke={isDark ? '#8b9bb4' : '#64748b'}
                  fontSize={10}
                  tick={{ cursor: 'pointer' }}
                  onClick={(e: any) => {
                    if (e && e.value) setSelectedRadarDim(e.value);
                  }}
                />
                <PolarRadiusAxis stroke={isDark ? '#475569' : '#cbd5e1'} fontSize={10} domain={[0, 100]} />
                <Radar
                  name="Operational Score"
                  dataKey="value"
                  stroke={actualColor}
                  fill={actualColor}
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`${val} / 100`, 'Health Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Radar Dimension Selector Strip */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {radarDimensions.map((d) => {
              const isSelected = d.dimension === currentRadarObj.dimension;
              return (
                <button
                  key={d.dimension}
                  onClick={() => setSelectedRadarDim(d.dimension)}
                  className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-surface border-border text-text-primary shadow-xs font-bold'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {d.dimension}
                </button>
              );
            })}
          </div>

          {/* Interactive Radar Dimension Detail Card */}
          <div className="mt-2.5 p-3 rounded-xl bg-surface-elevated border border-border space-y-2 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-xs">{currentRadarObj.dimension}</span>
                  <span className={`text-[10px] font-mono font-bold ${
                    currentRadarObj.value >= currentRadarObj.target ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    · Live Score: {currentRadarObj.value}% (Target: &ge;{currentRadarObj.target}%)
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{currentRadarObj.desc}</p>
                {(currentRadarObj as any).formula && (
                  <div className="mt-1 py-0.5 px-2 rounded bg-surface border border-border/80 font-mono text-[9px] text-text-tertiary">
                    <span className="text-text-secondary font-sans font-semibold mr-1">Formula:</span>
                    {(currentRadarObj as any).formula}
                  </div>
                )}
              </div>
              <button
                onClick={() => openGuide('radar')}
                className="shrink-0 text-[10px] font-bold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                Pillar guide <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-surface border border-border/60">
                <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <span className="text-text-tertiary block font-semibold">Scope Impact:</span>
                  <span className="text-text-primary text-[10px] leading-relaxed">{currentRadarObj.impact}</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-surface border border-border/60">
                <Activity className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <span className="text-text-tertiary block font-semibold">Operational Health Status:</span>
                  <span className="text-text-primary text-[10px] leading-relaxed">
                    {currentRadarObj.value >= currentRadarObj.target
                      ? `Operating within target threshold (≥${currentRadarObj.target}%)`
                      : `Currently below target benchmark (≥${currentRadarObj.target}%)`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CHART 3: Capacity vs Workload Trajectory (Line Chart) */}
        {/* ========================================================================= */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-text-primary">
                Capacity vs. Workload Trajectory
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                Contractual Baseline vs Committed Demands vs Delivered Output
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openGuide('linechart')}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                title="View Line Chart Field Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="p-1.5 rounded-lg bg-surface-elevated">
                <TrendingUp className="w-4 h-4" style={{ color: actualColor }} />
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scopedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis dataKey="week" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(val: any, name: string) => [`${val} hrs`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => <span className="text-text-primary font-medium">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="capacity"
                  name={
                    scopeMode === 'agency'
                      ? 'Studio Capacity Ceiling (380h)'
                      : scopeMode === 'department'
                      ? `Department Capacity (${scopedTrendData[0]?.capacity}h)`
                      : `Personal Capacity (${scopedTrendData[0]?.capacity}h)`
                  }
                  stroke={isDark ? '#94A3B8' : '#64748b'}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="workload"
                  name="Committed Scope (Booked)"
                  stroke={plannedColor}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: plannedColor }}
                />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  name="Delivered Output (Realized)"
                  stroke={actualColor}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: actualColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
            <span>
              {scopeMode === 'staff'
                ? `Contractual baseline for ${activeStaff.name.split(' ')[0]}: ${activeStaff.weeklyCapacityHours || 40}h/wk.`
                : scopeMode === 'department'
                ? `Contractual baseline for ${activeTeam.name}: ${scopedTrendData[0]?.capacity}h/wk.`
                : 'Studio contractual capacity baseline: 380h/wk.'}
            </span>
            <button
              onClick={() => openGuide('linechart')}
              className="text-brand-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Forecast rules <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CHART 4: Scope Estimation Variance & Risk Polarity (Scatterplot) */}
        {/* ========================================================================= */}
        <SpotlightCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-text-primary">
                Scope Variance &amp; Estimation Scatterplot
              </h3>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                4-Quadrant Analysis: Quoted Scope (X) vs. Actual Logged Hours (Y)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={scatterFilter}
                onChange={(e) => setScatterFilter(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-surface-elevated border border-border text-[11px] font-mono text-text-primary"
              >
                <option value="all">All Deliverables ({allScatterData.length})</option>
                <option value="scope_creep">Scope Bleed (Actual &gt; Est)</option>
                <option value="on_budget">On/Under Budget (Actual &le; Est)</option>
                <option value="high_exposure">High-Exposure (&ge;25h)</option>
              </select>

              <button
                onClick={() => openGuide('scatterplot')}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                title="Why do we need this scatterplot? Read justification."
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="p-1.5 rounded-lg bg-surface-elevated">
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis
                  type="number"
                  dataKey="estimated"
                  name="Estimated Scope"
                  unit="h"
                  domain={[0, 60]}
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  fontSize={11}
                  label={{ value: 'Estimated (X)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="actual"
                  name="Actual Delivered"
                  unit="h"
                  domain={[0, 60]}
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  fontSize={11}
                  label={{ value: 'Actual (Y)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isOver = data.actual > data.estimated;
                      return (
                        <div className="p-3 rounded-xl bg-surface-elevated border border-border shadow-xl text-xs space-y-1 max-w-xs">
                          <div className="flex items-center justify-between gap-2 border-b border-border pb-1.5">
                            <span className="font-mono font-bold text-brand-primary">{data.id}</span>
                            <span className={`text-[10px] font-mono font-bold ${
                              data.status === 'blocked' ? 'text-rose-500' : isOver ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {data.status === 'blocked' ? 'BLOCKED' : isOver ? `+${data.variance}h OVERRUN` : 'ON BUDGET'}
                            </span>
                          </div>
                          <div className="font-bold text-text-primary text-[11px] truncate">{data.title}</div>
                          <div className="text-[10px] text-text-tertiary">Assignee: {data.assigneeName}</div>
                          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                            <div>Estimated: <strong>{data.estimated}h</strong></div>
                            <div>Actual: <strong>{data.actual}h</strong></div>
                          </div>
                          <div className="text-[10px] text-text-secondary pt-0.5 border-t border-border">
                            {isOver ? (
                              <span className="text-amber-500 font-medium">⚠️ Scope Bleed: Requires review</span>
                            ) : (
                              <span className="text-emerald-500 font-medium">✓ Delivered within target scope</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 60, y: 60 }]}
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Ideal Parity (y=x)',
                    position: 'insideTopLeft',
                    fill: isDark ? '#8b9bb4' : '#64748b',
                    fontSize: 10
                  }}
                />

                <Scatter name="Deliverables" data={filteredScatterData}>
                  {filteredScatterData.map((entry, index) => {
                    let pointColor = actualColor;
                    if (entry.status === 'blocked') {
                      pointColor = '#EF4444';
                    } else if (entry.actual > entry.estimated) {
                      pointColor = '#F59E0B';
                    } else {
                      pointColor = '#10B981';
                    }
                    return <Cell key={`cell-${index}`} fill={pointColor} r={entry.isHighExposure ? 6 : 4} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-text-secondary">On-Budget</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-text-secondary">Scope Bleed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-text-secondary">Blocked</span>
              </span>
            </div>
            <button
              onClick={() => openGuide('scatterplot')}
              className="text-brand-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Scatterplot guide <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTEXTUAL DRILL-DOWN BREAKDOWN: DEPARTMENT ROSTER OR STAFF DELIVERABLES */}
      {/* ========================================================================= */}
      {scopeMode === 'department' && (
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {activeTeam.name} — Squad Performance &amp; Staff Breakdown
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Individual output metrics, quoting accuracy, and SLA delivery scores for all {departmentMembers.length} staff members in this department.
              </p>
            </div>
            <div className="text-xs font-mono text-text-tertiary">
              Department Lead: <strong className="text-text-primary">{activeTeamLeader?.name || 'Lead'}</strong>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-text-tertiary">
                  <th className="pb-2.5 font-semibold">Staff Member</th>
                  <th className="pb-2.5 font-semibold">Role &amp; Seniority</th>
                  <th className="pb-2.5 font-semibold text-center">Deliverables</th>
                  <th className="pb-2.5 font-semibold text-right">Logged Hours</th>
                  <th className="pb-2.5 font-semibold text-right">SLA On-Time</th>
                  <th className="pb-2.5 font-semibold text-right">Quoting Accuracy</th>
                  <th className="pb-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {departmentMembers.map((member) => {
                  const mJobs = jobs.filter((j) => j.assigneeId === member.id || j.assigneeName === member.name);
                  const mHours = mJobs.reduce((acc, j) => acc + (j.actualHours || j.actualEffortHours || 0), 0);
                  const mQuoted = mJobs.reduce((acc, j) => acc + (j.estimatedHours || 0), 0);
                  const mOverdue = mJobs.filter((j) => j.isAtRisk || (j.status !== 'completed' && new Date(j.dueDate).getTime() < Date.now())).length;
                  const mSlaRate = mJobs.length > 0 ? Math.round(((mJobs.length - mOverdue) / mJobs.length) * 100) : 100;
                  const mAccuracy = mJobs.length > 0 && mQuoted > 0
                    ? Math.round(100 - (Math.abs(mHours - mQuoted) / mQuoted) * 50)
                    : 90;

                  return (
                    <tr key={member.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 font-semibold text-text-primary">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                            style={{ backgroundColor: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-text-secondary font-mono text-[11px]">
                        {member.jobTitle} · {formatSeniority(member.seniority)}
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-text-primary">
                        {mJobs.length}
                      </td>
                      <td className="py-3 text-right font-mono text-text-primary">
                        {mHours}h <span className="text-text-tertiary">/ {mQuoted}h</span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold" style={{ color: mSlaRate >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {mSlaRate}%
                      </td>
                      <td className="py-3 text-right font-mono font-bold" style={{ color: 'var(--color-brand)' }}>
                        {mAccuracy}%
                      </td>
                      <td className="py-3 text-right">
                        {canViewUserAnalytics(currentUser, member, teams) ? (
                          <button
                            onClick={() => {
                              setSelectedStaffId(member.id);
                              setScopeMode('staff');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface text-text-secondary hover:text-text-primary text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Inspect Staff →
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-text-tertiary px-2 py-0.5 rounded border border-border/40 bg-surface/50"
                            title="Seniority access restricted: You can only inspect your own telemetry and those of team members lower in seniority."
                          >
                            <Lock className="w-3 h-3 text-text-tertiary" />
                            <span>Restricted</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      )}

      {scopeMode === 'staff' && (
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                {activeStaff.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-text-primary">
                    {activeStaff.name}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-subtle)',
                      color: 'var(--color-brand)'
                    }}
                  >
                    {formatSeniority(activeStaff.seniority)}
                  </span>
                  {activeStaff.id === currentUser.id && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Your Profile
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {activeStaff.jobTitle} · {teams.find(t => t.id === activeStaff.teamId)?.name || activeStaff.department || 'Creative Department'} · {activeStaff.weeklyCapacityHours || 40}h weekly contractual capacity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openReportModal(activeStaff.id)}
                className="px-3.5 py-1.5 rounded-xl border border-border hover:bg-surface text-xs font-semibold text-text-primary transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-brand" />
                <span>Export {activeStaff.name.split(' ')[0]}'s Dossier</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-mono text-text-tertiary">
                  <th className="pb-2.5 font-semibold">Deliverable</th>
                  <th className="pb-2.5 font-semibold">Category &amp; Stage</th>
                  <th className="pb-2.5 font-semibold text-right">Estimated</th>
                  <th className="pb-2.5 font-semibold text-right">Actual</th>
                  <th className="pb-2.5 font-semibold text-right">Variance</th>
                  <th className="pb-2.5 font-semibold text-center">Status</th>
                  <th className="pb-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {scopedJobs.map((job) => {
                  const actual = job.actualHours || job.actualEffortHours || 0;
                  const estimated = job.estimatedHours || 0;
                  const diff = actual - estimated;
                  const isOver = actual > estimated;

                  return (
                    <tr key={job.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 font-semibold text-text-primary">
                        <div className="font-mono text-[10px] text-text-tertiary flex items-center gap-1.5">
                          <span>{job.id}</span>
                          {(() => {
                            const imp = deliveryImpactLogs.find((l) => l.jobId === job.id);
                            if (!imp) return null;
                            const h = imp.estimatedDelayHours || imp.estimatedDelayDays * 8;
                            return (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  imp.status === 'active'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                +{h}h ext ({imp.status})
                              </span>
                            );
                          })()}
                        </div>
                        <div className="truncate max-w-xs">{job.title}</div>
                      </td>
                      <td className="py-3 text-text-secondary font-mono text-[11px]">
                        <div>{job.category}</div>
                        <div className="text-[10px] text-text-tertiary capitalize">{job.workflowStage.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 text-right font-mono text-text-secondary">
                        {estimated}h
                      </td>
                      <td className="py-3 text-right font-mono text-text-primary font-bold">
                        {actual}h
                      </td>
                      <td className="py-3 text-right font-mono font-bold" style={{ color: diff > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {diff >= 0 ? `+${diff}h` : `${diff}h`}
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-[11px] font-mono font-bold" style={{ color: job.status === 'completed' ? 'var(--color-success)' : job.status === 'blocked' ? 'var(--color-critical)' : 'var(--color-brand)' }}>
                          ● {job.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedJobId(job.id)}
                          className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface text-text-secondary hover:text-text-primary text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          View Job
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Staff Strategic Contributions & Leadership Endorsements */}
          {(() => {
            const staffContributions = contributions.filter(
              (c) => c.contributorId === activeStaff.id || c.contributorName === activeStaff.name
            );
            if (staffContributions.length === 0) return null;

            return (
              <div className="pt-4 border-t border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono text-text-secondary">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Strategic Contributions &amp; Executive Endorsements ({staffContributions.length})</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {staffContributions.filter((c) => c.status === 'VERIFIED' || c.status === 'RECOGNISED').length} Verified / Endorsed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {staffContributions.map((c) => {
                    const isRecognised = c.status === 'RECOGNISED';
                    const isVerified = c.status === 'VERIFIED';
                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl border bg-surface/70 space-y-1.5 text-xs"
                        style={{
                          borderColor: isRecognised
                            ? 'color-mix(in srgb, var(--color-success) 40%, transparent)'
                            : isVerified
                            ? 'color-mix(in srgb, var(--color-brand) 30%, transparent)'
                            : 'var(--color-border)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text-primary truncate">{c.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              isRecognised
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : isVerified
                                ? 'bg-brand/15 text-brand'
                                : 'bg-surface-elevated text-text-tertiary'
                            }`}
                          >
                            {isRecognised ? 'Leadership Endorsed' : isVerified ? 'Verified' : c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2">{c.impactMetrics}</p>
                        {c.recognitionNote && (
                          <div className="text-[10px] italic p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            &ldquo;{c.recognitionNote}&rdquo; — {c.recognisedByName || 'Leadership'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </SpotlightCard>
      )}

      {scopeMode === 'agency' && (
        <SpotlightCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Agency Departments &amp; Squad Alignment Matrix
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Cross-department comparative volume, quoting adherence, and on-time SLA metrics.
              </p>
            </div>
            <div className="text-xs font-mono text-text-tertiary">
              Active Squads: <strong>{teams.length} Teams</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {teams.map((t) => {
              const tJobs = jobs.filter((j) => j.teamId === t.id || (t.memberIds && t.memberIds.includes(j.assigneeId)));
              const tHours = tJobs.reduce((acc, j) => acc + (j.actualHours || j.actualEffortHours || 0), 0);
              const tQuoted = tJobs.reduce((acc, j) => acc + (j.estimatedHours || 0), 0);
              const tOverdue = tJobs.filter((j) => j.isAtRisk || (j.status !== 'completed' && new Date(j.dueDate).getTime() < Date.now())).length;
              const tSla = tJobs.length > 0 ? Math.round(((tJobs.length - tOverdue) / tJobs.length) * 100) : 100;

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border space-y-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{t.name}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{t.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: tSla >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {tSla}% SLA
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center font-mono">
                    <div className="p-2 rounded-lg bg-surface-elevated">
                      <div className="text-xs font-bold text-text-primary">{tJobs.length}</div>
                      <div className="text-[9px] text-text-tertiary">Jobs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-elevated">
                      <div className="text-xs font-bold text-text-primary">{tHours}h</div>
                      <div className="text-[9px] text-text-tertiary">Logged</div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-elevated">
                      <div className="text-xs font-bold text-text-primary">{t.memberIds?.length || 0}</div>
                      <div className="text-[9px] text-text-tertiary">Staff</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      setScopeMode('department');
                    }}
                    className="w-full py-1.5 rounded-lg border border-border hover:bg-surface-elevated text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Inspect Department Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Agency Strategic Contributions & Executive Commendations Ledger */}
          {(() => {
            const verified = contributions.filter((c) => c.status === 'VERIFIED' || c.status === 'RECOGNISED').length;
            const recognised = contributions.filter((c) => c.status === 'RECOGNISED').length;
            const saves = contributions.filter((c) => c.category === 'client_save').length;
            const process = contributions.filter((c) => c.category === 'process_innovation').length;

            return (
              <div className="pt-4 border-t border-border/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono text-text-secondary">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Executive Endorsements &amp; Strategic Value Ledger</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    {contributions.length} Logged Entries · {verified} Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  <div className="p-3 rounded-xl bg-surface border border-border text-center">
                    <div className="text-lg font-extrabold text-emerald-500">{recognised}</div>
                    <div className="text-[10px] text-text-tertiary uppercase mt-0.5">Leadership Endorsed</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border text-center">
                    <div className="text-lg font-extrabold text-brand">{verified}</div>
                    <div className="text-[10px] text-text-tertiary uppercase mt-0.5">Verified Impact</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border text-center">
                    <div className="text-lg font-extrabold text-amber-500">{saves}</div>
                    <div className="text-[10px] text-text-tertiary uppercase mt-0.5">Client Saves</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border text-center">
                    <div className="text-lg font-extrabold text-text-primary">{process}</div>
                    <div className="text-[10px] text-text-tertiary uppercase mt-0.5">Process Tools</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* 5. EMBEDDED FIELD MANUAL REFERENCE STRIP */}
      {/* ========================================================================= */}
      <SpotlightCard className="p-4 bg-surface-elevated border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: isPure && isDark ? 'var(--color-surface)' : actualColor,
                color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast,
                border: isPure && isDark ? '1px solid var(--color-border)' : undefined
              }}
            >
              <BookOpen className="w-4 h-4" style={{ color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast }} />
            </div>
            <div>
              <div className="font-bold text-xs text-text-primary">
                Need Guidance on Operational Thresholds or Variance Triaging?
              </div>
              <div className="text-[11px] text-text-secondary">
                Read the authoritative <strong>Operations Graph Field Manual</strong> covering multi-quadrant diagnostics, managerial action triggers, and color harmony rules.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openGuide('matrix')}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover font-bold text-xs text-text-primary transition-colors cursor-pointer"
            >
              Anomaly Action Matrix
            </button>
            <button
              onClick={() => openGuide('overview')}
              className="px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: isPure && isDark ? 'var(--color-surface)' : actualColor,
                color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast,
                border: isPure && isDark ? '1px solid var(--color-border)' : undefined
              }}
            >
              Open Interpretation Guide
            </button>
          </div>
        </div>
      </SpotlightCard>

      {/* ========================================================================= */}
      {/* 6. GRAPH INTERPRETATION FIELD MANUAL MODAL */}
      {/* ========================================================================= */}
      <GraphInterpretationModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        initialSection={guideInitialSection}
      />
    </div>
  );
};
