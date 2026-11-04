#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  evolution,
  evolutionPokemonDisplay,
  assets,
  gender,
  form,
  stats,
  statsStyles,
  statBar,
  info,
  typeEffective,
  pokemonTable,
  pokemonTableStyles,
  pokemonPage,
  pokemonPageStyles,
  pokemonDetailLayoutStyles,
  stableHeightSection,
  encounterTraining,
  trainingCosts,
  evolutionSupplementSkeleton,
  specialForm,
  theme,
  variables,
] = await Promise.all([
  readFile(new URL('../../src/components/Info/Evolution/Evolution.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/EvolutionPokemonDisplay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Assets/PokemonModel.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Gender.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Stats/Stats.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Stats/Stats.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Progress/StatBar.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Info.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Effective/TypeEffective.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Tables/Pokemon/PokemonTable.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Commons/Tables/Pokemon/PokemonTable.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Pokemon/Pokemon.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/PokemonDetailLayout.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Layout/StableHeightSection.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Encounter/EncounterTraining.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/TrainingCosts/TrainingCosts.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/EvolutionSupplementSkeleton.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/SpecialForm/SpecialForm.tsx', import.meta.url), 'utf8'),
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
assert.match(evolution, /const areEvolutionAssetsReady =/);
assert.match(evolution, /const readyEvolutionAssetSetKeys = new Set<string>\(\)/);
assert.match(evolution, /isRequestedPokemonInResolvedChain && readyEvolutionAssetSetKeys\.has\(evolutionAssetSetKey\)/);
assert.match(evolution, /readyEvolutionAssetSetKeys\.add\(evolutionAssetSetKey\)/);
assert.match(
  evolution,
  /const canStartReusingResolvedEvolutionChain = Boolean\([\s\S]*requestedPokemonId !== resolvedEvolutionRequest\.pokemonId[\s\S]*isRequestedPokemonInResolvedChain/
);
assert.match(
  evolution,
  /canStartReusingResolvedEvolutionChain \|\|[\s\S]*isReusingResolvedEvolutionChain && isRequestedPokemonInResolvedChain/
);
assert.match(
  evolution,
  /const hasEvolutionData =[\s\S]*props\.isLoadedForms && resolvedEvolutionRequest\.requestKey === evolutionRequestKey[\s\S]*canReuseResolvedEvolutionChain/
);
assert.match(
  evolution,
  /isReusingResolvedEvolutionChain &&[\s\S]*props\.isLoadedForms &&[\s\S]*resolvedEvolutionRequest\.requestKey === evolutionRequestKey[\s\S]*setIsReusingResolvedEvolutionChain\(false\)/
);
assert.match(evolution, /const requestedPokemonId = pendingCurrentPokemonId \?\? toNumber\(params\.id, props\.id\)/);
assert.match(evolution, /pendingCurrentPokemonId === props\.id && props\.isLoadedForms/);
assert.equal(
  evolution.match(/setPendingCurrentPokemonId\(value\.id\)/g)?.length,
  2,
  'Both embedded and routed Evolution selections must move the Current marker at click time.'
);
assert.match(
  evolution,
  /arrEvoList\.some\(\(stage\) => stage\.some\(\(pokemon\) => pokemon\.id === requestedPokemonId\)\)/
);
assert.match(evolution, /const hasRequestedPokemonDetails = props\.pokemonData\?\.id === requestedPokemonId/);
assert.match(
  evolution,
  /const currentEvolutionIdentity =[\s\S]*requestedEvolutionNodes\.length === 1[\s\S]*requestedEvolutionNodes\[0\][\s\S]*hasRequestedPokemonDetails/
);
assert.doesNotMatch(
  evolution,
  /const currentEvolutionIdentity = hasRequestedPokemonDetails/,
  'A settled detail response must not replace the unique selected chain identity and blink the Current marker.'
);
assert.match(evolution, /data-testid="evolution-current-marker"/);
assert.match(evolution, /data-evolution-current-id=\{value\.id\}/);
assert.match(evolution, /data-testid="evolution-status-tags"/);
assert.match(evolution, /tw-flex tw-h-\[18px\] tw-items-center tw-justify-center tw-gap-1\.5/);
assert.match(
  evolution,
  /data-testid="evolution-status-tags"[\s\S]*value\.isBaby[\s\S]*data-testid="evolution-current-marker"/
);
assert.doesNotMatch(evolution, /\{value\.isBaby[\s\S]*<p>[\s\S]*evolution-current-marker/);
assert.doesNotMatch(
  evolution,
  /props\.isLoadedForms \|\|[\s\S]*arrEvoList\.some/,
  'Evolution reuse must be scoped to a previously resolved chain instead of revealing arbitrary intermediate data.'
);
assert.match(evolution, /querySelectorAll<HTMLElement>\('\[data-testid="evolution-node"\]'\)/);
assert.match(evolution, /nodes\.length === evolutionAssetKeys\.length/);
assert.match(evolution, /image\.complete && image\.naturalWidth > 0/);
assert.match(evolution, /node\.querySelector\('\.evolution-pokemon-mini-icon'\)/);
assert.match(evolution, /container\.addEventListener\('load', scheduleImageCheck, true\)/);
assert.match(evolution, /attributeFilter: \['src'\]/);
assert.match(evolution, /!areEvolutionAssetsReady &&/);
assert.match(evolution, /data-evolution-assets-ready=\{areEvolutionAssetsReady\}/);
assert.match(evolution, /areEvolutionAssetsReady \? 'tw-visible' : 'tw-invisible'/);
assert.match(evolutionPokemonDisplay, /const activeImageRef = useRef<HTMLImageElement>\(null\)/);
assert.match(evolutionPokemonDisplay, /if \(!activeSource \|\| !image\?\.complete\)/);
assert.match(evolutionPokemonDisplay, /image\.naturalWidth === 0/);
assert.match(evolutionPokemonDisplay, /ref=\{activeImageRef\}/);
assert.match(evolutionPokemonDisplay, /advanceSource\(\)/);
assert.doesNotMatch(
  evolution,
  /slide-container !tw-w-3\/4/,
  'Evolution loading must not use a floating rectangular backdrop.'
);
assert.match(assets, /!areAssetImagesLoaded \|\| hasPokemonGoAssets \? 'tw-min-h-\[206px\]' : 'tw-min-h-0'/);
assert.match(assets, /<b>Pokémon GO assets<\/b>/);
assert.match(assets, /<b>Pokémon cry<\/b>/);
assert.match(assets, /testId="pokemon-assets-unavailable"/);
assert.match(assets, /label="Pokémon GO image assets unavailable"/);
assert.match(assets, /testId="pokemon-cries-unavailable"/);
assert.match(assets, /label="Cry audio unavailable"/);
assert.match(assets, /tw-relative tw-mt-2 tw-flex tw-flex-col tw-gap-6/);
assert.match(assets, /title-evo !tw-m-0 !tw-mb-3/);
assert.match(assets, /title-evo !tw-m-0 !tw-mb-4/);
assert.equal(
  assets.match(/<h5 className="!tw-m-0 !tw-mb-3">/g)?.length,
  3,
  'Loaded and skeleton cry source headings must retain their spacing after the important margin reset.'
);
assert.match(assets, /const hasAnyCry = hasOriginCries \|\| hasPokemonGoCries/);
assert.match(assets, /hasOriginCries && hasPokemonGoCries \? 'lg:tw-grid-cols-2' : 'lg:tw-max-w-3xl'/);
assert.match(assets, /preload="metadata"/);
assert.doesNotMatch(assets, /Assets in Pokémon GO unavailable/);
assert.doesNotMatch(assets, /Sound in Pokémon GO unavailable\./);
assert.match(assets, /data-testid="pokemon-cry-sources"/);
assert.match(assets, /'tw-grid tw-grid-cols-1 tw-gap-6'/);
assert.match(
  assets,
  /loadingSnapshot\.originCryCount > 0 && loadingSnapshot\.pokemonGoCryCount > 0\s+\? 'lg:tw-grid-cols-2'/
);
assert.match(assets, /label="Pokémon Origin" size="small" variant="outlined"/);
assert.match(assets, /label="Pokémon GO" size="small" variant="outlined"/);
assert.doesNotMatch(assets, /tw-list-(?:disc|circle)/);
assert.doesNotMatch(assets, /getPokemonGoIcon/);
assert.doesNotMatch(assets, /Assets of .* in Pokémon GO/);
assert.doesNotMatch(assets, /Sound of /);
assert.match(assets, /data-testid="pokemon-assets-skeleton"/);
assert.match(assets, /const DEFAULT_POKEMON_ASSET_SKELETON_COUNT = 4/);
assert.match(assets, /const lastLoadedAssetSnapshot = useRef<AssetLoadingSnapshot>/);
assert.match(assets, /assetGroupCount: pokeAssets\.length/);
assert.match(assets, /originCryCount/);
assert.match(assets, /pokemonGoCryCount/);
assert.match(assets, /Array\.from\(\{ length: loadingSnapshot\.assetGroupCount \}/);
assert.match(assets, /data-testid="pokemon-asset-skeleton-card"/);
assert.match(assets, /data-testid="pokemon-cry-source-skeleton" data-skeleton-count=\{count\}/);
assert.match(assets, /<CrySourceSkeleton label="Pokémon Origin" count=\{loadingSnapshot\.originCryCount\} \/>/);
assert.match(assets, /<CrySourceSkeleton label="Pokémon GO" count=\{loadingSnapshot\.pokemonGoCryCount\} \/>/);
assert.match(
  assets,
  /Promise\.all\(imageRequests\.map\(\(\{ candidates \}\) => preloadFirstAvailableImage\(candidates\)\)\)/
);
assert.match(assets, /const areAssetImagesLoaded =/);
assert.match(assets, /preloadedImages\.requestKey === imageRequestKey/);
assert.match(assets, /aria-busy=\{!areAssetImagesLoaded\}/);
assert.match(assets, /\{!areAssetImagesLoaded \? \(/);
assert.match(assets, /key=\{assets\.form\}/);
assert.match(assets, /key=\{`\$\{assets\.form\}:\$\{value\.gender/);
assert.match(assets, /variant="rounded"/);
assert.match(assets, /className="group-model tw-h-\[206px\] tw-w-\[234px\] tw-max-w-full"/);
assert.match(assets, /className="!tw-h-full !tw-w-full"/);
assert.doesNotMatch(assets, /PokemonAssetModelSkeleton/);
assert.match(assets, /data-skeleton-surface="page"/);
assert.match(gender, /export const GenderSkeleton/);
assert.match(gender, /data-testid="gender-ratio-skeleton"/);
assert.match(gender, /width=\{40\} height=\{40\}/);
assert.match(gender, /width=\{96\} height=\{96\}/);
assert.match(gender, /variant="circular" animation="wave" width=\{40\} height=\{40\}/);
assert.match(gender, /tw-min-w-\[220px\] tw-flex-none/);
assert.match(gender, /width=\{168\}/);
assert.match(gender, /tw-w-\[204px\] tw-gap-x-3/);
assert.match(gender, /img-form-gender-group !tw-mr-0/);
assert.match(gender, /className="img-gender-group tw-relative"/);
assert.match(gender, /width=\{32\}[\s\S]*height=\{32\}[\s\S]*!tw-absolute !tw-right-0 !tw-bottom-0/);
assert.match(gender, /\{\[72, 56\]\.map/);
assert.equal(
  gender.match(/data-skeleton-surface="page"/g)?.length,
  5,
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
  /searchingMainForm\?\.defaultId === props\.defaultId \? searchingMainDetails\?\.genderRatio : undefined/
);
assert.match(form, /searchingMainForm\?\.defaultId === props\.defaultId/);
assert.doesNotMatch(form, /searchingMainDetails\?\.id === props\.defaultId/);
assert.match(
  form,
  /const genderSkeletonCount = genderRatio \? \(genderRatio\.M !== 0 && genderRatio\.F !== 0 \? 2 : 1\) : 2/
);
assert.match(form, /const genderTrackClass = 'tw-flex tw-flex-nowrap tw-gap-x-12\.5 tw-overflow-x-auto'/);
assert.match(form, /const lastLoadedGender = useRef<GenderDisplaySnapshot>/);
assert.match(form, /const \[searchGenderDisplay, setSearchGenderDisplay\] = useState<GenderDisplaySnapshot>/);
assert.match(form, /Promise\.all\(candidateGroups\.map\(preloadFirstAvailableImage\)\)/);
assert.match(form, /setSearchGenderDisplay\(nextGenderDisplay\)/);
assert.match(form, /const directGenderDisplay: GenderDisplaySnapshot \| undefined = isCurrentPokemonLoaded/);
assert.match(form, /const genderDisplay = params\.id/);
assert.match(form, /lastGender\.pokemonId === props\.defaultId/);
assert.match(gender, /export const getGenderSpriteCandidates/);
assert.match(form, /!genderDisplay \? \(/);
assert.equal(form.match(/className=\{genderDisplayClass\}/g)?.length, 2);
assert.match(form, /aria-label=\{!isCurrentPokemonLoaded \? 'Updating gender ratio' : undefined\}/);
assert.match(form, /data-testid="gender-ratio-content"[\s\S]*aria-busy=\{!isCurrentPokemonLoaded\}/);
assert.match(form, /data-gender-form-id=\{genderDisplay\?\.formId \?\? ''\}/);
assert.match(form, /className="form-container tw-flex tw-h-\[190px\] tw-items-center"/);
assert.match(form, /<h4 className="info-title">\s*<b>Form varieties<\/b>\s*<\/h4>/);
assert.match(form, /<h4 className="info-title">\s*<b>Gender ratio<\/b>\s*<\/h4>/);
assert.match(form, /<h4 className="info-title">\s*<b>Pokémon stats<\/b>\s*<\/h4>/);
assert.match(form, /data-testid="pokemon-information-card"/);
assert.match(form, /const lastLoadedEvolutionSupplement = useRef<EvolutionSupplementSnapshot>/);
assert.match(form, /specialFormCount: number/);
assert.match(form, /const megaFormCount = props\.formList\.filter/);
assert.match(form, /const primalFormCount = props\.formList\.filter/);
assert.match(
  form,
  /if \(isCurrentPokemonLoaded\) \{[\s\S]*lastLoadedEvolutionSupplement\.current = currentEvolutionSupplement/
);
assert.match(form, /testId="mega-evolution-loading"/);
assert.match(form, /count=\{lastLoadedEvolutionSupplement\.current\.specialFormCount\}/);
assert.match(form, /testId="form-change-loading"/);
assert.match(form, /testId="fusion-loading"/);
assert.match(evolutionSupplementSkeleton, /data-skeleton-surface="page"/);
assert.match(evolutionSupplementSkeleton, /variant\?: 'card' \| 'relationship'/);
assert.match(evolutionSupplementSkeleton, /count\?: number/);
assert.match(evolutionSupplementSkeleton, /Array\.from\(\{ length: Math\.max\(1, count\) \}/);
assert.match(evolutionSupplementSkeleton, /data-testid="evolution-supplement-skeleton-card"/);
assert.match(evolutionSupplementSkeleton, /aria-label=\{`Loading \$\{title\}`\}/);
assert.match(specialForm, /const pokemonType = useMemo\(\(\) =>/);
assert.match(specialForm, /const arrEvoList = useMemo\(\(\) =>/);
assert.doesNotMatch(specialForm, /setArrEvoList|setPokemonType/);
assert.match(form, /minHeight=\{320\} testId="pokemon-information-section"/);
assert.match(form, /data-testid="pokemon-battle-card"/);
assert.match(form, /<h4 className="info-title">\s*<b>Battle data<\/b>\s*<\/h4>/);
assert.match(
  form,
  /<TrainingCosts[\s\S]*thirdMove=\{props\.trainingCosts\?\.thirdMove\}[\s\S]*purified=\{props\.trainingCosts\?\.purified\}/
);
assert.match(trainingCosts, /data-testid="pokemon-training-costs"/);
assert.match(trainingCosts, /label="Second Charged Move"/);
assert.match(trainingCosts, /label="Purification"/);
assert.match(trainingCosts, /if \(!hasThirdMoveCost && !hasPurificationCost\)/);
assert.doesNotMatch(trainingCosts, /Unavailable/);
assert.doesNotMatch(pokemonPage, /data-testid="pokemon-cost-table"/);
assert.match(form, /data-testid="pokemon-raid-card"/);
assert.match(form, /<h4 className="info-title">\s*<b>Raid<\/b>\s*<\/h4>/);
assert.match(form, /minHeight=\{340\} testId="pokemon-raid-section"/);
assert.match(form, /className="tw-mx-auto tw-w-full tw-max-w-4xl"/);
assert.match(form, /data-testid="pokemon-raid-encounter-grid"/);
assert.match(form, /lg:tw-grid-cols-2/);
assert.match(form, /data-testid="pokemon-encounter-training-card"/);
assert.match(form, /<b>CP &amp; Availability<\/b>/);
assert.match(form, /testId="pokemon-encounter-training-section"/);
assert.match(form, /<EncounterTraining summary=\{encounterSummary\} isLoading=\{!isCurrentPokemonLoaded\} \/>/);
assert.match(encounterTraining, />Catch CP<\/h5>/);
assert.match(encounterTraining, />Power-up CP<\/h5>/);
assert.match(encounterTraining, />Base rates &amp; availability<\/h5>/);
assert.match(encounterTraining, /label="Research"/);
assert.match(encounterTraining, /label="Raid \/ Egg"/);
assert.match(encounterTraining, /label="Weather Boost"/);
assert.match(encounterTraining, /label="Best Buddy"/);
assert.match(encounterTraining, /<StatusPill label="Pokémon HOME"/);
assert.match(encounterTraining, /data-skeleton-surface="page"/);
assert.match(encounterTraining, /const cpTileClassName = \(compact: boolean\)/);
assert.match(encounterTraining, /isLoading\?: boolean/);
assert.match(encounterTraining, /aria-busy=\{isLoading\}/);
assert.match(encounterTraining, /tw-relative tw-inline-block tw-w-16/);
assert.match(encounterTraining, /tw-relative tw-inline-block tw-w-10 tw-text-right/);
assert.match(encounterTraining, /className="!tw-absolute !tw-inset-0"/);
assert.match(encounterTraining, /<CpTile[\s\S]*isLoading=\{isLoading\}/);
assert.match(encounterTraining, /<RatePill[\s\S]*isLoading=\{isLoading\}/);
assert.match(encounterTraining, /<StatusPill[\s\S]*isLoading=\{isLoading\}/);
assert.doesNotMatch(encounterTraining, /if \(isLoading\) \{/);
assert.doesNotMatch(encounterTraining, /availabilityPillWidths/);
assert.doesNotMatch(encounterTraining, /height=\{index < 3 \? 80 : 64\}/);
assert.doesNotMatch(form, /<li>Raid<\/li>/);
const statsSectionIndex = form.indexOf('testId="pokemon-stats-section"');
const informationSectionIndex = form.indexOf('testId="pokemon-information-section"');
const battleSectionIndex = form.indexOf('testId="pokemon-battle-section"');
const raidSectionIndex = form.indexOf('testId="pokemon-raid-section"');
const evolutionSectionIndex = form.indexOf('testId="pokemon-evolution-stable"');
assert.ok(
  statsSectionIndex < informationSectionIndex &&
    informationSectionIndex < battleSectionIndex &&
    battleSectionIndex < raidSectionIndex &&
    raidSectionIndex < evolutionSectionIndex,
  'Pokémon detail sections must prioritize Stats, Information, and Battle data before Raid and Evolution.'
);
assert.match(gender, /tw-flex-none" data-testid="gender-ratio-skeleton"/);
assert.match(gender, /ratio-gender !tw-m-0 tw-whitespace-nowrap/);
assert.match(form, /className="tw-min-h-selection-button"/);
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
assert.match(statBar, /aria-busy=\{isLoading\}/);
assert.match(statBar, /variant=\{variant\}/);
assert.match(statBar, /value=\{statsPercent\}/);
assert.match(statBar, /className="pokemon-stat-progress"/);
assert.match(statBar, /data-testid="pokemon-stat-progress"/);
assert.doesNotMatch(statBar, /indeterminate/);
assert.match(statsStyles, /pokemon-stat-progress\.MuiLinearProgress-root[\s\S]*tw-h-7\.5 tw-w-full tw-rounded-md/);
assert.match(statsStyles, /pokemon-stat-progress \.MuiLinearProgress-bar[\s\S]*tw-rounded-md tw-duration-300/);
assert.match(statsStyles, /progress-loading[\s\S]*MuiLinearProgress-bar[\s\S]*tw-transition-none/);
assert.doesNotMatch(statBar, /useEffect|useState/);
assert.match(form, /<Info isLoading=\{!isCurrentPokemonLoaded\} \/>/);
assert.match(info, /data-testid="pokemon-information"/);
assert.doesNotMatch(info, /Loading information…/);
assert.match(info, /const lastLoadedTypes = useRef\(requestedTypes\)/);
assert.match(info, /const types = isLoading \? lastLoadedTypes\.current : requestedTypes/);
assert.match(info, /tw-pointer-events-none tw-opacity-60/);
assert.match(
  info,
  /tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-12 lg:tw-items-start/,
  'Information content must stack on small screens and use the available width on desktop.'
);
assert.match(
  info,
  /tw-flex tw-min-w-0 tw-flex-col tw-gap-2 lg:tw-col-span-3[\s\S]*lg:tw-col-span-9/,
  'Pokémon Type and Weather Boosts must share one vertical column beside Type effectiveness.'
);
assert.match(info, /variant="summary"/);
assert.equal(
  info.match(/<Chip component="span" label="(?:Pokémon Type|Weather Boosts)" size="small" variant="outlined" \/>/g)
    ?.length,
  2,
  'Information summary labels must use compact outlined MUI chips.'
);
assert.doesNotMatch(
  info,
  /tw-rounded-xl tw-border tw-border-solid tw-border-gray-500 tw-bg-table-info/,
  'Information groups must rely on the parent section surface instead of nested bordered cards.'
);
assert.match(
  typeEffective,
  /sm:tw-grid-cols-2 lg:tw-grid-cols-4/,
  'Summary effectiveness groups must fill desktop space while remaining responsive.'
);
assert.doesNotMatch(typeEffective, /label="Type effectiveness"/);
assert.match(typeEffective, /size="small"\s+color="error"/);
assert.match(typeEffective, /size="small"\s+color="success"/);
assert.equal(
  typeEffective.match(/isSummary \? '!tw-m-0 tw-mb-1\.5' : 'tw-mt-2'/g)?.length,
  3,
  'Effectiveness badges must keep consistent space from their details.'
);
assert.doesNotMatch(
  typeEffective,
  /tw-rounded-xl tw-border tw-border-solid tw-border-gray-500 tw-bg-table-info/,
  'Type effectiveness summary groups must not add nested section borders.'
);
assert.doesNotMatch(info, /Skeleton/);
assert.match(pokemonTable, /new Intl\.NumberFormat\('en-US',[\s\S]*maximumFractionDigits: 2/);
assert.match(pokemonTable, /tw-grid tw-grid-cols-\[1\.15fr_0\.85fr\]/);
assert.equal(
  pokemonTable.match(/tw-min-w-0 tw-tabular-nums/g)?.length,
  2,
  'Weight and Height values must use stable tabular numerals without expanding their grid tracks.'
);
assert.ok(
  (pokemonTable.match(/tw-whitespace-nowrap/g)?.length ?? 0) >= 4,
  'Body measurement labels and values must remain on one row for large form-specific values.'
);
assert.match(
  pokemonTableStyles,
  /tw-min-w-\[110px\] sm:tw-min-w-\[180px\]/,
  'Pokémon detail labels must release horizontal space on mobile while retaining the desktop column width.'
);
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
assert.match(
  form,
  /pokemon-detail-overview-grid tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-2/,
  'Form varieties and Gender ratio must share equal-width columns on large screens and stack responsively.'
);
assert.ok(
  (form.match(/className="pokemon-detail-section/g)?.length ?? 0) >= 7,
  'Forms, Gender, Stats, Information, Battle data, Raid, and Evolution must render in separate section cards.'
);
assert.match(pokemonPage, /pokemon-detail-section pokemon-detail-hero-section/);
assert.doesNotMatch(pokemonPage, /data-testid="pokemon-cost-table"/);
assert.match(pokemonPage, /testId="pokemon-assets-stable"/);
assert.match(
  pokemonDetailLayoutStyles,
  /\.pokemon-detail-section[\s\S]*tw-rounded-2xl[\s\S]*var\(--background-paper\)/
);
assert.match(pokemonDetailLayoutStyles, /\.pokemon-detail-table[\s\S]*@apply tw-h-\[217px\]/);
assert.doesNotMatch(pokemonPageStyles, /\.table-main/);
assert.match(stableHeightSection, /new ResizeObserver\(measure\)/);
assert.match(stableHeightSection, /if \(isLoading && retainedHeightRef\.current > 0\)/);
assert.match(stableHeightSection, /tw-transition-\[min-height\] tw-duration-300 tw-ease-in-out/);
assert.match(stableHeightSection, /style=\{\{ minHeight: height \}\}/);
assert.doesNotMatch(stableHeightSection, /style=\{\{ height \}\}/);
assert.match(stableHeightSection, /motion-reduce:tw-transition-none/);

console.log('Pokémon detail skeleton dimensions and page surfaces passed.');
