import { IOptions } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IStatsRank } from '../../core/models/stats.model';
import { PokemonType, TypeAction } from '../../enums/type.enum';
import { sortStatsPokemon } from '../../util/calculate';
import { FORM_NORMAL, FORM_PURIFIED, FORM_SHADOW } from '../../util/constants';
import { getValueOrDefault, toNumber } from '../../util/extension';
import { ArrayStats, BaseStatsPokeGo, IArrayStats } from '../../util/models/util.model';
import { getDmgMultiplyBonus } from '../../util/utils';
import { StatsActions } from '../actions';
import { StatsActionsUnion } from '../actions/stats.action';

const addShadowPurificationForms = (result: IArrayStats[], value: IPokemonData, options?: IOptions) => {
  const atkShadow = Math.round(value.baseStats.atk * getDmgMultiplyBonus(PokemonType.Shadow, options, TypeAction.Atk));
  const defShadow = Math.round(value.baseStats.def * getDmgMultiplyBonus(PokemonType.Shadow, options, TypeAction.Def));
  const sta = toNumber(value.baseStats.sta);
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: FORM_SHADOW,
      baseStats: value.baseStats,
      baseStatsPokeGo: new BaseStatsPokeGo({
        attack: atkShadow,
        defense: defShadow,
        stamina: sta,
      }),
      baseStatsProd: atkShadow * defShadow * sta,
    })
  );
  const atkPurification = Math.round(value.baseStats.atk * getDmgMultiplyBonus(PokemonType.Purified, options, TypeAction.Atk));
  const defPurification = Math.round(value.baseStats.def * getDmgMultiplyBonus(PokemonType.Purified, options, TypeAction.Def));
  result.push(
    new ArrayStats({
      id: value.num,
      name: value.slug,
      form: FORM_PURIFIED,
      baseStats: value.baseStats,
      baseStatsPokeGo: new BaseStatsPokeGo({
        attack: atkPurification,
        defense: defPurification,
        stamina: sta,
      }),
      baseStatsProd: atkPurification * defPurification * sta,
    })
  );
};

const StatsReducer = (state: IStatsRank | null = null, action: StatsActionsUnion) => {
  switch (action.type) {
    case StatsActions.StatsActionTypes.setStats: {
      const result: IArrayStats[] = [];
      action.payload.pokemon
        .filter((pokemon) => pokemon.num > 0)
        .forEach((value) => {
          const sta = toNumber(value.baseStats.sta);
          result.push(
            new ArrayStats({
              id: value.num,
              name: value.slug,
              form: getValueOrDefault(String, value.forme, FORM_NORMAL),
              baseStats: value.baseStats,
              baseStatsPokeGo: new BaseStatsPokeGo({
                attack: value.baseStats.atk,
                defense: value.baseStats.def,
                stamina: sta,
              }),
              baseStatsProd: value.baseStats.atk * value.baseStats.def * sta,
            })
          );

          if (value.hasShadowForm) {
            addShadowPurificationForms(result, value, action.payload.options);
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
