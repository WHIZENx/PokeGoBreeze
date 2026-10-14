export interface PokemonSpeciesNavigationRow {
  num: number;
  form?: string | number;
  baseForme?: string | number;
  releasedGO?: boolean;
}

const normalizeForm = (value: string | number | undefined) =>
  String(value ?? '')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase();

const navigationPriority = (pokemon: PokemonSpeciesNavigationRow) => {
  const form = normalizeForm(pokemon.form);
  const baseForm = normalizeForm(pokemon.baseForme);

  if (form === 'NORMAL') {
    return 3;
  }
  if (baseForm && baseForm === form) {
    return 2;
  }
  return pokemon.releasedGO ? 1 : 0;
};

/** Selects one representative row per real Pokédex species and sorts it by National Dex number. */
export const buildPokemonSpeciesNavigation = <T extends PokemonSpeciesNavigationRow>(pokemons: T[]) => {
  const speciesById = new Map<number, T>();

  pokemons.forEach((pokemon) => {
    if (!Number.isInteger(pokemon.num) || pokemon.num <= 0) {
      return;
    }
    const current = speciesById.get(pokemon.num);
    if (!current || navigationPriority(pokemon) > navigationPriority(current)) {
      speciesById.set(pokemon.num, pokemon);
    }
  });

  return [...speciesById.values()].sort((left, right) => left.num - right.num);
};

export const findPokemonSpeciesNavigation = <T extends PokemonSpeciesNavigationRow>(species: T[], id: number) => {
  const index = species.findIndex((pokemon) => pokemon.num === id);
  if (index < 0) {
    return { prev: undefined, current: undefined, next: undefined };
  }

  return {
    prev: species[index - 1],
    current: species[index],
    next: species[index + 1],
  };
};
