import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

// 10 Atmospheric Photographic Visuals
import sidebarMountainImg from '../../assets/images/sidebar_mountain_1789471169503.jpg';
import sidebarSunriseImg from '../../assets/images/sidebar_sunrise_1790864404401.jpg';
import sidebarGeometricImg from '../../assets/images/sidebar_geometric_1790864417586.jpg';
import sidebarOceanImg from '../../assets/images/sidebar_ocean_1790864427272.jpg';
import sidebarForestImg from '../../assets/images/sidebar_forest_1790864441526.jpg';
import controlTowerBannerImg from '../../assets/images/control_tower_banner_1789471153509.jpg';
import sidebarDuneImg from '../../assets/images/sidebar_dune_1790865605985.jpg';
import sidebarBridgeImg from '../../assets/images/sidebar_bridge_1790865620919.jpg';
import sidebarSkylightImg from '../../assets/images/sidebar_skylight_1790865632221.jpg';
import sidebarZenWaterImg from '../../assets/images/sidebar_zen_water_1790865643728.jpg';

interface VisualAsset {
  id: string;
  src: string;
  alt: string;
}

const VISUAL_ASSETS: VisualAsset[] = [
  { id: 'forest', src: sidebarForestImg, alt: 'Misty tranquil forest canopy' },
  { id: 'geometric', src: sidebarGeometricImg, alt: 'Minimalist brutalist architecture in morning light' },
  { id: 'ocean', src: sidebarOceanImg, alt: 'Serene ocean horizon at dawn' },
  { id: 'sunrise', src: sidebarSunriseImg, alt: 'Architectural sunrise over calm water' },
  { id: 'mountain', src: sidebarMountainImg, alt: 'Atmospheric mountain ridges' },
  { id: 'control_tower', src: controlTowerBannerImg, alt: 'Agency operations control hub' },
  { id: 'dune', src: sidebarDuneImg, alt: 'Minimalist golden sand dune curves' },
  { id: 'bridge', src: sidebarBridgeImg, alt: 'Architectural suspension bridge in quiet morning fog' },
  { id: 'skylight', src: sidebarSkylightImg, alt: 'Minimalist glass skylight into twilight sky' },
  { id: 'zen_water', src: sidebarZenWaterImg, alt: 'Dark slate pool with serene water ripple' }
];

interface CraftMantra {
  tag: string;
  mantra: string;
  subtext: string;
}

