#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildPokemonSpeciesNavigation, findPokemonSpeciesNavigation } from '../../src/utils/pokemon-navigation.ts';

const pokemons = JSON.parse(await readFile(resolve(import.meta.dirname, '../../../api/data/pokemons.json'), 'utf8'));
const species = buildPokemonSpeciesNavigation(pokemons);
const failures = [];

for (let index = 0; index < species.length; index += 1) {
  const pokemon = species[index];
  const navigation = findPokemonSpeciesNavigation(species, pokemon.num);
  if (navigation.current?.num !== pokemon.num) {
    failures.push(`#${pokemon.num}: current species mismatch`);
  }
  if (navigation.prev?.num !== species[index - 1]?.num) {
    failures.push(`#${pokemon.num}: previous species mismatch`);
  }
  if (navigation.next?.num !== species[index + 1]?.num) {
    failures.push(`#${pokemon.num}: next species mismatch`);
  }
}

const yveltal = findPokemonSpeciesNavigation(species, 717);
if (yveltal.current?.num !== 717 || yveltal.next?.num !== 718) {
  failures.push('#717 must navigate forward to #718');
}

if (failures.length) {
  console.error(`Pokémon navigation audit failed (${failures.length}):`);
  failures.slice(0, 20).forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Pokémon navigation audit passed: ${species.length} species, ` +
      `#${species[0]?.num}–#${species.at(-1)?.num}; #717 next is #${yveltal.next?.num}.`
  );
}
