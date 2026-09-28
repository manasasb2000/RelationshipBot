import { getCachedReply } from './cache';
import { assembleContext } from './context';
import { emitScopeEvent } from './events';
import { outputIsSafe, routedResponse } from './guardrails';
import { classifyScopeWithLLM, generateGuruAnswer } from './llm';
import { classifyScopeWithGemini, generateWithGemini } from './gemini';
import { env } from '@/lib/env/server';
import { memoryManager } from './memory';
import { ensureConversation, ensureUser, logAgentEvent, saveTurn } from './persistence';
import { collectUsedCitations, retrieveKnowledge } from './rag';
import { classifyScope } from './scope';
import type { ChatMessage, GuruReply } from './types';

export async function runGuruPipeline(args: {
  userId: string;
  message: string;
  history: ChatMessage[];
  conversationId?: string;
  requestId: string;
}): Promise<GuruReply> {
  const { userId, message, history, requestId } = args;
  await ensureUser(userId);
  let conversationId = args.conversationId;
  const getConversationId = async () => {
    conversationId = await ensureConversation(userId, conversationId);
    return conversationId;
  };
  const cached = getCachedReply(message);
  if (cached) {
    const ownedConversationId = await getConversationId();
    await emitScopeEvent({
      type: 'scope.decision',
      decision: cached.decision,
      latencyMs: 0,
      cached: true,
    });
    await saveTurn({
      userId,
      conversationId: ownedConversationId,
      userText: message,
      assistantText: cached.text,
      citations: [],
      requestId,
    });
    return { ...cached, conversationId: ownedConversationId };
  }

  const startedAt = performance.now();
  const decision = await classifyScope(
    message,
    history,
    env.GEMINI_API_KEY ? classifyScopeWithGemini : classifyScopeWithLLM,
  );
  await emitScopeEvent({
    type: 'scope.decision',
    decision,
    latencyMs: Math.round(performance.now() - startedAt),
    cached: false,
  });
  const routed = routedResponse(decision);
  if (routed) {
    const ownedConversationId = await getConversationId();
    await saveTurn({
      userId,
      conversationId: ownedConversationId,
      userText: message,
      assistantText: routed,
      citations: [],
      requestId,
    });
    await logAgentEvent({
      userId,
      conversationId: ownedConversationId,
      requestId,
      eventType: 'scope.route',
      latencyMs: Math.round(performance.now() - startedAt),
      outcome: decision.label,
      metadata: { confidence: decision.confidence },
    });
    return {
      text: routed,
      decision,
      cached: false,
      citations: [],
      conversationId: ownedConversationId,
    };
  }

  const retrievalStarted = performance.now();
  const [chunks, memory] = await Promise.all([
    retrieveKnowledge(message),
    memoryManager.retrieve(userId, message),
  ]);
  const referenceContext = assembleContext({ memories: memory, chunks });
  const generated = env.GEMINI_API_KEY
    ? await generateWithGemini({ message, history, referenceContext })
    : await generateGuruAnswer({ message, history, referenceContext });
  const text = outputIsSafe(generated.text)
    ? generated.text
    : 'Let’s pause and find a safe, respectful next step together.';
  const citedKbIds = [...text.matchAll(/\[(kb-[a-f0-9-]+)\]/gi)].map((match) => match[1]);
  const citations = [...collectUsedCitations(citedKbIds, chunks), ...generated.citations];
  const ownedConversationId = await getConversationId();
  const saved = await saveTurn({
    userId,
    conversationId: ownedConversationId,
    userText: message,
    assistantText: text,
    citations,
    requestId,
  });
  await logAgentEvent({
    userId,
    conversationId: ownedConversationId,
    requestId,
    eventType: 'guru.completed',
    model: generated.model,
    latencyMs: Math.round(performance.now() - startedAt),
    outcome: 'success',
    metadata: {
      scope: decision.label,
      retrievalMs: Math.round(performance.now() - retrievalStarted),
      chunkCount: chunks.length,
      citationCount: citations.length,
      webSearched: generated.webSearched,
    },
  });
  void memoryManager
    .extract(userId, saved.userMessageId, [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: text },
    ])
    .catch(() => undefined);
  return {
    text,
    decision,
    cached: false,
    citations,
    conversationId: ownedConversationId,
    model: generated.model,
    webSearched: generated.webSearched,
  };
}
