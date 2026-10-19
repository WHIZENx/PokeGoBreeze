import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { groupPokemonFormChangesByTarget } from '../../src/utils/form-change.ts';

const pokemon = JSON.parse(await readFile(new URL('../../../api/data/pokemons.json', import.meta.url), 'utf8'));

let routeCount = 0;
let targetCount = 0;
let repeatedTargetCount = 0;

for (const entry of pokemon) {
  const changes = entry.formChange ?? [];
  const grouped = groupPokemonFormChangesByTarget(changes);
  const expectedTargets = new Set(changes.flatMap((change) => change.availableForm));

  routeCount += changes.reduce((count, change) => count + change.availableForm.length, 0);
  targetCount += grouped.length;
  repeatedTargetCount += grouped.filter((target) => target.changes.length > 1).length;

  assert.equal(grouped.length, expectedTargets.size, `${entry.fullName} must render one node per target form`);
  assert.equal(
    grouped.reduce((count, target) => count + target.changes.length, 0),
    changes.reduce((count, change) => count + change.availableForm.length, 0),
    `${entry.fullName} must preserve every Game Master form-change route`
  );
  assert.equal(
    new Set(grouped.map((target) => target.target)).size,
    grouped.length,
    `${entry.fullName} must not render duplicate target identities`
  );
}

for (const [id, source, target] of [
  [888, 'ZACIAN_HERO', 'ZACIAN_CROWNED_SWORD'],
  [889, 'ZAMAZENTA_HERO', 'ZAMAZENTA_CROWNED_SHIELD'],
]) {
  const entry = pokemon.find((candidate) => candidate.num === id && candidate.fullName === source);
  assert.ok(entry, `${source} fixture is required`);
  const grouped = groupPokemonFormChangesByTarget(entry.formChange);
  const crowned = grouped.find((candidate) => candidate.target === target);
  assert.equal(grouped.length, 1, `${source} must render one Crowned target`);
  assert.equal(crowned?.changes.length, 2, `${source} must retain first-unlock and repeat routes`);
  assert.ok(crowned?.changes.some((change) => Number(change.itemCostCount) === 1000));
  assert.ok(crowned?.changes.some((change) => change.requiredBreadMoves?.length));
}

assert.equal(repeatedTargetCount, 2, 'Only Zacian and Zamazenta currently have multiple routes to one target');
console.log(
  `Validated ${routeCount} Game Master form-change routes as ${targetCount} unique target nodes; ` +
    `${repeatedTargetCount} targets retain grouped first-unlock and repeat details.`
);
