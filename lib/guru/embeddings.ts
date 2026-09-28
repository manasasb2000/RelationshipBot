import OpenAI from 'openai';
import { env } from '@/lib/env/server';
import { embedWithGemini } from './gemini';

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (env.GEMINI_API_KEY && env.EMBEDDING_MODEL !== 'local-hash') {
    try {
      return await embedWithGemini(texts);
    } catch {
      /* Fall through to another provider or local embeddings. */
    }
  }
  const apiKey = env.EMBEDDING_API_KEY ?? env.OPENAI_API_KEY;
  if (!apiKey || env.EMBEDDING_MODEL === 'local-hash') return texts.map(localEmbedding);
  const client = new OpenAI({ apiKey, baseURL: env.EMBEDDING_BASE_URL || undefined });
  try {
    const response = await client.embeddings.create({ model: env.EMBEDDING_MODEL, input: texts });
    return response.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
  } catch {
    return texts.map(localEmbedding);
  }
}

export async function embedText(text: string) {
  return (await embedTexts([text]))[0];
}

function localEmbedding(text: string) {
  const values = Array.from({ length: 1536 }, () => 0);
  for (const token of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    let hash = 2166136261;
    for (const character of token) hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619);
    values[Math.abs(hash) % values.length] += hash % 2 ? 1 : -1;
  }
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1;
  return values.map((value) => value / norm);
}
