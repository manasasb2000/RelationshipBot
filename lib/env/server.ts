import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));

const schema = z.object({
  DATABASE_URL: optionalUrl,
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-5'),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  LLM_BASE_URL: optionalUrl,
  LLM_API_KEY: z.string().min(1).optional(),
  LLM_MODEL: z.string().default('gpt-5'),
  EMBEDDING_BASE_URL: optionalUrl,
  EMBEDDING_API_KEY: z.string().min(1).optional(),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIM: z.coerce.number().int().positive().default(1536),
  RERANKER_URL: optionalUrl,
  RERANKER_API_KEY: z.string().optional(),
  RERANKER_MODEL: z.string().optional(),
  SARVAM_API_KEY: z.string().min(1).optional(),
  SARVAM_STT_MODEL: z.string().default('saaras:v3'),
  SARVAM_TTS_MODEL: z.string().default('bulbul:v3'),
  MEMORY_ENCRYPTION_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/)
    .optional(),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  GEOCODING_PROVIDER: z.enum(['nominatim', 'google', 'mapbox']).default('nominatim'),
  GEOCODING_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);
