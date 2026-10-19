import { EfficiencyLeaderboardEntry, EfficiencyReward, EmailAlertItem } from '../types';

export const INITIAL_LEADERBOARD: EfficiencyLeaderboardEntry[] = [
  {
    rank: 1,
    employeeId: 'usr-amara-okafor',
    employeeName: 'Amara Okafor',
    employeeTitle: 'Mid Motion & Digital Designer',
    brandNames: ['MTN Ghana', 'Guinness Ghana', 'Telecel Ghana'],
    onTimeRate: 97,
    turnaroundScore: 19, // 19% faster than prescribed benchmark
    revertFreeRate: 94, // 94% zero-revert first-time sign-offs
    completedCount: 28,
    points: 1840,
    activeStreak: 11,
    eligibleRewardTier: 'Gold Tier • Studio MVP of the Month'
  },
  {
    rank: 2,
    employeeId: 'usr-sarah-jenkins',
    employeeName: 'Sarah Jenkins',
    employeeTitle: 'Senior Art Director & Brand Lead',
    brandNames: ['MTN Ghana', 'Guinness Ghana', 'Kalahari Solar & ESG'],
    onTimeRate: 94,
    turnaroundScore: 14,
    revertFreeRate: 89,
    completedCount: 34,
    points: 1720,
    activeStreak: 8,
    eligibleRewardTier: 'Silver Tier • Turnaround Titan'
  },
  {
    rank: 3,
    employeeId: 'usr-priyah-sharma',
    employeeName: 'Priyah Sharma',
    employeeTitle: 'Junior Visual & Packaging Designer',
    brandNames: ['Stanbic Bank Ghana', 'FanMilk Ghana', 'MTN Ghana'],
    onTimeRate: 91,
    turnaroundScore: 10,
    revertFreeRate: 86,
    completedCount: 22,
    points: 1490,
    activeStreak: 6,
    eligibleRewardTier: 'Bronze Tier • Sharp Shooter'
  }
];

export const INITIAL_REWARDS: EfficiencyReward[] = [
  {
    id: 'rew-001',
    employeeId: 'usr-amara-okafor',
    employeeName: 'Amara Okafor',
    employeeTitle: 'Mid Motion & Digital Designer',
    rewardTitle: 'Studio MVP of the Month',
    rewardDescription: 'Flawless execution on the MTN Ghana MoMo sprint and Guinness nightlife visuals with 11 straight on-time turnarounds.',
    prize: 'GH₵ 2,500 Direct Cash Bonus + Executive Lunch with Marcus Sterling (GM)',
    awardedBy: 'usr-marcus-sterling',
    awardedByName: 'Marcus Sterling (GM)',
    awardedDate: '2026-09-01T12:00:00Z',
    badgeIcon: 'award',
    category: 'mvp_of_the_month'
  },
  {
    id: 'rew-002',
    employeeId: 'usr-sarah-jenkins',
    employeeName: 'Sarah Jenkins',
    employeeTitle: 'Senior Art Director & Brand Lead',
    rewardTitle: 'Turnaround Titan (Delivery Velocity)',
    rewardDescription: 'Completed the Zenith Global and Guinness brand identity systems ahead of estimated benchmark hours with exceptional typography craft.',
    prize: '1 Paid Agency Flex-Day + Studio Hamper',
    awardedBy: 'usr-elena-rostova',
    awardedByName: 'Elena Rostova (ECD)',
    awardedDate: '2026-08-20T16:30:00Z',
    badgeIcon: 'zap',
    category: 'turnaround_titan'
  },
  {
    id: 'rew-003',
    employeeId: 'usr-michael-chen',
    employeeName: 'Michael Chen',
    employeeTitle: 'Senior Client Service Director',
    rewardTitle: 'Sharp Shooter (First-Pass Precision)',
    rewardDescription: 'Steered first-time client approval on the Apex FinTech multi-market brief with zero commercial variance or rework rounds.',
    prize: 'Full Agency Sponsorship for Professional Masterclass + Learning Allowance',
    awardedBy: 'usr-marcus-sterling',
    awardedByName: 'Marcus Sterling (GM)',
    awardedDate: '2026-08-10T14:15:00Z',
    badgeIcon: 'check_circle',
    category: 'sharp_shooter'
  },
  {
    id: 'rew-004',
    employeeId: 'usr-kwame-mensah',
    employeeName: 'Kwame Mensah',
    employeeTitle: 'Studio Traffic & Operations Lead',
    rewardTitle: 'Studio Anchor (Cross-Team Operational Flow)',
    rewardDescription: 'Zero SLA dispatch breaches and maintained an 88% Studio Balance Index across all creative sprints with instant timeline conflict mediation.',
    prize: 'GH₵ 2,000 Operational Excellence Bonus + Studio Commendation',
    awardedBy: 'usr-marcus-sterling',
    awardedByName: 'Marcus Sterling (GM)',
    awardedDate: '2026-09-12T14:30:00Z',
    badgeIcon: 'users',
    category: 'team_rockstar'
  }
];

