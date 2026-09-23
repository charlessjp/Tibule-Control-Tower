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
  Gauge,
  AlertTriangle,
  Settings,
  HelpCircle,
  Workflow,
  FileCheck,
  Scale,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
  FileDown
} from 'lucide-react';
import sidebarMountainImg from '../../assets/images/sidebar_mountain_1789471169503.jpg';

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
    openReportModal
  } = useApp();
  const isDark = theme === 'dark';

  const isHome = activeView === 'overview' || activeView === 'home';
  const exceptionsCount = exceptions.length || 5;
  const conflictCount = jobs.filter((j) => j.workflowStage === 'client_revert' && j.clientRevertInfo?.conflictDetected).length;

  const role = currentUser.role;
  const isGM = role === 'general_manager' || role === 'admin';
  const isTraffic = role === 'traffic_manager';
  const isClientService = role === 'client_service';
  const isDisciplineLead = role === 'manager' || role === 'director' || role === 'team_lead';
  const isEmployee = role === 'employee';

  const pendingGMReviewsCount = cases.filter(c => c.status !== 'closed' && c.status !== 'draft').length;
  const pendingLeadReviewsCount = cases.filter(c => (c.teamId === currentUser.teamId || isGM) && (c.status === 'manager_review' || c.status === 'submitted')).length;
  const myCasesCount = cases.filter(c => c.employeeId === currentUser.id).length;

  const renderSectionHeader = (title: string) => {
    if (isSidebarCollapsed) {
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
    hasPing?: boolean
  ) => {
    const isActive = activeView === id || (id === 'overview' && isHome);

    if (isSidebarCollapsed) {
      return (
        <button
          key={id}
          onClick={() => setActiveView(id)}
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
        onClick={() => setActiveView(id)}
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
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                isActive
                  ? 'border'
                  : badgeType === 'danger'
                  ? 'border'
                  : 'bg-surface-elevated text-text-secondary border border-border'
              }`}
              style={
                badgeType === 'danger'
                  ? {
                      backgroundColor: 'rgba(255, 53, 92, 0.15)',
                      borderColor: 'rgba(255, 53, 92, 0.35)',
                      color: 'var(--color-critical)'
                    }
                  : isActive
                  ? {
                      backgroundColor: 'var(--color-brand-muted)',
                      borderColor: 'var(--color-brand)',
                      color: 'var(--color-brand)'
                    }
                  : undefined
              }
            >
              {badge}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside
      className={`${isSidebarCollapsed ? 'w-16' : 'w-60'} flex flex-col h-screen shrink-0 select-none z-20 border-r transition-all duration-200`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)'
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
              {isGM ? 'Executive' : isTraffic ? 'Traffic Ops' : isClientService ? 'Client Svc' : isDisciplineLead ? 'Lead' : 'Specialist'}
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation Items Tailored by Role */}
      <div className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-1.5' : 'px-3'} py-2 space-y-1`}>
        {/* ROLE 1: GENERAL MANAGER */}
        {isGM && (
          <>
            {renderNavButton('overview', 'Nerve Center', <Home className="w-4 h-4" />)}
            {renderNavButton(
              'cases',
              'Cases to Review',
              <Scale className="w-4 h-4" />,
              pendingGMReviewsCount,
              'amber'
            )}
            {renderNavButton('evidence', 'Evidence Vault', <Award className="w-4 h-4" />)}
            {renderNavButton(
              'agency_workflow',
              'Workflow Engine',
              <Workflow className="w-4 h-4" />,
              null,
              'primary',
              conflictCount > 0
            )}
            {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />)}
            {renderNavButton('executive_brief', 'Executive Brief', <FileText className="w-4 h-4" />)}
            {renderNavButton('master_table', 'Master Schedule', <FolderGit2 className="w-4 h-4" />)}

            {renderSectionHeader('Studio Oversight')}

            {renderNavButton('summary_matrix', 'Capacity Matrix', <Gauge className="w-4 h-4" />)}
            {renderNavButton('visual_analytics', 'Visual Analytics', <Radio className="w-4 h-4" />)}
            {renderNavButton(
              'manager_tower',
              'Governance & Alerts',
              <AlertTriangle className="w-4 h-4" />,
              exceptionsCount,
              'danger'
            )}
          </>
        )}

        {/* ROLE 2: DISCIPLINE MANAGER / CREATIVE DIRECTOR */}
        {isDisciplineLead && (
          <>
            {renderNavButton('overview', 'Creative Studio Hub', <Home className="w-4 h-4" />)}
            {renderNavButton(
              'agency_workflow',
              'Workflow Engine',
              <Workflow className="w-4 h-4" />,
              null,
              'primary',
              conflictCount > 0
            )}
            {renderNavButton(
              'cases',
              'Team Cases & Reviews',
              <FileCheck className="w-4 h-4" />,
              pendingLeadReviewsCount,
              'amber'
            )}
            {renderNavButton('evidence', 'Evidence & Artifacts', <Award className="w-4 h-4" />)}
            {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />)}
            {renderNavButton('master_table', 'Team Deliverables', <FolderGit2 className="w-4 h-4" />)}
            {renderNavButton('team_traffic', 'Team Bandwidth', <Users className="w-4 h-4" />)}

            {renderSectionHeader('Department Radar')}

            {renderNavButton('all_work', 'Team Queue', <CircleDot className="w-4 h-4" />)}
            {renderNavButton(
              'manager_tower',
              'Exceptions & Risks',
              <AlertTriangle className="w-4 h-4" />,
              exceptionsCount,
              'danger'
            )}
          </>
        )}

        {/* ROLE 3: TRAFFIC MANAGER */}
        {isTraffic && (
          <>
            {renderNavButton('overview', 'Traffic Dispatch Hub', <Home className="w-4 h-4" />)}
            {renderNavButton(
              'agency_workflow',
              'Workflow Engine',
              <Workflow className="w-4 h-4" />,
              conflictCount > 0 ? `${conflictCount} conflict` : null,
              'danger',
              conflictCount > 0
            )}
            {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />)}
            {renderNavButton('master_table', 'Master Delivery Schedule', <FolderGit2 className="w-4 h-4" />)}
            {renderNavButton('team_traffic', 'Studio Capacity Matrix', <Gauge className="w-4 h-4" />)}

            {renderSectionHeader('Dispatch Operations')}

            {renderNavButton('all_work', 'Routing Backlog', <CircleDot className="w-4 h-4" />)}
            {renderNavButton(
              'manager_tower',
              'Exceptions & Blockers',
              <AlertTriangle className="w-4 h-4" />,
              exceptionsCount,
              'danger'
            )}
          </>
        )}

        {/* ROLE 4: CLIENT SERVICE / ACCOUNTS */}
        {isClientService && (
          <>
            {renderNavButton('overview', 'Client Service Hub', <Home className="w-4 h-4" />)}
            {renderNavButton(
              'agency_workflow',
              'Workflow Engine',
              <Workflow className="w-4 h-4" />,
              conflictCount > 0 ? `${conflictCount} revert` : null,
              'danger',
              conflictCount > 0
            )}
            {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />)}
            {renderNavButton('master_table', 'All Deliverables', <FolderGit2 className="w-4 h-4" />)}
            {renderNavButton('executive_brief', 'Executive Brief', <FileText className="w-4 h-4" />)}

            {renderSectionHeader('Account Oversight')}

            {renderNavButton('all_work', 'Client Deliverable Queue', <CircleDot className="w-4 h-4" />)}
            {renderNavButton(
              'manager_tower',
              'Delivery Risks',
              <AlertTriangle className="w-4 h-4" />,
              exceptionsCount,
              'danger'
            )}
          </>
        )}

        {/* ROLE 5: SPECIALIST / PRODUCTION EMPLOYEE */}
        {isEmployee && (
          <>
            {renderNavButton('overview', 'My Workspace', <Home className="w-4 h-4" />)}
            {renderNavButton('my_work', 'My Work', <CheckSquare className="w-4 h-4" />)}
            {renderNavButton('evidence', 'My Evidence', <Award className="w-4 h-4" />)}
            {renderNavButton(
              'cases',
              'My Cases',
              <FileText className="w-4 h-4" />,
              myCasesCount,
              'primary'
            )}
            {renderNavButton('champions', 'Studio Champions', <Trophy className="w-4 h-4" />)}

            {renderSectionHeader('Team Context')}

            {renderNavButton('all_work', 'Team Queue', <CircleDot className="w-4 h-4" />)}
            {renderNavButton('team_traffic', 'Team Bandwidth', <Users className="w-4 h-4" />)}
          </>
        )}

        {/* Atmospheric Mountain Image Card (only when expanded) */}
        {!isSidebarCollapsed && (
          <div className="pt-4 px-1">
            <div
              className="relative rounded-2xl overflow-hidden border h-36 flex flex-col justify-end p-3.5 group shadow-sm"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <img
                src={sidebarMountainImg}
                alt="Mountain atmosphere"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <p className="text-xs font-bold text-white leading-snug">
                  Good work builds what&apos;s next.
                </p>
                <div
                  className="w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div
        className={`${isSidebarCollapsed ? 'p-1.5' : 'p-3'} border-t space-y-1`}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => openReportModal()}
          title="Generate PDF Performance Report"
          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer`}
        >
          <FileDown className="w-4 h-4 text-emerald-500 shrink-0" />
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
  );
};
