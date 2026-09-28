import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { runKundliAgent } from '@/lib/agents/kundli';
import type { MatchResult } from '@/lib/kundli/engine';

const requestSchema = z.object({
  question: z.string().min(1).max(500),
  matchResult: z.record(z.unknown()).optional(),
  requestId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const userId = req.cookies.get('lovestory_user')?.value ?? 'anonymous';

  const rate = await checkRateLimit(`kundli:followup:${userId}`);
  if (!rate.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { question, matchResult } = parsed.data;

  try {
    const result = await runKundliAgent({
      partner1: { gender: 'female', dob: '', tob: null, lat: 0, lon: 0, timezone: 'UTC' },
      partner2: { gender: 'male', dob: '', tob: null, lat: 0, lon: 0, timezone: 'UTC' },
      followUpQuestion: question,
      storedMatchResult: matchResult as MatchResult | undefined,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
