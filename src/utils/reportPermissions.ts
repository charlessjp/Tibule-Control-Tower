import { User, Team, UserRole, SeniorityLevel } from '../types';

/**
 * Seniority ranking scale:
 * Creative Department: director (6) > associate_director (5) > art_director (4) > specialist (2) > junior (1) > nsp_intern (0)
 * Other Departments: lead (4) > senior (3) > mid (2) > junior (1) > nss_intern (0)
 */
export const SENIORITY_RANK_MAP: Record<SeniorityLevel, number> = {
  director: 6,
  associate_director: 5,
  art_director: 4,
  lead: 4,
  senior: 3,
  specialist: 2,
  mid: 2,
  junior: 1,
  nss_intern: 0,
  nsp_intern: 0
};

/**
 * Calculates effective seniority rank for a user based on their role and seniority attributes.
 */
export function getUserSeniorityRank(user: User): number {
  if (user.role === 'general_manager' || user.role === 'admin') return 100;
  if (user.seniority && user.seniority in SENIORITY_RANK_MAP) {
    return SENIORITY_RANK_MAP[user.seniority as SeniorityLevel];
  }
  if (user.role === 'director') return 6;
  if (user.role === 'manager' || user.role === 'team_lead') {
    return 4;
  }
  return 2; // default specialist / mid
}

/**
 * Check if targetUser is in the same team / department as currentUser.
 */
export function isUserInSameTeam(
  currentUser: User,
  targetUser: User,
  allTeams: Team[]
): boolean {
  if (currentUser.teamId && targetUser.teamId && currentUser.teamId === targetUser.teamId) {
    return true;
  }
  if (currentUser.department && targetUser.department && currentUser.department === targetUser.department) {
    return true;
  }
  return allTeams.some(
    (t) => t.memberIds.includes(currentUser.id) && t.memberIds.includes(targetUser.id)
  );
}

/**
 * Core Rule requested by user:
 * "I should be able to see just my analytics, those of people lower in seniority than me in my team"
 */
export function canViewUserAnalytics(
  currentUser: User,
  targetUser: User,
  allTeams: Team[]
): boolean {
  // 1. "just my analytics" -> Everyone can view their own analytics
  if (currentUser.id === targetUser.id) {
    return true;
  }

  // 2. Executive leadership (General Manager / Admin) has studio-wide oversight
  if (currentUser.role === 'general_manager' || currentUser.role === 'admin') {
    return true;
  }

  // 3. Must be in the user's team
  if (!isUserInSameTeam(currentUser, targetUser, allTeams)) {
    return false;
  }

  // 4. Must be lower in seniority than currentUser
  const currentRank = getUserSeniorityRank(currentUser);
  const targetRank = getUserSeniorityRank(targetUser);

  return targetRank < currentRank;
}

/**
 * Return all users whose analytics currentUser is permitted to view:
 * Self + members of the same team who are lower in seniority than currentUser.
 */
export function getPermittedAnalyticsStaff(
  currentUser: User,
  allUsers: User[],
  allTeams: Team[]
): User[] {
  // If GM or Admin, can inspect all users
  if (currentUser.role === 'general_manager' || currentUser.role === 'admin') {
    return [...allUsers].sort((a, b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const permitted = allUsers.filter((u) => canViewUserAnalytics(currentUser, u, allTeams));

  return permitted.sort((a, b) => {
    // Current user always first
    if (a.id === currentUser.id) return -1;
    if (b.id === currentUser.id) return 1;
    // Then sort by descending seniority rank (seniors before juniors, then name)
    const rankDiff = getUserSeniorityRank(b) - getUserSeniorityRank(a);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Return teams currentUser is permitted to inspect in Department-wide mode.
 * Non-GMs can only view their own team.
 */
export function getPermittedAnalyticsTeams(
  currentUser: User,
  allTeams: Team[]
): Team[] {
  if (currentUser.role === 'general_manager' || currentUser.role === 'admin') {
    return allTeams;
  }
  const myTeams = allTeams.filter(
    (t) => t.id === currentUser.teamId || t.memberIds.includes(currentUser.id)
  );
  return myTeams.length > 0 ? myTeams : allTeams.slice(0, 1);
}

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

  // Anyone can generate for subordinates lower in seniority in their team
  if (canViewUserAnalytics(currentUser, targetUser, allTeams)) {
    return true;
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
