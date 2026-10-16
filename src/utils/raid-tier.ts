import type { PokemonClass, PokemonType } from '../enums/type.enum';

const POKEMON_TYPE_MEGA = 4;
const POKEMON_TYPE_PRIMAL = 5;
const POKEMON_CLASS_NONE = 0;

export const availableRaidTiers = (pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) => {
  if (pokemonType === POKEMON_TYPE_PRIMAL) {
    return [6];
  }
  if (pokemonType === POKEMON_TYPE_MEGA) {
    return (pokemonClass ?? POKEMON_CLASS_NONE) === POKEMON_CLASS_NONE ? [4] : [6];
  }
  return [1, 3, 5, 2, 4];
};

export const defaultRaidTier = (pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) =>
  availableRaidTiers(pokemonType, pokemonClass)[0];

export const normalizeRaidTier = (tier: number, pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) => {
  const tiers = availableRaidTiers(pokemonType, pokemonClass);
  return tiers.includes(tier) ? tier : tiers[0];
};
