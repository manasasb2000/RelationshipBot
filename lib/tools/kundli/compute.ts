import 'server-only';
import { z } from 'zod';
import { computeChart, computeAshtakoot, checkManglik, checkDoshas, computeMatch } from '@/lib/kundli/engine';
import type { BirthData } from '@/lib/kundli/engine';

export const birthDataSchema = z.object({
  name: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  tob: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
});
export type BirthDataInput = z.infer<typeof birthDataSchema>;

export function computeChartTool(birth: BirthDataInput) {
  return computeChart(birth as BirthData);
}

export function computeMatchTool(p1: BirthDataInput, p2: BirthDataInput) {
  return computeMatch(p1 as BirthData, p2 as BirthData);
}

export function checkManglikTool(birth: BirthDataInput) {
  const chart = computeChart(birth as BirthData);
  return checkManglik(chart);
}

export function checkDoshasTool(p1: BirthDataInput, p2: BirthDataInput) {
  const c1 = computeChart(p1 as BirthData);
  const c2 = computeChart(p2 as BirthData);
  return checkDoshas(c1, c2);
}
