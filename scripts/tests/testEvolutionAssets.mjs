import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [display, specialForm, evolutionStyles, selector, moveDetail, viteConfig, iconManifest] = await Promise.all([
  readFile(new URL('../../src/components/Info/Evolution/EvolutionPokemonDisplay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/SpecialForm/SpecialForm.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/Evolution.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/utils/pokemon-animation-assets.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/pages/Move/Move.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../vite.config.ts', import.meta.url), 'utf8'),
  readFile(new URL('../../src/assets/generated/pokemon-icons/pokemon-icon-index.json', import.meta.url), 'utf8').then(
    JSON.parse
  ),
]);

assert.match(display, /findAnimationForm\(id, form, pokemonType\)/);
assert.match(display, /findExactAssetForm\(id, form\)/);
assert.match(display, /if \(formVaries\)/);
assert.match(display, /sortAnimationSources\(animation\?\.sources \?\? \[\]\)/);
assert.match(display, /loading="lazy"/);
assert.match(display, /referrerPolicy="no-referrer"/);
assert.match(display, /resolveExactPokemonIconIndex/);
assert.match(display, /<PokemonTableIcon/);
assert.match(display, /exactMiniIcon !== undefined/);
assert.equal(iconManifest.indexes.darkraimega, 1438, 'Darkrai Mega must have an exact vendored minisprite fallback');
assert.match(display, /className="evolution-form-badge"/);
assert.match(display, /title=\{formLabel\}/);
assert.match(evolutionStyles, /\.evolution-form-badge > \.MuiBadge-badge/);
assert.match(evolutionStyles, /text-overflow: ellipsis/);
assert.match(evolutionStyles, /white-space: nowrap/);
assert.doesNotMatch(display, /getPokeSprite\(id\)/, 'Evolution must not fall back to a different default form by ID');
assert.match(specialForm, /findAnimationForm\(id, formName, pokemonType\)/);
assert.match(specialForm, /findExactAssetForm\(id, formName\)/);
assert.match(specialForm, /sortAnimationSources\(animation\?\.sources \?\? \[\]\)/);
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
