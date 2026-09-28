import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getDb } from '../../lib/db';
import { astroNodes, astroEdges } from '../../lib/db/schema';
import { embedTexts } from '../../lib/guru/embeddings';

const root = path.resolve('knowledge/kundli');

async function main() {
  const db = getDb();
  
  const nakshatras = JSON.parse(await readFile(path.join(root, 'nakshatras.json'), 'utf-8'));
  const kootaRules = JSON.parse(await readFile(path.join(root, 'koota_rules.json'), 'utf-8'));
  const manglikRules = JSON.parse(await readFile(path.join(root, 'manglik_rules.json'), 'utf-8'));
  const doshaRules = JSON.parse(await readFile(path.join(root, 'dosha_rules.json'), 'utf-8'));

  const nodes: {type: string, name: string, attributes: any, text: string}[] = [];

  // Nakshatras
  for (const n of nakshatras) {
    nodes.push({
      type: 'Nakshatra',
      name: n.name,
      attributes: { lord: n.lord, gana: n.gana, yoni: n.yoni, nadi: n.nadi, rashiIndex: n.rashiIndex, pada: n.pada, startDeg: n.startDeg, endDeg: n.endDeg },
      text: n.text
    });
    // Ensure nodes for Nadi, Gana, Yoni exist
    if (!nodes.find(x => x.name === n.nadi && x.type === 'Concept')) nodes.push({ type: 'Concept', name: n.nadi, attributes: {}, text: `${n.nadi} is a Nadi type used in Kundli matching.` });
    if (!nodes.find(x => x.name === n.gana && x.type === 'Concept')) nodes.push({ type: 'Concept', name: n.gana, attributes: {}, text: `${n.gana} is a Gana type.` });
    if (!nodes.find(x => x.name === n.yoni && x.type === 'Concept')) nodes.push({ type: 'Concept', name: n.yoni, attributes: {}, text: `${n.yoni} is a Yoni type.` });
  }

  // Rashis
  const rashis = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  for (let i = 0; i < rashis.length; i++) {
    nodes.push({ type: 'Rashi', name: rashis[i], attributes: { index: i }, text: `${rashis[i]} is a zodiac sign (Rashi).` });
  }

  for (const [key, rule] of Object.entries(kootaRules)) {
    nodes.push({
      type: 'Koota',
      name: key,
      attributes: { description: (rule as any).description, scoring: (rule as any).scoring },
      text: (rule as any).text
    });
  }

  nodes.push({
    type: 'Dosha',
    name: 'Manglik',
    attributes: { description: manglikRules.description, cancellations: manglikRules.cancellations },
    text: manglikRules.text
  });

  for (const [key, rule] of Object.entries(doshaRules)) {
    nodes.push({
      type: 'Dosha',
      name: key,
      attributes: { description: (rule as any).description, cancellations: (rule as any).cancellations },
      text: (rule as any).text
    });
  }

  console.log('Embedding texts...');
  const embeddings = await embedTexts(nodes.map(n => n.text));

  console.log('Clearing old graph...');
  await db.delete(astroEdges);
  await db.delete(astroNodes);

  console.log('Inserting nodes...');
  const insertedNodes = await db.insert(astroNodes).values(
    nodes.map((n, i) => ({
      ...n,
      embedding: embeddings[i]
    }))
  ).returning({ id: astroNodes.id, name: astroNodes.name, type: astroNodes.type });

  const nodeMap = new Map();
  for (const n of insertedNodes) {
    nodeMap.set(n.name, n.id);
  }

  console.log('Inserting edges...');
  const edges: {fromId: string, toId: string, relation: string, attributes: any}[] = [];
  
  for (const n of nakshatras) {
     const nId = nodeMap.get(n.name);
     const rId = nodeMap.get(rashis[n.rashiIndex]);
     const nadiId = nodeMap.get(n.nadi);
     const ganaId = nodeMap.get(n.gana);
     const yoniId = nodeMap.get(n.yoni);
     
     if (nId && rId) edges.push({ fromId: nId, toId: rId, relation: 'rashi', attributes: {} });
     if (nId && nadiId) edges.push({ fromId: nId, toId: nadiId, relation: 'nadi', attributes: {} });
     if (nId && ganaId) edges.push({ fromId: nId, toId: ganaId, relation: 'gana', attributes: {} });
     if (nId && yoniId) edges.push({ fromId: nId, toId: yoniId, relation: 'yoni', attributes: {} });
  }

  if (edges.length > 0) {
    await db.insert(astroEdges).values(edges);
  }

  console.log(`Ingested ${insertedNodes.length} nodes and ${edges.length} edges.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