const CRAFT_MANTRAS: CraftMantra[] = [
  {
    tag: 'Strategic Vision',
    mantra: 'The best work solves the problem nobody thought to measure.',
    subtext: 'Push beyond the expected baseline.'
  },
  {
    tag: 'Precision & Craft',
    mantra: 'Clear intent turns complex briefs into definitive work.',
    subtext: 'Frame the challenge. Set the standard.'
  },
  {
    tag: 'Deep Flow',
    mantra: 'Momentum is built one thoughtful deliverable at a time.',
    subtext: 'Protect focus. Let craft compound.'
  },
  {
    tag: 'Rigor & Standards',
    mantra: 'Excellence is not an accident—it is standard operating procedure.',
    subtext: 'Elevate every detail before handoff.'
  },
  {
    tag: 'Delivery Impact',
    mantra: 'Good work builds what\u2019s next. Close strong and seal the record.',
    subtext: 'Ship with pride. Celebrate team wins.'
  },
  {
    tag: 'Architectural Focus',
    mantra: 'Step back to see the architecture behind the craft.',
    subtext: 'Great ideas need space to breathe.'
  },
  {
    tag: 'Quiet Clarity',
    mantra: 'Quiet clarity sets the tone for everything that follows.',
    subtext: 'Calm execution outlasts reactive rush.'
  },
  {
    tag: 'Client Partnership',
    mantra: 'Trust is earned in advance of deadlines, not in retrospect.',
    subtext: 'Deliver early. Clarify assumptions.'
  },
  {
    tag: 'First-Pass Quality',
    mantra: 'First-time approval is the byproduct of disciplined listening.',
    subtext: 'Absorb the brief before touching the canvas.'
  },
  {
    tag: 'System Discipline',
    mantra: 'Creativity thrives within strong operational scaffolding.',
    subtext: 'Respect the workflow. Master the output.'
  },
  {
    tag: 'Zero-Revert Standard',
    mantra: 'Measure twice, align once, execute without friction.',
    subtext: 'Quality control is everyone\u2019s responsibility.'
  },
  {
    tag: 'Creative Courage',
    mantra: 'Simplicity is the final achievement of deep understanding.',
    subtext: 'Strip away the non-essential.'
  },
  {
    tag: 'Agency Momentum',
    mantra: 'Small daily refinements compound into agency benchmarks.',
    subtext: 'Make today\u2019s ceiling tomorrow\u2019s baseline.'
  },
  {
    tag: 'Cross-Discipline',
    mantra: 'Strategy, craft, and traffic moving in unison create magic.',
    subtext: 'No discipline operates in isolation.'
  },
  {
    tag: 'Uncompromising Bar',
    mantra: 'If it carries our name, it carries our highest standard.',
    subtext: 'Never let fatigue compromise craft.'
  },
  {
    tag: 'Patience & Polish',
    mantra: 'The last five percent is where good work becomes indelible.',
    subtext: 'Give the finish the time it deserves.'
  },
  {
    tag: 'Proactive Resolve',
    mantra: 'Surface blockers early; solutions multiply when shared.',
    subtext: 'Transparency accelerates delivery.'
  },
  {
    tag: 'Intentionality',
    mantra: 'Every pixel, word, and frame must defend its right to exist.',
    subtext: 'Design with purpose, not decoration.'
  },
  {
    tag: 'Resilient Craft',
    mantra: 'Turbulent briefs are opportunities for defining leadership.',
    subtext: 'Turn ambiguity into structured progress.'
  },
  {
    tag: 'Team Fellowship',
    mantra: 'Individual brilliance shines brightest when lifting the squad.',
    subtext: 'Commend great work. Back each other up.'
  },
  {
    tag: 'Sustainable Pace',
    mantra: 'Sustainable intensity produces the most enduring work.',
    subtext: 'Protect your craft energy.'
  },
  {
    tag: 'Forward Horizon',
    mantra: 'Finish the day with tomorrow already organized.',
    subtext: 'A clean queue creates a clear mind.'
  },
  {
    tag: 'Refined Instincts',
    mantra: 'Intuition is pattern recognition earned through repetition.',
    subtext: 'Trust your calibrated taste.'
  },
  {
    tag: 'Impact Over Volume',
    mantra: 'One definitive asset outweighs a dozen rushed compromises.',
    subtext: 'Focus where value concentrates.'
  },
  {
    tag: 'Operational Mastery',
    mantra: 'Smooth operations are the invisible foundation of great art.',
    subtext: 'Honor the dispatch. Guard the deadline.'
  },
  {
    tag: 'Curiosity & Rigor',
    mantra: 'Keep the beginner\u2019s curiosity alive in master-tier work.',
    subtext: 'Stay open to unexpected elegance.'
  },
  {
    tag: 'Decisive Action',
    mantra: 'Momentum forgives minor flaws; hesitation compounds them.',
    subtext: 'Move from deliberation to production.'
  },
  {
    tag: 'The Long View',
    mantra: 'We are not just closing jobs; we are building our portfolio.',
    subtext: 'Every brief is a brick in the monument.'
  }
];

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Deterministic integer hash based on SplitMix32 / Mulberry32 principles.
 * Guarantees uniform distribution and stable pseudo-random indexing without external libraries.
 */
