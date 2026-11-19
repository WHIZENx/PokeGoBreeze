#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildPokemonFormCatalog, deduplicatePokemonForms } from '../../../api/src/pokemon/forms.ts';
import { findPokemonGoFormIdentityMatch, pokemonGoFormIdentityKey } from '../../src/utils/pokemon-form-identity.ts';
import {
  buildPokemonDetailImageCandidates,
  findPokemonDetailGoForm,
  findPokemonDetailMoveRanking,
} from '../../src/utils/pokemon-detail-presentation.ts';
import { applyPokemonGoFormIdentity, hasPokemonCounterStats } from '../../src/utils/pokemon-detail-form.ts';
import { resolvePokemonForm } from '../../src/utils/pokemon-form-resolution.ts';

const pokemons = JSON.parse(await readFile(resolve(import.meta.dirname, '../../../api/data/pokemons.json'), 'utf8'));
const canonicalForms = JSON.parse(
  await readFile(resolve(import.meta.dirname, '../../../api/src/generator/data/pokeapi-forms.json'), 'utf8')
).forms;
const counterOptions = JSON.parse(
  await readFile(resolve(import.meta.dirname, '../../../api/data/options.json'), 'utf8')
);
const generatedForms = deduplicatePokemonForms(pokemons);
const detailForms = buildPokemonFormCatalog(generatedForms);
const formsById = new Map();
const generatedFormsById = new Map();

detailForms.forEach((pokemon) => {
  const forms = formsById.get(pokemon.num) ?? [];
  forms.push(pokemon);
  formsById.set(pokemon.num, forms);
});
generatedForms.forEach((pokemon) => {
  const forms = generatedFormsById.get(pokemon.num) ?? [];
  forms.push(pokemon);
  generatedFormsById.set(pokemon.num, forms);
});

assert.equal(
  new Set(detailForms.map(pokemonGoFormIdentityKey)).size,
  detailForms.length,
  'The shared detail catalog must contain one row per normalized form/modifier identity'
);

let moveMatches = 0;
let imageMatches = 0;
let counterTargets = 0;
for (const selection of detailForms) {
  const identity = pokemonGoFormIdentityKey(selection);
  const siblingForms = formsById.get(selection.num) ?? [];
  const goForm = findPokemonDetailGoForm(siblingForms, selection);
  assert(goForm, `Shared GO detail resolver missed ${identity}`);
  assert.equal(pokemonGoFormIdentityKey(goForm), identity, `Shared GO detail resolver crossed identity ${identity}`);

  const moveFixtures = siblingForms.map((pokemon) => ({
    ...pokemon,
    moves: { identity: pokemonGoFormIdentityKey(pokemon) },
    bestMoves: { identity: pokemonGoFormIdentityKey(pokemon) },
  }));
  const moveRanking = findPokemonDetailMoveRanking(moveFixtures, selection);
  assert(moveRanking, `Shared move resolver missed ${identity}`);
  assert.equal(
    pokemonGoFormIdentityKey(moveRanking),
    identity,
    `Shared move resolver returned another form/modifier for ${identity}`
  );
  assert.equal(moveRanking.moves.identity, identity, `Move List identity drifted for ${identity}`);
  assert.equal(moveRanking.bestMoves.identity, identity, `Best Moves identity drifted for ${identity}`);
  moveMatches += 1;

  const candidates = buildPokemonDetailImageCandidates({
    pokemonGoImage: `go/${identity}`,
    preferredImage: `canonical/${identity}`,
    officialImage: `official/${selection.num}`,
    hybridImage: `hybrid/${identity}`,
    fullAssetImage: `fallback/${selection.num}`,
  });
  assert.deepEqual(
    candidates,
    [
      `go/${identity}`,
      `canonical/${identity}`,
      `official/${selection.num}`,
      `hybrid/${identity}`,
      `fallback/${selection.num}`,
    ],
    `Shared profile-image fallback order drifted for ${identity}`
  );
  imageMatches += 1;

  const mappedSelection = applyPokemonGoFormIdentity({}, selection);
  const counterTarget = resolvePokemonForm(
    generatedFormsById.get(selection.num) ?? [],
    mappedSelection.pokemonGoForm,
    selection.pokemonType
  );
  assert(counterTarget, `Counter target resolver missed ${identity}`);
  assert(
    hasPokemonCounterStats(counterTarget),
    `Counter target is missing generated GO Defense or typing for ${identity}`
  );
  assert(
    counterTarget.statsGO.def <= 1000,
    `Counter target Defense exceeds the API contract for ${identity}: ${counterTarget.statsGO.def}`
  );
  assert(
    counterTarget.types.length > 0 && counterTarget.types.length <= 2,
    `Counter target must have one or two types for ${identity}`
  );
  assert(
    counterTarget.types.every((type) => counterOptions.typeEffective[type.toLowerCase()]),
    `Counter target contains an unsupported type for ${identity}: ${counterTarget.types.join(',')}`
  );
  assert(
    Number.isInteger(selection.pokemonType ?? 0) &&
      (selection.pokemonType ?? 0) >= 0 &&
      (selection.pokemonType ?? 0) <= 6,
    `Counter target contains an unsupported battle modifier for ${identity}: ${selection.pokemonType}`
  );
  for (const releasedGO of [true, false]) {
    assert.equal(
      hasPokemonCounterStats({ ...counterTarget, releasedGO, asset: undefined }),
      true,
      `Counter readiness must be independent of release and assets for ${identity}`
    );
  }
  counterTargets += 1;
}

