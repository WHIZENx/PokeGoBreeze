import { IPokemonData } from '../../core/models/pokemon.model';
import { IStatsRank, StatsPokemonGO } from '../../core/models/stats.model';
import { PokemonType, TypeAction } from '../../enums/type.enum';
import { sortStatsPokemon } from '../../utils/calculate';
import { getValueOrDefault } from '../../utils/extension';
import { formPurified, formShadow, formNormal } from '../../utils/helpers/options-context.helpers';
import { ArrayStats, IArrayStats } from '../../utils/models/util.model';
import { getDmgMultiplyBonus } from '../../utils/utils';
import { StatsActions } from '../actions';
import { StatsActionsUnion } from '../actions/stats.action';

const addShadowPurificationForms = (result: IArrayStats[], value: IPokemonData) => {
  const shadowAtkBonus = getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Atk);
  const shadowDefBonus = getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Def);
  const purifiedAtkBonus = getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Atk);
  const purifiedDefBonus = getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Def);
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: formShadow(),
      baseStats: value.baseStats,
      statsGO: StatsPokemonGO.create(
        Math.round(value.statsGO.atk * shadowAtkBonus),
        Math.round(value.statsGO.def * shadowDefBonus),
        value.statsGO.sta
      ),
    })
  );
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: formPurified(),
      baseStats: value.baseStats,
      statsGO: StatsPokemonGO.create(
        Math.round(value.statsGO.atk * purifiedAtkBonus),
        Math.round(value.statsGO.def * purifiedDefBonus),
        value.statsGO.sta
      ),
    })
  );
};

const FORM_NORMAL = formNormal();

const StatsReducer = (state: IStatsRank | null = null, action: StatsActionsUnion) => {
  switch (action.type) {
    case StatsActions.StatsActionTypes.setStats: {
      const result: IArrayStats[] = [];
      for (const value of action.payload) {
        if (value.num <= 0) {
          continue;
        }
        result.push(
          new ArrayStats({
            id: value.num,
            name: value.slug,
            form: getValueOrDefault(String, value.form, FORM_NORMAL),
            baseStats: value.baseStats,
            statsGO: value.statsGO,
          })
        );
        if (value.hasShadowForm) {
          addShadowPurificationForms(result, value);
        }
      }
      return sortStatsPokemon(result);
    }
    case StatsActions.StatsActionTypes.resetStats:
      return null;
    default:
      return state;
  }
};

export default StatsReducer;
