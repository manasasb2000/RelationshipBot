'use client';
import { useState, useCallback, useRef } from 'react';
import { Loader2, MapPin } from 'lucide-react';

export type PlaceResult = { name: string; displayName: string; lat: number; lon: number };

interface PlaceAutocompleteProps {
  label: string;
  value: PlaceResult | null;
  onChange: (place: PlaceResult | null) => void;
  error?: string;
}

export function PlaceAutocomplete({ label, value, onChange, error }: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [candidates, setCandidates] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setCandidates([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, format: 'json', limit: '5' });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'User-Agent': 'LoveStory/1.0' },
      });
      const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>;
      setCandidates(data.map(d => ({
        name: d.display_name.split(',')[0]?.trim() ?? d.display_name,
        displayName: d.display_name,
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
      })));
      setOpen(true);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(null); // reset selection
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 400);
  };

  const select = (place: PlaceResult) => {
    setQuery(place.name);
    onChange(place);
    setCandidates([]);
    setOpen(false);
  };

  return (
    <div className="form-field" style={{ position: 'relative' }}>
      <label htmlFor={`place-${label}`}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={`place-${label}`}
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="City, State, Country"
          autoComplete="off"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={error ? 'input-error' : ''}
        />
        {loading && <Loader2 size={16} className="input-spinner" aria-hidden />}
      </div>
      {open && candidates.length > 0 && (
        <ul role="listbox" aria-label={`${label} suggestions`} className="place-dropdown">
          {candidates.map((c, i) => (
            <li key={i} role="option" aria-selected={false}>
              <button type="button" onClick={() => select(c)}>
                <MapPin size={14} aria-hidden />
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.displayName}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && (
        <p className="field-hint" style={{ color: 'var(--color-sage)' }}>
          ✓ Confirmed: {value.displayName}
        </p>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
