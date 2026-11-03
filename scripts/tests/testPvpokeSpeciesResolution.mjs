import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getPvpokeSpeciesCandidates } from '../../src/utils/pvpoke-species.ts';

const pokemons = JSON.parse(
  await readFile(new URL('../../../api/data/pokemons.json', import.meta.url), 'utf8')
);
const byFullName = new Map(
  pokemons.filter((pokemon) => pokemon.num > 0 && pokemon.fullName).map((pokemon) => [pokemon.fullName, pokemon])
);
const resolve = (speciesId) =>
  getPvpokeSpeciesCandidates(speciesId)
    .map((candidate) => byFullName.get(candidate))
    .find(Boolean);

const expectedForms = [
  ['gastrodon', 423, 'GASTRODON_WEST_SEA'],
  ['gastrodon_east_sea', 423, 'GASTRODON_EAST_SEA'],
  ['florges', 671, 'FLORGES_RED'],
  ['mimikyu', 778, 'MIMIKYU_DISGUISED'],
  ['marowak_alolan_shadow', 105, 'MAROWAK_ALOLA'],
  ['shellos', 422, 'SHELLOS_WEST_SEA'],
  ['zygarde', 718, 'ZYGARDE_FIFTY_PERCENT'],
  ['zygarde_10', 718, 'ZYGARDE_TEN_PERCENT'],
  ['tauros_aqua', 128, 'TAUROS_PALDEA_AQUA'],
  ['feraligatr_shadow', 160, 'FERALIGATR'],
  ['basculin', 550, 'BASCULIN_RED_STRIPED'],
  ['deerling', 585, 'DEERLING_SPRING'],
  ['flabebe', 669, 'FLABEBE_RED'],
  ['floette', 670, 'FLOETTE_RED'],
  ['furfrou', 676, 'FURFROU_NATURAL'],
  ['hoopa', 720, 'HOOPA_CONFINED'],
  ['minior_core', 774, 'MINIOR_RED'],
  ['polteageist', 855, 'POLTEAGEIST_PHONY'],
  ['sawsbuck', 586, 'SAWSBUCK_SPRING'],
  ['sinistea', 854, 'SINISTEA_PHONY'],
  ['toxtricity', 849, 'TOXTRICITY_AMPED'],
  ['vivillon', 666, 'VIVILLON_MEADOW'],
  ['pikachu_flying', 25, 'PIKACHU'],
  ['pikachu_kariyushi', 25, 'PIKACHU'],
  ['pikachu_5th_anniversary', 25, 'PIKACHU'],
];

for (const [speciesId, expectedId, expectedFullName] of expectedForms) {
  const pokemon = resolve(speciesId);
  assert.equal(pokemon?.num, expectedId, `${speciesId} resolved to the wrong National Pokédex ID`);
  assert.equal(pokemon?.fullName, expectedFullName, `${speciesId} resolved to the wrong Pokémon GO form`);
}

console.log(`Validated ${expectedForms.length} PvPoke species/form mappings.`);
