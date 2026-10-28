#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  battlePage,
  battleExport,
  battleSelect,
  battlePokemonImage,
  timeline,
  timelineFit,
  timelineVertical,
  timelineTeamEvent,
] = await Promise.all([
  readFile(new URL('../../src/pages/PVP/Battle/Battle.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/utils/battle-export.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Select.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/BattlePokemonImage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Timeline/Timeline.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Timeline/TimelineFit.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Timeline/TimelineVertical.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/PVP/Battle/Timeline/TimelineTeamEvent.tsx', import.meta.url), 'utf8'),
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
  /useRef<PokemonStatRefs\[\]>\(\[\]\)[\s\S]*benchRefs\[benchIndex\] \?\?= createPokemonStatRefs\(\)/,
  'Dynamic team members must receive stable form refs without a fixed bench-slot array.'
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
  battlePage,
  /tw-w-16 tw-shrink-0 tw-text-right tw-text-caption tw-tabular-nums[\s\S]*\{hp\}\/\{maxHp\}/,
  'Collapsed accordion HP labels must reserve a fixed width so two- and three-digit values keep equal bars.'
);
assert.match(
  battlePage,
  /isTimelineTeamMemberActive[\s\S]*timelineCursor >= 0[\s\S]*activeTeamIndexes\.opponent[\s\S]*activeTeamIndexes\.player/,
  'Timeline playback must derive the active accordion independently for both battle sides.'
);
assert.match(
  battlePage,
  /timelineActiveAccordionSx[\s\S]*borderColor: active[\s\S]*var\(--primary-main\)[\s\S]*MuiAccordionSummary-root[\s\S]*backgroundColor: 'action.selected'/,
  'The active battle accordion must receive a theme-aware highlighted border and summary background.'
);
assert.match(
  battlePage,
  /borderColor: active[\s\S]*boxShadow: active[\s\S]*280ms ease-out[\s\S]*background-color 280ms ease-out[\s\S]*prefers-reduced-motion: reduce/,
  'Active Pokémon highlights must cross-fade smoothly between accordions while respecting reduced motion.'
);
assert.match(
  battlePage,
  /sxHeader: timelineActiveAccordionSx\(isOpponent, 0\)[\s\S]*sxHeader: timelineActiveAccordionSx\(isOpponent, index \+ 1\)/,
  'Lead and bench Pokémon accordions must both support timeline active highlighting.'
);
assert.match(
  battlePage,
  /pokemon\.pokemonData \? 'tw-break-words' : 'tw-whitespace-nowrap'/,
  'Empty team-slot labels must keep their number on the same line.'
);
assert.match(
  battlePage,
  /const maxPvpTeamSize = 3[\s\S]*bench\.length < maxPvpTeamSize - 1[\s\S]*label="Add Pokémon"/,
  'Dynamic teams must remain capped at the real three-Pokémon PvP party size.'
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
  /label="Clear Battle"[\s\S]*clearBattleResult\(\);[\s\S]*focusBattleTimeline\(\);/,
  'Clear Battle must clear the generated timeline and return focus to it.'
);
assert.match(
  battlePage,
  /label="Export Battle"[\s\S]*onClick=\{\(\) => void exportBattle\(\)\}/,
  'Export Battle must generate the battle report.'
);
assert.match(
  battlePage,
  /label="Reset Timeline"[\s\S]*resetTimeline\(\);[\s\S]*focusBattleTimeline\(\);/,
  'The playback reset must be clearly distinguished and return focus to the timeline.'
);
assert.match(
  battlePage,
  /inputLabel="Speed"[\s\S]*tw-mt-3 tw-flex tw-justify-center tw-gap-x-2 lg:tw-mt-0[\s\S]*label=\{playState \? 'Stop' : 'Play'\}/,
  'Mobile timeline playback buttons must keep vertical space below the wrapped Speed controls.'
);
assert.match(
  battlePage,
  /md:!tw-grid md:tw-grid-cols-2 2xl:tw-grid-cols-4[\s\S]*tw-order-1[\s\S]*md:tw-col-span-2 2xl:tw-order-2[\s\S]*tw-order-2[\s\S]*2xl:tw-order-3/,
  'Tablet-width battle layouts must place both teams side by side and give the timeline a full row until the four-column desktop breakpoint.'
);
assert.match(
  battlePage,
  /focusBattleTimeline[\s\S]*focus\(\{ preventScroll: true \}\)[\s\S]*scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/,
  'Battle actions must smoothly align the timeline anchor to the top and move keyboard focus to it.'
);
assert.match(
  battlePage,
  /setPokemonObjBenchExpanded\(opponentBenchExpanded\);[\s\S]*focusBattleTimeline\(\);/,
  'Battle Simulator and Reset Battle must focus the rendered timeline after a successful simulation.'
);
assert.match(
  battlePage,
  /renderStrategyButton\('Player Strategy', 'playerStrategy',[\s\S]*renderStrategyButton\('Opponent Strategy', 'opponentStrategy',[\s\S]*label="Battle Simulator"/,
  'Compact strategy buttons must stay grouped with the battle simulation actions instead of timeline playback controls.'
);
assert.match(
  battlePage,
  /const strategySummary[\s\S]*Shield always[\s\S]*After faint:[\s\S]*scripted action[\s\S]*aria-haspopup="dialog"/,
  'Each strategy button must summarize the active decisions before opening its editor.'
);
assert.match(
  battlePage,
  /<DialogMui[\s\S]*open=\{strategyDialog !== undefined\}[\s\S]*width="md"[\s\S]*renderStrategy\([\s\S]*actions=\{\[\{ label: 'Done', isClose: true \}\]\}/,
  'Strategy options must open in one responsive dialog and retain the existing editor controls.'
);
assert.match(
  battlePage,
  /inputLabel="Shield"[\s\S]*inputLabel="Charged Attack"[\s\S]*inputLabel="Voluntary Switch"[\s\S]*inputLabel="Forced Switch"[\s\S]*label="Add Action"/,
  'The simulator must expose shield, charged, voluntary/forced switch, and manual action strategies.'
);
assert.match(
  battlePage,
  /const teamOrderOptions = \(teamSize:[\s\S]*const canSwitch = teamSize > 1[\s\S]*canSwitch && strategy\.forcedSwitch === 'ordered'[\s\S]*menuItems=\{orderOptions\}/,
  'Team Order must derive its permutations from the current team size and stay hidden for a one-Pokémon team.'
);
assert.match(
  battlePage,
  /strategyForTeam\(playerStrategy, playerTeam\.length\)[\s\S]*strategyForTeam\(opponentStrategy, opponentTeam\.length\)/,
  'Battle requests must remove stale switch actions and indexes when a team becomes smaller.'
);
assert.match(
  battlePage,
  /<DismissibleAlert[\s\S]*resetKey=\{selectedLeagueId\}[\s\S]*aria-label="Battle rule details"[\s\S]*<SpeedIcon[\s\S]*<GroupsIcon[\s\S]*<ContentCopyIcon[\s\S]*<AutoAwesomeIcon[\s\S]*<ScheduleIcon[\s\S]*<CategoryIcon[\s\S]*renderRulePokemonList\(ruleConditions\?\.whiteList \?\? \[\]\)[\s\S]*renderRulePokemonList\(ruleConditions\?\.banned \?\? \[\]\)/,
  'Every selected Battle rule must expose dismissible details for its supported restrictions.'
);
assert.match(
  battlePage,
  /const renderRulePokemonList[\s\S]*<PokemonTableIcon[\s\S]*rulePokemonName/,
  'Allowed and banned Pokémon must render an icon before each Pokémon name.'
);
assert.match(
  battlePage,
  /aria-label="Allowed Pokémon"[\s\S]*renderRulePokemonList\(ruleConditions\?\.whiteList \?\? \[\]\)[\s\S]*aria-label="Banned Pokémon"[\s\S]*renderRulePokemonList\(ruleConditions\?\.banned \?\? \[\]\)/,
  'Allowed and banned status icons must stay aligned with their wrapping Pokémon lists.'
);
assert.match(
  battlePage,
  /label="Farm until energy"[\s\S]*farmEnergy:[\s\S]*Move 1 · 25%[\s\S]*Move 2 · 25%/,
  'Farm thresholds and undercharge strength must remain configurable.'
);
assert.match(
  battlePage,
  /leagueId: selectedLeagueId,[\s\S]*playerStrategy,[\s\S]*opponentStrategy,/,
  'Battle requests must include league identity and both server-side strategy definitions.'
);
assert.match(
  battlePage,
  /response\.data\.meta\.warnings[\s\S]*warning\.message[\s\S]*showSnackbar\(warningMessages\.join\(' '\), 'warning'\)/,
  'Unavailable simulator selections must complete the battle and surface API reasons as warning snackbars.'
);
for (const leagueId of ['DEFAULT_LITTLE', 'DEFAULT_GREAT', 'DEFAULT_ULTRA', 'DEFAULT_MASTER']) {
  assert.match(battlePage, new RegExp(leagueId), `The battle page must map the ${leagueId} standard league.`);
}
assert.match(
  timeline,
  /data-timeline-lane="switch"[\s\S]*<TimelineTeamEvent/,
  'Team Switch and Faint events must render in a dedicated timeline lane.'
);
for (const content of [timeline, timelineFit]) {
  assert.match(
    content,
    /value\.type === AttackType\.Switch[\s\S]*className="wait-attack"/,
    'The move-marker lane must retain an empty timing anchor for Switch events.'
  );
}
assert.match(
  timelineTeamEvent,
  /data-timeline-event=\{isSwitch \? 'switch' : 'faint'\}[\s\S]*ArrowRightAltIcon[\s\S]*renderPokemonIcon\(target\)/,
  'Switch events must show the source and target Pokémon icons, while Faint events remain identifiable.'
);
assert.match(timelineTeamEvent, /<PokemonTableIcon/, 'Timeline team events must use the shared Pokémon icons.');
assert.match(
  timelineVertical,
  /<PokemonTableIcon[\s\S]*renderActionLabel[\s\S]*<TimelineTeamEvent/,
  'Vertical timeline move badges must identify the active Pokémon and preserve switch icon events.'
);
assert.doesNotMatch(
  timelineVertical,
  /Switch to \{splitAndCapitalize/,
  'Vertical timeline switches must use Pokémon icons instead of a text-only target name.'
);
assert.match(
  timelineVertical,
  /resultClasses =[\s\S]*tw-h-12[\s\S]*tw-justify-center/,
  'Vertical timeline WIN, LOSE, and TIE results must share the same fixed alignment and height.'
);
assert.doesNotMatch(
  timelineVertical,
  /AttackType\.Charge[\s\S]*value\.type === AttackType\.Block \?[\s\S]*wait-attack-container/,
  'A Charged Attack response turn must not render an extra Wait row that offsets WIN and LOSE.'
);
assert.match(
  timelineVertical,
  /turnRowClasses[\s\S]*tw-min-h-24[\s\S]*tw-border-t[\s\S]*tw-border-\[var\(--custom-table-background-sub-head-border\)\][\s\S]*data-timeline-turn/,
  'Every vertical timeline turn must use one equal-height row with a full-width divider.'
);
assert.match(
  timelineVertical,
  /timelineLength = Math\.max\([\s\S]*tw-grid tw-grid-cols-2[\s\S]*Array\.from\(\{ length: timelineLength \}[\s\S]*renderTimelineEntry\([\s\S]*pokemonCurr\.timeline\.at\(index\)[\s\S]*renderTimelineEntry\([\s\S]*pokemonObj\.timeline\.at\(index\)/,
  'Both sides of each vertical timeline turn must share one CSS grid row so variable badge heights cannot offset later dividers.'
);
assert.match(
  timelineVertical,
  /AttackType\.Block[\s\S]*renderPokemonIcon[\s\S]*AttackType\.Fast[\s\S]*renderActionLabel[\s\S]*AttackType\.Charge[\s\S]*renderActionLabel/,
  'Shield, Fast Attack, and Charged Attack badges must identify their active Pokémon.'
);
assert.match(
  timelineVertical,
  /renderTapBadge[\s\S]*!end && value\.isTap && renderTapBadge\(\)[\s\S]*end && value\.isTap && renderTapBadge\(\)/,
  'Tap badges must occupy their own inline space before player actions and after opponent actions.'
);
assert.doesNotMatch(
  timelineVertical,
  /MuiBadge-badge/,
  'Vertical timeline Tap badges must not overlay action content.'
);
assert.match(
  timelineTeamEvent,
  /faintedIndex[\s\S]*AttackType\.Dead[\s\S]*<CloseIcon/,
  'Fainted Pokémon must be marked with a red close icon in the shared team-event lane.'
);
assert.match(
  timelineTeamEvent,
  /entry\.type === AttackType\.Switch \|\| entry\.switchedFromIndex !== undefined/,
  'Zero-turn post-Charged switches must remain visible in the dedicated team-event lane.'
);
assert.match(
  timelineFit,
  /value\.switchedFromIndex !== undefined[\s\S]*<TimelineTeamEvent/,
  'Fit Timeline must render zero-turn switches without replacing the incoming Pokémon action.'
);
assert.match(
  timelineFit,
  /data-timeline-event-lane=\{eventType\}[\s\S]*eventType=\{eventType\}[\s\S]*renderTeamEventLane\('faint'\)[\s\S]*renderTeamEventLane\('switch'\)/,
  'Fit Timeline must separate Faint and Switch markers so simultaneous team events cannot overlap.'
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
  /playerTeamImageUrls: playerTeam\.map\(getBattleExportImageUrls\)[\s\S]*opponentTeamImageUrls: opponentTeam\.map\(getBattleExportImageUrls\)/,
  'The battle export must provide image fallback chains for every Pokémon on both teams.'
);
assert.match(
  battlePage,
  /getBattleExportImageUrls[\s\S]*getPokemonModel[\s\S]*getPokemonSqModel[\s\S]*getPokeFullSprite[\s\S]*getPokeFullAsset/,
  'Every exported team member must use the complete Pokémon image fallback chain.'
);
assert.match(
  battleExport,
  /getTeamMemberFinalHp[\s\S]*playerTeam\.forEach[\s\S]*opponentTeam\.forEach/,
  'The report must draw every team member with their final HP state.'
);
assert.match(
  battleExport,
  /playerPokemon:[\s\S]*activeIndex[\s\S]*opponentPokemon:[\s\S]*activeIndex/,
  'Multi-Pokémon battle events must identify the active Pokémon on each side.'
);
assert.match(
  battleExport,
  /switchedFromIndex[\s\S]*switchedFromPokemonName[\s\S]*Fast:/,
  'The battle export must preserve a zero-turn switch alongside the action taken in the same turn.'
);
assert.match(
  battleExport,
  /drawTeamEventLane[\s\S]*AttackType\.Switch[\s\S]*faintedIndex[\s\S]*drawTeamTimelinePokemon/,
  'The exported timeline must draw Pokémon switch and faint markers in a dedicated team-event lane.'
);
assert.match(
  battleExport,
  /playerTeamEventY[\s\S]*playerImages[\s\S]*opponentTeamEventY[\s\S]*opponentImages/,
  'The exported player and opponent timelines must use their complete team images for switch and faint events.'
);
assert.match(
  battleExport,
  /pokego-team-battle-\$\{playerTeam\.length\}v\$\{opponentTeam\.length\}-\$\{playerName\}-vs-\$\{opponentName\}\.png/,
  'Multi-Pokémon exports must use a distinct team-battle filename containing both team sizes.'
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
