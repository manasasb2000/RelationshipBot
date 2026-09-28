import { describe, it, expect, afterAll } from 'vitest';
import { classifyKundliScope } from '../../lib/agents/kundli/scope';
import evalCases from './scope-eval.json';

type ExpectedLabel = 'in_scope' | 'out_of_scope' | 'crisis' | 'injection' | 'ambiguous';

interface EvalCase {
  id: string;
  input: string;
  expected: ExpectedLabel;
  note?: string;
}

const cases = evalCases as EvalCase[];

// Separate in-scope cases (the false-refusal rate is measured on these)
const inScopeCases = cases.filter((c) => c.expected === 'in_scope');
const otherCases = cases.filter((c) => c.expected !== 'in_scope');

describe('Kundli scope classifier', () => {
  const results: { id: string; expected: ExpectedLabel; got: string; correct: boolean }[] = [];

  it('correctly classifies all cases', async () => {
    for (const c of cases) {
      const decision = await classifyKundliScope(c.input);
      const correct = decision.label === c.expected;
      results.push({ id: c.id, expected: c.expected, got: decision.label, correct });
    }

    const total = results.length;
    const correct = results.filter((r) => r.correct).length;
    const accuracy = correct / total;

    console.log(`\n=== Kundli Scope Eval Results ===`);
    console.log(`Total: ${total} | Correct: ${correct} | Accuracy: ${(accuracy * 100).toFixed(1)}%`);

    const falseRefusals = results.filter(
      (r) => inScopeCases.some((c) => c.id === r.id) && !r.correct,
    );
    const falseRefusalRate = falseRefusals.length / inScopeCases.length;
    console.log(`In-scope cases: ${inScopeCases.length}`);
    console.log(`False refusals: ${falseRefusals.length} (${(falseRefusalRate * 100).toFixed(1)}%)`);

    if (falseRefusals.length > 0) {
      console.log('\nFalse refusals (in-scope cases incorrectly refused):');
      for (const r of falseRefusals) {
        const c = cases.find((x) => x.id === r.id)!;
        console.log(`  ${r.id}: "${c.input}" → got "${r.got}" (note: ${c.note})`);
      }
    }

    const failures = results.filter((r) => !r.correct && !inScopeCases.some((c) => c.id === r.id));
    if (failures.length > 0) {
      console.log('\nOther incorrect classifications:');
      for (const r of failures) {
        const c = cases.find((x) => x.id === r.id)!;
        console.log(`  ${r.id}: "${c.input}" → expected "${r.expected}", got "${r.got}"`);
      }
    }

    // CI gate: false-refusal rate on in-scope cases must not exceed 5%
    expect(falseRefusalRate, `False-refusal rate ${(falseRefusalRate * 100).toFixed(1)}% exceeds 5% threshold`).toBeLessThanOrEqual(0.05);

    // Overall accuracy should be reasonable
    expect(accuracy, `Overall accuracy ${(accuracy * 100).toFixed(1)}% is below 80%`).toBeGreaterThan(0.8);
  });
});

describe('Kundli engine unit tests', () => {
  it.todo('Varna koota scoring table — all 12 × 12 rashi combinations');
  it.todo('Vashya koota scoring table');
  it.todo('Tara koota — auspicious/inauspicious counting');
  it.todo('Yoni koota — natural enemies');
  it.todo('Gana koota — all Deva/Manushya/Rakshasa combinations');
  it.todo('Bhakoot koota — 6/8, 9/5, 12/2 detection');
  it.todo('Nadi koota — same nadi → 0, different → 8');
  it.todo('Graha Maitri — friend/neutral/enemy combinations');
  it.todo('Manglik — Mars in houses 1,2,4,7,8,12');
  it.todo('Manglik cancellation — own sign');
  it.todo('Manglik cancellation — both Manglik');
  it.todo('Nadi dosha — same nakshatra nadi');
  it.todo('Nadi dosha parihara — different nakshatra same nadi');
  it.todo('Bhakoot dosha — 6/8 pattern');
  it.todo('Bhakoot dosha parihara — friendly rashi lords');

  // Golden chart tests — pending until reference values are provided
  // Supply values from Drik Panchang (https://www.drikpanchang.com/kundli/kundli-match.html)
  // or Jagannatha Hora to fill these in.
  it.todo('Golden chart pair 1 — provide reference values from trusted tool');
  it.todo('Golden chart pair 2 — provide reference values from trusted tool');
  it.todo('Golden chart pair 3 — provide reference values from trusted tool');
  it.todo('Golden chart pair 4 — provide reference values from trusted tool');
  it.todo('Golden chart pair 5 — provide reference values from trusted tool');
});
