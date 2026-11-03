#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  typePage,
  attacker,
  defender,
  matchupMatrix,
  weatherPage,
  weatherAffect,
  weatherEffect,
  weatherOverview,
  typeEffective,
  quickTypeSelect,
  quickWeatherSelect,
  selectType,
] = await Promise.all([
  readFile(new URL('../../src/pages/TypeEffect/TypeEffect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/TypeEffect/Attacker.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/TypeEffect/Defender.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/TypeEffect/TypeMatchupMatrix.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Weather/Weather.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Weather/Affect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Weather/Effect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Weather/WeatherOverview.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Effective/TypeEffective.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Effective/QuickTypeSelect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Effective/QuickWeatherSelect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Selects/SelectType.tsx', import.meta.url), 'utf8'),
]);

for (const [pageName, source] of [
  ['Type Effectiveness', typePage],
  ['Weather Boosts', weatherPage],
]) {
  assert.match(
    source,
    /components\/Info\/PokemonDetailLayout\.scss/,
    `${pageName} must consume the shared detail section layout`
  );
  assert.match(
    source,
    /tw-grid tw-grid-cols-1 tw-gap-4 xl:tw-grid-cols-2/,
    `${pageName} must use one mobile column and two desktop columns`
  );
  assert.doesNotMatch(source, /className="(?:row|col(?:\s|"))/, `${pageName} must not use the legacy row/col layout`);
  assert.doesNotMatch(source, /tw-w-3\/4|<hr/, `${pageName} must not retain legacy fixed-width section separators`);
}

for (const [sectionName, source] of [
  ['attacker', attacker],
  ['defender', defender],
  ['weather condition', weatherAffect],
  ['Pokémon types', weatherEffect],
]) {
  assert.match(
    source,
    /<section className="pokemon-detail-section[^\"]*"/,
    `${sectionName} must use a shared section card`
  );
  assert.match(source, /!tw-overflow-visible/, `${sectionName} must not clip its type or weather selector menu`);
  assert.match(source, /<h4 className="info-title">/, `${sectionName} must use the shared section heading`);
}

for (const source of [attacker, defender]) {
  assert.match(source, /variant="summary"/, 'Type Effectiveness sections must use the modern summary presentation');
  assert.match(source, /compactLayout/, 'half-width Type Effectiveness cards must use the compact summary grid');
  assert.match(source, /showCounts/, 'Type Effectiveness sections must show data-derived matchup counts');
}

assert.match(typeEffective, /props\.compactLayout/, 'Type Effectiveness must support compact card composition');
assert.match(typeEffective, /type-effect-summary-counts/, 'Type Effectiveness must render matchup summary counts');
assert.match(typePage, /<TypeMatchupMatrix \/>/, 'Type Effectiveness must include the complete matchup matrix');
assert.match(matchupMatrix, /getTypeEffective\(\)/, 'the matchup matrix must consume generated Game Master options');
assert.doesNotMatch(matchupMatrix, /1\.6|0\.625|0\.390625/, 'the matchup matrix must not hardcode GO multipliers');
assert.match(attacker, /<QuickTypeSelect/, 'attacker selection must offer direct type icon actions');
assert.match(defender, /<DualTypeQuickSelect/, 'defender selection must offer direct actions for both type slots');
assert.match(quickTypeSelect, /aria-pressed=\{selected\}/, 'quick type actions must expose their selected state');
assert.match(weatherAffect, /<QuickWeatherSelect/, 'weather selection must offer direct weather icon actions');
assert.match(weatherEffect, /<DualTypeQuickSelect/, 'weather type selection must offer direct actions for both slots');
assert.match(quickWeatherSelect, /aria-pressed=\{selected\}/, 'quick weather actions must expose their selected state');
assert.match(weatherPage, /<WeatherOverview \/>/, 'Weather Boosts must include the all-weather overview');
assert.match(weatherOverview, /getWeatherBoost\(\)/, 'all-weather overview must consume generated Game Master options');
assert.match(selectType, /tw-w-full tw-max-w-\[300px\]/, 'type selectors must fit narrow cards and mobile viewports');

console.log('Type Effectiveness and Weather Boosts shared layout regression tests passed.');
