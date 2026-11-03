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
assert.match(sharedLayoutStyles, /\.pokemon-detail-section \{/, 'shared detail card styling must remain centralized');
assert.doesNotMatch(
  pokemonStyles,
  /\.pokemon-detail-section \{/,
  'Pokémon Details must not keep a page-local duplicate of the shared card styling'
);

console.log('Stats Ranking shared layout regression tests passed.');
