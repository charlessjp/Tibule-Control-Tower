import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { formatRole } from '../../utils/formatters';
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Check,
  Palette,
  Bot,
  HelpCircle,
  Bell,
  PanelLeftOpen,
  LogOut,
  UserPlus,
  Shield,
  FileDown,
  BarChart3,
  Menu,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  onOpenAudit?: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    users,
    theme,
    toggleTheme,
    currentPalette,
    setIsPaletteModalOpen,
    setIsAnalystTipsOpen,
    setIsCopilotOpen,
    setIsCommandBarOpen,
    setIsDeadlineRadarOpen,
    setIsAuthModalOpen,
    openReportModal,
    openLogDeliveryImpactModal,
    deliveryImpactLogs,
    logout,
    jobs,
    webNotifications,
    nearlyDueWarningHours,
    isSidebarCollapsed,
    toggleSidebar,
    toggleMobileSidebar
  } = useApp();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const personaButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 72, right: 24 });
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0;
    return isSidebarCollapsed ? 64 : 240;
  });

  // Dynamically determine exact sidebar width to ensure frosted glass covers entire screen right of sidebar
  useEffect(() => {
    const updateSidebarWidth = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarWidth(0);
        return;
      }
      const asideEl = document.querySelector('aside.lg\\:flex');
      if (asideEl) {
        const width = asideEl.getBoundingClientRect().width;
        if (width > 0) {
          setSidebarWidth(width);
          return;
        }
      }
      setSidebarWidth(isSidebarCollapsed ? 64 : 240);
    };
    updateSidebarWidth();
    // Re-check after sidebar transition completes
    const timer = setTimeout(updateSidebarWidth, 220);
    window.addEventListener('resize', updateSidebarWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, [isSidebarCollapsed]);

  const handleTogglePersona = () => {
    if (!isPersonaOpen && personaButtonRef.current) {
      const rect = personaButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right)
      });
      setIsPersonaOpen(true);
    } else {
      setIsPersonaOpen(false);
    }
  };

  useEffect(() => {
    if (!isPersonaOpen) return;
    const handleResize = () => {
      if (personaButtonRef.current) {
        const rect = personaButtonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right)
        });
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        personaButtonRef.current &&
        !personaButtonRef.current.contains(e.target as Node)
      ) {
        setIsPersonaOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPersonaOpen]);

  // Count unread notifications relevant to current user or active escalations
  const unreadCount = webNotifications.filter(
    (n) =>
      !n.read &&
      (n.recipientId === currentUser.id ||
        currentUser.role === 'general_manager' ||
        currentUser.role === 'traffic_manager' ||
        currentUser.role === 'creative_director')
  ).length;

  const activeEscalationsCount = jobs.filter((j) => {
    if (j.status === 'completed' || j.workflowStage === 'completed') return false;
    const due = new Date(j.dueDate).getTime();
    const diffH = (due - Date.now()) / (1000 * 60 * 60);
    return diffH <= (nearlyDueWarningHours || 24);
  }).length;

  const totalBadgeCount = Math.max(unreadCount, activeEscalationsCount);
  const activeImpactCount = deliveryImpactLogs.filter((l) => l.status === 'active').length;

  return (
    <header
      className="sticky top-0 h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 z-40 transition-all duration-200 shrink-0 liquid-glass-nav text-text-primary"
    >
      {/* Search Bar Input & Collapsed Toggle / Mobile Drawer Trigger */}
      <div className="flex-1 max-w-md flex items-center gap-2">
        {/* Mobile Navigation Drawer Trigger (< lg) */}
        <button
          onClick={toggleMobileSidebar}
          title="Open Navigation Menu"
          className="p-2 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Sidebar Expand Button */}
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="hidden lg:flex p-2 rounded-xl border border-border bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div
          onClick={() => setIsCommandBarOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all text-xs group text-text-secondary hover:text-text-primary bg-surface-elevated border border-border hover:border-border-subtle"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="truncate hidden sm:inline text-text-secondary">
              Search tasks, projects, teammates...
            </span>
            <span className="truncate sm:hidden text-text-tertiary">
              Search...
            </span>
          </div>
          <kbd
            className="hidden sm:inline px-1.5 py-0.5 rounded border text-[10px] font-mono shrink-0 text-text-tertiary bg-surface border-border"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls - Ergonomic Clusters */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Action: Delivery Impediment Risk Trigger */}
        <button
          onClick={() => openLogDeliveryImpactModal()}
          title="Log Delivery Impediment or Delay"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-semibold">Delivery Risk</span>
          {activeImpactCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-1 rounded">
              {activeImpactCount}
            </span>
          )}
        </button>

        {/* Secondary Tools Cluster */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => openReportModal()}
            title="Generate PDF Performance Report"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-text-secondary hover:text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border"
          >
            <FileDown className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="text-[11px]">PDF Report</span>
          </button>

          <button
            onClick={() => setIsCopilotOpen(true)}
            title="Ask AI Assistant"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-text-secondary hover:text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border"
          >
            <Bot className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="text-[11px]">AI Assistant</span>
          </button>
        </div>

        {/* Subtle Visual Divider */}
        <div className="hidden sm:block h-4 w-px bg-border/60 mx-0.5" />

        {/* Deadline Radar Notification Center */}
        <button
          onClick={() => setIsDeadlineRadarOpen(true)}
          title="Deadline Radar & Alerts"
          className="relative p-2 rounded-lg transition-colors cursor-pointer text-text-secondary hover:text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border shrink-0"
        >
          <Bell className="w-3.5 h-3.5" />
          {totalBadgeCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {totalBadgeCount}
            </span>
          )}
        </button>

        {/* Unified Appearance Controls: Theme Mode & Palette */}
        <div className="flex items-center rounded-lg bg-surface-elevated border border-border p-0.5">
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-1.5 rounded-md transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-sky-500" />
            )}
          </button>
          <button
            onClick={() => setIsPaletteModalOpen(true)}
            title="Theme Palette Colors (Press 'T')"
            className="p-1.5 rounded-md transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface"
          >
            <Palette className="w-3.5 h-3.5 text-brand" />
          </button>
        </div>

        {/* Subtle Visual Divider */}
        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* User Persona Switcher */}
        <div className="relative shrink-0">
          <button
            ref={personaButtonRef}
            onClick={handleTogglePersona}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] bg-brand text-brand-contrast"
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="leading-tight font-medium text-xs truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-text-tertiary leading-tight">
                {formatRole(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-text-tertiary" />
          </button>

          {isPersonaOpen && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[99999] pointer-events-auto">
              {/* Frosted glass backdrop covering screen */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  bottom: 0,
                  left: `${sidebarWidth}px`,
                  right: 0,
                  width: `calc(100vw - ${sidebarWidth}px)`,
                  height: '100vh'
                }}
                className="bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-150 cursor-pointer"
                onClick={() => setIsPersonaOpen(false)}
              />

              {/* Persona Switcher Dropdown menu positioned accurately relative to trigger */}
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: `${dropdownPos.top}px`,
                  right: `${Math.max(12, dropdownPos.right)}px`,
                  maxHeight: 'calc(100vh - 100px)'
                }}
                className="w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl border p-2 z-[100000] text-text-primary liquid-glass-elevated shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col"
              >
                <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary font-bold border-b border-border mb-1">
                  <span>Active Squad Persona</span>
                  <button
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[10px] text-[var(--color-brand)] font-bold hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Register</span>
                  </button>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[50vh] pr-0.5">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsPersonaOpen(false);

                          // Smart view routing based on role boundaries
                          if (u.role === 'traffic_manager' || u.role === 'client_service') {
                            if (activeView === 'cases' || activeView === 'my_work' || activeView === 'evidence') {
                              setActiveView('agency_workflow');
                            }
                          } else if (u.role === 'general_manager' || u.role === 'admin') {
                            if (activeView === 'my_work' || activeView === 'evidence') {
                              setActiveView('overview');
                            }
                          } else if (u.role === 'manager' || u.role === 'director' || u.role === 'team_lead') {
                            if (activeView === 'my_work' || activeView === 'evidence') {
                              setActiveView('overview');
                            }
                          } else if (u.role === 'employee') {
                            if (activeView === 'summary_matrix') {
                              setActiveView('overview');
                            }
                          }
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left"
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'var(--color-surface-elevated)',
                                color: 'var(--color-text-primary)',
                                fontWeight: 600
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                            style={{
                              backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--color-border-subtle)',
                              color: isSelected ? '#ffffff' : 'var(--color-text-secondary)'
                            }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="truncate font-medium">{u.name}</div>
                            <div className="text-[10px] text-text-tertiary truncate">
                              {u.jobTitle} • {formatRole(u.role)}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-brand)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Actions: Sign Out & Register */}
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      setIsPersonaOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    <span>New Sign Up</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPersonaOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
};
