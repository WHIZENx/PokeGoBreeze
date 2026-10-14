export interface PokemonGoFormIdentity {
  num: number;
  form?: string | number;
  pokemonType?: number;
  releasedGO?: boolean;
  quickMoves?: unknown[];
  cinematicMoves?: unknown[];
}

export const normalizePokemonFormIdentity = (id: number, value: string | number | undefined) => {
  let identity = String(value ?? '')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase();

  if (id === 718) {
    identity = identity.replace(/_10$/, '_TEN_PERCENT').replace(/_50$/, '_FIFTY_PERCENT');
    identity = identity.replace(/^10$/, 'TEN_PERCENT').replace(/^50$/, 'FIFTY_PERCENT');
  } else if (id === 741) {
    identity = identity.replace(/POM_POM$/, 'POMPOM');
  } else if (id === 801) {
    identity = identity.replace(/_ORIGINAL$/, '_ORIGINAL_COLOR').replace(/^ORIGINAL$/, 'ORIGINAL_COLOR');
  } else if (id === 888) {
    identity = identity.replace(/_CROWNED$/, '_CROWNED_SWORD').replace(/^CROWNED$/, 'CROWNED_SWORD');
  } else if (id === 889) {
    identity = identity.replace(/_CROWNED$/, '_CROWNED_SHIELD').replace(/^CROWNED$/, 'CROWNED_SHIELD');
  } else if (id === 898) {
    identity = identity.replace(/_ICE$/, '_ICE_RIDER').replace(/^ICE$/, 'ICE_RIDER');
    identity = identity.replace(/_SHADOW$/, '_SHADOW_RIDER').replace(/^SHADOW$/, 'SHADOW_RIDER');
  } else if (id === 716) {
    identity = identity.replace(/_ACTIVE$/, '').replace(/^ACTIVE$/, 'NORMAL');
  }

  return identity;
};

export const pokemonGoFormIdentityKey = (pokemon: PokemonGoFormIdentity) =>
  `${pokemon.num}:${pokemon.pokemonType ?? 0}:${normalizePokemonFormIdentity(pokemon.num, pokemon.form)}`;

export const pokemonGoFormIdentityPriority = (pokemon: PokemonGoFormIdentity) =>
  Number(Boolean(pokemon.releasedGO)) * 2 +
  Number(Boolean(pokemon.quickMoves?.length || pokemon.cinematicMoves?.length));

export const selectPreferredPokemonGoFormIdentity = <T extends PokemonGoFormIdentity>(pokemons: T[]) =>
  pokemons.reduce<T | undefined>((preferred, pokemon) => {
    if (!preferred || pokemonGoFormIdentityPriority(pokemon) > pokemonGoFormIdentityPriority(preferred)) {
      return pokemon;
    }
    return preferred;
  }, undefined);
