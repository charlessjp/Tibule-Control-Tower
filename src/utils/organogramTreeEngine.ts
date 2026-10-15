import {
  User,
  AgencyDepartment,
  CSTimesheetEntry,
  CSDiscrepancyAlert,
  EmployeeDisciplineAssignment,
  Job
} from '../types';

export interface OrganogramNode {
  id: string;
  user: User;
  name: string;
  jobTitle: string;
  role: string;
  seniority: string;
  department: AgencyDepartment | 'executive';
  email: string;
  avatarInitials: string;
  directReportsCount: number;
  totalSubtreeHeadcount: number;
  weeklyLoggedHours: number;
  capacityHours: number;
  utilizationPercentage: number;
  hasOvertime: boolean;
  overtimeHours: number;
  hasVarianceAlert: boolean;
  activeAlertsCount: number;
  primaryDiscipline?: string;
  assignedAccountsCount: number;
  children: OrganogramNode[];
}

export type OrganogramDepartmentFilter = 'all' | 'client_services' | 'creative' | 'traffic';

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Builds the complete recursive organogram tree from flat users data,
 * timesheets, and discrepancy alerts, anchored at General Manager Marcus Sterling.
 */
export function buildOrganogramTree(
  users: User[],
  timesheetEntries: CSTimesheetEntry[] = [],
  discrepancyAlerts: CSDiscrepancyAlert[] = [],
  disciplineAssignments: EmployeeDisciplineAssignment[] = [],
  jobs: Job[] = []
): OrganogramNode | null {
  if (!users || users.length === 0) return null;

  // Filter out platform admin as instructed ("take away the platform admin from the organogram")
  const activeAgencyUsers = users.filter((u) => {
    if (u.role === 'admin') return false;
    if (u.id === 'usr-tariq-afriq') return false;
    if (u.jobTitle?.toLowerCase().includes('admin') && !u.jobTitle?.toLowerCase().includes('client')) return false;
    return true;
  });

  // 1. Identify apex (General Manager / Root with no manager or usr-marcus-sterling)
  const apexUser =
    activeAgencyUsers.find((u) => u.id === 'usr-marcus-sterling') ||
    activeAgencyUsers.find((u) => u.role === 'general_manager') ||
    activeAgencyUsers.find((u) => !u.managerId) ||
    activeAgencyUsers[0];

  // 2. Map users by managerId for rapid subtree lookups
  const subordinatesByManager = new Map<string, User[]>();
  activeAgencyUsers.forEach((u) => {
    if (u.id === apexUser.id) return; // avoid self-loop
    const mId = u.managerId || apexUser.id;
    const list = subordinatesByManager.get(mId) || [];
    list.push(u);
    subordinatesByManager.set(mId, list);
  });

  // Recursive node builder
  function constructNode(user: User): OrganogramNode {
    const directSubs = subordinatesByManager.get(user.id) || [];
    const children = directSubs.map((childUser) => constructNode(childUser));

    // Calculate weekly logged hours
    const userTimesheets = timesheetEntries.filter((e) => e.userId === user.id);
    const loggedHours = Math.round(userTimesheets.reduce((sum, e) => sum + e.hours, 0) * 10) / 10;
    const capacityHours = 40.0; // Universal 40.0h capacity baseline
    const utilizationPercentage = Math.round((loggedHours / capacityHours) * 100);
    const hasOvertime = loggedHours > capacityHours;
    const overtimeHours = hasOvertime ? Math.round((loggedHours - capacityHours) * 10) / 10 : 0;

    // Discrepancy alerts
    const userAlerts = discrepancyAlerts.filter(
      (a) => a.userId === user.id && a.status !== 'reconciled'
    );
    const hasVarianceAlert = userAlerts.length > 0;

    // Primary functional discipline or skill profile
    const primaryAssigned = disciplineAssignments.find(
      (a) => a.employeeId === user.id && a.isPrimary
    );
    const primaryDiscipline =
      primaryAssigned?.disciplineId ||
      (user.skillProfile && user.skillProfile.length > 0 ? user.skillProfile[0] : undefined);

    // Active assigned deliverables / accounts count
    const assignedJobs = jobs.filter(
      (j) => j.assigneeId === user.id && j.status !== 'completed'
    );

    // Department normalization
    let dept: AgencyDepartment | 'executive' = 'executive';
    if (user.role === 'general_manager') {
      dept = 'executive';
    } else if (
      user.department === 'client_services' ||
      user.role === 'client_service' ||
      user.teamId === 'team-client-service'
    ) {
      dept = 'client_services';
    } else if (
      user.department === 'creative' ||
      user.teamId === 'team-creative' ||
      user.jobTitle.toLowerCase().includes('creative') ||
      user.jobTitle.toLowerCase().includes('designer') ||
      user.jobTitle.toLowerCase().includes('art director')
    ) {
      dept = 'creative';
    } else if (
      user.department === 'traffic' ||
      user.teamId === 'team-ops' ||
      user.role === 'traffic_manager'
    ) {
      dept = 'traffic';
    }

    const totalSubtreeHeadcount =
      1 + children.reduce((sum, c) => sum + c.totalSubtreeHeadcount, 0);

    return {
      id: user.id,
      user,
      name: user.name,
      jobTitle: user.jobTitle,
      role: user.role,
      seniority: user.seniority || 'senior',
      department: dept,
      email: user.email,
      avatarInitials: getAvatarInitials(user.name),
      directReportsCount: children.length,
      totalSubtreeHeadcount,
      weeklyLoggedHours: loggedHours,
      capacityHours,
      utilizationPercentage,
      hasOvertime,
      overtimeHours,
      hasVarianceAlert,
      activeAlertsCount: userAlerts.length,
      primaryDiscipline,
      assignedAccountsCount: assignedJobs.length,
      children
    };
  }

  return constructNode(apexUser);
}

