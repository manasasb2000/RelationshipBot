interface ScoreGaugeProps { score: number; max?: number; verdict?: string }

export function ScoreGauge({ score, max = 36, verdict = '' }: ScoreGaugeProps) {
  const pct = Math.min(score / max, 1);
  const r = 44; // radius
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  
  const verdictColor =
    pct >= 0.77 ? 'var(--color-rose, #f43f5e)' :
    pct >= 0.58 ? 'var(--color-gold, #eab308)' :
    pct >= 0.5  ? 'var(--color-muted, #71717a)' :
    'var(--color-text-muted, #a1a1aa)';

  return (
    <div className="score-gauge" role="img" aria-label={`Compatibility score: ${score} out of ${max}. ${verdict}`}>
      <svg viewBox="0 0 100 100" width="140" height="140" aria-hidden>
        {/* Background ring */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-parchment-dark, #e5e5e5)" strokeWidth="8" />
        {/* Filled arc */}
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={verdictColor} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        {/* Heart at center */}
        <text x="50" y="44" textAnchor="middle" fontSize="10" fill={verdictColor}>♡</text>
        {/* Score */}
        <text x="50" y="57" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--color-text, #000)" fontFamily="var(--font-heading)">
          {score}
        </text>
        <text x="50" y="66" textAnchor="middle" fontSize="8" fill="var(--color-text-muted, #a1a1aa)">/ {max}</text>
      </svg>
      {verdict && (
        <p className="verdict-label" style={{ color: verdictColor }}>{verdict}</p>
      )}
    </div>
  );
}
