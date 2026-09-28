import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1, prepare: false });
  try {
    await sql.unsafe(await readFile('drizzle/0000_lovestory_foundation.sql', 'utf8'));
    console.log('LoveStory database schema is ready.');
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
