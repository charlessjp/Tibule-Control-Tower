import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  CheckSquare,
  BarChart3,
  Menu,
  FileText,
  Users,
  Award,
  AlertTriangle,
  Workflow
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    toggleMobileSidebar,
    cases,
    exceptions
  } = useApp();

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService =
    role === 'client_service' ||
    currentUser.department === 'client_services' ||
    currentUser.teamId === 'team-client-service';
  const isDisciplineLead =
    (role === 'manager' || role === 'director' || role === 'team_lead') &&
    !isClientService;

  const pendingCasesCount = cases.filter(
    (c) => c.status !== 'closed' && (isGM || c.teamId === currentUser.teamId || c.employeeId === currentUser.id)
  ).length;

  // Primary destinations tailored per role (clean operational tools without redundant analytics)
  const getNavItems = () => {
    if (isGM) {
      return [
        { id: 'overview', label: 'Nerve Center', icon: Home },
        { id: 'cases', label: 'Cases', icon: FileText, badge: pendingCasesCount },
        { id: 'agency_workflow', label: 'Engine', icon: Workflow },
        { id: 'manager_tower', label: 'Governance', icon: AlertTriangle, badge: exceptions.length }
      ];
    }
    if (isTraffic) {
      return [
        { id: 'overview', label: 'Dispatch', icon: Home },
        { id: 'all_work', label: 'Queue', icon: CheckSquare },
        { id: 'agency_workflow', label: 'Engine', icon: Workflow },
        { id: 'cases', label: 'Cases', icon: FileText, badge: pendingCasesCount }
      ];
    }
    if (isClientService) {
      return [
        { id: 'overview', label: 'CS Hub', icon: Home },
        { id: 'all_work', label: 'Deliverables', icon: CheckSquare },
        { id: 'cases', label: 'Cases', icon: FileText, badge: pendingCasesCount },
        { id: 'evidence', label: 'Evidence', icon: Award }
      ];
    }
    if (isDisciplineLead) {
      return [
        { id: 'overview', label: 'Studio Hub', icon: Home },
        { id: 'team_traffic', label: 'Team', icon: Users },
        { id: 'all_work', label: 'Queue', icon: CheckSquare },
        { id: 'manager_tower', label: 'Risks', icon: AlertTriangle, badge: exceptions.length }
      ];
    }
    // Specialist / Employee
    return [
      { id: 'overview', label: 'Workspace', icon: Home },
      { id: 'my_work', label: 'My Work', icon: CheckSquare },
      { id: 'evidence', label: 'Evidence', icon: Award },
      { id: 'cases', label: 'Cases', icon: FileText, badge: pendingCasesCount }
    ];
  };

  const navItems = getNavItems();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-40 border-t backdrop-blur-md transition-colors duration-200 select-none pb-safe"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}
      aria-label="Mobile Navigation Bar"
    >
      <div className="max-w-lg md:max-w-2xl mx-auto h-full flex items-center justify-around px-2 sm:px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="flex-1 py-1.5 flex flex-col items-center justify-center relative cursor-pointer group transition-colors"
              style={{
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-tertiary)'
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5 transition-transform group-active:scale-90" />
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full text-[9px] font-bold font-mono text-white flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-critical)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[68px] ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                />
              )}
            </button>
          );
        })}

        {/* Menu / Drawer Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="flex-1 py-1.5 flex flex-col items-center justify-center relative cursor-pointer group text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Open Full Navigation Menu"
        >
          <Menu className="w-5 h-5 transition-transform group-active:scale-90" />
          <span className="text-[10px] tracking-tight font-medium mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
};
