import { IPokemonDetail } from '../core/models/API/info.model';
import { Combat, ICombat } from '../core/models/combat.model';
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
import { isEqual } from '../utils/extension';
import { useMemo } from 'react';

export const useCalculate = () => {
  const { combatsData } = useDataStore();

  // O(1) move name lookup shared by all query functions in this hook
  const combatMap = useMemo(() => new Map(combatsData.map((c) => [c.name, c])), [combatsData]);

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

    let maxOff = 0;
    let maxDef = 0;
    for (const item of data.dataList) {
      if (item.eDPS.offensive > maxOff) {
        maxOff = item.eDPS.offensive;
      }
      if (item.eDPS.defensive > maxDef) {
        maxDef = item.eDPS.defensive;
      }
    }
    return PokemonQueryRankMove.create({ data: data.dataList, maxOff, maxDef });
  };

  const setQueryMove = (data: QueryMovesPokemon, fastMoveSet: string[], chargedMoveSet: string[]) => {
    // Hoist constant options and stats outside the move-combo loop
    const iv = maxIv();
    const level = defaultPokemonLevel();
    const options = OptionOtherDPS.create({
      delay: Delay.create({ fTime: defaultEnemyAtkDelay(), cTime: defaultEnemyAtkDelay() }),
      pokemonDefObj: defaultPokemonDefObj(),
      ivAtk: iv,
      ivDef: iv,
      ivHp: iv,
      pokemonLevel: level,
    });
    const statsAtkBattle = calculateStatsBattle(data.atk, iv, level, true);
    const statsDefBattle = calculateStatsBattle(data.def, iv, level, true);
    const statsStaBattle = calculateStatsBattle(data.sta, iv, level, true);

    for (const vf of fastMoveSet) {
      const fMove = combatMap.get(vf);
      if (!fMove) {
        continue;
      }
      const quickMoveType = getMoveType(data.pokemon, vf);
      const fMoveCopy = Combat.create({ ...fMove, moveType: quickMoveType });
      queryMove(data, fMoveCopy, chargedMoveSet, statsAtkBattle, statsDefBattle, statsStaBattle, options);
    }
  };

  const queryMove = (
    data: QueryMovesPokemon,
    fMoveCopy: ICombat,
    cMove: string[],
    statsAtkBattle: number,
    statsDefBattle: number,
    statsStaBattle: number,
    options: OptionOtherDPS
  ) => {
    for (const vc of cMove) {
      const mc = combatMap.get(vc);
      if (!mc) {
        continue;
      }
      const cMoveType = getMoveType(data.pokemon, vc);
      if (isEqual(cMoveType, MoveType.Dynamax)) {
        continue;
      }

      const mcCopy = Combat.create({ ...mc, moveType: cMoveType });
      const pokemonType = moveTypeToFormType(cMoveType);

      const offensive = calculateAvgDPS(
        fMoveCopy,
        mcCopy,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        pokemonType
      );
      const defensive = calculateAvgDPS(
        fMoveCopy,
        mcCopy,
        statsAtkBattle,
        statsDefBattle,
        statsStaBattle,
        data.types,
        pokemonType,
        options
      );

      data.dataList.push(
        new PokemonQueryMove({ fMove: fMoveCopy, cMove: mcCopy, eDPS: EDPS.create({ offensive, defensive }) })
      );
    }
  };

  return {
    rankMove,
  };
};
export default useCalculate;
