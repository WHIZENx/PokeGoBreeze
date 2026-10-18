#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { serializePokedexSelection } from '../../src/utils/pokedex-query.ts';
import { pokemonSearchOptionId } from '../../src/pages/Search/Pokemon/pokemon-search-navigation.ts';
import {
  toolPokemonOptionId,
} from '../../src/components/Find/find-navigation.ts';
import {
  getPokemonKeyboardIndex,
  getScrollTopToReveal,
} from '../../src/utils/pokemon-keyboard-navigation.ts';
import {
  getViewportPrefetchThreshold,
  isNearScrollEnd,
  shouldPreventScrollChaining,
} from '../../src/utils/scroll.ts';

const generations = [0, 1, 2];
assert.equal(pokemonSearchOptionId(448), 'pokemon-card-448');
assert.equal(toolPokemonOptionId('r1', 448), 'tool-pokemon-r1-448');
assert.equal(getPokemonKeyboardIndex(3, 0, 1), 1);
assert.equal(getPokemonKeyboardIndex(3, 2, 1), 2, 'keyboard navigation must stop at the last result');
assert.equal(getPokemonKeyboardIndex(3, 0, -1), 0, 'keyboard navigation must stop at the first result');
assert.equal(getPokemonKeyboardIndex(3, -1, 1), 0);
assert.equal(getPokemonKeyboardIndex(3, -1, -1), 2);
assert.equal(getScrollTopToReveal(100, 20, 220, -30, 20), 50);
assert.equal(getScrollTopToReveal(100, 20, 220, 220, 270), 150);
assert.equal(getScrollTopToReveal(100, 20, 220, 70, 120), 100);
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

const pokemonSearchViewport = { scrollTop: 3900, clientHeight: 570, scrollHeight: 5000 };
assert.equal(getViewportPrefetchThreshold(pokemonSearchViewport), 570);
assert.equal(
  isNearScrollEnd(pokemonSearchViewport, getViewportPrefetchThreshold(pokemonSearchViewport)),
  true,
  'remote Pokémon Search must prefetch one viewport before the end'
);
assert.equal(
  isNearScrollEnd({ ...pokemonSearchViewport, scrollTop: 3700 }, getViewportPrefetchThreshold(pokemonSearchViewport)),
  false,
  'remote Pokémon Search must not fetch too early'
);
assert.equal(shouldPreventScrollChaining({ scrollTop: 0, clientHeight: 570, scrollHeight: 5000 }, -1), true);
assert.equal(shouldPreventScrollChaining({ scrollTop: 2000, clientHeight: 570, scrollHeight: 5000 }, 1), false);
assert.equal(shouldPreventScrollChaining({ scrollTop: 4430, clientHeight: 570, scrollHeight: 5000 }, 1), true);
assert.equal(shouldPreventScrollChaining({ scrollTop: 0, clientHeight: 570, scrollHeight: 570 }, 1), true);

const [pokemonSearchSource, pokemonSelectSource, toolPokemonSearchSource, customStyleSource] = await Promise.all([
  readFile(new URL('../../src/pages/Search/Pokemon/Search.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Selects/SelectCardPokemon.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Find/Find.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/assets/styles/custom.scss', import.meta.url), 'utf8'),
]);
assert.match(pokemonSearchSource, /getOptionId=\{\(pokemon\) => pokemonSearchOptionId\(pokemon\.num\)\}/);
assert.match(pokemonSearchSource, /behavior: 'auto'/);
assert.match(pokemonSearchSource, /searchResults\.findIndex\(\(pokemon\) => pokemon\.num === selectId\)/);
assert.match(pokemonSearchSource, /resultsContainerRef=\{resultsContainerRef\}/);
assert.doesNotMatch(pokemonSearchSource, /inputRef\.current\?\.blur\(\)/);
assert.match(pokemonSelectSource, /id=\{props\.getOptionId\?\.\(value\)\}/);
assert.match(pokemonSelectSource, /props\.resultsContainerRef \?\? internalResultsContainerRef/);
assert.match(pokemonSelectSource, /'aria-activedescendant': activeDescendantId/);
assert.match(pokemonSelectSource, /className=\{props\.onIsSelectedPokemon\?\.\(value\) \? 'selected' : undefined\}/);
assert.match(pokemonSelectSource, /document\.getElementById\(activeDescendantId\)/);
assert.match(pokemonSelectSource, /isKeyboardNavigating \? 'keyboard-navigation' : ''/);
assert.match(pokemonSelectSource, /event\.key === 'ArrowUp' \|\| event\.key === 'ArrowDown'/);
assert.match(toolPokemonSearchSource, /onKeyDown=\{handlePokemonKeyDown\}/);
assert.match(toolPokemonSearchSource, /event\.key === 'Enter'/);
assert.match(toolPokemonSearchSource, /event\.key !== 'ArrowUp' && event\.key !== 'ArrowDown'/);
assert.match(toolPokemonSearchSource, /'aria-activedescendant': toolPokemonOptionId\(instanceId, activePokemonId\)/);
assert.doesNotMatch(
  toolPokemonSearchSource,
  /onMouseOver=\{\(\) => setActivePokemonId/,
  'hover must not replace the selected keyboard-navigation anchor'
);
assert.match(toolPokemonSearchSource, /onMouseMove=\{\(\) => setIsKeyboardNavigating\(false\)\}/);
assert.match(customStyleSource, /\.result\.keyboard-navigation/);
assert.match(customStyleSource, /\.card-pokemon:hover:not\(\.selected\)/);

console.log('Pokédex query regression tests passed.');
