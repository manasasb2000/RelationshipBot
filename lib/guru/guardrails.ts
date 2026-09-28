import type { ScopeDecision } from './types';

export function routedResponse(decision: ScopeDecision): string | null {
  switch (decision.label) {
    case 'crisis':
      return 'I’m really sorry you’re carrying this. You deserve support from a real person right now. Please reach out to someone you trust who can stay with you, contact local emergency services if you may act soon, or find a local crisis line at https://findahelpline.com. I’m not a therapist or emergency service, but I can stay with you while you take that next step.';
    case 'injection':
      return 'I can’t change my role or share private instructions, but I’m still here for the heart of things. Is there something about love, a relationship, or how you’re feeling that you’d like to talk through?';
    case 'out_of_scope':
      return 'That’s a bit outside my heart-work! I’m here for love, relationships, and how you’re feeling. Is there something on your heart I can help with?';
    case 'ambiguous':
      return 'I want to understand you well. Is this connected to a relationship, dating, or something you’re feeling with another person?';
    default:
      return null;
  }
}

const harmfulOutput =
  /\b(stalk|track them secretly|control (him|her|them)|gaslight|threaten|force them|coerce)\b/i;

export function outputIsSafe(text: string) {
  return text.length > 0 && !harmfulOutput.test(text);
}
