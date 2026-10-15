import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
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
import { OutputDDeepDiveCards } from './components/deliverables/OutputDDeepDiveCards';
import { OutputEVisualAnalytics } from './components/deliverables/OutputEVisualAnalytics';
import { AgencyWorkflowEngineView } from './components/workflow/AgencyWorkflowEngineView';
import { TrafficDispatchHubView } from './components/workflow/TrafficDispatchHubView';
import { TrafficYearArchiveView } from './components/workflow/TrafficYearArchiveView';
import { ClientServiceHubView } from './components/clientservice/ClientServiceHubView';
import { AgencyOrganogramView } from './components/organogram/AgencyOrganogramView';
import { ExceptionsAndRisksView } from './components/manager/ExceptionsAndRisksView';
import { StudioChampionsView } from './components/competition/StudioChampionsView';
import { DeadlineRadarModal } from './components/notifications/DeadlineRadarModal';
import { AuthPortal } from './components/auth/AuthPortal';
import { LogOvertimeModal } from './components/employee/LogOvertimeModal';
import { LogDeliveryImpactModal } from './components/workflow/LogDeliveryImpactModal';
import { PerformanceReportModal } from './components/reports/PerformanceReportModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
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
        } else if (currentUser.role === 'traffic_manager') {
          return <TrafficDispatchHubView />;
        } else if (
          currentUser.role === 'client_service' ||
          currentUser.department === 'client_services' ||
          currentUser.teamId === 'team-client-service'
        ) {
          return <ClientServiceHubView />;
        } else if (currentUser.role === 'manager' || currentUser.role === 'director' || currentUser.role === 'team_lead') {
          return <ManagerDashboard />;
        } else {
          return <GeneralManagerDashboard />;
        }
      case 'agency_workflow':
        return <AgencyWorkflowEngineView />;
      case 'master_table':
        return <OutputAMasterTable />;
      case 'summary_matrix':
        // Only GM and admin have access to macro executive matrix
        if (currentUser.role !== 'general_manager' && currentUser.role !== 'admin') {
          return currentUser.role === 'employee' ? <EmployeeDashboard /> : <ManagerDashboard />;
        }
        return <OutputBSummaryMatrix />;
      case 'deep_dive_cards':
        return <OutputDDeepDiveCards />;
      case 'visual_analytics':
        return <OutputEVisualAnalytics />;
      case 'my_work':
        return <MyWorkView filterMode="my_work" />;
      case 'team_traffic':
        return <TeamTrafficView />;
      case 'manager_tower':
        return <ExceptionsAndRisksView />;
      case 'gm_nervous_system':
        if (currentUser.role !== 'general_manager' && currentUser.role !== 'admin') {
          return currentUser.role === 'employee' ? <EmployeeDashboard /> : <ManagerDashboard />;
        }
        return <GeneralManagerDashboard />;
      case 'cases':
        return <CasesManagementView />;
      case 'traffic_archive':
        return <TrafficYearArchiveView />;
      case 'evidence':
        return <MyEvidenceView />;
      case 'client_service_hub':
        return <ClientServiceHubView />;
      case 'champions':
        return <StudioChampionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'organogram':
        return <AgencyOrganogramView />;
      case 'all_work':
        return (
          <MyWorkView
            filterMode={
              currentUser.role === 'general_manager' ||
              currentUser.role === 'admin' ||
              currentUser.role === 'traffic_manager'
                ? 'all_work'
                : 'team_queue'
            }
          />
        );
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
          <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-5 md:py-6 pb-20 lg:pb-6">
            <div className="max-w-[1700px] mx-auto">
              <ErrorBoundary
                key={activeView}
                fallbackTitle={`Issue Loading ${activeView.replace('_', ' ').toUpperCase()}`}
                fallbackSubtitle="The application caught an unexpected error in this view. You can return to your dashboard overview without losing data."
                onReset={() => setActiveView('overview')}
              >
                {renderActiveView()}
              </ErrorBoundary>
            </div>
          </main>

          {/* Contextual Side Inspector Panel (Progressive Disclosure) */}
          <OperationalInspector />
        </div>

        {/* Mobile Touch Navigation Bar (< lg) */}
        <MobileBottomNav />
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

      {/* Staff & Lead Delivery Impediment & Deadline Risk Logging Modal */}
      <LogDeliveryImpactModal />

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
    <ErrorBoundary
      fallbackTitle="Control Tower Recovery Mode"
      fallbackSubtitle="An unexpected system-level error occurred. Control Tower state has been preserved."
      onReset={() => window.location.reload()}
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
