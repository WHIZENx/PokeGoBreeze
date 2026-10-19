#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  deduplicatePokemonFormSelections,
  hasPokemonGoBattleModifierCatalog,
  normalizePokemonFormIdentity,
  pokemonGoFormIdentityKey,
  pokemonGoFormIdentityPriority,
  selectPreferredPokemonGoFormIdentity,
} from '../../src/utils/pokemon-form-identity.ts';
import { buildPokemonFormCatalog } from '../../../api/src/pokemon/forms.ts';

const duplicateSelectionFixture = [
  [
    { form: { name: 'raticate-alola-shadow', formName: 'alola-shadow', pokemonType: 2 } },
    { form: { name: 'raticate-alola-purified', formName: 'alola-purified', pokemonType: 3 } },
  ],
  [
    { form: { name: 'raticate-alola-shadow', formName: 'alola-shadow', pokemonType: 2 } },
    { form: { name: 'raticate-alola-purified', formName: 'alola-purified', pokemonType: 3 } },
  ],
];
assert.deepEqual(
  deduplicatePokemonFormSelections(duplicateSelectionFixture).flat(),
  duplicateSelectionFixture[0],
  'Exact Shadow/Purified form selections must be deduplicated across variety groups'
);

assert.equal(
  pokemonGoFormIdentityKey({ num: 373, form: 'SHADOW', pokemonType: 2 }),
  '373:2:NORMAL_SHADOW',
  'A generic Shadow modifier must resolve to the default NORMAL base form'
);
assert.equal(
  pokemonGoFormIdentityKey({ num: 373, form: 'PURIFIED', pokemonType: 3 }),
  '373:3:NORMAL_PURIFIED',
  'A generic Purified modifier must resolve to the default NORMAL base form'
);

