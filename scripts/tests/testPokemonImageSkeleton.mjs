#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [pokemonPage, formSelect, searchBar, searchBarMain, imagePreloader, theme, pokemonTable, statsTable] =
  await Promise.all([
    readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Find/FormSelect.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/components/SearchBar.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/components/SearchBarMain.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/utils/hooks/usePreloadedImage.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../src/utils/models/overrides/themes.model.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Tables/Pokemon/PokemonTable.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Tables/Stats/StatsTable.tsx', import.meta.url), 'utf8'),
  ]);

assert.match(
  pokemonPage,
  /data-skeleton-surface="pokemon-image"[\s\S]*data-testid="pokemon-profile-image-skeleton"/,
  'The Pokémon profile image skeleton must use the dedicated image surface.'
);
assert.match(
  pokemonPage,
  /const showMainImageSkeleton = !currentPokemonId \|\| isRequestedMainImageFormPending \|\| isMainImageLoading;/,
  'The Pokémon profile must keep its skeleton until an image candidate is available.'
);
assert.match(
  pokemonPage,
  /isMainImageReady && searchingMainForm\?\.form\?\.id === currentPokemonId/,
  'Only the canonical species form may reuse the generic official artwork cache.'
);
assert.doesNotMatch(
  `${pokemonPage}\n${formSelect}`,
  /form\?\.isDefault \? .*OfficialImage|form\.isDefault \? .*OfficialImage/,
  'A PokéAPI variety default flag must not collapse regional or Totem artwork into the species default.'
);
assert.match(
  formSelect,
  /showSelectedImageSkeleton\s*\?\s*\([\s\S]*data-testid="selected-pokemon-image-skeleton"/,
  'FormSelect must show its image skeleton only while the selected image actually loads.'
);
assert.match(
  formSelect,
  /const showSelectedImageSkeleton = !currentPokemonId \|\| isSelectedImageLoading;/,
  'FormSelect must not reveal the question-mark fallback while its image candidate is unresolved.'
);
assert.match(
  formSelect,
  /onLoad=\{\(event\) => markImageAsPreloaded\(event\.currentTarget\.currentSrc \|\| event\.currentTarget\.src\)\}/,
  'FormSelect navigation images must register successful loads in the shared cache.'
);
for (const navigation of [searchBar, searchBarMain]) {
  assert.match(
    navigation,
    /onLoad=\{\(event\) => markImageAsPreloaded\(event\.currentTarget\.currentSrc \|\| event\.currentTarget\.src\)\}/,
    'Pokémon detail navigation images must register successful loads in the shared cache.'
  );
  assert.match(
    navigation,
    /src=\{APIService\.getPokeOfficialArtwork\(/,
    'Pokémon navigation must preload the same official artwork family used by the main image.'
  );
}
assert.match(
  imagePreloader,
  /const cachedCandidate = cacheCandidateUrls\.find\(isImagePreloaded\)/,
  'The image preloader must suppress loading state only for an exact cache candidate.'
);
assert.match(
  imagePreloader,
  /if \(cachedUrl\) \{\s*return \(\) => \{/,
  'A cached image must remain stable instead of being replaced by a different asset after render.'
);
assert.match(
  imagePreloader,
  /image\.onload = \(\) => \{\s*markImageAsPreloaded\(url\);\s*if \(active\)/,
  'A completed preload must be cached even if navigation has already changed.'
);
assert.match(
  theme,
  /&\[data-skeleton-surface="pokemon-image"\][\s\S]*backgroundColor: 'transparent'/,
  'The Pokémon image skeleton surface must reveal its containing background.'
);
assert.doesNotMatch(
  `${pokemonTable}\n${statsTable}`,
  /data-skeleton-surface="pokemon-image"/,
  'Table skeletons must retain the default MUI skeleton surface.'
);

console.log('Pokémon image skeleton surface regression passed.');
