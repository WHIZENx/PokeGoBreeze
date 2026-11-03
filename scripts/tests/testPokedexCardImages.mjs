#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildPokedexCardImageCandidates,
  getPokedexCardRequestedImage,
} from '../../src/utils/pokedex-card-image.ts';
import { hasPokemon256AssetFallback } from '../../src/utils/pokemon-asset-url.ts';

assert.deepEqual(
  buildPokedexCardImageCandidates('go.png', 'profile.png', 'form.png', 'base.png'),
  ['go.png', 'profile.png', 'form.png', 'base.png'],
  'a Pokémon GO asset must remain the default Pokédex card image'
);

assert(hasPokemon256AssetFallback('/pm25.fGIGANTAMAX.icon'), 'GMAX default assets must be recognized');
assert(hasPokemon256AssetFallback('/pm25.fGIGANTAMAX.s.icon'), 'GMAX Shiny assets must be recognized');
assert(hasPokemon256AssetFallback('/pm150.fMEGA_X.icon'), 'Mega X default assets must be recognized');
assert(hasPokemon256AssetFallback('/pm150.fMEGA_X.s.icon'), 'Mega X Shiny assets must be recognized');
assert(hasPokemon256AssetFallback('/pm150.fMEGA_Y.icon'), 'Mega Y default assets must be recognized');
assert(hasPokemon256AssetFallback('/pm150.fMEGA_Y.s.icon'), 'Mega Y Shiny assets must be recognized');
assert(!hasPokemon256AssetFallback('/pm25.icon'), 'ordinary assets must keep their original fallback behavior');
assert.deepEqual(
  buildPokedexCardImageCandidates('normal-path.png', 'gmax-256.png', 'profile.png'),
  ['normal-path.png', 'gmax-256.png', 'profile.png'],
  'GMAX and Mega cards must try the normal path before the 256x256 fallback'
);

const mewtwoMegaX = {
  default: 'pm150.fMEGA_X.icon.png',
  shiny: 'pm150.fMEGA_X.s.icon.png',
};
const mewtwoMegaY = {
  default: 'pm150.fMEGA_Y.icon.png',
  shiny: 'pm150.fMEGA_Y.s.icon.png',
};
assert.equal(
  getPokedexCardRequestedImage(mewtwoMegaX, true),
  mewtwoMegaX.shiny,
  'Mewtwo Mega X must request its matching Shiny asset'
);
assert.equal(
  getPokedexCardRequestedImage(mewtwoMegaY, false),
  mewtwoMegaY.default,
  'Mewtwo Mega Y must restore its matching default asset'
);

const pikachuGmax = {
  default: 'pm25.fGIGANTAMAX.icon.png',
  shiny: 'pm25.fGIGANTAMAX.s.icon.png',
};
assert.equal(
  getPokedexCardRequestedImage(pikachuGmax, true),
  pikachuGmax.shiny,
  'the Shiny control must request the exact matching GMAX Shiny asset'
);
assert.equal(
  getPokedexCardRequestedImage(pikachuGmax, false),
  pikachuGmax.default,
  'leaving the Shiny control must restore the exact default GMAX asset'
);
assert.equal(
  getPokedexCardRequestedImage({ default: 'pm1.icon.png' }, true),
  'pm1.icon.png',
  'forms without a Shiny asset must retain their default image'
);

const cardSource = await readFile(new URL('../../src/components/Card/CardPokemonInfo.tsx', import.meta.url), 'utf8');
assert.match(
  cardSource,
  /key=\{requestedImage\}/,
  'switching between default and Shiny images must reset the failed-image fallback state'
);
assert.match(
  cardSource,
  /showShiny \? \(props\.image\.shinyFallbacks \?\? \[\]\) : \[\]/,
  'Shiny GMAX and Mega failures must try the matching Shiny fallback before any default image'
);
assert.deepEqual(
  buildPokedexCardImageCandidates(undefined, 'profile.png', 'form.png', 'base.png'),
  ['profile.png', 'form.png', 'base.png'],
  'a form without a Pokémon GO asset must fall back to its Detail profile image'
);

console.log('Pokédex card image regression tests passed.');
