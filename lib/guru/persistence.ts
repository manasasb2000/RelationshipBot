import 'server-only';
import { and, asc, desc, eq, max } from 'drizzle-orm';
import { databaseAvailable, getDb } from '@/lib/db';
import { agentEvents, conversations, messages, users } from '@/lib/db/schema';
import type { Citation, ChatMessage } from './types';

export async function ensureUser(userId: string) {
  if (!databaseAvailable()) return;
  await getDb().insert(users).values({ id: userId }).onConflictDoNothing();
}

export async function ensureConversation(userId: string, conversationId?: string) {
  if (!databaseAvailable()) return conversationId ?? crypto.randomUUID();
  const db = getDb();
  if (conversationId) {
    const owned = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);
    if (owned[0]) return owned[0].id;
  }
  const [created] = await db
    .insert(conversations)
    .values({ userId })
    .returning({ id: conversations.id });
  return created.id;
}

export async function saveTurn(args: {
  userId: string;
  conversationId: string;
  userText: string;
  assistantText: string;
  citations: Citation[];
  requestId: string;
}) {
  if (!databaseAvailable()) return {};
  const db = getDb();
  const result = await db
    .select({ value: max(messages.position) })
    .from(messages)
    .where(eq(messages.conversationId, args.conversationId));
  const position = (result[0]?.value ?? -1) + 1;
  const inserted = await db
    .insert(messages)
    .values([
      {
        conversationId: args.conversationId,
        role: 'user',
        content: args.userText,
        position,
        requestId: `${args.requestId}:user`,
      },
      {
        conversationId: args.conversationId,
        role: 'assistant',
        content: args.assistantText,
        citations: args.citations,
        position: position + 1,
        requestId: `${args.requestId}:assistant`,
      },
    ])
    .onConflictDoNothing()
    .returning({ id: messages.id, role: messages.role });
  await db
    .update(conversations)
    .set({ updatedAt: new Date(), title: args.userText.slice(0, 72) })
    .where(and(eq(conversations.id, args.conversationId), eq(conversations.userId, args.userId)));
  return { userMessageId: inserted.find((item) => item.role === 'user')?.id };
}

export async function listConversationMessages(
  userId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  if (!databaseAvailable()) return [];
  const db = getDb();
  const owned = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);
  if (!owned[0]) return [];
  const rows = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.position));
  return rows.filter(
    (row): row is { role: 'user' | 'assistant'; content: string } => row.role !== 'system',
  );
}

export async function listConversations(userId: string) {
  if (!databaseAvailable()) return [];
  return getDb()
    .select({
      id: conversations.id,
      title: conversations.title,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(30);
}

export async function deleteConversation(userId: string, conversationId: string) {
  if (!databaseAvailable()) return;
  await getDb()
    .delete(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
}

export async function logAgentEvent(args: {
  userId: string;
  conversationId?: string;
  requestId?: string;
  eventType: string;
  model?: string;
  latencyMs?: number;
  outcome: string;
  metadata?: Record<string, unknown>;
}) {
  if (!databaseAvailable()) return;
  await getDb().insert(agentEvents).values(args);
}
