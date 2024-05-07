import { PokemonDataModel } from '../../core/models/pokemon.model';
import { sortStatsPokemon } from '../../util/Calculate';
import { FORM_NORMAL } from '../../util/Constants';
import { ArrayStats } from '../../util/models/util.model';

export const LOAD_STATS = 'LOAD_STATS';
export const RESET_STATS = 'RESET_STATS';

const convertArrStats = (data: PokemonDataModel[]) => {
  return data
    .filter((pokemon) => pokemon.num > 0)
    .map((value) => {
      return {
        id: value.num,
        name: value.slug,
        form: value.forme ?? FORM_NORMAL,
        base_stats: value.baseStats,
        baseStatsPokeGo: { attack: value.baseStats.atk, defense: value.baseStats.def, stamina: value.baseStats.sta ?? 0 },
        baseStatsProd: value.baseStats.atk * value.baseStats.def * (value.baseStats.sta ?? 0),
      } as ArrayStats;
    });
};

export const loadStats = (pokemonData: PokemonDataModel[]) => ({
  type: LOAD_STATS,
  payload: sortStatsPokemon(convertArrStats(pokemonData)),
});

export const resetStats = () => ({
  type: RESET_STATS,
});
