import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, '../../src/assets/generated/pokemon-go-ui');
const hqTypeOutputDirectory = resolve(scriptDirectory, '../../src/assets/generated/move-type-hq');
const typeMaskOutputDirectory = resolve(scriptDirectory, '../../src/assets/generated/move-type-mask');
const typeOutputDirectory = resolve(scriptDirectory, '../../src/assets/types');
const pokeMinersSourceRoot = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/';
const wikiSourceRoot = 'https://static.wikia.nocookie.net/pokemongo/images/';
const typeMaskSourceRoot =
  'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/Others/type-icons/png-original/';
const assets = {
  shadow: 'Rocket/ic_shadow.png',
  purified: 'Rocket/ic_purified.png',
  buddyCrown: 'Buddy/pokemonBuddyCrownSml.png',
  shiny: 'Pokedex/ic_shiny.png',
  genderMale: 'Pokedex/male_l.png',
  genderFemale: 'Pokedex/female_l.png',
  fastMove: 'Items/Item_1201.png',
  chargedMove: 'Items/Item_1202.png',
  stardust: 'Items/stardust_painted.png',
};
const pokemonTypes = [
  'BUG',
  'DARK',
  'DRAGON',
  'ELECTRIC',
  'FAIRY',
  'FIGHTING',
  'FIRE',
  'FLYING',
  'GHOST',
  'GRASS',
  'GROUND',
  'ICE',
  'NORMAL',
  'POISON',
  'PSYCHIC',
  'ROCK',
  'STEEL',
  'WATER',
];
const hqTypePaths = {
  BUG: '7/7d',
  DARK: '0/0e',
  DRAGON: 'c/c7',
  ELECTRIC: '2/2f',
  FAIRY: '4/43',
  FIGHTING: '3/30',
  FIRE: '3/30',
  FLYING: '7/7f',
  GHOST: 'a/ab',
  GRASS: 'c/c5',
  GROUND: '8/8f',
  ICE: '7/77',
  NORMAL: 'f/fb',
  POISON: '0/05',
  PSYCHIC: '2/21',
  ROCK: '0/0b',
  STEEL: 'c/c9',
  WATER: '9/9d',
};

const fileNames = Object.fromEntries(Object.keys(assets).map((key) => [key, `${key}.png`]));
const definitions = [
  ...Object.entries(assets).map(([key, sourcePath]) => ({
    key,
    source: 'PokeMiners/pogo_assets',
    sourceRoot: pokeMinersSourceRoot,
    sourcePath,
    file: fileNames[key],
    outputDirectory,
    localPath: `src/assets/generated/pokemon-go-ui/${fileNames[key]}`,
  })),
  ...pokemonTypes.map((type) => ({
    key: `type${type[0]}${type.slice(1).toLowerCase()}`,
    source: 'PokeMiners/pogo_assets',
    sourceRoot: pokeMinersSourceRoot,
    sourcePath: `Types/POKEMON_TYPE_${type}.png`,
    file: `POKEMON_TYPE_${type}.png`,
    outputDirectory: typeOutputDirectory,
    localPath: `src/assets/types/POKEMON_TYPE_${type}.png`,
  })),
  ...pokemonTypes.map((type) => {
    const titleCaseType = `${type[0]}${type.slice(1).toLowerCase()}`;
    return {
      key: `hqType${titleCaseType}`,
      source: 'Pokémon GO Wiki',
      sourceRoot: wikiSourceRoot,
      sourcePath: `${hqTypePaths[type]}/${titleCaseType}.png?format=original`,
      file: `${titleCaseType}.png`,
      outputDirectory: hqTypeOutputDirectory,
      localPath: `src/assets/generated/move-type-hq/${titleCaseType}.png`,
    };
  }),
  ...pokemonTypes.map((type) => ({
    key: `typeMask${type[0]}${type.slice(1).toLowerCase()}`,
    source: 'HybridShivam/Pokemon type icons',
    sourceRoot: typeMaskSourceRoot,
    sourcePath: `${type.toLowerCase()}.png`,
    file: `${type.toLowerCase()}.png`,
    outputDirectory: typeMaskOutputDirectory,
    localPath: `src/assets/generated/move-type-mask/${type.toLowerCase()}.png`,
  })),
];
const download = async ({ key, source, sourceRoot, sourcePath, file, outputDirectory: targetDirectory, localPath }) => {
  const url = `${sourceRoot}${sourcePath}`;
  const response = await fetch(url, { headers: { 'user-agent': 'PokeGoBreeze local UI asset updater' } });
  if (!response.ok) throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${url} is not a PNG file.`);
  return {
    key,
    source,
    sourcePath,
    url,
    data,
    file,
    outputDirectory: targetDirectory,
    localPath,
    bytes: data.byteLength,
    sha256: createHash('sha256').update(data).digest('hex'),
  };
};

const downloaded = await Promise.all(definitions.map(download));
await Promise.all([
  mkdir(outputDirectory, { recursive: true }),
  mkdir(hqTypeOutputDirectory, { recursive: true }),
  mkdir(typeMaskOutputDirectory, { recursive: true }),
  mkdir(typeOutputDirectory, { recursive: true }),
]);
await Promise.all(downloaded.map((asset) => writeFile(resolve(asset.outputDirectory, asset.file), asset.data)));

const manifest = {
  sources: {
    'PokeMiners/pogo_assets': pokeMinersSourceRoot,
    'Pokémon GO Wiki': wikiSourceRoot,
    'HybridShivam/Pokemon type icons': typeMaskSourceRoot,
  },
  assets: Object.fromEntries(
    downloaded.map(({ key, source, sourcePath, url, file, localPath, bytes, sha256 }) => [
      key,
      { source, sourcePath, url, file, localPath, bytes, sha256 },
    ])
  ),
};
await writeFile(resolve(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Updated ${downloaded.length} local Pokémon GO UI assets (${downloaded.reduce((sum, asset) => sum + asset.bytes, 0)} bytes).`
);
