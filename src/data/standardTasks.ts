import { StandardTaskType, SeniorityLevel } from '../types';

export interface StandardTaskDefinition {
  type: StandardTaskType;
  category: string;
  description: string;
  deliverablesSummary: string[];
  benchmarks: Record<SeniorityLevel, number>; // hours
  complexityHint: 'low' | 'medium' | 'high' | 'extreme';
}

export const STANDARD_TASK_DEFINITIONS: Record<StandardTaskType, StandardTaskDefinition> = {
  'TVC': {
    type: 'TVC',
    category: 'Production',
    description: 'Television Commercial & Video Campaign. Concept storyboarding, animatic styling, visual scripts, voiceover direction, and post-production oversight.',
    deliverablesSummary: [
      'Treatment & Visual Script (30s / 15s cuts)',
      'High-fidelity Storyboard Frames & Key Art',
      'Animatic & Timing Pass',
      'Audio & Color Grade Signoff Kit'
    ],
    benchmarks: {
      nss_intern: 45,
      junior: 40,
      mid: 28,
      senior: 18,
      lead: 12,
      director: 8
    },
    complexityHint: 'extreme'
  },
  'Content Ideation': {
    type: 'Content Ideation',
    category: 'Strategy & Creative',
    description: 'Campaign proposition discovery, angle development, creative territory decks, and hook concepts.',
    deliverablesSummary: [
      '3 Strategic Creative Territories',
      'Headline & Tagline Mechanics',
      'Cultural Hook Rationale & Reference Decks'
    ],
    benchmarks: {
      nss_intern: 28,
      junior: 24,
      mid: 16,
      senior: 10,
      lead: 6,
      director: 4
    },
    complexityHint: 'medium'
  },
  'Logo Work': {
    type: 'Logo Work',
    category: 'Visual Identity',
    description: 'Brand mark exploration, vector geometry construction, monogram craft, clearspace lockups, and favicon kits.',
    deliverablesSummary: [
      'Initial Vector Concepts (3 routes)',
      'Refined Primary Mark & Secondary Lockups',
      'Vector Master Files (SVG, EPS, PNG)',
      'Clearspace & Minimum Sizing Rule Sheet'
    ],
    benchmarks: {
      nss_intern: 24,
      junior: 20,
      mid: 14,
      senior: 8,
      lead: 5,
      director: 4
    },
    complexityHint: 'high'
  },
  'Brand Identity': {
    type: 'Brand Identity',
    category: 'Brand Architecture',
    description: 'Holistic brand design system: design tokens, color palette contrast ratios, typography scale, photographic art direction, and style guide PDF.',
    deliverablesSummary: [
      'Design Token Specifications',
      'Color Palette & Contrast Matrices',
      'Typography Hierarchy Matrix',
      'Comprehensive Brand Guidelines Book'
    ],
    benchmarks: {
      nss_intern: 40,
      junior: 36,
      mid: 24,
      senior: 16,
      lead: 10,
      director: 6
    },
    complexityHint: 'extreme'
  },
  'Social Media Campaign': {
    type: 'Social Media Campaign',
    category: 'Digital & Content',
    description: 'Multi-platform social suite: feed hero assets, story motion clips, carousel storytelling, and localized templates.',
    deliverablesSummary: [
      'Feed Carousel Series (5-8 slides)',
      'Stories Motion Graphics (9:16 format)',
      'Static Display Retargeting Ad Suite',
      'Editable Figma/Canva Client Template Kit'
    ],
    benchmarks: {
      nss_intern: 20,
      junior: 18,
      mid: 12,
      senior: 8,
      lead: 5,
      director: 3
    },
    complexityHint: 'medium'
  },
  'OOH Billboard': {
    type: 'OOH Billboard',
    category: 'Print & Large Format',
    description: 'Out-Of-Home high impact billboards, transit wraps, digital bus shelter displays, and pre-press production artwork.',
    deliverablesSummary: [
      'High-resolution Master Artwork (48-sheet / Mega-site)',
      'Bus Shelter Digital Screen Animations',
      'Pre-press Color Calibration & Bleed Proofs'
    ],
    benchmarks: {
      nss_intern: 18,
      junior: 16,
      mid: 10,
      senior: 6,
      lead: 4,
      director: 3
    },
    complexityHint: 'high'
  },
  'Packaging Design': {
    type: 'Packaging Design',
    category: 'Industrial & Packaging',
    description: 'Physical packaging architecture, technical dieline layouts, foil/varnish finish specs, and 3D pack renders.',
    deliverablesSummary: [
      'CAD Dieline Artwork & Typography Layout',
      'Substrate & Special Finish Callout Legend',
      'High-res 3D CGI Pack Renders (E-comm ready)'
    ],
    benchmarks: {
      nss_intern: 32,
      junior: 28,
      mid: 18,
      senior: 12,
      lead: 8,
      director: 5
    },
    complexityHint: 'extreme'
  },
  'UI/UX Prototype': {
    type: 'UI/UX Prototype',
    category: 'Digital Product',
    description: 'Interactive component states, responsive layouts, micro-interaction motion specs, and developer handoff documentation.',
    deliverablesSummary: [
      'Interactive Figma Click-through Prototype',
      'Desktop & Mobile Breakpoint System',
      'Component Library & State Documentation'
    ],
    benchmarks: {
      nss_intern: 36,
      junior: 32,
      mid: 20,
      senior: 14,
      lead: 8,
      director: 5
    },
    complexityHint: 'extreme'
  },
  'Custom Deliverable': {
    type: 'Custom Deliverable',
    category: 'Custom Scope',
    description: 'Ad-hoc agency engagement with custom deliverable parameters defined between Client Service and Traffic.',
    deliverablesSummary: [
      'Tailored Deliverable Package per Brief'
    ],
    benchmarks: {
      nss_intern: 22,
      junior: 20,
      mid: 15,
      senior: 10,
      lead: 7,
      director: 5
    },
    complexityHint: 'medium'
  }
};

/**
 * Returns the benchmark hours prescribed for a given task type and staff seniority.
 */
export function getStandardTaskBenchmarkHours(
  taskType: StandardTaskType = 'Custom Deliverable',
  seniority: SeniorityLevel = 'mid'
): number {
  const task = STANDARD_TASK_DEFINITIONS[taskType] || STANDARD_TASK_DEFINITIONS['Custom Deliverable'];
  return task.benchmarks[seniority] ?? 16;
}

/**
 * Human-readable seniority display labels
 */
export const SENIORITY_LABELS: Record<SeniorityLevel, { label: string; badgeColor: string; description: string }> = {
  junior: {
    label: 'Junior',
    badgeColor: 'badge-seniority-junior',
    description: 'Developing practitioner. Requires foundational time allocation and structured reviews.'
  },
  mid: {
    label: 'Mid-Weight',
    badgeColor: 'badge-seniority-mid',
    description: 'Independent producer. Reliable execution at standard velocity benchmarks.'
  },
  senior: {
    label: 'Senior',
    badgeColor: 'badge-seniority-senior',
    description: 'Experienced master. High-velocity execution with minimal oversight.'
  },
  lead: {
    label: 'Lead / Principal',
    badgeColor: 'badge-seniority-lead',
    description: 'Strategic lead. Rapid conceptualization and cross-team direction.'
  },
  director: {
    label: 'Director',
    badgeColor: 'badge-seniority-director',
    description: 'Executive authority. High-leverage directional oversight.'
  },
  nss_intern: {
    label: 'NSS/Intern',
    badgeColor: 'badge-seniority-junior',
    description: 'National Service Scheme personnel / intern. Undergoing structured mentorship and skill building.'
  }
};
