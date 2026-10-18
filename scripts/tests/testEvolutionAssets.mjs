import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [display, evolutionStyles, selector, viteConfig, iconManifest] = await Promise.all([
  readFile(new URL('../../src/components/Info/Evolution/EvolutionPokemonDisplay.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../../src/components/Info/Evolution/Evolution.scss', import.meta.url), 'utf8'),
  readFile(new URL('../../src/utils/pokemon-animation-assets.ts', import.meta.url), 'utf8'),
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
