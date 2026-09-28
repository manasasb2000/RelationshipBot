'use client';
import { PlaceAutocomplete } from './place-autocomplete';
import type { PlaceResult } from './place-autocomplete'; // adjust if needed

export type PartnerData = {
  name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;       // YYYY-MM-DD
  tob: string;       // HH:MM, or ''
  unknownTime: boolean;
  place: { name: string; displayName: string; lat: number; lon: number } | null;
};

interface PartnerFormProps {
  label: 'Partner 1' | 'Partner 2';
  data: PartnerData;
  onChange: (data: PartnerData) => void;
  errors?: Partial<Record<keyof PartnerData, string>>;
}

export function PartnerForm({ label, data, onChange, errors }: PartnerFormProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="partner-form-scroll" aria-label={`${label} birth details`}>
      <div className="scroll-header">
        <span className="scroll-label">{label}</span>
        <div className="scroll-ornament" aria-hidden>✦</div>
      </div>
      <div className="scroll-body">
        {/* Name */}
        <div className="form-field">
          <label htmlFor={`name-${label.replace(/\s+/g, '-')}`}>Name <span>(optional)</span></label>
          <input
            id={`name-${label.replace(/\s+/g, '-')}`}
            type="text"
            value={data.name}
            onChange={e => onChange({ ...data, name: e.target.value })}
            placeholder="Their name…"
            maxLength={80}
          />
        </div>

        {/* Gender */}
        <div className="form-field">
          <label htmlFor={`gender-${label.replace(/\s+/g, '-')}`}>Gender</label>
          <select
            id={`gender-${label.replace(/\s+/g, '-')}`}
            value={data.gender}
            onChange={e => onChange({ ...data, gender: e.target.value as PartnerData['gender'] })}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other / Prefer not to say</option>
          </select>
          {errors?.gender && <p className="field-error" role="alert">{errors.gender}</p>}
        </div>

        {/* Date of birth */}
        <div className="form-field">
          <label htmlFor={`dob-${label.replace(/\s+/g, '-')}`}>Date of birth</label>
          <input
            id={`dob-${label.replace(/\s+/g, '-')}`}
            type="date"
            max={today}
            value={data.dob}
            onChange={e => onChange({ ...data, dob: e.target.value })}
          />
          {errors?.dob && <p className="field-error" role="alert">{errors.dob}</p>}
        </div>

        {/* Time of birth */}
        <div className="form-field">
          <label htmlFor={`tob-${label.replace(/\s+/g, '-')}`}>
            Time of birth
            {data.unknownTime && (
              <span className="field-badge-warn">Reduced accuracy</span>
            )}
          </label>
          <input
            id={`tob-${label.replace(/\s+/g, '-')}`}
            type="time"
            value={data.tob}
            disabled={data.unknownTime}
            onChange={e => onChange({ ...data, tob: e.target.value })}
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={data.unknownTime}
              onChange={e => onChange({ ...data, unknownTime: e.target.checked, tob: e.target.checked ? '' : data.tob })}
            />
            I don't know the exact time
          </label>
          {data.unknownTime && (
            <p className="field-hint-warn" role="note">
              Without birth time, Manglik dosha and Lagna accuracy will be reduced.
            </p>
          )}
        </div>

        {/* Place of birth */}
        <PlaceAutocomplete
          label="Place of birth"
          value={data.place}
          onChange={place => onChange({ ...data, place })}
          error={errors?.place}
        />
      </div>
    </div>
  );
}
