import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PALETTES, PaletteScheme } from '../../theme/palettes';
import { X, Check, Sun, Moon, Monitor, Sparkles } from 'lucide-react';

interface ThemePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePaletteModal: React.FC<ThemePaletteModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    appearancePreference,
    setAppearancePreference,
    activePaletteId,
    setActivePaletteId,
    currentPalette
  } = useApp();

  const isDark = theme === 'dark';
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        ref={modalRef}
        id="theme-palette-modal"
        className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Modal Header */}
        <div
          className="p-5 px-6 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-muted)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                backgroundColor: 'var(--color-brand-muted)',
                color: 'var(--color-brand)'
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Theme Engine &amp; Visual Language</h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: 'var(--color-brand-muted)',
                    color: 'var(--color-brand)'
                  }}
                >
                  {currentPalette.name} · {theme.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Deliberate token-based design hierarchies calibrated across all ten light/dark states
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* 1. Theme Selection Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  The Five Visual Themes
                </span>
                <p className="text-[11px] text-text-secondary">
                  Each theme features dedicated background, surface, typography, accent, and data-viz tokens.
                </p>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary">
                5 Themes × 2 Modes = 10 Variations
              </span>
            </div>

            {/* Visual Previews Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {PALETTES.map((p) => {
                const isSelected = activePaletteId === p.id;
                // Render preview card reflecting the current active appearance (light or dark)
                const tokens = p[theme];

                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePaletteId(p.id)}
                    className={`relative text-left rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'ring-2 shadow-lg'
                        : 'hover:border-text-tertiary/40 hover:scale-[1.01]'
                    }`}
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                      outlineColor: isSelected ? 'var(--color-brand)' : undefined
                    }}
                  >
                    {/* Active Selected Badge */}
                    {isSelected && (
                      <div
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
                        style={{
                          backgroundColor: 'var(--color-brand)',
                          color: 'var(--color-brand-contrast)'
                        }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Miniature Theme Architecture Mockup Box */}
                    <div
                      className="w-full h-24 rounded-lg p-2.5 mb-3 border relative overflow-hidden flex flex-col justify-between"
                      style={{
                        backgroundColor: tokens.bgBase,
                        borderColor: tokens.border,
                        color: tokens.textPrimary
                      }}
                    >
                      {/* Mini Surface Box */}
                      <div
                        className="rounded p-1.5 border flex items-center justify-between"
                        style={{
                          backgroundColor: tokens.bgSurface,
                          borderColor: tokens.borderSubtle
                        }}
                      >
                        {/* Aa display sample */}
                        <span
                          className="text-xl font-bold tracking-tight"
                          style={{ color: tokens.textPrimary }}
                        >
                          Aa
                        </span>

                        {/* Interactive Accent Pill */}
                        <div
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide"
                          style={{
                            backgroundColor: tokens.accentPrimary,
                            color: tokens.accentContrast
                          }}
                        >
                          {p.name.toUpperCase()}
                        </div>
                      </div>

                      {/* Mini Data & Status Preview Bar */}
                      <div className="flex items-center gap-1.5 mt-auto pt-1">
                        <div
                          className="h-1.5 rounded-full flex-1"
                          style={{ backgroundColor: tokens.accentPrimary }}
                        />
                        <div
                          className="h-1.5 w-3 rounded-full"
                          style={{ backgroundColor: tokens.semantic.success }}
                        />
                        <div
                          className="h-1.5 w-3 rounded-full"
                          style={{ backgroundColor: tokens.semantic.critical }}
                        />
                      </div>
                    </div>

                    {/* Theme Header & Philosophy */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-sm font-bold tracking-tight"
                          style={{ color: isSelected ? 'var(--color-brand)' : 'var(--color-text-primary)' }}
                        >
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-mono text-text-tertiary">
                          #{p.id.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                        {p.philosophy}
                      </p>
                    </div>

                    {/* Palette Swatches Row */}
                    <div className="mt-3 pt-2.5 border-t flex items-center gap-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      {p.swatches.map((color, idx) => (
                        <div
                          key={idx}
                          className="h-2 flex-1 rounded-sm transition-transform group-hover:scale-y-125"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Appearance Segment (Independent of Selected Theme) */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Appearance Mode
                </span>
                <p className="text-[11px] text-text-secondary">
                  Toggles dark, light, or OS-native appearance while keeping the chosen theme architecture intact.
                </p>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary">
                Currently resolved: <strong className="text-text-primary uppercase">{theme}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Light Option */}
              <button
                onClick={() => setAppearancePreference('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  appearancePreference === 'light'
                    ? 'ring-2 shadow-xs'
                    : 'hover:bg-surface-elevated'
                }`}
                style={{
                  backgroundColor:
                    appearancePreference === 'light'
                      ? 'var(--color-surface-elevated)'
                      : 'var(--color-surface)',
                  borderColor:
                    appearancePreference === 'light'
                      ? 'var(--color-brand)'
                      : 'var(--color-border-subtle)',
                  color:
                    appearancePreference === 'light'
                      ? 'var(--color-brand)'
                      : 'var(--color-text-primary)'
                }}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
                {appearancePreference === 'light' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              {/* Dark Option */}
              <button
                onClick={() => setAppearancePreference('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  appearancePreference === 'dark'
                    ? 'ring-2 shadow-xs'
                    : 'hover:bg-surface-elevated'
                }`}
                style={{
                  backgroundColor:
                    appearancePreference === 'dark'
                      ? 'var(--color-surface-elevated)'
                      : 'var(--color-surface)',
                  borderColor:
                    appearancePreference === 'dark'
                      ? 'var(--color-brand)'
                      : 'var(--color-border-subtle)',
                  color:
                    appearancePreference === 'dark'
                      ? 'var(--color-brand)'
                      : 'var(--color-text-primary)'
                }}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark</span>
                {appearancePreference === 'dark' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              {/* System Option */}
              <button
                onClick={() => setAppearancePreference('system')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  appearancePreference === 'system'
                    ? 'ring-2 shadow-xs'
                    : 'hover:bg-surface-elevated'
                }`}
                style={{
                  backgroundColor:
                    appearancePreference === 'system'
                      ? 'var(--color-surface-elevated)'
                      : 'var(--color-surface)',
                  borderColor:
                    appearancePreference === 'system'
                      ? 'var(--color-brand)'
                      : 'var(--color-border-subtle)',
                  color:
                    appearancePreference === 'system'
                      ? 'var(--color-brand)'
                      : 'var(--color-text-primary)'
                }}
              >
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span>System</span>
                {appearancePreference === 'system' && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="p-4 px-6 border-t flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface-muted)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span>Selections persist across sessions</span>
            <span>·</span>
            <span>Shortcut: Press <kbd className="px-1 py-0.5 rounded font-mono text-[10px] bg-surface-elevated border border-border">T</kbd> anywhere</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs hover:opacity-95 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-contrast)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
