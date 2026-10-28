#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [evolution, assets, gender, form, stats, statBar, info, theme, variables] = await Promise.all([
  readFile(new URL('../../src/components/Info/Evolution/Evolution.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Assets/PokemonModel.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Gender.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Stats/Stats.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Progress/StatBar.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Info.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/utils/models/overrides/themes.model.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/assets/styles/variables.scss', import.meta.url), 'utf8'),
]);
const lightThemeVariables = variables.slice(
  variables.indexOf(':root[data-theme=#{$light-mode}]'),
  variables.indexOf(':root[data-theme=#{$dark-mode}]')
);
const darkThemeVariables = variables.slice(variables.indexOf(':root[data-theme=#{$dark-mode}]'));

assert.match(evolution, /const EVOLUTION_MIN_HEIGHT = 256/);
assert.match(evolution, /Math\.max\(EVOLUTION_MIN_HEIGHT, evolutionMinHeight\)/);
assert.match(evolution, /chain\.dataset\.testid === 'evolution-chain-skeleton'/);
assert.match(evolution, /data-testid="evolution-chain-skeleton"/);
assert.match(evolution, /evo-chain tw-inline-flex tw-h-64/);
assert.doesNotMatch(
  evolution,
  /slide-container !tw-w-3\/4/,
  'Evolution loading must not use a floating rectangular backdrop.'
);
assert.match(assets, /className="tw-flex tw-min-h-\[206px\] tw-flex-wrap" data-testid="pokemon-assets-content"/);
assert.match(assets, /data-testid="pokemon-assets-skeleton"/);
assert.match(assets, /variant="rounded"/);
assert.match(assets, /className="group-model tw-h-\[206px\] tw-w-\[234px\] tw-max-w-full"/);
assert.match(assets, /className="!tw-h-full !tw-w-full"/);
assert.doesNotMatch(assets, /assetSkeletonGroups/);
assert.doesNotMatch(assets, /PokemonAssetModelSkeleton/);
assert.match(assets, /data-skeleton-surface="page"/);
assert.match(gender, /export const GenderSkeleton/);
assert.match(gender, /data-testid="gender-ratio-skeleton"/);
assert.match(gender, /width=\{40\} height=\{40\}/);
assert.match(gender, /width=\{96\} height=\{96\}/);
assert.match(gender, /img-form-gender-group !tw-mr-0/);
assert.equal(
  gender.match(/data-skeleton-surface="page"/g)?.length,
  4,
  'Every Gender Ratio placeholder must use the same surface as Sound Pokémon.'
);
assert.ok(
  (evolution.match(/data-skeleton-surface="page"/g)?.length ?? 0) >= 3,
  'Every Evolution placeholder shape must use the page skeleton surface.'
);
assert.ok(
  (assets.match(/data-skeleton-surface="page"/g)?.length ?? 0) >= 3,
  'The standalone Asset and sound placeholders must share the page skeleton surface.'
);
assert.match(form, /<GenderSkeleton key=\{index\} \/>/);
assert.match(
  form,
  /searchingMainDetails\?\.id === props\.defaultId \? searchingMainDetails\?\.genderRatio : undefined/
);
assert.match(
  form,
  /const genderSkeletonCount = genderRatio \? \(genderRatio\.M !== 0 && genderRatio\.F !== 0 \? 2 : 1\) : 1/
);
assert.match(form, /const genderTrackClass = 'tw-flex tw-flex-nowrap tw-gap-x-12\.5 tw-overflow-x-auto'/);
assert.match(form, /const lastLoadedGender = useRef<GenderDisplaySnapshot>/);
assert.match(form, /const genderDisplay: GenderDisplaySnapshot \| undefined = isCurrentPokemonLoaded/);
assert.match(form, /lastGender\.pokemonId === props\.defaultId/);
assert.match(form, /!genderDisplay \? \(/);
assert.equal(form.match(/className=\{genderDisplayClass\}/g)?.length, 2);
assert.match(form, /aria-label=\{!isCurrentPokemonLoaded \? 'Updating gender ratio' : undefined\}/);
assert.match(form, /data-testid="gender-ratio-content"[\s\S]*aria-busy=\{!isCurrentPokemonLoaded\}/);
assert.match(form, /className="form-container tw-h-\[185px\]"/);
assert.match(gender, /tw-flex-none" data-testid="gender-ratio-skeleton"/);
assert.match(gender, /ratio-gender !tw-m-0 tw-whitespace-nowrap/);
assert.match(form, /className="tw-my-3 tw-min-h-selection-button"/);
assert.match(form, /isLoading=\{!isCurrentPokemonLoaded\}/);
assert.match(stats, /aria-busy=\{props\.isLoading\}/);
assert.match(stats, /Loading stats…/);
assert.match(stats, /className="tw-h-4 tw-text-right/);
assert.match(stats, /isLoading=\{props\.isLoading\}/);
assert.doesNotMatch(stats, /pokemon-stat-skeleton/);
assert.doesNotMatch(stats, /<Skeleton/);
assert.match(stats, /const lastLoadedStats = useRef\(computedStats\)/);
assert.match(stats, /props\.isLoading\s*\? lastLoadedStats\.current\s*: computedStats/);
assert.doesNotMatch(stats, /useState/);
assert.match(statBar, /data-stat-loading=\{isLoading \|\| undefined\}/);
assert.match(statBar, /variant=\{variant\}/);
assert.match(statBar, /value=\{statsPercent\}/);
assert.doesNotMatch(statBar, /indeterminate/);
assert.doesNotMatch(statBar, /useEffect|useState/);
assert.match(form, /<Info isLoading=\{!isCurrentPokemonLoaded\} \/>/);
assert.match(info, /data-testid="pokemon-information"/);
assert.doesNotMatch(info, /Loading information…/);
assert.match(info, /const lastLoadedTypes = useRef\(requestedTypes\)/);
assert.match(info, /const types = isLoading \? lastLoadedTypes\.current : requestedTypes/);
assert.match(info, /tw-pointer-events-none tw-opacity-60/);
assert.doesNotMatch(info, /Skeleton/);
assert.match(
  form,
  /data-skeleton-surface="page"[\s\S]*variant="rectangular"[\s\S]*height=\{142\}[\s\S]*width=\{90\}/,
  'Form varieties placeholders must use the same surface as Sound Pokémon without changing card dimensions.'
);
assert.match(
  theme,
  /&\[data-skeleton-surface="page"\][\s\S]*backgroundColor: 'var\(--skeleton-page-background\)'[\s\S]*opacity: 'var\(--skeleton-page-wave-opacity\)'/,
  'Standalone skeleton surfaces must blend into the active page theme.'
);
assert.match(lightThemeVariables, /--skeleton-page-background: rgb\(0 0 0 \/ 10%\)/);
assert.match(lightThemeVariables, /--skeleton-page-wave-opacity: 0\.7/);
assert.match(darkThemeVariables, /--skeleton-page-background: var\(--custom-default\)/);
assert.match(darkThemeVariables, /--skeleton-page-wave-opacity: 0\.35/);

console.log('Pokémon detail skeleton dimensions and page surfaces passed.');
