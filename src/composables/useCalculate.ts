import { isEqual } from 'lodash';
import { IPokemonDetail } from '../core/models/API/info.model';
import { ICombat } from '../core/models/combat.model';
import { MoveType, TypeMove } from '../enums/type.enum';
import { OptionOtherDPS, Delay } from '../store/models/options.model';
import { calculateStatsBattle, calculateAvgDPS } from '../utils/calculate';
import {
  defaultEnemyAtkDelay,
  defaultPokemonDefObj,
  maxIv,
  defaultPokemonLevel,
} from '../utils/helpers/options-context.helpers';
import { QueryMovesPokemon } from '../utils/models/calculate.model';
import { PokemonQueryMove, EDPS, PokemonQueryRankMove } from '../utils/models/pokemon-top-move.model';
import { getMoveType, moveTypeToFormType, getAllMoves } from '../utils/utils';
import useDataStore from './useDataStore';

export const useCalculate = () => {
  const { combatsData } = useDataStore();

  const rankMove = (
    pokemon: Partial<IPokemonDetail> | undefined,
    atk: number | undefined,
    def: number | undefined,
    sta: number | undefined,
    types: string[] | undefined
  ) => {
    if (!pokemon) {
      return new PokemonQueryRankMove();
    }
    const data = new QueryMovesPokemon(pokemon, atk, def, sta, types);
    const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
    const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);
    setQueryMove(data, fastMoveSet, chargedMoveSet);

    return PokemonQueryRankMove.create({
      data: data.dataList,
      maxOff: Math.max(...data.dataList.map((item) => item.eDPS.offensive)),
      maxDef: Math.max(...data.dataList.map((item) => item.eDPS.defensive)),
    });
  };

  const setQueryMove = (data: QueryMovesPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
    fastMoveSet.forEach((vf) => {
      const fMove = combatsData.find((item) => isEqual(item.name, vf));
      if (!fMove) {
        return;
      }
      const quickMoveType = getMoveType(data.pokemon, vf);
      queryMove(data, fMove, chargedMoveSet, quickMoveType);
    });
  };

  const queryMove = (data: QueryMovesPokemon, mf: ICombat, cMove: string[], fMoveType: MoveType) => {
    cMove.forEach((vc) => {
      const mc = combatsData.find((item) => isEqual(item.name, vc));

      if (mc) {
        const cMoveType = getMoveType(data.pokemon, vc);
        if (!isEqual(cMoveType, MoveType.Dynamax)) {
          mf.moveType = fMoveType;
          mc.moveType = cMoveType;

          const options = OptionOtherDPS.create({
            delay: Delay.create({
              fTime: defaultEnemyAtkDelay(),
              cTime: defaultEnemyAtkDelay(),
            }),
            pokemonDefObj: defaultPokemonDefObj(),
            ivAtk: maxIv(),
            ivDef: maxIv(),
            ivHp: maxIv(),
            pokemonLevel: defaultPokemonLevel(),
          });

          const statsAtkBattle = calculateStatsBattle(data.atk, options.ivAtk, options.pokemonLevel, true);
          const statsDefBattle = calculateStatsBattle(data.def, options.ivDef, options.pokemonLevel, true);
          const statsStaBattle = calculateStatsBattle(data.sta, options.ivHp, options.pokemonLevel, true);

          const pokemonType = moveTypeToFormType(cMoveType);

          const offensive = calculateAvgDPS(
            mf,
            mc,
            statsAtkBattle,
            statsDefBattle,
            statsStaBattle,
            data.types,
            pokemonType
          );
          const defensive = calculateAvgDPS(
            mf,
            mc,
            statsAtkBattle,
            statsDefBattle,
            statsStaBattle,
            data.types,
            pokemonType,
            options
          );

          data.dataList.push(
            new PokemonQueryMove({ fMove: mf, cMove: mc, eDPS: EDPS.create({ offensive, defensive }) })
          );
        }
      }
    });
  };

  return {
    rankMove,
  };
};
export default useCalculate;
