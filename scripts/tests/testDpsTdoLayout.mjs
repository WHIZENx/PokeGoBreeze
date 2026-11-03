#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../../src/pages/Sheets/DpsTdo/DpsTdo.tsx', import.meta.url), 'utf8');

for (const testId of [
  'dps-tdo-page',
  'dps-tdo-type-filters',
  'dps-tdo-filters-section',
  'dps-tdo-options-section',
  'dps-tdo-results-section',
]) {
  assert.match(source, new RegExp(`data-testid="${testId}"`), `missing DPS/TDO section: ${testId}`);
}

assert.doesNotMatch(
  source,
  /components\/Info\/PokemonDetailLayout\.scss/,
  'DPS/TDO must retain its original page-specific presentation'
);
assert.match(source, /row tw-w-full !tw-m-0/, 'filters and calculation options must retain the original row layout');
assert.match(source, /2xl:tw-flex-1 !tw-p-0/, 'desktop controls must retain the original equal-width columns');
assert.match(
  source,
  /className="tw-relative" data-testid="dps-tdo-page"/,
  'DPS/TDO must retain its original full-width page root'
);
assert.match(source, /Pokémon GO Attacker Analysis/, 'page title must describe the attacker-analysis workflow');
assert.doesNotMatch(source, /TrendingUpIcon|dps-tdo-header/, 'the redesigned header must not return');
assert.match(source, /className="head-types"/, 'the original compact section headers must remain');
assert.doesNotMatch(source, />DPS &amp; TDO Sheets</, 'legacy spreadsheet-style page title must not return');
assert.ok(
  source.indexOf('dps-tdo-type-filters') < source.indexOf('dps-tdo-filters-section') &&
    source.indexOf('dps-tdo-options-section') < source.indexOf('dps-tdo-results-section'),
  'DPS/TDO sections must keep filters and options before results'
);
assert.match(source, /APIService\.getDpsTdo\(/, 'DPS/TDO calculations must remain API-owned');
assert.match(source, /paginationServer[\s\S]*?sortServer/, 'results must preserve server pagination and sorting');
assert.match(
  source,
  /<SelectPokemon[\s\S]*?<SelectCardMove/,
  'defender and move matchup controls must remain available'
);
assert.match(source, /label="Calculate"/, 'the explicit calculation action must remain available');
for (const label of [
  'Fast &amp; Charged Move Types \\(Both Must Match\\)',
  'Exact match',
  'Include',
  'Show only \\(match any\\)',
  'Elite, Special & Exclusive Moves',
  'Gigantamax',
  'Best moveset per Pokémon',
  'Rank by',
  'DPS³ × TDO',
  'Additional Move Delay',
  'Fast Move Delay \\(s\\)',
  'Charged Move Delay \\(s\\)',
  'Pokémon Level',
  'Fallback Target Defense',
  'Extreme \\(No Boost\\)',
  'Sunny / Clear',
  'Friendship Attack Bonus',
]) {
  assert.match(source, new RegExp(label), `missing mechanics-accurate label: ${label}`);
}
for (const legacyLabel of [
  'Filter Moves by Type',
  'Filter show',
  'Filter only by',
  'DPS\\^3\\*TDO',
  'DEF Target',
  'Weather Boosts',
  'Friendship Level:',
]) {
  assert.doesNotMatch(source, new RegExp(legacyLabel), `ambiguous legacy label must not return: ${legacyLabel}`);
}
assert.match(
  source,
  /checked=\{enableDelay\}[\s\S]*?disabled=\{Boolean\(dataTargetPokemon\)\}/,
  'additional delay must be disabled when an exact defender supplies battle timing'
);
assert.match(
  source,
  /labelPrepend="Fallback Target Defense"[\s\S]*?disabled=\{Boolean\(dataTargetPokemon\)\}/,
  'fallback defense must be disabled when an exact defender supplies defense'
);
assert.match(
  source,
  /setSubmittedCalculation\(createSubmittedCalculation\(filters, options\)\)/,
  'Calculate must submit the complete calculation-options snapshot'
);
const requestSource = source.slice(
  source.indexOf('APIService.getDpsTdo({'),
  source.indexOf('requestVersion,', source.indexOf('APIService.getDpsTdo({'))
);
for (const submittedField of [
  'ivAtk',
  'ivDef',
  'ivHp',
  'pokemonLevel',
  'pokemonDefObj',
  'delayF',
  'delayC',
  'weatherBoosts',
  'isTrainerFriend',
  'pokemonFriendLevel',
]) {
  assert.match(
    requestSource,
    new RegExp(`submittedCalculation\\.${submittedField}`),
    `API request must use submitted ${submittedField} instead of draft input state`
  );
}
assert.doesNotMatch(requestSource, /delayF: options\.delay|weather: weatherBoosts|level: pokemonLevel/);

console.log('DPS/TDO layout regression tests passed.');
