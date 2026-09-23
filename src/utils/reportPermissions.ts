import { User, Team, UserRole } from '../types';

/**
 * Recursively find all subordinate user IDs for a given manager or superior.
 */
export function getSubordinateUserIds(
  managerId: string,
  allUsers: User[],
  allTeams: Team[]
): Set<string> {
  const subordinates = new Set<string>();

  // 1. Direct reports via managerId property
  const directReports = allUsers.filter((u) => u.managerId === managerId);
  for (const report of directReports) {
    if (report.id !== managerId) {
      subordinates.add(report.id);
      // Recursively gather nested reports
      const nested = getSubordinateUserIds(report.id, allUsers, allTeams);
      nested.forEach((id) => subordinates.add(id));
    }
  }

  // 2. Teams where this manager is the team manager
  const managedTeams = allTeams.filter((t) => t.managerId === managerId);
  for (const team of managedTeams) {
    for (const memberId of team.memberIds) {
      if (memberId !== managerId) {
        subordinates.add(memberId);
        // Recursively gather nested
        const nested = getSubordinateUserIds(memberId, allUsers, allTeams);
        nested.forEach((id) => subordinates.add(id));
      }
    }
  }

  return subordinates;
}

/**
 * Check if currentUser has authorization to generate a report for targetUser.
 */
export function canGenerateReportForUser(
  currentUser: User,
  targetUser: User,
  allUsers: User[],
  allTeams: Team[]
): boolean {
  // Everyone can generate their own report
  if (currentUser.id === targetUser.id) {
    return true;
  }

  // General Manager & Admin can generate for anyone
  if (currentUser.role === 'general_manager' || currentUser.role === 'admin') {
    return true;
  }

  // Regular employees cannot generate reports for others
  if (currentUser.role === 'employee') {
    return false;
  }

  // Superiors can generate for direct and indirect subordinates
  const subordinateIds = getSubordinateUserIds(currentUser.id, allUsers, allTeams);
  if (subordinateIds.has(targetUser.id)) {
    return true;
  }

  // Traffic Manager oversight: studio traffic manages deliveries across ops & creative teams
  if (currentUser.role === 'traffic_manager') {
    const opsAndCreativeTeams = allTeams.filter(
      (t) => t.id === 'team-ops' || t.id === 'team-creative'
    );
    const inStudioOps = opsAndCreativeTeams.some((t) => t.memberIds.includes(targetUser.id));
    if (inStudioOps && targetUser.role !== 'general_manager' && targetUser.role !== 'admin') {
      return true;
    }
  }

  // Director oversight: directors can generate for anyone in their department
  if (currentUser.role === 'director' && currentUser.department && targetUser.department === currentUser.department) {
    if (targetUser.role !== 'general_manager' && targetUser.role !== 'admin') {
      return true;
    }
  }

  return false;
}

/**
 * Return all users for whom currentUser is authorized to generate a report.
 */
export function getPermittedReportTargets(
  currentUser: User,
  allUsers: User[],
  allTeams: Team[]
): User[] {
  // General Manager or Admin: all active users
  if (currentUser.role === 'general_manager' || currentUser.role === 'admin') {
    return [...allUsers].sort((a, b) => {
      // Put currentUser first, then alphabetical
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Superiors & staff: self + permitted subordinates
  const permitted = allUsers.filter((u) =>
    canGenerateReportForUser(currentUser, u, allUsers, allTeams)
  );

  return permitted.sort((a, b) => {
    if (a.id === currentUser.id) return -1;
    if (b.id === currentUser.id) return 1;
    return a.name.localeCompare(b.name);
  });
}
