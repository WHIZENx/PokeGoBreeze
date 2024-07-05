import { ICombat } from '../../core/models/combat.model';
import { IEvoList, PokemonTypeCost, ITempEvo } from '../../core/models/evolution.model';
import { IOptions } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IStatsPokemon } from '../../core/models/stats.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';
import { IPokemonQueryCounter, IPokemonQueryMove } from './pokemon-top-move.model';

export interface BattleCalculate {
  atk?: number;
  def: number;
  hp?: number;
  fmove?: ICombat;
  cmove?: ICombat;
  types: string[];
  shadow?: boolean;
  WEATHER_BOOSTS?: string;
  POKEMON_FRIEND?: boolean;
  POKEMON_FRIEND_LEVEL?: number;
  isDoubleCharge?: boolean;
  cmove2?: ICombat;
}

export interface StatsLeagueCalculate {
  CP: number;
  level: number;
}

export interface IStatsCalculate {
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
}

export interface IBetweenLevelCalculate {
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

export interface IBattleLeagueCalculate {
  elidge: boolean;
  maxCP: number | null;
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
  limit: boolean;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsPokemon;
}

export interface IPredictStatsModel {
  atk: number;
  def: number;
  sta: number;
  level: number;
  percent: number;
  hp: number;
}

export interface IPredictStatsCalculate {
  CP: number;
  minLevel: number;
  maxLevel: number;
  result: IPredictStatsModel[];
}

export interface IPredictCPModel {
  level: number;
  CP: number;
  hp: number;
}

export interface IPredictCPCalculate {
  IV: { atk: number; def: number; sta: number };
  result: IPredictCPModel[];
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
  evoList: IEvoList[];
  tempEvo: ITempEvo[];
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
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combat: ICombat[] = [];
  pokemon: IPokemonData;
  def: number;
  types: string[] = [];
  dataList: IPokemonQueryCounter[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combat: ICombat[],
    pokemon: IPokemonData,
    def: number,
    types: string[],
    dataList: IPokemonQueryCounter[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combat = combat;
    this.pokemon = pokemon;
    this.def = def;
    this.types = types;
    this.dataList = dataList;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class QueryMovesPokemon {
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combat: ICombat[] = [];
  pokemon!: IPokemonData;
  stats!: IStatsPokemon;
  atk: number;
  def: number;
  sta: number;
  types: string[] = [];
  dataList: IPokemonQueryMove[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combat: ICombat[],
    atk: number,
    def: number,
    sta: number,
    types: string[],
    dataList: IPokemonQueryMove[] = []
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
export class StatsCalculate implements IStatsCalculate {
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;

  constructor(atk: number, def: number, sta: number, CP: number, level: number) {
    this.IV = { atk, def, sta };
    this.CP = CP;
    this.level = level;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class BattleLeagueCalculate implements IBattleLeagueCalculate {
  elidge: boolean;
  maxCP: number | null;
  IV: { atk: number; def: number; sta: number };
  CP: number;
  level: number;
  limit: boolean;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsPokemon;

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
export class PredictStatsCalculate implements IPredictStatsCalculate {
  CP: number;
  minLevel: number;
  maxLevel: number;
  result: IPredictStatsModel[];

  constructor(CP: number, minLevel: number, maxLevel: number, result: IPredictStatsModel[]) {
    this.CP = CP;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.result = result;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PredictCPCalculate implements IPredictCPCalculate {
  IV: { atk: number; def: number; sta: number };
  result: IPredictCPModel[];

  constructor(atk: number, def: number, sta: number, result: IPredictCPModel[]) {
    this.IV = { atk, def, sta };
    this.result = result;
  }
}
