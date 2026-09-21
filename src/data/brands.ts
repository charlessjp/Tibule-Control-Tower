import { Brand } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-mtn',
    name: 'MTN Ghana',
    clientCompany: 'MTN Group / Scancom PLC',
    industry: 'Telecommunications & Fintech (MoMo)',
    description: 'Yellow brand kingdom. High-tempo nationwide campaigns, MoMo cash promo kits, digital out-of-home, and youth culture engagements.',
    color: '#fbbf24', // Yellow
    clientServiceRepId: 'usr-michael-chen',
    managerId: 'usr-elena-rostova', // Executive Creative Director
    isCreativeJobDefault: true,
    assignedMemberIds: [
      'usr-sarah-jenkins', // Senior Art Director (Lead)
      'usr-amara-okafor',   // Mid Motion Designer
      'usr-priyah-sharma'   // Junior Packaging & Visual Designer
    ],
    activeBriefsCount: 4
  },
  {
    id: 'brand-guinness',
    name: 'Guinness Ghana',
    clientCompany: 'Guinness Ghana Breweries PLC (Diageo)',
    industry: 'Beverages, Culture & Nightlife',
    description: 'Black shines brightest. Premium liquid credentials, experiential festival activations, Accra nightlife digital campaigns, and social sizzles.',
    color: '#d97706', // Amber gold
    clientServiceRepId: 'usr-liam-oconnor',
    managerId: 'usr-elena-rostova',
    isCreativeJobDefault: true,
    assignedMemberIds: [
      'usr-sarah-jenkins',
      'usr-amara-okafor'
    ],
    activeBriefsCount: 2
  },
  {
    id: 'brand-stanbic',
    name: 'Stanbic Bank Ghana',
    clientCompany: 'Stanbic Bank / Standard Bank Group',
    industry: 'Banking, Wealth & Corporate Finance',
    description: 'Corporate credibility meets modern retail banking. Annual sustainability impact reports, SME campaigns, billboard suites, and app UX assets.',
    color: '#0284c7', // Stanbic Blue
    clientServiceRepId: 'usr-david-vance',
    managerId: 'usr-elena-rostova',
    isCreativeJobDefault: true,
    assignedMemberIds: [
      'usr-priyah-sharma',
      'usr-amara-okafor'
    ],
    activeBriefsCount: 3
  },
  {
    id: 'brand-fanmilk',
    name: 'FanMilk Ghana',
    clientCompany: 'FanMilk International / Danone',
    industry: 'FMCG, Dairy & Frozen Treats',
    description: 'Accra street delight and family staple. Packaging design overhauls, FanChoco/FanIce social blitz, school-season animations, and kiosk POS collateral.',
    color: '#ef4444', // Red / White
    clientServiceRepId: 'usr-noah-thorne',
    managerId: 'usr-elena-rostova',
    isCreativeJobDefault: true,
    assignedMemberIds: [
      'usr-priyah-sharma',
      'usr-sarah-jenkins'
    ],
    activeBriefsCount: 1
  },
  {
    id: 'brand-telecel',
    name: 'Telecel Ghana',
    clientCompany: 'Telecel Group Africa',
    industry: 'Broadband, Cloud & Enterprise Telecom',
    description: 'Challenger energy. High-speed broadband rollouts, red-hot data bundle creative, OOH landmark banners across Accra, Kumasi, and Takoradi.',
    color: '#dc2626', // Vibrant Red
    clientServiceRepId: 'usr-michael-chen',
    managerId: 'usr-elena-rostova',
    isCreativeJobDefault: true,
    assignedMemberIds: [
      'usr-amara-okafor',
      'usr-sarah-jenkins'
    ],
    activeBriefsCount: 2
  },
  {
    id: 'brand-kalahari',
    name: 'Kalahari Solar & ESG',
    clientCompany: 'Kalahari Green Energy Africa',
    industry: 'Renewable Energy & Climate Tech',
    description: 'Sustainability publications, investor pitch infographics, clean energy summit installations, and annual green audits.',
    color: '#10b981', // Emerald
    clientServiceRepId: 'usr-david-vance',
    managerId: 'usr-tariq-afriq', // Operations / Strategy Manager (non-creative lead)
    isCreativeJobDefault: false,
    assignedMemberIds: [
      'usr-sarah-jenkins',
      'usr-priyah-sharma'
    ],
    activeBriefsCount: 1
  }
];
