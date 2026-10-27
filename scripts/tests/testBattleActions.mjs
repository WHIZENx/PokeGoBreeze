#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [battlePage, battleExport, battleSelect, battlePokemonImage] = await Promise.all([
  readFile(new URL('../../src/pages/PVP/Battle/Battle.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/utils/battle-export.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Select.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/BattlePokemonImage.tsx', import.meta.url), 'utf8'),
]);
const battleModel = await readFile(new URL('../../src/pages/PVP/models/battle.model.ts', import.meta.url), 'utf8');

assert.match(
  battlePage,
  /label="Reset Battle"[\s\S]*onClick=\{\(\) => void battleAnimation\(\)\}/,
  'Reset Battle must run the simulator again.'
);
assert.match(
  battlePage,
  /team: playerTeam\.map\(createBattleRequest\)[\s\S]*opponentTeam: opponentTeam\.map\(createBattleRequest\)/,
  'The simulator must submit each side with its independently selected team size.'
);
assert.match(
  battlePage,
  /setPokemonCurrBench\(playerTeam\.slice\(1\)\)[\s\S]*setPokemonObjBench\(opponentTeam\.slice\(1\)\)/,
  'Simulation must preserve unequal player and opponent bench selections.'
);
assert.match(
  battlePage,
  /useState\(-1\)[\s\S]*setTimelineCursor\(-1\)[\s\S]*crossedMarkerCount - 1[\s\S]*setTimelineCursor\(index\)[\s\S]*\.slice\(0, timelineCursor \+ 1\)/,
  'Collapsed team HP bars must follow the current timeline playhead instead of showing the final result early.'
);
assert.match(
  battlePage,
  /if \(index < 0\)[\s\S]*setActiveTeamIndexes\(\{ player: 0, opponent: 0 \}\)[\s\S]*PokemonBattleData\.setValue/,
  'Dragging before the first timeline marker must restore the pre-battle HP and active team state.'
);
assert.match(
  battleSelect,
  /label="Random"[\s\S]*onClick=\{selectRandomPokemon\}/,
  'Each Pokémon selector must expose the Random action beside its label.'
);
assert.match(
  battleSelect,
  /availablePokemon\[Math\.floor\(Math\.random\(\) \* availablePokemon\.length\)\][\s\S]*selectPokemon\(value\)/,
  'Random must select a valid Pokémon through the standard selection flow.'
);
assert.match(
  battleSelect,
  /<SelectCardPokemon[\s\S]*value=\{pokemon \? splitAndCapitalize/,
  'The Pokémon input must stay synchronized with Random selection state.'
);
assert.match(
  battleSelect,
  /const storedPokemon = props\.pokemonBattle\.pokemonData;[\s\S]*setPokemon\(selectedPokemon\);[\s\S]*setFMove\(props\.pokemonBattle\.fMove\);[\s\S]*setCMovePri\(props\.pokemonBattle\.cMovePri\);[\s\S]*setCMoveSec\(props\.pokemonBattle\.cMoveSec\);/,
  'Reopened Pokémon accordions must restore the selected Pokémon and moves from parent state.'
);
assert.match(
  battlePage,
  /label="Clear Battle"[\s\S]*onClick=\{clearBattleResult\}/,
  'Clear Battle must clear the generated timeline.'
);
assert.match(
  battlePage,
  /label="Export Battle"[\s\S]*onClick=\{\(\) => void exportBattle\(\)\}/,
  'Export Battle must generate the battle report.'
);
assert.match(
  battlePage,
  /label="Reset Timeline"/,
  'The playback reset must be clearly distinguished from Reset Battle.'
);
assert.match(battleExport, /export const createBattleEventRows/, 'The export must build a chronological event log.');
for (const content of ['Battle timeline', 'Battle events', 'CP ', 'Level ', 'IV ', 'ATK ', 'DEF ', 'HP ']) {
  assert.ok(battleExport.includes(content), `The battle export must include ${content.trim()}.`);
}
assert.match(battleExport, /getLocalTypeIcon/, 'The battle export must use the shared move type icon assets.');
assert.match(battleModel, /score\?: number;/, 'The selected PvPoke score must remain typed in the battle model.');
assert.match(
  battleExport,
  /scoreBadge:[\s\S]*data\.score[\s\S]*fillRoundedRect[\s\S]*#f8d030/,
  'The battle export must draw the PvPoke score badge after the Pokémon identity.'
);
assert.match(
  battleExport,
  /\['normal', 'shadow', 'purified'\]\.includes/,
  'Normal, Shadow, and Purified labels must be omitted from the Pokémon identity line.'
);
assert.doesNotMatch(
  battleExport,
  /const pokemonModifier/,
  'Shadow and Purified status must be represented by the image icon instead of duplicate identity text.'
);
assert.match(
  battleExport,
  /LocalPokemonGoUi\.shadow[\s\S]*LocalPokemonGoUi\.purified[\s\S]*statusIcons\.get\(pokemon\.pokemonType\)/,
  'The battle export must overlay Shadow and Purified status icons on the Pokémon image.'
);
assert.match(
  battleExport,
  /playerMoveType[\s\S]*opponentMoveType[\s\S]*drawMoveTypeIcon/,
  'Move type icons must be included in the exported battle events.'
);
assert.match(battleExport, /canvas\.toBlob[\s\S]*'image\/png'/, 'The battle report must be exported as a PNG.');
assert.match(
  battlePage,
  /playerImageUrls:[\s\S]*getPokemonModel[\s\S]*getPokemonSqModel[\s\S]*getPokeFullSprite[\s\S]*getPokeFullAsset/,
  'The battle export must provide the complete Pokémon image fallback chain.'
);
assert.match(
  battleExport,
  /for \(const url of[\s\S]*if \(!response\.ok\)[\s\S]*continue/,
  'The battle export must try the next Pokémon image when an asset is unavailable.'
);
assert.match(
  battleExport,
  /getImageData[\s\S]*pixels\[pixel \+ 3\][\s\S]*sourceWidth/,
  'Fallback sprites must be cropped to their visible pixels before drawing.'
);
assert.match(
  battlePokemonImage,
  /getPokemonModel[\s\S]*getPokemonSqModel[\s\S]*getPokeFullSprite[\s\S]*getPokeFullAsset/,
  'Battle images must try the complete remote asset fallback chain.'
);
assert.match(
  battlePokemonImage,
  /sourceIndex >= sources\.length[\s\S]*<PokemonTableIcon/,
  'Battle images must use the local Pokémon icon sheet when every remote asset is unavailable.'
);
assert.match(
  battlePage,
  /renderTeamMemberSummary[\s\S]*<BattlePokemonImage/,
  'Collapsed team summaries must use the shared Pokémon image fallback.'
);

console.log('PVP battle action regression passed.');
