import React, { useState, useEffect, useMemo } from 'react';
import { AGENCY_250_MANTRAS, AgencyMantraCombination } from '../../data/agencyDailyMantras';

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

const VISUAL_ASSETS: { id: string; src: string; alt: string }[] = [
  { id: 'forest', src: sidebarForestImg, alt: 'Tranquil canopy' },
  { id: 'geometric', src: sidebarGeometricImg, alt: 'Brutalist architecture in morning light' },
  { id: 'ocean', src: sidebarOceanImg, alt: 'Ocean horizon at dawn' },
  { id: 'sunrise', src: sidebarSunriseImg, alt: 'Sunrise over water' },
  { id: 'mountain', src: sidebarMountainImg, alt: 'Atmospheric mountain ridges' },
  { id: 'control_tower', src: controlTowerBannerImg, alt: 'Agency operations control hub' },
  { id: 'dune', src: sidebarDuneImg, alt: 'Golden sand dunes' },
  { id: 'bridge', src: sidebarBridgeImg, alt: 'Suspension bridge in quiet morning fog' },
  { id: 'skylight', src: sidebarSkylightImg, alt: 'Glass skylight into twilight sky' },
  { id: 'zen_water', src: sidebarZenWaterImg, alt: 'Slate pool with serene water ripple' }
];

/**
 * Calculate the integer day index since Unix epoch in user's local timezone.
 */
function getLocalDayIndex(d: Date = new Date()): number {
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.floor(localMidnight / 86400000);
}

/**
 * Compute the active 2-hour slot (0 to 3) for the 8-hour workday based on current local hour.
 * Slot 0: 09:00 - 11:00 (Intake, Kickoff & Morning Alignment)
 * Slot 1: 11:00 - 13:00 (Midday Craft & Deep Flow)
 * Slot 2: 13:00 - 15:00 (Afternoon Execution & Cross-Team Cadence)
 * Slot 3: 15:00 - 17:00 (Closing Strong & Daily Delivery)
 */
function getActiveWorkdaySlotIndex(d: Date = new Date()): number {
  const hour = d.getHours();
  if (hour < 11) return 0;       // < 11:00 AM
  if (hour < 13) return 1;       // 11:00 AM – 12:59 PM
  if (hour < 15) return 2;       // 01:00 PM – 02:59 PM
  return 3;                      // 03:00 PM – 05:00 PM (and evening wrap-up)
}

export const SidebarMotivationCard: React.FC = () => {
  // Day number since epoch for deterministic daily selection
  const [dayIndex, setDayIndex] = useState<number>(() => getLocalDayIndex());

  // Current active 2-hour slot index (0 to 3) across the 8-hour workday
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(() => getActiveWorkdaySlotIndex());

  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Live clock listener: checks every 20 seconds to naturally transition across 2-hour boundaries & calendar days
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const newDayIndex = getLocalDayIndex(now);
      const newSlotIndex = getActiveWorkdaySlotIndex(now);

      if (newDayIndex !== dayIndex) {
        setDayIndex(newDayIndex);
      }

      if (newSlotIndex !== currentSlotIndex) {
        setIsTransitioning(true);
        setCurrentSlotIndex(newSlotIndex);
        setTimeout(() => setIsTransitioning(false), 600);
      }
    };

    const intervalId = setInterval(checkSchedule, 20000);
    return () => clearInterval(intervalId);
  }, [dayIndex, currentSlotIndex]);

  // 4 Daily Mantras selected deterministically from the 250 library for today
  const dailyMantras = useMemo<AgencyMantraCombination[]>(() => {
    const total = AGENCY_250_MANTRAS.length;
    const baseOffset = (dayIndex * 4) % total;
    return [
      AGENCY_250_MANTRAS[(baseOffset + 0) % total],
      AGENCY_250_MANTRAS[(baseOffset + 1) % total],
      AGENCY_250_MANTRAS[(baseOffset + 2) % total],
      AGENCY_250_MANTRAS[(baseOffset + 3) % total]
    ];
  }, [dayIndex]);

  // Active item dynamically resolved from the current 2-hour slot
  const activeItem = dailyMantras[currentSlotIndex] || dailyMantras[0];
  const activeVisual = VISUAL_ASSETS[activeItem.imageIndex % VISUAL_ASSETS.length] || VISUAL_ASSETS[0];

  return (
    <div className="pt-2 px-1">
      <div
        className="group relative rounded-xl overflow-hidden border border-border/70 transition-all duration-300 shadow-sm select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cinematic Photographic Canvas without any bottom scroller or clutter */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
          <img
            key={`${activeVisual.id}-${activeItem.id}`}
            src={activeVisual.src}
            alt={activeVisual.alt}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'scale-105 brightness-105' : 'scale-100'
            } ${isTransitioning ? 'opacity-60 scale-98' : 'opacity-100'}`}
          />

          {/* Clean, Non-distracting Cinematic Gradient for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 pointer-events-none" />

          {/* Clean Quote Display - naturally presented with zero buttons or scrollers */}
          <div className="absolute inset-x-3.5 bottom-3.5 flex flex-col justify-end pointer-events-none">
            <p className="text-[12px] text-white/95 font-medium leading-snug drop-shadow-md select-none tracking-normal">
              &ldquo;{activeItem.message}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
