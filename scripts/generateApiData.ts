import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { PokemonDataGM } from '../src/core/models/options.model';

type GitTreeItem = { path: string; url: string };
type GitTree = { tree: GitTreeItem[] };
type GitCommit = {
  commit: { committer: { date: string }; tree: { url: string } };
  url: string;
};

const upstream = {
  gameMasterTimestamp: 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/timestamp.txt',
  gameMaster: 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json',
  imageCommit:
    'https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Images/Pokemon%20-%20256x256&page=1&per_page=1',
  soundCommit:
    'https://api.github.com/repos/PokeMiners/pogo_assets/commits?path=Sounds/Pokemon%20Cries&page=1&per_page=1',
};

const outputArg = process.argv.findIndex((arg) => arg === '--output');
const outputDirectory = resolve(outputArg >= 0 ? (process.argv[outputArg + 1] ?? 'api-data') : 'api-data');

const loadConfig = async () => {
  if (process.env.REACT_APP_CONFIG) return;

  const configPath = resolve('config.json');
  try {
    process.env.REACT_APP_CONFIG = await readFile(configPath, 'utf8');
  } catch {
    throw new Error('Set REACT_APP_CONFIG or create config.json before generating API data.');
  }
};

const headers = (): HeadersInit => {
  const token = process.env.SOURCE_GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'PokeGoBreeze-api-data-generator',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw new Error(`GET ${url} failed with HTTP ${response.status}`);
  return (await response.json()) as T;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw new Error(`GET ${url} failed with HTTP ${response.status}`);
  return response.text();
};

const findNestedTree = async (rootUrl: string, parent: string, leaf: string) => {
  const root = await fetchJson<GitTree>(rootUrl);
  const parentNode = root.tree.find((item) => item.path === parent);
  if (!parentNode) throw new Error(`Git tree path not found: ${parent}`);

  const children = await fetchJson<GitTree>(parentNode.url);
  const leafNode = children.tree.find((item) => item.path === leaf);
  if (!leafNode) throw new Error(`Git tree path not found: ${parent}/${leaf}`);
  return fetchJson<GitTree>(`${leafNode.url}?recursive=1`);
};

const writeJsonAtomic = async (path: string, value: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(value));
  await rename(temporaryPath, path);
};

const main = async () => {
  await loadConfig();

  // These imports must happen after REACT_APP_CONFIG is populated because the
  // existing domain helpers read it during module initialization.
  const options = await import('../src/core/options/index.ts');

  const [timestampText, gameMaster, imageCommits, soundCommits, encounterModule] = await Promise.all([
    fetchText(upstream.gameMasterTimestamp),
    fetchJson<PokemonDataGM[]>(upstream.gameMaster),
    fetchJson<GitCommit[]>(upstream.imageCommit),
    fetchJson<GitCommit[]>(upstream.soundCommit),
    import('../src/data/pokemon_encounter.json'),
    options.initializeStaticData(),
  ]);

  const imageCommit = imageCommits[0];
  const soundCommit = soundCommits[0];
  if (!imageCommit || !soundCommit) throw new Error('Upstream asset commit metadata is empty.');

  const [imageTree, soundTree] = await Promise.all([
    findNestedTree(imageCommit.commit.tree.url, 'Images', 'Pokemon - 256x256'),
    findNestedTree(soundCommit.commit.tree.url, 'Sounds', 'Pokemon Cries'),
  ]);

  const encounter = encounterModule.default;
  const typeEffective = options.optionPokemonTypes(gameMaster);
  const weatherBoost = options.optionPokemonWeather(gameMaster);
  const pokemons = options.optionPokemonData(gameMaster, encounter);
  const combats = options.optionCombat(gameMaster, typeEffective);
  options.mappingMoveSetPokemonGO(pokemons, combats);

  const assets = options.optionAssets(
    pokemons,
    options.optionPokeImg(imageTree),
    options.optionPokeSound(soundTree)
  );
  options.mappingReleasedPokemonGO(pokemons, assets);

  const sections: Record<string, unknown> = {
    options: options.optionSettings(gameMaster, typeEffective, weatherBoost),
    pokemons,
    combats,
    assets,
    leagues: options.optionLeagues(gameMaster, pokemons),
    evolutionChains: options.optionEvolutionChain(gameMaster, pokemons),
    information: options.optionInformation(gameMaster, pokemons),
    stickers: options.optionSticker(gameMaster, pokemons),
    trainers: options.optionTrainer(gameMaster),
  };

  await Promise.all(
    Object.entries(sections).map(([name, value]) => writeJsonAtomic(resolve(outputDirectory, `${name}.json`), value))
  );

  await writeJsonAtomic(resolve(outputDirectory, 'meta.json'), {
    schemaVersion: 1,
    webVersion: process.env.REACT_APP_VERSION ?? null,
    generatedAt: new Date().toISOString(),
    source: {
      gameMaster: Number(timestampText.trim()),
      assets: new Date(imageCommit.commit.committer.date).getTime(),
      sounds: new Date(soundCommit.commit.committer.date).getTime(),
    },
    sections: Object.fromEntries(
      Object.entries(sections).map(([name, value]) => [name, Array.isArray(value) ? value.length : 1])
    ),
  });
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
