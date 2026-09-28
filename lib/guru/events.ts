import type { ScopeDecision } from './types';
export type ScopeEvent = {
  type: 'scope.decision';
  decision: ScopeDecision;
  latencyMs: number;
  cached: boolean;
};
export async function emitScopeEvent(event: ScopeEvent) {
  if (process.env.NODE_ENV === 'development')
    console.info(JSON.stringify({ ...event, content: undefined }));
}
