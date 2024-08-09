import { IPokemonData } from '../../core/models/pokemon.model';
import { sortStatsPokemon } from '../../util/Calculate';
import { FORM_NORMAL } from '../../util/Constants';
import { ArrayStats } from '../../util/models/util.model';

export const LOAD_STATS = 'LOAD_STATS';
export const RESET_STATS = 'RESET_STATS';

const convertArrStats = (data: IPokemonData[]) => {
  return data
    .filter((pokemon) => pokemon.num > 0)
    .map((value) => {
      return new ArrayStats({
        id: value.num,
        name: value.slug,
        form: value.forme ?? FORM_NORMAL,
        baseStats: value.baseStats,
        baseStatsPokeGo: { attack: value.baseStats.atk, defense: value.baseStats.def, stamina: value.baseStats.sta ?? 0 },
        baseStatsProd: value.baseStats.atk * value.baseStats.def * (value.baseStats.sta ?? 0),
      });
    });
};

export const loadStats = (pokemonData: IPokemonData[]) => ({
  type: LOAD_STATS,
  payload: sortStatsPokemon(convertArrStats(pokemonData)),
});

export const resetStats = () => ({
  type: RESET_STATS,
});
