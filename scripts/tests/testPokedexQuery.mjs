#!/usr/bin/env node

import assert from 'node:assert/strict';
import { serializePokedexSelection } from '../../src/utils/pokedex-query.ts';

const generations = [0, 1, 2];
assert.equal(
  serializePokedexSelection(generations, generations, (value) => value + 1),
  undefined,
  'selecting every generation must not exclude a future API generation'
);
assert.equal(
  serializePokedexSelection([0, 2], generations, (value) => value + 1),
  '1,3',
  'a partial generation selection must remain an explicit filter'
);

const versions = ['Pokémon GO', 'Mega Dimension'];
assert.equal(
  serializePokedexSelection(versions, versions, (value) => value),
  undefined,
  'selecting every known version must not exclude a newly catalogued form'
);
assert.equal(
  serializePokedexSelection(['Mega Dimension'], versions, (value) => value),
  'Mega Dimension',
  'a partial version selection must remain an explicit filter'
);

console.log('Pokédex query regression tests passed.');
