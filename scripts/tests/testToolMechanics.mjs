#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  encounterProbabilityPercent,
  encounterTimeSeconds,
} from '../../src/pages/Tools/CatchChance/catch-chance-display.ts';
import { pokemonGoAppraisalStars } from '../../src/pages/Tools/FindTable/appraisal.ts';
import { filterBattleModifierMoves } from '../../src/components/Commons/Selects/move-availability.ts';
import {
  availableRaidTiers,
  normalizeRaidSelection,
  normalizeRaidTier,
  raidTierMenuItems,
  SUPER_MEGA_RAID_PROFILE,
} from '../../src/utils/raid-tier.ts';
import {
  displayPokemonGoStat,
  displayPokemonGoStatDifference,
} from '../../src/pages/Tools/CalculateStats/calculate-stats-display.ts';
import { formatBattleStatsPokemonName } from '../../src/pages/Tools/SearchBattle/search-battle-display.ts';
import { pokemonGoBattleHp, pokemonGoStatProduct } from '../../src/utils/pokemon-go-stats.ts';

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
const megaRaidMenuItems = raidTierMenuItems(4, 0, new Set(['RAID_LEVEL_4_MEGA_ENHANCED']));
assert.deepEqual(
  megaRaidMenuItems.filter(({ tier }) => tier === 4).map(({ label }) => label),
  ['Mega Raid (Tier 4)']
);
assert.equal(
  megaRaidMenuItems.find(({ label }) => label === 'Super Mega Raid (Tier 7)')?.value,
  'RAID_LEVEL_4_MEGA_ENHANCED'
);
assert.deepEqual(SUPER_MEGA_RAID_PROFILE, { tier: 7, level: 40, cpm: 0.79, hp: 25_000, timer: 300 });
assert.equal(megaRaidMenuItems.find(({ value }) => value === 'RAID_LEVEL_4_MEGA_ENHANCED')?.tier, 7);
assert.equal(
  normalizeRaidSelection(7, 'RAID_LEVEL_4_MEGA_ENHANCED', 4, 0, new Set(['RAID_LEVEL_4_MEGA_ENHANCED']))?.value,
  'RAID_LEVEL_4_MEGA_ENHANCED'
);
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
assert.equal(pokemonGoBattleHp(132.99), 132);
assert.equal(pokemonGoBattleHp(9.99), 10);
assert.equal(pokemonGoStatProduct(118.05, 121.95, 132.99), 118.05 * 121.95 * 132);
assert.deepEqual(
  filterBattleModifierMoves(modifierMoves, 2).map(({ name }) => name),
  ['TACKLE', 'FRUSTRATION']
);
assert.deepEqual(
  filterBattleModifierMoves(modifierMoves, 3).map(({ name }) => name),
  ['TACKLE', 'RETURN']
);

const [dpsTdoSource, moveSource, searchMovesSource, pokemonSource, counterSource, pokemonFormSource, genderSource] =
  await Promise.all([
    readFile(new URL('../../src/pages/Sheets/DpsTdo/DpsTdo.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Search/Moves/SearchMoves.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Tables/Counter/Counter.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Info/Gender.tsx', import.meta.url), 'utf8'),
  ]);
assert.match(dpsTdoSource, /max=\{maxTrainerFriendshipLevel\(\)\}/);
assert.match(moveSource, /PVE Power \/ Second/);
assert.match(moveSource, /Scaled PVE Power/);
assert.doesNotMatch(searchMovesSource, /name: 'PvE DPS'/);
assert.match(searchMovesSource, /name: 'PvE Power \/ Second'/);
assert.doesNotMatch(pokemonSource, /details\.statsGO\.def \* getDmgMultiplyBonus/);
assert.match(counterSource, /pokemonType: targetPokemonType/);
assert.match(counterSource, /props\.pokemonType \?\? props\.pokemonData\?\.pokemonType/);
assert.match(pokemonFormSource, /pokemonType=\{selectedPokemonType\}/);
assert.match(pokemonFormSource, /const selectedMoveForm = getPokemonFormWithNoneSpecialForm/);
assert.match(pokemonFormSource, /isEqual\(item\.form, selectedMoveForm\)/);
assert.match(pokemonFormSource, /primary: pokeApiSprites \?\? selectedSprites/);
assert.match(pokemonFormSource, /fallback: pokeApiSprites \? selectedSprites : undefined/);
assert.match(genderSource, /setNextPokemonImageFallback\(e\.currentTarget, defaultSpriteCandidates\)/);
assert.match(genderSource, /tw-object-contain/);
assert.match(
  pokemonFormSource,
  /moveData=\{moveRanking\?\.moves \?\? \(props\.isLoadedForms \? unavailablePokemonMoves/
);
assert.match(pokemonFormSource, /<Counter[\s\S]*pokemonData=\{searchingMainDetails\}/);
assert.doesNotMatch(pokemonFormSource, /pokemonData=\{moveRanking \?/);
assert.doesNotMatch(pokemonFormSource, /isLoading=\{!props\.isLoadedForms \|\| !moveRanking\}/);
assert.match(counterSource, /if \(!hasValidCounterTarget\)[\s\S]*setShowFrame\(false\)/);
assert.doesNotMatch(counterSource, /if \(!hasValidCounterTarget\)[\s\S]{0,200}setCounterList\(\[\]\)/);
assert.match(counterSource, /toFloatWithPadding\(row\.dps, 2\).*DPS/s);
assert.match(counterSource, /tw-text-\[var\(--text-secondary\)\]/);

console.log(
  'Tool mechanics regression passed: appraisal IV bands, encounter values, modifier moves, Raid tiers, integer stats, PvP stat products, move-rate labels, Friendship levels, Shadow counters, and Battle League labels are correct.'
);
