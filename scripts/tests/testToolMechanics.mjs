#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  encounterProbabilityPercent,
  encounterTimeSeconds,
} from '../../src/pages/Tools/CatchChance/catch-chance-display.ts';
import { pokemonGoAppraisalStars } from '../../src/pages/Tools/FindTable/appraisal.ts';
import { filterBattleModifierMoves } from '../../src/components/Commons/Selects/move-availability.ts';
import { availableRaidTiers, normalizeRaidTier } from '../../src/utils/raid-tier.ts';
import {
  displayPokemonGoStat,
  displayPokemonGoStatDifference,
} from '../../src/pages/Tools/CalculateStats/calculate-stats-display.ts';
import { formatBattleStatsPokemonName } from '../../src/pages/Tools/SearchBattle/search-battle-display.ts';

const ivsWithTotal = (total) => ({
  atk: Math.min(total, 15),
  def: Math.min(Math.max(total - 15, 0), 15),
  sta: Math.max(total - 30, 0),
});
const expectedRanges = [
  [0, 22, 0],
  [23, 29, 1],
  [30, 36, 2],
  [37, 44, 3],
  [45, 45, 4],
];

for (const [minimum, maximum, stars] of expectedRanges) {
  for (let total = minimum; total <= maximum; total += 1) {
    assert.equal(pokemonGoAppraisalStars(ivsWithTotal(total)), stars, `IV total ${total} appraisal mismatch`);
  }
}

assert.equal(encounterProbabilityPercent(0.15, 0.2, false), 15);
assert.equal(encounterProbabilityPercent(0.15, 0.2, true), 20);
assert.equal(encounterProbabilityPercent(0.15, 0, true), 0);
assert.equal(encounterProbabilityPercent(0.15, undefined, true), 15);
assert.equal(encounterTimeSeconds(29), 29);
assert.equal(encounterTimeSeconds(1), 1);

const modifierMoves = [
  { name: 'TACKLE', moveType: 0 },
  { name: 'FRUSTRATION', moveType: 1 },
  { name: 'RETURN', moveType: 2 },
];
assert.deepEqual(
  filterBattleModifierMoves(modifierMoves, 1).map(({ name }) => name),
  ['TACKLE']
);

assert.deepEqual(availableRaidTiers(1), [1, 3, 5, 2, 4]);
assert.deepEqual(availableRaidTiers(4), [4]);
assert.deepEqual(availableRaidTiers(4, 1), [6]);
assert.deepEqual(availableRaidTiers(5, 1), [6]);
assert.equal(normalizeRaidTier(1, 4), 4);
assert.equal(normalizeRaidTier(5, 5, 1), 6);
assert.equal(displayPokemonGoStat(118.99), 118);
assert.equal(displayPokemonGoStat(128), 128);
assert.equal(displayPokemonGoStat(undefined), '-');
assert.equal(displayPokemonGoStatDifference(115.08, 19.18, 'increase'), 20);
assert.equal(displayPokemonGoStatDifference(80.2, 8.91, 'decrease'), 9);
assert.equal(displayPokemonGoStatDifference(undefined, undefined, 'increase'), 0);
assert.equal(formatBattleStatsPokemonName('BULBASAUR', 'NORMAL'), 'Bulbasaur');
assert.equal(formatBattleStatsPokemonName('DUDUNSPARCE', 'ORDINARY'), 'Dudunsparce');
assert.equal(formatBattleStatsPokemonName('SLOWBRO', 'GALARIAN'), 'Slowbro Galarian');
assert.equal(formatBattleStatsPokemonName('MEOWSTIC_FEMALE', 'FEMALE'), 'Meowstic Female');
assert.deepEqual(
  filterBattleModifierMoves(modifierMoves, 2).map(({ name }) => name),
  ['TACKLE', 'FRUSTRATION']
);
assert.deepEqual(
  filterBattleModifierMoves(modifierMoves, 3).map(({ name }) => name),
  ['TACKLE', 'RETURN']
);

console.log(
  'Tool mechanics regression passed: appraisal IV bands, encounter values, modifier moves, Raid tiers, integer stats, and Battle League labels are correct.'
);
