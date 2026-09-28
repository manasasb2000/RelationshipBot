import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { classifyKundliScope } from '@/lib/agents/kundli/scope';
import { runKundliAgent } from '@/lib/agents/kundli';
import { logAgentEvent } from '@/lib/guru/persistence';
import { birthDataSchema } from '@/lib/tools/kundli/compute';

const requestSchema = z.object({
  partner1: birthDataSchema,
  partner2: birthDataSchema,
  requestId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const existingUserId = req.cookies.get('lovestory_user')?.value;
  const userId = existingUserId ?? crypto.randomUUID();

  const rate = await checkRateLimit(`kundli:${userId}`, 5);
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
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 422 });
  }

  const { partner1, partner2, requestId } = parsed.data;
  const startedAt = performance.now();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = (event: object) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  // Run async, stream events
  (async () => {
    try {
      const result = await runKundliAgent(
        { partner1: partner1 as any, partner2: partner2 as any },
        (event) => send({ type: 'step', ...event }),
      );
      send({ type: 'result', text: result.text, matchResult: result.matchResult });
      await logAgentEvent({
        userId,
        requestId,
        eventType: 'kundli.completed',
        latencyMs: Math.round(performance.now() - startedAt),
        outcome: 'success',
        metadata: {
          toolsUsed: result.toolsUsed,
          score: result.matchResult?.ashtakoot?.totalObtained,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      send({ type: 'error', message: msg });
      await logAgentEvent({
        userId,
        requestId,
        eventType: 'kundli.error',
        latencyMs: Math.round(performance.now() - startedAt),
        outcome: 'error',
        metadata: { error: msg },
      });
    } finally {
      writer.close();
    }
  })();

  const response = new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });

  if (!existingUserId) {
    response.cookies.set('lovestory_user', userId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
