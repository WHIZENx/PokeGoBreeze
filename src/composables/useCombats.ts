import useDataStore from './useDataStore';
import { getValueOrDefault, isEqual, isNotEmpty } from '../utils/extension';
import { useCallback } from 'react';
import { Combat } from '../core/models/combat.model';
import { TypeMove } from '../enums/type.enum';
import { EqualMode } from '../utils/enums/string.enum';

export const useCombats = () => {
  const { combatsData } = useDataStore();

  const findMoveData = useCallback(
    (move: string | undefined) => {
      return combatsData.find((item) => isEqual(item.name, move));
    },
    [combatsData]
  );

  const getCombatsByTypeMove = useCallback(
    (typeMove: TypeMove) => {
      return combatsData.filter((item) => item.typeMove === typeMove);
    },
    [combatsData]
  );

  const getCombatsByTypeAndTypeMove = useCallback(
    (type: string, typeMove: TypeMove) => {
      return combatsData.filter(
        (item) => item.typeMove === typeMove && isEqual(item.type, type, EqualMode.IgnoreCaseSensitive)
      );
    },
    [combatsData]
  );

  const filterUnknownMove = useCallback(
    (moves: string[] | undefined) => {
      return getValueOrDefault(
        Array,
        moves
          ?.map((move) => combatsData.find((item) => isEqual(item.name, move)) || new Combat())
          .filter((move) => move.id > 0)
      );
    },
    [combatsData]
  );

  const isCombatsNoneArchetype = useCallback(() => {
    return isNotEmpty(combatsData) && combatsData.every((combat) => !combat.archetype);
  }, [combatsData]);

  return {
    findMoveData,
    getCombatsByTypeMove,
    getCombatsByTypeAndTypeMove,
    filterUnknownMove,
    isCombatsNoneArchetype,
  };
};

export default useCombats;
