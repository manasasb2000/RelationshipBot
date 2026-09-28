import type { GuruReply } from './types';

const CACHE_VERSION = 'guru-faq-v1';

const normalizedReplies: Record<string, string> = {
  hi: 'Hi, I’m glad you’re here. What’s on your heart today?',
  hello: 'Hello, lovely to meet you. What would you like to talk through?',
  hey: 'Hey there. I’m here and listening—what’s been on your mind?',
  'good morning':
    'Good morning. I hope you can be gentle with yourself today. What’s on your heart?',
  'good evening': 'Good evening. Take your time—what would feel helpful to talk about?',
  'what is lovestory':
    'LoveStory is a private space for thoughtful relationship conversations. Right now, the Relationship Guru can help you reflect on dating, communication, conflict, boundaries, and emotional connection.',
  'what can you help with':
    'I can help with relationships, dating, marriage, breakups, communication, conflict, boundaries, intimacy, family dynamics, and relationship-related emotional support.',
  'are you a therapist':
    'I’m not a therapist or emergency service. I can offer thoughtful relationship support and practical reflection, and I’ll encourage professional or urgent help when that is the safer next step.',
};

export function normalizeCacheKey(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[!?.,'’]+/g, '')
    .replace(/\s+/g, ' ');
}

export function getCachedReply(input: string): GuruReply | null {
  const text = normalizedReplies[normalizeCacheKey(input)];
  if (!text) return null;

  return {
    text,
    cached: true,
    citations: [],
    decision: {
      label: 'in_scope',
      confidence: 1,
      reason: `Matched versioned stable response cache ${CACHE_VERSION}`,
    },
  };
}
