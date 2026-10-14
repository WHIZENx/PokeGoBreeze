import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetRoot = resolve(webRoot, 'src/assets/generated/pokemon-icons');
const manifest = JSON.parse(await readFile(resolve(assetRoot, 'pokemon-icon-index.json'), 'utf8'));
const sheet = await readFile(resolve(assetRoot, 'pokemonicons-sheet.png'));
const pokemon = JSON.parse(await readFile(resolve(webRoot, '../api/data/pokemons.json'), 'utf8'));

const fail = (message) => {
  throw new Error(message);
};
const toId = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const normalize = (value = '') => {
  let id = toId(value);
  if (['', 'unknown', 'unknownpokemon'].includes(id)) return '';
  return id
    .replaceAll('hisuian', 'hisui')
    .replaceAll('galarian', 'galar')
    .replaceAll('alolan', 'alola')
    .replaceAll('paldean', 'paldea')
    .replace(/breed$/, '')
    .replace(/exclamationpoint$/, 'exclamation')
    .replace(/questionmark$/, 'question')
    .replace(/eastsea$/, 'east')
    .replace(/female$/, 'f')
    .replace(/complete(?:fifty|ten)percent$/, 'complete')
    .replace(/tenpercent$/, '10')
    .replace(/originalcolor$/, 'original')
    .replace(/familyoffour$/, 'four')
    .replace(/crownedsword$/, 'crowned')
    .replace(/crownedshield$/, 'crowned')
    .replace(/icerider$/, 'ice')
    .replace(/shadowrider$/, 'shadow');
};
const candidates = (entry) => {
  const base = normalize(entry.baseSpecies);
  return [
    normalize(entry.sprite),
    normalize(entry.slug),
    normalize(entry.fullName),
    normalize(entry.name),
    base ? normalize(`${base}-${entry.form}`) : '',
  ].filter(Boolean);
};
const alternateIndex = (entry) => {
  const key = candidates(entry).find((candidate) => manifest.indexes[candidate] !== undefined);
  return key ? { key, index: manifest.indexes[key] } : undefined;
};

if (sheet.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') fail('Local icon sheet is not a PNG.');
const imageWidth = sheet.readUInt32BE(16);
const imageHeight = sheet.readUInt32BE(20);
if (imageWidth !== manifest.sheet.imageWidth || imageHeight !== manifest.sheet.imageHeight) {
  fail(`Manifest dimensions do not match the PNG (${imageWidth}x${imageHeight}).`);
}
if (createHash('sha256').update(sheet).digest('hex') !== manifest.source.sheetSha256) {
  fail('Local icon sheet checksum does not match the generated manifest.');
}

const cellCount =
  (manifest.sheet.imageWidth / manifest.sheet.cellWidth) *
  (manifest.sheet.imageHeight / manifest.sheet.cellHeight);
for (const [key, index] of Object.entries(manifest.indexes)) {
  if (!Number.isInteger(index) || index < 0 || index >= cellCount) fail(`${key} has an invalid sheet index: ${index}`);
}

const expectedForms = new Map([
  ['ZACIAN:CROWNED_SWORD', 'zaciancrowned'],
  ['ZAMAZENTA:CROWNED_SHIELD', 'zamazentacrowned'],
  ['CALYREX:ICE_RIDER', 'calyrexice'],
  ['CALYREX:SHADOW_RIDER', 'calyrexshadow'],
  ['DECIDUEYE:HISUIAN', 'decidueyehisui'],
  ['DIALGA:ORIGIN', 'dialgaorigin'],
  ['PALKIA:ORIGIN', 'palkiaorigin'],
  ['UNOWN:EXCLAMATION_POINT', 'unownexclamation'],
  ['SHELLOS:EAST_SEA', 'shelloseast'],
  ['FRILLISH:FEMALE', 'frillishf'],
  ['ZYGARDE:TEN_PERCENT', 'zygarde10'],
  ['ZYGARDE:COMPLETE_FIFTY_PERCENT', 'zygardecomplete'],
  ['MAGEARNA:ORIGINAL_COLOR', 'magearnaoriginal'],
  ['MAUSHOLD:FAMILY_OF_FOUR', 'mausholdfour'],
]);
for (const [identity, expectedKey] of expectedForms) {
  const [pokemonId, form] = identity.split(':');
  const entry = pokemon.find((item) => item.pokemonId === pokemonId && item.form === form);
  if (!entry) fail(`Fixture ${identity} is missing from the API Pokémon data.`);
  const resolved = alternateIndex(entry);
  if (resolved?.key !== expectedKey) fail(`${identity} resolved to ${resolved?.key ?? 'base species'}, not ${expectedKey}.`);
}

const tableFiles = [
  'src/pages/Sheets/StatsRanking/StatsRanking.tsx',
  'src/pages/Sheets/DpsTdo/DpsTdo.tsx',
  'src/pages/Search/Types/Types.tsx',
  'src/pages/Move/Move.tsx',
  'src/components/Commons/Buttons/ButtonGroupForm.tsx',
];
for (const relativePath of tableFiles) {
  const source = await readFile(resolve(webRoot, relativePath), 'utf8');
  if (!source.includes('<PokemonTableIcon')) fail(`${relativePath} is not using the local sheet component.`);
  if (/getPokeIconSprite\(row(?:\.pokemon)?\.sprite/.test(source)) {
    fail(`${relativePath} still requests a per-Pokémon table icon.`);
  }
}

const dropdownIconFiles = [
  'src/components/Card/CardPokemon.tsx',
  'src/components/Commons/Selects/SelectPokemon.tsx',
  'src/components/Find/Find.tsx',
  'src/pages/Search/Pokemon/Search.tsx',
  'src/pages/PVP/Battle/Select.tsx',
  'src/pages/Trainer/TrainerLab.tsx',
];
for (const relativePath of dropdownIconFiles) {
  const source = await readFile(resolve(webRoot, relativePath), 'utf8');
  if (!source.includes('<PokemonTableIcon')) fail(`${relativePath} is not using the local sheet in its Pokémon picker.`);
  if (/\b(?:sprite|onSprite)=/.test(source)) {
    fail(`${relativePath} still passes the legacy per-Pokémon icon props to a picker.`);
  }
}

const selectCardSource = await readFile(
  resolve(webRoot, 'src/components/Commons/Selects/SelectCardPokemon.tsx'),
  'utf8'
);
if (/getPokeIconSprite|<img\b/.test(selectCardSource)) {
  fail('SelectCardPokemon still renders a per-Pokémon image request.');
}

const alternateRows = pokemon.filter((entry) => alternateIndex(entry)).length;
console.log(
  `Pokémon icon sheet audit passed: ${Object.keys(manifest.indexes).length} alternate indexes, ` +
    `${alternateRows}/${pokemon.length} data rows use a form cell; remaining rows use their National Pokédex cell.`
);
