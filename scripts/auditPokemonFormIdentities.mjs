#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  deduplicatePokemonFormSelections,
  pokemonGoFormIdentityKey,
  pokemonGoFormIdentityPriority,
  selectPreferredPokemonGoFormIdentity,
} from '../src/utils/pokemon-form-identity.ts';

const duplicateSelectionFixture = [
  [
    { form: { name: 'raticate-alola-shadow', formName: 'alola-shadow', pokemonType: 2 } },
    { form: { name: 'raticate-alola-purified', formName: 'alola-purified', pokemonType: 3 } },
  ],
  [
    { form: { name: 'raticate-alola-shadow', formName: 'alola-shadow', pokemonType: 2 } },
    { form: { name: 'raticate-alola-purified', formName: 'alola-purified', pokemonType: 3 } },
  ],
];
assert.deepEqual(
  deduplicatePokemonFormSelections(duplicateSelectionFixture).flat(),
  duplicateSelectionFixture[0],
  'Exact Shadow/Purified form selections must be deduplicated across variety groups'
);

const pokemons = JSON.parse(await readFile(resolve(import.meta.dirname, '../../api/data/pokemons.json'), 'utf8'));
const groups = new Map();

pokemons.forEach((pokemon) => {
  const key = pokemonGoFormIdentityKey(pokemon);
  const group = groups.get(key) ?? [];
  group.push(pokemon);
  groups.set(key, group);
});

const collisions = [...groups.entries()].filter(([, group]) => group.length > 1);
const ambiguous = [];

collisions.forEach(([key, group]) => {
  const priorities = group.map(pokemonGoFormIdentityPriority);
  const highestPriority = Math.max(...priorities);
  const preferred = group.filter((_, index) => priorities[index] === highestPriority);
  if (preferred.length !== 1) {
    ambiguous.push({ key, forms: group.map((pokemon) => pokemon.form), highestPriority });
  }
  const selected = selectPreferredPokemonGoFormIdentity(group);
  assert.equal(selected?.fullName, preferred[0]?.fullName, `Preferred fullName mismatch for ${key}`);
  assert.equal(selected?.form, preferred[0]?.form, `Preferred form mismatch for ${key}`);
  assert.equal(
    Boolean(selected?.releasedGO),
    group.some((pokemon) => pokemon.releasedGO),
    `Released state was not preserved for ${key}`
  );
});

assert.deepEqual(ambiguous, [], `Ambiguous alias-equivalent GO forms: ${JSON.stringify(ambiguous)}`);
const expectedCollisionKeys = [
  '664:0:ICY_SNOW',
  '665:0:ICY_SNOW',
  '741:0:POMPOM',
  '801:0:ORIGINAL_COLOR',
  '875:0:ICE',
  '877:0:FULL_BELLY',
  '888:0:CROWNED_SWORD',
  '889:0:CROWNED_SHIELD',
  '898:0:ICE_RIDER',
  '898:0:SHADOW_RIDER',
  '925:0:FAMILY_OF_FOUR',
  '931:0:GREEN',
  '964:0:ZERO',
  '978:0:CURLY',
  '982:0:TWO',
  '1007:0:APEX_BUILD',
  '1008:0:ULTIMATE_MODE',
  '1012:0:COUNTERFEIT',
  '1013:0:UNREMARKABLE',
];
assert.deepEqual(
  collisions.map(([key]) => key).sort(),
  expectedCollisionKeys.sort(),
  'The known GO form alias-collision set changed'
);

const affectedSpecies = [...new Set(collisions.flatMap(([, group]) => group.map((pokemon) => pokemon.num)))];
console.log(
  `Pokémon form identity audit passed: ${pokemons.length} GO rows across ` +
    `${new Set(pokemons.map((pokemon) => pokemon.num)).size} species; ` +
    `${collisions.length} alias-collision groups resolved across IDs ${affectedSpecies.join(', ')}.`
);
