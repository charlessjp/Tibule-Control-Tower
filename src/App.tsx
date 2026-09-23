import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { GeneralManagerDashboard } from './components/gm/GeneralManagerDashboard';
import { MyWorkView } from './components/employee/MyWorkView';
import { MyEvidenceView } from './components/employee/MyEvidenceView';
import { TeamTrafficView } from './components/manager/TeamTrafficView';
import { CasesManagementView } from './components/cases/CasesManagementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { OperationalInspector } from './components/common/OperationalInspector';
import { AuditTrailDrawer } from './components/common/AuditTrailDrawer';
import { ExplainableMetricModal } from './components/common/ExplainableMetricModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { OnboardingFlowModal } from './components/common/OnboardingFlowModal';
import { BuildMyCaseModal } from './components/cases/BuildMyCaseModal';
import { CorrectionAppealModal } from './components/cases/CorrectionAppealModal';
import { ThemePaletteModal } from './components/common/ThemePaletteModal';
import { AnalystTipsDrawer } from './components/common/AnalystTipsDrawer';
import { AICopilotDrawer } from './components/common/AICopilotDrawer';
import { CloudStateSyncModal } from './components/common/CloudStateSyncModal';
import { OutputAMasterTable } from './components/deliverables/OutputAMasterTable';
import { OutputBSummaryMatrix } from './components/deliverables/OutputBSummaryMatrix';
import { OutputCExecutiveBrief } from './components/deliverables/OutputCExecutiveBrief';
import { OutputDDeepDiveCards } from './components/deliverables/OutputDDeepDiveCards';
import { OutputEVisualAnalytics } from './components/deliverables/OutputEVisualAnalytics';
import { AgencyWorkflowEngineView } from './components/workflow/AgencyWorkflowEngineView';
import { StudioChampionsView } from './components/competition/StudioChampionsView';
import { DeadlineRadarModal } from './components/notifications/DeadlineRadarModal';
import { AuthPortal } from './components/auth/AuthPortal';
import { LogOvertimeModal } from './components/employee/LogOvertimeModal';
import { PerformanceReportModal } from './components/reports/PerformanceReportModal';

const AppContent: React.FC = () => {
  const {
    activeView,
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    theme,
    currentPalette,
    isPaletteModalOpen,
    setIsPaletteModalOpen,
    isAnalystTipsOpen,
    setIsAnalystTipsOpen,
    isCopilotOpen,
    setIsCopilotOpen,
    isCloudSyncOpen,
    setIsCloudSyncOpen,
    isDeadlineRadarOpen,
    setIsDeadlineRadarOpen,
    isAuditDrawerOpen,
    setIsAuditDrawerOpen,
    metricTraceModal,
    setMetricTraceModal,
    showOnboardingModal,
    setShowOnboardingModal,
    showBuildCaseModal,
    setShowBuildCaseModal,
    showCorrectionModal,
    setShowCorrectionModal,
    isReportModalOpen,
    closeReportModal,
    reportTargetUserId
  } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        if (currentUser.role === 'employee') {
          return <EmployeeDashboard />;
        } else if (currentUser.role === 'traffic_manager' || currentUser.role === 'client_service') {
          return <AgencyWorkflowEngineView />;
        } else if (currentUser.role === 'manager') {
          return <ManagerDashboard />;
        } else {
          return <GeneralManagerDashboard />;
        }
      case 'agency_workflow':
        return <AgencyWorkflowEngineView />;
      case 'master_table':
        return <OutputAMasterTable />;
      case 'summary_matrix':
        return <OutputBSummaryMatrix />;
      case 'executive_brief':
        return <OutputCExecutiveBrief />;
      case 'deep_dive_cards':
        return <OutputDDeepDiveCards />;
      case 'visual_analytics':
        return <OutputEVisualAnalytics />;
      case 'my_work':
        return <MyWorkView filterMode="my_work" />;
      case 'team_traffic':
        return <TeamTrafficView />;
      case 'manager_tower':
        return <ManagerDashboard />;
      case 'gm_nervous_system':
        return <GeneralManagerDashboard />;
      case 'cases':
        return <CasesManagementView />;
      case 'evidence':
        return <MyEvidenceView />;
      case 'champions':
        return <StudioChampionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'all_work':
        return <MyWorkView filterMode={currentUser.role === 'general_manager' || currentUser.role === 'admin' ? 'all_work' : 'team_queue'} />;
      default:
        return <EmployeeDashboard />;
    }
  };

  const pMode = currentPalette[theme];

  // If user is logged out, present the dedicated Sign In / Registration Agency Portal
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen w-screen overflow-y-auto transition-colors duration-200 relative flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-text-primary)'
        }}
      >
        <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none z-0" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25 z-0"
          style={{ background: 'var(--color-brand-glow)' }}
        />
        <div className="relative z-10 w-full max-w-2xl my-auto">
          <AuthPortal defaultMode="login" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden transition-colors duration-200 relative"
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Ambient Visual Atmosphere: Tactical Dot Grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none z-0" />

      {/* Ambient Radial Glow Field */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20 z-0"
        style={{ background: 'var(--color-brand-glow)' }}
      />

      {/* Persistent Left Architectural Navigation */}
      <Sidebar />

      {/* Main Workspace Layout with Split Inspector */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden z-10 transition-colors duration-200"
        style={{ backgroundColor: 'transparent' }}
      >
        <Header />

        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Operational View Surface */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-[1700px] mx-auto">
              {renderActiveView()}
            </div>
          </main>

          {/* Contextual Side Inspector Panel (Progressive Disclosure) */}
          <OperationalInspector />
        </div>
      </div>

      {/* Auxiliary Global Drawers & Modals */}
      <AuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />
      <GlobalSearchModal />
      <ExplainableMetricModal
        traceData={metricTraceModal}
        onClose={() => setMetricTraceModal(null)}
      />
      <OnboardingFlowModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
      <BuildMyCaseModal
        isOpen={showBuildCaseModal}
        onClose={() => setShowBuildCaseModal(false)}
      />
      <CorrectionAppealModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
      />

      {/* Control Tower Palette Switcher Modal */}
      <ThemePaletteModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
      />

      {/* Control Tower Analyst Methodology & Keyboard Guide Drawer */}
      <AnalystTipsDrawer
        isOpen={isAnalystTipsOpen}
        onClose={() => setIsAnalystTipsOpen(false)}
      />

      {/* Contextual AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Cloud Persistence Snapshot Modal */}
      <CloudStateSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
      />

      {/* Deadline Radar & Automated Email Dispatch Notification Center */}
      <DeadlineRadarModal
        isOpen={isDeadlineRadarOpen}
        onClose={() => setIsDeadlineRadarOpen(false)}
      />

      {/* Pre-9 AM / Post-5 PM Overtime Logging Modal */}
      <LogOvertimeModal />

      {/* Graphical PDF Performance Report Modal */}
      <PerformanceReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        initialTargetUserId={reportTargetUserId}
      />

      {/* Squad Member Registration & Account Switch Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <AuthPortal
            isModal
            defaultMode="register"
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => setIsAuthModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
