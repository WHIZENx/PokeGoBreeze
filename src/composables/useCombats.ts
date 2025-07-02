import useDataStore from './useDataStore';
import { getValueOrDefault, isEqual, isNotEmpty, isNullOrUndefined } from '../utils/extension';
import { useCallback } from 'react';
import { Combat, ICombat } from '../core/models/combat.model';
import { TypeMove } from '../enums/type.enum';
import { EqualMode } from '../utils/enums/string.enum';
import { reverseReplaceTempMovePvpName, findMoveTeam } from '../utils/utils';

export const useCombats = () => {
  const { combatsData } = useDataStore();

  const findMoveByName = useCallback(
    (move: string | undefined) => {
      return combatsData.find((item) => isEqual(item.name, move?.replaceAll('-', '_'), EqualMode.IgnoreCaseSensitive));
    },
    [combatsData]
  );

  const findMoveById = useCallback(
    (track: number, type: string) => {
      return combatsData.find(
        (item) => item.track === track && isEqual(item.type, type, EqualMode.IgnoreCaseSensitive)
      );
    },
    [combatsData]
  );

  const findMoveByTag = useCallback(
    (nameSet: string[], tag: string) => {
      let move: ICombat | undefined;
      if (!tag) {
        return move;
      }

      for (const name of nameSet) {
        move = combatsData.find(
          (item) =>
            (item.abbreviation && isEqual(item.abbreviation, tag)) ||
            (!item.abbreviation && isEqual(item.name, reverseReplaceTempMovePvpName(name)))
        );
        if (!isNullOrUndefined(move)) {
          return move;
        }
      }

      nameSet = findMoveTeam(
        tag,
        combatsData.map((item) => item.name),
        true
      );
      move = combatsData.find(
        (item) =>
          (item.abbreviation && isEqual(item.abbreviation, tag)) ||
          (isNotEmpty(nameSet) && !item.abbreviation && isEqual(item.name, reverseReplaceTempMovePvpName(nameSet[0])))
      );

      return move;
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

  const getCombatsById = useCallback(
    (id: number) => {
      return combatsData.filter((item) => item.track === id || item.id === id);
    },
    [combatsData]
  );

  const filterUnknownMove = useCallback(
    (moves: string[] | undefined) => {
      return getValueOrDefault(
        Array,
        moves
          ?.map(
            (move) =>
              combatsData.find((item) =>
                isEqual(item.name, move?.replaceAll('-', '_'), EqualMode.IgnoreCaseSensitive)
              ) || new Combat()
          )
          .filter((move) => move.id > 0)
      );
    },
    [combatsData]
  );

  const isCombatsNoneArchetype = useCallback(() => {
    return isNotEmpty(combatsData) && combatsData.every((combat) => !combat.archetype);
  }, [combatsData]);

  return {
    findMoveByName,
    findMoveById,
    findMoveByTag,
    getCombatsByTypeMove,
    getCombatsByTypeAndTypeMove,
    getCombatsById,
    filterUnknownMove,
    isCombatsNoneArchetype,
  };
};

export default useCombats;
