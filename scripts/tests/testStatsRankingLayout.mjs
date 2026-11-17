#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [statsRankingSource, pokemonSource, moveTableSource, statBarSource, sharedLayoutStyles, pokemonStyles] =
  await Promise.all([
    readFile(new URL('../../src/pages/Sheets/StatsRanking/StatsRanking.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Tables/Move/MoveTable.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Progress/StatBar.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Info/PokemonDetailLayout.scss', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/Pokemon.scss', import.meta.url), 'utf8'),
  ]);

for (const [page, source] of [
  ['Pokémon Details', pokemonSource],
  ['Stats Ranking', statsRankingSource],
]) {
  assert.match(
    source,
    /components\/Info\/PokemonDetailLayout\.scss/,
    `${page} must consume the shared Pokémon detail section layout`
  );
}

assert.match(
  statsRankingSource,
  /pokemon-detail-section pokemon-detail-hero-section/,
  'Stats Ranking must use the same hero card as Pokémon Details'
);
assert.match(
  statsRankingSource,
  /className="pokemon-detail-table table-stats-ranking"/,
  'Stats Ranking Pokémon metadata must use the shared detail table sizing'
);
for (const testId of ['stats-ranking-stats-section', 'stats-ranking-battle-section', 'stats-ranking-table-section']) {
  assert.match(statsRankingSource, new RegExp(`data-testid="${testId}"`), `missing shared section: ${testId}`);
}
assert.match(
  statsRankingSource,
  /pokemon-profile-aura--\$\{profileModifier\}/,
  'Stats Ranking must preserve the shared Shadow and Purified profile treatment'
);
assert.match(
  statsRankingSource,
  /pokemon-detail-sections tw-grid tw-gap-4 xl:tw-grid-cols-2/,
  'desktop Stats Ranking must place two detail sections in each grid row'
);
assert.match(
  statsRankingSource,
  /pokemon-detail-section xl:tw-col-span-2/,
  'the ranking table must retain the full desktop content width'
);
assert.match(
  statsRankingSource,
  /const defaultPerPages = 20;[\s\S]*paginationRowsPerPageOptions=\{\[20, 50, 100\]\}/,
  'Stats Ranking pagination must default to 20 rows and offer 20, 50, and 100 in ascending order'
);
assert.match(
  statsRankingSource,
  /if \(locate && data\.selected\) \{[\s\S]*applySelection\(data\.selected\);/,
  'Stats Ranking must apply a server-selected Pokémon while resolving an explicit deep link'
);
assert.match(
  statsRankingSource,
  /else if \(!paramId && !hasSelectedPokemonRef\.current\) \{[\s\S]*const initialRow = data\.data\[0\];[\s\S]*applySelection\(initialRow\)/,
  'A bare Stats Ranking route must select its first result once without replacing selection on pagination.'
);
assert.match(
  statsRankingSource,
  /const applySelection = \(row: IPokemonStatsRanking\) => \{\s*hasSelectedPokemonRef\.current = true;/,
  'Both initial and explicit selections must prevent later page results from selecting another Pokémon.'
);
assert.doesNotMatch(
  statsRankingSource,
  /applySelection\(data\.data\[0\]\)/,
  'Stats Ranking pagination must not automatically select the first row of each page'
);
assert.match(
  statsRankingSource,
  /<h4 className="info-title tw-relative tw-pb-1">[\s\S]*<TableLoadingProgress loading=\{loading\} label="Loading Stats rankings" \/>[\s\S]*<CustomDataTable[\s\S]*data=\{rows\}/,
  'Stats Ranking must show table loading progress below its header while preserving the current rows'
);
assert.match(
  statsRankingSource,
  /aria-busy=\{loading\}[\s\S]*noDataComponent=\{loading \? <div aria-hidden="true" className="tw-h-24" \/> : undefined\}/,
  'Stats Ranking must reserve an empty initial-loading area without replacing the table'
);
assert.doesNotMatch(
  statsRankingSource,
  /BackdropMui|CircularProgressTable|progressPending|progressComponent/,
  'Stats Ranking must not cover or replace its table with an overlay, spinner, or skeleton while loading'
);
assert.match(statsRankingSource, /compactLayout/, 'the half-width Battle data card must request compact move layout');
assert.match(
  statsRankingSource,
  /onStatSelect=\{selectStatRanking\}/,
  'each Stats bar must select its corresponding Stats Ranking table data'
);
assert.match(
  statsRankingSource,
  /rankingTableRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/,
  'selecting a Stats bar must scroll the selected ranking into view'
);
assert.match(
  statsRankingSource,
  /applyPokemonSelectionParams\(next, select\)/,
  'Stats bar selection must preserve the current Pokémon and form'
);
assert.doesNotMatch(
  statsRankingSource,
  /<Stats[\s\S]*?isDisabled[\s\S]*?<\/StableHeightSection>/,
  'Stats Ranking must not disable navigation on its Stats bars'
);
assert.match(
  statBarSource,
  /onStatSelect\(statType\)/,
  'Stats bars must delegate in-page ranking selection when provided'
);
assert.match(
  statBarSource,
  /navigateToTop\([\s\S]*?\/stats-ranking\?/,
  'Stats bars outside Stats Ranking must retain their existing navigation fallback'
);
assert.match(
  moveTableSource,
  /props\.compactLayout \? 'md:tw-col-span-2' : ''/,
  'compact Max Moves must span both move columns'
);
assert.match(
  moveTableSource,
  /data-testid="best-moves-loading-row"[\s\S]*?!tw-top-\[70px\][\s\S]*?<TableLoadingProgress[\s\S]*?label=\{`Loading Best Moves/,
  'Best Moves List must expose loading progress below its column sub-header.'
);
for (const label of ['Loading Fast Moves', 'Loading Charged Moves', 'Loading Max Moves']) {
  assert.match(
    moveTableSource,
    new RegExp(`<th className="table-sub-header">[\\s\\S]*?<TableLoadingProgress[^>]*label="${label}"`),
    `${label} progress must render in its table sub-header.`
  );
}
assert.doesNotMatch(
  moveTableSource,
  /tw-top-12[\s\S]*<TableLoadingProgress/,
  'Move loading progress must not remain beneath the tabs.'
);
assert.match(
  moveTableSource,
  /const move = \(hasFreshMoveData \? props\.rankMoveData : cachedRankMoveData\.current\)[\s\S]*const moveOrigin = hasFreshMoveData \? props\.moveData : cachedMoveData\.current/,
  'Move tables must retain the last coherent move datasets while the progress bar is active.'
);
assert.match(
  moveTableSource,
  /const latestMoveTableSnapshots = new Map<string, MoveTableSnapshot>\(\)[\s\S]*initialSnapshotRef = useRef\(latestMoveTableSnapshots\.get\(cacheScope\)\)/,
  'Move List and Best Moves must retain their latest coherent snapshot across Pokémon Detail remounts.'
);
assert.match(
  moveTableSource,
  /const hasFreshMoveData = Boolean\(!isLoading && props\.moveData && props\.rankMoveData\)/,
  'Move snapshots must not accept stale props as fresh while the next target is loading.'
);
assert.match(
  moveTableSource,
  /data-testid="move-tables-stale-interaction-guard"/,
  'Retained Move List and Best Moves rows must not accept interactions while loading replacements.'
);
assert.doesNotMatch(
  moveTableSource,
  /Skeleton|slide-container/,
  'Move table loading must not replace or cover retained rows with a skeleton.'
);
assert.match(sharedLayoutStyles, /\.pokemon-detail-section \{/, 'shared detail card styling must remain centralized');
assert.match(
  sharedLayoutStyles,
  /\.pokemon-profile-aura--shadow \.pokemon-main-sprite \{[\s\S]*drop-shadow/,
  'Shadow profiles must retain their visual treatment without requiring continuous animation.'
);
assert.match(
  sharedLayoutStyles,
  /\.pokemon-profile-aura--purified \.pokemon-main-sprite \{[\s\S]*drop-shadow/,
  'Purified profiles must retain their visual treatment without requiring continuous animation.'
);
assert.doesNotMatch(
  sharedLayoutStyles,
  /will-change:\s*filter|pokemon-(?:shadow|purified)-silhouette-aura|animation:[^;]*infinite/,
  'Profile modifiers must not keep an off-screen GPU filter animation alive while the user scrolls.'
);
assert.doesNotMatch(
  pokemonStyles,
  /\.pokemon-detail-section \{/,
  'Pokémon Details must not keep a page-local duplicate of the shared card styling'
);

console.log('Stats Ranking shared layout regression tests passed.');
