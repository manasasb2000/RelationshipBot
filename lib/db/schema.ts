import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const messageRole = pgEnum('message_role', ['user', 'assistant', 'system']);
export const messageStatus = pgEnum('message_status', [
  'pending',
  'streaming',
  'complete',
  'failed',
]);
export const memoryType = pgEnum('memory_type', [
  'long_term',
  'episodic',
  'semantic',
  'procedural',
]);
export const memoryStatus = pgEnum('memory_status', ['active', 'superseded', 'deleted']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  memoryEnabled: boolean('memory_enabled').default(true).notNull(),
  ...timestamps,
});

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    agentId: text('agent_id').default('guru').notNull(),
    title: text('title').default('A new conversation').notNull(),
    language: text('language').default('auto').notNull(),
    ...timestamps,
  },
  (table) => [index('conversations_user_updated_idx').on(table.userId, table.updatedAt)],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').notNull(),
    role: messageRole('role').notNull(),
    content: text('content').notNull(),
    citations: jsonb('citations').$type<unknown[]>().default([]).notNull(),
    position: integer('position').notNull(),
    status: messageStatus('status').default('complete').notNull(),
    requestId: text('request_id'),
    replacedMessageId: uuid('replaced_message_id'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('messages_conversation_position_idx').on(table.conversationId, table.position),
    uniqueIndex('messages_request_id_idx').on(table.requestId),
  ],
);

export const conversationSummaries = pgTable('conversation_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull(),
  summary: text('summary').notNull(),
  lastCoveredPosition: integer('last_covered_position').notNull(),
  model: text('model').notNull(),
  ...timestamps,
});

export const agentEvents = pgTable(
  'agent_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id'),
    userId: text('user_id').notNull(),
    requestId: text('request_id'),
    eventType: text('event_type').notNull(),
    model: text('model'),
    latencyMs: integer('latency_ms'),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    outcome: text('outcome').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('agent_events_conversation_created_idx').on(table.conversationId, table.createdAt),
  ],
);

export const kbDocuments = pgTable('kb_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  source: text('source').notNull(),
  title: text('title').notNull(),
  license: text('license').notNull(),
  url: text('url'),
  tags: text('tags').array().default([]).notNull(),
  language: text('language').default('en').notNull(),
  checksum: text('checksum').notNull().unique(),
  ...timestamps,
});

export const kbChunks = pgTable(
  'kb_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    position: integer('position').notNull(),
    checksum: text('checksum').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('kb_chunks_document_idx').on(table.documentId)],
);

export const memories = pgTable(
  'memories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    type: memoryType('type').notNull(),
    encryptedContent: text('encrypted_content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    importance: real('importance').default(0.5).notNull(),
    confidence: real('confidence').default(0.5).notNull(),
    sourceMessageId: uuid('source_message_id'),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    status: memoryStatus('status').default('active').notNull(),
    ...timestamps,
  },
  (table) => [index('memories_user_type_idx').on(table.userId, table.type)],
);

export const memoryFacts = pgTable('memory_facts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(),
  predicate: text('predicate').notNull(),
  encryptedObject: text('encrypted_object').notNull(),
  confidence: real('confidence').default(0.5).notNull(),
  sourceMessageId: uuid('source_message_id'),
  ...timestamps,
});

export const proceduralMemory = pgTable('procedural_memory', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  key: text('key').notNull(),
  encryptedValue: text('encrypted_value').notNull(),
  importance: real('importance').default(0.5).notNull(),
  ...timestamps,
});

// Astrology knowledge graph nodes
export const astroNodes = pgTable(
  'astro_nodes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(), // 'Nakshatra'|'Rashi'|'Planet'|'Koota'|'Dosha'|'Cancellation'|'Concept'
    name: text('name').notNull(),
    attributes: jsonb('attributes').$type<Record<string, unknown>>().default({}).notNull(),
    text: text('text').notNull(), // Human-readable description for embedding
    embedding: vector('embedding', { dimensions: 1536 }),
    ...timestamps,
  },
  (table) => [
    index('astro_nodes_type_idx').on(table.type),
    index('astro_nodes_name_idx').on(table.name),
  ],
);

// Astrology knowledge graph edges
export const astroEdges = pgTable(
  'astro_edges',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fromId: uuid('from_id').notNull(),
    toId: uuid('to_id').notNull(),
    relation: text('relation').notNull(), // 'scoring_rule'|'cancelled_by'|'lord'|'friend'|'enemy'|'neutral'|'yoni'|'gana'|'nadi'
    attributes: jsonb('attributes').$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => [
    index('astro_edges_from_idx').on(table.fromId),
    index('astro_edges_to_idx').on(table.toId),
  ],
);

// Kundli reading records (birth data encrypted at rest, with consent)
export const kundliReadings = pgTable(
  'kundli_readings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    conversationId: uuid('conversation_id'),
    encryptedBirthData: text('encrypted_birth_data').notNull(), // JSON of both partners' BirthData, AES-256-GCM encrypted
    matchResult: jsonb('match_result').$type<Record<string, unknown>>().notNull(), // Stored without names/personal details
    consentGiven: boolean('consent_given').default(false).notNull(),
    ...timestamps,
  },
  (table) => [index('kundli_readings_user_idx').on(table.userId)],
);