const goIdentityWithoutOrdinaryType = (pokemon) => pokemonGoFormIdentityKey(pokemon).replace(/^([^:]+):[01]:/, '$1:');
const goIdentityKeys = new Set(detailForms.map(goIdentityWithoutOrdinaryType));
const mappedCanonicalForms = canonicalForms.filter((pokemon) =>
  goIdentityKeys.has(goIdentityWithoutOrdinaryType(pokemon))
);

for (const canonicalForm of mappedCanonicalForms) {
  const selection = findPokemonGoFormIdentityMatch(formsById.get(canonicalForm.num), canonicalForm);
  assert(
    selection,
    `Canonical/GO alias failed to reach the shared detail pipeline for ${canonicalForm.num}:${canonicalForm.form}`
  );
  assert(
    findPokemonDetailGoForm(formsById.get(canonicalForm.num), canonicalForm),
    `Shared route resolver rejected canonical alias ${canonicalForm.num}:${canonicalForm.form}`
  );
  const mappedSelection = applyPokemonGoFormIdentity({}, selection);
  const counterTarget = resolvePokemonForm(
    generatedFormsById.get(canonicalForm.num) ?? [],
    mappedSelection.pokemonGoForm,
    selection.pokemonType
  );
  assert(
    counterTarget && hasPokemonCounterStats(counterTarget),
    `Canonical form failed to hydrate a Counter target for ${canonicalForm.num}:${canonicalForm.form}`
  );
}

const [pokemonPage, statsRankingPage, formComponent] = await Promise.all([
  readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Sheets/StatsRanking/StatsRanking.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
]);

for (const [route, source] of [
  ['Pokémon Details', pokemonPage],
  ['Stats Ranking', statsRankingPage],
]) {
  assert.match(
    source,
    /findPokemonDetailGoForm\(/,
    `${route} must resolve the selected generated form through the shared detail pipeline`
  );
  assert.match(
    source,
    /buildPokemonDetailImageCandidates\(/,
    `${route} must use the shared ordered profile-image candidates`
  );
}
assert.match(formComponent, /findPokemonDetailMoveRanking\(/, 'Pokémon Details must use the shared move resolver');
assert.match(statsRankingPage, /findPokemonDetailMoveRanking\(/, 'Stats Ranking must use the shared move resolver');

console.log(
  `Pokémon detail route parity passed: ${detailForms.length} GO form/modifier selections across ${formsById.size} species, ${counterTargets} Counter targets, ${moveMatches} Move/Best Move identities, ${imageMatches} ordered image chains, and ${mappedCanonicalForms.length} canonical aliases.`
);
