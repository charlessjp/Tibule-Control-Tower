import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseType } from '../../types';
import {
  X,
  FileCheck,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FolderArchive,
  Scale
} from 'lucide-react';

interface BuildMyCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildMyCaseModal: React.FC<BuildMyCaseModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createCase, jobs, theme } = useApp();
  const isDark = theme === 'dark';

  const isTraffic = currentUser.role === 'traffic_manager' || currentUser.department === 'traffic';
  const isClientService =
    currentUser.role === 'client_service' ||
    currentUser.department === 'client_services' ||
    currentUser.teamId === 'team-client-service';

  const [caseType, setCaseType] = useState<CaseType>(
    isTraffic ? 'sla_exception_ruling' : isClientService ? 'scope_dispute' : 'role_review'
  );
  const [title, setTitle] = useState(
    isTraffic
      ? 'SLA Exception Determination & Client Delay Waiver'
      : isClientService
      ? 'Client Scope Creep Defense & Commercial Reconciliation'
      : 'Role Review & Progression to Lead / Compensation Review'
  );
  const [narrative, setNarrative] = useState(
    isTraffic
      ? 'Client deliverables encountered unbudgeted revision cycles and partner asset delivery bottlenecks. Requesting formal SLA buffer adjustment (+48h) and delivery waiver to keep creative staff on-time velocity intact.'
      : isClientService
      ? 'Client submitted consecutive unbudgeted revisions exceeding agreed brief scope. Requesting formal scope ruling and commercial billing reconciliation to protect delivery margin.'
      : 'Over the last 9 months, my contributions have expanded significantly from individual delivery to governing our core design tokens, coordinating cross-team handoffs with Client Service, and mentoring team members.'
  );

  if (!isOpen) return null;

  const handleCaseTypeChange = (type: CaseType) => {
    setCaseType(type);
    if (isTraffic) {
      if (type === 'sla_exception_ruling') {
        setTitle('SLA Exception Determination & Client Delay Waiver');
        setNarrative('Client deliverables encountered unbudgeted revision cycles and partner asset delivery bottlenecks. Requesting formal SLA buffer adjustment (+48h) and delivery waiver to keep creative staff on-time velocity intact.');
      } else if (type === 'scope_dispute') {
        setTitle('Scope Creep Dispute: Unbudgeted Dieline Revisions');
        setNarrative('Client Service submitted consecutive post-signoff revisions exceeding original brief parameters. Requesting formal scope ruling to either bill additional hours or adjust delivery cutoff.');
      } else if (type === 'capacity_requisition') {
        setTitle('Emergency Studio Capacity: Freelance / Contractor Surge');
        setNarrative('Creative squad desks are running above 94% utilization with upcoming campaign launches. Requesting immediate approval for external contractor capacity.');
      } else if (type === 'turnaround_conflict') {
        setTitle('Turnaround Arbitration: Campaign Launch Priority Queue');
        setNarrative('Two tier-1 client deliverables have conflicting delivery milestones. Requesting formal priority ruling to schedule sequential delivery without breach penalty.');
      } else if (type === 'role_review') {
        setTitle('Traffic Lead Progression & Operations Oversight Review');
        setNarrative('Over the last 12 months, I have maintained a 98.4% on-time dispatch rate across 460 agency deliverables, implemented the Annual Task Archive & OneDrive backup sync, and mediated 38 client scope disputes with zero client churn.');
      }
    } else if (isClientService) {
      if (type === 'scope_dispute') {
        setTitle('Client Scope Creep Defense & Commercial Reconciliation');
        setNarrative('Client submitted consecutive unbudgeted revisions exceeding agreed brief scope. Requesting formal scope ruling and commercial billing reconciliation to protect delivery margin.');
      } else if (type === 'sla_exception_ruling') {
        setTitle('Client Asset Delay Waiver: Handoff Buffer Adjustment');
        setNarrative('Client stakeholder delayed delivering key campaign source assets by 72 hours. Requesting milestone deadline extension without client SLA breach penalty.');
      } else if (type === 'role_review') {
        setTitle('Account Leadership Progression & Seniority Advancement');
        setNarrative('Over the past 12 months, I have maintained 100% key client retention across Zenith Bank, Aura Cosmetics, and Kalahari Solar, managed brief formulation for 140+ deliverables, and protected studio margins against unbilled scope creep.');
      } else if (type === 'salary_review') {
        setTitle('Account Management Benchmark & Compensation Calibration');
        setNarrative('Consistent management of tier-1 client accounts and commercial growth warrant formal calibration to senior account leadership salary bands.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isTrafficOperational =
      caseType === 'sla_exception_ruling' ||
      caseType === 'scope_dispute' ||
      caseType === 'capacity_requisition' ||
      caseType === 'turnaround_conflict';

    createCase({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeTitle: currentUser.jobTitle,
      teamId: currentUser.teamId,
      type: caseType,
      status: 'submitted',
      reviewerId: currentUser.managerId,
      reviewerName: isTraffic ? 'Operations & Executive Board' : 'Manager Review Board',
      title,
      narrative,
      trafficImpact: isTrafficOperational
        ? {
            slaExtensionDays: caseType === 'sla_exception_ruling' ? 2 : 1,
            riskTier: 'moderate',
            affectedClient: 'Zenith Bank Ghana',
            affectedProject: 'Digital Banking App Relaunch',
            disputeDetails: narrative,
            mitigationActions: [
              'Master delivery schedule adjusted with verified buffer',
              'Client Service account director notified of commercial variance',
              'Preserved in 1-Year Task Archive and Microsoft OneDrive ledger'
            ]
          }
        : undefined,
      evidenceData: isTraffic
        ? {
            responsibilityGrowth: {
              originalCount: 12,
              currentCount: 26,
              items: [
                '1-Year Historical Task Archive & OneDrive Sync Governance',
                'Creative Team Workload Leveling & Dispatch Points Engine',
                'Cross-Agency SLA Dispute Mediation & Arbitrations',
                'Client Service Intake Quality Standardization'
              ]
            },
            workVolume: {
              previousPeriodCount: 180,
              currentPeriodCount: 460,
              totalHours: 1980
            },
            complexityIncreasePercent: 42,
            additionalContributions: [
              'Maintained 100% OneDrive cloud ledger synchronization',
              'Eliminated dispatch bottlenecks for 5 consecutive quarters',
              'Reduced unassigned delivery lag from 4.2h to 24 minutes'
            ],
            outcomes: [
              '98.4% on-time SLA dispatch reliability across all client accounts',
              'Preserved 64+ comprehensive job records in permanent cloud storage',
              'Zero unmanaged delivery breaches across tier-1 client deliverables'
            ],
            linkedJobIds: ['CT-1842', 'CT-1848', 'CT-1855', 'CT-1857']
          }
        : {
            responsibilityGrowth: {
              originalCount: 4,
              currentCount: 8,
              items: [
                'Design Token & Typography System Architecture',
                'Cross-Team Coordination with Client Service',
                'Junior Designer Mentorship and Peer Review',
                'Client Executive Stakeholder Presentations'
              ]
            },
            workVolume: {
              previousPeriodCount: 22,
              currentPeriodCount: 38,
              totalHours: 460
            },
            complexityIncreasePercent: 34,
            additionalContributions: [
              'Saved 34% frontend rework via tokenized design system',
              'Supported emergency recovery for high-priority sprints',
              'Conducted cross-team alignment workshops'
            ],
            outcomes: [
              '96.8% on-time delivery across complex deliverables',
              'Zero trademark defects on international campaigns',
              'Consistently rated exceptional in peer and lead commendations'
            ],
            linkedJobIds: ['CT-1842', 'CT-1848', 'CT-1855', 'CT-1857']
          }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="build-my-case-modal"
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)'
              }}
            >
              {isTraffic ? <Scale className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                {isTraffic ? 'Traffic Operations & Career Governance' : 'Evidence-Backed Career Progression'}
              </div>
              <h2 className="text-base font-bold text-text-primary">
                {isTraffic ? 'Build Traffic Case • Operations & Progression' : 'Build My Case • Progression & Role Review'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Case Type Selector */}
          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              Review Objective / Case Category
            </label>
            <select
              value={caseType}
              onChange={(e) => handleCaseTypeChange(e.target.value as CaseType)}
              className="w-full p-2.5 rounded-xl border font-medium focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              {isTraffic ? (
                <>
                  <option value="sla_exception_ruling">SLA Exception &amp; Deadline Waiver Ruling</option>
                  <option value="scope_dispute">Client Scope Creep Dispute &amp; Capacity Protection</option>
                  <option value="capacity_requisition">Emergency Studio Capacity &amp; Contractor Request</option>
                  <option value="turnaround_conflict">Priority Arbitration &amp; Queue Clearance</option>
                  <option value="role_review">Traffic Lead Progression &amp; Operations Review</option>
                  <option value="salary_review">Traffic Compensation &amp; Salary Calibration</option>
                  <option value="workload_concern">Traffic Desk Bandwidth &amp; Coordination Appeal</option>
                  <option value="process_improvement">Agency Workflow &amp; Brief Intake Innovation</option>
                </>
              ) : isClientService ? (
                <>
                  <option value="scope_dispute">Client Scope Creep &amp; Commercial Reconciliation</option>
                  <option value="sla_exception_ruling">Client Turnaround Relief &amp; Asset Delay Waiver</option>
                  <option value="role_review">Account Leadership Progression &amp; Role Review</option>
                  <option value="salary_review">Account Management Compensation Calibration</option>
                  <option value="promotion">Client Services Seniority Promotion</option>
                  <option value="workload_concern">Key Account Portfolio Bandwidth Adjustment</option>
                  <option value="process_improvement">Client Brief Intake &amp; Handoff Process Innovation</option>
                </>
              ) : (
                <>
                  <option value="role_review">Role Review &amp; Responsibility Expansion</option>
                  <option value="salary_review">Compensation / Salary Calibration</option>
                  <option value="promotion">Formal Promotion Nomination</option>
                  <option value="workload_concern">Workload Balancing &amp; Capacity Correction</option>
                  <option value="resource_request">Dedicated Team Resource Request</option>
                  <option value="process_improvement">Organisational Process Innovation</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              Case Subject &amp; Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border font-semibold text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          {/* System-Generated Evidence Summary */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-text-secondary">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                {isTraffic ? 'Traffic Desk Operational Metrics (1-Year Archive Verified)' : 'Verified Longitudinal Metrics (Auto-Compiled from Audit Logs)'}
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">100% Traceable</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: 'var(--color-brand)' }}>
                  {isTraffic ? '12 → 26' : '4 → 8'}
                </div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">
                  {isTraffic ? 'Weekly Briefs Governed' : 'Responsibility Scope'}
                </div>
              </div>
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono text-purple-400">
                  {isTraffic ? '460' : '+34%'}
                </div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">
                  {isTraffic ? 'Archived Deliverables' : 'Complexity Shift'}
                </div>
              </div>
              <div
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {isTraffic ? '98.4%' : '96.8%'}
                </div>
                <div className="text-[10px] uppercase text-text-tertiary mt-0.5">Delivery Reliability</div>
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t text-text-secondary" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-semibold text-[11px] text-text-primary">
                Key Demonstrated Outcomes:
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {isTraffic ? (
                  <>
                    <li>Governed 460+ deliverables across 5 quarters with 1-Year Task Archive &amp; OneDrive sync</li>
                    <li>Resolved 38 client scope disputes with zero unbudgeted overrun</li>
                    <li>Maintained 100% immutable ledger backups connected to Microsoft 365 OneDrive</li>
                  </>
                ) : (
                  <>
                    <li>Instituted reusable design token specification across Tibule web &amp; mobile</li>
                    <li>Zero design defects on Zenith Global international relaunch</li>
                    <li>38 completed high-impact assignments in current performance review cycle</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Employee Narrative */}
          <div>
            <label className="block uppercase font-bold mb-1.5 text-text-secondary">
              {isTraffic ? 'Operational Context & Evidence Statement' : 'Employee Context & Personal Statement'}
            </label>
            <textarea
              rows={4}
              required
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describe the operational or career progression context..."
              className="w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div
            className="p-3 rounded-xl text-[11px] flex items-center gap-2 border text-text-secondary"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
            <span>
              Your case will enter formal governance: <strong>Submitted → Operations Review → Evidence Verification → Leadership Decision</strong>.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-contrast)'
              }}
            >
              Submit Evidence Case
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
