import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, '../../src/assets/generated/pokemon-icons');
const sheetUrl = 'https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png';
const indexUrl =
  'https://raw.githubusercontent.com/smogon/pokemon-showdown-client/master/play.pokemonshowdown.com/src/battle-dex-data.ts';

const download = async (url) => {
  const response = await fetch(url, { headers: { 'user-agent': 'PokeGoBreeze icon sheet updater' } });
  if (!response.ok) {
    throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

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

const pngDimensions = (buffer) => {
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature) throw new Error('Downloaded sheet is not a PNG file.');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

const [sheet, indexSource] = await Promise.all([download(sheetUrl), download(indexUrl)]);
const dimensions = pngDimensions(sheet);
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
