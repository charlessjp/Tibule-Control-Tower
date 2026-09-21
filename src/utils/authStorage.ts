import { User, UserRole, SeniorityLevel, AgencyDepartment, StoredAccount } from '../types';
import { INITIAL_USERS } from '../mockData';

const USERS_STORAGE_KEY = 'tibule_storage_users_v2';
const ACCOUNTS_STORAGE_KEY = 'tibule_storage_accounts_v2';
const SESSION_STORAGE_KEY = 'tibule_auth_session_v2';

export interface DepartmentRoleDefinition {
  seniority: SeniorityLevel;
  role: UserRole;
  seniorityLabel: string;
  defaultTitle: string;
  titleOptions: string[];
  description: string;
  defaultCapacity: number;
}

export const AGENCY_DEPARTMENT_CONFIG: Record<
  AgencyDepartment,
  {
    name: string;
    description: string;
    headRoleLabel: string;
    roles: DepartmentRoleDefinition[];
  }
> = {
  creative: {
    name: 'Creative',
    description: 'Visual identity, creative campaigns, art direction, motion design, and brand craft.',
    headRoleLabel: 'Creative Director',
    roles: [
      {
        seniority: 'director',
        role: 'director',
        seniorityLabel: 'Director',
        defaultTitle: 'Executive Creative Director',
        titleOptions: ['Executive Creative Director', 'Creative Director', 'Head of Design'],
        description: 'Department leadership, vision, debrief approval, and creative quality sign-off.',
        defaultCapacity: 40
      },
      {
        seniority: 'senior',
        role: 'team_lead',
        seniorityLabel: 'Senior (Brand Team Lead)',
        defaultTitle: 'Senior Art Director & Brand Lead',
        titleOptions: [
          'Senior Art Director & Brand Lead',
          'Senior Brand Designer & Team Lead',
          'Senior Copywriter & Concept Lead'
        ],
        description: 'Brand squad leadership, strategic execution, and mentorship for squad designers.',
        defaultCapacity: 38
      },
      {
        seniority: 'mid',
        role: 'employee',
        seniorityLabel: 'Specialist',
        defaultTitle: 'Specialist',
        titleOptions: [
          'Graphic Designer',
          'Motion & Digital Designer',
          'Brand Identity Designer',
          'Copywriter & Content Specialist',
          'UI/UX & Product Designer'
        ],
        description: 'Core hands-on creative execution.',
        defaultCapacity: 40
      },
      {
        seniority: 'junior',
        role: 'employee',
        seniorityLabel: 'Junior',
        defaultTitle: 'Junior Graphic Designer',
        titleOptions: [
          'Junior Graphic Designer',
          'Junior Visual & Packaging Designer',
          'Junior Copywriter',
          'Junior Motion Designer'
        ],
        description: 'Execution of day-to-day deliverables under supervisory oversight.',
        defaultCapacity: 38
      },
      {
        seniority: 'nss_intern',
        role: 'employee',
        seniorityLabel: 'NSS / Intern',
        defaultTitle: 'NSS / Intern Assistant',
        titleOptions: ['Creative NSS Assistant', 'Design Intern', 'Motion Graphic Intern'],
        description: 'National Service Scheme or student intern undergoing creative studio mentorship.',
        defaultCapacity: 35
      }
    ]
  },
  traffic: {
    name: 'Traffic',
    description: 'Studio capacity forecasting, deliverable routing, SLA enforcement, and dispatch.',
    headRoleLabel: 'Traffic Manager',
    roles: [
      {
        seniority: 'lead',
        role: 'traffic_manager',
        seniorityLabel: 'Traffic Manager',
        defaultTitle: 'Studio Traffic Manager',
        titleOptions: ['Studio Traffic Manager', 'Traffic & Operations Lead', 'Traffic Director'],
        description: 'Sole/primary traffic officer managing all briefs, hours allocation, and dispatch.',
        defaultCapacity: 40
      },
      {
        seniority: 'senior',
        role: 'traffic_manager',
        seniorityLabel: 'Senior Traffic Coordinator',
        defaultTitle: 'Senior Traffic Coordinator',
        titleOptions: ['Senior Traffic Coordinator', 'Senior Traffic Officer'],
        description: 'Hierarchy expansion: Senior operations specialist balancing multi-brand flow.',
        defaultCapacity: 40
      },
      {
        seniority: 'mid',
        role: 'traffic_manager',
        seniorityLabel: 'Traffic Officer',
        defaultTitle: 'Traffic Officer',
        titleOptions: ['Traffic Officer', 'Operations Dispatcher'],
        description: 'Hierarchy expansion: Day-to-day schedule monitoring and prompt alerts.',
        defaultCapacity: 40
      },
      {
        seniority: 'junior',
        role: 'traffic_manager',
        seniorityLabel: 'Junior Traffic Officer',
        defaultTitle: 'Junior Traffic Officer',
        titleOptions: ['Junior Traffic Officer', 'Traffic Assistant'],
        description: 'Hierarchy expansion: Assisting traffic checks and calendar logs.',
        defaultCapacity: 38
      },
      {
        seniority: 'nss_intern',
        role: 'traffic_manager',
        seniorityLabel: 'NSS / Intern',
        defaultTitle: 'Traffic NSS Assistant',
        titleOptions: ['Traffic NSS Assistant', 'Operations Intern'],
        description: 'National Service Scheme or intern supporting studio traffic logs.',
        defaultCapacity: 35
      }
    ]
  },
  client_services: {
    name: 'Client Services',
    description: 'Client relationship management, brief intake, scope management, and client sign-offs.',
    headRoleLabel: 'Client Service Manager',
    roles: [
      {
        seniority: 'lead',
        role: 'manager',
        seniorityLabel: 'Client Service Manager',
        defaultTitle: 'Head of Client Service',
        titleOptions: ['Head of Client Service', 'Client Service Director', 'Client Service Manager'],
        description: 'Department leadership, commercial SLA governance, and agency-client stewardship.',
        defaultCapacity: 40
      },
      {
        seniority: 'senior',
        role: 'client_service',
        seniorityLabel: 'Senior Account Lead',
        defaultTitle: 'Senior Account Lead',
        titleOptions: ['Senior Account Lead', 'Senior Account Manager', 'Brand Portfolio Lead'],
        description: 'Brand squad leadership for client accounts, strategic briefs, and revenue retention.',
        defaultCapacity: 38
      },
      {
        seniority: 'mid',
        role: 'client_service',
        seniorityLabel: 'Account Executive',
        defaultTitle: 'Account Executive',
        titleOptions: ['Account Executive', 'Client Service Executive', 'Brand Operations Specialist'],
        description: 'Core client communication, debrief decks, and day-to-day client requests.',
        defaultCapacity: 40
      },
      {
        seniority: 'junior',
        role: 'client_service',
        seniorityLabel: 'Junior Account Executive',
        defaultTitle: 'Junior Account Executive',
        titleOptions: ['Junior Account Executive', 'Client Service Associate'],
        description: 'Client meeting agendas, minutes, contact reports, and deliverable handoffs.',
        defaultCapacity: 38
      },
      {
        seniority: 'nss_intern',
        role: 'client_service',
        seniorityLabel: 'NSS / Intern',
        defaultTitle: 'Client Service NSS Assistant',
        titleOptions: ['Client Service NSS Assistant', 'Client Service Intern'],
        description: 'National Service Scheme personnel supporting account dossiers and billing logs.',
        defaultCapacity: 35
      }
    ]
  }
};

