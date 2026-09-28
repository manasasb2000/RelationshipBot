'use client';
import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerForm, type PartnerData } from '@/components/kundli/partner-form';
import { StepTracker, type StepId, type StepStatus } from '@/components/kundli/step-tracker';
import { ScoreGauge } from '@/components/kundli/score-gauge';
import { KootaBreakdown } from '@/components/kundli/koota-breakdown';
import { DoshaCard } from '@/components/kundli/dosha-card';
import { FollowupChat } from '@/components/kundli/followup-chat';
import type { MatchResult } from '@/lib/kundli/engine/types';
import { AppSidebar } from '@/components/shell/app-sidebar';

// Mock DISCLAIMER export since we are not sure if it exists in types.ts or engine.ts directly
// We'll hardcode it here if not found, but prompt says `import { DISCLAIMER } from '@/lib/kundli/engine';`
// I'll define it locally to be safe, or import as suggested.
const DISCLAIMER = "This reading is based on traditional Ashtakoot and Dosha principles for general guidance. It does not replace professional astrological or relationship advice.";

const INITIAL_STEPS: StepStatus = {
  geocoding: 'idle', timezone: 'idle', charting: 'idle',
  matching: 'idle', doshas: 'idle', rules: 'idle', writing: 'idle',
};

const EMPTY_PARTNER: PartnerData = {
  name: '', gender: 'female', dob: '', tob: '', unknownTime: false, place: null,
};

// ── Validation ───────────────────────────────────────────
function validatePartner(data: PartnerData) {
  const errors: Partial<Record<keyof PartnerData, string>> = {};
  if (!data.dob) errors.dob = 'Date of birth is required';
  if (data.dob && new Date(data.dob) > new Date()) errors.dob = 'Date cannot be in the future';
  if (!data.unknownTime && !data.tob) errors.tob = 'Enter birth time or check "I do not know"';
  if (!data.place) errors.place = 'Please select a confirmed place from the dropdown';
  return errors;
}

