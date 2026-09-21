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
    philosophy: 'Minimal, premium, editorial software. Neutral foundation with quiet confidence and restrained emphasis.',
    swatches: ['#03C1D6', '#FF355C', '#9CFE02', '#FDDE03', '#512D6E'],
    light: {
      bgBase: '#FFFFFF',
      bgSurface: '#F7F7F8',
      bgSurfaceElevated: '#EFEFF1',
      bgSurfaceMuted: '#F3F3F5',
      bgSurfaceHover: '#E9E9ED',
      border: '#E2E2E7',
      borderSubtle: '#D3D3DB',
      accentPrimary: '#0298A8',
      accentSecondary: '#017C8A',
      accentContrast: '#FFFFFF',
      textPrimary: '#171719',
      textSecondary: '#575761',
      textTertiary: '#858591',
      glowPrimary: 'rgba(3, 193, 214, 0.22)',
      glowSecondary: 'rgba(255, 53, 92, 0.12)',
      semantic: {
        success: '#62A800',
        warning: '#B89900',
        critical: '#FF355C',
        info: '#0298A8',
        strategic: '#512D6E'
      },
      charts: ['#0298A8', '#62A800', '#512D6E', '#B89900', '#FF355C']
    },
    dark: {
      bgBase: '#09090B',
      bgSurface: '#111114',
      bgSurfaceElevated: '#18181C',
      bgSurfaceMuted: '#0E0E12',
      bgSurfaceHover: '#202026',
      border: '#222227',
      borderSubtle: '#2E2E35',
      accentPrimary: '#03C1D6',
      accentSecondary: '#029CB0',
      accentContrast: '#041C22',
      textPrimary: '#F5F5F5',
      textSecondary: '#9E9EA7',
      textTertiary: '#6C6C75',
      glowPrimary: 'rgba(3, 193, 214, 0.35)',
      glowSecondary: 'rgba(255, 53, 92, 0.18)',
      semantic: {
        success: '#9CFE02',
        warning: '#FDDE03',
        critical: '#FF355C',
        info: '#03C1D6',
        strategic: '#8E5CB8'
      },
      charts: ['#03C1D6', '#9CFE02', '#8E5CB8', '#FDDE03', '#FF355C']
    }
  },
  {
    id: 'signal',
    name: 'Signal',
    tagline: 'High-Energy Operational Intervention',
    philosophy: 'Dominant Coral (#FF355C). Live traffic, operational urgency, rapid triage, and intervention metrics.',
    swatches: ['#FF355C', '#03C1D6', '#9CFE02', '#FDDE03', '#512D6E'],
    light: {
      bgBase: '#FFF9FA',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#FFF1F4',
      bgSurfaceMuted: '#FFE8EC',
      bgSurfaceHover: '#FFE0E6',
      border: '#FCD9E0',
      borderSubtle: '#F7B5C3',
      accentPrimary: '#FF355C',
      accentSecondary: '#E01E43',
      accentContrast: '#FFFFFF',
      textPrimary: '#161216',
      textSecondary: '#58444B',
      textTertiary: '#896F78',
      glowPrimary: 'rgba(255, 53, 92, 0.30)',
      glowSecondary: 'rgba(3, 193, 214, 0.16)',
      semantic: {
        success: '#62A800',
        warning: '#B89900',
        critical: '#FF355C',
        info: '#0298A8',
        strategic: '#512D6E'
      },
      charts: ['#FF355C', '#0298A8', '#62A800', '#B89900', '#512D6E']
    },
    dark: {
      bgBase: '#100A0D',
      bgSurface: '#181014',
      bgSurfaceElevated: '#21151A',
      bgSurfaceMuted: '#140D10',
      bgSurfaceHover: '#2B1B22',
      border: '#361D26',
      borderSubtle: '#4E2A36',
      accentPrimary: '#FF355C',
      accentSecondary: '#E01E43',
      accentContrast: '#FFFFFF',
      textPrimary: '#FFF0F3',
      textSecondary: '#B89CA4',
      textTertiary: '#856872',
      glowPrimary: 'rgba(255, 53, 92, 0.45)',
      glowSecondary: 'rgba(3, 193, 214, 0.22)',
      semantic: {
        success: '#9CFE02',
        warning: '#FDDE03',
        critical: '#FF355C',
        info: '#03C1D6',
        strategic: '#8E5CB8'
      },
      charts: ['#FF355C', '#03C1D6', '#9CFE02', '#FDDE03', '#8E5CB8']
    }
  },
  {
    id: 'lime',
    name: 'Lime',
    tagline: 'Creative Velocity & Optimistic Momentum',
    philosophy: 'Dominant Acid Lime (#9CFE02). Energetic, modern, experimental, and tailored for creative velocity.',
    swatches: ['#9CFE02', '#10E7B2', '#FF355C', '#FDDE03', '#44E575'],
    light: {
      bgBase: '#FAFCF6',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#F2F8E8',
      bgSurfaceMuted: '#E8F3DA',
      bgSurfaceHover: '#DDEECB',
      border: '#DFEBD2',
      borderSubtle: '#C6DBB2',
      accentPrimary: '#72C800',
      accentSecondary: '#5DA300',
      accentContrast: '#FFFFFF',
      textPrimary: '#111510',
      textSecondary: '#455240',
      textTertiary: '#73836D',
      glowPrimary: 'rgba(114, 200, 0, 0.32)',
      glowSecondary: 'rgba(5, 150, 105, 0.18)',
      semantic: {
        success: '#62A800',
        warning: '#B89900',
        critical: '#FF355C',
        info: '#059669',
        strategic: '#2D5A27'
      },
      charts: ['#72C800', '#059669', '#FF355C', '#B89900', '#2D5A27']
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
      glowPrimary: 'rgba(156, 254, 2, 0.45)',
      glowSecondary: 'rgba(16, 231, 178, 0.20)',
      semantic: {
        success: '#9CFE02',
        warning: '#FDDE03',
        critical: '#FF355C',
        info: '#10E7B2',
        strategic: '#44E575'
      },
      charts: ['#9CFE02', '#10E7B2', '#FF355C', '#FDDE03', '#44E575']
    }
  },
  {
    id: 'violet',
    name: 'Violet',
    tagline: 'Boardroom Intelligence & Strategic Authority',
    philosophy: 'Dominant Deep Violet (#512D6E). Executive, analytical, sophisticated governance and progression intelligence.',
    swatches: ['#512D6E', '#03C1D6', '#9CFE02', '#FDDE03', '#FF355C'],
    light: {
      bgBase: '#FAF8FC',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#F3EFF6',
      bgSurfaceMuted: '#ECE5F1',
      bgSurfaceHover: '#E4DAEC',
      border: '#E8DFEE',
      borderSubtle: '#D5C4E0',
      accentPrimary: '#512D6E',
      accentSecondary: '#3B1F51',
      accentContrast: '#FFFFFF',
      textPrimary: '#190F24',
      textSecondary: '#534063',
      textTertiary: '#826D94',
      glowPrimary: 'rgba(81, 45, 110, 0.28)',
      glowSecondary: 'rgba(3, 193, 214, 0.16)',
      semantic: {
        success: '#62A800',
        warning: '#B89900',
        critical: '#FF355C',
        info: '#0298A8',
        strategic: '#512D6E'
      },
      charts: ['#512D6E', '#0298A8', '#62A800', '#B89900', '#FF355C']
    },
    dark: {
      bgBase: '#0D0910',
      bgSurface: '#151018',
      bgSurfaceElevated: '#1D1621',
      bgSurfaceMuted: '#100B14',
      bgSurfaceHover: '#281E2E',
      border: '#302038',
      borderSubtle: '#452E52',
      accentPrimary: '#9E67C9',
      accentSecondary: '#874FBA',
      accentContrast: '#FFFFFF',
      textPrimary: '#F9F4FC',
      textSecondary: '#B49FBF',
      textTertiary: '#7E698A',
      glowPrimary: 'rgba(158, 103, 201, 0.38)',
      glowSecondary: 'rgba(81, 45, 110, 0.25)',
      semantic: {
        success: '#9CFE02',
        warning: '#FDDE03',
        critical: '#FF355C',
        info: '#03C1D6',
        strategic: '#9E67C9'
      },
      charts: ['#9E67C9', '#03C1D6', '#9CFE02', '#FDDE03', '#FF355C']
    }
  },
  {
    id: 'cyan',
    name: 'Cyan',
    tagline: 'Control Tower & Live Operational Control',
    philosophy: 'Dominant Cyan (#03C1D6). Information flow, systems clarity, queues, capacity, and live operational metrics.',
    swatches: ['#03C1D6', '#9CFE02', '#FF355C', '#512D6E', '#FDDE03'],
    light: {
      bgBase: '#F6FCFD',
      bgSurface: '#FFFFFF',
      bgSurfaceElevated: '#EDF8FA',
      bgSurfaceMuted: '#E2F4F7',
      bgSurfaceHover: '#D4EFF3',
      border: '#CFECF1',
      borderSubtle: '#B0DFE7',
      accentPrimary: '#0298A8',
      accentSecondary: '#017B88',
      accentContrast: '#041C22',
      textPrimary: '#0D1719',
      textSecondary: '#354C52',
      textTertiary: '#627D85',
      glowPrimary: 'rgba(3, 193, 214, 0.30)',
      glowSecondary: 'rgba(255, 53, 92, 0.16)',
      semantic: {
        success: '#62A800',
        warning: '#B89900',
        critical: '#FF355C',
        info: '#0298A8',
        strategic: '#512D6E'
      },
      charts: ['#0298A8', '#62A800', '#FF355C', '#512D6E', '#B89900']
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
      glowPrimary: 'rgba(3, 193, 214, 0.42)',
      glowSecondary: 'rgba(255, 53, 92, 0.22)',
      semantic: {
        success: '#9CFE02',
        warning: '#FDDE03',
        critical: '#FF355C',
        info: '#03C1D6',
        strategic: '#8E5CB8'
      },
      charts: ['#03C1D6', '#9CFE02', '#FF355C', '#8E5CB8', '#FDDE03']
    }
  }
];

export const DEFAULT_PALETTE_ID = 'pure';

