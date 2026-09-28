import 'dotenv/config';
import cases from '../tests/fixtures/rag-eval.json';

async function main() {
  const { retrieveKnowledge } = await import('../lib/guru/rag');
  let hits = 0;
  let reciprocalRanks = 0;
  for (const testCase of cases) {
    const results = await retrieveKnowledge(testCase.query);
    const rank = results.findIndex((result) => result.citation.source === testCase.source) + 1;
    if (rank) {
      hits += 1;
      reciprocalRanks += 1 / rank;
    }
    console.log(`${rank ? 'PASS' : 'MISS'} ${testCase.query} ${rank ? `rank=${rank}` : ''}`);
  }
  console.log(
    `hit@6=${(hits / cases.length).toFixed(3)} MRR=${(reciprocalRanks / cases.length).toFixed(3)}`,
  );
  process.exit(hits === cases.length ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
