#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  pokemonPage,
  formSelect,
  searchBar,
  searchBarMain,
  navigationImage,
  imagePreloader,
  theme,
  pokemonTable,
  statsTable,
  customStyles,
  profileSkeleton,
  detailHero,
  statsRanking,
] = await Promise.all([
  readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Find/FormSelect.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/components/SearchBar.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/components/SearchBarMain.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/components/PokemonNavigationImage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/utils/hooks/usePreloadedImage.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/utils/models/overrides/themes.model.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Tables/Pokemon/PokemonTable.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Tables/Stats/StatsTable.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/assets/styles/custom.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/PokemonProfileImageSkeleton.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/PokemonDetailHero.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Sheets/StatsRanking/StatsRanking.tsx', import.meta.url), 'utf8'),
]);

assert.match(
  profileSkeleton,
  /data-skeleton-surface="pokemon-image"[\s\S]*data-testid=\{testId\}/,
  'The Pokémon profile image skeleton must use the dedicated image surface.'
);
assert.match(
  detailHero,
  /<PokemonProfileImageSkeleton testId=\{imageSkeletonTestId\} \/>/,
  'The shared detail hero must own the shared profile image skeleton.'
);
assert.match(
  pokemonPage,
  /<PokemonDetailHero[\s\S]*isImageLoading=\{showMainImageSkeleton\}/,
  'Pokémon Details must pass its image readiness into the shared detail hero.'
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
assert.match(
  pokemonPage,
  /isMainImageReady && searchingMainForm\?\.form\?\.pokemonType === PokemonType\.Shadow[\s\S]*isMainImageReady && searchingMainForm\?\.form\?\.pokemonType === PokemonType\.Purified/,
  'Shadow and Purified auras must clear as soon as navigation targets another Pokémon.'
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
  /const cachedNavigationImage =[\s\S]*isImagePreloaded\(requestedOfficialImage\)[\s\S]*const displayedSelectedImage = cachedNavigationImage \?\? selectedImage;[\s\S]*const showSelectedImageSkeleton = cachedNavigationImage[\s\S]*\? false[\s\S]*!isSelectedNavigationCurrent \|\| !isSelectedProfileReady \|\| isSelectedImageLoading;/,
  'FormSelect must reuse an exact cached navigation artwork while its form catalog is still loading.'
);
assert.match(
  formSelect,
  /const requestedPokemonId = toNumber\(props\.id\);[\s\S]*currentPokemonId === requestedPokemonId/,
  'Tools must hide the previous profile in the render where rapid navigation changes the requested Pokémon ID.'
);
assert.match(
  formSelect,
  /const isSelectedProfileReady = Boolean\([\s\S]*isSelectedImageReady && profileBundle && profileBundle\.id === currentPokemonId[\s\S]*\);/,
  'Tools must wait for the canonical form catalog belonging to the selected Pokémon before resolving a profile image.'
);
assert.match(
  formSelect,
  /form: currentForm\?\.pokemonGoForm \|\| currentForm\?\.form\.formName \|\| 'NORMAL'/,
  'Tools must normalize an empty PokéAPI default form name to NORMAL before resolving profile candidates.'
);
assert.match(
  formSelect,
  /buildPokemonDetailProfileImagePresentation\([\s\S]*canonicalForms:[\s\S]*pokemonGoForms:[\s\S]*selection:/,
  'Tools must use the complete ordered profile-image pipeline from Pokémon Details.'
);
assert.match(
  formSelect,
  /pokemon-profile-aura[\s\S]*data-profile-modifier=\{profileModifier\}/,
  'Tools must preserve the shared Shadow and Purified profile treatment.'
);
assert.match(
  formSelect,
  /onLoad=\{\(event\) => markImageAsPreloaded\(event\.currentTarget\.currentSrc \|\| event\.currentTarget\.src\)\}/,
  'FormSelect navigation images must register successful loads in the shared cache.'
);
for (const navigation of [searchBar, searchBarMain]) {
  assert.match(
    navigation,
    /<PokemonNavigationImage/,
    'Pokémon detail navigation must use the identity-safe shared image component.'
  );
}
for (const navigation of [searchBar, searchBarMain]) {
  assert.match(navigation, /next-border/);
  assert.match(navigation, /prev-border/);
}
assert.match(
  customStyles,
  /\.next-border,\s*\.prev-border\s*\{\s*transition: none;/,
  'The persistent Pokémon navigation divider must not animate its border color.'
);
assert.match(
  navigationImage,
  /onLoad=\{\(event\) => markImageAsPreloaded\(event\.currentTarget\.currentSrc \|\| event\.currentTarget\.src\)\}/,
  'Pokémon detail navigation images must register successful loads in the shared cache.'
);
assert.match(
  navigationImage,
  /APIService\.getPokeOfficialArtwork\(id\)/,
  'Pokémon navigation must preload the same official artwork family used by the main image.'
);
assert.match(
  imagePreloader,
  /: cacheCandidateUrls\.find\(isImagePreloaded\)/,
  'The default image preloader must suppress loading state only for an exact cache candidate.'
);
assert.match(
  imagePreloader,
  /if \(cachedUrl\) \{\s*return \(\) => \{/,
  'A cached image must remain stable instead of being replaced by a different asset after render.'
);
assert.match(
  imagePreloader,
  /enforceCandidateOrder[\s\S]*candidateUrls\[0\][\s\S]*isImagePreloaded\(candidateUrls\[0\]\)/,
  'Strict profile loading must never let a cached lower-priority fallback bypass the first candidate.'
);
for (const profileConsumer of [pokemonPage, statsRanking, formSelect]) {
  assert.match(
    profileConsumer,
    /usePreloadedImage\([\s\S]*?,\s*true\s*\)/,
    'Every profile consumer must enforce the Pokémon Details candidate order.'
  );
}
assert.match(
  imagePreloader,
  /const loadImageOnce =[\s\S]*image\.onload = \(\) => \{\s*markImageAsPreloaded\(url\);\s*resolve\(true\)/,
  'A completed preload must be cached even if navigation has already changed.'
);
assert.match(
  imagePreloader,
  /export const preloadFirstAvailableImage = async[\s\S]*for \(const url of uniqueUrls\(candidates\)\)[\s\S]*await loadImageOnce\(url\)/,
  'Search form switching must preload and cache the next Gender sprite before committing its snapshot.'
);
assert.match(
  imagePreloader,
  /const loadingImageUrls = new Map<string, Promise<boolean>>\(\);[\s\S]*loadingImageUrls\.get\(normalizedUrl\)[\s\S]*loadingImageUrls\.set\(normalizedUrl, request\)/,
  'Rapid navigation must reuse one in-flight request per profile URL instead of racing duplicate image loads.'
);
assert.match(
  formSelect,
  /preloadFirstAvailableImage\(\[APIService\.getPokeOfficialArtwork\(id\)\]\)/,
  'Tools must warm the shared profile cache with the previous and next official artwork.'
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
assert.match(
  statsRanking,
  /const showSelectedImageSkeleton = !selectedId \|\| loading \|\| !selectedBundle \|\| isSelectedImageLoading;/,
  'Stats Ranking must keep the profile skeleton visible until the selected bundle and a valid image are ready.'
);
assert.match(
  statsRanking,
  /<PokemonDetailHero[\s\S]*imageSkeletonTestId="stats-ranking-profile-image-skeleton"/,
  'Stats Ranking must reuse the Pokémon Details hero and profile skeleton.'
);
assert.match(
  statsRanking,
  /buildPokemonDetailProfileImagePresentation\([\s\S]*canonicalForms:[\s\S]*pokemonGoForms:[\s\S]*usePreloadedImage\([\s\S]*selectedImageCandidates,[\s\S]*APIService\.getPokeSprite\(\)/,
  'Stats Ranking must prefer only exact canonical form artwork before GO and generic fallbacks.'
);
assert.doesNotMatch(
  statsRanking,
  /selectedForm \?\? fallbackForm/,
  'A GO-only form must not borrow the canonical species-default profile image.'
);
assert.match(statsRanking, /pokemonGoForms: data\.data\.pokemonGo\?\.forms \?\? \[\]/);
assert.match(
  statsRanking,
  /const selectedProfile =[\s\S]*buildPokemonDetailProfileImagePresentation\(\{[\s\S]*canonicalForms:[\s\S]*pokemonGoForms:[\s\S]*selection:/,
  'Stats Ranking must use the shared exact-form profile image fallback order.'
);
assert.match(
  pokemonPage,
  /const mainProfile =[\s\S]*buildPokemonDetailProfileImagePresentation\(\{[\s\S]*canonicalForms:[\s\S]*pokemonGoForms,[\s\S]*selection:/,
  'Pokémon Details must use the same exact GO form and image candidate resolver as Stats Ranking.'
);
assert.doesNotMatch(
  statsRanking,
  /src=\{APIService\.getPokeFullSprite\(\s*select\?\.num/,
  'Stats Ranking must not render a question-mark profile while the initial selection is unresolved.'
);
console.log('Pokémon image skeleton surface regression passed.');
