import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  display,
  fusion,
  specialForm,
  evolution,
  evolutionStyles,
  pokemonDetailModel,
  pokemons,
  selector,
  moveDetail,
  viteConfig,
  iconManifest,
  pokemonPage,
  assets,
] = await Promise.all([
  readFile(new URL('../../src/components/Info/Evolution/EvolutionPokemonDisplay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/FormChange/Fusion.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/SpecialForm/SpecialForm.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/Evolution.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/Evolution.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/core/models/API/info.model.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../../api/data/pokemons.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../../src/utils/pokemon-animation-assets.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../vite.config.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/assets/generated/pokemon-icons/pokemon-icon-index.json', import.meta.url), 'utf8').then(
    JSON.parse
  ),
  readFile(new URL('../../src/pages/Pokemon/Pokemon.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../../api/data/assets.json', import.meta.url), 'utf8').then(JSON.parse),
]);

assert.match(display, /findAnimationForm\(id, form, pokemonType\)/);
assert.match(pokemonPage, /hydrateCanonicalPokemonDetail\(details, id, form\)/);
const clefableMegaAnimation = assets
  .find((asset) => asset.id === 36)
  ?.animation?.find((animation) => animation.form === 'MEGA' && animation.pokemonType === 4);
assert.deepEqual(
  clefableMegaAnimation?.sources.map((source) => source.source),
  ['pokeapi', 'showdown'],
  'Clefable Mega must use exact canonical GIF sources rather than the Normal animation'
);
const igglybuff = pokemons.find(
  (pokemon) => Number(pokemon.num) === 174 && pokemon.form === 'NORMAL' && pokemon.pokemonType === 1
);
assert.equal(igglybuff?.isBaby, true, 'Generated Igglybuff must retain its canonical baby identity.');
assert.match(pokemonDetailModel, /isBaby: boolean/);
assert.match(pokemonDetailModel, /isBaby = false/);
assert.match(pokemonDetailModel, /obj\.isBaby = data\.isBaby/);
assert.match(evolution, /pokemon\.isBaby,/);
assert.match(evolution, /value\.isBaby && <span className="caption tw-text-error">\(Baby\)<\/span>/);
assert.match(display, /findExactAssetForm\(id, form\)/);
assert.match(display, /if \(formVaries\)/);
assert.match(display, /sortAnimationSources\(animation\?\.sources \?\? \[\]\)/);
assert.match(display, /loading="eager"/);
assert.match(display, /referrerPolicy="no-referrer"/);
assert.match(display, /const activeImageRef = useRef<HTMLImageElement>\(null\)/);
assert.match(display, /if \(!activeSource \|\| !image\?\.complete\)/);
assert.match(display, /if \(image\.naturalWidth === 0\)/);
assert.match(display, /ref=\{activeImageRef\}/);
assert.match(display, /onError=\{advanceSource\}/);
assert.match(display, /resolveExactPokemonIconIndex/);
assert.match(display, /<PokemonTableIcon/);
assert.match(display, /exactMiniIcon !== undefined/);
assert.equal(iconManifest.indexes.darkraimega, 1438, 'Darkrai Mega must have an exact vendored minisprite fallback');
assert.match(display, /className="evolution-form-badge"/);
assert.match(display, /title=\{formLabel\}/);
assert.match(fusion, /option\.targetPokemonType/);
assert.match(fusion, /pokemonType=\{pokemonType\}/);
assert.match(fusion, /data-fusion-target-pokemon-type=\{option\.targetPokemonType\}/);
assert.match(evolutionStyles, /\.evolution-form-badge > \.MuiBadge-badge/);
assert.match(evolutionStyles, /text-overflow: ellipsis/);
assert.match(evolutionStyles, /white-space: nowrap/);
assert.match(evolutionStyles, /\.evolution-connector\s*\{[\s\S]*z-index: auto !important;/);
assert.match(evolutionStyles, /\.evolution-connector-canvas\s*\{[\s\S]*z-index: 0;/);
assert.match(evolutionStyles, /\.evolution-connector > div\s*\{[\s\S]*z-index: 1;/);
assert.match(evolutionStyles, /\.evo-arrow-details\s*\{[\s\S]*z-index: 1;/);
assert.match(evolutionStyles, /\.evolution-assets-loading \.evolution-connector\s*\{[\s\S]*visibility: hidden/);
assert.match(display, /const normalizedForm = form\.replaceAll\('-', '_'\)\.toUpperCase\(\)/);
assert.match(
  display,
  /\(normalizedForm === '' \|\| normalizedForm === 'NORMAL'\)[\s\S]*pokemonType === PokemonType\.None \|\| pokemonType === PokemonType\.Normal/
);
assert.match(
  display,
  /if \(isOrdinaryDefaultForm\) \{\s*sources\.push\(APIService\.getPokeSprite\(id\)\);\s*\}/,
  'An ordinary NORMAL form may use its same-ID static PokéAPI sprite when GO animation and model assets are absent.'
);
assert.match(specialForm, /findAnimationForm\(id, formName, pokemonType\)/);
assert.match(specialForm, /findExactAssetForm\(id, formName\)/);
assert.match(specialForm, /sortAnimationSources\(animation\?\.sources \?\? \[\]\)/);
assert.match(
  specialForm,
  /form\.sprites\?\.frontDefault, form\.sprites\?\.frontHome, form\.sprites\?\.frontArtwork/,
  'Canonical Mega forms without a GIF must use their exact PokéAPI form sprite before the unknown placeholder.'
);
assert.match(specialForm, /data-testid="mega-evolution-pokemon-image"/);
assert.match(specialForm, /loading="lazy"/);
assert.match(specialForm, /referrerPolicy="no-referrer"/);
assert.match(specialForm, /name\.trim\(\)\.replaceAll\(' ', '_'\)\.toUpperCase\(\)/);
assert.doesNotMatch(
  specialForm,
  /replace\(\/\\\+\$\//,
  'Mega attack links must preserve + so their unique Game Master move resolves'
);
assert.match(moveDetail, /move\?\.isMegaAttack/);
assert.match(moveDetail, /move\.megaLevelPowerMultipliers/);
assert.doesNotMatch(
  specialForm,
  /getPokeGifSprite\(value\.name\)/,
  'Mega Evolution cards must resolve the generated animation manifest instead of a legacy name URL'
);
assert.match(
  selector,
  /normalizedPokemonType === PokemonType\.Shadow \|\| normalizedPokemonType === PokemonType\.Purified/
);
assert.match(selector, /\[PokemonType\.Normal, PokemonType\.None\]/);
assert.match(selector, /animation\.pokemonType === basePokemonType/);
assert.match(selector, /pokemonType === PokemonType\.None \? PokemonType\.Normal : pokemonType/);
assert.match(selector, /\['project', 'pokeapi', 'showdown'\]/);
assert.match(
  selector,
  /animation\.pokemonType === pokemonType[\s\S]*const normalizedPokemonType/,
  'GO forms whose exact type is None, such as Genesect drives, must match before the Normal compatibility fallback'
);
assert.match(selector, /animation\.form\.toUpperCase\(\) === normalizedForm/);
assert.doesNotMatch(viteConfig, /hmr:\s*\{[^}]*port:\s*9001/s, 'HMR must share the reachable Vite server port');

console.log('Validated exact Evolution form selection, modifier reuse, and static fallback wiring.');
