// Handles: kundli queries, ashtakoot, nakshatra, dosha, manglik, vedic astrology,
// compatibility questions, follow-up questions, greetings, crisis routing.
// Out of scope: unrelated topics.
// Crisis routing: same as guru (always in scope).

import type { ScopeDecision } from '@/lib/guru/types';

const crisisPattern = /\b(kill myself|suicide|end my life|self[- ]?harm|want to die)\b|मरना चाहता|मरना चाहती|खुदकुशी/i;
const kundliPattern = /\b(kundli|kundali|horoscope|nakshatra|rashi|manglik|dosha|guna milan|ashtakoot|nadi|bhakoot|lagna|chart|birth|compatibility|match|vedic|jyotish|astrology|planet|moon sign|sun sign)\b|कुंडली|राशि|नक्षत्र|मांगलिक/i;
const greetingPattern = /^(hi|hello|hey|namaste|नमस्ते|good (morning|afternoon|evening))[!. ]*$/i;
const injectionPattern = /\b(ignore (all |your )?((previous|system) )?instructions|reveal (your )?system prompt|you are now|jailbreak)\b/i;
const outOfScopePattern = /\b(write|create|debug|fix)\s+(some\s+)?(python|javascript|java|code|sql)\b|```|\bfunction\s*\(|\b\d+\s*[+\-*/]\s*\d+\s*=\s*\?/i;

export async function classifyKundliScope(input: string): Promise<ScopeDecision> {
  if (crisisPattern.test(input)) return { label: 'crisis', confidence: 0.99, reason: 'Crisis language' };
  if (injectionPattern.test(input)) return { label: 'injection', confidence: 0.99, reason: 'Prompt injection' };
  if (outOfScopePattern.test(input)) return { label: 'out_of_scope', confidence: 0.97, reason: 'Unrelated coding/math' };
  if (greetingPattern.test(input) || kundliPattern.test(input)) return { label: 'in_scope', confidence: 0.96, reason: 'Kundli/astrology topic' };
  // Relationship-adjacent questions are also in scope for this agent
  const relationalPattern = /\b(relationship|partner|love|marriage|compatible|shaadi)\b/i;
  if (relationalPattern.test(input)) return { label: 'in_scope', confidence: 0.85, reason: 'Relationship question' };
  return { label: 'ambiguous', confidence: 0.5, reason: 'Unclear — may need clarification' };
}
