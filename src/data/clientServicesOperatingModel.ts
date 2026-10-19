import {
  CSDisciplineDefinition,
  CSDisciplineId,
  EmployeeDisciplineAssignment,
  CSAccountCommitment,
  NSSProgressionDossier,
  User,
  Job
} from '../types';

/**
 * The 9 Confirmed Disciplines within Client Services
 * General Manager Directive:
 * - Digital Media and Digital Media Buying must remain distinct capabilities.
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
export const CONFIRMED_CS_DISCIPLINES: CSDisciplineDefinition[] = [
  {
    id: 'digital_media',
    name: 'Digital Media',
    scopeLabel: '(Strategy, Buying, Reporting)',
    subCompetencies: ['Strategy', 'Buying', 'Reporting'],
    category: 'digital_media',
    description: 'Full-lifecycle digital media operations spanning digital campaign strategy, programmatic/PPC/social paid ad buying, auction pacing, and performance analytics reporting.',
    distinctionRule: 'Unites digital strategy, programmatic buying, and performance analytics across all online channels; distinct from offline Traditional Media.',
    badgeColor: '#0ea5e9' // Sky
  },
  {
    id: 'strategy',
    name: 'Strategy',
    scopeLabel: '(Media, Content)',
    subCompetencies: ['Media Strategy', 'Content Strategy'],
    category: 'strategy',
    description: 'Holistic strategic leadership encompassing both overarching media architecture and narrative content frameworks, editorial pillars, and brand positioning.',
    distinctionRule: 'Integrates high-level media strategy and content/editorial strategy to ensure cohesive brand narrative and distribution alignment.',
    badgeColor: '#3b82f6' // Blue
  },
  {
    id: 'community_management',
    name: 'Community Management',
    scopeLabel: 'Audience Dialogue',
    subCompetencies: ['Audience Engagement', 'Social Listening', 'Moderation', 'Crisis Response'],
    category: 'social_engagement',
    description: 'Active digital community moderation, brand conversational engagement, audience sentiment tracking, direct message resolution, and fan culture cultivation.',
    distinctionRule: 'Dedicated to continuous inbound conversations and audience care; distinct from commercial influencer negotiations.',
    badgeColor: '#10b981' // Emerald
  },
  {
    id: 'influencer_management',
    name: 'Influencer Management',
    scopeLabel: 'Creator Partnerships',
    subCompetencies: ['Creator Scouting', 'Commercial Negotiation', 'Briefing', 'Proof-of-Performance'],
    category: 'social_engagement',
    description: 'Creator vetting, talent contract negotiation, content brief delivery, influencer deliverables review, FTC/regulatory compliance, and engagement tracking.',
    distinctionRule: 'Dedicated to third-party creator partnerships, usage rights negotiation, talent logistics, and collaborative content pacing.',
    badgeColor: '#14b8a6' // Teal
  },
  {
    id: 'experientials',
    name: 'Experientials',
    scopeLabel: 'Live Activations',
    subCompetencies: ['Event Activations', 'Spatial Design', 'Production Logistics', 'On-ground Engagement'],
    category: 'experientials',
    description: 'Live brand activations, consumer immersions, product launch events, pop-up installations, spatial design logistics, and on-ground brand engagement.',
    distinctionRule: 'Focuses on real-world sensory encounters, attendee footfall, stagecraft, fabrication logistics, and physical activation management.',
    badgeColor: '#f59e0b' // Amber
  },
  {
    id: 'traditional_media',
    name: 'Traditional Media',
    scopeLabel: '(Strategy, Buying, Reporting)',
    subCompetencies: ['Strategy', 'Buying', 'Reporting'],
    category: 'traditional_media',
    description: 'Offline media operations across Broadcast Television, Radio networks, Print publications, and Out-of-Home (OOH) billboards: media planning, rate negotiation, and post-campaign compliance reporting.',
    distinctionRule: 'Dedicated to offline broadcast and physical media channels, rate card negotiation, and compliance transmission certificates.',
    badgeColor: '#8b5cf6' // Violet
  },
  {
    id: 'pr',
    name: 'PR',
    scopeLabel: 'Earned Media & Comms',
    subCompetencies: ['Media Relations', 'Press Releases', 'Crisis Communications', 'Executive Thought Leadership'],
    category: 'pr',
    description: 'Editorial media relations, press release drafting and dissemination, crisis communications, press conferences, executive thought leadership, and reputation management.',
    distinctionRule: 'Focuses on earned media, editorial relationships, reputation protection, and stakeholder communications across newsrooms and industry trade outlets.',
    badgeColor: '#ec4899' // Pink
  }
];

/**
 * Initial Functional Discipline Assignments (Dimension B)
 * Can be dynamically reassigned/updated by managers without modifying reporting lines (Dimension A).
 */
