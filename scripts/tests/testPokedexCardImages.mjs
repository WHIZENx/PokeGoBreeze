#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildPokedexCardImageCandidates } from '../../src/utils/pokedex-card-image.ts';

assert.deepEqual(
  buildPokedexCardImageCandidates('go.png', 'profile.png', 'form.png', 'base.png'),
  ['go.png', 'profile.png', 'form.png', 'base.png'],
  'a Pokémon GO asset must remain the default Pokédex card image'
);
assert.deepEqual(
  buildPokedexCardImageCandidates(undefined, 'profile.png', 'form.png', 'base.png'),
  ['profile.png', 'form.png', 'base.png'],
  'a form without a Pokémon GO asset must fall back to its Detail profile image'
);

console.log('Pokédex card image regression tests passed.');
