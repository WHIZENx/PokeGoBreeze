import { IStatsRank } from '../../core/models/stats.model';
import { sortStatsPokemon } from '../../util/calculate';
import { FORM_NORMAL } from '../../util/constants';
import { getValueOrDefault } from '../../util/extension';
import { ArrayStats, BaseStatsPokeGo } from '../../util/models/util.model';
import { StatsActions } from '../actions';
import { StatsActionsUnion } from '../actions/stats.action';

const StoreReducer = (state: IStatsRank | null = null, action: StatsActionsUnion) => {
  switch (action.type) {
    case StatsActions.StatsActionTypes.setStats:
      return sortStatsPokemon(
        action.payload
          .filter((pokemon) => pokemon.num > 0)
          .map((value) => {
            return new ArrayStats({
              id: value.num,
              name: value.slug,
              form: value.forme ?? FORM_NORMAL,
              baseStats: value.baseStats,
              baseStatsPokeGo: new BaseStatsPokeGo({
                attack: value.baseStats.atk,
                defense: value.baseStats.def,
                stamina: getValueOrDefault(Number, value.baseStats.sta),
              }),
              baseStatsProd: value.baseStats.atk * value.baseStats.def * getValueOrDefault(Number, value.baseStats.sta),
            });
          })
      );
    case StatsActions.StatsActionTypes.resetStats:
    default:
      return state;
  }
};

export default StoreReducer;
