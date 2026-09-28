import 'server-only';
import { z } from 'zod';

export const resolveTimezoneInput = z.object({ lat: z.number(), lon: z.number(), date: z.string() });
export const resolveTimezoneOutput = z.object({ timezone: z.string(), utcOffset: z.string() });

export async function resolveTimezone(input: z.infer<typeof resolveTimezoneInput>): Promise<z.infer<typeof resolveTimezoneOutput>> {
  // Use geonames API free endpoint (no key needed for this endpoint)
  const url = `https://secure.geonames.org/timezoneJSON?lat=${input.lat}&lng=${input.lon}&username=demo`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json() as { timezoneId?: string; gmtOffset?: number };
      if (data.timezoneId) {
        const tz = data.timezoneId;
        const offset = data.gmtOffset ?? 0;
        const sign = offset >= 0 ? '+' : '-';
        const abs = Math.abs(offset);
        const h = String(Math.floor(abs)).padStart(2, '0');
        const m = String(Math.round((abs % 1) * 60)).padStart(2, '0');
        return { timezone: tz, utcOffset: `UTC${sign}${h}:${m}` };
      }
    }
  } catch { /* fall through */ }
  
  // Fallback: use Nominatim reverse geocode to get country, then apply known timezone
  const fallbackUrl = `https://nominatim.openstreetmap.org/reverse?lat=${input.lat}&lon=${input.lon}&format=json`;
  const fallbackRes = await fetch(fallbackUrl, {
    headers: { 'User-Agent': 'LoveStory/1.0' },
    signal: AbortSignal.timeout(6000),
  });
  if (fallbackRes.ok) {
    const data = await fallbackRes.json() as { address?: { country_code?: string } };
    const cc = data.address?.country_code?.toUpperCase() ?? '';
    // Simple country-to-timezone for common cases
    const countryTz: Record<string, string> = {
      IN: 'Asia/Kolkata', US: 'America/New_York', GB: 'Europe/London',
      AU: 'Australia/Sydney', CA: 'America/Toronto', PK: 'Asia/Karachi',
      BD: 'Asia/Dhaka', NP: 'Asia/Kathmandu', LK: 'Asia/Colombo',
      AE: 'Asia/Dubai', SG: 'Asia/Singapore', MY: 'Asia/Kuala_Lumpur',
    };
    const tz = countryTz[cc] ?? 'UTC';
    // Get the offset from Intl
    const now = new Date(input.date + 'T12:00:00Z');
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    const parts = formatter.formatToParts(now);
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value ?? 'UTC';
    return { timezone: tz, utcOffset: offsetStr };
  }
  
  // Last resort: UTC
  return { timezone: 'UTC', utcOffset: 'UTC+00:00' };
}
