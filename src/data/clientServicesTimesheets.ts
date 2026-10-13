import {
  CSTimesheetEntry,
  CSDiscrepancyAlert,
  CSDisciplineId,
  CSReportingLevel,
  User,
  Job,
  EmployeeDisciplineAssignment
} from '../types';

/**
 * Returns formatted dates for Monday through Friday of the current operating week.
 */
export function getCurrentOperatingWeekDates(): { [dayIndex: number]: string } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const dates: { [dayIndex: number]: string } = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates[i] = d.toISOString().slice(0, 10);
  }
  return dates;
}

const weekDates = getCurrentOperatingWeekDates();
const mon = weekDates[0] || '2026-09-14';
const tue = weekDates[1] || '2026-09-15';
const wed = weekDates[2] || '2026-09-16';
const thu = weekDates[3] || '2026-09-17';
const fri = weekDates[4] || '2026-09-18';

/**
 * Seed Timesheet Entries for Client Services team members.
 * Strictly Client Services practitioners across the 5 confirmed hierarchy levels.
 * Universal 40.0h capacity baseline per week.
 */
export const INITIAL_CS_TIMESHEET_ENTRIES: CSTimesheetEntry[] = [
  // --- Michael Chen (Senior Account Manager) - Total: 42.5h (OVERTIME > 40h Flagged) ---
  {
    id: 'cst-001',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    department: 'client_services',
    jobId: 'CT-1842',
    jobTitle: 'Zenith Bank - Digital Q4 Media Spend & Auction Pacing',
    clientName: 'Zenith Bank Ghana',
    disciplineId: 'digital_media',
    disciplineName: 'Digital Media (Strategy, Buying, Reporting)',
    date: mon,
    hours: 8.5,
    description: 'Paced programmatic display auctions and coordinated Q4 performance conversion pixels.',
    isBillable: true,
    loggedAt: `${mon}T17:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-002',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    department: 'client_services',
    jobId: 'CT-1842',
    jobTitle: 'Zenith Bank - Digital Q4 Media Spend & Auction Pacing',
    clientName: 'Zenith Bank Ghana',
    disciplineId: 'digital_media',
    disciplineName: 'Digital Media (Strategy, Buying, Reporting)',
    date: tue,
    hours: 9.0,
    description: 'Deep dive into ROAS conversion tracking and Google Ads cost-per-acquisition audit.',
    isBillable: true,
    loggedAt: `${tue}T18:00:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-003',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    department: 'client_services',
    jobId: 'CT-1848',
    jobTitle: 'Telecel Ghana - Brand Relaunch Strategy Architecture',
    clientName: 'Telecel Ghana',
    disciplineId: 'strategy',
    disciplineName: 'Strategy (Media, Content)',
    date: wed,
    hours: 8.0,
    description: 'Media mix modeling and cross-channel strategic reach architecture sync with client leadership.',
    isBillable: true,
    loggedAt: `${wed}T17:00:00Z`,
    source: 'manual_entry'
  },
  {
    id: 'cst-004',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    department: 'client_services',
    jobId: 'CT-1842',
    jobTitle: 'Zenith Bank - Digital Q4 Media Spend & Auction Pacing',
    clientName: 'Zenith Bank Ghana',
    disciplineId: 'digital_media',
    disciplineName: 'Digital Media (Strategy, Buying, Reporting)',
    date: thu,
    hours: 9.0,
    description: 'High-urgency auction bid adjustments and weekly media reporting deck compilation.',
    isBillable: true,
    loggedAt: `${thu}T18:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-005',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    department: 'client_services',
    jobId: 'CT-1850',
    jobTitle: 'Account Management & Client Brief Reviews',
    clientName: 'Multiple Accounts',
    disciplineId: 'account_management',
    disciplineName: 'Account Management & Coordination',
    date: fri,
    hours: 8.0,
    description: 'Portfolio-wide weekly status calls, SLA check-ins, and junior AM mentorship reviews.',
    isBillable: false,
    loggedAt: `${fri}T16:30:00Z`,
    source: 'manual_entry'
  },

  // --- Selorm Adams (Account Manager) - Total: 38.0h (Optimal < 40h) ---
  {
    id: 'cst-006',
    userId: 'usr-selorm-adams',
    userName: 'Selorm Adams',
    userRole: 'account_manager',
    department: 'client_services',
    jobId: 'CT-1848',
    jobTitle: 'Telecel Ghana - Brand Relaunch Strategy Architecture',
    clientName: 'Telecel Ghana',
    disciplineId: 'strategy',
    disciplineName: 'Strategy (Media, Content)',
    date: mon,
    hours: 7.5,
    description: 'Drafted content calendar editorial pillars and cross-platform narrative frameworks.',
    isBillable: true,
    loggedAt: `${mon}T16:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-007',
    userId: 'usr-selorm-adams',
    userName: 'Selorm Adams',
    userRole: 'account_manager',
    department: 'client_services',
    jobId: 'CT-1848',
    jobTitle: 'Telecel Ghana - Brand Relaunch Strategy Architecture',
    clientName: 'Telecel Ghana',
    disciplineId: 'strategy',
    disciplineName: 'Strategy (Media, Content)',
    date: tue,
    hours: 8.0,
    description: 'Telecel brand debrief review and creative team handoff alignment session.',
    isBillable: true,
    loggedAt: `${tue}T17:00:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-008',
    userId: 'usr-selorm-adams',
    userName: 'Selorm Adams',
    userRole: 'account_manager',
    department: 'client_services',
    jobId: 'CT-1852',
    jobTitle: 'FanMilk Ghana - Nationwide Campus Sampling Roadshow',
    clientName: 'FanMilk Ghana',
    disciplineId: 'experientials',
    disciplineName: 'Experientials',
    date: wed,
    hours: 8.0,
    description: 'Campus activation logistics, vendor permitting, and activation site layout walkthrough.',
    isBillable: true,
    loggedAt: `${wed}T17:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-009',
    userId: 'usr-selorm-adams',
    userName: 'Selorm Adams',
    userRole: 'account_manager',
    department: 'client_services',
    jobId: 'CT-1852',
    jobTitle: 'FanMilk Ghana - Nationwide Campus Sampling Roadshow',
    clientName: 'FanMilk Ghana',
    disciplineId: 'experientials',
    disciplineName: 'Experientials',
    date: thu,
    hours: 7.5,
    description: 'Fabrication specifications review with field logistics supervisor and client contact report.',
    isBillable: true,
    loggedAt: `${thu}T16:45:00Z`,
    source: 'manual_entry'
  },
  {
    id: 'cst-010',
    userId: 'usr-selorm-adams',
    userName: 'Selorm Adams',
    userRole: 'account_manager',
    department: 'client_services',
    jobId: 'CT-1850',
    jobTitle: 'Account Management & Client Brief Reviews',
    clientName: 'Multiple Accounts',
    disciplineId: 'account_management',
    disciplineName: 'Account Management & Coordination',
    date: fri,
    hours: 7.0,
    description: 'Client relationship management, Weekly WIP document submission, and NSS mentoring.',
    isBillable: false,
    loggedAt: `${fri}T16:00:00Z`,
    source: 'manual_entry'
  },

  // --- Liam O'Connor (Account Executive) - Total: 39.0h (JOB VARIANCE OVERBURN on CT-1855) ---
  {
    id: 'cst-011',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    department: 'client_services',
    jobId: 'CT-1855',
    jobTitle: 'Stanbic Bank - Wealth Management Creator Partnership',
    clientName: 'Stanbic Bank',
    disciplineId: 'influencer_management',
    disciplineName: 'Influencer Management',
    date: mon,
    hours: 8.0,
    description: 'Creator tier-1 scouting, media kit validation, and fee negotiations (Planned was only 12h total).',
    isBillable: true,
    loggedAt: `${mon}T17:00:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-012',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    department: 'client_services',
    jobId: 'CT-1855',
    jobTitle: 'Stanbic Bank - Wealth Management Creator Partnership',
    clientName: 'Stanbic Bank',
    disciplineId: 'influencer_management',
    disciplineName: 'Influencer Management',
    date: tue,
    hours: 8.5,
    description: 'Creator contract drafting, FTC compliance clauses, and deliverables briefing packs.',
    isBillable: true,
    loggedAt: `${tue}T17:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-013',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    department: 'client_services',
    jobId: 'CT-1855',
    jobTitle: 'Stanbic Bank - Wealth Management Creator Partnership',
    clientName: 'Stanbic Bank',
    disciplineId: 'influencer_management',
    disciplineName: 'Influencer Management',
    date: wed,
    hours: 7.5,
    description: 'Resolving influencer pushback on dieline deliverables; brief overburn accumulating.',
    isBillable: true,
    loggedAt: `${wed}T16:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-014',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    department: 'client_services',
    jobId: 'CT-1856',
    jobTitle: 'Guinness Ghana - Smooth Sessions Community Engagement',
    clientName: 'Guinness Ghana',
    disciplineId: 'community_management',
    disciplineName: 'Community Management',
    date: thu,
    hours: 8.0,
    description: 'Social inbox community moderation, brand sentiment tracking, and influencer post reshares.',
    isBillable: true,
    loggedAt: `${thu}T17:00:00Z`,
    source: 'manual_entry'
  },
  {
    id: 'cst-015',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    department: 'client_services',
    jobId: 'CT-1856',
    jobTitle: 'Guinness Ghana - Smooth Sessions Community Engagement',
    clientName: 'Guinness Ghana',
    disciplineId: 'community_management',
    disciplineName: 'Community Management',
    date: fri,
    hours: 7.0,
    description: 'Weekly community engagement report compilation and customer query routing.',
    isBillable: true,
    loggedAt: `${fri}T16:00:00Z`,
    source: 'live_timer'
  },

  // --- Abena Mensah (NSS Intern) - Total: 34.0h (Disciplined Tracked Hours) ---
  {
    id: 'cst-016',
    userId: 'usr-abena-mensah',
    userName: 'Abena Mensah',
    userRole: 'nss_intern',
    department: 'client_services',
    jobId: 'CT-1848',
    jobTitle: 'Telecel Ghana - Brand Relaunch Strategy Architecture',
    clientName: 'Telecel Ghana',
    disciplineId: 'strategy',
    disciplineName: 'Strategy (Media, Content)',
    date: mon,
    hours: 6.5,
    description: 'Shadowing editorial strategy formulation and drafting verbatim contact report minutes.',
    isBillable: true,
    loggedAt: `${mon}T15:30:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-017',
    userId: 'usr-abena-mensah',
    userName: 'Abena Mensah',
    userRole: 'nss_intern',
    department: 'client_services',
    jobId: 'CT-1848',
    jobTitle: 'Telecel Ghana - Brand Relaunch Strategy Architecture',
    clientName: 'Telecel Ghana',
    disciplineId: 'strategy',
    disciplineName: 'Strategy (Media, Content)',
    date: tue,
    hours: 7.0,
    description: 'Competitive audit of telecom campaign messaging across local digital channels.',
    isBillable: true,
    loggedAt: `${tue}T16:00:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-018',
    userId: 'usr-abena-mensah',
    userName: 'Abena Mensah',
    userRole: 'nss_intern',
    department: 'client_services',
    jobId: 'CT-1852',
    jobTitle: 'FanMilk Ghana - Nationwide Campus Sampling Roadshow',
    clientName: 'FanMilk Ghana',
    disciplineId: 'experientials',
    disciplineName: 'Experientials',
    date: wed,
    hours: 7.0,
    description: 'Assisting with campus venue permit documentation and brand ambassador briefing kits.',
    isBillable: true,
    loggedAt: `${wed}T16:30:00Z`,
    source: 'manual_entry'
  },
  {
    id: 'cst-019',
    userId: 'usr-abena-mensah',
    userName: 'Abena Mensah',
    userRole: 'nss_intern',
    department: 'client_services',
    jobId: 'CT-1856',
    jobTitle: 'Guinness Ghana - Smooth Sessions Community Engagement',
    clientName: 'Guinness Ghana',
    disciplineId: 'community_management',
    disciplineName: 'Community Management',
    date: thu,
    hours: 7.0,
    description: 'Categorizing customer feedback mentions and tracking response response latency.',
    isBillable: true,
    loggedAt: `${thu}T16:00:00Z`,
    source: 'live_timer'
  },
  {
    id: 'cst-020',
    userId: 'usr-abena-mensah',
    userName: 'Abena Mensah',
    userRole: 'nss_intern',
    department: 'client_services',
    jobId: 'CT-1850',
    jobTitle: 'Account Management & Client Brief Reviews',
    clientName: 'Multiple Accounts',
    disciplineId: 'account_management',
    disciplineName: 'Account Management & Coordination',
    date: fri,
    hours: 6.5,
    description: 'Weekly timesheet audit preparation, meeting docket filing, and NSS review with Selorm.',
    isBillable: false,
    loggedAt: `${fri}T15:30:00Z`,
    source: 'manual_entry'
  }
];

/**
 * Initial Discrepancy Alerts generated by the Discrepancy Engine.
 * Dual-rule discrepancy triggers:
 * 1. Overtime over 40.0h capacity baseline
 * 2. Job Allocation Variance overburn (>25%)
 * 3. Functional Discipline Drift
 */
export const INITIAL_CS_DISCREPANCY_ALERTS: CSDiscrepancyAlert[] = [
  {
    id: 'dsc-001',
    userId: 'usr-michael-chen',
    userName: 'Michael Chen',
    userRole: 'senior_account_manager',
    type: 'overtime',
    title: 'Weekly Capacity Baseline Exceeded (+2.5h Overtime)',
    description: 'Michael Chen logged 42.5 hours against the standard 40.0h weekly capacity baseline across Digital Media campaigns.',
    plannedHours: 40.0,
    actualHours: 42.5,
    varianceHours: 2.5,
    variancePercentage: 6.25,
    weeklyTotalHours: 42.5,
    severity: 'medium',
    status: 'flagged',
    createdAt: `${fri}T18:00:00Z`
  },
  {
    id: 'dsc-002',
    userId: 'usr-liam-oconnor',
    userName: "Liam O'Connor",
    userRole: 'account_executive',
    type: 'job_variance',
    title: 'Severe Job Allocation Overburn (+100.0% Variance)',
    description: 'Stanbic Bank Creator Partnership (CT-1855) budgeted for 12.0 planned hours; Liam has logged 24.0 hours due to creator contracting delays.',
    jobId: 'CT-1855',
    jobTitle: 'Stanbic Bank - Wealth Management Creator Partnership',
    clientName: 'Stanbic Bank',
    disciplineId: 'influencer_management',
    plannedHours: 12.0,
    actualHours: 24.0,
    varianceHours: 12.0,
    variancePercentage: 100.0,
    weeklyTotalHours: 39.0,
    severity: 'high',
    status: 'under_review',
    auditNotes: 'Liam flagged vendor negotiation pushback. Director David Vance requested formal brief scope revision.',
    createdAt: `${wed}T19:00:00Z`
  },
  {
    id: 'dsc-003',
    userId: 'usr-david-vance',
    userName: 'David Vance',
    userRole: 'director',
    type: 'discipline_drift',
    title: 'Discipline Drift: PR Execution Logged Without Primary Assignment',
    description: 'Logged 4.5 hours in PR Media Relations for Guinness crisis release while primary discipline assignments are Department Leadership & Strategy.',
    jobId: 'CT-1858',
    jobTitle: 'Guinness Ghana - Crisis Comms & Press Advisory',
    clientName: 'Guinness Ghana',
    disciplineId: 'pr',
    plannedHours: 0,
    actualHours: 4.5,
    varianceHours: 4.5,
    variancePercentage: 100.0,
    weeklyTotalHours: 38.5,
    severity: 'low',
    status: 'reconciled',
    auditNotes: 'Executive intervention approved by GM Marcus Sterling due to urgent national regulatory inquiry.',
    reconciledBy: 'usr-marcus-sterling',
    reconciledByName: 'Marcus Sterling',
    reconciledAt: `${thu}T14:20:00Z`,
    createdAt: `${thu}T11:00:00Z`
  }
];

/**
 * Calculates current week discrepancies dynamically based on logged timesheet entries,
 * job estimates, and employee discipline assignments.
 */
export function evaluateCSDiscrepancies(
  entries: CSTimesheetEntry[],
  jobs: Job[],
  users: User[],
  assignments: EmployeeDisciplineAssignment[]
): CSDiscrepancyAlert[] {
  const alerts: CSDiscrepancyAlert[] = [];

  // Group entries by user
  const entriesByUser = new Map<string, CSTimesheetEntry[]>();
  entries.forEach((e) => {
    const list = entriesByUser.get(e.userId) || [];
    list.push(e);
    entriesByUser.set(e.userId, list);
  });

  // 1. Evaluate 40-hour capacity baseline for each Client Services user
  entriesByUser.forEach((userEntries, userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Filter to current operating week
    const totalWeeklyHours = userEntries.reduce((sum, e) => sum + e.hours, 0);
    const baseline = 40.0; // Universal 40.0h capacity baseline

    if (totalWeeklyHours > baseline) {
      const delta = Math.round((totalWeeklyHours - baseline) * 10) / 10;
      const variancePct = Math.round(((totalWeeklyHours - baseline) / baseline) * 100);

      alerts.push({
        id: `auto-ot-${userId}`,
        userId: user.id,
        userName: user.name,
        userRole: user.seniority || (user.jobTitle as CSReportingLevel) || 'account_manager',
        type: 'overtime',
        title: `Overtime Over 40h Baseline (+${delta}h)`,
        description: `${user.name} logged ${totalWeeklyHours}h this week, exceeding the universal 40.0h weekly capacity baseline by ${delta}h.`,
        plannedHours: baseline,
        actualHours: totalWeeklyHours,
        varianceHours: delta,
        variancePercentage: variancePct,
        weeklyTotalHours: totalWeeklyHours,
        severity: delta > 5 ? 'high' : delta > 2 ? 'medium' : 'low',
        status: 'flagged',
        createdAt: new Date().toISOString()
      });
    }
  });

  // 2. Evaluate Job Allocation Variances (Actual logged hours vs Job estimatedHours)
  const entriesByJob = new Map<string, { totalHours: number; entries: CSTimesheetEntry[] }>();
  entries.forEach((e) => {
    if (!e.jobId || e.jobId.startsWith('CT-1850')) return; // skip generic internal admin
    const current = entriesByJob.get(e.jobId) || { totalHours: 0, entries: [] };
    current.totalHours += e.hours;
    current.entries.push(e);
    entriesByJob.set(e.jobId, current);
  });

  entriesByJob.forEach((data, jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.estimatedHours || job.estimatedHours <= 0) return;

    const planned = job.estimatedHours;
    const actual = data.totalHours;

    // If actual logged exceeds planned by >20%
    if (actual > planned * 1.2) {
      const varianceHours = Math.round((actual - planned) * 10) / 10;
      const variancePct = Math.round(((actual - planned) / planned) * 100);
      const leadEntry = data.entries[0];

      alerts.push({
        id: `auto-var-${jobId}`,
        userId: leadEntry.userId,
        userName: leadEntry.userName,
        userRole: leadEntry.userRole,
        type: 'job_variance',
        title: `Job Allocation Overburn (+${variancePct}%)`,
        description: `Deliverable "${job.title}" logged ${actual}h against an estimated budget of ${planned}h (+${varianceHours}h overburn).`,
        jobId: job.id,
        jobTitle: job.title,
        clientName: job.clientProject || leadEntry.clientName,
        disciplineId: leadEntry.disciplineId as CSDisciplineId,
        plannedHours: planned,
        actualHours: actual,
        varianceHours,
        variancePercentage: variancePct,
        weeklyTotalHours: actual,
        severity: variancePct >= 40 ? 'high' : 'medium',
        status: 'flagged',
        createdAt: new Date().toISOString()
      });
    }
  });

  return alerts;
}

/**
 * Format elapsed seconds into HH:MM:SS string
 */
export function formatElapsedSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
