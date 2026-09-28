import { describe, expect, it } from 'vitest';
import { assembleContext } from '@/lib/guru/context';
import { reciprocalRankFusion, type RetrievedChunk } from '@/lib/guru/rag';

function chunk(id: string, score: number): RetrievedChunk {
  return {
    chunkId: id,
    content: `content ${id}`,
    score,
    citation: {
      id: `kb-${id}`,
      title: id,
      source: 'test',
      license: 'Original',
      chunkId: id,
    },
  };
}

describe('hybrid retrieval', () => {
  it('rewards chunks returned by both dense and keyword search', () => {
    const result = reciprocalRankFusion([
      [chunk('dense-only', 0.9), chunk('both', 0.8)],
      [chunk('both', 1), chunk('keyword-only', 0.8)],
    ]);
    expect(result[0].chunkId).toBe('both');
  });

  it('assembles memory before references and trims oversized sections', () => {
    const context = assembleContext({
      memories: {
        procedural: ['Use a gentle tone'],
        semantic: ['user partner_name Sam'],
        longTerm: ['User values direct communication'],
        episodic: ['Discussed conflict repair last week'],
      },
      chunks: [chunk('reference', 1)],
    });
    expect(context.indexOf('PROCEDURAL MEMORY')).toBeLessThan(
      context.indexOf('REFERENCE MATERIAL'),
    );
    expect(context).toContain('[kb-reference]');
  });
});
