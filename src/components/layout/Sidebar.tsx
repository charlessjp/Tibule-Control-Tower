import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  CheckSquare,
  Users,
  Award,
  FileText,
  FolderGit2,
  CircleDot,
  Radio,
  BarChart3,
  Gauge,
  AlertTriangle,
  Settings,
  HelpCircle,
  Workflow,
  FileCheck,
  Scale,
  Trophy,
  FolderArchive,
  PanelLeftClose,
  PanelLeftOpen,
  FileDown,
  Building2,
  Network,
  X
} from 'lucide-react';
import { SidebarMotivationCard } from './SidebarMotivationCard';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    exceptions,
    jobs,
    cases,
    currentUser,
    theme,
    setIsAnalystTipsOpen,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    openReportModal
  } = useApp();
  const isDark = theme === 'dark';

  const isHome = activeView === 'overview' || activeView === 'home';
  const exceptionsCount = exceptions.length || 5;
  const conflictCount = jobs.filter((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected).length;
  const trafficUnassignedCount = jobs.filter((j) => (j.status === 'unassigned' || !j.assigneeId || j.workflowStage === 'brief_intake' || j.workflowStage === 'traffic_assignment' || j.workflowStage === 'manager_assignment') && j.status !== 'completed').length;

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
  const isEmployee = (!isGM && !isTraffic && !isClientService && !isDisciplineLead);

  const pendingGMReviewsCount = cases.filter(c => c.status !== 'closed' && c.status !== 'draft').length;
  const pendingLeadReviewsCount = cases.filter(c => (c.teamId === currentUser.teamId || isGM) && (c.status === 'manager_review' || c.status === 'submitted')).length;
  const myCasesCount = cases.filter(c => c.employeeId === currentUser.id).length;
  const pendingTrafficCasesCount = cases.filter(
    c => c.status !== 'closed' && (c.employeeId === currentUser.id || c.type === 'sla_exception_ruling' || c.type === 'scope_dispute' || c.type === 'capacity_requisition' || c.type === 'turnaround_conflict')
  ).length;
  const pendingCSCasesCount = cases.filter(
    c => (c.teamId === 'team-client-service' || c.teamId === currentUser.teamId || c.employeeId === currentUser.id) && c.status !== 'closed'
  ).length;

  const renderSectionHeader = (title: string, isCollapsed: boolean = isSidebarCollapsed) => {
    if (isCollapsed) {
      return <div className="my-2.5 border-t border-border/40 mx-2" />;
    }
    return (
      <div className="pt-4 pb-1.5 px-3 text-[10px] font-mono uppercase tracking-widest font-bold text-text-tertiary">
        {title}
      </div>
    );
  };

  const renderNavButton = (
    id: string,
    label: string,
    icon: React.ReactNode,
    badge?: number | string | null,
    badgeType: 'primary' | 'danger' | 'amber' | 'neutral' = 'primary',
    hasPing?: boolean,
    isCollapsed: boolean = isSidebarCollapsed
  ) => {
    const isActive = activeView === id || (id === 'overview' && isHome);

    const handleNav = () => {
      setActiveView(id);
      setIsMobileSidebarOpen(false);
    };

    if (isCollapsed) {
      return (
        <button
          key={id}
          onClick={handleNav}
          title={`${label}${badge ? ` (${badge})` : ''}`}
          className={`w-full relative flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
            isActive
              ? 'font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
          }`}
          style={
            isActive
              ? {
                  backgroundColor: 'var(--color-surface-elevated)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '0 0 12px -2px var(--color-brand-muted)'
                }
              : undefined
          }
        >
          {isActive && (
            <div
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
              style={{ backgroundColor: 'var(--color-brand)' }}
            />
          )}

          <span
            style={{ color: isActive ? 'var(--color-brand)' : undefined }}
            className={isActive ? '' : 'text-text-tertiary group-hover:text-text-secondary transition-colors'}
          >
            {icon}
          </span>

          {(hasPing || (badge !== undefined && badge !== null && badge !== 0)) && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{
                backgroundColor: hasPing || badgeType === 'danger' ? 'var(--color-critical)' : 'var(--color-brand)'
              }}
            />
          )}
        </button>
      );
    }

    return (
      <button
        key={id}
        onClick={handleNav}
        className={`w-full relative flex items-center justify-between pl-3 pr-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
          isActive
            ? 'font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }`}
        style={
          isActive
            ? {
                backgroundColor: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                boxShadow: '0 0 16px -2px var(--color-brand-muted)'
              }
            : undefined
        }
      >
        {/* Left Active Indicator Bar ▌ */}
        {isActive && (
          <div
            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
            style={{ backgroundColor: 'var(--color-brand)' }}
          />
        )}

        <div className="flex items-center gap-2.5 truncate">
          <span
            style={{ color: isActive ? 'var(--color-brand)' : undefined }}
            className={isActive ? '' : 'text-text-tertiary group-hover:text-text-secondary transition-colors'}
          >
            {icon}
          </span>
          <span
            className="truncate"
            style={{ color: isActive ? 'var(--color-text-primary)' : undefined }}
          >
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasPing && (
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: 'var(--color-critical)' }}
              title="Alert Active"
            />
          )}
          {badge !== undefined && badge !== null && badge !== 0 && (
            <span
              className="text-[11px] font-bold font-mono tracking-tight"
              style={{
                color: badgeType === 'danger'
                  ? 'var(--color-critical)'
                  : isActive
                  ? 'var(--color-brand)'
                  : 'var(--color-text-tertiary)'
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderRoleNavItems = (isCollapsed: boolean) => (
    <>
      {/* ROLE 1: GENERAL MANAGER */}
      {isGM && (
        <>
          {renderNavButton('overview', 'Nerve Center', <Home className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'cases',
            'Cases to Review',
            <Scale className="w-4 h-4" />,
            pendingGMReviewsCount,
            'amber',
            false,
            isCollapsed
          )}
          {renderNavButton('evidence', 'Evidence Vault', <Award className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'agency_workflow',
            'Workflow Engine',
            <Workflow className="w-4 h-4" />,
            null,
            'primary',
            conflictCount > 0,
            isCollapsed
          )}
          {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('master_table', 'Master Schedule', <FolderGit2 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}

          {renderSectionHeader('Studio Oversight', isCollapsed)}

          {renderNavButton('client_service_hub', 'Client Services Tower', <Building2 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('organogram', 'Organogram Directory', <Network className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('summary_matrix', 'Capacity Matrix', <Gauge className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('visual_analytics', 'Visual Analytics', <BarChart3 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('traffic_archive', 'Annual Task Archive', <FolderArchive className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'manager_tower',
            'Governance & Alerts',
            <AlertTriangle className="w-4 h-4" />,
            exceptionsCount,
            'danger',
            false,
            isCollapsed
          )}
        </>
      )}

      {/* ROLE 2: DISCIPLINE MANAGER / CREATIVE DIRECTOR */}
      {isDisciplineLead && (
        <>
          {renderNavButton('overview', 'Creative Studio Hub', <Home className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'agency_workflow',
            'Workflow Engine',
            <Workflow className="w-4 h-4" />,
            null,
            'primary',
            conflictCount > 0,
            isCollapsed
          )}
          {renderNavButton(
            'cases',
            'Team Cases & Reviews',
            <FileCheck className="w-4 h-4" />,
            pendingLeadReviewsCount,
            'amber',
            false,
            isCollapsed
          )}
          {renderNavButton('evidence', 'Evidence & Artifacts', <Award className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('master_table', 'Team Deliverables', <FolderGit2 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('team_traffic', 'Team Bandwidth', <Users className="w-4 h-4" />, null, 'primary', false, isCollapsed)}

          {renderSectionHeader('Department Radar', isCollapsed)}

          {renderNavButton('organogram', 'Organogram Directory', <Network className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('all_work', 'Team Queue', <CircleDot className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('visual_analytics', 'Visual Analytics', <BarChart3 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'manager_tower',
            'Exceptions & Risks',
            <AlertTriangle className="w-4 h-4" />,
            exceptionsCount,
            'danger',
            false,
            isCollapsed
          )}
        </>
      )}

      {/* ROLE 3: TRAFFIC MANAGER */}
      {isTraffic && (
        <>
          {renderNavButton(
            'overview',
            'Traffic Dispatch Hub',
            <Home className="w-4 h-4" />,
            trafficUnassignedCount > 0 ? trafficUnassignedCount : null,
            'amber',
            false,
            isCollapsed
          )}
          {renderNavButton(
            'agency_workflow',
            'Workflow Engine',
            <Workflow className="w-4 h-4" />,
            null,
            'danger',
            conflictCount > 0,
            isCollapsed
          )}
          {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('master_table', 'Master Delivery Schedule', <FolderGit2 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('team_traffic', 'Studio Capacity Matrix', <Gauge className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'cases',
            'Traffic Cases & Rulings',
            <FileCheck className="w-4 h-4" />,
            pendingTrafficCasesCount > 0 ? pendingTrafficCasesCount : null,
            'amber',
            false,
            isCollapsed
          )}
          {renderNavButton('traffic_archive', 'Annual Task Archive', <FolderArchive className="w-4 h-4" />, null, 'primary', false, isCollapsed)}

          {renderSectionHeader('Dispatch Operations', isCollapsed)}

          {renderNavButton('organogram', 'Organogram Directory', <Network className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('all_work', 'Routing Backlog', <CircleDot className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('visual_analytics', 'Visual Analytics', <BarChart3 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'manager_tower',
            'Exceptions & Blockers',
            <AlertTriangle className="w-4 h-4" />,
            exceptionsCount,
            'danger',
            false,
            isCollapsed
          )}
        </>
      )}

      {/* ROLE 4: CLIENT SERVICE / ACCOUNTS */}
      {isClientService && (
        <>
          {renderNavButton('overview', 'Client Service Hub', <Home className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'agency_workflow',
            'Workflow Engine',
            <Workflow className="w-4 h-4" />,
            null,
            'danger',
            conflictCount > 0,
            isCollapsed
          )}
          {renderNavButton(
            'cases',
            'Account Cases & Scope',
            <FileCheck className="w-4 h-4" />,
            pendingCSCasesCount > 0 ? pendingCSCasesCount : null,
            'amber',
            false,
            isCollapsed
          )}
          {renderNavButton('evidence', 'Account Evidence & Impact', <Award className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('master_table', 'Client Deliverables Schedule', <FolderGit2 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}

          {renderSectionHeader('Account Oversight', isCollapsed)}

          {renderNavButton('organogram', 'Organogram Directory', <Network className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('visual_analytics', 'Visual Analytics', <BarChart3 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'manager_tower',
            'Delivery Risks & Escalations',
            <AlertTriangle className="w-4 h-4" />,
            exceptionsCount,
            'danger',
            false,
            isCollapsed
          )}
        </>
      )}

      {/* ROLE 5: SPECIALIST / PRODUCTION EMPLOYEE */}
      {isEmployee && (
        <>
          {renderNavButton('overview', 'My Workspace', <Home className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('my_work', 'My Work', <CheckSquare className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('visual_analytics', 'My Analytics', <BarChart3 className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('evidence', 'My Evidence', <Award className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton(
            'cases',
            'My Cases',
            <FileText className="w-4 h-4" />,
            myCasesCount,
            'primary',
            false,
            isCollapsed
          )}
          {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />, null, 'primary', false, isCollapsed)}

          {renderSectionHeader('Team Context', isCollapsed)}

          {renderNavButton('organogram', 'Organogram Directory', <Network className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('all_work', 'Team Queue', <CircleDot className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
          {renderNavButton('team_traffic', 'Team Bandwidth', <Users className="w-4 h-4" />, null, 'primary', false, isCollapsed)}
        </>
      )}

      {/* Daily Motivation & Focus Card (only when expanded) */}
      {!isCollapsed && <SidebarMotivationCard />}
    </>
  );

  return (
    <>
      {/* ========================================================
          MOBILE & TABLET SLIDE-OUT DRAWER OVERLAY (< lg)
      ======================================================== */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full z-50 shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out select-none border-r ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Mobile Drawer Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                setActiveView('overview');
                setIsMobileSidebarOpen(false);
              }}
              title="TIBULE Control Tower"
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ${
                isDark ? 'border' : ''
              }`}
              style={{
                backgroundColor: isDark ? 'var(--color-surface-elevated)' : 'var(--color-brand)',
                borderColor: isDark ? 'var(--color-brand)' : 'transparent',
                color: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)'
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                style={{
                  stroke: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)'
                }}
              >
                <path d="M4 6h16" />
                <path d="M12 6v14" />
                <path d="M7 11h10" />
              </svg>
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider leading-none text-text-primary">
                TIBULE
              </div>
              <div className="text-[10px] font-mono tracking-widest uppercase mt-0.5 text-text-tertiary">
                Control Tower
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-surface-elevated text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Drawer Role Badge */}
        <div className="px-4 py-2 border-b border-border/60">
          <div
            className="px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-[10px] font-mono"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <span className="font-semibold truncate max-w-[120px] text-text-secondary">
              {currentUser.name}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-brand)'
              }}
            >
              {isGM
                ? 'Executive'
                : isTraffic
                ? 'Traffic Ops'
                : isClientService
                ? (currentUser.seniority === 'lead' || currentUser.role === 'manager' ? 'Head of CS' : 'Client Svc')
                : isDisciplineLead
                ? 'Creative Lead'
                : 'Specialist'}
            </span>
          </div>
        </div>

        {/* Mobile Drawer Scrollable Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {renderRoleNavItems(false)}
        </div>

        {/* Mobile Drawer Footer */}
        <div
          className="p-3 border-t space-y-1"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              openReportModal();
            }}
            title="Generate PDF Performance Report"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-text-tertiary shrink-0" />
            <span>PDF Performance Report</span>
          </button>

          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setActiveView('cases');
            }}
            title="Governance & Settings"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-text-tertiary" />
            <span>Governance &amp; Settings</span>
          </button>

          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setIsAnalystTipsOpen(true);
            }}
            title="Reference & Guidelines"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-text-tertiary" />
            <span>Reference &amp; Guidelines</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          DESKTOP PERSISTENT ARCHITECTURAL SIDEBAR (lg+)
      ======================================================== */}
      <aside
        className={`hidden lg:flex ${isSidebarCollapsed ? 'w-16' : 'w-60'} flex-col h-screen shrink-0 select-none z-30 border-r transition-all duration-200`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
          boxShadow: isDark ? 'inset -1px 0 0 0 rgba(255, 255, 255, 0.04)' : 'inset -1px 0 0 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Brand Header */}
        {isSidebarCollapsed ? (
          <div className="p-3 pb-2 flex flex-col items-center gap-2">
            <div
              onClick={() => setActiveView('overview')}
              title="TIBULE Control Tower"
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 ${
                isDark ? 'border' : ''
              }`}
              style={{
                backgroundColor: isDark ? 'var(--color-surface-elevated)' : 'var(--color-brand)',
                borderColor: isDark ? 'var(--color-brand)' : 'transparent',
                color: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)',
                boxShadow: isDark
                  ? '0 0 16px var(--color-brand-muted)'
                  : '0 2px 10px var(--color-brand-muted)'
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 transition-all duration-200"
                style={{
                  stroke: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)'
                }}
              >
                <path d="M4 6h16" />
                <path d="M12 6v14" />
                <path d="M7 11h10" />
              </svg>
            </div>

            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              className="p-1.5 rounded-lg border border-border/60 hover:bg-surface-elevated text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isDark ? 'border' : ''
                  }`}
                  style={{
                    backgroundColor: isDark ? 'var(--color-surface-elevated)' : 'var(--color-brand)',
                    borderColor: isDark ? 'var(--color-brand)' : 'transparent',
                    color: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)',
                    boxShadow: isDark
                      ? '0 0 16px var(--color-brand-muted)'
                      : '0 2px 10px var(--color-brand-muted)'
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 transition-all duration-200"
                    style={{
                      stroke: isDark ? 'var(--color-brand)' : 'var(--color-brand-contrast)'
                    }}
                  >
                    <path d="M4 6h16" />
                    <path d="M12 6v14" />
                    <path d="M7 11h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-wider leading-none text-text-primary">
                    TIBULE
                  </div>
                  <div className="text-[10px] font-mono tracking-widest uppercase mt-0.5 text-text-tertiary">
                    Control Tower
                  </div>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg border border-border/60 hover:bg-surface-elevated text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Role Identity Tag */}
            <div
              className="mt-3 px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-[10px] font-mono"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <span className="font-semibold truncate max-w-[110px] text-text-secondary">
                {currentUser.name.split(' ')[0]}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-brand)'
                }}
              >
                {isGM
                  ? 'Executive'
                  : isTraffic
                  ? 'Traffic Ops'
                  : isClientService
                  ? (currentUser.seniority === 'lead' || currentUser.role === 'manager' ? 'Head of CS' : 'Client Svc')
                  : isDisciplineLead
                  ? 'Creative Lead'
                  : 'Specialist'}
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation Items */}
        <div className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-1.5' : 'px-3'} py-2 space-y-1`}>
          {renderRoleNavItems(isSidebarCollapsed)}
        </div>

        {/* Bottom Footer Actions */}
        <div
          className={`${isSidebarCollapsed ? 'p-1.5' : 'p-3'} border-t space-y-1`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => openReportModal()}
            title="Generate PDF Performance Report"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer group`}
          >
            <FileDown className="w-4 h-4 text-text-tertiary group-hover:text-text-primary shrink-0 transition-colors" />
            {!isSidebarCollapsed && <span>PDF Performance Report</span>}
          </button>

          <button
            onClick={() => setActiveView('cases')}
            title="Governance & Settings"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer`}
          >
            <Settings className="w-4 h-4 text-text-tertiary" />
            {!isSidebarCollapsed && <span>Governance &amp; Settings</span>}
          </button>

          <button
            onClick={() => setIsAnalystTipsOpen(true)}
            title="Reference & Guidelines"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer`}
          >
            <HelpCircle className="w-4 h-4 text-text-tertiary" />
            {!isSidebarCollapsed && <span>Reference &amp; Guidelines</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