export const INITIAL_EMAIL_ALERTS: EmailAlertItem[] = [
  {
    id: 'eml-105',
    jobId: 'CT-1848',
    jobTitle: 'Kalahari Solar Annual Impact Report Visual Layout',
    brandName: 'Kalahari Green Energy',
    recipientEmail: 'marcus.sterling@tibule.com',
    recipientName: 'Marcus Sterling',
    recipientRole: 'General Manager',
    subject: '[Critical Escalation - 72h Overdue] Deliverable 3 Days Overdue: GM Executive Intervention for CT-1848',
    type: 'escalation_gm',
    sentAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    previewBody: 'Marcus, Deliverable [CT-1848] for Kalahari Green Energy has exceeded its committed deadline by over 3 days (76h). Assignee Sarah Jenkins has not finalized exports. As General Manager, immediate executive intervention or client SLA renegotiation is required to prevent agency breach.',
    status: 'delivered',
    escalationTier: 'overdue_72h_gm',
    hoursOverdue: 76
  },
  {
    id: 'eml-104',
    jobId: 'CT-1842',
    jobTitle: 'Q3 Zenith Global Brand Refresh Asset System',
    brandName: 'Zenith Global Group',
    recipientEmail: 'elena.rostova@tibule.com',
    recipientName: 'Elena Rostova',
    recipientRole: 'Executive Creative Director',
    subject: '[Director Escalation - 24h Overdue] Studio Director intervention required for CT-1842',
    type: 'escalation_director',
    sentAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    previewBody: 'Elena, Deliverable [CT-1842] (Zenith Global Brand Refresh) has exceeded deadline by 28 hours. Assigned to Sarah Jenkins. Please coordinate with team leadership and traffic to clear dependencies or reallocate craft assets.',
    status: 'delivered',
    escalationTier: 'overdue_24h_director',
    hoursOverdue: 28
  },
  {
    id: 'eml-103',
    jobId: 'CT-1850',
    jobTitle: 'Starlight Retail Seasonal Campaign Motion Graphics',
    brandName: 'Starlight Retail Holding',
    recipientEmail: 'sarah.jenkins@tibule.com',
    recipientName: 'Sarah Jenkins',
    recipientRole: 'Senior Art Director & Brand Lead',
    subject: '[Lead Escalation - 3h Overdue] Superior intervention required for CT-1850',
    type: 'escalation_lead',
    sentAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    previewBody: 'Sarah, Deliverable [CT-1850] assigned to Amara Okafor is now 4 hours past its scheduled deadline. Immediate team lead check-in is required to establish completion ETA or clear blockers.',
    status: 'delivered',
    escalationTier: 'overdue_3h_lead',
    hoursOverdue: 4
  },
  {
    id: 'eml-102',
    jobId: 'CT-1853',
    jobTitle: 'Orion Biotech Dynamic Packaging 3D Renders',
    brandName: 'Orion Biotech Labs',
    recipientEmail: 'kwame.mensah@tibule.com',
    recipientName: 'Kwame Mensah',
    recipientRole: 'Studio Traffic & Operations Lead',
    subject: '[Traffic Prompt - 1h Overdue] Traffic prompt required for CT-1853 (Priyah Sharma)',
    type: 'traffic_prompt',
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    previewBody: 'Kwame, Deliverable [CT-1853] for Orion Biotech Labs has elapsed its deadline by 1.5 hours. Please prompt Priyah Sharma immediately to confirm submission timeline before superior escalation triggers at 3 hours.',
    status: 'delivered',
    escalationTier: 'overdue_1h_traffic',
    hoursOverdue: 1.5
  },
  {
    id: 'eml-101',
    jobId: 'CT-1845',
    jobTitle: 'Apex FinTech Omnichannel Launch Executive Deck',
    brandName: 'Apex FinTech EMEA',
    recipientEmail: 'michael.chen@tibule.com',
    recipientName: 'Michael Chen',
    recipientRole: 'Client Service Manager',
    subject: '[Deliverable Due Now] CT-1845: Time to push work to superior for review',
    type: 'due_now',
    sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    previewBody: 'Michael, your deliverable [CT-1845] for Apex FinTech is now due. Please push your work to your direct superior David Vance for review to maintain client SLA benchmarks.',
    status: 'delivered',
    escalationTier: 'due_now',
    hoursOverdue: 0.3
  },
  {
    id: 'eml-100',
    jobId: 'CT-1875',
    jobTitle: 'Vodafone Cash Merchant QR Onboarding Visual Kit',
    brandName: 'Vodafone Ghana',
    recipientEmail: 'amara.okafor@tibule.com',
    recipientName: 'Amara Okafor',
    recipientRole: 'Mid-Weight Motion Designer',
    subject: '[Upcoming Deadline] CT-1875: Vodafone Cash Merchant QR (Due in ~16h)',
    type: 'nearly_due',
    sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    previewBody: 'Heads-up that [CT-1875] for Vodafone Ghana is due in ~16 hours. Please wrap up motion exports and prepare files to push for internal review on time.',
    status: 'delivered',
    escalationTier: 'nearly_due',
    hoursOverdue: -16
  }
];