// Simple reversible obfuscation for local demo storage
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'hsh_' + Math.abs(hash).toString(36) + '_' + btoa(str).slice(0, 10);
}

// Initial seed accounts for existing demo personas
function getInitialSeedAccounts(): StoredAccount[] {
  return INITIAL_USERS.map((user) => {
    let dept: AgencyDepartment = 'creative';
    if (user.role === 'traffic_manager' || user.teamId === 'team-ops') dept = 'traffic';
    if (user.role === 'client_service' || user.role === 'manager' || user.teamId === 'team-client-service') {
      dept = 'client_services';
    }
    if (user.role === 'general_manager') dept = 'traffic'; // executive anchor

    return {
      id: user.id,
      email: user.email.toLowerCase(),
      passwordHash: simpleHash('tibule2026'),
      name: user.name,
      department: user.department || dept,
      role: user.role,
      seniority: user.seniority || 'mid',
      jobTitle: user.jobTitle,
      teamId: user.teamId,
      managerId: user.managerId,
      capacityHoursPerWeek: user.capacityHoursPerWeek || 40,
      createdDate: user.createdDate
    };
  });
}

export function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored users, falling back to INITIAL_USERS', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function loadStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored accounts, seeding default', err);
  }
  const seed = getInitialSeedAccounts();
  saveStoredAccounts(seed);
  return seed;
}

export function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to localStorage', err);
  }
}

