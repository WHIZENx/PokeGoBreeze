#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildPokemonFormCatalog, deduplicatePokemonForms } from '../../../api/src/pokemon/forms.ts';
import { calculateTheoreticalPokemonGoStats } from '../../../api/src/pokemon/pokeapi-stats.ts';
import { pokemonGoBaseStatProduct } from '../../src/utils/pokemon-go-stats.ts';
import {
  findPokemonStatsForm,
  normalizePokemonFormIdentity,
  pokemonGoFormIdentityKey,
} from '../../src/utils/pokemon-form-identity.ts';

const apiData = resolve(import.meta.dirname, '../../../api/data');
const canonicalFormsPath = resolve(import.meta.dirname, '../../../api/src/generator/data/pokeapi-forms.json');
const [pokemons, rankings, options, canonicalCatalog] = await Promise.all([
  ...['pokemons', 'statsRankings', 'options'].map((name) =>
    readFile(resolve(apiData, `${name}.json`), 'utf8').then(JSON.parse)
  ),
  readFile(canonicalFormsPath, 'utf8').then(JSON.parse),
]);

const detailForms = buildPokemonFormCatalog(deduplicatePokemonForms(pokemons));
const bonus = (pokemonType) =>
  pokemonType === 2
    ? options.combatOptions.shadowBonus
    : pokemonType === 3
      ? options.combatOptions.purifiedBonus
      : { atk: 1, def: 1 };
const modifierIdentity = (form, pokemonType) => {
  const normalizedForm = String(form ?? 'NORMAL')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase();
  const modifier =
    pokemonType === 2 || normalizedForm === 'SHADOW' || normalizedForm.endsWith('_SHADOW')
      ? 'SHADOW'
      : pokemonType === 3 || normalizedForm === 'PURIFIED' || normalizedForm.endsWith('_PURIFIED')
        ? 'PURIFIED'
        : undefined;
  return {
    modifier,
    baseForm: modifier
      ? normalizedForm.replace(new RegExp(`_${modifier}$|^${modifier}$`), '') || 'NORMAL'
      : normalizedForm,
  };
};
const key = (id, form, pokemonType) => {
  const { modifier, baseForm } = modifierIdentity(form, pokemonType);
  const identity = normalizePokemonFormIdentity(id, baseForm);
  return `${id}:${modifier ?? 'BASE'}:${identity}${modifier ? `_${modifier}` : ''}`;
};
const sections = [
  ['attack', 'attack'],
  ['defense', 'defense'],
  ['stamina', 'stamina'],
  ['statProd', 'product'],
];
const goBaseIdentities = new Set(
  deduplicatePokemonForms(pokemons).map((pokemon) => key(pokemon.num, pokemon.form, pokemon.pokemonType))
);
const canonicalOnly = canonicalCatalog.forms.filter(
  (pokemon) => !goBaseIdentities.has(key(pokemon.num, pokemon.form, pokemon.pokemonType))
);
const indexes = Object.fromEntries(
  sections.map(([section]) => [
    section,
    new Map(rankings[section].ranking.map((entry) => [key(entry.id, entry.form), entry])),
  ])
);

assert.equal(
  new Set(detailForms.map(pokemonGoFormIdentityKey)).size,
  detailForms.length,
  'Pokémon Detail contains duplicate semantic stat selections'
);
for (const [section] of sections) {
  const ranking = rankings[section].ranking;
  assert.equal(
    ranking.length,
    detailForms.length + canonicalOnly.length,
    `${section} does not cover every Game Master and canonical-only Detail selection`
  );
  assert.equal(
    new Set(ranking.map((entry) => key(entry.id, entry.form))).size,
    ranking.length,
    `${section} contains duplicate canonical ID/form identities`
  );
}

for (const pokemon of detailForms) {
  const formKey = key(pokemon.num, pokemon.form, pokemon.pokemonType);
  const atk = indexes.attack.get(formKey)?.attack;
  const def = indexes.defense.get(formKey)?.defense;
  const sta = indexes.stamina.get(formKey)?.stamina;
  const prod = indexes.statProd.get(formKey)?.product;
  assert.notEqual(atk, undefined, `ATK missing for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.notEqual(def, undefined, `DEF missing for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.notEqual(sta, undefined, `STA missing for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.notEqual(prod, undefined, `PROD missing for ${pokemonGoFormIdentityKey(pokemon)}`);

  const modifier = bonus(pokemon.pokemonType);
  assert.equal(atk, Math.round(pokemon.statsGO.atk * modifier.atk));
  assert.equal(def, Math.round(pokemon.statsGO.def * modifier.def));
  assert.equal(sta, Math.round(pokemon.statsGO.sta));
  assert.equal(prod, pokemonGoBaseStatProduct(atk, def, sta));

  const { baseForm } = modifierIdentity(pokemon.form, pokemon.pokemonType);
  const selectedBaseAtk = findPokemonStatsForm(rankings.attack.ranking, pokemon.num, baseForm)?.attack;
  const selectedBaseDef = findPokemonStatsForm(rankings.defense.ranking, pokemon.num, baseForm)?.defense;
  const selectedBaseSta = findPokemonStatsForm(rankings.stamina.ranking, pokemon.num, baseForm)?.stamina;
  assert.notEqual(selectedBaseAtk, undefined, `Web ATK lookup failed for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.notEqual(selectedBaseDef, undefined, `Web DEF lookup failed for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.notEqual(selectedBaseSta, undefined, `Web STA lookup failed for ${pokemonGoFormIdentityKey(pokemon)}`);
  assert.equal(Math.round(selectedBaseAtk * modifier.atk), atk);
  assert.equal(Math.round(selectedBaseDef * modifier.def), def);
  assert.equal(selectedBaseSta, sta);
  assert.equal(
    pokemonGoBaseStatProduct(
      Math.round(selectedBaseAtk * modifier.atk),
      Math.round(selectedBaseDef * modifier.def),
      selectedBaseSta
    ),
    prod
  );
}

for (const pokemon of canonicalOnly) {
  const expected = calculateTheoreticalPokemonGoStats(pokemon.baseStats ?? {}, {
    applyNinePercentNerf: pokemon.pokemonType !== 4,
    shedinja: pokemon.num === 292,
  });
  const entries = {
    atk: findPokemonStatsForm(rankings.attack.ranking, pokemon.num, pokemon.form),
    def: findPokemonStatsForm(rankings.defense.ranking, pokemon.num, pokemon.form),
    sta: findPokemonStatsForm(rankings.stamina.ranking, pokemon.num, pokemon.form),
    prod: findPokemonStatsForm(rankings.statProd.ranking, pokemon.num, pokemon.form),
  };
  for (const entry of Object.values(entries)) {
    assert(entry, `Canonical-only stats missing: ${key(pokemon.num, pokemon.form, pokemon.pokemonType)}`);
    assert.equal(entry.source, 'pokeapi-theoretical');
    assert.equal(entry.rank, undefined);
  }
  assert.equal(entries.atk.attack, expected.atk);
  assert.equal(entries.def.defense, expected.def);
  assert.equal(entries.sta.stamina, expected.sta);
  assert.equal(entries.prod.product, expected.prod);
}

console.log(
  `Stats Ranking coverage audit passed: ${detailForms.length} ranked Game Master selections and ${canonicalOnly.length} unranked theoretical PokéAPI forms across ATK, DEF, STA, and PROD.`
);
