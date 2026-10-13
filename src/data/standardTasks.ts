import { StandardTaskType, SeniorityLevel } from '../types';

export interface StandardTaskDefinition {
  type: StandardTaskType;
  category: string;
  description: string;
  benchmarks: Partial<Record<SeniorityLevel, number>>; // hours
  complexityHint: 'low' | 'medium' | 'high' | 'extreme';
  seniorityHours?: Record<string, number>;
}

export const STANDARD_TASK_DEFINITIONS: Record<StandardTaskType, StandardTaskDefinition> = {
  'TVC': {
    type: 'TVC',
    category: 'Production',
    description: 'Television Commercial & Video Campaign. Concept storyboarding, animatic styling, visual scripts, voiceover direction, and post-production oversight.',
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
  if (task.benchmarks[seniority] !== undefined) {
    return task.benchmarks[seniority]!;
  }
  // Fallback mappings for Creative-specific roles
  if (seniority === 'associate_director') return task.benchmarks.director ?? 6;
  if (seniority === 'art_director') return task.benchmarks.lead ?? 10;
  if (seniority === 'specialist') return task.benchmarks.mid ?? 16;
  if (seniority === 'nsp_intern') return task.benchmarks.nss_intern ?? 24;
  return task.benchmarks[seniority] ?? 16;
}

/**
 * Human-readable seniority display labels across Creative and standard agency departments
 */
export const SENIORITY_LABELS: Record<SeniorityLevel, { label: string; badgeColor: string; description: string }> = {
  // Creative Department hierarchy
  director: {
    label: 'Director',
    badgeColor: 'badge-seniority-director',
    description: 'Executive authority. High-leverage directional oversight.'
  },
  associate_director: {
    label: 'Associate Director',
    badgeColor: 'badge-seniority-associate',
    description: 'Senior creative management, creative strategy stewardship, and multi-squad direction.'
  },
  art_director: {
    label: 'Art Director',
    badgeColor: 'badge-seniority-lead',
    description: 'Squad leadership, visual craftsmanship, artistic guidance, and squad review sign-off.'
  },
  specialist: {
    label: 'Specialist',
    badgeColor: 'badge-seniority-mid',
    description: 'Core hands-on creative execution across design and copy craft disciplines.'
  },
  junior: {
    label: 'Junior',
    badgeColor: 'badge-seniority-junior',
    description: 'Developing practitioner. Requires foundational time allocation and structured reviews.'
  },
  nsp_intern: {
    label: 'NSP/Intern',
    badgeColor: 'badge-seniority-junior',
    description: 'National Service Personnel (NSP) / intern undergoing creative studio mentorship.'
  },

  // Standard Department hierarchy (Traffic, Client Services)
  lead: {
    label: 'Lead / Principal',
    badgeColor: 'badge-seniority-lead',
    description: 'Strategic lead. Rapid conceptualization and cross-team direction.'
  },
  senior: {
    label: 'Senior',
    badgeColor: 'badge-seniority-senior',
    description: 'Experienced master. High-velocity execution with minimal oversight.'
  },
  mid: {
    label: 'Mid-Weight',
    badgeColor: 'badge-seniority-mid',
    description: 'Independent producer. Reliable execution at standard velocity benchmarks.'
  },
  nss_intern: {
    label: 'NSS/Intern',
    badgeColor: 'badge-seniority-junior',
    description: 'National Service Scheme personnel / intern. Undergoing structured mentorship and skill building.'
  }
};
