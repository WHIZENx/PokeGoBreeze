#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  app,
  pokemon,
  search,
  form,
  buttonGroupForm,
  stableSection,
  navigation,
  routeConfig,
  variables,
  v2Styles,
  vercel,
  vercelPreview,
] =
  await Promise.all([
    readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Search/Pokemon/Search.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Info/Form/Form.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Commons/Buttons/ButtonGroupForm.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/Layout/StableHeightSection.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/Pokemon/components/SearchBarMain.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/utils/configs/processed-data-routes.config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../src/assets/styles/variables.scss', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/PokemonV2/PokemonV2.scss', import.meta.url), 'utf8'),
    readFile(new URL('../../vercel.json', import.meta.url), 'utf8'),
    readFile(new URL('../../vercel.preview.json', import.meta.url), 'utf8'),
  ]);

assert.match(app, /<Route path="\/pokemon-v2\/:id" element=\{<PokemonV2 \/>\} \/>/);
assert.match(pokemon, /const pokemonRouteBase = isV2 \? '\/pokemon-v2' : '\/pokemon'/);
assert.match(pokemon, /import '\.\.\/PokemonV2\/PokemonV2\.scss'/);
assert.match(search, /<Pokemon[\s\S]*layout="v2"[\s\S]*searchOption=\{searchOption\}/);
assert.match(pokemon, /<SearchBarMain[\s\S]*basePath=\{pokemonRouteBase\}/);
assert.match(pokemon, /data-testid="pokemon-v2-metadata"/);
assert.match(pokemon, /data-body-weight=\{searchingMainDetails\?\.weight \?\? ''\}/);
assert.match(pokemon, /isV2 \? \([\s\S]*pokemon-v2-metadata[\s\S]*\) : \([\s\S]*<PokemonTable/);
assert.match(pokemon, /pokemon-v2-metadata tw-grid tw-auto-rows-fr tw-grid-cols-2[\s\S]*lg:tw-col-span-4/);
assert.match(pokemon, /pokemon-v2-costs tw-w-full lg:tw-col-span-5/);
assert.match(form, /pokemon-v2-overview-grid tw-grid tw-gap-4 lg:tw-grid-cols-12/);
assert.match(form, /lg:tw-col-span-5[\s\S]*lg:tw-col-span-7/);
assert.match(form, /pokemon-v2-form-options tw-h-\[185px\]/);
assert.match(form, /tw-h-\[190px\] lg:tw-h-\[160px\]/);
assert.match(form, /data-testid="pokemon-raid-section"/);
assert.match(
  buttonGroupForm,
  /pokemon-form-option-label tw-whitespace-normal tw-break-words tw-leading-small/
);
assert.match(pokemon, /data-primary-type=\{isV2 \? primaryProfileType : undefined\}/);
assert.match(pokemon, /data-secondary-type=\{isV2 \? secondaryProfileType : undefined\}/);
assert.match(pokemon, /pokemon-v2-identity tw-flex tw-min-h-18 tw-flex-wrap/);
assert.match(pokemon, /tw-text-\[length:var\(--typography-h2-font-size\)\]/);
assert.match(pokemon, /tw-basis-full[\s\S]*sm:tw-basis-auto/);
assert.match(pokemon, /<IconType type=\{type\} width=\{18\} height=\{18\}/);
assert.match(pokemon, /--pokemon-v2-badge-color/);
assert.match(
  pokemon,
  /section\.scrollIntoView\(\{ behavior: prefersReducedMotion \? 'auto' : 'smooth', block: 'start' \}\)/
);
assert.match(pokemon, /`\$\{window\.location\.pathname\}\$\{window\.location\.search\}#\$\{target\}`/);
assert.match(pokemon, /const pokemonV2Sections = \[[\s\S]*ViewModuleRoundedIcon[\s\S]*CollectionsRoundedIcon/);
assert.match(
  pokemon,
  /<Button[\s\S]*variant="outlined"[\s\S]*startIcon=\{<Icon fontSize="small"[\s\S]*aria-controls=\{target\}[\s\S]*onClick=\{\(\) => scrollToV2Section\(target\)\}/
);
assert.doesNotMatch(pokemon, /href=\{`#\$\{target\}`\}/);
assert.match(form, /testId="pokemon-v2-information-stable"/);
assert.match(form, /testId="pokemon-v2-evolution-stable"/);
assert.match(pokemon, /testId="pokemon-v2-assets-stable"/);
assert.match(stableSection, /new ResizeObserver\(measure\)/);
assert.match(stableSection, /isLoading && retainedHeightRef\.current > 0/);
assert.match(stableSection, /tw-transition-\[height\] tw-duration-300/);
assert.match(navigation, /const basePath = props\.basePath \?\? '\/pokemon'/);
assert.match(routeConfig, /pathname\.startsWith\('\/pokemon-v2\/'\)/);

for (const section of ['forms', 'stats', 'battle', 'evolution', 'assets']) {
  assert.match(pokemon + form, new RegExp(`pokemon-v2-${section}`), `V2 must expose its ${section} section.`);
}

assert.match(v2Styles, /#pokemon-v2-battle \.table-counter-container[\s\S]*tw-h-\[480px\]/);
assert.match(v2Styles, /@media \(width <= 575px\)[\s\S]*pokemon-assets-content[\s\S]*tw-p-2/);
assert.match(v2Styles, /var\(--pokemon-v2-primary-type\)/);
assert.match(v2Styles, /var\(--pokemon-v2-secondary-type\)/);
assert.match(v2Styles, /var\(--pokemon-v2-badge-color\)/);
assert.match(v2Styles, /pokemon-details-v2[\s\S]*tw-overflow-x-clip/);
assert.match(v2Styles, /\.pokemon-v2-card[\s\S]*tw-overflow-x-auto/);
assert.match(v2Styles, /\.pokemon-v2-sections,[\s\S]*#pokemon-v2-forms[\s\S]*tw-min-w-0 tw-max-w-full/);
assert.doesNotMatch(v2Styles, /#pokemon-v2-evolution[\s\S]*tw-overflow-hidden/);
assert.match(v2Styles, /\.pokemon-v2-costs \.table-main[\s\S]*tw-w-full/);
assert.match(v2Styles, /\.pokemon-v2-metadata-item:last-child[\s\S]*tw-col-span-2/);
assert.match(v2Styles, /pokemon-assets-content[\s\S]*minmax\(min\(220px,100%\),1fr\)/);
assert.match(v2Styles, /\.asset-form-models[\s\S]*minmax\(min\(180px,100%\),1fr\)/);
assert.match(v2Styles, /\.asset-gender-model,[\s\S]*\.sub-group-model[\s\S]*tw-h-full tw-w-full/);
assert.match(v2Styles, /gender-ratio-content[\s\S]*\.gender-ratio-group[\s\S]*tw-min-w-0 tw-flex-1/);
assert.match(v2Styles, /pokemon-v2-form-options \.btn-default[\s\S]*tw-w-32 tw-min-w-32 tw-max-w-32/);
assert.match(v2Styles, /pokemon-v2-form-options \.pokemon-form-option-icon[\s\S]*tw-h-14/);
assert.match(
  v2Styles,
  /pokemon-v2-form-skeleton[\s\S]*width: 8rem !important;[\s\S]*min-width: 8rem !important;[\s\S]*max-width: 8rem !important;/
);
assert.match(
  v2Styles,
  /@media \(width >= 992px\)[\s\S]*pokemon-v2-form-options \.btn-default,[\s\S]*min-height: 142px !important/
);
assert.match(v2Styles, /gender-pokemon-modifier-icon[\s\S]*tw-h-6 tw-w-6 tw-object-contain/);
assert.match(
  v2Styles,
  /@media \(width >= 992px\)[\s\S]*gender-ratio-content[\s\S]*\.img-gender-group[\s\S]*> img:not\(\.gender-pokemon-modifier-icon\)[\s\S]*tw-h-20 tw-w-20/
);
assert.match(
  v2Styles,
  /@media \(width <= 575px\)[\s\S]*gender-ratio-content[\s\S]*\.ratio-gender[\s\S]*tw-whitespace-nowrap tw-text-left tw-text-body2/
);
assert.match(
  v2Styles,
  /@media \(width <= 575px\)[\s\S]*gender-ratio-content[\s\S]*\.img-gender[\s\S]*tw-h-8 tw-w-8 tw-flex-none/
);

for (const type of [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
]) {
  assert.match(variables, new RegExp(`--pokemon-type-${type}:`), `Missing design token for ${type}.`);
}
assert.match(vercel, /"source": "\/pokemon-v2\/:id"/);
assert.match(vercelPreview, /"source": "\/pokemon-v2\/:id"/);

console.log('Pokémon Details V2 route, navigation, sections, and responsive layout passed.');
