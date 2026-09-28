interface DoshaCardProps {
  title: string;
  present: boolean;
  cancellationApplied?: boolean;
  cancellationReason?: string | null;
  note?: string;
}

export function DoshaCard({ title, present, cancellationApplied, cancellationReason, note }: DoshaCardProps) {
  const status = !present ? 'clear' : cancellationApplied ? 'cancelled' : 'present';
  return (
    <div className={`dosha-card dosha-${status}`} aria-label={`${title}: ${status}`}>
      <div className="dosha-header">
        <span className="dosha-icon" aria-hidden>{status === 'clear' ? '✓' : status === 'cancelled' ? '◎' : '△'}</span>
        <strong>{title}</strong>
        <span className={`dosha-badge ${status}`}>
          {status === 'clear' ? 'Clear' : status === 'cancelled' ? 'Cancelled' : 'Present'}
        </span>
      </div>
      {cancellationReason && (
        <p className="dosha-reason">Cancellation: {cancellationReason}</p>
      )}
      {note && <p className="dosha-note">{note}</p>}
    </div>
  );
}
