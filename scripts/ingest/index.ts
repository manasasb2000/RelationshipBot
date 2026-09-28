import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { count, eq } from 'drizzle-orm';
import { PDFParse } from 'pdf-parse';
import { getDb } from '../../lib/db';
import { kbChunks, kbDocuments } from '../../lib/db/schema';
import { embedTexts } from '../../lib/guru/embeddings';

const root = path.resolve('knowledge');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? files(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    ),
  );
  return nested.flat().filter((file) => /\.(md|txt|pdf)$/i.test(file));
}

async function content(file: string) {
  const data = await readFile(file);
  if (!file.endsWith('.pdf')) return data.toString('utf8');
  const parser = new PDFParse({ data });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

function metadata(raw: string, file: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const values = Object.fromEntries(
    (match?.[1] ?? '').split('\n').flatMap((line) => {
      const index = line.indexOf(':');
      return index > 0 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );
  return {
    body: match ? raw.slice(match[0].length) : raw,
    title: values.title || path.basename(file),
    license: values.license || 'Unknown',
    source: path.relative(root, file),
    publisher: values.source || 'Unknown',
    url: values.url || undefined,
    language: values.language || 'en',
    tags: (values.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function chunk(text: string) {
  const sections = text
    .split(/\n(?=#{1,3} )/)
    .flatMap((section) =>
      section.length > 2400 ? (section.match(/[\s\S]{1,2200}(?:\s|$)/g) ?? []) : [section],
    );
  return sections.map((part) => part.trim()).filter((part) => part.length > 80);
}

async function main() {
  const db = getDb();
  if (process.env.RESET_KB === '1') {
    await db.delete(kbChunks);
    await db.delete(kbDocuments);
  }
  for (const file of await files(root)) {
    const item = metadata(await content(file), file);
    const checksum = hash(item.body);
    const existing = await db
      .select({ id: kbDocuments.id, checksum: kbDocuments.checksum })
      .from(kbDocuments)
      .where(eq(kbDocuments.source, item.source))
      .limit(1);
    if (existing[0]?.checksum === checksum) {
      const chunkCount = await db
        .select({ value: count() })
        .from(kbChunks)
        .where(eq(kbChunks.documentId, existing[0].id));
      if ((chunkCount[0]?.value ?? 0) > 0) continue;
    }
    if (existing[0]) await db.delete(kbDocuments).where(eq(kbDocuments.id, existing[0].id));
    const [document] = await db
      .insert(kbDocuments)
      .values({
        source: item.source,
        title: item.title,
        license: item.license,
        url: item.url,
        language: item.language,
        tags: item.tags,
        checksum,
      })
      .returning({ id: kbDocuments.id });
    const chunks = chunk(item.body);
    const embeddings = await embedTexts(chunks);
    await db.insert(kbChunks).values(
      chunks.map((text, position) => ({
        documentId: document.id,
        content: text,
        embedding: embeddings[position],
        metadata: { tags: item.tags, language: item.language, publisher: item.publisher },
        position,
        checksum: hash(`${checksum}:${position}:${text}`),
      })),
    );
    console.log(`Ingested ${item.title}: ${chunks.length} chunks`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
