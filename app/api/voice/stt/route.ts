import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { transcribeAudio } from '@/lib/voice/sarvam';

export async function POST(request: NextRequest) {
  const userId =
    request.cookies.get('lovestory_user')?.value ??
    request.headers.get('x-forwarded-for') ??
    'anonymous';
  if (!(await checkRateLimit(`stt:${userId}`, 10)).success)
    return Response.json({ error: 'Voice limit reached. Try again shortly.' }, { status: 429 });
  const form = await request.formData();
  const file = form.get('audio');
  const language = String(form.get('language') ?? 'auto');
  if (!(file instanceof File) || file.size === 0 || file.size > 12 * 1024 * 1024)
    return Response.json({ error: 'Please provide a recording under 12 MB.' }, { status: 400 });
  if (!file.type.startsWith('audio/') && file.type !== 'video/webm')
    return Response.json({ error: 'Unsupported recording format.' }, { status: 415 });
  try {
    const result = await transcribeAudio(file, language);
    return Response.json({
      transcript: result.transcript.trim(),
      languageCode: result.language_code,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    return Response.json(
      {
        error:
          code === 'SARVAM_NOT_CONFIGURED'
            ? 'Voice transcription needs a Sarvam key.'
            : 'I could not transcribe that recording.',
      },
      { status: code === 'SARVAM_RATE_LIMIT' ? 429 : 502 },
    );
  }
}
