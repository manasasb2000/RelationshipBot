import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env/server';

const local = new Map<string, { count: number; resetAt: number }>();
const distributed =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        prefix: 'lovestory',
      })
    : null;

export async function checkRateLimit(key: string, limit = 30) {
  if (distributed) return distributed.limit(key);
  const now = Date.now();
  const value = local.get(key);
  if (!value || value.resetAt < now) {
    local.set(key, { count: 1, resetAt: now + 60_000 });
    return { success: true, limit, remaining: limit - 1, reset: now + 60_000 };
  }
  value.count += 1;
  return {
    success: value.count <= limit,
    limit,
    remaining: Math.max(0, limit - value.count),
    reset: value.resetAt,
  };
}
