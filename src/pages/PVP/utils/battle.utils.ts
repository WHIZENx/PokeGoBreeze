import { ICombat } from '../../../core/models/combat.model';
import { TypeAction } from '../../../enums/type.enum';
import { calculateStatsBattle, getTypeEffective } from '../../../utils/calculate';
import { findStabType } from '../../../utils/compute';
import { isNotEmpty, toNumber } from '../../../utils/extension';
import { battleStab, defaultSize, minLevel } from '../../../utils/helpers/context.helpers';
import { getDmgMultiplyBonus } from '../../../utils/utils';
import { AttackType } from '../Battle/enums/attack-type.enum';
import { IPokemonBattleData, ITimeline, TimelineConfig, TimelineModel } from '../models/battle.model';

export const getRandomNumber = (min: number, max: number, step = 1) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (step === 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    const steps = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * steps) * step;
  }
};

export const state = (timer: number, block: number, energy: number, hp: number, type?: AttackType) =>
  new TimelineModel({
    timer,
    type,
    size: defaultSize(),
    block,
    energy,
    hp: Math.max(0, hp),
  });

export const addState = (
  timeline: ITimeline[],
  timer: number,
  block: number,
  energy: number,
  hp: number,
  type?: AttackType
) => timeline.push(state(timer, block, energy, hp, type));

export const updateState = (timeline: ITimeline[], value: TimelineConfig) => {
  if (value.move) {
    value.color = value.move.type?.toLowerCase();
  }
  timeline[value.timer] = new TimelineModel({
    ...timeline[value.timer],
    ...value,
  });
};

export const calculateMoveDmgActual = (
  pokemon: IPokemonBattleData,
  pokemonOpponent: IPokemonBattleData,
  move: ICombat | undefined
) => {
  if (pokemon && pokemonOpponent && move) {
    const atkPokemon = calculateStatsBattle(
      pokemon.stats?.atk,
      pokemon.currentStats?.IV?.atkIV,
      toNumber(pokemon.currentStats?.level, minLevel()),
      true
    );
    const defPokemonOpponent = calculateStatsBattle(
      pokemonOpponent.stats?.def,
      pokemonOpponent.currentStats?.IV?.defIV,
      toNumber(pokemonOpponent.currentStats?.level, minLevel()),
      true
    );
    return (
      (atkPokemon *
        move.pvpPower *
        (findStabType(pokemon.pokemon?.types, move.type) ? battleStab() : 1) *
        getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Atk) *
        getTypeEffective(move.type, pokemonOpponent.pokemon?.types)) /
      (defPokemonOpponent * getDmgMultiplyBonus(pokemonOpponent.pokemonType, TypeAction.Def))
    );
  }
  return 1;
};

/**
 * Efficiently finds the number of elements in an array of DOM rectangles that have
 * their left positions less than or equal to the specified position.
 * Uses binary search algorithm for O(log n) performance.
 *
 * @param arr - Array of DOM rectangles (or undefined values) to check against
 * @param pos - The horizontal position (in pixels) to compare against. Defaults to 0
 * @returns The number of elements with left position ≤ specified position, or -1 if array is invalid
 */
export const overlappingPos = (arr: (DOMRect | undefined)[], pos = 0) => {
  if (!isNotEmpty(arr)) {
    return -1;
  }

  let left = 0;
  let right = arr.length - 1;
  let index = 0;

  if (pos < toNumber(arr[0]?.left)) {
    index = 0;
  } else if (pos >= toNumber(arr[arr.length - 1]?.left)) {
    index = arr.length;
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midPos = toNumber(arr[mid]?.left);

      if (midPos <= pos) {
        index = mid + 1;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return index;
};
