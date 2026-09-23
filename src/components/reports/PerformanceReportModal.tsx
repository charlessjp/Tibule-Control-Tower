import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { getPermittedReportTargets } from '../../utils/reportPermissions';
import {
  compileUserPerformanceReport,
  ReportDateScope,
  calculateDateRangeFromUnit
} from '../../utils/performanceReportEngine';
import { PerformanceReportDocument } from './PerformanceReportDocument';
import { ReportScopeCalendarPicker } from './ReportScopeCalendarPicker';
import { formatRole, formatSeniority } from '../../utils/formatters';
import { PALETTES, PaletteScheme } from '../../theme/palettes';
import { generateExecutivePDF } from '../../utils/pdfExportEngine';
import {
  X,
  FileDown,
  Printer,
  UserCheck,
  Calendar,
  Sparkles,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Users,
  Palette
} from 'lucide-react';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetUserId?: string | null;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  isOpen,
  onClose,
  initialTargetUserId
}) => {
  const {
    currentUser,
    users,
    teams,
    jobs,
    overtimeLogs,
    recognitions,
    cases,
    theme: appTheme,
    currentPalette: appPalette
  } = useApp();

  const printRootRef = useRef<HTMLDivElement>(null);

  // Determine permitted targets based on hierarchical role rules
  const permittedTargets = useMemo(() => {
    return getPermittedReportTargets(currentUser, users, teams);
  }, [currentUser, users, teams]);

  // Selected target employee
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (initialTargetUserId && permittedTargets.some((u) => u.id === initialTargetUserId)) {
      return initialTargetUserId;
    }
    return currentUser.id;
  });

  // Calendar / Duration Scope Filter
  const [reportScope, setReportScope] = useState<ReportDateScope>(() => {
    return calculateDateRangeFromUnit(30, 'days', new Date(2026, 8, 22));
  });

  // Report Theme Mode Choice: 'light' | 'dark' | 'app'
  const [reportThemeChoice, setReportThemeChoice] = useState<'light' | 'dark' | 'app'>('app');

  // Report Colorway Palette Choice: 'app' or palette ID
  const [reportPaletteChoice, setReportPaletteChoice] = useState<string>('app');

  // Resolved Theme & Palette Tokens
  const effectiveThemeMode: 'light' | 'dark' = useMemo(() => {
    if (reportThemeChoice === 'app') {
      return appTheme || 'dark';
    }
    return reportThemeChoice;
  }, [reportThemeChoice, appTheme]);

  const effectivePalette: PaletteScheme = useMemo(() => {
    if (reportPaletteChoice === 'app') {
      return appPalette || PALETTES[0];
    }
    return PALETTES.find((p) => p.id === reportPaletteChoice) || appPalette || PALETTES[0];
  }, [reportPaletteChoice, appPalette]);

  // Tokens for the report/dossier document itself
  const activeTokens = effectivePalette[effectiveThemeMode];

  // Tokens for modal header toolbar controls (kept synchronized with the larger application theme)
  const appTokens = useMemo(() => {
    const pal = appPalette || PALETTES[0];
    const mode = appTheme || 'dark';
    return pal[mode];
  }, [appPalette, appTheme]);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Target User lookup
  const targetUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || currentUser;
  }, [users, selectedUserId, currentUser]);

  // Compile Report Data
  const reportData = useMemo(() => {
    return compileUserPerformanceReport(
      targetUser,
      users,
      jobs,
      overtimeLogs,
      recognitions,
      cases,
      currentUser,
      reportScope
    );
  }, [targetUser, users, jobs, overtimeLogs, recognitions, cases, currentUser, reportScope]);

  if (!isOpen) return null;

  const isGM = currentUser.role === 'general_manager' || currentUser.role === 'admin';
  const isSuperiors = currentUser.role === 'director' || currentUser.role === 'manager' || currentUser.role === 'team_lead' || currentUser.role === 'traffic_manager';

  // Handler: Generate high-fidelity content-aware PDF using isolated staging & smart section pagination
  const handleDownloadPDF = async () => {
    if (!printRootRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await generateExecutivePDF({
        reportElement: printRootRef.current,
        report: reportData,
        activeTokens,
        themeMode: effectiveThemeMode,
        paletteName: effectivePalette.name,
        targetUserName: targetUser.name
      });

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('PDF Generation Failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handler: Native browser vector print
  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border"
              style={{
                backgroundColor: `${activeTokens.accentPrimary}18`,
                borderColor: `${activeTokens.accentPrimary}40`,
                color: activeTokens.accentPrimary
              }}
            >
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">
                  Executive PDF Performance Dossier Generator
                </h2>
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                  style={{ color: activeTokens.accentPrimary }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: activeTokens.accentPrimary }} />
                  <span>Theme Responsive • {effectiveThemeMode.toUpperCase()} MODE</span>
                </span>
              </div>
              <p className="text-xs text-text-tertiary">
                High-fidelity agency performance audit dossier dynamically formatted for light print and darkroom presentation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar: User Selector, Scope, Theme Mode & Palette Colorway */}
        <div className="px-6 py-3.5 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Target Employee Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono uppercase font-bold text-text-secondary flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Audited Staff:</span>
              </label>

              {permittedTargets.length === 1 ? (
                // Regular staff: locked to themselves
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-text-primary">
                  <span className="font-bold">{targetUser.name}</span>
                  <span className="text-[10px] font-mono text-text-tertiary">({targetUser.jobTitle || formatRole(targetUser.role)})</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: `${activeTokens.semantic.success}18`,
                      color: activeTokens.semantic.success
                    }}
                  >
                    Self
                  </span>
                </div>
              ) : (
                // Superior / GM: selector with permitted subordinates
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-text-primary outline-hidden focus:border-brand cursor-pointer"
                >
                  {permittedTargets.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === currentUser.id ? '(Self)' : `— ${u.jobTitle || formatRole(u.role)} (${formatSeniority(u.seniority)})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Audit Scope / Calendar & Duration Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono uppercase font-bold text-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Scope:</span>
              </label>
              <ReportScopeCalendarPicker
                value={reportScope}
                onChange={(newScope) => setReportScope(newScope)}
                activeTokens={appTokens}
                referenceDate={new Date(2026, 8, 22)}
              />
            </div>

            {/* Color Theme Mode Toggle (Light Paper vs Dark Dossier vs Sync with App) */}
            <div className="flex items-center p-1 rounded-lg border border-border bg-surface-elevated">
              <button
                onClick={() => setReportThemeChoice('light')}
                title="Format report in high-contrast crisp white paper mode"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  reportThemeChoice === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setReportThemeChoice('dark')}
                title="Format report in executive midnight dark mode"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  reportThemeChoice === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setReportThemeChoice('app')}
                title={`Follow current application theme (${appTheme})`}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  reportThemeChoice === 'app'
                    ? 'border shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
                style={
                  reportThemeChoice === 'app'
                    ? {
                        backgroundColor: activeTokens.bgSurface,
                        color: activeTokens.accentPrimary,
                        borderColor: activeTokens.border
                      }
                    : {}
                }
              >
                <Laptop className="w-3 h-3" />
                <span>Auto ({appTheme})</span>
              </button>
            </div>

            {/* Brand Colorway / Palette Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-mono uppercase font-bold text-text-secondary flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Palette:</span>
              </label>
              <select
                value={reportPaletteChoice}
                onChange={(e) => setReportPaletteChoice(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-text-primary outline-hidden focus:border-brand cursor-pointer"
              >
                <option value="app">Sync App ({appPalette.name})</option>
                {PALETTES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.tagline.split('•')[0] || p.tagline}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: PDF Export & Vector Print */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleNativePrint}
              title="Open browser print dialog to print or save vector PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-elevated hover:bg-surface text-xs font-semibold text-text-primary transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Print Vector</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: activeTokens.accentPrimary,
                color: activeTokens.accentContrast
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rendering PDF...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download {effectiveThemeMode.toUpperCase()} PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Paper Canvas */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center transition-colors"
          style={{
            backgroundColor: effectiveThemeMode === 'dark' ? '#04070a' : '#eceff3'
          }}
        >
          <div className="w-full max-w-[850px]">
            <PerformanceReportDocument
              report={reportData}
              documentRef={printRootRef}
              themeMode={effectiveThemeMode}
              palette={effectivePalette}
            />
          </div>
        </div>

        {/* Modal Footer Note */}
        <div
          className="px-6 py-2.5 border-t border-border bg-surface-elevated flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-tertiary font-mono"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Hierarchy Access: {isGM ? 'General Manager (Full Agency Access)' : isSuperiors ? 'Superior (Self + Department Subordinates)' : 'Staff (Self Performance Only)'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Colorway: <strong style={{ color: activeTokens.accentPrimary }}>{effectivePalette.name} ({effectiveThemeMode})</strong></span>
            <span>Target: {targetUser.name} • {permittedTargets.length} Authorized Persona(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
