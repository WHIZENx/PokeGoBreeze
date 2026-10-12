import useDataStore from './useDataStore';
import { getValueOrDefault, isEqual, isNotEmpty } from '../utils/extension';
import { useCallback } from 'react';
import { Combat, ICombat } from '../core/models/combat.model';
import { TypeMove } from '../enums/type.enum';
import { EqualMode } from '../utils/enums/string.enum';
import { findMoveTeam, reverseReplaceTempMovePvpName, getMoveType } from '../utils/utils';
import usePokemon from './usePokemon';

export const useCombats = () => {
  const { combatsData } = useDataStore();
  const { findPokemonById, findPokemonByIdAndForm } = usePokemon();

  const findMoveByName = useCallback(
    (move: string | undefined, pokemonId = 0, typeMove?: TypeMove, pokemonForm?: string) => {
      const result = combatsData.find(
        (item) =>
          (typeMove === undefined || item.typeMove === typeMove) &&
          isEqual(item.name, move?.replaceAll('-', '_'), EqualMode.IgnoreCaseSensitive)
      );
      if (result && pokemonId) {
        const pokemon = pokemonForm ? findPokemonByIdAndForm(pokemonId, pokemonForm) : findPokemonById(pokemonId);
        return Combat.create({ ...result, moveType: getMoveType(pokemon, move) });
      }
      return result;
    },
    [combatsData, findPokemonById, findPokemonByIdAndForm]
  );

  const findMoveById = useCallback(
    (track: number, type: string, pokemonId = 0) => {
      const result = combatsData.find(
        (item) => item.track === track && isEqual(item.type, type, EqualMode.IgnoreCaseSensitive)
      );
      if (result && pokemonId) {
        const pokemon = findPokemonById(pokemonId);
        return Combat.create({ ...result, moveType: getMoveType(pokemon, result.name) });
      }
      return result;
    },
    [combatsData, findPokemonById]
  );

  const findMoveByTag = useCallback(
    (nameSet: string[], tag: string, pokemonId = 0, pokemonForm?: string) => {
      if (!tag) {
        return undefined;
      }

      const moveNames = nameSet.map(reverseReplaceTempMovePvpName);
      const candidates = combatsData.filter((item) => moveNames.some((name) => isEqual(item.name, name)));
      const getMoveTag = (item: ICombat) =>
        item.abbreviation ??
        item.name
          .split('_')
          .map((part) => part[0])
          .join('');
      const abbreviationMatch = candidates.find((item) =>
        isEqual(getMoveTag(item), tag, EqualMode.IgnoreCaseSensitive)
      );
      const resolvedNames = findMoveTeam(
        tag,
        candidates.map((item) => item.name),
        true
      );
      const scopedMove = abbreviationMatch ?? candidates.find((item) => isEqual(item.name, resolvedNames[0]));
      const expectedType = candidates[0]?.typeMove;
      const globalMatches = scopedMove
        ? []
        : combatsData.filter(
            (item) => item.typeMove === expectedType && isEqual(getMoveTag(item), tag, EqualMode.IgnoreCaseSensitive)
          );
      const move: ICombat | undefined = scopedMove ?? (globalMatches.length === 1 ? globalMatches[0] : undefined);
      if (move && pokemonId) {
        const pokemon = pokemonForm ? findPokemonByIdAndForm(pokemonId, pokemonForm) : findPokemonById(pokemonId);
        return Combat.create({ ...move, moveType: getMoveType(pokemon, move.name) });
      }
      return move;
    },
    [combatsData, findPokemonById, findPokemonByIdAndForm]
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
