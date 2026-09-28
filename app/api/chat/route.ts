import { NextRequest, NextResponse } from 'next/server';
import { runGuruPipeline } from '@/lib/guru/pipeline';
import { chatRequestSchema } from '@/lib/guru/types';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: 'Please send a valid message.' }, { status: 400 });

  const existingUserId = request.cookies.get('lovestory_user')?.value;
  const userId = existingUserId ?? crypto.randomUUID();
  const rate = await checkRateLimit(`chat:${userId}`);
  if (!rate.success)
    return Response.json(
      { error: 'Please take a breath and try again in a moment.' },
      { status: 429 },
    );
  try {
    const result = await runGuruPipeline({
      userId,
      message: parsed.data.message,
      history: parsed.data.history,
      conversationId: parsed.data.conversationId,
      requestId: parsed.data.requestId ?? crypto.randomUUID(),
    });
    const response = NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    if (!existingUserId)
      response.cookies.set('lovestory_user', userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
      });
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN';
    const message =
      code === 'LLM_NOT_CONFIGURED'
        ? 'The Guru needs an OpenAI key before it can answer.'
        : 'The Guru could not respond just now. Please try again.';
    return Response.json({ error: message }, { status: 503 });
  }
}
