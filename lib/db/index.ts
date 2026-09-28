import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env/server';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { lovestorySql?: ReturnType<typeof postgres> };

export function databaseAvailable() {
  return Boolean(env.DATABASE_URL);
}

export function getDb() {
  if (!env.DATABASE_URL) throw new Error('DATABASE_NOT_CONFIGURED');
  const client = globalForDb.lovestorySql ?? postgres(env.DATABASE_URL, { max: 5, prepare: false });
  if (process.env.NODE_ENV !== 'production') globalForDb.lovestorySql = client;
  return drizzle(client, { schema });
}
