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
  const atkShadow = Math.round(value.statsGO.atk * getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Atk));
  const defShadow = Math.round(value.statsGO.def * getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Def));
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: formShadow(),
      baseStats: value.baseStats,
      statsGO: StatsPokemonGO.create(atkShadow, defShadow, value.statsGO.sta),
    })
  );
  const atkPurification = Math.round(value.statsGO.atk * getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Atk));
  const defPurification = Math.round(value.statsGO.def * getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Def));
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: formPurified(),
      baseStats: value.baseStats,
      statsGO: StatsPokemonGO.create(atkPurification, defPurification, value.statsGO.sta),
    })
  );
};

const StatsReducer = (state: IStatsRank | null = null, action: StatsActionsUnion) => {
  switch (action.type) {
    case StatsActions.StatsActionTypes.setStats: {
      const result: IArrayStats[] = [];
      action.payload
        .filter((pokemon) => pokemon.num > 0)
        .forEach((value) => {
          result.push(
            new ArrayStats({
              id: value.num,
              name: value.slug,
              form: getValueOrDefault(String, value.form, formNormal()),
              baseStats: value.baseStats,
              statsGO: value.statsGO,
            })
          );

          if (value.hasShadowForm) {
            addShadowPurificationForms(result, value);
          }
        });
      return sortStatsPokemon(result);
    }
    case StatsActions.StatsActionTypes.resetStats:
      return null;
    default:
      return state;
  }
};

export default StatsReducer;
