import React, { useState } from 'react';
import {
  BookOpen,
  X,
  BarChart3,
  TrendingUp,
  Activity,
  Compass,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getChartColorPair } from '../../utils/chartColorUtils';

interface GraphInterpretationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: 'overview' | 'barchart' | 'linechart' | 'scatterplot' | 'radar' | 'matrix';
}

export const GraphInterpretationModal: React.FC<GraphInterpretationModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview'
}) => {
  const { currentPalette, theme } = useApp();
  const [activeTab, setActiveTab] = useState<string>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isPure = currentPalette.id === 'pure';
  const tokens = currentPalette[theme];
  const { actualColor, plannedColor, plannedLabel } = getChartColorPair(
    currentPalette.id,
    tokens.accentPrimary,
    isDark,
    'complementary'
  );

  const sections = [
    { id: 'overview', title: 'Executive Overview', icon: BookOpen },
    { id: 'barchart', title: '1. Hours Distribution', icon: BarChart3 },
    { id: 'linechart', title: '2. Capacity Trajectory', icon: TrendingUp },
    { id: 'scatterplot', title: '3. Estimation Scatterplot', icon: Activity },
    { id: 'radar', title: '4. Operational Radar', icon: Compass },
    { id: 'matrix', title: 'Anomaly Action Matrix', icon: Zap }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: isPure && isDark ? 'var(--color-surface)' : actualColor,
                color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast,
                border: isPure && isDark ? '1px solid var(--color-border)' : undefined
              }}
            >
              <BookOpen className="w-5 h-5" style={{ color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text-primary tracking-tight">
                  Studio Analytics &amp; Graph Interpretation Field Manual
                </h2>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                The authoritative operator guide for understanding chart diagnostics, color harmony, and managerial intervention thresholds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-border bg-surface overflow-x-auto scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-brand-primary text-text-primary bg-surface-elevated'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                style={isActive ? { borderBottomColor: actualColor } : undefined}
              >
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: actualColor } : undefined} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6 text-text-primary text-xs leading-relaxed">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Purpose of Visual Analytics in Tibule Agency Workflow
                </h3>
                <p className="text-text-secondary">
                  Creative agencies operate under volatile project commitments, tight SLA milestones, and high cognitive load. 
                  Tabular spreadsheets provide audit trails, but they fail to convey systemic operational drift before contracts are breached. 
                  Tibule's visual analytics suite transforms deliverable data into four distinct diagnostic vectors:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <div className="font-bold text-text-primary flex items-center gap-1.5 mb-1">
                      <BarChart3 className="w-3.5 h-3.5" style={{ color: actualColor }} />
                      1. Discipline Quoting Reality
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Measures whether creative disciplines (Motion, 3D, Identity, Collateral) are systematically under- or over-quoted in initial client briefs.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <div className="font-bold text-text-primary flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: plannedColor }} />
                      2. Studio Capacity Thresholds
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Forecasts multi-week sprint overload before deadlines hit, preventing unmitigated designer overtime and client delivery friction.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <div className="font-bold text-text-primary flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      3. Deliverable-Level Scope Bleed
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Dissects every individual deliverable in 2D space to pinpoint runaway deliverables and unbilled client change orders that averages hide.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <div className="font-bold text-text-primary flex items-center gap-1.5 mb-1">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      4. Agency Operational Health Radar
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Translates governance, blocker turnaround, and SLA delivery rates into a balanced 6-pillar operational health assessment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Harmony Section */}
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                  The Theme-Adherent Complementary Color System
                </h4>
                <p className="text-text-secondary">
                  Previous monochromatic chart schemes produced poor discernment between planned and actual values. 
                  The updated engine uses rigorous color theory:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg border border-border bg-surface flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md mt-0.5 shrink-0 shadow-sm" style={{ backgroundColor: actualColor }} />
                    <div>
                      <div className="font-bold text-text-primary">Theme Color = Actual Logged Execution</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        Reflects physical hours logged and finalized creative deliveries. Anchored to your active workspace theme ({currentPalette.name}).
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-surface flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md mt-0.5 shrink-0 shadow-sm" style={{ backgroundColor: plannedColor }} />
                    <div>
                      <div className="font-bold text-text-primary">Opposite Hue / Charcoal = Planned &amp; Committed</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        {plannedLabel}. Located exactly opposite on the color wheel for instant, zero-confusion visual contrast.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BAR CHART */}
          {activeTab === 'barchart' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: actualColor }} />
                    Hours Distribution by Stream (Planned vs Actual Logged)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border font-mono">
                    Aggregate Discipline View
                  </span>
                </div>
                <p className="text-text-secondary">
                  This chart aggregates all deliverable hours across core creative disciplines (Brand Identity, Digital Systems, Collateral, Motion Graphics, and 3D Production).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: actualColor }} />
                    Actual Logged Hours
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    Sum of actual billable and non-billable hours logged by assignees on completed and in-flight deliverables.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plannedColor }} />
                    Planned Quoted Hours
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    Sum of initial scoped hours agreed in the client brief and assigned by Traffic during sprint intake.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Operational Variance
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    The gap between Planned and Actual. Indicates whether quoting rate-cards reflect actual studio production reality.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <div className="font-bold text-text-primary">How to Interpret &amp; Take Action:</div>
                <ul className="list-disc pl-5 space-y-1.5 text-text-secondary text-[11px]">
                  <li>
                    <strong className="text-text-primary">Actual &gt; Planned (Overrun):</strong> If a stream like Motion Graphics shows actuals 30% above planned, creative teams are either hitting unexpected technical friction or absorbing client scope additions without change orders. <em>Action:</em> Require Traffic to update the discipline complexity multiplier.
                  </li>
                  <li>
                    <strong className="text-text-primary">Actual &lt; Planned (Buffer):</strong> Deliverables completed faster than estimated. <em>Action:</em> Verify quality assurance sign-offs to confirm deliverables were not rushed; use excess buffer for proactive asset polish.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: CAPACITY TRAJECTORY */}
          {activeTab === 'linechart' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: actualColor }} />
                    Capacity vs. Workload Trajectory (Multi-Week Sprint Radar)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border font-mono">
                    Temporal Forecast
                  </span>
                </div>
                <p className="text-text-secondary">
                  A multi-week trend line plotting contractual studio capacity against incoming committed client demand and completed output.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-500" />
                    Available Capacity (380h)
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    The contractual ceiling: net available production hours of active creative staff (excluding contracted leave, meetings, and training).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: plannedColor }} />
                    Committed Workload
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    Total hours booked into the studio schedule for that sprint week. Styled in the high-contrast complementary color.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: actualColor }} />
                    Completed Output
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    Actual finalized deliverable volume delivered to client review. Styled in the active theme brand color.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <div className="font-bold text-text-primary">Critical Warning Signal:</div>
                <p className="text-text-secondary text-[11px]">
                  When the <strong>Committed Workload</strong> line climbs above the dashed <strong>Available Capacity</strong> line (as occurred in Wk 36–37), the studio enters an oversubscription hazard. Overdue SLA cascades and designer burnout occur 7–10 days later unless Traffic immediately defers non-critical jobs or client services secures milestone extensions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SCATTERPLOT */}
          {activeTab === 'scatterplot' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Deliverable Scope Estimation Variance Polarity (Scatterplot)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                    Deliverable-Level Diagnostic
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium">
                  <strong>Why We Need the Scatterplot (Justification):</strong> Aggregate bar charts hide individual disasters. 
                  A category can show a perfect 100 planned hours vs 100 actual hours, completely masking that five easy jobs took 5 hours instead of 10, while one critical deliverable took 75 hours instead of 50! The scatterplot is the only tool that isolates <em>every single deliverable</em> in 2D space to detect rogue scope creep and quoting bias.
                </div>
              </div>

              {/* 4 Quadrants Explanation */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                  The 4 Diagnostic Quadrants (Divided by the 45° Parity Line y = x)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                    <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Upper Quadrant: Scope Bleed Zone (Actual &gt; Estimated)
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Deliverables plotted above the 45° diagonal line required more effort than originally scoped. 
                      High concentration here points to client scope creep, unbilled revision requests, or junior staff struggling without art direction guidance.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lower Quadrant: Margin Buffer Zone (Actual &lt; Estimated)
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Deliverables plotted below the diagonal line were completed under budget. 
                      Signals high operational velocity and profitable execution. If too far below, estimates may be padded.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
                    <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      The 45° Line (y = x): Perfect Estimation Parity
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Deliverables resting directly on or near the diagonal line represent flawless scoping: 
                      estimated hours matched real delivery hours within ±10%.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                    <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Top-Right Outliers: High-Exposure Deliverables
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Large-scale strategic deliverables (30+ hours). Any percentage deviation here has massive financial impact on agency profitability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RADAR CHART */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    System Operational Radar (The 6 Agency Pillars De-jargonized)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border font-mono">
                    Balanced Scorecard
                  </span>
                </div>
                <p className="text-text-secondary text-xs">
                  The Operational Radar evaluates agency health across 6 concrete operational pillars representing milestone execution, scoping realism, approval quality, and timesheet production efficiency:
                </p>
              </div>

              {/* 6 Dimensions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">1. On-Time SLA Delivery</span>
                    <span className="font-mono text-emerald-500 font-bold">92% (Target: &ge;90%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Percentage of client deliverables completed prior to contractual delivery milestone without unapproved date extensions.
                    <br />
                    <em>Why it matters:</em> Direct driver of client retention and SLA compliance.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">((Total Deliverables - Overdue/At-Risk) / Total) × 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">2. Scope Quoting Accuracy</span>
                    <span className="font-mono text-emerald-500 font-bold">86% (Target: &ge;85%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Ratio of initial estimated hours to actual logged hours across finished deliverables.
                    <br />
                    <em>Why it matters:</em> Ensures creative directors quote work realistically and protect studio profit margins.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">Mean (1 - |Actual - Scoped| / Scoped) × 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">3. First-Time Client Approval Rate</span>
                    <span className="font-mono text-emerald-500 font-bold">88% (Target: &ge;85%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Percentage of deliverables accepted by client on Stage 10 sign-off without triggering revert loops or rework cycles.
                    <br />
                    <em>Why it matters:</em> Bounced deliverables multiply unbilled rework hours and trigger cross-job schedule collisions.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">(Zero-Revert Deliverables / Evaluated Deliverables) × 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">4. Blocker Resolution Agility</span>
                    <span className="font-mono text-amber-500 font-bold">74% (Target: &ge;80%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Clearance rate and turnaround speed for external dependencies (missing client assets, brand fonts, legal sign-offs).
                    <br />
                    <em>Why it matters:</em> Prevents creative assignees from sitting blocked on active sprint deliverables.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">((Total - Stalled/Blocked Deliverables) / Total) × 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">5. Internal Review Pass Rate</span>
                    <span className="font-mono text-emerald-500 font-bold">88% (Target: &ge;85%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Deliverables approved during Stage 07 Studio Lead critique without being rejected back to assignees for internal rework.
                    <br />
                    <em>Why it matters:</em> Direct studio quality gatekeeping: catches craftsmanship gaps and brand deviations before the client ever sees the work.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">((Reviewed Deliverables - Internal Rejections) / Reviewed) × 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">6. Rework Effort Control</span>
                    <span className="font-mono text-emerald-500 font-bold">86% (Target: &ge;85%)</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    <strong>Definition:</strong> Ratio of direct creative production hours to total hours logged (including revision and correction hours).
                    <br />
                    <em>Why it matters:</em> Pure timesheet math. Directly tracks what percentage of studio labor creates new billable value vs fixing errors.
                  </p>
                  <div className="pt-2 border-t border-border text-[10px] text-text-tertiary">
                    Calculation: <span className="font-mono text-text-primary">((Total Logged Hours - Total Rework Hours) / Total Logged Hours) × 100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACTION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-primary" />
                  Operational Anomaly Response Matrix
                </h3>
                <p className="text-text-secondary text-[11px]">
                  When a visualization identifies an operational anomaly, consult this matrix for the exact responsible role and mandatory next step:
                </p>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-surface-elevated border-b border-border text-text-tertiary uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Visual Signal / Anomaly</th>
                      <th className="p-3">Underlying Cause</th>
                      <th className="p-3">Primary Owner</th>
                      <th className="p-3">Mandatory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-rose-500">
                        Scatterplot: Cluster in Top-Left (Actual &gt;&gt; Estimated)
                      </td>
                      <td className="p-3 text-text-secondary">
                        Client scope creep without formal change orders or junior designer estimation errors.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Traffic &amp; Client Services</td>
                      <td className="p-3 text-text-secondary">
                        File Scope Creep Case in Cases Hub; freeze deliverable until Client Partner issues budget extension.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-amber-500">
                        Trajectory: Committed Workload crosses Capacity line
                      </td>
                      <td className="p-3 text-text-secondary">
                        Studio overbooked for upcoming sprint week.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Traffic Manager (Kwame)</td>
                      <td className="p-3 text-text-secondary">
                        Reassign secondary collateral subtasks to lower-load staff or shift deadlines forward by 3 days.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-purple-400">
                        Radar: Blocker Resolution Speed drops below 75%
                      </td>
                      <td className="p-3 text-text-secondary">
                        External client asset delivery delays (missing logos, fonts, legal feedback).
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Head of Client Service (David Vance)</td>
                      <td className="p-3 text-text-secondary">
                        Issue Client Dependency Escalation to client stakeholder; pause SLA countdown clock.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-rose-500">
                        Radar: First-Time Client Approval drops below 85%
                      </td>
                      <td className="p-3 text-text-secondary">
                        Brief intake ambiguity or skipped debrief alignment causing client rework and unbilled revision loops.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Creative Director &amp; Account Lead</td>
                      <td className="p-3 text-text-secondary">
                        Audit recent client revert records; enforce mandatory Stage 04 Debrief sign-off before creative assignment.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-amber-500">
                        Radar: Internal Review Pass Rate drops below 85%
                      </td>
                      <td className="p-3 text-text-secondary">
                        Assignees submitting unpolished deliverables without self-QA; gaps in junior creative mentorship.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Studio Lead (Elena Rostova)</td>
                      <td className="p-3 text-text-secondary">
                        Hold 1-on-1 critique sessions; review Stage 07 critique feedback; pair junior assignees with seniors.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-rose-500">
                        Radar: Rework Effort Control drops below 85% (Rework &gt; 15%)
                      </td>
                      <td className="p-3 text-text-secondary">
                        Excessive timesheet hours consumed fixing revisions rather than creating new deliverable assets.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Traffic Manager &amp; CD</td>
                      <td className="p-3 text-text-secondary">
                        Audit rework hours logged on active jobs; enforce debrief freeze and formal change orders for out-of-scope revisions.
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-hover/50">
                      <td className="p-3 font-bold text-blue-400">
                        Bar Chart: Actuals 40%+ over in 3D / Motion Stream
                      </td>
                      <td className="p-3 text-text-secondary">
                        Standard discipline hourly rate card is outdated for current creative toolsets.
                      </td>
                      <td className="p-3 font-semibold text-text-primary">Creative Manager (Elena) &amp; GM</td>
                      <td className="p-3 text-text-secondary">
                        Update discipline estimation multiplier in intake form from 1.0x to 1.35x.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface-elevated text-xs">
          <div className="text-text-secondary">
            Tip: You can switch between <strong>Wheel Complementary</strong> and <strong>Architectural Graphite</strong> in Visual Analytics anytime.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
            style={{
              backgroundColor: isPure && isDark ? 'var(--color-surface)' : actualColor,
              color: isPure && isDark ? 'var(--color-text-primary)' : tokens.accentContrast,
              border: isPure && isDark ? '1px solid var(--color-border)' : undefined
            }}
          >
            Acknowledge &amp; Return to Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
