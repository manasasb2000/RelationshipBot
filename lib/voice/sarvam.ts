import 'server-only';
import { env } from '@/lib/env/server';

const API = 'https://api.sarvam.ai';

export const voiceLanguages = [
  ['auto', 'Auto detect'],
  ['en-IN', 'English'],
  ['hi-IN', 'Hindi'],
  ['bn-IN', 'Bengali'],
  ['gu-IN', 'Gujarati'],
  ['kn-IN', 'Kannada'],
  ['ml-IN', 'Malayalam'],
  ['mr-IN', 'Marathi'],
  ['od-IN', 'Odia'],
  ['pa-IN', 'Punjabi'],
  ['ta-IN', 'Tamil'],
  ['te-IN', 'Telugu'],
] as const;

export async function transcribeAudio(file: File, languageCode: string) {
  if (!env.SARVAM_API_KEY) throw new Error('SARVAM_NOT_CONFIGURED');
  const form = new FormData();
  form.set('file', file);
  form.set('model', env.SARVAM_STT_MODEL);
  form.set('mode', 'transcribe');
  form.set('language_code', languageCode === 'auto' ? 'unknown' : languageCode);
  const response = await fetch(`${API}/speech-to-text`, {
    method: 'POST',
    headers: { 'api-subscription-key': env.SARVAM_API_KEY },
    body: form,
  });
  if (!response.ok)
    throw new Error(response.status === 429 ? 'SARVAM_RATE_LIMIT' : 'SARVAM_STT_FAILED');
  return response.json() as Promise<{
    transcript: string;
    language_code: string;
    request_id?: string;
  }>;
}

export async function synthesizeSpeech(text: string, languageCode: string) {
  if (!env.SARVAM_API_KEY) throw new Error('SARVAM_NOT_CONFIGURED');
  const target = languageCode === 'auto' ? 'en-IN' : languageCode;
  const response = await fetch(`${API}/text-to-speech`, {
    method: 'POST',
    headers: { 'api-subscription-key': env.SARVAM_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: [text.slice(0, 2500)],
      target_language_code: target,
      speaker: target === 'en-IN' ? 'ratan' : 'shubh',
      model: env.SARVAM_TTS_MODEL,
      pace: 1,
      speech_sample_rate: 24000,
      enable_preprocessing: true,
    }),
  });
  if (!response.ok)
    throw new Error(response.status === 429 ? 'SARVAM_RATE_LIMIT' : 'SARVAM_TTS_FAILED');
  const data = (await response.json()) as { audios?: string[] };
  if (!data.audios?.[0]) throw new Error('SARVAM_TTS_EMPTY');
  return Buffer.from(data.audios[0], 'base64');
}
