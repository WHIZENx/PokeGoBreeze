import { ICombat } from '../../../core/models/combat.model';
import { TypeAction } from '../../../enums/type.enum';
import { IDataModel } from '../../../store/models/store.model';
import { calculateStatsBattle, getTypeEffective } from '../../../utils/calculate';
import { findStabType } from '../../../utils/compute';
import { DEFAULT_SIZE, MIN_LEVEL, STAB_MULTIPLY } from '../../../utils/constants';
import { toNumber } from '../../../utils/extension';
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
    size: DEFAULT_SIZE,
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
  dataStore: IDataModel,
  pokemon: IPokemonBattleData,
  pokemonOpponent: IPokemonBattleData,
  move: ICombat | undefined
) => {
  if (pokemon && pokemonOpponent && move) {
    const atkPokemon = calculateStatsBattle(
      pokemon.stats?.atk,
      pokemon.currentStats?.IV?.atkIV,
      toNumber(pokemon.currentStats?.level, MIN_LEVEL),
      true
    );
    const defPokemonOpponent = calculateStatsBattle(
      pokemonOpponent.stats?.def,
      pokemonOpponent.currentStats?.IV?.defIV,
      toNumber(pokemonOpponent.currentStats?.level, MIN_LEVEL),
      true
    );
    return (
      (atkPokemon *
        move.pvpPower *
        (findStabType(pokemon.pokemon?.types, move.type) ? STAB_MULTIPLY(dataStore.options) : 1) *
        getDmgMultiplyBonus(pokemon.pokemonType, dataStore.options, TypeAction.Atk) *
        getTypeEffective(dataStore.typeEff, move.type, pokemonOpponent.pokemon?.types)) /
      (defPokemonOpponent * getDmgMultiplyBonus(pokemonOpponent.pokemonType, dataStore.options, TypeAction.Def))
    );
  }
  return 1;
};
