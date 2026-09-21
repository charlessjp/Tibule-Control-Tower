import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Table,
  Layers,
  FileText,
  BarChart3,
  Users,
  Briefcase,
  CheckSquare,
  Award,
  Scale,
  Workflow,
  FileCheck,
  AlertTriangle,
  CircleDot
} from 'lucide-react';

interface RibbonNavItem {
  id: string;
  label: string;
  sublabel?: string;
  hotkey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeType?: 'primary' | 'danger' | 'amber' | 'neutral';
}

export const WorkstationRibbon: React.FC = () => {
  const { activeView, setActiveView, jobs, cases, exceptions, currentUser } = useApp();

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService = role === 'client_service';
  const isDisciplineLead = role === 'manager' || role === 'director' || role === 'team_lead';
  const isEmployee = role === 'employee';

  const pendingGMReviewsCount = cases.filter((c) => c.status !== 'closed' && c.status !== 'draft').length;
  const pendingLeadReviewsCount = cases.filter(
    (c) => (c.teamId === currentUser.teamId || isGM) && (c.status === 'manager_review' || c.status === 'submitted')
  ).length;
  const myCasesCount = cases.filter((c) => c.employeeId === currentUser.id).length;
  const conflictCount = jobs.filter(
    (j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected
  ).length;
  const myActiveJobsCount = jobs.filter((j) => j.assigneeId === currentUser.id && j.status !== 'completed').length;

  let navItems: RibbonNavItem[] = [];

  if (isGM) {
    navItems = [
      {
        id: 'overview',
        label: 'Nerve Center',
        hotkey: '1',
        icon: LayoutDashboard,
        badge: exceptions.length > 0 ? `${exceptions.length} alert` : null,
        badgeType: 'danger'
      },
      {
        id: 'cases',
        label: 'Cases to Review',
        hotkey: '2',
        icon: Scale,
        badge: pendingGMReviewsCount > 0 ? `${pendingGMReviewsCount} pending` : null,
        badgeType: 'amber'
      },
      {
        id: 'agency_workflow',
        label: 'Workflow Engine',
        hotkey: '3',
        icon: Workflow,
        badge: conflictCount > 0 ? `${conflictCount} conflict` : null,
        badgeType: 'danger'
      },
      {
        id: 'master_table',
        label: 'Master Schedule',
        sublabel: 'Output A',
        hotkey: '4',
        icon: Table,
        badge: `${jobs.length}`,
        badgeType: 'neutral'
      },
      {
        id: 'summary_matrix',
        label: 'Capacity Matrix',
        sublabel: 'Output B',
        hotkey: '5',
        icon: Layers,
        badge: 'CDI 4',
        badgeType: 'neutral'
      },
      {
        id: 'executive_brief',
        label: 'Executive Brief',
        sublabel: 'Output C',
        hotkey: '6',
        icon: FileText,
        badge: 'Memo',
        badgeType: 'neutral'
      },
      {
        id: 'visual_analytics',
        label: 'Visual Analytics',
        sublabel: 'Output E',
        hotkey: '7',
        icon: BarChart3,
        badge: 'Live',
        badgeType: 'neutral'
      },
      {
        id: 'manager_tower',
        label: 'Governance & Risks',
        hotkey: '8',
        icon: AlertTriangle,
        badge: exceptions.length > 0 ? `${exceptions.length}` : null,
        badgeType: 'danger'
      }
    ];
  } else if (isTraffic) {
    navItems = [
      {
        id: 'overview',
        label: 'Traffic Dispatch Hub',
        hotkey: '1',
        icon: LayoutDashboard,
        badge: exceptions.length > 0 ? `${exceptions.length} alert` : null,
        badgeType: 'danger'
      },
      {
        id: 'agency_workflow',
        label: 'Workflow Engine',
        hotkey: '2',
        icon: Workflow,
        badge: conflictCount > 0 ? `${conflictCount} conflict` : null,
        badgeType: 'danger'
      },
      {
        id: 'master_table',
        label: 'Master Delivery Schedule',
        sublabel: 'Output A',
        hotkey: '3',
        icon: Table,
        badge: `${jobs.length}`,
        badgeType: 'neutral'
      },
      {
        id: 'team_traffic',
        label: 'Studio Capacity Matrix',
        hotkey: '4',
        icon: Users,
        badge: 'Live',
        badgeType: 'neutral'
      },
      {
        id: 'all_work',
        label: 'Routing Backlog',
        hotkey: '5',
        icon: CircleDot,
        badge: `${jobs.filter((j) => j.workflowStage === 'traffic_intake' || j.workflowStage === 'in_brief').length}`,
        badgeType: 'neutral'
      },
      {
        id: 'manager_tower',
        label: 'Exceptions & Blockers',
        hotkey: '6',
        icon: AlertTriangle,
        badge: exceptions.length > 0 ? `${exceptions.length}` : null,
        badgeType: 'danger'
      }
    ];
  } else if (isClientService) {
    navItems = [
      {
        id: 'overview',
        label: 'Client Service Hub',
        hotkey: '1',
        icon: LayoutDashboard,
        badge: exceptions.length > 0 ? `${exceptions.length} alert` : null,
        badgeType: 'danger'
      },
      {
        id: 'agency_workflow',
        label: 'Reverts & Workflow',
        hotkey: '2',
        icon: Workflow,
        badge: conflictCount > 0 ? `${conflictCount} revert` : null,
        badgeType: 'danger'
      },
      {
        id: 'master_table',
        label: 'All Deliverables',
        sublabel: 'Output A',
        hotkey: '3',
        icon: Table,
        badge: `${jobs.length}`,
        badgeType: 'neutral'
      },
      {
        id: 'executive_brief',
        label: 'Account Brief',
        sublabel: 'Output C',
        hotkey: '4',
        icon: FileText,
        badge: 'Memo',
        badgeType: 'neutral'
      },
      {
        id: 'all_work',
        label: 'Client Deliverable Queue',
        hotkey: '5',
        icon: CircleDot,
        badge: `${jobs.filter((j) => j.status !== 'completed').length}`,
        badgeType: 'neutral'
      },
      {
        id: 'manager_tower',
        label: 'Delivery Risks',
        hotkey: '6',
        icon: AlertTriangle,
        badge: exceptions.length > 0 ? `${exceptions.length}` : null,
        badgeType: 'danger'
      }
    ];
  } else if (isDisciplineLead) {
    navItems = [
      {
        id: 'overview',
        label: 'Discipline Command',
        hotkey: '1',
        icon: LayoutDashboard,
        badge: exceptions.length > 0 ? `${exceptions.length} alert` : null,
        badgeType: 'danger'
      },
      {
        id: 'agency_workflow',
        label: 'Assign & Signoff',
        hotkey: '2',
        icon: Workflow,
        badge: conflictCount > 0 ? `${conflictCount} conflict` : null,
        badgeType: 'danger'
      },
      {
        id: 'cases',
        label: 'Team Cases & Reviews',
        hotkey: '3',
        icon: FileCheck,
        badge: pendingLeadReviewsCount > 0 ? `${pendingLeadReviewsCount} review` : null,
        badgeType: 'amber'
      },
      {
        id: 'master_table',
        label: 'Team Deliverables',
        sublabel: 'Output A',
        hotkey: '4',
        icon: Table,
        badge: `${jobs.length}`,
        badgeType: 'neutral'
      },
      {
        id: 'team_traffic',
        label: 'Team Bandwidth',
        hotkey: '5',
        icon: Users,
        badge: 'Live',
        badgeType: 'neutral'
      },
      {
        id: 'all_work',
        label: 'Team Work Queue',
        hotkey: '6',
        icon: CircleDot,
        badge: null
      },
      {
        id: 'manager_tower',
        label: 'Exceptions & Risks',
        hotkey: '7',
        icon: AlertTriangle,
        badge: exceptions.length > 0 ? `${exceptions.length}` : null,
        badgeType: 'danger'
      }
    ];
  } else {
    navItems = [
      {
        id: 'overview',
        label: 'My Workspace',
        hotkey: '1',
        icon: LayoutDashboard,
        badge: myActiveJobsCount > 0 ? `${myActiveJobsCount} active` : null,
        badgeType: 'neutral'
      },
      {
        id: 'my_work',
        label: 'My Deliverables',
        hotkey: '2',
        icon: CheckSquare,
        badge: myActiveJobsCount > 0 ? `${myActiveJobsCount}` : null,
        badgeType: 'neutral'
      },
      {
        id: 'evidence',
        label: 'My Evidence & Benchmarks',
        hotkey: '3',
        icon: Award,
        badge: 'Verified',
        badgeType: 'neutral'
      },
      {
        id: 'cases',
        label: 'My Cases & Appeals',
        hotkey: '4',
        icon: Briefcase,
        badge: myCasesCount > 0 ? `${myCasesCount} case${myCasesCount > 1 ? 's' : ''}` : null,
        badgeType: 'neutral'
      },
      {
        id: 'all_work',
        label: 'Studio Deliverables',
        hotkey: '5',
        icon: CircleDot,
        badge: `${jobs.length}`,
        badgeType: 'neutral'
      }
    ];
  }

  return (
    <div
      className="h-11 border-b px-4 sm:px-6 flex items-center gap-1 overflow-x-auto select-none transition-colors duration-200 z-10"
      style={{
        backgroundColor: 'var(--color-surface-muted)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center gap-1 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'shadow-xs font-bold border'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border-subtle)',
                      color: 'var(--color-text-primary)'
                    }
                  : undefined
              }
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: isActive ? 'var(--color-brand)' : 'var(--color-text-tertiary)' }}
              />
              <span className="truncate">{item.label}</span>

              {item.sublabel && (
                <span
                  className="text-[9px] font-mono uppercase px-1 py-0.2 rounded"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--color-brand-muted)',
                          color: 'var(--color-brand)'
                        }
                      : { opacity: 0.6 }
                  }
                >
                  {item.sublabel}
                </span>
              )}

              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    item.badgeType === 'danger'
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      : item.badgeType === 'amber'
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-surface text-text-secondary border border-border'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              <kbd
                className="hidden xl:inline text-[9px] font-mono px-1 rounded border opacity-40"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                {item.hotkey}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
};
