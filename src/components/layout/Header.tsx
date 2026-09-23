import React, { useState } from 'react';
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
  FileDown
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
    logout,
    jobs,
    webNotifications,
    nearlyDueWarningHours,
    isSidebarCollapsed,
    toggleSidebar
  } = useApp();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

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

  return (
    <header
      className="h-16 border-b px-6 flex items-center justify-between gap-4 z-40 transition-colors duration-200 shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Search Bar Input & Collapsed Toggle */}
      <div className="flex-1 max-w-lg flex items-center gap-2.5">
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="p-2 rounded-xl border border-border bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <div
          onClick={() => setIsCommandBarOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border cursor-pointer transition-colors text-xs group text-text-secondary hover:text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
            <span className="truncate">
              Search tasks, projects, or teammates...
            </span>
          </div>
          <kbd
            className="px-2 py-0.5 rounded-md border text-[10px] font-mono shrink-0 text-text-tertiary"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Palette Theme Selector */}
        <button
          onClick={() => setIsPaletteModalOpen(true)}
          title="Change Theme Palette (Press 'T')"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Palette className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
          <span className="hidden md:inline text-[11px]">{currentPalette.name}</span>
        </button>

        {/* Executive PDF Performance Dossier Report Trigger */}
        <button
          onClick={() => openReportModal()}
          title="Generate Graphically Appealing PDF Performance Report"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline text-[11px]">PDF Report</span>
        </button>

        {/* AI Assistant Trigger */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          title="Ask AI Assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs hover:brightness-110 transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-brand-contrast)'
          }}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Ask AI</span>
        </button>

        {/* Deadline Radar & Email Alerts Trigger */}
        <button
          onClick={() => setIsDeadlineRadarOpen(true)}
          title="Deadline Radar & Email Dispatch Center"
          className="relative p-2 rounded-xl border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Bell className="w-3.5 h-3.5" />
          {totalBadgeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {totalBadgeCount}
            </span>
          )}
        </button>

        {/* Help & Shortcuts Trigger */}
        <button
          onClick={() => setIsAnalystTipsOpen(true)}
          title="Tibule Control Tower Reference & Guidelines (Press '?')"
          className="p-2 rounded-xl border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Theme Toggle Pill */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl border transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
          ) : (
            <Moon className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
          )}
        </button>

        {/* User Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-text-primary"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="leading-tight font-medium text-xs truncate max-w-[110px]">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-text-tertiary leading-tight">
                {formatRole(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-text-tertiary ml-1" />
          </button>

          {isPersonaOpen && (
            <>
              {/* Dismiss overlay to capture clicks outside */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                onClick={() => setIsPersonaOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 transition-all text-text-primary"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
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
              <div className="space-y-1 max-h-64 overflow-y-auto">
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
                          if (activeView === 'executive_brief' || activeView === 'summary_matrix' || activeView === 'visual_analytics') {
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
          </>
          )}
        </div>
      </div>
    </header>
  );
};
