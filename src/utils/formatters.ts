// Centralized human-friendly formatting utilities
// Ensures no raw code keys (e.g. text1_text2, snake_case, screaming_snake_case) leak to users

const SYSTEM_TERM_MAP: Record<string, string> = {
  // User Roles
  general_manager: 'General Manager',
  traffic_manager: 'Traffic Manager',
  client_service: 'Client Service',
  manager: 'Studio Manager',
  director: 'Studio Director',
  team_lead: 'Team Lead',
  employee: 'Specialist',
  admin: 'Administrator',

  // Job & Deliverable Statuses
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  awaiting_input: 'Awaiting Input',
  in_review: 'In Review',
  completed: 'Completed',
  reopened: 'Reopened',

  // Workflow Stages
  brief_intake: 'Brief Intake',
  new_brief: 'New Brief',
  debrief_prep: 'Debrief Prep',
  debrief_ready: 'Debrief Pack Ready',
  debrief_meeting: 'Team Debrief',
  traffic_assignment: 'Traffic Assignment',
  manager_assignment: 'Lead Assignment',
  traffic_routing: 'Traffic Routing',
  in_production: 'In Production',
  internal_review: 'Manager Review',
  client_service_handoff: 'Client Service Handoff',
  client_review: 'Client Review',
  client_revert: 'Client Reverts & Loops',
  client_approved: 'Client Approved',
  internal_approved: 'Internal Approved',

  // Progression & Case Types
  salary_adjustment: 'Salary Adjustment',
  role_promotion: 'Role Promotion',
  workload_rebalance: 'Workload Rebalance',
  title_upgrade: 'Title Upgrade',
  fast_track_lead: 'Fast-Track Lead',

  // Case Statuses & Decisions
  draft: 'Draft',
  submitted: 'Submitted',
  manager_review: 'Lead Endorsement',
  evidence_review: 'Verification',
  decision: 'GM Adjudication',
  closed: 'Resolved & Closed',
  approved: 'Approved',
  declined: 'Declined',
  deferred: 'Deferred',
  reassigned: 'Reassigned',

  // Account States
  invited: 'Invited',
  pending_setup: 'Pending Setup',
  active: 'Active',
  suspended: 'Suspended',
  deactivated: 'Deactivated',

  // Exceptions & Radar Alerts
  deadline_risk: 'Deadline Risk',
  capacity_exceeded: 'Capacity Exceeded',
  blocked_long: 'Prolonged Blocker',
  unassigned_queue: 'Unassigned Queue',
  quality_rework: 'Quality Rework',
  recognition_opportunity: 'Recognition Opportunity',
  overdue: 'Overdue',
  nearly_due: 'Approaching Deadline',
  concurrency_conflict: 'Concurrency Conflict',
  work_overload: 'Work Overload',
  revert_loop: 'Revert Loop',

  // Recognitions
  exceptional_delivery: 'Exceptional Delivery',
  team_support: 'Team Support',
  process_innovation: 'Process Innovation',
  complexity_mastery: 'Complexity Mastery',

  // Seniority & Complexity
  junior: 'Junior',
  mid: 'Specialist',
  senior: 'Senior',
  lead: 'Lead',
  nss_intern: 'NSS/Intern',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  extreme: 'Extreme',

  // Departments
  creative: 'Creative',
  traffic: 'Traffic',
  client_services: 'Client Services',

  // Traffic States
  clear: 'Clear',
  building: 'Building',
  congested: 'Congested',
  critical: 'Critical',

  // Audit Actions & Entity Types
  JOB_CREATED: 'Deliverable Created',
  JOB_STATUS_CHANGED: 'Status Updated',
  JOB_ASSIGNED: 'Specialist Assigned',
  JOB_BLOCKED: 'Dependency Blocked',
  JOB_UNBLOCKED: 'Blocker Cleared',
  WORKFLOW_ADVANCED: 'Stage Advanced',
  REVERT_LOGGED: 'Client Revert Logged',
  CONFLICT_RESOLVED: 'Conflict Resolved',
  CASE_SUBMITTED: 'Case Submitted',
  CASE_STATUS_UPDATED: 'Case Updated',
  RECOGNITION_GRANTED: 'Recognition Conferred',
  USER_STATUS_CHANGED: 'Account Status Changed',
  CLIENT_FINAL_APPROVAL: 'Final Client Sign-off',
  BRIEF_SUBMITTED: 'Brief Submitted',
  DELIVERABLE: 'Deliverable',
  TASK: 'Task',
  CASE: 'Progression Case',
  USER: 'Team Member',
  SYSTEM: 'Governance Engine'
};

/**
 * Universal formatter that transforms any code-like identifier (snake_case, kebab-case,
 * SCREAMING_SNAKE_CASE, camelCase) into a clean, human-readable Title Case string.
 *
 * Examples:
 *   formatReadable("general_manager") => "General Manager"
 *   formatReadable("in_progress")     => "In Progress"
 *   formatReadable("salary_adjustment") => "Salary Adjustment"
 *   formatReadable("JOB_CREATED")     => "Deliverable Created"
 */
export function formatReadable(input?: string | null): string {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';

  // 1. Direct dictionary match
  if (SYSTEM_TERM_MAP[trimmed]) {
    return SYSTEM_TERM_MAP[trimmed];
  }
  const lower = trimmed.toLowerCase();
  if (SYSTEM_TERM_MAP[lower]) {
    return SYSTEM_TERM_MAP[lower];
  }

  // 2. Tokenize on underscores, hyphens, and camelCase
  return trimmed
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const wLower = word.toLowerCase();
      // Keep acronyms uppercase
      if (['tvc', 'ooh', 'ui', 'ux', 'gm', 'cd', 'cs', 'id', 'ai', 'hr', 'pr', 'qa'].includes(wLower)) {
        return wLower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function formatRole(role?: string | null): string {
  if (!role) return '';
  const lower = role.trim().toLowerCase();
  return SYSTEM_TERM_MAP[lower] || formatReadable(role);
}

export function formatStatus(status?: string | null): string {
  if (!status) return '';
  const lower = status.trim().toLowerCase();
  return SYSTEM_TERM_MAP[lower] || formatReadable(status);
}

export function formatWorkflowStage(stage?: string | null): string {
  if (!stage) return '';
  const lower = stage.trim().toLowerCase();
  return SYSTEM_TERM_MAP[lower] || formatReadable(stage);
}

export function formatCaseType(type?: string | null): string {
  if (!type) return '';
  const lower = type.trim().toLowerCase();
  return SYSTEM_TERM_MAP[lower] || formatReadable(type);
}

export function formatAuditAction(action?: string | null): string {
  if (!action) return '';
  return SYSTEM_TERM_MAP[action.trim()] || formatReadable(action);
}

export function formatSeniority(seniority?: string | null): string {
  if (!seniority) return 'Specialist';
  const lower = seniority.trim().toLowerCase();
  if (lower === 'nss_intern' || lower === 'nss / intern' || lower === 'nss/intern') {
    return 'NSS/Intern';
  }
  return SYSTEM_TERM_MAP[lower] || formatReadable(seniority);
}

export function formatDepartment(dept?: string | null): string {
  if (!dept) return '';
  const lower = dept.trim().toLowerCase();
  return SYSTEM_TERM_MAP[lower] || formatReadable(dept);
}
