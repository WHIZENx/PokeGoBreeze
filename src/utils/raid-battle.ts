import { IPokemonData } from '../core/models/pokemon.model';
import { PokemonType } from '../enums/type.enum';

const hasMoves = (pokemon: IPokemonData, keys: Array<keyof IPokemonData>) =>
  keys.some((key) => {
    const value = pokemon[key];
    return Array.isArray(value) && value.length > 0;
  });

/**
 * Forms exposed to a standard Raid Battle must have a complete GO stat block
 * and at least one Fast and Charged attack. G-Max forms belong to Max Battles;
 * their standard form is selected for ordinary Raids instead.
 */
export const isRaidBattlePokemonEligible = (pokemon: IPokemonData) =>
  pokemon.pokemonType !== PokemonType.GMax &&
  pokemon.statsGO.atk > 0 &&
  pokemon.statsGO.def > 0 &&
  pokemon.statsGO.sta > 0 &&
  hasMoves(pokemon, ['quickMoves', 'eliteQuickMoves']) &&
  hasMoves(pokemon, ['cinematicMoves', 'eliteCinematicMoves', 'specialMoves', 'exclusiveMoves']);
