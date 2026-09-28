import type { ChatMessage, ScopeDecision } from './types';

const crisisPattern =
  /\b(kill myself|suicide|end my life|self[- ]?harm|want to die)\b|मरना चाहता|मरना चाहती|खुदकुशी/i;
const injectionPattern =
  /\b(ignore (all |your )?((previous|system) )?instructions|reveal (your )?system prompt|you are now|jailbreak|developer message)\b/i;
const codePattern =
  /\b(write|create|debug|fix)\s+(some\s+|this\s+)?(python|javascript|typescript|java|c\+\+|code|sql)\b|```|\bfunction\s*\(/i;
const mathPattern = /^\s*(what(?:'s| is)?\s*)?\d+(?:\s*[+\-*/^x×÷]\s*\d+)+\s*\??\s*$/i;
const embeddedMathPattern = /\b(solve|calculate|answer)\s+(?:this\s+)?\d+\s*[+\-*/^x×÷]\s*\d+/i;
const relationalPattern =
  /\b(relationship|partner|boyfriend|girlfriend|husband|wife|spouse|date|dating|marriage|breakup|ex\b|love|conflict|boundary|boundaries|intimacy|trust|cheat|communication|lonely|hurt|heart|family|shaadi|pyaar|rishta)\b|रिश्ता|प्यार|शादी/i;
const greetingPattern = /^(hi|hello|hey|namaste|नमस्ते|good (morning|afternoon|evening))[!. ]*$/i;

export type ScopeClassifier = (input: string, history: ChatMessage[]) => Promise<ScopeDecision>;

export async function classifyScope(
  input: string,
  history: ChatMessage[] = [],
  llmClassifier?: ScopeClassifier,
): Promise<ScopeDecision> {
  if (crisisPattern.test(input))
    return { label: 'crisis', confidence: 0.99, reason: 'Crisis language detected' };
  if (injectionPattern.test(input))
    return { label: 'injection', confidence: 0.99, reason: 'Prompt-injection pattern detected' };
  if (mathPattern.test(input) || embeddedMathPattern.test(input) || codePattern.test(input))
    return { label: 'out_of_scope', confidence: 0.98, reason: 'Unrelated math or coding request' };
  if (greetingPattern.test(input) || relationalPattern.test(input))
    return {
      label: 'in_scope',
      confidence: 0.96,
      reason: 'Greeting or relationship topic detected',
    };

  const recentContext = history
    .slice(-4)
    .map((message) => message.content)
    .join(' ');
  if (
    /^(why|how|what should i say|then what|kyun|kaise)\??$/i.test(input.trim()) &&
    relationalPattern.test(recentContext)
  ) {
    return {
      label: 'in_scope',
      confidence: 0.9,
      reason: 'Short follow-up inherits relationship context',
    };
  }

  if (llmClassifier) return llmClassifier(input, history.slice(-4));
  return {
    label: 'ambiguous',
    confidence: 0.55,
    reason: 'No definitive scope signal without configured classifier',
  };
}
