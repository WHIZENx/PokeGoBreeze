import { PokemonDataModel } from '../../core/models/pokemon.model';
import { sortStatsPokemon } from '../../util/Calculate';
import { convertArrStats } from '../../util/Utils';

export const LOAD_STATS = 'LOAD_STATS';
export const RESET_STATS = 'RESET_STATS';

export const loadStats = (pokemonData: { [x: string]: PokemonDataModel }) => ({
  type: LOAD_STATS,
  payload: sortStatsPokemon(convertArrStats(pokemonData)),
});

export const resetStats = () => ({
  type: RESET_STATS,
});
