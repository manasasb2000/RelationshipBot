import type { PlanetId } from './types';

/**
 * Convert a local date + time in the given IANA timezone to UTC.
 * Uses Intl.DateTimeFormat to find the correct UTC offset for that
 * specific local instant (handles historical DST and India timezone changes).
 */
function localToUtc(dob: string, tob: string | null, timezone: string): Date {
  const time = tob ?? '12:00';
  // Build a "naive" Date treating local time as UTC, then find the real offset.
  const naiveUtc = new Date(`${dob}T${time}:00Z`);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(naiveUtc);

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  const tzAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  );
  const offsetMs = naiveUtc.getTime() - tzAsUtc;

  const [year, month, day] = dob.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) + offsetMs);
}

/** Convert a JS Date to Julian Ephemeris Day (JDE). */
function toJDN(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

/**
 * Compute sidereal (Lahiri ayanamsa) planetary longitudes for a birth date/time.
 * Accuracy: ~1° for Moon, ~2° for outer planets — sufficient for nakshatra/rashi determination.
 */
export function computePlanetaryPositions(
  dob: string,
  tob: string | null,
  timezone: string,
): { planets: Record<PlanetId, number>; ayanamsa: number; jde: number } {
  const utcDate = localToUtc(dob, tob, timezone);
  const jde = toJDN(utcDate);

  
  const T = (jde - 2451545.0) / 36525.0;
  const ayanamsa = (23.8521 + (jde - 2451545.0) * (50.2388 / 365.25 / 3600)) % 360;
  
  let L0 = 280.46646 + 36000.76983 * T;
  let M = 357.52911 + 35999.05029 * T;
  const sunTrop = (L0 + 1.914602 * Math.sin(M * Math.PI / 180)) % 360;
  const sunSid = (sunTrop - ayanamsa + 360) % 360;
  
  let L_prime = 218.3164477 + 481267.88123421 * T;
  let M_prime = 134.9633964 + 477198.8675055 * T;
  let D = 297.8501921 + 445267.1114034 * T;
  
  let moonTrop = L_prime + 6.289 * Math.sin(M_prime * Math.PI / 180) 
                         - 1.274 * Math.sin((M_prime - 2 * D) * Math.PI / 180)
                         + 0.658 * Math.sin(2 * D * Math.PI / 180);
  moonTrop = moonTrop % 360;
  const moonSid = (moonTrop - ayanamsa + 360) % 360;
  
  let omega = 125.04452 - 1934.136261 * T;
  const rahuTrop = omega % 360;
  const rahuSid = (rahuTrop - ayanamsa + 360) % 360;
  const ketuSid = (rahuSid + 180) % 360;
  
  let marsMean = 355.45332 + 19140.299300 * T;
  const marsSid = (marsMean - ayanamsa + 360) % 360;
  
  let mercurySid = (252.25032 + 149472.6741 * T - ayanamsa + 360) % 360;
  let jupiterSid = (34.40438 + 3034.9056 * T - ayanamsa + 360) % 360;
  let venusSid = (181.97973 + 58517.8153 * T - ayanamsa + 360) % 360;
  let saturnSid = (50.07747 + 1222.1136 * T - ayanamsa + 360) % 360;

  const normalize = (val: number) => {
    let v = val % 360;
    return v < 0 ? v + 360 : v;
  };
  
  return {
    planets: {
      Sun: normalize(sunSid),
      Moon: normalize(moonSid),
      Mars: normalize(marsSid),
      Mercury: normalize(mercurySid),
      Jupiter: normalize(jupiterSid),
      Venus: normalize(venusSid),
      Saturn: normalize(saturnSid),
      Rahu: normalize(rahuSid),
      Ketu: normalize(ketuSid)
    },
    ayanamsa,
    jde
  };
}