export const INITIAL_DISCIPLINE_ASSIGNMENTS: EmployeeDisciplineAssignment[] = [
  // Michael Chen (Senior Account Manager) - Digital Media (Strategy, Buying, Reporting) Lead
  {
    id: 'cda-001',
    employeeId: 'usr-michael-chen',
    employeeName: 'Michael Chen',
    disciplineId: 'digital_media',
    proficiency: 'lead',
    effectiveDate: '2025-01-20',
    weeklyExecutionHours: 18,
    isPrimary: true,
    notes: 'Primary execution lead for Digital Media (Strategy, Buying, Reporting).'
  },

  // Noah Thorne (Senior Account Manager) - Experientials Lead & PR Specialist
  {
    id: 'cda-003',
    employeeId: 'usr-noah-thorne',
    employeeName: 'Noah Thorne',
    disciplineId: 'experientials',
    proficiency: 'lead',
    effectiveDate: '2025-02-10',
    weeklyExecutionHours: 12,
    isPrimary: true,
    notes: 'Leads physical brand activations, festival pop-ups, and on-ground experiential production.'
  },
  {
    id: 'cda-004',
    employeeId: 'usr-noah-thorne',
    employeeName: 'Noah Thorne',
    disciplineId: 'pr',
    proficiency: 'senior_practitioner',
    effectiveDate: '2025-02-15',
    weeklyExecutionHours: 8,
    isPrimary: false,
    notes: 'Handles high-stakes editorial PR and press briefings for key brand launches.'
  },

  // Selorm Adams (Account Manager) - Strategy (Media, Content) Specialist
  {
    id: 'cda-011',
    employeeId: 'usr-selorm-adams',
    employeeName: 'Selorm Adams',
    disciplineId: 'strategy',
    proficiency: 'senior_practitioner',
    effectiveDate: '2025-02-01',
    weeklyExecutionHours: 14,
    isPrimary: true,
    notes: 'Coordinates Media & Content Strategy across Zenith Bank and Stanbic accounts.'
  },

  // Liam O'Connor (Account Executive) - Community Management & Influencer Management
  {
    id: 'cda-005',
    employeeId: 'usr-liam-oconnor',
    employeeName: 'Liam O\'Connor',
    disciplineId: 'community_management',
    proficiency: 'senior_practitioner',
    effectiveDate: '2025-02-15',
    weeklyExecutionHours: 15,
    isPrimary: true,
    notes: 'Daily brand community moderation and real-time social response governance.'
  },
  {
    id: 'cda-006',
    employeeId: 'usr-liam-oconnor',
    employeeName: 'Liam O\'Connor',
    disciplineId: 'influencer_management',
    proficiency: 'practitioner',
    effectiveDate: '2025-04-01',
    weeklyExecutionHours: 8,
    isPrimary: false,
    notes: 'Coordinates influencer contract milestones, brief sign-offs, and deliverable reviews.'
  },

  // Abena Mensah (Intern / NSS) - Developing across Strategy (Media, Content) & Digital Media
  {
    id: 'cda-007',
    employeeId: 'usr-abena-mensah',
    employeeName: 'Abena Mensah',
    disciplineId: 'strategy',
    proficiency: 'developing',
    effectiveDate: '2026-09-01',
    weeklyExecutionHours: 12,
    isPrimary: true,
    notes: 'Shadowing Media & Content Strategy formulation, trend research, and contact report documentation.'
  },
  {
    id: 'cda-008',
    employeeId: 'usr-abena-mensah',
    employeeName: 'Abena Mensah',
    disciplineId: 'digital_media',
    proficiency: 'developing',
    effectiveDate: '2026-09-05',
    weeklyExecutionHours: 8,
    isPrimary: false,
    notes: 'Junior digital media reporting support and asset cataloguing.'
  },

  // David Vance (Director of Client Services) - Traditional Media (Strategy, Buying, Reporting) & Strategy Lead
  {
    id: 'cda-009',
    employeeId: 'usr-david-vance',
    employeeName: 'David Vance',
    disciplineId: 'strategy',
    proficiency: 'lead',
    effectiveDate: '2024-11-15',
    weeklyExecutionHours: 6,
    isPrimary: true,
    notes: 'Executive strategy oversight for high-complexity tier accounts.'
  },
  {
    id: 'cda-010',
    employeeId: 'usr-david-vance',
    employeeName: 'David Vance',
    disciplineId: 'traditional_media',
    proficiency: 'lead',
    effectiveDate: '2024-11-15',
    weeklyExecutionHours: 6,
    isPrimary: false,
    notes: 'Direct negotiation with major national television and radio networks (Traditional Media Strategy, Buying, Reporting).'
  }
];

