import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  getAvailableOriginSoundCries,
  getPokemonGoCryFormLabel,
} from '../../src/components/Info/Assets/pokemon-sound.utils.ts';
import { findPokemonStatsForm } from '../../src/utils/pokemon-form-identity.ts';

const [pokemons, assets] = await Promise.all([
  readFile(new URL('../../../api/data/pokemons.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../../../api/data/assets.json', import.meta.url), 'utf8').then(JSON.parse),
]);

const speciesIds = [...new Set(pokemons.map((pokemon) => Number(pokemon.num)))].sort((left, right) => left - right);
const assetsById = new Map();
for (const asset of assets) {
  assert(!assetsById.has(Number(asset.id)), `Duplicate Pokémon asset record: #${asset.id}`);
  assetsById.set(Number(asset.id), asset);
}
assert.deepEqual(
  [...assetsById.keys()].sort((left, right) => left - right),
  speciesIds,
  'Pokémon Detail must receive one species-scoped asset record for every generated ID'
);

let imageCount = 0;
let cryCount = 0;
let idsWithImages = 0;
let idsWithCries = 0;
for (const id of speciesIds) {
  const asset = assetsById.get(id);
  const images = asset.image ?? [];
  const cries = asset.sound?.cry ?? [];
  idsWithImages += Number(images.length > 0);
  idsWithCries += Number(cries.length > 0);
  imageCount += images.length;
  cryCount += cries.length;

  const imageKeys = new Set();
  for (const image of images) {
    const key = `${image.form ?? ''}:${image.gender ?? ''}:${image.default}`;
    assert(!imageKeys.has(key), `Duplicate image in Pokémon Detail asset record #${id}: ${key}`);
    imageKeys.add(key);
    if (image.default.startsWith('/')) {
      assert.match(image.default, new RegExp(`^/pm${id}(?:\\.|$)`, 'i'), `Image belongs to another ID: #${id}`);
    }
    assert(!image.default.endsWith('.s.icon'), `Shiny icon stored as default for #${id}: ${image.default}`);
  }

  const cryPaths = new Set();
  const cryLabels = new Set();
  for (const cry of cries) {
    assert(!cryPaths.has(cry.path), `Duplicate cry path for #${id}: ${cry.path}`);
    cryPaths.add(cry.path);
    if (cry.path.startsWith('/')) {
      assert.match(cry.path, new RegExp(`^/pm${id}(?:\\.|$)`, 'i'), `Cry belongs to another ID: #${id}`);
    } else {
      const paddedId = String(id).padStart(3, '0');
      assert.match(cry.path, new RegExp(`^pv${paddedId}(?:_|$)`, 'i'), `Legacy cry belongs to another ID: #${id}`);
    }
    const label = getPokemonGoCryFormLabel(cry.form, cry.path);
    assert(!cryLabels.has(label), `Duplicate cry label for #${id}: ${label}`);
    cryLabels.add(label);
  }
}

const bulbasaur = assetsById.get(1);
assert(bulbasaur.image.some((image) => image.default === '/pm1.icon' && image.shiny === '/pm1.s.icon'));
assert.deepEqual(bulbasaur.sound.cry, [{ form: 'NORMAL', path: '/pm1.cry', pokemonType: 1 }]);
assert.equal(getPokemonGoCryFormLabel('NORMAL', 'pv845_32'), 'Variant 32');
assert.equal(getPokemonGoCryFormLabel('MEGA_X', 'pv006_51'), 'Mega X');
assert.deepEqual(
  findPokemonStatsForm(
    [
      { id: 849, form: 'AMPED', attack: 224 },
      { id: 849, form: 'AMPED_GMAX', attack: 224 },
      { id: 849, form: 'LOW_KEY_GMAX', attack: 224 },
    ],
    849,
    'GMAX'
  ),
  { id: 849, form: 'AMPED_GMAX', attack: 224 },
  'generic PokéAPI Gmax forms must inherit a matching Pokémon GO Gmax stat row'
);
assert.deepEqual(
  getAvailableOriginSoundCries([
    { form: 'NORMAL', cries: {} },
    { form: 'ALOLA', cries: { latest: '', legacy: undefined } },
    { form: 'GALAR', cries: { latest: 'https://example.test/cry.ogg' } },
  ]).map((cry) => cry.form),
  ['GALAR'],
  'PokéAPI fallback rows without playable cry URLs must render as unavailable'
);

console.log(
  `Pokémon Detail asset/sound audit passed: ${speciesIds.length} IDs, ${imageCount} images across ${idsWithImages} IDs, ${cryCount} cries across ${idsWithCries} IDs.`
);
