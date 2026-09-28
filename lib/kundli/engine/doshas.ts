import type { ChartResult, DoshaResult } from './types';
import { NAKSHATRAS, PLANET_FRIENDSHIPS, RASHIS } from './nakshatra-data';

export function checkDoshas(p1: ChartResult, p2: ChartResult): DoshaResult {
  const p1Nak = NAKSHATRAS[p1.moonNakshatra.index];
  const p2Nak = NAKSHATRAS[p2.moonNakshatra.index];
  const p1Rashi = RASHIS[p1.moonRashi.index];
  const p2Rashi = RASHIS[p2.moonRashi.index];

  let nadiPresent = p1Nak.nadi === p2Nak.nadi;
  let nadiParihara = false;
  let nadiPariharaReason: string | null = null;

  if (nadiPresent && p1.moonNakshatra.index !== p2.moonNakshatra.index) {
    nadiParihara = true;
    nadiPariharaReason = 'Different nakshatras despite same Nadi';
  }

  let rashiDiff = Math.abs(p1.moonRashi.index - p2.moonRashi.index);
  let pattern = rashiDiff + 1;
  let bhakootPresent = [6, 8, 2, 12, 5, 9].includes(pattern);
  let bhakootParihara = false;
  let bhakootPariharaReason: string | null = null;

  if (bhakootPresent) {
    let p1Lord = p1Rashi.lord;
    let p2Lord = p2Rashi.lord;
    let isFriend1 = PLANET_FRIENDSHIPS[p1Lord].friends.includes(p2Lord);
    let isFriend2 = PLANET_FRIENDSHIPS[p2Lord].friends.includes(p1Lord);
    if ((isFriend1 && isFriend2) || p1Lord === p2Lord) {
      bhakootParihara = true;
      bhakootPariharaReason = 'Rashi lords are friends or the same';
    }
  }

  return {
    nadiDosha: { present: nadiPresent, parihara: nadiParihara, pariharaReason: nadiPariharaReason },
    bhakootDosha: { present: bhakootPresent, parihara: bhakootParihara, pariharaReason: bhakootPariharaReason },
    conventionsUsed: ['Standard Nadi Parihara', 'Standard Bhakoot Parihara']
  };
}
