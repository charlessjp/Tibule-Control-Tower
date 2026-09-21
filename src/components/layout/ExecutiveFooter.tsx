import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ShieldCheck, Terminal, Sparkles, Cpu, Clock } from 'lucide-react';

export const ExecutiveFooter: React.FC = () => {
  const { currentPalette, setIsAnalystTipsOpen, setIsPaletteModalOpen } = useApp();

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer
      className="h-9 border-t px-6 flex items-center justify-between text-[11px] font-mono select-none z-20 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)'
      }}
    >
      {/* Left: Operational Heartbeat & Model Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-xs text-text-primary">
            HEARTBEAT OK
          </span>
          <span className="opacity-50">· 24ms</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 opacity-80">
          <Cpu className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
          <span>Gemini 3.8 Flash Engine</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 opacity-80">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Control Tower Verified</span>
        </div>
      </div>

      {/* Center: Ergonomic Hotkeys Helper */}
      <div className="hidden sm:flex items-center gap-2 text-[10px]">
        <span className="opacity-60">Hotkeys:</span>
        <span
          className="px-1.5 py-0.2 rounded border"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          1-8 Views
        </span>
        <button
          onClick={() => setIsPaletteModalOpen(true)}
          className="px-1.5 py-0.2 rounded border hover:opacity-100 cursor-pointer transition-opacity"
          style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-brand)' }}
        >
          T Palette ({currentPalette.name})
        </button>
        <button
          onClick={() => setIsAnalystTipsOpen(true)}
          className="px-1.5 py-0.2 rounded border hover:opacity-100 cursor-pointer transition-opacity"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          ? Reference &amp; Guidelines
        </button>
        <span
          className="px-1.5 py-0.2 rounded border"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          Ctrl+K Command
        </span>
      </div>

      {/* Right: Clock & Trace ID */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline opacity-60">TRACE: CT-9042</span>
        <div className="flex items-center gap-1.5 font-bold text-text-primary">
          <Clock className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
          <span>{currentTime}</span>
        </div>
      </div>
    </footer>
  );
};