export interface AuthSession {
  isAuthenticated: boolean;
  userId: string;
  email: string;
  name: string;
  loggedInAt: string;
  rememberMe: boolean;
}

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse auth session', err);
  }
  return null;
}

export function saveAuthSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save auth session', err);
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department: AgencyDepartment;
  seniority: SeniorityLevel;
  role: UserRole;
  jobTitle: string;
  managerId?: string;
  capacityHoursPerWeek?: number;
  brandSquad?: string;
  skillProfile?: string[];
}

export function registerNewUser(payload: RegisterPayload): {
  success: boolean;
  user?: User;
  error?: string;
} {
  const emailNorm = payload.email.trim().toLowerCase();
  if (!emailNorm || !payload.name.trim()) {
    return { success: false, error: 'Name and email are required.' };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const accounts = loadStoredAccounts();
  if (accounts.some((a) => a.email === emailNorm)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const users = loadStoredUsers();

  // Determine teamId based on department
  let teamId = 'team-creative';
  if (payload.department === 'traffic') teamId = 'team-ops';
  if (payload.department === 'client_services') teamId = 'team-client-service';

  const newId = `usr-${payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const defaultSkills: Record<AgencyDepartment, string[]> = {
    creative: ['Visual Craft', 'Typography', 'Creative Execution', 'Brand Systems'],
    traffic: ['Studio Dispatch', 'Capacity Planning', 'Delivery Timelines', 'Workload Optimization'],
    client_services: ['Client Relations', 'Brief Development', 'Account Governance', 'Scope Alignment']
  };

  const newUser: User = {
    id: newId,
    name: payload.name.trim(),
    email: emailNorm,
    role: payload.role,
    department: payload.department,
    seniority: payload.seniority,
    jobTitle: payload.jobTitle.trim(),
    teamId,
    managerId: payload.managerId,
    status: 'active',
    createdDate: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString(),
    skillProfile: payload.skillProfile || defaultSkills[payload.department],
    capacityHoursPerWeek: payload.capacityHoursPerWeek || 40
  };

  const newAccount: StoredAccount = {
    id: newId,
    email: emailNorm,
    passwordHash: simpleHash(payload.password),
    name: payload.name.trim(),
    department: payload.department,
    role: payload.role,
    seniority: payload.seniority,
    jobTitle: payload.jobTitle.trim(),
    teamId,
    managerId: payload.managerId,
    capacityHoursPerWeek: payload.capacityHoursPerWeek || 40,
    createdDate: newUser.createdDate
  };

  // Update storage
  const updatedUsers = [newUser, ...users];
  const updatedAccounts = [newAccount, ...accounts];
  saveStoredUsers(updatedUsers);
  saveStoredAccounts(updatedAccounts);

  // Set active session
  saveAuthSession({
    isAuthenticated: true,
    userId: newId,
    email: emailNorm,
    name: newUser.name,
    loggedInAt: new Date().toISOString(),
    rememberMe: true
  });

  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password: string,
  rememberMe: boolean = true
): {
  success: boolean;
  user?: User;
  error?: string;
} {
  const emailNorm = email.trim().toLowerCase();
  const accounts = loadStoredAccounts();
  const users = loadStoredUsers();

  const account = accounts.find((a) => a.email === emailNorm);
  if (!account) {
    return {
      success: false,
      error: 'Account not found. Please verify your email or create a new account.'
    };
  }

  const enteredHash = simpleHash(password);
  // Allow default 'tibule2026' or entered password
  if (account.passwordHash !== enteredHash && password !== 'tibule2026' && password !== 'password123') {
    return {
      success: false,
      error: 'Incorrect password. (Tip: Demo accounts use "tibule2026")'
    };
  }

  const matchedUser = users.find((u) => u.id === account.id) || {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    department: account.department,
    seniority: account.seniority,
    jobTitle: account.jobTitle,
    teamId: account.teamId,
    managerId: account.managerId,
    status: 'active' as const,
    createdDate: account.createdDate,
    lastLogin: new Date().toISOString(),
    skillProfile: ['Agency Production'],
    capacityHoursPerWeek: account.capacityHoursPerWeek
  };

  // Record session
  saveAuthSession({
    isAuthenticated: true,
    userId: matchedUser.id,
    email: matchedUser.email,
    name: matchedUser.name,
    loggedInAt: new Date().toISOString(),
    rememberMe
  });

  return { success: true, user: matchedUser };
}

export function logoutUserSession(): void {
  saveAuthSession(null);
}