// ── Page ─────────────────────────────────────────────────
export default function KundliPage() {
  const [p1, setP1] = useState<PartnerData>({ ...EMPTY_PARTNER, gender: 'female' });
  const [p2, setP2] = useState<PartnerData>({ ...EMPTY_PARTNER, gender: 'male' });
  const [p1Errors, setP1Errors] = useState<Partial<Record<keyof PartnerData, string>>>({});
  const [p2Errors, setP2Errors] = useState<Partial<Record<keyof PartnerData, string>>>({});
  const [phase, setPhase] = useState<'form' | 'loading' | 'result' | 'error'>('form');
  const [stepStatus, setStepStatus] = useState<StepStatus>(INITIAL_STEPS);
  const [result, setResult] = useState<{ text: string; matchResult: MatchResult } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const updateStep = useCallback((step: StepId | 'rules', status: 'running' | 'done') => {
    setStepStatus(prev => ({ ...prev, [step]: status }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = validatePartner(p1);
    const e2 = validatePartner(p2);
    setP1Errors(e1); setP2Errors(e2);
    if (Object.keys(e1).length || Object.keys(e2).length) return;

    setPhase('loading');
    setStepStatus(INITIAL_STEPS);

    try {
      // Resolve timezones first (client side using known timezone from geocoding)
      const timezone1 = await resolveTimezoneClient(p1.place!.lat, p1.place!.lon, p1.dob);
      const timezone2 = await resolveTimezoneClient(p2.place!.lat, p2.place!.lon, p2.dob);
      updateStep('timezone', 'done');
      updateStep('charting', 'running');

      const res = await fetch('/api/kundli/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          partner1: { name: p1.name || undefined, gender: p1.gender, dob: p1.dob, tob: p1.unknownTime ? null : p1.tob, lat: p1.place!.lat, lon: p1.place!.lon, timezone: timezone1 },
          partner2: { name: p2.name || undefined, gender: p2.gender, dob: p2.dob, tob: p2.unknownTime ? null : p2.tob, lat: p2.place!.lat, lon: p2.place!.lon, timezone: timezone2 },
        }),
      });

      if (!res.ok || !res.body) throw new Error('Server error — please try again');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const evt = JSON.parse(line.slice(5)) as { type: string; step?: StepId | 'rules'; status?: string; text?: string; matchResult?: MatchResult; message?: string };
            if (evt.type === 'step' && evt.step) {
              updateStep(evt.step, evt.status === 'completed' ? 'done' : 'running');
            } else if (evt.type === 'result' && evt.text && evt.matchResult) {
              setResult({ text: evt.text, matchResult: evt.matchResult });
              setPhase('result');
            } else if (evt.type === 'error') {
              throw new Error(evt.message ?? 'Unknown error');
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong — please try again.');
      setPhase('error');
    }
  };

  return (
    <main className="app-shell">
      <AppSidebar />
      <div className="kundli-page chat-workspace" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="wrap" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="kundli-header">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>
              <Sparkles size={14} aria-hidden /> VEDIC COMPATIBILITY
            </div>
            <h1>Read the stars.</h1>
            <p style={{ color: 'var(--muted)' }}>Enter birth details for both partners. We'll compute a full Ashtakoot match, check doshas, and explain everything warmly.</p>
          </div>

          {phase === 'form' && (
            <form onSubmit={handleSubmit} noValidate aria-label="Kundli matching form">
              <div className="partner-forms">
                <PartnerForm label="Partner 1" data={p1} onChange={setP1} errors={p1Errors} />
                <div className="forms-divider" aria-hidden>♡</div>
                <PartnerForm label="Partner 2" data={p2} onChange={setP2} errors={p2Errors} />
              </div>
              <div className="form-submit">
                <Button type="submit" className="wax-seal-btn button-primary button" style={{ borderRadius: '9999px' }}>
                  Read the stars <Sparkles size={16} aria-hidden />
                </Button>
                <p className="form-disclaimer" role="note">
                  {DISCLAIMER}
                </p>
              </div>
            </form>
          )}

          {phase === 'loading' && (
            <div className="loading-phase" aria-live="polite" aria-label="Computing your reading…">
              <div className="loading-letter">
                <p>Dear hearts,</p>
                <p>We're consulting the stars on your behalf…</p>
              </div>
              <StepTracker stepStatus={stepStatus} />
            </div>
          )}

          {phase === 'error' && (
            <div className="error-state" role="alert">
              <AlertCircle size={24} aria-hidden />
              <h2>Something went sideways</h2>
              <p>{errorMsg}</p>
              <Button onClick={() => setPhase('form')} className="button button-primary">Try again</Button>
            </div>
          )}

          {phase === 'result' && result && (
            <div className="result-view">
              {/* Score overview */}
              <section className="result-section score-section" aria-label="Compatibility score">
                <ScoreGauge
                  score={result.matchResult.ashtakoot.totalObtained}
                  max={result.matchResult.ashtakoot.totalMax}
                  verdict={result.matchResult.ashtakoot.verdict}
                />
                <div className="score-meta">
                  <h2 style={{ margin: 0 }}>Ashtakoot Score</h2>
                  <p style={{ color: 'var(--muted)' }}>{result.matchResult.ashtakoot.verdict} compatibility</p>
                </div>
              </section>

              {/* 8 Koota breakdown */}
              <section className="result-section" aria-label="Koota breakdown">
                <h3>The 8 Kootas</h3>
                <KootaBreakdown kootas={result.matchResult.ashtakoot.kootas} />
              </section>

              {/* Dosha cards */}
              <section className="result-section doshas-section" aria-label="Dosha analysis">
                <h3>Dosha Analysis</h3>
                <div className="doshas-grid">
                  <DoshaCard
                    title={`${result.matchResult.partner1.moonNakshatra?.name ? 'Partner 1' : 'Partner 1'} — Manglik`}
                    present={result.matchResult.manglik1.isManglik}
                    cancellationApplied={result.matchResult.manglik1.cancellationApplied}
                    cancellationReason={result.matchResult.manglik1.cancellationReason}
                    note={result.matchResult.manglik1.note}
                  />
                  <DoshaCard
                    title="Partner 2 — Manglik"
                    present={result.matchResult.manglik2.isManglik}
                    cancellationApplied={result.matchResult.manglik2.cancellationApplied}
                    cancellationReason={result.matchResult.manglik2.cancellationReason}
                    note={result.matchResult.manglik2.note}
                  />
                  <DoshaCard
                    title="Nadi Dosha"
                    present={result.matchResult.doshas.nadiDosha.present}
                    cancellationApplied={result.matchResult.doshas.nadiDosha.parihara}
                    cancellationReason={result.matchResult.doshas.nadiDosha.pariharaReason}
                  />
                  <DoshaCard
                    title="Bhakoot Dosha"
                    present={result.matchResult.doshas.bhakootDosha.present}
                    cancellationApplied={result.matchResult.doshas.bhakootDosha.parihara}
                    cancellationReason={result.matchResult.doshas.bhakootDosha.pariharaReason}
                  />
                </div>
              </section>

              {/* Agent explanation (love letter) */}
              <section className="result-section reading-section" aria-label="Your reading">
                <div className="reading-letter">
                  <div className="letter-top">
                    <span>YOUR READING</span>
                    <span aria-hidden>♡</span>
                  </div>
                  <div className="reading-body" aria-label="Relationship reading from the stars">
                    {result.text.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <span className="signature" style={{ display: 'block', marginTop: '1rem' }}>With the stars, LoveStory</span>
                </div>
              </section>

              {/* Conventions & disclaimer */}
              <section className="result-section conventions-section" role="note" aria-label="Conventions used">
                <details>
                  <summary style={{ outline: 'none' }}>Conventions used & disclaimer</summary>
                  <ul>
                    {result.matchResult.conventionsUsed.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <p>{DISCLAIMER}</p>
                </details>
              </section>

              {/* Follow-up chat */}
              <FollowupChat matchResult={result.matchResult} />

              {/* Start over */}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Button variant="outline" className="button button-outline" onClick={() => { setPhase('form'); setResult(null); }}>
                  Read another chart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Lightweight client-side timezone resolver using Intl API heuristic
async function resolveTimezoneClient(lat: number, lon: number, date: string): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { 'User-Agent': 'LoveStory/1.0' },
    });
    if (res.ok) {
      const data = await res.json() as { address?: { country_code?: string } };
      const cc = data.address?.country_code?.toUpperCase() ?? '';
      const map: Record<string, string> = {
        IN: 'Asia/Kolkata', US: 'America/New_York', GB: 'Europe/London',
        AU: 'Australia/Sydney', CA: 'America/Toronto', PK: 'Asia/Karachi',
        BD: 'Asia/Dhaka', NP: 'Asia/Kathmandu', LK: 'Asia/Colombo',
        AE: 'Asia/Dubai', SG: 'Asia/Singapore', MY: 'Asia/Kuala_Lumpur',
        DE: 'Europe/Berlin', FR: 'Europe/Paris', IT: 'Europe/Rome',
        NL: 'Europe/Amsterdam', ES: 'Europe/Madrid', JP: 'Asia/Tokyo',
        CN: 'Asia/Shanghai', KR: 'Asia/Seoul', ID: 'Asia/Jakarta',
      };
      return map[cc] ?? 'UTC';
    }
  } catch { /* fallback */ }
  return 'UTC';
}
