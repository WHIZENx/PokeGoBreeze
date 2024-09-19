/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { IPokemonData } from '../../core/models/pokemon.model';

export enum StatsActionTypes {
  setStats = 'SET_STATS',
  resetStats = 'RESET_STATS',
}

export class SetStats implements Action {
  readonly type = StatsActionTypes.setStats;

  constructor(public payload: IPokemonData[]) {}

  static create(value: IPokemonData[]) {
    const { type, payload } = new SetStats(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetStats implements Action {
  readonly type = StatsActionTypes.resetStats;

  static create() {
    const { type } = new ResetStats();
    return {
      type,
    };
  }
}

export type StatsActionsUnion = SetStats | ResetStats;
