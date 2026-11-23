import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pngDimensions, sha256, webRoot } from '../support/assetFiles.mjs';

const download = async (url, userAgent) => {
  const response = await fetch(url, { headers: { 'user-agent': userAgent } });
  if (!response.ok) throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
};

const updateLocalUiAssets = async () => {
  const outputDirectory = resolve(webRoot, 'src/assets/generated/pokemon-go-ui');
  const hqTypeOutputDirectory = resolve(webRoot, 'src/assets/generated/move-type-hq');
  const typeMaskOutputDirectory = resolve(webRoot, 'src/assets/generated/move-type-mask');
  const typeOutputDirectory = resolve(webRoot, 'src/assets/types');
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
    experience: 'Today View/TodayView_Icon_XP.png',
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
  const downloadUiAsset = async ({
    key,
    source,
    sourceRoot,
    sourcePath,
    file,
    outputDirectory: targetDirectory,
    localPath,
  }) => {
    const url = `${sourceRoot}${sourcePath}`;
    const data = await download(url, 'PokeGoBreeze local UI asset updater');
    pngDimensions(data, url);
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
      sha256: sha256(data),
    };
  };

  const downloaded = await Promise.all(definitions.map(downloadUiAsset));
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
};

const updatePokemonIconSheet = async () => {
  const outputDirectory = resolve(webRoot, 'src/assets/generated/pokemon-icons');
  const sheetUrl = 'https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png';
  const indexUrl =
    'https://raw.githubusercontent.com/smogon/pokemon-showdown-client/master/play.pokemonshowdown.com/src/battle-dex-data.ts';

  const evaluateIntegerExpression = (expression) => {
    if (!/^\d+(?:\s*\+\s*\d+)*$/.test(expression)) {
      throw new Error(`Unsupported icon index expression: ${expression}`);
    }
    return expression.split('+').reduce((total, value) => total + Number.parseInt(value.trim(), 10), 0);
  };

  const parseIconIndexes = (source) => {
    const block = source.match(/export const BattlePokemonIconIndexes[^=]*=\s*\{([\s\S]*?)\n\};/);
    if (!block) {
      throw new Error('BattlePokemonIconIndexes was not found in the Pokémon Showdown client source.');
    }

    const indexes = {};
    for (const line of block[1].split('\n')) {
      const entry = line.match(/^\s*([a-z0-9]+):\s*([^,]+),/);
      if (entry) indexes[entry[1]] = evaluateIntegerExpression(entry[2].trim());
    }
    if (Object.keys(indexes).length < 200) {
      throw new Error(`Only ${Object.keys(indexes).length} alternate icon indexes were parsed.`);
    }
    return indexes;
  };

  const userAgent = 'PokeGoBreeze icon sheet updater';
  const [sheet, indexSource] = await Promise.all([download(sheetUrl, userAgent), download(indexUrl, userAgent)]);
  const dimensions = pngDimensions(sheet, 'Downloaded sheet');
  const indexes = parseIconIndexes(indexSource.toString('utf8'));
  const cell = { width: 40, height: 30, columns: 12 };

  if (dimensions.width !== cell.width * cell.columns || dimensions.height % cell.height !== 0) {
    throw new Error(`Unexpected icon sheet dimensions: ${dimensions.width}x${dimensions.height}`);
  }

  const manifest = {
    source: {
      sheet: sheetUrl,
      indexes: indexUrl,
      sheetSha256: sha256(sheet),
      indexesSha256: sha256(indexSource),
    },
    sheet: {
      imageWidth: dimensions.width,
      imageHeight: dimensions.height,
      cellWidth: cell.width,
      cellHeight: cell.height,
      columns: cell.columns,
    },
    indexes,
  };

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, 'pokemonicons-sheet.png'), sheet),
    writeFile(resolve(outputDirectory, 'pokemon-icon-index.json'), `${JSON.stringify(manifest, null, 2)}\n`),
  ]);

  console.log(
    `Updated local Pokémon icon sheet (${dimensions.width}x${dimensions.height}, ${Object.keys(indexes).length} alternate forms).`
  );
};

const [target, ...extraArgs] = process.argv.slice(2);
if (extraArgs.length || !['ui', 'icon-sheet'].includes(target)) {
  throw new Error('Usage: node scripts/data/updateAssets.mjs <ui|icon-sheet>');
}

if (target === 'ui') await updateLocalUiAssets();
else await updatePokemonIconSheet();
