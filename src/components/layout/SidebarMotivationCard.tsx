import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

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
  name: string;
  src: string;
  alt: string;
}

const VISUAL_ASSETS: VisualAsset[] = [
  { id: 'forest', name: 'Misty Canopy', src: sidebarForestImg, alt: 'Misty tranquil forest canopy' },
  { id: 'geometric', name: 'Brutalist Light', src: sidebarGeometricImg, alt: 'Minimalist brutalist architecture in morning light' },
  { id: 'ocean', name: 'Dawn Horizon', src: sidebarOceanImg, alt: 'Serene ocean horizon at dawn' },
  { id: 'sunrise', name: 'Golden Inlet', src: sidebarSunriseImg, alt: 'Architectural sunrise over calm water' },
  { id: 'mountain', name: 'Ridge Silhouettes', src: sidebarMountainImg, alt: 'Atmospheric mountain ridges' },
  { id: 'control_tower', name: 'Control Tower', src: controlTowerBannerImg, alt: 'Agency operations control hub' },
  { id: 'dune', name: 'Golden Dunes', src: sidebarDuneImg, alt: 'Minimalist golden sand dune curves' },
  { id: 'bridge', name: 'Morning Span', src: sidebarBridgeImg, alt: 'Architectural suspension bridge in quiet morning fog' },
  { id: 'skylight', name: 'Twilight Oculus', src: sidebarSkylightImg, alt: 'Minimalist glass skylight into twilight sky' },
  { id: 'zen_water', name: 'Slate Ripple', src: sidebarZenWaterImg, alt: 'Dark slate pool with serene water ripple' }
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
    mantra: 'Good work builds what’s next. Close strong and seal the record.',
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
    subtext: 'Quality control is everyone’s responsibility.'
  },
  {
    tag: 'Creative Courage',
    mantra: 'Simplicity is the final achievement of deep understanding.',
    subtext: 'Strip away the non-essential.'
  },
  {
    tag: 'Agency Momentum',
    mantra: 'Small daily refinements compound into agency benchmarks.',
    subtext: 'Make today’s ceiling tomorrow’s baseline.'
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
    mantra: 'Keep the beginner’s curiosity alive in master-tier work.',
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
  const visualAccentColor = isPure ? '#FFFFFF' : 'var(--color-brand)';

  // Absolute day number since epoch (increments by 1 every calendar midnight)
  const [dayNumber, setDayNumber] = useState<number>(() => getLocalDayNumber());
  const [dayOfWeekName, setDayOfWeekName] = useState<string>(() => WEEKDAY_NAMES[new Date().getDay()]);

  // User manual offset to cycle or change images on click
  const [manualOffset, setManualOffset] = useState<number>(() => {
    const saved = localStorage.getItem('tibule_sidebar_card_offset');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isCycling, setIsCycling] = useState(false);

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

  // Compute active image index and mantra index with manual offset
  const baseImgIndex = useMemo(() => {
    return hashDaySeed(dayNumber, 7919) % VISUAL_ASSETS.length;
  }, [dayNumber]);

  const activeVisualIndex = (baseImgIndex + manualOffset + VISUAL_ASSETS.length * 100) % VISUAL_ASSETS.length;
  const currentVisual = VISUAL_ASSETS[activeVisualIndex];

  const baseMantraIndex = useMemo(() => {
    return hashDaySeed(dayNumber, 65537) % CRAFT_MANTRAS.length;
  }, [dayNumber]);

  const activeMantraIndex = (baseMantraIndex + manualOffset + CRAFT_MANTRAS.length * 100) % CRAFT_MANTRAS.length;
  const currentMantra = CRAFT_MANTRAS[activeMantraIndex];

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCycling(true);
    setManualOffset((prev) => {
      const next = prev + 1;
      localStorage.setItem('tibule_sidebar_card_offset', String(next));
      return next;
    });
    setTimeout(() => setIsCycling(false), 300);
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCycling(true);
    setManualOffset((prev) => {
      const next = prev - 1;
      localStorage.setItem('tibule_sidebar_card_offset', String(next));
      return next;
    });
    setTimeout(() => setIsCycling(false), 300);
  }, []);

  return (
    <div className="pt-2 px-1">
      <div
        className="group relative rounded-xl overflow-hidden border border-border transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleNext()}
        title="Click to cycle focus image & mantra"
      >
        {/* Background Image Container with Smooth Crossfade Zoom */}
        <div className="relative h-44 w-full overflow-hidden bg-surface-elevated">
          <img
            key={currentVisual.id}
            src={currentVisual.src}
            alt={currentVisual.alt}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'scale-108 brightness-105' : 'scale-100'
            } ${isCycling ? 'opacity-70 scale-95' : 'opacity-100'}`}
          />

          {/* Deep Cinematic Gradients for Flawless Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Top Floating Glass Capsule Bar */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium backdrop-blur-md bg-black/50 border border-white/15 text-white/90 shadow-xs"
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: visualAccentColor }}
              />
              {currentMantra.tag}
            </span>

            {/* Quick Interactive Cycle Controls */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-full backdrop-blur-md bg-black/45 hover:bg-black/70 border border-white/15 text-white/80 hover:text-white transition-colors"
                title="Previous visual"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`p-1 rounded-full backdrop-blur-md bg-black/45 hover:bg-black/70 border border-white/15 text-white/80 hover:text-white transition-all ${
                  isCycling ? 'rotate-180' : ''
                }`}
                title="Next visual (or click card)"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom Mantra & Subtext Content */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex flex-col justify-end pointer-events-none">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                {currentVisual.name}
              </span>
              <span>
                {dayOfWeekName} &bull; {activeVisualIndex + 1}/{VISUAL_ASSETS.length}
              </span>
            </div>

            <p className="text-xs text-white font-medium leading-snug drop-shadow-md line-clamp-3 italic">
              &ldquo;{currentMantra.mantra}&rdquo;
            </p>

            <p className="text-[10px] text-white/70 mt-1 leading-tight drop-shadow-xs">
              {currentMantra.subtext}
            </p>
          </div>
        </div>

        {/* Visual Progress Dots Bar */}
        <div className="px-2.5 py-1.5 bg-surface-elevated/90 backdrop-blur-xs flex items-center justify-between border-t border-border/50 text-[9px] text-text-tertiary font-mono">
          <div className="flex items-center gap-1">
            {VISUAL_ASSETS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setManualOffset(idx - baseImgIndex);
                  localStorage.setItem('tibule_sidebar_card_offset', String(idx - baseImgIndex));
                }}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === activeVisualIndex
                    ? 'w-4 bg-primary'
                    : 'w-1 bg-border hover:bg-text-tertiary'
                }`}
                title={`Switch to visual ${idx + 1}: ${VISUAL_ASSETS[idx].name}`}
              />
            ))}
          </div>

          <span className="text-[8px] text-text-tertiary tracking-wider uppercase opacity-75">
            Click to change
          </span>
        </div>
      </div>
    </div>
  );
};