/**
 * Account Commitments (Client-Facing Responsibilities)
 * Account management typically occupies 2-3 hours/day (10-15h/week) for account leads.
 */
export const INITIAL_ACCOUNT_COMMITMENTS: CSAccountCommitment[] = [
  {
    id: 'cac-001',
    brandId: 'brand-zenith',
    brandName: 'Zenith Bank',
    employeeId: 'usr-michael-chen',
    role: 'account_lead',
    weeklyHours: 12,
    activeJobsCount: 3
  },
  {
    id: 'cac-002',
    brandId: 'brand-stanbic',
    brandName: 'Stanbic Bank',
    employeeId: 'usr-michael-chen',
    role: 'account_lead',
    weeklyHours: 8,
    activeJobsCount: 2
  },
  {
    id: 'cac-003',
    brandId: 'brand-guinness',
    brandName: 'Guinness Ghana',
    employeeId: 'usr-noah-thorne',
    role: 'account_lead',
    weeklyHours: 14,
    activeJobsCount: 4
  },
  {
    id: 'cac-004',
    brandId: 'brand-telecel',
    brandName: 'Telecel Ghana',
    employeeId: 'usr-liam-oconnor',
    role: 'account_lead',
    weeklyHours: 10,
    activeJobsCount: 3
  },
  {
    id: 'cac-005',
    brandId: 'brand-apex',
    brandName: 'Apex FinTech',
    employeeId: 'usr-david-vance',
    role: 'account_lead',
    weeklyHours: 8,
    activeJobsCount: 2
  },
  {
    id: 'cac-006',
    brandId: 'brand-zenith',
    brandName: 'Zenith Bank',
    employeeId: 'usr-abena-mensah',
    role: 'support_executive',
    weeklyHours: 6,
    activeJobsCount: 2
  }
];

/**
 * Structured NSS / Associate Development Dossier (AE Development Pathway)
 * "Completion of National Service supports structured development;
 * readiness and staffing remain management decisions supported by evidence."
 */
export const INITIAL_NSS_DEVELOPMENT_DOSSIERS: NSSProgressionDossier[] = [
  {
    employeeId: 'usr-abena-mensah',
    employeeName: 'Abena Mensah',
    supervisorId: 'usr-michael-chen',
    supervisorName: 'Michael Chen',
    cohort: 'NSS Class of 2026',
    nssStartDate: '2026-09-01',
    nssCompletionDate: '2027-08-31',
    overallReadinessScore: 78,
    recommendation: 'in_development',
    status: 'active_nss',
    verifiedContributionsCount: 2,
    completedTasksCount: 14,
    executiveSponsorNote: 'Demonstrating rapid growth in contact reporting and client meeting debrief accuracy. Recommended for structured AE shadowing in Q4.',
    evaluations: [
      {
        id: 'comp-01',
        competencyArea: 'client_communication',
        title: 'Meeting Minutes & Contact Reporting Rigor',
        score: 4,
        evidenceNotes: 'Produces pristine contact reports within 2 hours of brand debrief calls with zero omitted action items.'
      },
      {
        id: 'comp-02',
        competencyArea: 'brief_intake_rigor',
        title: 'Brief Completeness Audit',
        score: 4,
        evidenceNotes: 'Rigorously audited Zenith Bank mobile brief for missing technical dielines before Traffic handoff.'
      },
      {
        id: 'comp-03',
        competencyArea: 'cross_discipline_coordination',
        title: 'Cross-Discipline Workflow Coordination',
        score: 3,
        evidenceNotes: 'Actively coordinating with Creative motion specialists; developing stronger assertiveness on deadline follow-ups.'
      },
      {
        id: 'comp-04',
        competencyArea: 'reporting_accuracy',
        title: 'Billing Docket & Hours Documentation',
        score: 4,
        evidenceNotes: 'Meticulously logged all scope revisions in Control Tower with complete timestamp traceability.'
      },
      {
        id: 'comp-05',
        competencyArea: 'reliability_under_pressure',
        title: 'Composure During Fast-Turnaround Sprints',
        score: 4,
        evidenceNotes: 'Volunteered to assist in the high-stakes Stanbic emergency pitch collateral prep.'
      }
    ]
  }
];

