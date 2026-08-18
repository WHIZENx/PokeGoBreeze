import type { IBattleBaseStats, IQueryStatesEvoChain } from '../../utils/models/calculate.model';
import type { IPokemonMoveData } from '../../core/models/pokemon.model';

export interface BattleLeagueApiItem extends Omit<IQueryStatesEvoChain, 'battleLeague'> {
  atk: number;
  def: number;
  sta: number;
  battleLeague: {
    little: IBattleBaseStats;
    great: IBattleBaseStats;
    ultra: IBattleBaseStats;
    master: IBattleBaseStats;
  };
}

export type BreakpointApiResult =
  | { mode: 'attacker'; data: number[][] }
  | { mode: 'defender'; dataDef: number[][]; dataSta: number[][] }
  | { mode: 'bulk'; data: number[][]; maxLength: number };

export interface RaidApiResponse {
  data: IPokemonMoveData[];
  meta: {
    raidSummary?: {
      dps?: { min: number; max: number };
      tdo?: { min: number; max: number };
      hp?: { min: number; max: number };
    };
  };
}
