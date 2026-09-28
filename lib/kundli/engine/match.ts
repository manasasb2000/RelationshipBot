import type { BirthData, MatchResult } from './types';
import { computeChart } from './chart';
import { computeAshtakoot } from './ashtakoot';
import { checkManglik } from './manglik';
import { checkDoshas } from './doshas';

export function computeMatch(p1Birth: BirthData, p2Birth: BirthData): MatchResult {
  const chart1 = computeChart(p1Birth);
  const chart2 = computeChart(p2Birth);
  const ashtakoot = computeAshtakoot(chart1, chart2);
  const manglik1 = checkManglik(chart1);
  const manglik2 = checkManglik(chart2);
  const doshas = checkDoshas(chart1, chart2);
  
  if (manglik1.isManglik && manglik2.isManglik) {
    manglik1.cancellationApplied = true;
    manglik1.cancellationReason = 'Both partners are Manglik';
    manglik2.cancellationApplied = true;
    manglik2.cancellationReason = 'Both partners are Manglik';
  }

  const score = ashtakoot.totalObtained;
  const summary = `Ashtakoot score: ${score}/36 — ${ashtakoot.verdict}. Manglik Match: ${manglik1.isManglik === manglik2.isManglik ? 'Balanced' : 'Check required'}.`;

  return {
    partner1: chart1,
    partner2: chart2,
    ashtakoot,
    manglik1,
    manglik2,
    doshas,
    summary,
    conventionsUsed: [...new Set([...chart1.conventionsUsed, ...ashtakoot.conventionsUsed, ...manglik1.conventionsUsed, ...doshas.conventionsUsed])]
  };
}
