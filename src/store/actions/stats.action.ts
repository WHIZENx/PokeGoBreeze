import { Action } from 'redux';
import { IStatsRank } from '../../core/models/stats.model';

export enum StatsActionTypes {
  setStats = '[Stats] SetStats',
  resetStats = '[Stats] ResetStats',
}

export class SetStats implements Action {
  readonly type = StatsActionTypes.setStats;

  constructor(public payload: IStatsRank) {}

  static create(value: IStatsRank) {
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
