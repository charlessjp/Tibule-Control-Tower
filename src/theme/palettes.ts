export interface ThemeModeTokens {
  bgBase: string; // --background & --color-canvas
  bgSurface: string; // --surface & --color-surface
  bgSurfaceElevated: string; // --surface-elevated & --color-surface-elevated
  bgSurfaceMuted: string; // --surface-muted
  bgSurfaceHover: string; // --surface-hover
  border: string; // --border & --color-border
  borderSubtle: string; // --border-subtle & --color-border-subtle
  accentPrimary: string; // --accent & --color-brand
  accentSecondary: string; // --color-brand-hover
  accentContrast: string; // --accent-contrast & --color-brand-contrast
  textPrimary: string; // --text-primary & --color-text-primary
  textSecondary: string; // --text-secondary & --color-text-secondary
  textTertiary: string; // --text-muted & --color-text-tertiary
  glowPrimary: string; // --accent-soft & --color-brand-muted
  glowSecondary: string;
  semantic: {
    success: string; // --success
    warning: string; // --warning
    critical: string; // --critical
    info: string; // --info
    strategic: string; // --strategic
  };
  charts: [string, string, string, string, string]; // --chart-1 to --chart-5
}

export interface PaletteScheme {
  id: 'pure' | 'signal' | 'lime' | 'violet' | 'cyan' | string;
  name: string;
  tagline: string;
  philosophy: string;
  swatches: [string, string, string, string, string];
  dark: ThemeModeTokens;
  light: ThemeModeTokens;
}

