import { computePlanetaryPositions } from './ephemeris';
import { NAKSHATRAS, RASHIS } from './nakshatra-data';
import type { BirthData, ChartResult } from './types';

export function computeChart(birth: BirthData): ChartResult {
  const { planets, ayanamsa } = computePlanetaryPositions(birth.dob, birth.tob, birth.timezone);
  
  const moonLong = planets['Moon'];
  const moonNakshatraIndex = Math.floor(moonLong / (360 / 27));
  const pada = Math.floor((moonLong % (360 / 27)) / (360 / 27 / 4)) + 1;
  const moonRashiIndex = Math.floor(moonLong / 30);
  
  const marsLong = planets['Mars'];
  const marsRashiIndex = Math.floor(marsLong / 30);
  const marsHouse = birth.tob ? ((marsRashiIndex - moonRashiIndex + 12) % 12) + 1 : null;
  
  return {
    moonLongitude: moonLong,
    moonNakshatra: { index: moonNakshatraIndex, name: NAKSHATRAS[moonNakshatraIndex].name, pada },
    moonRashi: { index: moonRashiIndex, name: RASHIS[moonRashiIndex].name },
    lagna: null,
    marsHouse,
    planets,
    conventionsUsed: ['Lahiri Ayanamsa', 'Sidereal (Nirayana) system', 'Moon chart for Mars house']
  };
}
