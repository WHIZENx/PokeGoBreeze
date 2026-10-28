#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  decodeBattleSeed,
  decodeBattleTimelineSeed,
  encodeBattleSeed,
  encodeBattleTimelineSeed,
} from '../../src/pages/PVP/Battle/utils/battle-seed.ts';

const [battlePage, appPage] = await Promise.all([
  readFile(new URL('../../src/pages/PVP/Battle/Battle.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8'),
]);

const pokemon = (speciesId, id, overrides = {}) => ({
  speciesId,
  id,
  form: 'NORMAL',
  pokemonType: 1,
  fastMoveId: 200,
  primaryMoveId: 301,
  secondaryMoveId: 302,
  level: 25.5,
  atkIv: 1,
  defIv: 14,
  staIv: 15,
  energy: 12,
  block: 2,
  chargeSlot: 2,
  disablePrimary: false,
  disableSecondary: false,
  startingHp: 97,
  attackStage: 1,
  defenseStage: -1,
  caughtAt: 1_798_000_000_000,
  ...overrides,
});

const state = {
  league: 1500,
  leagueId: 'DEFAULT_GREAT',
  playerTeam: [
    pokemon('ninetales', 38),
    pokemon('mimikyu_disguised', 778, { form: 'DISGUISED', energy: 45 }),
    pokemon('scizor_shadow', 212, { pokemonType: 2, startingHp: undefined, caughtAt: undefined }),
  ],
  opponentTeam: [pokemon('melmetal', 809), pokemon('palkia', 484, { level: 50, atkIv: 15 })],
  playerStrategy: {
    shield: 'lethal',
    charged: 'bait',
    voluntarySwitch: 'safe',
    forcedSwitch: 'ordered',
    switchOrder: [2, 1, 0],
    undercharge: 75,
    actions: [
      { turn: 12, type: 'charged', moveSlot: 2, undercharge: 50 },
      { turn: 20, type: 'switch', targetIndex: 2 },
    ],
  },
  opponentStrategy: {
    shield: 'never',
    charged: 'farm',
    farmEnergy: 80,
    voluntarySwitch: 'random',
    forcedSwitch: 'highest_energy',
  },
};

const seed = encodeBattleSeed(state);
assert.match(seed, /^\d+$/, 'A battle seed must contain decimal digits only.');
assert.deepEqual(
  decodeBattleSeed(seed),
  state,
  'The numeric seed must restore every team, battle rule, and strategy field.'
);

const corrupted = `${seed.slice(0, -1)}${seed.endsWith('0') ? '1' : '0'}`;
assert.equal(decodeBattleSeed(corrupted), undefined, 'A corrupted seed must fail its checksum.');
assert.equal(decodeBattleSeed('not-a-number'), undefined, 'Non-numeric seeds must be rejected.');
assert.equal(
  decodeBattleSeed('9'.repeat(16_001)),
  undefined,
  'Oversized seeds must be rejected before BigInt parsing.'
);

const timelineState = {
  battle: state,
  randomSeed: 4_294_967_295,
  showTap: true,
  timelineType: 0,
  duration: 2,
  volume: 0.35,
  progress: 0.625,
};
const timelineSeed = encodeBattleTimelineSeed(timelineState);
assert.match(timelineSeed, /^\d+$/, 'A timeline replay seed must contain decimal digits only.');
assert.deepEqual(
  decodeBattleTimelineSeed(timelineSeed),
  timelineState,
  'A timeline seed must restore deterministic simulation, playback options, and playhead progress.'
);
assert.match(
  battlePage,
  /searchParams\.get\('seed'\)[\s\S]*decodedSeed\.playerTeam\.map\(hydrateSeedPokemon\)[\s\S]*decodedSeed\.opponentTeam\.map\(hydrateSeedPokemon\)/,
  'The battle page must hydrate both shared teams from the seed query.'
);
assert.match(
  battlePage,
  /restoredSeedRef\.current = ''[\s\S]*replayStartedRef\.current = ''[\s\S]*replayPositionRef\.current = ''[\s\S]*clearData\(\)/,
  'Reloading battle data must reset seed lifecycle guards so browser Back and Forward can restore the same seed.'
);
assert.doesNotMatch(
  battlePage,
  /decodedSeed\.(showTap|timelineType|duration|volume)/,
  'Shared seeds must not restore timeline display, playback speed, or volume options.'
);
assert.match(
  battlePage,
  /randomSeed,[\s\S]*label="Share Timeline"[\s\S]*shareTimeline\(\)/,
  'Timeline sharing must preserve the deterministic API seed and expose a dedicated action.'
);
assert.match(
  battlePage,
  /decodedTimelineSeed\.progress \* width[\s\S]*PvP Battle Replay[\s\S]*Open in Simulator/,
  'Replay mode must restore the playhead and render a focused media-player page.'
);
assert.match(
  battlePage,
  /PvP Battle Replay[\s\S]*<DismissibleAlert[\s\S]*aria-label="Battle rule details"/,
  'Replay mode must retain the formatted battle-rule details without exposing rule selectors.'
);
assert.match(
  battlePage,
  /renderReplayHpStatus[\s\S]*<LinearProgress[\s\S]*aria-label="Active Pokémon HP"[\s\S]*activeTeamIndexes\.player[\s\S]*activeTeamIndexes\.opponent/,
  'Replay mode must show synchronized HP bars for both active Pokémon above the timeline.'
);
assert.match(
  battlePage,
  /selectedLeagueId === defaultLeagueId\(league\)[\s\S]*Standard[\s\S]*replayMode \? '!tw-mt-4 !tw-mb-5' : '!tw-mt-2'/,
  'Replay headers must format default rule IDs as Standard and separate the rule alert from the player.'
);
assert.match(
  appPage,
  /path="\/pvp\/battle\/:cp\/replay" element=\{<Battle replayMode \/>\}/,
  'Timeline replays must have a dedicated direct-navigation route.'
);
assert.match(
  battlePage,
  /playerStrategy: decodedSeed\.playerStrategy[\s\S]*opponentStrategy: decodedSeed\.opponentStrategy/,
  'The battle page must restore both player strategies.'
);
assert.match(
  battlePage,
  /window\.history\.replaceState[\s\S]*navigator\.share[\s\S]*navigator\.clipboard\.writeText[\s\S]*label="Share Battle"[\s\S]*shareBattle/,
  'Ready battle configurations must expose a copyable, history-safe seed URL.'
);
assert.match(
  battlePage,
  /setSelectedLeagueId\(decodedSeed\.leagueId\)[\s\S]*setLeadExpanded\(\{ player: false, opponent: false \}\)[\s\S]*defaultValue=\{decodedSeed \? undefined : 0\}/,
  'Shared seed links must start with the team accordions collapsed without changing normal page defaults.'
);

console.log(`Validated numeric battle seed round-trip for 3v2 teams (${seed.length} digits).`);