export const PALETTES: PaletteScheme[] = [
  {
    id: 'pure',
    name: 'Pure',
    tagline: 'Apple × Linear Editorial Minimal',
    philosophy: 'Minimal, disciplined, editorial software. Monochromatic architecture with quiet confidence, titanium neutrals, and restrained emphasis.',
    swatches: ['#F4F4F5', '#A1A1AA', '#71717A', '#3F3F46', '#18181B'],
    light: {
      bgBase: '#FFFFFF',
      bgSurface: '#F8F9FA',
      bgSurfaceElevated: '#F1F3F5',
      bgSurfaceMuted: '#F4F5F7',
      bgSurfaceHover: '#E9ECEF',
      border: '#E2E4E8',
      borderSubtle: '#ECEEF1',
      accentPrimary: '#18181B',
      accentSecondary: '#27272A',
      accentContrast: '#FFFFFF',
      textPrimary: '#09090B',
      textSecondary: '#64748B',
      textTertiary: '#94A3B8',
      glowPrimary: 'rgba(24, 24, 27, 0.08)',
      glowSecondary: 'rgba(100, 116, 139, 0.06)',
      semantic: {
        success: '#16A34A',
        warning: '#D97706',
        critical: '#DC2626',
        info: '#475569',
        strategic: '#334155'
      },
      charts: ['#2563EB', '#7C3AED', '#059669', '#D97706', '#0D9488']
    },
    dark: {
      bgBase: '#09090B',
      bgSurface: '#121215',
      bgSurfaceElevated: '#18181C',
      bgSurfaceMuted: '#0E0E12',
      bgSurfaceHover: '#222228',
      border: '#24242A',
      borderSubtle: '#2E2E36',
      accentPrimary: '#F4F4F5',
      accentSecondary: '#E4E4E7',
      accentContrast: '#09090B',
      textPrimary: '#F4F4F5',
      textSecondary: '#A1A1AA',
      textTertiary: '#71717A',
      glowPrimary: 'rgba(244, 244, 245, 0.15)',
      glowSecondary: 'rgba(161, 161, 170, 0.10)',
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        info: '#94A3B8',
        strategic: '#CBD5E1'
      },
      charts: ['#38BDF8', '#A78BFA', '#34D399', '#FBBF24', '#2DD4BF']
    }
  },
  {
    id: 'signal',
    name: 'Signal',
    tagline: 'High-Energy Operational Intervention',
    philosophy: 'Dominant Coral-Crimson. Live traffic, operational urgency, rapid triage, and intervention metrics calibrated into a harmonious crimson-slate spectrum.',
    swatches: ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FFE4E6'],
    light: {
      bgBase: '#FFFBFB',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#FFF5F6',
      bgSurfaceMuted: '#FFEBEF',
      bgSurfaceHover: '#FFE2E8',
      border: '#FCD8E0',
      borderSubtle: '#F7C0CD',
      accentPrimary: '#E11D48',
      accentSecondary: '#BE123C',
      accentContrast: '#FFFFFF',
      textPrimary: '#1E1215',
      textSecondary: '#5E444B',
      textTertiary: '#8E7078',
      glowPrimary: 'rgba(225, 29, 72, 0.16)',
      glowSecondary: 'rgba(244, 63, 94, 0.10)',
      semantic: {
        success: '#16A34A',
        warning: '#D97706',
        critical: '#E11D48',
        info: '#475569',
        strategic: '#881337'
      },
      charts: ['#0891B2', '#7C3AED', '#059669', '#2563EB', '#C026D3']
    },
    dark: {
      bgBase: '#0F090B',
      bgSurface: '#160E12',
      bgSurfaceElevated: '#201419',
      bgSurfaceMuted: '#120B0F',
      bgSurfaceHover: '#2A1B22',
      border: '#331B24',
      borderSubtle: '#482533',
      accentPrimary: '#FF355C',
      accentSecondary: '#E01E43',
      accentContrast: '#FFFFFF',
      textPrimary: '#FFF0F3',
      textSecondary: '#B89CA4',
      textTertiary: '#856872',
      glowPrimary: 'rgba(255, 53, 92, 0.28)',
      glowSecondary: 'rgba(251, 113, 133, 0.16)',
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#FF355C',
        info: '#FDA4AF',
        strategic: '#F43F5E'
      },
      charts: ['#22D3EE', '#A78BFA', '#34D399', '#60A5FA', '#F472B6']
    }
  },
  {
    id: 'lime',
    name: 'Lime',
    tagline: 'Creative Velocity & Kinetic Focus',
    philosophy: 'Dominant Acid Spring Lime. Energetic, modern, and tailored for creative velocity, paired with grounding forest-slate neutrals.',
    swatches: ['#84CC16', '#A3E635', '#BEF264', '#65A30D', '#3F6212'],
    light: {
      bgBase: '#FAFCF6',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#F2F8E8',
      bgSurfaceMuted: '#E8F3DA',
      bgSurfaceHover: '#DDEECB',
      border: '#DFEBD2',
      borderSubtle: '#C6DBB2',
      accentPrimary: '#65A30D',
      accentSecondary: '#4D7C0F',
      accentContrast: '#FFFFFF',
      textPrimary: '#111510',
      textSecondary: '#455240',
      textTertiary: '#73836D',
      glowPrimary: 'rgba(101, 163, 13, 0.18)',
      glowSecondary: 'rgba(132, 204, 22, 0.12)',
      semantic: {
        success: '#16A34A',
        warning: '#D97706',
        critical: '#DC2626',
        info: '#475569',
        strategic: '#3F6212'
      },
      charts: ['#7C3AED', '#0284C7', '#D97706', '#4D7C0F', '#C026D3']
    },
    dark: {
      bgBase: '#090D08',
      bgSurface: '#101610',
      bgSurfaceElevated: '#171D15',
      bgSurfaceMuted: '#0C120B',
      bgSurfaceHover: '#20291D',
      border: '#202D1E',
      borderSubtle: '#2F3F2C',
      accentPrimary: '#9CFE02',
      accentSecondary: '#84DC00',
      accentContrast: '#071501',
      textPrimary: '#F6FEF2',
      textSecondary: '#A5BE9E',
      textTertiary: '#6C8566',
      glowPrimary: 'rgba(156, 254, 2, 0.28)',
      glowSecondary: 'rgba(132, 204, 22, 0.16)',
      semantic: {
        success: '#9CFE02',
        warning: '#F59E0B',
        critical: '#EF4444',
        info: '#A3E635',
        strategic: '#4D7C0F'
      },
      charts: ['#A78BFA', '#38BDF8', '#FBBF24', '#84CC16', '#E879F9']
    }
  },
  {
    id: 'violet',
    name: 'Violet',
    tagline: 'Boardroom Intelligence & Strategic Governance',
    philosophy: 'Dominant Deep Violet & Indigo. Executive, analytical, and sophisticated governance with a cohesive plum and indigo hierarchy.',
    swatches: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#4C1D95'],
    light: {
      bgBase: '#FAF8FC',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#F3EFF6',
      bgSurfaceMuted: '#ECE5F1',
      bgSurfaceHover: '#E4DAEC',
      border: '#E8DFEE',
      borderSubtle: '#D5C4E0',
      accentPrimary: '#6D28D9',
      accentSecondary: '#5B21B6',
      accentContrast: '#FFFFFF',
      textPrimary: '#190F24',
      textSecondary: '#534063',
      textTertiary: '#826D94',
      glowPrimary: 'rgba(109, 40, 217, 0.18)',
      glowSecondary: 'rgba(124, 58, 237, 0.12)',
      semantic: {
        success: '#16A34A',
        warning: '#D97706',
        critical: '#DC2626',
        info: '#475569',
        strategic: '#6D28D9'
      },
      charts: ['#D97706', '#6D28D9', '#059669', '#0891B2', '#2563EB']
    },
    dark: {
      bgBase: '#0D0910',
      bgSurface: '#151018',
      bgSurfaceElevated: '#1D1621',
      bgSurfaceMuted: '#100B14',
      bgSurfaceHover: '#281E2E',
      border: '#302038',
      borderSubtle: '#452E52',
      accentPrimary: '#A78BFA',
      accentSecondary: '#8B5CF6',
      accentContrast: '#0D0910',
      textPrimary: '#F9F4FC',
      textSecondary: '#B49FBF',
      textTertiary: '#7E698A',
      glowPrimary: 'rgba(167, 139, 250, 0.28)',
      glowSecondary: 'rgba(124, 58, 237, 0.18)',
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        info: '#C4B5FD',
        strategic: '#8B5CF6'
      },
      charts: ['#FBBF24', '#A78BFA', '#34D399', '#22D3EE', '#60A5FA']
    }
  },
  {
    id: 'cyan',
    name: 'Cyan',
    tagline: 'Control Tower & Live Operational Clarity',
    philosophy: 'Dominant Precision Cyan. Information flow, systems clarity, live telemetry, and dispatch velocity across ocean-steel tones.',
    swatches: ['#0891B2', '#06B6D4', '#22D3EE', '#67E8F9', '#155E75'],
    light: {
      bgBase: '#F6FCFD',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#EDF8FA',
      bgSurfaceMuted: '#E2F4F7',
      bgSurfaceHover: '#D4EFF3',
      border: '#CFECF1',
      borderSubtle: '#B0DFE7',
      accentPrimary: '#0891B2',
      accentSecondary: '#0E7490',
      accentContrast: '#FFFFFF',
      textPrimary: '#0D1719',
      textSecondary: '#354C52',
      textTertiary: '#627D85',
      glowPrimary: 'rgba(8, 145, 178, 0.18)',
      glowSecondary: 'rgba(6, 182, 212, 0.12)',
      semantic: {
        success: '#16A34A',
        warning: '#D97706',
        critical: '#DC2626',
        info: '#0891B2',
        strategic: '#155E75'
      },
      charts: ['#EA580C', '#7C3AED', '#059669', '#0891B2', '#D97706']
    },
    dark: {
      bgBase: '#071013',
      bgSurface: '#0D181B',
      bgSurfaceElevated: '#122125',
      bgSurfaceMuted: '#091316',
      bgSurfaceHover: '#192E34',
      border: '#17323C',
      borderSubtle: '#224855',
      accentPrimary: '#03C1D6',
      accentSecondary: '#02A5B8',
      accentContrast: '#041C22',
      textPrimary: '#F0FBFC',
      textSecondary: '#8DB1BC',
      textTertiary: '#567A85',
      glowPrimary: 'rgba(3, 193, 214, 0.30)',
      glowSecondary: 'rgba(6, 182, 212, 0.18)',
      semantic: {
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        info: '#03C1D6',
        strategic: '#0891B2'
      },
      charts: ['#FB923C', '#A78BFA', '#34D399', '#06B6D4', '#FBBF24']
    }
  }
];

export const DEFAULT_PALETTE_ID = 'pure';
