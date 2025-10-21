import useDataStore from './useDataStore';
import { getValueOrDefault, isEqual, isNotEmpty, isNullOrUndefined } from '../utils/extension';
import { useCallback } from 'react';
import { Combat, ICombat } from '../core/models/combat.model';
import { TypeMove } from '../enums/type.enum';
import { EqualMode } from '../utils/enums/string.enum';
import { reverseReplaceTempMovePvpName, findMoveTeam, getMoveType } from '../utils/utils';
import usePokemon from './usePokemon';

export const useCombats = () => {
  const { combatsData } = useDataStore();
  const { findPokemonById } = usePokemon();

  const findMoveByName = useCallback(
    (move: string | undefined, pokemonId = 0) => {
      const result = combatsData.find((item) =>
        isEqual(item.name, move?.replaceAll('-', '_'), EqualMode.IgnoreCaseSensitive)
      );
      if (result && pokemonId) {
        const pokemon = findPokemonById(pokemonId);
        result.moveType = getMoveType(pokemon, move);
      }
      return result;
    },
    [combatsData]
  );

  const findMoveById = useCallback(
    (track: number, type: string, pokemonId = 0) => {
      const result = combatsData.find(
        (item) => item.track === track && isEqual(item.type, type, EqualMode.IgnoreCaseSensitive)
      );
      if (result && pokemonId) {
        const pokemon = findPokemonById(pokemonId);
        result.moveType = getMoveType(pokemon, result.name);
      }
      return result;
    },
    [combatsData]
  );

  const findMoveByTag = useCallback(
    (nameSet: string[], tag: string, pokemonId = 0) => {
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
      if (move && pokemonId) {
        const pokemon = findPokemonById(pokemonId);
        move.moveType = getMoveType(pokemon, move.name);
      }
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
