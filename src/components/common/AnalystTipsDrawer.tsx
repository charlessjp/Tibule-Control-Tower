import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Keyboard, HelpCircle, Lightbulb, BookOpen, Compass, ShieldAlert, Cpu } from 'lucide-react';

interface AnalystTipsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalystTipsDrawer: React.FC<AnalystTipsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-in fade-in duration-150">
      <aside
        id="analyst-tips-drawer"
        className="w-full max-w-md h-full flex flex-col shadow-2xl border-l transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-4 px-6 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)'
              }}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-text-primary">Tibule Control Tower Reference &amp; Guidelines</h2>
              <p className="text-[11px] text-text-tertiary">
                Operational standards, keyboard shortcuts &amp; deliverable architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-text-tertiary hover:text-text-primary"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Keyboard Shortcuts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-brand)' }}>
              <Keyboard className="w-4 h-4" />
              <span>Global Keyboard Acceleration</span>
            </div>
            <div
              className="p-3 rounded-xl border divide-y"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Deliverable Views (1 to 8)</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <kbd
                      key={n}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-brand)'
                      }}
                    >{n}</kbd>
                  ))}
                </div>
              </div>
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Color Theme &amp; Palette Switcher</span>
                <kbd
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-brand)'
                  }}
                >T</kbd>
              </div>
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Toggle Light / Dark Mode</span>
                <div className="flex gap-1">
                  <kbd
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-brand)'
                    }}
                  >D</kbd>
                  <span className="text-[10px] text-text-tertiary self-center">(in Theme modal)</span>
                </div>
              </div>
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Command Bar &amp; Global Search</span>
                <kbd
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-brand)'
                  }}
                >Ctrl + K</kbd>
              </div>
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Tibule Control Tower Reference &amp; Guidelines</span>
                <kbd
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-brand)'
                  }}
                >?</kbd>
              </div>
              <div className="py-2 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-text-secondary">Close Drawers / Modals</span>
                <kbd
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-brand)'
                  }}
                >Esc</kbd>
              </div>
            </div>
          </div>

          {/* Section 2: Methodology Definitions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-500">
              <BookOpen className="w-4 h-4" />
              <span>Operational Methodology Definitions</span>
            </div>
            <div className="space-y-2.5">
              <div
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="font-bold flex items-center justify-between" style={{ color: 'var(--color-brand)' }}>
                  <span>Capacity Divergence Index</span>
                  <span className="font-mono text-[10px] text-text-tertiary">CDI = Act / Cap</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                  Ratio of committed job hours against expected weekly contractual band (e.g. 38h). Rates above 105% trigger warning status; above 120% trigger critical congestion.
                </p>
              </div>

              <div
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="font-bold text-amber-500 flex items-center justify-between">
                  <span>Friction Root-Cause Protocol</span>
                  <span className="font-mono text-[10px] text-text-tertiary">FRCP-4</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                  External blockers must designate a specific actor or dependency (e.g., Client Asset Procurement) to freeze SLA timers and generate automated non-punitive audit traces.
                </p>
              </div>

              <div
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="font-bold text-purple-400 flex items-center justify-between">
                  <span>Case Progression &amp; Appeals</span>
                  <span className="font-mono text-[10px] text-text-tertiary">CT-CP</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                  Employees can assemble work evidence packages into formal promotion cases or lodge metric correction appeals with verifiable cryptographic audit IDs.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Pro-Analyst Workflow Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-500">
              <Lightbulb className="w-4 h-4" />
              <span>Tibule Control Tower Guidelines</span>
            </div>
            <ul
              className="p-3.5 rounded-xl border space-y-2 list-disc list-inside text-[11px] leading-relaxed text-text-secondary"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              <li>Use the numeric keys <kbd className="px-1 py-0.5 rounded font-mono font-bold bg-black/20">1-8</kbd> to jump between the Master Table, Summary Matrix, and Executive Brief.</li>
              <li>Hovering over any metric reveals mathematical calculation trees and lineage trace logs.</li>
              <li>Open the bottom-right AI Copilot to question live dataset variance across teams in natural language.</li>
              <li>Export print-ready Executive Briefs directly via Output C for leadership standups.</li>
            </ul>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          className="p-4 px-6 border-t flex items-center justify-between text-text-tertiary"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-elevated)'
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span>Control Tower Engine Standard</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer text-text-secondary hover:text-text-primary"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            Got it
          </button>
        </div>
      </aside>
    </div>
  );
};
