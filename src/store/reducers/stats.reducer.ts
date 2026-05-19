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

// Multipliers are fixed constants — compute once at module load, not per-pokemon
const SHADOW_ATK_MULT = getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Atk);
const SHADOW_DEF_MULT = getDmgMultiplyBonus(PokemonType.Shadow, TypeAction.Def);
const PURIFIED_ATK_MULT = getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Atk);
const PURIFIED_DEF_MULT = getDmgMultiplyBonus(PokemonType.Purified, TypeAction.Def);

const addShadowPurificationForms = (result: IArrayStats[], value: IPokemonData) => {
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: formShadow(),
      baseStats: value.baseStats,
      statsGO: StatsPokemonGO.create(
        Math.round(value.statsGO.atk * SHADOW_ATK_MULT),
        Math.round(value.statsGO.def * SHADOW_DEF_MULT),
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
        Math.round(value.statsGO.atk * PURIFIED_ATK_MULT),
        Math.round(value.statsGO.def * PURIFIED_DEF_MULT),
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
