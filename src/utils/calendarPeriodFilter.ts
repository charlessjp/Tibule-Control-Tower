import { Job, ArchivedTaskRecord } from '../types';

export type CalendarPeriodKey =
  | 'month_current'
  | 'q4_2026'
  | 'q3_2026'
  | 'q2_2026'
  | 'q1_2026'
  | 'year_2026'
  | 'custom'
  | 'all_records';

export interface CalendarPeriodConfig {
  id: CalendarPeriodKey;
  label: string;
  shortLabel: string;
  badge: string;
  dateRange: string;
  description: string;
  isCurrent?: boolean;
}

export const CALENDAR_PERIODS: CalendarPeriodConfig[] = [
  {
    id: 'month_current',
    label: 'Current Month (October 2026)',
    shortLabel: 'This Month',
    badge: 'Oct 2026',
    dateRange: 'Oct 1, 2026 – Oct 31, 2026',
    description: 'Active operating month deliverable tracking and capacity load',
    isCurrent: true
  },
  {
    id: 'q4_2026',
    label: 'Q4 2026 (Fourth Quarter)',
    shortLabel: 'Q4 2026',
    badge: '2026-Q4',
    dateRange: 'Oct 1, 2026 – Dec 31, 2026',
    description: 'Current operating cycle deliverables, active capacity pipelines, and SLAs',
    isCurrent: true
  },
  {
    id: 'q3_2026',
    label: 'Q3 2026 (Third Quarter)',
    shortLabel: 'Q3 2026',
    badge: '2026-Q3',
    dateRange: 'Jul 1, 2026 – Sep 30, 2026',
    description: 'Closed quarter performance metrics, archived tasks, and audited SLA results'
  },
  {
    id: 'q2_2026',
    label: 'Q2 2026 (Second Quarter)',
    shortLabel: 'Q2 2026',
    badge: '2026-Q2',
    dateRange: 'Apr 1, 2026 – Jun 30, 2026',
    description: 'Quarter 2 audited deliverable records and team throughput benchmarks'
  },
  {
    id: 'q1_2026',
    label: 'Q1 2026 (First Quarter)',
    shortLabel: 'Q1 2026',
    badge: '2026-Q1',
    dateRange: 'Jan 1, 2026 – Mar 31, 2026',
    description: 'Quarter 1 kickoff deliverable records and foundational operations'
  },
  {
    id: 'year_2026',
    label: 'Full Year 2026 (Annual Horizon)',
    shortLabel: 'Full Year 2026',
    badge: 'Annual 2026',
    dateRange: 'Jan 1, 2026 – Dec 31, 2026',
    description: 'Comprehensive 12-month performance across all 2026 operating cycles'
  },
  {
    id: 'custom',
    label: 'Custom Date Window',
    shortLabel: 'Custom Range',
    badge: 'Custom',
    dateRange: 'User-Selected Range',
    description: 'Customized date range filter with start and end milestones'
  },
  {
    id: 'all_records',
    label: 'All Historic & Active Records',
    shortLabel: 'All Records',
    badge: 'All Time',
    dateRange: 'Complete Agency Archives',
    description: 'Unfiltered multi-year records across live sprint and historic vaults'
  }
];

export function isJobInCalendarPeriod(
  job: Job,
  period: CalendarPeriodKey,
  customRange?: { startDate?: string; endDate?: string }
): boolean {
  if (period === 'all_records') return true;

  if (period === 'custom' && customRange?.startDate && customRange?.endDate) {
    const startTs = new Date(customRange.startDate).getTime();
    // End date inclusive to 23:59:59
    const endTs = new Date(customRange.endDate).getTime() + 86400000 - 1;

    const dates = [job.createdDate, job.dueDate, job.startDate, job.completedDate, job.assignedDate]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (dates.length === 0) return true;
    return dates.some((ts) => ts >= startTs && ts <= endTs);
  }

  const dates = [job.createdDate, job.dueDate, job.startDate, job.completedDate]
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime());

  if (period === 'year_2026') {
    return dates.some((ts) => new Date(ts).getFullYear() === 2026) || job.status !== 'completed';
  }

  if (period === 'month_current') {
    const hasOct = dates.some((ts) => {
      const d = new Date(ts);
      return d.getFullYear() === 2026 && d.getMonth() === 9; // October is 9 in 0-indexed JS Date
    });
    return hasOct || job.status !== 'completed';
  }

  if (period === 'q4_2026') {
    const hasQ4 = dates.some((ts) => {
      const d = new Date(ts);
      return d.getFullYear() === 2026 && d.getMonth() >= 9 && d.getMonth() <= 11;
    });
    return hasQ4 || job.status !== 'completed';
  }

  if (period === 'q3_2026') {
    return dates.some((ts) => {
      const d = new Date(ts);
      return d.getFullYear() === 2026 && d.getMonth() >= 6 && d.getMonth() <= 8;
    });
  }

  if (period === 'q2_2026') {
    return dates.some((ts) => {
      const d = new Date(ts);
      return d.getFullYear() === 2026 && d.getMonth() >= 3 && d.getMonth() <= 5;
    });
  }

  if (period === 'q1_2026') {
    return dates.some((ts) => {
      const d = new Date(ts);
      return d.getFullYear() === 2026 && d.getMonth() >= 0 && d.getMonth() <= 2;
    });
  }

  return true;
}

export function isArchivedInCalendarPeriod(
  task: ArchivedTaskRecord,
  period: CalendarPeriodKey,
  customRange?: { startDate?: string; endDate?: string }
): boolean {
  if (period === 'all_records') return true;

  if (period === 'custom' && customRange?.startDate && customRange?.endDate) {
    const startTs = new Date(customRange.startDate).getTime();
    const endTs = new Date(customRange.endDate).getTime() + 86400000 - 1;
    const taskDates = [task.completedDate, task.createdDate]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (taskDates.length === 0) return true;
    return taskDates.some((ts) => ts >= startTs && ts <= endTs);
  }

  if (period === 'year_2026') {
    return task.quarter?.startsWith('2026') ?? false;
  }

  if (period === 'q4_2026' || period === 'month_current') {
    return task.quarter === '2026-Q4';
  }

  if (period === 'q3_2026') {
    return task.quarter === '2026-Q3';
  }

  if (period === 'q2_2026') {
    return task.quarter === '2026-Q2';
  }

  if (period === 'q1_2026') {
    return task.quarter === '2026-Q1';
  }

  return false;
}

export function convertArchivedTaskToJob(task: ArchivedTaskRecord): Job {
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

export function filterDeliverablesByPeriod(
  jobs: Job[],
  archivedTasks: ArchivedTaskRecord[],
  period: CalendarPeriodKey,
  customRange?: { startDate?: string; endDate?: string }
): {
  periodJobs: Job[];
  periodArchived: ArchivedTaskRecord[];
  allPeriodJobs: Job[];
} {
  const periodJobs = jobs.filter((j) => isJobInCalendarPeriod(j, period, customRange));
  const periodArchived = (archivedTasks || []).filter((t) => isArchivedInCalendarPeriod(t, period, customRange));
  const convertedArchived = periodArchived.map(convertArchivedTaskToJob);
  const allPeriodJobs = [...periodJobs, ...convertedArchived];

  return {
    periodJobs,
    periodArchived,
    allPeriodJobs
  };
}
