#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  pokemonGoFormIdentityKey,
  pokemonGoFormIdentityPriority,
  selectPreferredPokemonGoFormIdentity,
} from '../src/utils/pokemon-form-identity.ts';

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
  assert.equal(
    selectPreferredPokemonGoFormIdentity(group),
    preferred[0],
    `Preferred form resolution mismatch for ${key}`
  );
});

assert.deepEqual(ambiguous, [], `Ambiguous alias-equivalent GO forms: ${JSON.stringify(ambiguous)}`);
assert.ok(
  collisions.some(([key]) => key === '889:0:CROWNED_SHIELD'),
  'Expected the Zamazenta CROWNED/CROWNED_SHIELD regression case'
);

const affectedSpecies = [...new Set(collisions.flatMap(([, group]) => group.map((pokemon) => pokemon.num)))];
console.log(
  `Pokémon form identity audit passed: ${pokemons.length} GO rows across ` +
    `${new Set(pokemons.map((pokemon) => pokemon.num)).size} species; ` +
    `${collisions.length} alias-collision groups resolved across IDs ${affectedSpecies.join(', ')}.`
);