/**
 * Filters the organogram tree by department while preserving the apex GM node.
 */
export function filterOrganogramTree(
  root: OrganogramNode,
  filter: OrganogramDepartmentFilter
): OrganogramNode {
  if (filter === 'all') return root;

  const targetDept = filter; // 'client_services' | 'creative' | 'traffic'

  // Filter root's children to only the requested department
  const filteredChildren = root.children.filter((child) => {
    if (child.department === targetDept) return true;
    // Check if child has descendants in this department
    return hasDepartmentDescendant(child, targetDept);
  });

  return {
    ...root,
    children: filteredChildren
  };
}

function hasDepartmentDescendant(node: OrganogramNode, dept: string): boolean {
  if (node.department === dept) return true;
  return node.children.some((child) => hasDepartmentDescendant(child, dept));
}

/**
 * Searches the tree for matching query text (name, jobTitle, or email)
 * and returns matched IDs as well as all ancestor IDs needed to expand the branch.
 */
export function searchOrganogramTree(
  root: OrganogramNode,
  query: string
): { matchedIds: Set<string>; ancestorIdsToExpand: Set<string> } {
  const matchedIds = new Set<string>();
  const ancestorIdsToExpand = new Set<string>();
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return { matchedIds, ancestorIdsToExpand };
  }

  function traverse(node: OrganogramNode, ancestors: string[]): boolean {
    const isMatch =
      node.name.toLowerCase().includes(trimmed) ||
      node.jobTitle.toLowerCase().includes(trimmed) ||
      node.email.toLowerCase().includes(trimmed) ||
      (node.primaryDiscipline && node.primaryDiscipline.toLowerCase().includes(trimmed));

    if (isMatch) {
      matchedIds.add(node.id);
      ancestors.forEach((ancId) => ancestorIdsToExpand.add(ancId));
    }

    let childHadMatch = false;
    for (const child of node.children) {
      const childMatched = traverse(child, [...ancestors, node.id]);
      if (childMatched) childHadMatch = true;
    }

    return isMatch || childHadMatch;
  }

  traverse(root, []);
  return { matchedIds, ancestorIdsToExpand };
}

/**
 * Retrieves the complete upward reporting chain from a given user up to GM
 */
export function getUpwardReportingChain(
  targetUserId: string,
  root: OrganogramNode
): OrganogramNode[] {
  const path: OrganogramNode[] = [];

  function findPath(current: OrganogramNode): boolean {
    path.push(current);
    if (current.id === targetUserId) {
      return true;
    }
    for (const child of current.children) {
      if (findPath(child)) {
        return true;
      }
    }
    path.pop();
    return false;
  }

  findPath(root);
  return path;
}
