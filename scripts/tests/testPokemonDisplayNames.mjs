import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  formatPokemonDisplayName,
  formatPokemonSpeciesDisplayName,
} from '../../src/utils/pokemon-display-name.ts';

for (const [input, expected] of [
  ['Furfrou-natural', 'Furfrou Natural'],
  ['FURFROU_PHARAOH', 'Furfrou Pharaoh'],
  ['Charizard-mega-x', 'Charizard Mega X'],
  ['Ho-Oh', 'Ho-Oh'],
  ['Ho-Oh-shadow', 'Ho-Oh Shadow'],
  ['Porygon-Z', 'Porygon-Z'],
  ['Jangmo-o', 'Jangmo-o'],
  ['Kommo-o-totem', 'Kommo-o Totem'],
  ['MR_MIME', 'Mr. Mime'],
  ['Mime-jr', 'Mime Jr.'],
  ['Type-null', 'Type: Null'],
  ['Farfetchd-galar', 'Farfetch’d Galar'],
  ['Nidoran-female', 'Nidoran Female'],
  ['Wo-Chien', 'Wo-Chien'],
  ['Pikachu-gmax', 'Pikachu Gigantamax'],
  ['Pikachu rock star', 'Pikachu Rock Star'],
  ['Raichu alola', 'Raichu Alola'],
  ['Mr mime', 'Mr. Mime'],
  ['Mr-mime-galar', 'Mr. Mime Galar'],
  ['Nidoran_female_shadow', 'Nidoran Female Shadow'],
  [undefined, ''],
  ['', ''],
])
  assert.equal(formatPokemonDisplayName(input), expected);

for (const [name, baseSpecies, expected] of [
  ['Giratina-altered', 'Giratina', 'Giratina'],
  ['Shellos-west-sea', 'Shellos', 'Shellos'],
  ['Psyduck-swim-2025', 'Psyduck', 'Psyduck'],
  ['Nidoran-female', 'Nidoran_female', 'Nidoran Female'],
  ['Rayquaza', undefined, 'Rayquaza'],
])
  assert.equal(formatPokemonSpeciesDisplayName(name, baseSpecies), expected);

if (process.argv[2]) {
  const pokemon = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const legitimateHyphens = /Ho-Oh|Porygon-Z|Jangmo-o|Hakamo-o|Kommo-o|Wo-Chien|Chien-Pao|Ting-Lu|Chi-Yu/g;
  for (const entry of pokemon) {
    const label = formatPokemonDisplayName(entry.name);
    assert.ok(label, `Empty display name: ${entry.name}`);
    assert.ok(!/[-_]/.test(label.replace(legitimateHyphens, '')), `Unmapped separator: ${entry.name} → ${label}`);
  }
  console.log(`Audited ${pokemon.length} Pokémon/form dropdown labels.`);
}

const tableDisplayFiles = [
  'src/components/Commons/Tables/Counter/Counter.tsx',
  'src/components/Commons/Tables/Pokemon/PokemonTable.tsx',
  'src/pages/Move/Move.tsx',
  'src/pages/Search/Types/Types.tsx',
  'src/pages/Sheets/DpsTdo/DpsTdo.tsx',
  'src/pages/Sheets/StatsRanking/StatsRanking.tsx',
  'src/pages/Tools/BattleDamage/DamageTable.tsx',
  'src/pages/Tools/CalculatePoint/CalculatePoint.tsx',
  'src/pages/Tools/RaidBattle/RaidBattle.tsx',
  'src/pages/Tools/StatsInfo/StatsInfo.tsx',
];
for (const path of tableDisplayFiles) {
  const source = await readFile(path, 'utf8');
  assert.ok(source.includes('formatPokemonDisplayName'), `${path} must use the shared Pokémon name formatter`);
}

const legacyPokemonTableExpressions = [
  "splitAndCapitalize(row.pokemonName, '-', ' ')",
  "splitAndCapitalize(row.name.replaceAll('_', '-'), '-', ' ')",
  "splitAndCapitalize(row.name, '-', ' ')",
  "splitAndCapitalize(props.formName, '-', ' ')",
  "splitAndCapitalize(props.result.currPoke?.form?.name, '-', ' ')",
  "splitAndCapitalize(props.result.objPoke.form?.name, '-', ' ')",
  "splitAndCapitalize(data.pokemon?.name.replaceAll('_', '-'), '-', ' ')",
];
const tableSources = await Promise.all(tableDisplayFiles.map((path) => readFile(path, 'utf8')));
for (const expression of legacyPokemonTableExpressions) {
  assert.ok(
    tableSources.every((source) => !source.includes(expression)),
    `Pokémon table display bypasses the shared formatter: ${expression}`
  );
}
console.log('Pokémon display-name regression tests passed.');
