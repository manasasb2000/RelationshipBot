import { describe, expect, it, vi } from 'vitest';
import cases from '../fixtures/scope-eval.json';
import { classifyScope } from '@/lib/guru/scope';
import { getCachedReply } from '@/lib/guru/cache';
import { collectUsedCitations, type RetrievedChunk } from '@/lib/guru/rag';

describe('Guru scope classifier', () => {
  it('meets the labeled deterministic evaluation set', async () => {
    const results = await Promise.all(
      cases.map(async (testCase) => ({
        ...testCase,
        actual: (await classifyScope(testCase.text)).label,
      })),
    );
    const correct = results.filter((result) => result.actual === result.label).length;
    const inScope = results.filter((result) => result.label === 'in_scope');
    const falseRefusals = inScope.filter((result) => result.actual !== 'in_scope');
    const mismatches = results
      .filter((result) => result.actual !== result.label)
      .map((result) => `${result.text}: ${result.label} -> ${result.actual}`);
    expect(correct / results.length, mismatches.join('\n')).toBeGreaterThanOrEqual(0.95);
    expect(falseRefusals.length / inScope.length).toBeLessThanOrEqual(0.05);
  });

  it('inherits scope for a short follow-up', async () => {
    const decision = await classifyScope('Why?', [
      { role: 'user', content: 'I keep arguing with my partner' },
    ]);
    expect(decision.label).toBe('in_scope');
  });

  it('does not invoke the fallback classifier for obvious math', async () => {
    const fallback = vi.fn();
    const decision = await classifyScope('8*8', [], fallback);
    expect(decision.label).toBe('out_of_scope');
    expect(fallback).not.toHaveBeenCalled();
  });
});

describe('stable response cache', () => {
  it('normalizes greeting punctuation', () => {
    expect(getCachedReply(' Hey!!! ')?.cached).toBe(true);
  });

  it('does not cache personal questions', () => {
    expect(getCachedReply('Why is my partner avoiding me?')).toBeNull();
  });
});

describe('citation provenance', () => {
  it('only exposes citations that exist in retrieved chunks', () => {
    const chunks: RetrievedChunk[] = [
      {
        chunkId: 'chunk-1',
        content: 'Reference',
        score: 0.9,
        citation: {
          id: 'source-1',
          title: 'Healthy conversations',
          source: 'LoveStory knowledge base',
          license: 'Original',
          chunkId: 'chunk-1',
        },
      },
    ];
    expect(
      collectUsedCitations(['source-1', 'invented'], chunks).map((citation) => citation.id),
    ).toEqual(['source-1']);
  });
});
