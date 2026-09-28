import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { synthesizeSpeech } from '@/lib/voice/sarvam';

const schema = z.object({
  text: z.string().trim().min(1).max(2500),
  language: z.string().default('en-IN'),
});

export async function POST(request: NextRequest) {
  const userId =
    request.cookies.get('lovestory_user')?.value ??
    request.headers.get('x-forwarded-for') ??
    'anonymous';
  if (!(await checkRateLimit(`tts:${userId}`, 15)).success)
    return Response.json({ error: 'Voice limit reached. Try again shortly.' }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid speech request.' }, { status: 400 });
  try {
    const audio = await synthesizeSpeech(parsed.data.text, parsed.data.language);
    return new Response(new Uint8Array(audio), {
      headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    return Response.json(
      {
        error:
          code === 'SARVAM_NOT_CONFIGURED'
            ? 'Voice replies need a Sarvam key.'
            : 'I could not create the voice reply.',
      },
      { status: code === 'SARVAM_RATE_LIMIT' ? 429 : 502 },
    );
  }
}