function hashDaySeed(seed: number, salt: number = 0): number {
  let h = (seed + salt * 0x9e3779b9) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Returns the integer count of 24h days since Unix epoch in the user's local timezone.
 */
function getLocalDayNumber(d: Date = new Date()): number {
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.floor(localMidnight / 86400000);
}

export const SidebarMotivationCard: React.FC = () => {
  const { theme, activePaletteId } = useApp();
  const isDark = theme === 'dark';
  const isPure = activePaletteId === 'pure' || !activePaletteId;

  // Visual accent color for colorful palettes (Signal, Cyan, Lime, Violet)
  // For Pure palette, we use pure white and high-contrast frosted capsules on atmospheric dark photographic cards
  const visualAccentColor = isPure ? '#FFFFFF' : 'var(--color-brand)';

  // Absolute day number since epoch (increments by 1 every calendar midnight)
  const [dayNumber, setDayNumber] = useState<number>(() => getLocalDayNumber());
  const [dayOfWeekName, setDayOfWeekName] = useState<string>(() => WEEKDAY_NAMES[new Date().getDay()]);

  // Live calendar rollover listener (checks every minute)
  useEffect(() => {
    const handleCheck = () => {
      const now = new Date();
      const currentDayNum = getLocalDayNumber(now);
      if (currentDayNum !== dayNumber) {
        setDayNumber(currentDayNum);
        setDayOfWeekName(WEEKDAY_NAMES[now.getDay()]);
      }
    };

    const intervalId = setInterval(handleCheck, 60000);
    return () => clearInterval(intervalId);
  }, [dayNumber]);

  // Date-Seeded Algorithmic Pairings:
  // Decouples images (10) from mantras (28) producing 280 unique non-repeating daily pairs
  const dailyVisual = useMemo(() => {
    const imgIndex = hashDaySeed(dayNumber, 7919) % VISUAL_ASSETS.length;
    return VISUAL_ASSETS[imgIndex];
  }, [dayNumber]);

  const dailyMantra = useMemo(() => {
    const mantraIndex = hashDaySeed(dayNumber, 65537) % CRAFT_MANTRAS.length;
    return CRAFT_MANTRAS[mantraIndex];
  }, [dayNumber]);

  return (
    <div className="pt-3 px-1">
      <div
        className="relative rounded-2xl overflow-hidden border flex flex-col justify-between p-3.5 group shadow-sm transition-colors duration-200"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          minHeight: '148px'
        }}
      >
        {/* Background Image: Deterministic date-seeded asset */}
        <img
          src={dailyVisual.src}
          alt={dailyVisual.alt}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-all duration-500 transform group-hover:scale-105"
        />

        {/* Adaptive Contrast Scrim: Guarantees deep rich contrast so photographic text is 100% legible */}
        <div
          className={`absolute inset-0 transition-opacity ${
            isDark
              ? 'bg-gradient-to-t from-black/95 via-black/80 to-black/50'
              : 'bg-gradient-to-t from-black/95 via-black/85 to-black/60'
          }`}
        />

        {/* Top Header Row: Zero pills, pure clean typography */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-white/90">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: visualAccentColor,
                boxShadow: isPure ? '0 0 8px rgba(255, 255, 255, 0.7)' : '0 0 8px var(--color-brand-muted)'
              }}
            />
            <span>Today · {dayOfWeekName}</span>
          </div>
        </div>

        {/* Bottom Content: Theme-Responsive Tag, Mantra & Accent Rule */}
        <div className="relative z-10 pt-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border transition-all ${
                isPure
                  ? 'bg-white/20 text-white border-white/40 shadow-xs'
                  : 'shadow-xs'
              }`}
              style={
                isPure
                  ? {
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.25)'
                    }
                  : {
                      color: visualAccentColor,
                      backgroundColor: 'color-mix(in srgb, var(--color-brand) 22%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-brand) 45%, transparent)'
                    }
              }
            >
              {dailyMantra.tag}
            </span>
          </div>

          <p className="text-xs font-bold text-white leading-snug select-none drop-shadow-sm">
            &ldquo;{dailyMantra.mantra}&rdquo;
          </p>

          <p className="text-[10px] text-white/85 leading-tight select-none drop-shadow-xs">
            {dailyMantra.subtext}
          </p>

          <div
            className="h-1 rounded-full mt-2 transition-all"
            style={{
              width: '32px',
              backgroundColor: visualAccentColor,
              boxShadow: isPure ? '0 0 10px rgba(255, 255, 255, 0.75)' : '0 0 10px var(--color-brand-muted)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
