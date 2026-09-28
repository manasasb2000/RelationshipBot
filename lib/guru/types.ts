import { z } from 'zod';

export const scopeLabelSchema = z.enum([
  'in_scope',
  'out_of_scope',
  'crisis',
  'ambiguous',
  'injection',
]);

export const scopeDecisionSchema = z.object({
  label: scopeLabelSchema,
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1).max(240),
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8_000),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4_000),
  history: z.array(chatMessageSchema).max(12).default([]),
  conversationId: z.string().uuid().optional(),
  requestId: z.string().uuid().optional(),
});

export type ScopeDecision = z.infer<typeof scopeDecisionSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type Citation = {
  id: string;
  title: string;
  source: string;
  license: string;
  url?: string;
  chunkId: string;
};

export type GuruReply = {
  text: string;
  decision: ScopeDecision;
  cached: boolean;
  citations: Citation[];
  conversationId?: string;
  model?: string;
  webSearched?: boolean;
};
