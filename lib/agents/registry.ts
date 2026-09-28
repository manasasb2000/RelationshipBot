export type Agent = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming-soon';
  route: string | null;
  systemPrompt: string | null;
};
export const agents: readonly Agent[] = [
  {
    id: 'intake',
    name: 'Profile & Intake',
    description: 'A little reflection. A deeper understanding of you.',
    icon: 'user',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'matching',
    name: 'Soulmate Matching',
    description: 'Meaningful connections, beyond the surface.',
    icon: 'hearts',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'kundli',
    name: 'Kundli Matching',
    description: 'Where tradition meets your modern love story.',
    icon: 'stars',
    status: 'available',
    route: '/app/kundli',
    systemPrompt: null,
  },
  {
    id: 'guru',
    name: 'Relationship Guru',
    description: 'A listening ear. A fresh perspective. A little guidance, whenever you need it.',
    icon: 'flower',
    status: 'available',
    route: '/app/guru',
    systemPrompt: 'guru',
  },
  {
    id: 'manager',
    name: 'Relationship Manager',
    description: 'Nurture the little things that keep you close.',
    icon: 'heart',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'mediator',
    name: 'Conflict Mediator',
    description: 'Find common ground, even on the hard days.',
    icon: 'hands',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'dates',
    name: 'Date Planner',
    description: 'Make room for a little more time together.',
    icon: 'calendar',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'voice',
    name: 'Voice Coach',
    description: 'Find the words. And the confidence to say them.',
    icon: 'mic',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
  {
    id: 'safety',
    name: 'Safety & Trust',
    description: 'Build connections that feel safe and respectful.',
    icon: 'shield',
    status: 'coming-soon',
    route: null,
    systemPrompt: null,
  },
];