const upstreamAliasSelectionFixture = [
  [
    {
      defaultId: 20,
      form: { name: 'raticate-totem-alola', formName: 'totem-alola', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 20,
      form: { name: 'raticate-alola-totem', formName: 'alola-totem', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 105,
      form: { name: 'marowak-totem', formName: 'totem', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 105,
      form: { name: 'marowak-alola-totem', formName: 'alola-totem', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 778,
      form: { name: 'mimikyu-totem-disguised', formName: 'totem-disguised', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 778,
      form: { name: 'mimikyu-totem', formName: 'totem', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 778,
      form: { name: 'mimikyu-totem-busted', formName: 'totem-busted', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 778,
      form: { name: 'mimikyu-busted-totem', formName: 'busted-totem', pokemonType: 0 },
    },
  ],
];
assert.equal(
  deduplicatePokemonFormSelections(upstreamAliasSelectionFixture).flat().length,
  4,
  'PokéAPI/GO form aliases must collapse to Raticate and Marowak Alola Totem plus both Mimikyu Totem states'
);

const darmanitanGalarSelectionFixture = [
  [
    {
      defaultId: 555,
      form: { name: 'darmanitan-galar-standard', formName: 'galar-standard', pokemonType: 0 },
    },
  ],
  [
    {
      defaultId: 555,
      form: { name: 'darmanitan-galarian', formName: 'galarian', pokemonType: 0 },
    },
  ],
];
assert.equal(
  deduplicatePokemonFormSelections(darmanitanGalarSelectionFixture).flat().length,
  1,
  'Darmanitan Galar Standard/Galarian selections must collapse to one canonical form'
);

const canonicalSourceAliasCases = [
  [25, 'PIKACHU_ORIGINAL_CAP', 'PIKACHU_ORIGINAL'],
  [25, 'PIKACHU_HOENN_CAP', 'PIKACHU_HOENN'],
  [25, 'PIKACHU_SINNOH_CAP', 'PIKACHU_SINNOH'],
  [25, 'PIKACHU_UNOVA_CAP', 'PIKACHU_UNOVA'],
  [25, 'PIKACHU_KALOS_CAP', 'PIKACHU_KALOS'],
  [25, 'PIKACHU_ALOLA_CAP', 'PIKACHU_ALOLA'],
  [25, 'PIKACHU_PARTNER_CAP', 'PIKACHU_PARTNER'],
  [25, 'PIKACHU_WORLD_CAP', 'PIKACHU_WORLD'],
  [128, 'TAUROS_PALDEA_COMBAT_BREED', 'TAUROS_PALDEA_COMBAT'],
  [128, 'TAUROS_PALDEA_BLAZE_BREED', 'TAUROS_PALDEA_BLAZE'],
  [128, 'TAUROS_PALDEA_AQUA_BREED', 'TAUROS_PALDEA_AQUA'],
  [422, 'SHELLOS_WEST', 'SHELLOS_WEST_SEA'],
  [422, 'SHELLOS_EAST', 'SHELLOS_EAST_SEA'],
  [423, 'GASTRODON_WEST', 'GASTRODON_WEST_SEA'],
  [423, 'GASTRODON_EAST', 'GASTRODON_EAST_SEA'],
  [555, 'DARMANITAN_GALARIAN_STANDARD', 'DARMANITAN_GALARIAN'],
  [592, 'FRILLISH_MALE', 'FRILLISH'],
  [593, 'JELLICENT_MALE', 'JELLICENT'],
  [668, 'PYROAR_MALE', 'PYROAR'],
  [678, 'MEOWSTIC_MALE', 'MEOWSTIC'],
  [902, 'BASCULEGION_MALE', 'BASCULEGION'],
  [916, 'OINKOLOGNE_MALE', 'OINKOLOGNE'],
];
canonicalSourceAliasCases.forEach(([id, pokeApiIdentity, pokemonGoIdentity]) => {
  assert.equal(
    normalizePokemonFormIdentity(id, pokeApiIdentity),
    normalizePokemonFormIdentity(id, pokemonGoIdentity),
    `PokéAPI/GO identity mismatch for ID ${id}: ${pokeApiIdentity}/${pokemonGoIdentity}`
  );
});

const pokemons = JSON.parse(await readFile(resolve(import.meta.dirname, '../../../api/data/pokemons.json'), 'utf8'));
const pokemonIds = new Set(pokemons.map((pokemon) => pokemon.num));
const detailCatalog = buildPokemonFormCatalog(pokemons);
const detailCatalogById = new Map();

detailCatalog.forEach((pokemon) => {
  const forms = detailCatalogById.get(pokemon.num) ?? [];
  forms.push(pokemon);
  detailCatalogById.set(pokemon.num, forms);
});

assert.equal(detailCatalogById.size, pokemonIds.size, 'Pokémon Detail form catalog must cover every generated ID');
assert.equal(
  new Set(detailCatalog.map(pokemonGoFormIdentityKey)).size,
  detailCatalog.length,
  'Pokémon Detail form catalog contains duplicate semantic form identities'
);

const shadowSpecies = new Set(pokemons.filter((pokemon) => pokemon.hasShadowForm).map((pokemon) => pokemon.num));
shadowSpecies.forEach((id) => {
  assert.equal(
    hasPokemonGoBattleModifierCatalog(detailCatalogById.get(id) ?? []),
    true,
    `Pokémon Detail catalog is missing authoritative Shadow/Purified forms for ID ${id}`
  );
});

const namedDefaultModifierRows = pokemons.filter((pokemon) => {
  const form = String(pokemon.form ?? '').toUpperCase();
  const baseForm = String(pokemon.baseForme ?? '').toUpperCase();
  return pokemon.hasShadowForm && baseForm && baseForm !== 'NORMAL' && form === baseForm;
});

namedDefaultModifierRows.forEach((pokemon) => {
  const catalog = detailCatalogById.get(pokemon.num) ?? [];
  for (const [pokemonType, modifier] of [
    [2, 'SHADOW'],
    [3, 'PURIFIED'],
  ]) {
    const expectedForm = `${String(pokemon.form).toUpperCase()}_${modifier}`;
    assert(
      catalog.some((entry) => entry.pokemonType === pokemonType && String(entry.form).toUpperCase() === expectedForm),
      `ID ${pokemon.num} is missing canonical ${expectedForm}`
    );
    assert(
      !catalog.some((entry) => entry.pokemonType === pokemonType && String(entry.form).toUpperCase() === modifier),
      `ID ${pokemon.num} duplicates named default ${expectedForm} with generic ${modifier}`
    );
  }
});

const groups = new Map();

pokemons.forEach((pokemon) => {
  const key = pokemonGoFormIdentityKey(pokemon);
  const group = groups.get(key) ?? [];
  group.push(pokemon);
  groups.set(key, group);
});

const collisions = [...groups.entries()].filter(([, group]) => group.length > 1);
const ambiguous = [];

collisions.forEach(([key, group]) => {
  const priorities = group.map(pokemonGoFormIdentityPriority);
  const highestPriority = Math.max(...priorities);
  const preferred = group.filter((_, index) => priorities[index] === highestPriority);
  if (preferred.length !== 1) {
    ambiguous.push({ key, forms: group.map((pokemon) => pokemon.form), highestPriority });
  }
  const selected = selectPreferredPokemonGoFormIdentity(group);
  assert.equal(selected?.fullName, preferred[0]?.fullName, `Preferred fullName mismatch for ${key}`);
  assert.equal(selected?.form, preferred[0]?.form, `Preferred form mismatch for ${key}`);
  assert.equal(
    Boolean(selected?.releasedGO),
    group.some((pokemon) => pokemon.releasedGO),
    `Released state was not preserved for ${key}`
  );
});

assert.deepEqual(ambiguous, [], `Ambiguous alias-equivalent GO forms: ${JSON.stringify(ambiguous)}`);
const expectedCollisionKeys = [
  '664:0:ICY_SNOW',
  '665:0:ICY_SNOW',
  '741:0:POMPOM',
  '801:0:ORIGINAL_COLOR',
  '875:0:ICE',
  '877:0:FULL_BELLY',
  '888:0:CROWNED_SWORD',
  '889:0:CROWNED_SHIELD',
  '898:0:ICE_RIDER',
  '898:0:SHADOW_RIDER',
  '925:0:FAMILY_OF_FOUR',
  '931:0:GREEN',
  '964:0:ZERO',
  '978:0:CURLY',
  '982:0:TWO',
  '1007:0:APEX_BUILD',
  '1008:0:ULTIMATE_MODE',
  '1012:0:COUNTERFEIT',
  '1013:0:UNREMARKABLE',
];
assert.deepEqual(
  collisions.map(([key]) => key).sort(),
  expectedCollisionKeys.sort(),
  'The known GO form alias-collision set changed'
);

const affectedSpecies = [...new Set(collisions.flatMap(([, group]) => group.map((pokemon) => pokemon.num)))];
console.log(
  `Pokémon form identity audit passed: ${pokemons.length} GO rows across ` +
    `${pokemonIds.size} species; ${detailCatalog.length} Detail selections are unique; ` +
    `${collisions.length} alias-collision groups resolved across IDs ${affectedSpecies.join(', ')}; ` +
    `${upstreamAliasSelectionFixture.length} PokéAPI/GO alias selections collapse to 4 canonical forms; ` +
    `${darmanitanGalarSelectionFixture.length} Darmanitan Galar aliases collapse to 1 canonical form; ` +
    `${canonicalSourceAliasCases.length} cross-source aliases match; ` +
    `${namedDefaultModifierRows.length} named-default modifier cases audited across IDs ` +
    `${namedDefaultModifierRows.map((pokemon) => pokemon.num).join(', ')}.`
);
