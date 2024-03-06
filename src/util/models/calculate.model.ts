import { Combat } from '../../core/models/combat.model';
import { EvoList, PokemonTypeCost, TempEvo } from '../../core/models/evolution.model';
import { Options } from '../../core/models/options.model';
import { PokemonDataModel } from '../../core/models/pokemon.model';
import { StatsPokemon } from '../../core/models/stats.model';
import { TypeEff } from '../../core/models/type-eff.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { PokemonQueryCounter, PokemonQueryMove } from './pokemon-top-move.model';

export interface BattleCalculate {
  atk?: number;
  def: number;
  hp?: number;
  fmove?: Combat;
  cmove?: Combat;
  types: string[];
  shadow?: boolean;
  WEATHER_BOOSTS?: string;
  POKEMON_FRIEND?: boolean;
  POKEMON_FRIEND_LEVEL?: number;
  isDoubleCharge?: boolean;
  cmove2?: Combat;
}

export interface StatsLeagueCalculate {
  CP: number;
  level: number;
}

export interface StatsCalculate {
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
}

export interface BetweenLevelCalculate {
  cp: number;
  result_between_stadust: number;
  result_between_stadust_diff?: number;
  result_between_candy: number;
  result_between_candy_diff?: number;
  result_between_xl_candy: number;
  result_between_xl_candy_diff?: number;
  powerUpCount?: number;
  type?: string;
  atk_stat?: number;
  def_stat?: number;
  atk_stat_diff?: number;
  def_stat_diff?: number;
}

export interface BattleLeagueCalculate {
  elidge: boolean;
  maxCP: number | null;
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
  limit: boolean;
  rangeValue?: BetweenLevelCalculate;
  stats?: StatsPokemon;
}

export interface PredictStatsModel {
  atk: number;
  def: number;
  sta: number;
  level: number;
  percent: number;
  hp: number;
}

export interface PredictStatsCalculate {
  CP: number;
  minLevel: number;
  maxLevel: number;
  result: PredictStatsModel[];
}

export interface PredictCPModel {
  level: number;
  CP: number;
  hp: number;
}

export interface PredictCPCalculate {
  IV: { atk: number; def: number; sta: number };
  result: PredictCPModel[];
}

export interface StatsProdCalculate {
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
  stats: { statsATK: number; statsDEF: number; statsSTA: number };
  statsProds: number;
  ratio?: number;
  rank?: number;
}

export interface BattleLeague {
  little: BattleBaseStats | undefined;
  great: BattleBaseStats | undefined;
  ultra: BattleBaseStats | undefined;
  master: BattleBaseStats | undefined;
}

export interface QueryStatesEvoChain {
  battleLeague: { [x: string]: BattleBaseStats | undefined };
  maxCP: number;
  form: string;
  id: number;
  name: string;
  prev?: string | undefined;
  evoList: EvoList[];
  tempEvo: TempEvo[];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  canPurified?: boolean;
}

export interface BattleBaseStats {
  CP?: number;
  IV?: { atk: number; def: number; sta: number };
  form: string;
  id: number;
  league: string;
  level?: number;
  maxCP: number;
  name: string;
  powerUpCount?: number;
  rank?: number;
  ratio?: number;
  result_between_candy?: number;
  result_between_candy_diff?: number;
  result_between_stadust?: number;
  result_between_stadust_diff?: number;
  result_between_xl_candy?: number;
  result_between_xl_candy_diff?: number;
  stats?: { statsATK: number; statsDEF: number; statsSTA: number };
  statsProds?: number;
  type?: string;
}

export class QueryMovesCounterPokemon {
  globalOptions: Options | undefined;
  typeEff: TypeEff | undefined;
  weatherBoost: WeatherBoost | undefined;
  combat: Combat[] = [];
  pokemon!: PokemonDataModel;
  stats!: StatsPokemon;
  def!: number;
  types: string[] = [];
  dataList!: PokemonQueryCounter[];

  constructor(
    globalOptions: Options | undefined,
    typeEff: TypeEff | undefined,
    weatherBoost: WeatherBoost | undefined,
    combat: Combat[],
    pokemon: PokemonDataModel,
    stats: StatsPokemon,
    def: number,
    types: string[],
    dataList: PokemonQueryCounter[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combat = combat;
    this.pokemon = pokemon;
    this.stats = stats;
    this.def = def;
    this.types = types;
    this.dataList = dataList;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class QueryMovesPokemon {
  globalOptions: Options | undefined;
  typeEff: TypeEff | undefined;
  weatherBoost: WeatherBoost | undefined;
  combat: Combat[] = [];
  pokemon!: PokemonDataModel;
  stats!: StatsPokemon;
  atk!: number;
  def!: number;
  sta!: number;
  types: string[] = [];
  dataList!: PokemonQueryMove[];

  constructor(
    globalOptions: Options | undefined,
    typeEff: TypeEff | undefined,
    weatherBoost: WeatherBoost | undefined,
    combat: Combat[],
    atk: number,
    def: number,
    sta: number,
    types: string[],
    dataList: PokemonQueryMove[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combat = combat;
    this.atk = atk;
    this.def = def;
    this.sta = sta;
    this.types = types;
    this.dataList = dataList;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class StatsCalculate {
  IV!: { atk: number; def: number; sta: number };
  CP!: number;
  level!: number;

  constructor(atk: number, def: number, sta: number, CP: number, level: number) {
    this.IV = { atk, def, sta };
    this.CP = CP;
    this.level = level;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class BattleLeagueCalculate {
  elidge!: boolean;
  maxCP!: number | null;
  IV!: { atk: number; def: number; sta: number };
  CP!: number;
  level!: number;
  limit!: boolean;
  rangeValue?: BetweenLevelCalculate;
  stats?: StatsPokemon;

  constructor(elidge: boolean, maxCP: number | null, atk: number, def: number, sta: number, CP: number, level: number, limit: boolean) {
    this.elidge = elidge;
    this.maxCP = maxCP;
    this.IV = { atk, def, sta };
    this.CP = CP;
    this.level = level;
    this.limit = limit;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PredictStatsCalculate {
  CP: number;
  minLevel!: number;
  maxLevel!: number;
  result!: PredictStatsModel[];

  constructor(CP: number, minLevel: number, maxLevel: number, result: PredictStatsModel[]) {
    this.CP = CP;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.result = result;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PredictCPCalculate {
  IV!: { atk: number; def: number; sta: number };
  result!: PredictCPModel[];

  constructor(atk: number, def: number, sta: number, result: PredictCPModel[]) {
    this.IV = { atk, def, sta };
    this.result = result;
  }
}
