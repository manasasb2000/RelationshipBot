import type { ChartResult, AshtakootResult, KootaScore } from './types';
import { NAKSHATRAS, RASHIS, PLANET_FRIENDSHIPS } from './nakshatra-data';

export function computeAshtakoot(p1: ChartResult, p2: ChartResult): AshtakootResult {
  const bRashi = RASHIS[p1.moonRashi.index];
  const gRashi = RASHIS[p2.moonRashi.index];
  const bNak = NAKSHATRAS[p1.moonNakshatra.index];
  const gNak = NAKSHATRAS[p2.moonNakshatra.index];

  const varnaScores = { 'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1 };
  let varnaScore = varnaScores[bRashi.varna as keyof typeof varnaScores] >= varnaScores[gRashi.varna as keyof typeof varnaScores] ? 1 : 0;
  
  let vashyaScore = 1;
  if (bRashi.vashya === gRashi.vashya) {
    vashyaScore = 2;
  }

  let p1ToP2 = ((p2.moonNakshatra.index - p1.moonNakshatra.index + 27) % 27) + 1;
  let p2ToP1 = ((p1.moonNakshatra.index - p2.moonNakshatra.index + 27) % 27) + 1;
  const inauspicious = [1, 4, 7];
  let p1Ok = !inauspicious.includes(p1ToP2 % 9);
  let p2Ok = !inauspicious.includes(p2ToP1 % 9);
  let taraScore = (p1Ok ? 1.5 : 0) + (p2Ok ? 1.5 : 0);

  let yoniScore = 2;
  if (bNak.yoni === gNak.yoni) yoniScore = 4;

  let bLord = bRashi.lord;
  let gLord = gRashi.lord;
  let bToG = PLANET_FRIENDSHIPS[bLord].friends.includes(gLord) ? 1 : (PLANET_FRIENDSHIPS[bLord].enemies.includes(gLord) ? -1 : 0);
  let gToB = PLANET_FRIENDSHIPS[gLord].friends.includes(bLord) ? 1 : (PLANET_FRIENDSHIPS[gLord].enemies.includes(bLord) ? -1 : 0);
  let grahaMaitri = 0;
  if (bToG === 1 && gToB === 1) grahaMaitri = 5;
  else if ((bToG === 1 && gToB === 0) || (bToG === 0 && gToB === 1)) grahaMaitri = 4;
  else if (bToG === 0 && gToB === 0) grahaMaitri = 3;
  else if ((bToG === 0 && gToB === -1) || (bToG === -1 && gToB === 0)) grahaMaitri = 1;
  else if ((bToG === 1 && gToB === -1) || (bToG === -1 && gToB === 1)) grahaMaitri = 0.5;

  let ganaScore = 0;
  if (bNak.gana === gNak.gana) ganaScore = 6;
  else if (bNak.gana === 'Deva' && gNak.gana === 'Manushya') ganaScore = 5;
  else if (bNak.gana === 'Deva' && gNak.gana === 'Rakshasa') ganaScore = 1;
  else if (bNak.gana === 'Rakshasa' && gNak.gana === 'Deva') ganaScore = 1;

  let rashiDiff = Math.abs(bRashi.index - gRashi.index);
  let bhakootScore = 7;
  let pattern = rashiDiff + 1;
  if ([6, 8, 2, 12, 5, 9].includes(pattern)) bhakootScore = 0;

  let nadiScore = bNak.nadi === gNak.nadi ? 0 : 8;

  const kootas: KootaScore[] = [
    { name: 'Varna', obtained: varnaScore, max: 1, description: 'Work' },
    { name: 'Vashya', obtained: vashyaScore, max: 2, description: 'Magnetism' },
    { name: 'Tara', obtained: taraScore, max: 3, description: 'Destiny' },
    { name: 'Yoni', obtained: yoniScore, max: 4, description: 'Physical' },
    { name: 'Graha Maitri', obtained: grahaMaitri, max: 5, description: 'Mental' },
    { name: 'Gana', obtained: ganaScore, max: 6, description: 'Temperament' },
    { name: 'Bhakoot', obtained: bhakootScore, max: 7, description: 'Family' },
    { name: 'Nadi', obtained: nadiScore, max: 8, description: 'Health' }
  ];

  let totalObtained = kootas.reduce((sum, k) => sum + k.obtained, 0);
  let verdict = totalObtained >= 28 ? 'Excellent' : totalObtained >= 21 ? 'Good' : totalObtained >= 18 ? 'Average' : 'Challenging';

  return { kootas, totalObtained, totalMax: 36, verdict, conventionsUsed: [] };
}
