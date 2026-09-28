import 'server-only';
import { z } from 'zod';

export const geocodePlaceInput = z.object({ query: z.string().min(1) });
export const geocodePlaceOutput = z.array(
  z.object({ name: z.string(), lat: z.number(), lon: z.number(), displayName: z.string() })
);
export type GeocodePlaceOutput = z.infer<typeof geocodePlaceOutput>;

export async function geocodePlace(input: z.infer<typeof geocodePlaceInput>): Promise<z.infer<typeof geocodePlaceOutput>> {
  const params = new URLSearchParams({ q: input.query, format: 'json', limit: '5', addressdetails: '1' });
  const url = `https://nominatim.openstreetmap.org/search?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LoveStory/1.0 (contact: hello@lovestory.app)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>;
  return data.slice(0, 5).map((d) => ({
    name: d.display_name.split(',')[0]?.trim() ?? d.display_name,
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}
