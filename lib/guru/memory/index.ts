import 'server-only';
import { desc, eq, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { databaseAvailable, getDb } from '@/lib/db';
import { memories, memoryFacts, proceduralMemory, users } from '@/lib/db/schema';
import { env } from '@/lib/env/server';
import { embedText } from '../embeddings';
import { extractMemoriesWithGemini } from '../gemini';
import type { ChatMessage } from '../types';
import { decryptMemory, encryptMemory } from './crypto';

export type RetrievedMemories = {
  procedural: string[];
  semantic: string[];
  longTerm: string[];
  episodic: string[];
};
const empty = (): RetrievedMemories => ({
  procedural: [],
  semantic: [],
  longTerm: [],
  episodic: [],
});

export class MemoryManager {
  async retrieve(userId: string, query: string): Promise<RetrievedMemories> {
    if (!databaseAvailable() || !env.MEMORY_ENCRYPTION_KEY) return empty();
    const db = getDb();
    const user = await db
      .select({ enabled: users.memoryEnabled })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user[0]?.enabled === false) return empty();
    let embedding: number[];
    try {
      embedding = await embedText(query);
    } catch {
      return empty();
    }
    const rows = await db.execute<{
      type: 'long_term' | 'episodic' | 'semantic' | 'procedural';
      encrypted_content: string;
    }>(
      sql`SELECT type, encrypted_content FROM memories WHERE user_id = ${userId} AND status = 'active' ORDER BY (1 - (embedding <=> ${JSON.stringify(embedding)}::vector)) * (0.5 + importance / 2) * exp(-extract(epoch from (now() - created_at)) / 7776000) DESC LIMIT 12`,
    );
    const result = empty();
    for (const row of rows) {
      try {
        const content = decryptMemory(row.encrypted_content);
        if (row.type === 'long_term') result.longTerm.push(content);
        else if (row.type === 'episodic') result.episodic.push(content);
      } catch {
        /* Ignore values encrypted with an unavailable historical key. */
      }
    }
    const [facts, procedures] = await Promise.all([
      db
        .select()
        .from(memoryFacts)
        .where(eq(memoryFacts.userId, userId))
        .orderBy(desc(memoryFacts.updatedAt))
        .limit(8),
      db
        .select()
        .from(proceduralMemory)
        .where(eq(proceduralMemory.userId, userId))
        .orderBy(desc(proceduralMemory.updatedAt))
        .limit(4),
    ]);
    result.semantic = facts.flatMap((fact) => {
      try {
        return [`${fact.subject} ${fact.predicate} ${decryptMemory(fact.encryptedObject)}`];
      } catch {
        return [];
      }
    });
    result.procedural = procedures.flatMap((item) => {
      try {
        return [`${item.key}: ${decryptMemory(item.encryptedValue)}`];
      } catch {
        return [];
      }
    });
    return result;
  }

  async extract(userId: string, sourceMessageId: string | undefined, history: ChatMessage[]) {
    if (
      !databaseAvailable() ||
      !env.MEMORY_ENCRYPTION_KEY ||
      (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY)
    )
      return;
    const recent = history.slice(-6);
    if (!recent.length) return;
    const parsed = env.GEMINI_API_KEY
      ? await extractMemoriesWithGemini(recent)
      : await extractMemoriesWithOpenAI(recent);
    const db = getDb();
    for (const item of parsed.memories.slice(0, 4)) {
      const embedding = await embedText(item.content);
      const duplicate = await db.execute<{ id: string; similarity: number }>(
        sql`SELECT id::text, 1 - (embedding <=> ${JSON.stringify(embedding)}::vector) AS similarity FROM memories WHERE user_id = ${userId} AND type = ${item.type} AND status = 'active' ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector LIMIT 1`,
      );
      const values = {
        encryptedContent: encryptMemory(item.content),
        embedding,
        importance: Math.max(0, Math.min(1, item.importance)),
        confidence: Math.max(0, Math.min(1, item.confidence)),
        sourceMessageId,
        updatedAt: new Date(),
      };
      const match = (duplicate as unknown as { id: string; similarity: number }[])[0];
      if (match && Number(match.similarity) >= 0.88) {
        await db.update(memories).set(values).where(eq(memories.id, match.id));
      } else {
        await db.insert(memories).values({ userId, type: item.type, ...values });
      }
    }
    await db.execute(
      sql`DELETE FROM memories WHERE user_id = ${userId} AND importance < 0.2 AND created_at < now() - interval '180 days'`,
    );
  }

  async setEnabled(userId: string, enabled: boolean) {
    if (!databaseAvailable()) return;
    await getDb()
      .insert(users)
      .values({ id: userId, memoryEnabled: enabled })
      .onConflictDoUpdate({
        target: users.id,
        set: { memoryEnabled: enabled, updatedAt: new Date() },
      });
  }

  async list(userId: string) {
    if (!databaseAvailable() || !env.MEMORY_ENCRYPTION_KEY) return [];
    const rows = await getDb()
      .select({
        id: memories.id,
        type: memories.type,
        encryptedContent: memories.encryptedContent,
        importance: memories.importance,
        updatedAt: memories.updatedAt,
      })
      .from(memories)
      .where(andUserActive(userId))
      .orderBy(desc(memories.updatedAt));
    return rows.flatMap((row) => {
      try {
        return [
          {
            id: row.id,
            type: row.type,
            content: decryptMemory(row.encryptedContent),
            importance: row.importance,
            updatedAt: row.updatedAt,
          },
        ];
      } catch {
        return [];
      }
    });
  }

  async update(userId: string, id: string, content: string) {
    if (!databaseAvailable() || !env.MEMORY_ENCRYPTION_KEY) return;
    const embedding = await embedText(content);
    await getDb()
      .update(memories)
      .set({ encryptedContent: encryptMemory(content), embedding, updatedAt: new Date() })
      .where(sql`${memories.id} = ${id}::uuid AND ${memories.userId} = ${userId}`);
  }

  async deleteOne(userId: string, id: string) {
    if (!databaseAvailable()) return;
    await getDb()
      .delete(memories)
      .where(sql`${memories.id} = ${id}::uuid AND ${memories.userId} = ${userId}`);
  }

  async clear(userId: string) {
    if (!databaseAvailable()) return;
    const db = getDb();
    await Promise.all([
      db.delete(memories).where(eq(memories.userId, userId)),
      db.delete(memoryFacts).where(eq(memoryFacts.userId, userId)),
      db.delete(proceduralMemory).where(eq(proceduralMemory.userId, userId)),
    ]);
  }
}

export const memoryManager = new MemoryManager();

function andUserActive(userId: string) {
  return sql`${memories.userId} = ${userId} AND ${memories.status} = 'active'`;
}

async function extractMemoriesWithOpenAI(recent: ChatMessage[]) {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    instructions:
      'Extract only durable, relationship-useful, non-sensitive memories. Never store passwords, IDs, payment data, exact addresses, health diagnoses, or secrets. Return JSON with memories: [{type: long_term|episodic|procedural, content, importance, confidence}]. Return an empty array when nothing is durable.',
    input: JSON.stringify(recent),
    text: {
      format: {
        type: 'json_schema',
        name: 'memory_writes',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            memories: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  type: { type: 'string', enum: ['long_term', 'episodic', 'procedural'] },
                  content: { type: 'string' },
                  importance: { type: 'number' },
                  confidence: { type: 'number' },
                },
                required: ['type', 'content', 'importance', 'confidence'],
              },
            },
          },
          required: ['memories'],
        },
      },
    },
    store: false,
  });
  return JSON.parse(response.output_text) as {
    memories: {
      type: 'long_term' | 'episodic' | 'procedural';
      content: string;
      importance: number;
      confidence: number;
    }[];
  };
}
