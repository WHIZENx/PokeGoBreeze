import { readFile } from 'node:fs/promises';
import { getPvpokeSpeciesCandidates } from '../../src/utils/pvpoke-species.ts';

const repository = 'pvpoke/pvpoke';
const treeUrl = `https://api.github.com/repos/${repository}/git/trees/master?recursive=1`;
const rawBase = `https://raw.githubusercontent.com/${repository}/master/`;
const gameMasterPath = 'src/data/gamemaster.json';
const rankingPath = /^src\/data\/rankings\/([^/]+)\/([^/]+)\/rankings-(\d+)\.json$/;
const teamPath = /^src\/data\/training\/analysis\/([^/]+)\/(\d+)\.json$/;
const battleCp = new Set([500, 1500, 2500, 10000]);
const pokemons = JSON.parse(
  await readFile(new URL('../../../api/data/pokemons.json', import.meta.url), 'utf8')
);
const meta = JSON.parse(await readFile(new URL('../../../api/data/meta.json', import.meta.url), 'utf8'));
const pokemonByFullName = new Map(
  pokemons
    .filter((pokemon) => pokemon.num > 0 && pokemon.fullName)
    .map((pokemon) => [pokemon.fullName, pokemon])
);

const fetchJson = async (url, attempts = 4) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'PokeGoBreeze-PvP-Coverage-Audit' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${url}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 500));
      }
    }
  }
  throw lastError;
};

const tree = await fetchJson(treeUrl);
if (tree.truncated) {
  throw new Error('PvPoke Git tree is truncated; exhaustive PvP coverage audit cannot continue.');
}

const rankingPaths = tree.tree
  .filter((entry) => entry.type === 'blob' && rankingPath.test(entry.path ?? ''))
  .map((entry) => entry.path)
  .sort();
const teamPaths = tree.tree
  .filter((entry) => entry.type === 'blob' && teamPath.test(entry.path ?? ''))
  .map((entry) => entry.path)
  .sort();
const battlePaths = new Set(
  rankingPaths.filter((path) => {
    const match = path.match(rankingPath);
    return match?.[1] === 'all' && match[2] === 'overall' && battleCp.has(Number(match[3]));
  })
);
if (rankingPaths.length === 0 || teamPaths.length === 0 || battlePaths.size !== battleCp.size) {
  throw new Error(
    `Incomplete PvPoke coverage: ${rankingPaths.length} ranking files, ${teamPaths.length} team files, ` +
      `${battlePaths.size}/${battleCp.size} battle files.`
  );
}

const categories = {
  rank: { contexts: new Set(), files: new Set(), series: new Set(), references: 0, species: new Set() },
  team: { contexts: new Set(), files: new Set(), series: new Set(), references: 0, species: new Set() },
  battle: { contexts: new Set(), files: new Set(), series: new Set(), references: 0, species: new Set() },
};
const unresolved = new Map();
const sourceOnly = new Map();

const inspectPokemon = (category, speciesValue, path, context, series) => {
  const speciesId = String(speciesValue ?? '').trim().split(/\s+/, 1)[0];
  if (!speciesId) {
    return;
  }
  const stats = categories[category];
  stats.references += 1;
  stats.contexts.add(context);
  stats.files.add(path);
  stats.series.add(series);
  stats.species.add(speciesId.toLowerCase());
  const pokemon = getPvpokeSpeciesCandidates(speciesId)
    .map((candidate) => pokemonByFullName.get(candidate))
    .find(Boolean);
  if (pokemon) {
    return;
  }
  const sourceOnlyPokemon = sourceOnlySpecies.has(speciesId.toLowerCase());
  const key = `${category}:${speciesId.toLowerCase()}`;
  const collection = sourceOnlyPokemon ? sourceOnly : unresolved;
  const issue = collection.get(key) ?? { category, speciesId, count: 0, paths: [] };
  issue.count += 1;
  if (issue.paths.length < 3 && !issue.paths.includes(path)) {
    issue.paths.push(path);
  }
  collection.set(key, issue);
};

const paths = [...rankingPaths, ...teamPaths];
const pvpGameMaster = await fetchJson(`${rawBase}${gameMasterPath}`);
const sourceOnlySpecies = new Set(
  (pvpGameMaster.pokemon ?? [])
    .filter((pokemon) => pokemon.tags?.includes('supermega') && pokemon.speciesId)
    .map((pokemon) => pokemon.speciesId.toLowerCase())
);
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(12, paths.length) }, async () => {
    while (cursor < paths.length) {
      const path = paths[cursor++];
      const data = await fetchJson(`${rawBase}${path}`);
      const rankingMatch = path.match(rankingPath);
      if (rankingMatch) {
        const league = `${rankingMatch[1]}/${rankingMatch[2]}/${rankingMatch[3]}`;
        const isBattle = battlePaths.has(path);
        for (const row of data) {
          const references = [
            row.speciesId,
            ...(row.counters ?? []).map((entry) => entry.opponent),
            ...(row.matchups ?? []).map((entry) => entry.opponent),
          ];
          references.forEach((speciesId) => inspectPokemon('rank', speciesId, path, league, rankingMatch[1]));
          if (isBattle) {
            references.forEach((speciesId) => inspectPokemon('battle', speciesId, path, rankingMatch[3], 'all'));
          }
        }
        continue;
      }

      const teamMatch = path.match(teamPath);
      const league = `${teamMatch[1]}/${teamMatch[2]}`;
      data.performers?.forEach((performer) =>
        inspectPokemon('team', performer.pokemon, path, league, teamMatch[1])
      );
      data.teams?.forEach((team) =>
        team.team?.split('|').forEach((pokemon) => inspectPokemon('team', pokemon, path, league, teamMatch[1]))
      );
    }
  })
);

const summary = Object.entries(categories)
  .map(
    ([category, stats]) =>
      `${category}: ${stats.files.size} files, ${stats.series.size} league series, ${stats.contexts.size} contexts, ` +
      `${stats.references} references, ${stats.species.size} species IDs`
  )
  .join('; ');
console.log(
  `PvPoke coverage audit (${summary}); ${unresolved.size} unresolved, ${sourceOnly.size} source-only filtered; ` +
    `PvPoke tree ${tree.sha}; Game Master ${meta.generatedAt ?? 'unknown'} ` +
    `(${meta.source?.gameMasterSha ?? 'unknown SHA'}).`
);
for (const issue of [...unresolved.values()].sort(
  (left, right) => left.category.localeCompare(right.category) || left.speciesId.localeCompare(right.speciesId)
)) {
  console.error(`${issue.category}:${issue.speciesId}: ${issue.count} references (${issue.paths.join(', ')})`);
}
for (const issue of [...sourceOnly.values()].sort(
  (left, right) => left.category.localeCompare(right.category) || left.speciesId.localeCompare(right.speciesId)
)) {
  console.log(`source-only ${issue.category}:${issue.speciesId}: ${issue.count} references`);
}
if (unresolved.size > 0) {
  process.exitCode = 1;
}
