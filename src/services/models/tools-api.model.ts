import type {
  IBattleBaseStats,
  IBattleLeagueCalculate,
  IBetweenLevelCalculate,
  IQueryStatesEvoChain,
  IStatsCalculate,
} from '../../utils/models/calculate.model';
import type { IPokemonMoveData } from '../../core/models/pokemon.model';

export interface BattleLeagueApiItem extends Omit<IQueryStatesEvoChain, 'battleLeague'> {
  atk: number;
  def: number;
  sta: number;
  evolutionCandy: number;
  battleLeague: {
    little: IBattleBaseStats;
    great: IBattleBaseStats;
    ultra: IBattleBaseStats;
    master: IBattleBaseStats;
  };
}

export interface BattleLeagueSearchRequest {
  id: number;
  form?: string;
  cp: number;
  iv: { atk: number; def: number; sta: number };
  config: {
    minLevel: number;
    maxLevel: number;
    step: number;
    minIv: number;
    maxIv: number;
    minCp: number;
  };
}

type BattleLeagueSearchNotFound = { possible: false; stats: IStatsCalculate };
type BattleLeagueSearchFound = {
  possible: true;
  stats: IStatsCalculate;
  chains: BattleLeagueApiItem[][];
  bestInLeague: IBattleBaseStats[];
  maxCP: number;
};

export interface BattleLeagueSearchApiResponse {
  data: BattleLeagueSearchNotFound | BattleLeagueSearchFound;
  meta: { section: 'battleLeagueSearch' };
}

export type BreakpointApiResult =
  | { mode: 'attacker'; data: number[][] }
  | { mode: 'defender'; dataDef: number[][]; dataSta: number[][] }
  | { mode: 'bulk'; data: number[][]; maxLength: number };

export interface RaidApiResponse {
  data: IPokemonMoveData[];
  meta: {
    raidSummary?: {
      dps?: { min: number; max: number; average: number };
      tdo?: { min: number; max: number; average: number };
      hp?: { min: number; max: number; average: number };
      suggestedPlayers?: { hard: number; easy: number };
    };
  };
}

export interface RaidBattleRequest {
  boss: {
    id: number;
    form?: string;
    fast: string;
    charged: string;
    atk: number;
    def: number;
    hp: number;
    boost: boolean;
  };
  settings: {
    timeAllow: number;
    enableTimeAllow: boolean;
    counterBoost: boolean;
  };
  trainers: Array<{
    trainerId: number;
    pokemons: Array<{
      id: number;
      form?: string;
      fast: string;
      charged: string;
      level: number;
      pokemonType: number;
      iv: { atk: number; def: number; hp: number };
      fMoveType?: number;
      cMoveType?: number;
    }>;
  }>;
}

export interface RaidBattleApiResponse {
  data: Array<{
    pokemon: IPokemonMoveData[];
    summary: {
      dpsAtk: number;
      dpsDef: number;
      tdoAtk: number;
      tdoDef: number;
      timer: number;
      bossHp: number;
    };
  }>;
  meta: { section: 'raidBattle' };
}

export interface CalculateStatsRequest {
  id: number;
  form?: string;
  cp: number;
  pokemonType: number;
  iv: { atk: number; def: number; sta: number };
  config: { minCp: number; minLevel: number; maxLevel: number; step: number };
}

export interface CalculateStatsLevelResult extends IBetweenLevelCalculate {
  stats: { atk: number; def: number; sta: number };
}

type CalculateStatsNotFound = {
  possible: false;
  stats: IStatsCalculate;
};

type CalculateStatsFound = {
  possible: true;
  stats: IStatsCalculate;
  current: CalculateStatsLevelResult;
  levels: Array<{ level: number; data: CalculateStatsLevelResult }>;
  leagues: {
    little: IBattleLeagueCalculate;
    great: IBattleLeagueCalculate;
    ultra: IBattleLeagueCalculate;
    master: IBattleLeagueCalculate;
  };
};

export interface CalculateStatsApiResponse {
  data: CalculateStatsNotFound | CalculateStatsFound;
  meta: { section: 'calculateStats' };
}

export interface DamageCalculatedStats {
  level: number;
  atk: number;
  def: number;
  sta: number;
}

export interface DamageStatsRequest {
  mode: 'stats';
  base: { atk: number; def: number; sta: number };
  pokemonType: number;
  iv: number;
  config: { minLevel: number; maxLevel: number; step: number };
}

export interface DamageBattleRequest {
  mode: 'damage';
  attacker: {
    base: { atk: number; def: number; sta: number };
    level: number;
    pokemonType: number;
    types: string[];
  };
  defender: {
    base: { atk: number; def: number; sta: number };
    level: number;
    pokemonType: number;
    types: string[];
  };
  move: { type: string; power: number };
  battle: {
    isWb: boolean;
    isDodge: boolean;
    isTrainer: boolean;
    friendshipLevel: number;
    throwLevel: number;
    isMega: boolean;
  };
  config: { iv: number; trainerMultiplier: number; megaMultiplier: number };
}

export type DamageSimulatorRequest = DamageStatsRequest | DamageBattleRequest;

type DamageStatsResponse = {
  mode: 'stats';
  levels: DamageCalculatedStats[];
};

type DamageBattleResponse = {
  mode: 'damage';
  attackerStats: DamageCalculatedStats;
  defenderStats: DamageCalculatedStats;
  battleState: {
    isStab: boolean;
    isWb: boolean;
    isDodge: boolean;
    isTrainer: boolean;
    friendshipLevel: number;
    throwLevel: number;
    effective: number;
    isMega: boolean;
  };
  damage: number;
  hp: number;
};

export interface DamageSimulatorApiResponse {
  data: DamageStatsResponse | DamageBattleResponse;
  meta: { section: 'damageSimulator' };
}
