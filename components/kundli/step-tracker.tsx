'use client';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'geocoding', label: 'Finding the places' },
  { id: 'timezone', label: 'Aligning time zones' },
  { id: 'charting', label: 'Charting the Moon' },
  { id: 'matching', label: 'Matching the 8 kootas' },
  { id: 'doshas', label: 'Checking doshas' },
  { id: 'writing', label: 'Writing your reading' },
] as const;

export type StepId = typeof STEPS[number]['id'];
export type StepStatus = Record<StepId | 'rules', 'idle' | 'running' | 'done'>;

interface StepTrackerProps { stepStatus: StepStatus }

export function StepTracker({ stepStatus }: StepTrackerProps) {
  return (
    <ol className="step-tracker" aria-label="Progress">
      {STEPS.map((step) => {
        const status = stepStatus[step.id];
        return (
          <li key={step.id} className={`step-item step-${status}`}>
            <span className="step-icon" aria-hidden>
              {status === 'done' ? <Check size={14} /> : status === 'running' ? <Loader2 size={14} className="spin" /> : <span className="step-dot" />}
            </span>
            <span>{step.label}</span>
            <span className="sr-only">{status === 'done' ? '(complete)' : status === 'running' ? '(in progress)' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
