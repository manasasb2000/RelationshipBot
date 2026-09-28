import type { KootaScore } from '@/lib/kundli/engine/types';

const KOOTA_MEANINGS: Record<string, string> = {
  Varna: 'Spiritual nature & purpose',
  Vashya: 'Natural attraction & influence',
  Tara: 'Birth star harmony & destiny',
  Yoni: 'Physical & emotional intimacy',
  'Graha Maitri': 'Mindset & intellectual bond',
  Gana: 'Temperament & nature',
  Bhakoot: 'Family & emotional growth',
  Nadi: 'Health, energy & progeny',
};

interface KootaBreakdownProps { kootas: KootaScore[] }

export function KootaBreakdown({ kootas }: KootaBreakdownProps) {
  return (
    <div className="koota-breakdown" role="table" aria-label="Ashtakoot breakdown">
      <div role="rowgroup">
        <div role="row" className="koota-header">
          <span role="columnheader">Koota</span>
          <span role="columnheader">Score</span>
          <span role="columnheader">Meaning</span>
        </div>
      </div>
      <div role="rowgroup">
        {kootas.map((k) => {
          const pct = k.obtained / k.max;
          return (
            <div key={k.name} role="row" className="koota-row">
              <span role="cell" className="koota-name">{k.name}</span>
              <span role="cell" className="koota-score">
                <span className="koota-bar">
                  <span
                    className="koota-fill"
                    style={{ width: `${pct * 100}%` }}
                    aria-hidden
                  />
                </span>
                <strong>{k.obtained}</strong>/{k.max}
              </span>
              <span role="cell" className="koota-meaning">{KOOTA_MEANINGS[k.name] ?? k.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
