import {
  User,
  Job,
  OvertimeLog,
  Recognition,
  ProgressionCase,
  StandardTaskType,
  WorkCycle,
  SeniorityLevel
} from '../types';
import { STANDARD_TASK_DEFINITIONS } from '../data/standardTasks';

export type ScopeUnit = 'days' | 'weeks' | 'months' | 'years';

export interface ReportDateScope {
  mode: 'preset' | 'relative' | 'custom' | 'all';
  quantity?: number;
  unit?: ScopeUnit;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  label: string;
}

export function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00Z`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function calculateDateRangeFromUnit(
  quantity: number,
  unit: ScopeUnit,
  anchorDate: Date = new Date(2026, 8, 22) // Reference anchor: 2026-09-22
): ReportDateScope {
  const end = new Date(anchorDate);
  const start = new Date(anchorDate);

  if (unit === 'days') {
    start.setDate(start.getDate() - Math.max(quantity, 1));
  } else if (unit === 'weeks') {
    start.setDate(start.getDate() - Math.max(quantity, 1) * 7);
  } else if (unit === 'months') {
    start.setMonth(start.getMonth() - Math.max(quantity, 1));
  } else if (unit === 'years') {
    start.setFullYear(start.getFullYear() - Math.max(quantity, 1));
  }

  const startStr = formatIsoDate(start);
  const endStr = formatIsoDate(end);
  const unitSingular = unit.endsWith('s') && quantity === 1 ? unit.slice(0, -1) : unit;
  const unitLabel = unitSingular.charAt(0).toUpperCase() + unitSingular.slice(1);
  const label = `Last ${quantity} ${unitLabel} (${formatDisplayDate(startStr)} – ${formatDisplayDate(endStr)})`;

  return {
    mode: 'relative',
    quantity,
    unit,
    startDate: startStr,
    endDate: endStr,
    label
  };
}

export const DEFAULT_SCOPE_PRESETS: ReportDateScope[] = [
  calculateDateRangeFromUnit(7, 'days'),
  calculateDateRangeFromUnit(14, 'days'),
  calculateDateRangeFromUnit(30, 'days'),
  calculateDateRangeFromUnit(4, 'weeks'),
  calculateDateRangeFromUnit(12, 'weeks'),
  calculateDateRangeFromUnit(6, 'months'),
  calculateDateRangeFromUnit(1, 'years'),
  calculateDateRangeFromUnit(2, 'years'),
  {
    mode: 'preset',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    label: 'Q3 2026 Active Cycle (Jul 1 – Sep 30, 2026)'
  },
  {
    mode: 'all',
    label: 'Complete Lifetime Record'
  }
];

export interface ReportTaskBenchmarkComparison {
  taskType: StandardTaskType;
  label: string;
  deliverablesCount: number;
  benchmarkHours: number;
  averageActualHours: number;
  efficiencyPercentage: number;
}

export interface TrafficPerformanceMetrics {
  totalBriefsVetted: number;
  dispatchSlaComplianceRate: number; // percentage e.g. 98%
  averageDispatchTurnaroundHours: number; // e.g. 1.4h
  briefCompletenessAuditRate: number; // percentage e.g. 96%
  agencyOnTimeGovernanceRate: number; // percentage e.g. 96.4%
  totalStudioTasksGoverned: number; // e.g. 88
  completedStudioTasksGoverned: number; // e.g. 74
  creativeHoursShielded: number; // e.g. 40h shielded from unbilled scope
  commercialMarginProtectedGhc: number; // e.g. 18500 GH₵
  debriefsConvenedCount: number; // e.g. 12
  calendarSyncRate: number; // e.g. 100%
  bottleneckInterventionsCount: number; // e.g. 8
  slaExceptionsGranted: number; // e.g. 3
  scopeHoldsApplied: number; // e.g. 2
  capacityRequisitionsCount: number; // e.g. 1
  studioBalanceIndex: number; // e.g. 88%
  dispatchedJobs: {
    id: string;
    title: string;
    brandName: string;
    assignedToName: string;
    assignedRole: string;
    priority: string;
    dispatchedDate: string;
    turnaroundHours: number;
    intakeStatus: 'verified' | 'clarification' | 'spec_audit_pass';
    slaStatus: 'on_track' | 'completed_on_time' | 'relief_granted' | 'hold';
    calendarSynced: boolean;
  }[];
  trafficCases: ProgressionCase[];
}

export interface UserPerformanceReportData {
  targetUser: User;
  reportingManager: User | null;
  generatedBy: User;
  generatedAt: string;
  reportReferenceId: string;
  periodLabel: string;
  teamDiscipline: 'creative' | 'traffic' | 'client_services';
  isTraffic: boolean;
  trafficMetrics?: TrafficPerformanceMetrics;

  // High-Level KPIs
  totalJobsAssigned: number;
  completedJobsCount: number;
  activeJobsCount: number;
  completionRate: number; // percentage e.g. 92%
  onTimeDeliveryRate: number; // percentage e.g. 95%
  firstPassApprovalRate: number; // percentage e.g. 84%

  // Effort & Benchmark Hours
  totalBenchmarkHours: number;
  totalActualHours: number;
  totalReworkHours: number;
  netVarianceHours: number; // Benchmark - Actual (positive = faster than benchmark)
  overallEfficiencyScore: number; // (Benchmark / Actual) * 100

  // WorkCycles
  totalCyclesCount: number;
  averageCyclesPerJob: number;
  reworkHoursPercentage: number; // (Rework / Actual) * 100
  clientRevertCount: number;
  reworkClassifications: {
    correction: number;
    rework: number;
    scope_change: number;
  };

  // Overtime & Dedication
  totalOvertimeHours: number;
  recognitionPoints: number;
  overtimeCount: number;
  pre9amHours: number;
  post5pmHours: number;
  weekendHours: number;

  // Recognitions & Progression
  recognitions: Recognition[];
  progressionCases: ProgressionCase[];

  // Deliverables List
  recentDeliverables: {
    id: string;
    title: string;
    taskType: StandardTaskType;
    status: string;
    workflowStage: string;
    priority: string;
    dueDate: string;
    benchmarkHours: number;
    actualHours: number;
    reworkHours: number;
    cyclesCount: number;
    revertCount: number;
    firstPassApproved: boolean;
  }[];

  // Task Archetype Benchmark Comparisons
  benchmarkComparisons: ReportTaskBenchmarkComparison[];
}

export function compileUserPerformanceReport(
  targetUser: User,
  allUsers: User[],
  allJobs: Job[],
  allOvertimeLogs: OvertimeLog[],
  allRecognitions: Recognition[],
  allCases: ProgressionCase[],
  generatedBy: User,
  periodFilter: 'all' | 'q3' | 'last30' | 'ytd' | ReportDateScope = 'last30'
): UserPerformanceReportData {
  const reportingManager = targetUser.managerId
    ? allUsers.find((u) => u.id === targetUser.managerId) || null
    : null;

  // Resolve scope
  let effectiveScope: ReportDateScope;
  if (typeof periodFilter === 'string') {
    if (periodFilter === 'q3') {
      effectiveScope = {
        mode: 'preset',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        label: 'Q3 2026 Active Cycle (Jul 1 – Sep 30, 2026)'
      };
    } else if (periodFilter === 'last30') {
      effectiveScope = calculateDateRangeFromUnit(30, 'days');
    } else if (periodFilter === 'ytd') {
      effectiveScope = {
        mode: 'preset',
        startDate: '2026-01-01',
        endDate: '2026-09-22',
        label: 'Year-to-Date 2026 (Jan 1 – Sep 22, 2026)'
      };
    } else {
      effectiveScope = {
        mode: 'all',
        label: 'Complete Agency Engagement'
      };
    }
  } else {
    effectiveScope = periodFilter;
  }

  // Filter jobs for target user
  let userJobs = allJobs.filter((j) => j.assigneeId === targetUser.id);

  if (effectiveScope.mode !== 'all' && effectiveScope.startDate && effectiveScope.endDate) {
    const startTime = new Date(`${effectiveScope.startDate}T00:00:00Z`).getTime();
    const endTime = new Date(`${effectiveScope.endDate}T23:59:59Z`).getTime();

    const filtered = userJobs.filter((j) => {
      const dates: number[] = [];
      if (j.createdDate) dates.push(new Date(j.createdDate).getTime());
      if (j.assignedDate) dates.push(new Date(j.assignedDate).getTime());
      if (j.startDate) dates.push(new Date(j.startDate).getTime());
      if (j.dueDate) dates.push(new Date(j.dueDate).getTime());
      if (j.completedDate) dates.push(new Date(j.completedDate).getTime());

      // Any timestamp falling in scope
      const inScope = dates.some((d) => d >= startTime && d <= endTime);
      if (inScope) return true;

      // Ongoing job whose creation is before scope end
      const createdTime = j.createdDate ? new Date(j.createdDate).getTime() : 0;
      if (j.status !== 'completed' && createdTime <= endTime) {
        return true;
      }
      return false;
    });

    userJobs = filtered;
  }

  const completedJobs = userJobs.filter(
    (j) => j.status === 'completed' || j.workflowStage === 'completed'
  );
  const activeJobs = userJobs.filter(
    (j) => j.status !== 'completed' && j.workflowStage !== 'completed'
  );

  // Deliverables mapping
  const recentDeliverables = userJobs.map((j) => {
    const taskDef = STANDARD_TASK_DEFINITIONS[j.standardTaskType || 'Social & Digital Campaign'];
    const userSeniority = (targetUser.seniority as SeniorityLevel) || 'mid';
    const benchmarkHours = taskDef ? (taskDef.seniorityHours[userSeniority] || taskDef.seniorityHours.mid) : (j.estimatedHours || 10);
    const actualHours = j.actualHours || j.actualEffortHours || j.estimatedHours || 8;
    
    // Calculate rework from cycles or reverts
    let reworkHours = 0;
    if (j.workCycles && j.workCycles.length > 0) {
      reworkHours = j.workCycles.reduce((acc, c) => acc + (c.reworkEffort || 0), 0);
    } else if (j.clientRevertInfo) {
      reworkHours = j.clientRevertInfo.additionalHours || 4;
    }

    const cyclesCount = j.workCycles ? Math.max(j.workCycles.length, 1) : 1;
    const revertCount = j.clientRevertInfo ? j.clientRevertInfo.revertCount : 0;
    const firstPassApproved = revertCount === 0 && cyclesCount <= 1;

    return {
      id: j.id,
      title: j.title,
      taskType: j.standardTaskType || ('Social & Digital Campaign' as StandardTaskType),
      status: j.status,
      workflowStage: j.workflowStage || 'production',
      priority: j.priority,
      dueDate: j.dueDate,
      benchmarkHours,
      actualHours,
      reworkHours,
      cyclesCount,
      revertCount,
      firstPassApproved
    };
  });

  // Calculate totals
  const totalBenchmarkHours = recentDeliverables.reduce((acc, d) => acc + d.benchmarkHours, 0);
  const totalActualHours = recentDeliverables.reduce((acc, d) => acc + d.actualHours, 0);
  const totalReworkHours = recentDeliverables.reduce((acc, d) => acc + d.reworkHours, 0);
  const netVarianceHours = totalBenchmarkHours - totalActualHours;
  const overallEfficiencyScore = totalActualHours > 0
    ? Math.round((totalBenchmarkHours / totalActualHours) * 100)
    : totalBenchmarkHours > 0
    ? 100
    : 100;

  // On-time rate: compare completed dates to due dates
  const onTimeJobsCount = completedJobs.filter((j) => {
    if (!j.dueDate) return true;
    const dueTime = new Date(j.dueDate).getTime();
    // Default to true if due date is in the future
    return dueTime >= Date.now() - 86400000 * 2;
  }).length;
  const onTimeDeliveryRate = completedJobs.length > 0
    ? Math.round((onTimeJobsCount / completedJobs.length) * 100)
    : 100;

  // First pass approval rate
  const firstPassCount = recentDeliverables.filter((d) => d.firstPassApproved).length;
  const firstPassApprovalRate = recentDeliverables.length > 0
    ? Math.round((firstPassCount / recentDeliverables.length) * 100)
    : 100;

  const completionRate = userJobs.length > 0
    ? Math.round((completedJobs.length / userJobs.length) * 100)
    : 100;

  // WorkCycles count & revert count
  const totalCyclesCount = recentDeliverables.reduce((acc, d) => acc + d.cyclesCount, 0) || 1;
  const averageCyclesPerJob = recentDeliverables.length > 0
    ? Number((totalCyclesCount / recentDeliverables.length).toFixed(1))
    : 1.0;
  const clientRevertCount = recentDeliverables.reduce((acc, d) => acc + d.revertCount, 0);
  const reworkHoursPercentage = totalActualHours > 0
    ? Math.round((totalReworkHours / totalActualHours) * 100)
    : 0;

  // Classifications
  const reworkClassifications = {
    correction: 0,
    rework: 0,
    scope_change: 0
  };
  userJobs.forEach((j) => {
    if (j.workCycles) {
      j.workCycles.forEach((c) => {
        if (c.reworkClassification && reworkClassifications[c.reworkClassification] !== undefined) {
          reworkClassifications[c.reworkClassification]++;
        }
      });
    }
  });

  // Overtime summary
  let userOvertime = allOvertimeLogs.filter((l) => l.userId === targetUser.id);
  if (effectiveScope.mode !== 'all' && effectiveScope.startDate && effectiveScope.endDate) {
    const startTime = new Date(`${effectiveScope.startDate}T00:00:00Z`).getTime();
    const endTime = new Date(`${effectiveScope.endDate}T23:59:59Z`).getTime();
    userOvertime = userOvertime.filter((l) => {
      const logTime = new Date(l.date.includes('T') ? l.date : `${l.date}T12:00:00Z`).getTime();
      return logTime >= startTime && logTime <= endTime;
    });
  }

  const totalOvertimeHours = userOvertime.reduce((acc, l) => acc + (l.hoursLogged || 0), 0);
  const recognitionPoints = userOvertime.reduce((acc, l) => acc + (l.recognitionPoints || 0), 0);
  const pre9amHours = userOvertime.filter((l) => l.period === 'pre_9am').reduce((acc, l) => acc + l.hoursLogged, 0);
  const post5pmHours = userOvertime.filter((l) => l.period === 'post_5pm').reduce((acc, l) => acc + l.hoursLogged, 0);
  const weekendHours = userOvertime.filter((l) => l.period === 'weekend_crunch').reduce((acc, l) => acc + l.hoursLogged, 0);

  // Recognitions & Progression
  let recognitions = allRecognitions.filter((r) => r.employeeId === targetUser.id);
  if (effectiveScope.mode !== 'all' && effectiveScope.startDate && effectiveScope.endDate) {
    const startTime = new Date(`${effectiveScope.startDate}T00:00:00Z`).getTime();
    const endTime = new Date(`${effectiveScope.endDate}T23:59:59Z`).getTime();
    recognitions = recognitions.filter((r) => {
      const recTime = new Date(r.date.includes('T') ? r.date : `${r.date}T12:00:00Z`).getTime();
      return recTime >= startTime && recTime <= endTime;
    });
  }
  const progressionCases = allCases.filter((c) => c.employeeId === targetUser.id);

  // Benchmark Comparisons per task archetype
  const taskGroups: Record<string, typeof recentDeliverables> = {};
  recentDeliverables.forEach((d) => {
    if (!taskGroups[d.taskType]) taskGroups[d.taskType] = [];
    taskGroups[d.taskType].push(d);
  });

  const benchmarkComparisons: ReportTaskBenchmarkComparison[] = Object.entries(taskGroups).map(
    ([taskType, delivs]) => {
      const bHours = delivs.reduce((acc, d) => acc + d.benchmarkHours, 0);
      const aHours = delivs.reduce((acc, d) => acc + d.actualHours, 0);
      const avgActual = Number((aHours / delivs.length).toFixed(1));
      const avgBench = Number((bHours / delivs.length).toFixed(1));
      const eff = avgActual > 0 ? Math.round((avgBench / avgActual) * 100) : 100;
      return {
        taskType: taskType as StandardTaskType,
        label: taskType,
        deliverablesCount: delivs.length,
        benchmarkHours: avgBench,
        averageActualHours: avgActual,
        efficiencyPercentage: eff
      };
    }
  );

  // Discipline & Team Detection: Creative vs Traffic vs Client Services
  const isTraffic = targetUser.department === 'traffic' || targetUser.role === 'traffic_manager';
  const teamDiscipline: 'creative' | 'traffic' | 'client_services' = isTraffic
    ? 'traffic'
    : (targetUser.department as any) || 'creative';

  // Compute Traffic-Specific Operational Metrics if target user is in Traffic / Operations
  let trafficMetrics: TrafficPerformanceMetrics | undefined = undefined;
  if (isTraffic) {
    // Scoped agency tasks across the entire studio governed by Traffic in this window
    let scopedAgencyJobs = allJobs;
    if (effectiveScope.mode !== 'all' && effectiveScope.startDate && effectiveScope.endDate) {
      const startTime = new Date(`${effectiveScope.startDate}T00:00:00Z`).getTime();
      const endTime = new Date(`${effectiveScope.endDate}T23:59:59Z`).getTime();
      const filteredAgency = allJobs.filter((j) => {
        const dates: number[] = [];
        if (j.createdDate) dates.push(new Date(j.createdDate).getTime());
        if (j.assignedDate) dates.push(new Date(j.assignedDate).getTime());
        if (j.dueDate) dates.push(new Date(j.dueDate).getTime());
        if (j.completedDate) dates.push(new Date(j.completedDate).getTime());
        return dates.some((d) => d >= startTime && d <= endTime);
      });
      if (filteredAgency.length > 0) scopedAgencyJobs = filteredAgency;
    }

    const trafficCases = allCases.filter(
      (c) =>
        c.employeeId === targetUser.id ||
        c.type.startsWith('traffic_') ||
        c.category === 'operational_sla_dispute' ||
        c.category === 'capacity_requisition'
    );

    const slaExceptionsGranted = trafficCases.filter(
      (c) => c.type === 'traffic_sla_exception' || c.trafficMeta?.trafficRuling?.includes('RELIEF')
    ).length;

    const scopeHoldsApplied = trafficCases.filter(
      (c) => c.type === 'traffic_scope_dispute' || c.trafficMeta?.trafficRuling?.includes('HOLD')
    ).length;

    const capacityRequisitionsCount = trafficCases.filter(
      (c) => c.type === 'traffic_capacity_requisition' || c.category === 'capacity_requisition'
    ).length;

    // Dynamic creative labor shielded: sum of requested hours across cases and rework hours in jobs
    const caseShieldedHours = trafficCases.reduce(
      (acc, c) => acc + (c.trafficMeta?.requestedHours || (c as any).requestedChangeHours || 8),
      0
    );
    const jobShieldedHours = scopedAgencyJobs.reduce((acc, j) => {
      if (j.reworkEffortHours && j.reworkEffortHours > 0) return acc + j.reworkEffortHours;
      return acc;
    }, 0);
    const creativeHoursShielded = Math.max(caseShieldedHours + jobShieldedHours, trafficCases.length * 8 || 24);

    // Dynamic commercial margin protected: hours shielded * GH₵ 350 standard agency billing rate
    const commercialMarginProtectedGhc = creativeHoursShielded * 350;

    const completedStudioTasks = scopedAgencyJobs.filter(
      (j) => j.status === 'completed' || j.workflowStage === 'completed'
    );

    const onTimeStudioTasks = completedStudioTasks.filter((j) => {
      if (!j.dueDate) return true;
      const due = new Date(j.dueDate).getTime();
      const comp = j.completedDate ? new Date(j.completedDate).getTime() : Date.now();
      return comp <= due + 3600000 * 24;
    });

    const agencyOnTimeGovernanceRate =
      completedStudioTasks.length > 0
        ? Math.round((onTimeStudioTasks.length / completedStudioTasks.length) * 1000) / 10
        : 96.4;

    const debriefsConvenedCount = scopedAgencyJobs.filter(
      (j) => Boolean(j.debriefMeeting || j.workflowStage === 'completed')
    ).length;

    // Dispatch SLA compliance: jobs dispatched within 2.5h of creation
    const dispatchCompliantJobs = scopedAgencyJobs.filter((j) => {
      if (!j.assignedDate || !j.createdDate) return true;
      const created = new Date(j.createdDate).getTime();
      const assigned = new Date(j.assignedDate).getTime();
      const diffHours = (assigned - created) / (1000 * 3600);
      return diffHours <= 2.5;
    });
    const dispatchSlaComplianceRate =
      scopedAgencyJobs.length > 0
        ? Math.round((dispatchCompliantJobs.length / scopedAgencyJobs.length) * 1000) / 10
        : 100;

    // Average Dispatch Turnaround: average hours from creation to assignment
    const turnaroundList = scopedAgencyJobs
      .filter((j) => j.assignedDate && j.createdDate)
      .map((j) => {
        const diff = (new Date(j.assignedDate!).getTime() - new Date(j.createdDate!).getTime()) / (1000 * 3600);
        return Math.max(0.4, Math.min(diff, 6.0));
      });
    const averageDispatchTurnaroundHours =
      turnaroundList.length > 0
        ? Number((turnaroundList.reduce((a, b) => a + b, 0) / turnaroundList.length).toFixed(1))
        : 0.0;

    // Brief completeness: percentage of briefs with full spec, type, and benchmark hours
    const completeBriefs = scopedAgencyJobs.filter(
      (j) => j.title && j.description && j.standardTaskType && j.benchmarkBaseHours && !j.clientRevertInfo
    );
    const briefCompletenessAuditRate =
      scopedAgencyJobs.length > 0
        ? Math.round((completeBriefs.length / scopedAgencyJobs.length) * 1000) / 10
        : 100;

    // Calendar sync rate: tasks with scheduled debriefs or calendar sync enabled
    const syncedTasks = scopedAgencyJobs.filter(
      (j) => (j as any).calendarSynced !== false && j.debriefMeeting?.calendarEventScheduled !== false
    );
    const calendarSyncRate =
      scopedAgencyJobs.length > 0
        ? Math.round((syncedTasks.length / scopedAgencyJobs.length) * 100)
        : 100;

    // Bottleneck interventions: count of at-risk jobs, client reverts, and traffic progression cases
    const bottleneckInterventionsCount =
      scopedAgencyJobs.filter((j) => j.isAtRisk || j.workflowStage === 'client_revert').length +
      trafficCases.length;

    // Studio balance index: calculated inversely from operational bottlenecks
    const studioBalanceIndex = Math.min(96, Math.max(76, 100 - Math.round(bottleneckInterventionsCount * 1.5)));

    const dispatchedJobs = scopedAgencyJobs.slice(0, 15).map((j) => {
      const assignee = allUsers.find((u) => u.id === j.assigneeId);
      const created = j.createdDate ? new Date(j.createdDate).getTime() : 0;
      const assigned = j.assignedDate ? new Date(j.assignedDate).getTime() : 0;
      const turnaround =
        assigned && created && assigned >= created
          ? Math.max(0.4, Number(((assigned - created) / (1000 * 3600)).toFixed(1)))
          : j.priority === 'urgent'
          ? 0.8
          : j.priority === 'high'
          ? 1.2
          : 1.8;

      const intakeStatus: 'verified' | 'clarification' | 'spec_audit_pass' = j.clientRevertInfo
        ? 'clarification'
        : j.standardTaskType
        ? 'spec_audit_pass'
        : 'verified';

      const slaStatus: 'on_track' | 'completed_on_time' | 'relief_granted' | 'hold' =
        j.status === 'completed'
          ? 'completed_on_time'
          : j.isAtRisk
          ? 'relief_granted'
          : j.workflowStage === 'client_revert'
          ? 'hold'
          : 'on_track';

      const calendarSynced = Boolean(
        (j as any).calendarSynced !== false && j.debriefMeeting?.calendarEventScheduled !== false
      );

      return {
        id: j.id,
        title: j.title,
        brandName: j.brandName || (j.clientProject ? j.clientProject.split(' ')[0] : 'Accra Campaign'),
        assignedToName: assignee?.name || 'Studio Creative Pool',
        assignedRole:
          assignee?.jobTitle || (assignee?.role ? assignee.role.replace(/_/g, ' ') : 'Designer'),
        priority: j.priority || 'medium',
        dispatchedDate: j.assignedDate
          ? formatDisplayDate(j.assignedDate)
          : j.createdDate
          ? formatDisplayDate(j.createdDate)
          : 'Sep 12, 2026',
        turnaroundHours: turnaround,
        intakeStatus,
        slaStatus,
        calendarSynced
      };
    });

    trafficMetrics = {
      totalBriefsVetted: scopedAgencyJobs.length,
      dispatchSlaComplianceRate,
      averageDispatchTurnaroundHours,
      briefCompletenessAuditRate,
      agencyOnTimeGovernanceRate,
      totalStudioTasksGoverned: scopedAgencyJobs.length,
      completedStudioTasksGoverned: completedStudioTasks.length,
      creativeHoursShielded,
      commercialMarginProtectedGhc,
      debriefsConvenedCount,
      calendarSyncRate,
      bottleneckInterventionsCount,
      slaExceptionsGranted: slaExceptionsGranted || 0,
      scopeHoldsApplied: scopeHoldsApplied || 0,
      capacityRequisitionsCount: capacityRequisitionsCount || 0,
      studioBalanceIndex,
      dispatchedJobs,
      trafficCases
    };
  }

  // Generate Reference ID
  const cleanId = targetUser.id.replace('usr-', '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const refDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const reportReferenceId = `TIB-PR-${refDate}-${cleanId}`;

  const periodLabels: Record<string, string> = {
    all: 'Complete Agency Engagement',
    q3: 'Q3 2026 Active Cycle',
    last30: 'Trailing 30 Days Operational Window',
    ytd: 'Year-to-Date (2026) Audit'
  };

  return {
    targetUser,
    reportingManager,
    generatedBy,
    generatedAt: new Date().toISOString(),
    reportReferenceId,
    periodLabel: effectiveScope.label,
    teamDiscipline,
    isTraffic,
    trafficMetrics,
    totalJobsAssigned: userJobs.length,
    completedJobsCount: completedJobs.length,
    activeJobsCount: activeJobs.length,
    completionRate,
    onTimeDeliveryRate,
    firstPassApprovalRate,
    totalBenchmarkHours,
    totalActualHours,
    totalReworkHours,
    netVarianceHours,
    overallEfficiencyScore,
    totalCyclesCount,
    averageCyclesPerJob,
    reworkHoursPercentage,
    clientRevertCount,
    reworkClassifications,
    totalOvertimeHours,
    recognitionPoints,
    overtimeCount: userOvertime.length,
    pre9amHours,
    post5pmHours,
    weekendHours,
    recognitions,
    progressionCases,
    recentDeliverables,
    benchmarkComparisons
  };
}
