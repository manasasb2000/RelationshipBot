export interface BirthData {
  name?: string;
  gender: 'male' | 'female' | 'other';
  dob: string; // YYYY-MM-DD
  tob: string | null; // HH:MM
  lat: number;
  lon: number;
  timezone: string;
}

export type PlanetId = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export interface NakshatraInfo {
  index: number; // 0-26
  name: string;
  pada: number; // 1-4
}

export interface RashiInfo {
  index: number; // 0-11
  name: string;
}

export interface ChartResult {
  moonLongitude: number;
  moonRashi: RashiInfo;
  moonNakshatra: NakshatraInfo;
  lagna: RashiInfo | null;
  marsHouse: number | null;
  planets: Record<PlanetId, number>;
  conventionsUsed: string[];
}

export interface KootaScore {
  name: string;
  obtained: number;
  max: number;
  description: string;
}

export interface AshtakootResult {
  kootas: KootaScore[];
  totalObtained: number;
  totalMax: number;
  verdict: string;
  conventionsUsed: string[];
}

export interface ManglikResult {
  isManglik: boolean;
  houseOfMars: number | null;
  cancellationApplied: boolean;
  cancellationReason: string | null;
  note: string;
  conventionsUsed: string[];
}

export interface DoshaResult {
  nadiDosha: { present: boolean; parihara: boolean; pariharaReason: string | null };
  bhakootDosha: { present: boolean; parihara: boolean; pariharaReason: string | null };
  conventionsUsed: string[];
}

export interface MatchResult {
  partner1: ChartResult;
  partner2: ChartResult;
  ashtakoot: AshtakootResult;
  manglik1: ManglikResult;
  manglik2: ManglikResult;
  doshas: DoshaResult;
  summary: string;
  conventionsUsed: string[];
}
