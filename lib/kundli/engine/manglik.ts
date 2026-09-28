import type { ChartResult, ManglikResult } from './types';
import { RASHIS } from './nakshatra-data';

export function checkManglik(chart: ChartResult): ManglikResult {
  let isManglik = false;
  let cancellationApplied = false;
  let cancellationReason: string | null = null;
  
  if (chart.marsHouse !== null) {
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    if (manglikHouses.includes(chart.marsHouse)) {
      isManglik = true;
      const marsRashiIndex = Math.floor(chart.planets['Mars'] / 30);
      const rashi = RASHIS[marsRashiIndex].name;
      if (['Aries', 'Scorpio', 'Capricorn'].includes(rashi)) {
        cancellationApplied = true;
        cancellationReason = `Mars in own/exalted sign (${rashi})`;
      }
    }
  }

  return {
    isManglik,
    houseOfMars: chart.marsHouse,
    cancellationApplied,
    cancellationReason,
    note: chart.marsHouse === null ? 'Exact birth time not provided; calculated from Moon.' : '',
    conventionsUsed: ['Manglik from Moon if Lagna unknown', 'Basic cancellation (Own/Exalted sign)']
  };
}