export const INITIAL_NSS_PROGRESSION_DOSSIERS = INITIAL_NSS_DEVELOPMENT_DOSSIERS;

/**
 * Helper to compute capacity breakdown for an employee across both dimensions:
 * Dimension A: Account Responsibilities
 * Dimension B: Functional Discipline Execution
 */
export function computeEmployeeCapacityProfile(
  user: User,
  assignments: EmployeeDisciplineAssignment[],
  commitments: CSAccountCommitment[],
  jobs: Job[]
) {
  const contractedHours = user.capacityHoursPerWeek || 40;

  // Account Management commitments (Dimension A)
  const userCommitments = commitments.filter((c) => c.employeeId === user.id);
  const accountManagementHours = userCommitments.reduce((sum, c) => sum + c.weeklyHours, 0);

  // Specialist Execution work (Dimension B)
  const userAssignments = assignments.filter((a) => a.employeeId === user.id);
  const assignedDisciplineIds = userAssignments.map((a) => a.disciplineId);

  // Work from assigned active deliverables
  const userActiveJobs = jobs.filter((j) => j.assigneeId === user.id && j.status !== 'completed');
  const directExecutionHours = userActiveJobs.reduce((sum, j) => sum + (j.estimatedHours || 0), 0);
  
  // Discipline planned hours or active jobs effort
  const specialistExecutionHours = Math.max(
    directExecutionHours,
    userAssignments.reduce((sum, a) => sum + a.weeklyExecutionHours, 0)
  );

  // Standard meetings, reviews, and admin (~10-15% of contracted)
  const meetingsAndAdminHours = Math.round(contractedHours * 0.12);

  // Rework from revisions or client reverts
  const reworkHours = userActiveJobs
    .filter((j) => j.workflowStage === 'client_revert' || (j.revisionCount && j.revisionCount > 1))
    .reduce((sum, j) => sum + (j.reworkHours || 2), 0);

  const totalCommittedHours = accountManagementHours + specialistExecutionHours + meetingsAndAdminHours + reworkHours;
  const availableCapacityHours = Math.max(0, contractedHours - totalCommittedHours);
  const utilisationPercentage = Math.round((totalCommittedHours / contractedHours) * 100);

  // Capacity Bands per brief:
  // 60–85%: Optimal
  // 86–100%: Approaching or at full capacity
  // > 100%: Overloaded
  // < 60%: Underutilised
  let capacityBand: 'underutilised' | 'optimal' | 'approaching' | 'overloaded' = 'optimal';
  if (utilisationPercentage > 100) {
    capacityBand = 'overloaded';
  } else if (utilisationPercentage >= 86) {
    capacityBand = 'approaching';
  } else if (utilisationPercentage >= 60) {
    capacityBand = 'optimal';
  } else {
    capacityBand = 'underutilised';
  }

  const hasIncompleteEstimates = userActiveJobs.some((j) => !j.estimatedHours || j.estimatedHours === 0);

  return {
    contractedHours,
    accountManagementHours,
    specialistExecutionHours,
    meetingsAndAdminHours,
    reworkHours,
    totalCommittedHours,
    availableCapacityHours,
    utilisationPercentage,
    capacityBand,
    assignedDisciplineIds,
    hasIncompleteEstimates
  };
}
