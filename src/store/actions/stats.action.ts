import { Action } from 'redux';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IOptions } from '../../core/models/options.model';

export enum StatsActionTypes {
  setStats = '[Stats] SetStats',
  resetStats = '[Stats] ResetStats',
}

export class SetStats implements Action {
  readonly type = StatsActionTypes.setStats;

  constructor(public payload: { pokemon: IPokemonData[]; options?: IOptions }) {}

  static create(value: { pokemon: IPokemonData[]; options?: IOptions }) {
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
