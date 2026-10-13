/**
 * Chart Color & Visual Analytics Contrast Utilities
 * 
 * Provides calibrated complementary colors (opposite on the color wheel)
 * and architectural neutral/graphite alternatives to ensure high visual
 * discernibility in multi-series charts (e.g. Planned vs Actual hours,
 * Committed Workload vs Completed Output).
 */

interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): HSL {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s, l };
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToHex(h: number, s: number, l: number): string {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, (h / 360) + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, (h / 360) - 1 / 3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Returns calibrated opposite-on-the-color-wheel complementary color
 * or high-contrast architectural slate/graphite for the given palette & mode.
 */
export function getChartColorPair(
  paletteId: string,
  accentColor: string,
  isDark: boolean,
  colorMode: 'complementary' | 'graphite' = 'complementary'
): {
  actualColor: string; // The active theme brand color (represents actual execution)
  plannedColor: string; // The complementary opposite or crisp graphite (represents planned/committed)
  plannedLabel: string;
} {
  const actualColor = accentColor;

  if (colorMode === 'graphite') {
    return {
      actualColor,
      plannedColor: isDark ? '#94A3B8' : '#475569',
      plannedLabel: isDark ? 'Slate Graphite (High Contrast)' : 'Deep Charcoal (High Contrast)'
    };
  }

  // Pre-calibrated hand-tuned complementary harmonies for Tibule palettes
  switch (paletteId) {
    case 'signal':
      // Red/Crimson opposite is rich Cyan/Teal
      return {
        actualColor,
        plannedColor: isDark ? '#06B6D4' : '#0891B2',
        plannedLabel: 'Complementary Cyan (Opposite on Color Wheel)'
      };

    case 'lime':
      // Acid Lime opposite is Royal Violet / Purple
      return {
        actualColor,
        plannedColor: isDark ? '#A78BFA' : '#7C3AED',
        plannedLabel: 'Complementary Violet (Opposite on Color Wheel)'
      };

    case 'violet':
      // Violet opposite is Warm Amber / Golden Ochre
      return {
        actualColor,
        plannedColor: isDark ? '#FBBF24' : '#D97706',
        plannedLabel: 'Complementary Amber (Opposite on Color Wheel)'
      };

    case 'cyan':
      // Cyan opposite is Coral / Warm Tangerine
      return {
        actualColor,
        plannedColor: isDark ? '#FB923C' : '#EA580C',
        plannedLabel: 'Complementary Coral (Opposite on Color Wheel)'
      };

    case 'pure':
    default: {
      // For monochromatic pure or unknown palettes, compute dynamic HSL complementary
      const hsl = hexToHsl(accentColor);
      if (hsl.s < 0.15) {
        // Achromatic / grayscale theme: use architectural cobalt-slate
        return {
          actualColor,
          plannedColor: isDark ? '#38BDF8' : '#334155',
          plannedLabel: isDark ? 'Cool Sky Steel (Achromatic Contrast)' : 'Architectural Slate'
        };
      }
      // Rotate hue by 180 degrees
      const compHue = (hsl.h + 180) % 360;
      const compSaturation = Math.max(0.65, hsl.s);
      const compLightness = isDark ? 0.60 : 0.42;
      return {
        actualColor,
        plannedColor: hslToHex(compHue, compSaturation, compLightness),
        plannedLabel: 'Dynamic Complementary (+180°)'
      };
    }
  }
}

export interface OperationalLoadColors {
  conflicts: string;
  assignments: string;
  debriefs: string;
  brief_intake: string;
  production: string;
  review: string;
}

/**
 * Returns calibrated, distinctive colors for each Active Operational Load metric.
 * 
 * Addresses theme responsiveness across both dark and light modes while ensuring
 * every metric has a visually distinct hue. Crucially resolves the clash in the 'signal'
 * theme (where the brand is coral-crimson) by assigning 'conflicts' to high-visibility
 * Safety Warning Amber instead of crimson/red, eliminating the visual conflict and
 * establishing clear visual hierarchy.
 */
export function getActiveOperationalLoadColors(
  paletteId: string,
  isDark: boolean
): OperationalLoadColors {
  switch (paletteId) {
    case 'signal':
      // Signal theme brand is coral-crimson (#E11D48 / #FF355C).
      // 'conflicts' is calibrated to vivid Safety Warning Amber to prevent collision with the theme.
      // All other metrics are distributed cleanly across the color spectrum.
      return {
        conflicts: isDark ? '#FBBF24' : '#D97706',      // Safety Warning Amber / Gold (Distinct from Signal crimson)
        assignments: isDark ? '#22D3EE' : '#0891B2',    // Complementary Electric Cyan (Logistics & dispatch)
        debriefs: isDark ? '#A78BFA' : '#7C3AED',       // Royal Violet / Indigo (Debrief alignments)
        brief_intake: isDark ? '#34D399' : '#059669',   // Crisp Emerald Mint (Fresh brief triage)
        production: isDark ? '#60A5FA' : '#2563EB',     // Sapphire Cobalt Blue (Active deliverables in-flight)
        review: isDark ? '#F472B6' : '#C026D3',         // Vibrant Orchid Fuchsia (QA gates & sign-offs)
      };

    case 'lime':
      // Lime theme brand is acid kinetic lime (#65A30D / #9CFE02).
      return {
        conflicts: isDark ? '#EF4444' : '#DC2626',      // Urgent Crimson
        assignments: isDark ? '#A78BFA' : '#7C3AED',    // Complementary Royal Violet
        debriefs: isDark ? '#38BDF8' : '#0284C7',       // Sky Cerulean
        brief_intake: isDark ? '#FBBF24' : '#D97706',   // Warm Amber
        production: isDark ? '#84CC16' : '#4D7C0F',     // Acid Lime / Forest
        review: isDark ? '#E879F9' : '#C026D3',         // Radiant Fuchsia
      };

    case 'violet':
      // Violet theme brand is deep governance violet (#6D28D9 / #A78BFA).
      return {
        conflicts: isDark ? '#EF4444' : '#DC2626',      // Urgent Crimson
        assignments: isDark ? '#FBBF24' : '#D97706',    // Complementary Golden Amber
        debriefs: isDark ? '#A78BFA' : '#6D28D9',       // Deep Violet Accent
        brief_intake: isDark ? '#34D399' : '#059669',   // Emerald Green
        production: isDark ? '#22D3EE' : '#0891B2',     // Precision Cyan
        review: isDark ? '#60A5FA' : '#2563EB',         // Cobalt Blue
      };

    case 'cyan':
      // Cyan theme brand is precision cyan (#0891B2 / #03C1D6).
      return {
        conflicts: isDark ? '#EF4444' : '#DC2626',      // Urgent Crimson
        assignments: isDark ? '#FB923C' : '#EA580C',    // Complementary Warm Tangerine
        debriefs: isDark ? '#A78BFA' : '#7C3AED',       // Royal Violet
        brief_intake: isDark ? '#34D399' : '#059669',   // Emerald Green
        production: isDark ? '#06B6D4' : '#0891B2',     // Precision Cyan Accent
        review: isDark ? '#FBBF24' : '#D97706',         // Golden Amber
      };

    case 'pure':
    default:
      // Monochromatic neutral / editorial base (Zinc / Titanium).
      // Calibrated high-contrast executive jewel tones.
      return {
        conflicts: isDark ? '#EF4444' : '#DC2626',      // Urgent Crimson
        assignments: isDark ? '#38BDF8' : '#2563EB',    // Electric Cobalt Blue
        debriefs: isDark ? '#A78BFA' : '#7C3AED',       // Royal Violet
        brief_intake: isDark ? '#34D399' : '#059669',   // Emerald Green
        production: isDark ? '#FBBF24' : '#D97706',     // Golden Amber
        review: isDark ? '#2DD4BF' : '#0D9488',         // Precision Teal
      };
  }
}
